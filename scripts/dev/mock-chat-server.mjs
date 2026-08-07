// Local mock for the n8n "HVAC Chat" brain — for PREVIEW ONLY (astro dev).
// Stands in for the not-yet-wired n8n workflow so you can actually chat with the
// widget. It reads the generated sites.json (the same bundle the real Worker
// serves) and returns site-aware canned replies + simulates lead capture.
//
// NOT the real brain: no LLM, no real lead submission. "Captured" leads are only
// echoed to this terminal. Real wiring = the n8n workflow (see HVAC-CHAT-N8N-SPEC.md).
//
// Run:  node scripts/dev/mock-chat-server.mjs   (listens on :8787)
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const bundle = JSON.parse(readFileSync(join(__dirname, "../../../hvac-chat-context/sites.json"), "utf8"));
const SITES = bundle.sites || {};
const DEFAULT_DOMAIN = "londonheatingcooling.ca";

// index by domain + sourceUrl host (mirrors the Worker)
const BY_HOST = {};
for (const [d, c] of Object.entries(SITES)) {
  BY_HOST[d] = c;
  try { const h = new URL(c.sourceUrl).hostname.replace(/^www\./, ""); if (h && !BY_HOST[h]) BY_HOST[h] = c; } catch {}
}
const norm = (h) => String(h || "").toLowerCase().replace(/^www\./, "").trim();

function resolveSite(origin) {
  const s = BY_HOST[norm(origin)];
  if (s) return { site: s, via: "origin" };
  // localhost dev won't match a real domain -> emulate the default site
  return { site: SITES[DEFAULT_DOMAIN], via: "default" };
}

function buildReply(site, msg) {
  const m = (msg || "").toLowerCase();
  const phone = site.trackingPhone && site.trackingPhone.display;
  const phoneLine = phone ? `at ${phone}` : "via the contact page";

  const digits = (msg.match(/\d/g) || []).length;
  const hasPhone = digits >= 10;
  const hasEmail = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(msg);
  const hasContact = hasPhone || hasEmail;
  const wantsQuote = /quote|estimate|price|cost|book|appoint|install|repair|fix|replace/i.test(m);
  const asksPhone = /phone|number|call|reach|contact/i.test(m);
  const asksArea = /area|where|location|cover|serve|near|do you (come|service)/i.test(m);
  const asksService = /service|do you|offer|furnace|ac\b|air cond|heat pump|boiler|water heater|ductless|thermostat/i.test(m);
  const asksHours = /hour|open|when can|available/i.test(m);
  const greets = /^(hi|hey|hello|yo|sup|good (morning|afternoon|evening))\b/i.test(m);

  if (greets && !hasContact) return `Hi! I'm the ${site.brand} assistant. I can help with service info, coverage areas, or getting you a quote. What do you need?`;
  // Lead capture wins when contact info is present alongside any service/quote intent.
  if (hasContact && (wantsQuote || hasPhone || hasEmail || asksService)) {
    return `Got it — I've sent your details to the ${site.city || "local"} team at ${site.brand}. Someone will reach out shortly. [MOCK PREVIEW: no real lead was submitted.]`;
  }
  if (asksPhone) return `You can reach ${site.brand} ${phoneLine}. Want a callback? Send me your name and phone number and I'll pass it to the team.`;
  if (asksArea) return `Yes — ${site.brand} serves ${site.city || "the area"}${site.serviceAreas && site.serviceAreas.length ? ", including " + site.serviceAreas.slice(0, 6).join(", ") : ""}. Where are you located?`;
  if (asksHours) return `For exact hours it's best to call ${phoneLine}, but we take emergency calls across ${site.city || "the region"}. Want me to arrange a callback?`;
  if (asksService) return `We handle ${site.services && site.services.length ? site.services.slice(0, 5).join(", ") : "residential HVAC"}. Tell me what you need and your nearest town and I'll get a quote rolling.`;
  if (wantsQuote) return `Happy to get that started. Could you share your name and a phone number or email so the team can reach you?`;
  return `I can help with services, coverage, pricing, or booking a visit for ${site.brand}. What would you like to know?`;
}

const history = new Map(); // sessionId -> [msgs]

const server = createServer((req, res) => {
  const send = (status, body, headers = {}) => {
    res.writeHead(status, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  };
  if (req.method === "OPTIONS") return send(204, "");

  if (req.method !== "POST" || !req.url.startsWith("/webhook/hvac-chat")) {
    return send(404, { ok: false, error: "not found" });
  }

  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body = {};
    try { body = JSON.parse(raw || "{}"); } catch {}
    const msg = (body.message || "").toString();
    const origin = body.origin || "";
    const sid = body.sessionId || "anon";
    const { site, via } = resolveSite(origin);

    const convo = history.get(sid) || [];
    convo.push({ role: "user", text: msg });
    const reply = buildReply(site, msg);
    convo.push({ role: "bot", text: reply });
    history.set(sid, convo);

    const captured = /\[MOCK PREVIEW/.test(reply);
    console.log(
      `[chat] ${new Date().toISOString()}  sid=${sid.slice(0, 10)}  origin=${origin} (site:${via}:${site.domain})\n` +
      `   user: ${msg.slice(0, 120)}\n` +
      `   bot : ${reply.slice(0, 120)}${captured ? "  <<< LEAD (mock)" : ""}`
    );

    // small delay to mimic an LLM round-trip + show the typing indicator
    setTimeout(() => send(200, { ok: true, reply }), 450);
  });
});

const PORT = 8787;
server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-chat] listening on http://127.0.0.1:${PORT}/webhook/hvac-chat`);
  console.log(`[mock-chat] emulating site fallback = ${DEFAULT_DOMAIN} (when origin is localhost)`);
  console.log(`[mock-chat] ${Object.keys(SITES).length} sites loaded from sites.json`);
});
