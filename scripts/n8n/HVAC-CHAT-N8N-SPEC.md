# n8n "HVAC Chat" workflow — build spec

Headbanger n8n: `auto.sdagents.ai`. The chat brain lives here so it reuses the
existing lead pipeline. **You build this in the n8n UI** (I can't click it for
you); everything below is copy-pasteable. A best-effort importable template lives
beside this file as `hvac-chat.workflow.json` — import it, then fix node versions
/ credentials to match your n8n.

## Prerequisites (confirm before go-live)

1. **Anthropic credential** in n8n (for `claude-haiku-4-5-20251001`). If you'd
   rather reuse a model you already have keyed (e.g. an OpenAI one), swap the
   model sub-node — nothing else changes.
2. **Advanced-AI nodes present**: AI Agent, Window Buffer Memory, Tool (Code),
   Anthropic Chat Model. (Standard on recent self-hosted n8n; verify in the UI.)
3. **Read the "Valid lead?" node** in the existing **"HVAC Form Lead Tracking"**
   workflow — confirm its exact condition. `capture_lead` is built to pass it
   (non-empty body, email-or-phone present, no honeypot fields) but confirm.
4. **Deploy the context Worker** (`hvac-chat-context/`) and put its URL into the
   Resolve Site node below.

## Node graph

```
[Webhook POST /webhook/hvac-chat]  ──►  [Code: Resolve Site]
                                              │  outputs { sessionId, message, site, systemPrompt }
                                              ▼
                                  ┌── [AI Agent] ────────────────┐
                                  │     systemMessage = systemPrompt
                                  │     memory (Window Buffer, sessionId)
                                  │     tool ──► [Tool(Code): capture_lead] ──► POST /webhook/hvac-sites
                                  └────────────┬─────────────────┘
                                               ▼
                                     [Respond to Webhook]  → { reply } + CORS
```

Sub-node wiring on the AI Agent: **memory** → `ai_memory`; **Anthropic model** →
`ai_languageModel`; **capture_lead tool** → `ai_tool`.

---

## Node 1 — Webhook

- HTTP Method: `POST`, Path: `hvac-chat` → full URL `https://auto.sdagents.ai/webhook/hvac-chat`
- Authentication: None
- Respond: **Using 'Respond to Webhook' node** (set on the Webhook node's "Respond" dropdown) — the Respond node ends the flow.
- **Allowed origins / CORS**: the widget is browser JS sending a JSON body, which
  triggers a preflight (`OPTIONS`). Two ways to satisfy it:
  - Set the Webhook node's **Allowed Origins** = the site domains (or `*` for MVP), **and** enable **"Include CORS headers"** if your n8n exposes it; or
  - Add a route/`IF` that answers `OPTIONS` with `204` + headers `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: content-type`.
  - Verify in browser devtools: preflight `204` + actual `200`.

## Node 2 — Code: "Resolve Site"

Mode: **Run Once for All Items**, language JavaScript. Set `WORKER` to your
deployed Worker URL after `wrangler deploy`.

```js
// Resolve the chat origin to trusted per-site context from the hvac-chat-context
// Worker, and build the NAP-safe system prompt. NEVER trust browser-supplied NAP.
const WORKER = "https://hvac-chat-context.<your-sub>.workers.dev"; // <-- set me
const raw = $json.origin || $json.host || "";
const host = String(raw).toLowerCase().replace(/^www\./, "").trim();

let site = null;
try {
  const r = await this.helpers.httpRequest({
    url: `${WORKER}/context/${encodeURIComponent(host)}`,
    method: "GET",
    json: true,
    timeout: 4000,
  });
  if (r && r.ok && r.site) site = r.site;
} catch (e) {
  // fall through to unknown-site context
}

const s = site || {
  brand: "our team", city: "", serviceAreas: [], services: [],
  trackingPhone: null, vertical: "unknown",
  sourceUrl: host ? "https://" + host : "",
};

const phoneLine = s.trackingPhone && s.trackingPhone.display
  ? `The phone number you may share is ${s.trackingPhone.display}.`
  : "No phone number is configured — do not invent one; direct visitors to the contact form on the page.";
const areaLine = (s.serviceAreas && s.serviceAreas.length) ? `Service areas: ${s.serviceAreas.join(", ")}.` : "";
const cityLine = s.city ? `Primary city: ${s.city}.` : "";
const svcLine  = (s.services && s.services.length) ? `Services offered: ${s.services.join(", ")}.` : "";

const systemPrompt = [
  `You are the friendly chat assistant for ${s.brand}, a local home-services company.`,
  cityLine, areaLine, svcLine, "",
  "Your job: briefly answer questions about services and coverage, then qualify and capture leads.",
  "To capture a lead, collect the visitor's NAME plus either a PHONE NUMBER or EMAIL, the SERVICE they need, and the URGENCY. Then call the `capture_lead` tool.",
  phoneLine, "",
  "STRICT RULES:",
  "- Never state a street address, postal code, or any phone number other than the one given above.",
  "- Never invent prices, exact hours, guarantees, or services not listed above.",
  "- Keep replies to 1-3 sentences. Be warm, local, helpful.",
  "- If asked something you cannot verify, offer to have someone follow up and capture contact info.",
].filter(Boolean).join("\n");

return [{
  json: {
    sessionId: $json.sessionId || "",
    message: $json.message || "",
    site: s,
    systemPrompt,
    originResolved: host,
  },
}];
```

## Node 3 — AI Agent

- **Agent type**: Conversational (or Tools Agent, depending on your n8n version).
- **Prompt / System message**: `={{ $json.systemPrompt }}` (expression referencing Node 2).
- **Input message / prompt**: `={{ $json.message }}`.
- **Model sub-node**: Anthropic Chat Model, model `claude-haiku-4-5-20251001`.
- **Memory sub-node**: Window Buffer Memory. **Session ID**: `={{ $json.sessionId }}`
  (so each visitor's history is isolated). Session Key: a stable name like `hvac-chat`.
- **Tool**: the `capture_lead` Tool(Code) node below.

## Node 4 — Tool (Code): "capture_lead"

A LangChain **Tool** node backed by JavaScript code.

**Schema (the fields the agent fills):**
- `name` (string, required)
- `phone` (string) — required-if-email-empty
- `email` (string) — required-if-phone-empty
- `serviceType` (string, required)
- `urgency` (string, optional — e.g. "emergency", "this week", "planning")
- `message` (string, optional — any extra context)

**Description (shown to the agent):**
> Submit a qualified lead for the current site. Call this ONLY after you have the
> visitor's name and at least one of phone/email, plus the service they need.
> Do not call it for general questions.

**Code:**

```js
// capture_lead — POST Shape A to the shared lead webhook so the lead enters the
// EXISTING "HVAC Form Lead Tracking" pipeline unchanged (Sheet/email/Telegram).
// source_url comes from the resolved site (trusted), never from the visitor.
const LEAD_WEBHOOK = "https://auto.sdagents.ai/webhook/hvac-sites";

// The resolved site flows in as the agent's input item. If your n8n version does
// not pass it through, replace the line below with an expression/Set node that
// reads $('Resolve Site').item.json.site before the agent runs.
const item = this.getInputData(0);
const site = (item && item.json && item.json.site) || {};

const name = $parameter.name || "";
const phone = $parameter.phone || "";
const email = $parameter.email || "";
const serviceType = $parameter.serviceType || "";
const urgency = $parameter.urgency || "";
const extra = $parameter.message || "";

if (!name || !(phone || email)) {
  return [{ json: { captured: false, note: "Missing name or contact — ask the visitor before retrying." } }];
}

const p2 = (x) => String(x).padStart(2, "0");
const n = new Date();
const stamp = `${n.getFullYear()}-${p2(n.getMonth() + 1)}-${p2(n.getDate())} ` +
              `${p2(n.getHours())}:${p2(n.getMinutes())}:${p2(n.getSeconds())}`;

const intent = ["Chat lead.", serviceType, urgency ? `Urgency: ${urgency}` : "", extra]
  .filter(Boolean).join(" — ");

const body = new URLSearchParams({
  "1.3": name,
  "2":   email,
  "3":   intent,
  "4":   phone,
  "5.3": site.city || "",
  "source_url":   site.sourceUrl || "",
  "date_created": stamp,
}).toString();

let ok = false, status = 0;
try {
  const r = await fetch(LEAD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
  });
  status = r.status;
  ok = r.ok;
} catch (e) {
  ok = false;
}

return [{
  json: {
    captured: ok,
    status,
    note: ok
      ? "Lead captured — tell the visitor someone will reach out shortly."
      : "Could not submit the lead — ask the visitor to use the contact form or call.",
  },
}];
```

> n8n runs server-side, so this `fetch` is **not** subject to browser no-cors —
> `r.status` is readable (unlike the browser form). That means you can surface
> real success/failure to the agent. Just confirm the "Valid lead?" gate accepts
> the body (it should — same Shape A the forms send).

## Node 5 — Respond to Webhook

- Respond With: JSON, body:
  ```json
  { "reply": "={{ $json.output || $json.text || '' }}" }
  ```
  (use whichever field your AI Agent version emits as its text output)
- **CORS headers**: add
  `Access-Control-Allow-Origin: *` (or the site origin),
  `Access-Control-Allow-Methods: POST, OPTIONS`,
  `Access-Control-Allow-Headers: content-type`.

---

## Lead payload contract (Shape A — matches `main.js`)

| Key | Value |
|---|---|
| `1.3` | name |
| `2` | email |
| `3` | message (composed: service + urgency + intent) |
| `4` | phone |
| `5.3` | city (from resolved site) |
| `source_url` | resolved site `sourceUrl` (trusted — drives attribution downstream) |
| `date_created` | `YYYY-MM-DD HH:MM:SS` |

Never populated by the bot: honeypot fields `company_url`, `_honey`, `company_website`.

## Smoke test (end-to-end)

1. Deploy Worker; set its URL in Node 2.
2. Activate the workflow.
3. `curl` the chat webhook from an HVAC origin:
   ```sh
   curl -X POST https://auto.sdagents.ai/webhook/hvac-chat \
     -H "Origin: https://londonheatingcooling.ca" \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"smoke1","origin":"londonheatingcooling.ca","message":"Do you install heat pumps in Strathroy?"}'
   ```
   Expect a reply that names London's tracking number only when asked, and Strathroy as a service area.
4. Drive the agent to a lead ("I'm Jane, 555-0100, need a furnace quote, it's urgent"), confirm a row appears in **Lead Tracker - HVAC Ontario** with the correct `source_url`.
