// HVAC Chat — "Resolve & Build Prompt" code node (multimodal).
// Embeds the sites map (no Worker), resolves the site, and builds the FULL Anthropic
// Messages API body — system prompt + history + a final user message that can include
// an image content block (base64) when the visitor attached a photo.
// NAP-safe: tracking phone + city only; never citationPhone/address.street.
const SITES = __SITES_MAP__;

const body = $json.body || {};
const origin = body.origin || "";
const host = String(origin).toLowerCase().replace(/^www\./, "").trim();
const userMsg = body.message || "";
const history = Array.isArray(body.history) ? body.history : [];
const photo = body.photo || null; // { mediaType, data(base64, no prefix) }

const BY_HOST = {};
for (const d in SITES) {
  BY_HOST[d] = SITES[d];
  try { const h = new URL(SITES[d].sourceUrl).hostname.replace(/^www\./, ""); if (h && !BY_HOST[h]) BY_HOST[h] = SITES[d]; } catch (e) {}
}
const unknown = { brand: "our team", city: "", serviceAreas: [], services: [], trackingPhone: null, vertical: "unknown", sourceUrl: host ? "https://" + host : "", domain: host };
const s = BY_HOST[host] || unknown;

const phoneLine = (s.trackingPhone && s.trackingPhone.display)
  ? "The phone number you may share is " + s.trackingPhone.display + "."
  : "No phone number is configured - do not invent one; direct visitors to the contact form.";
const areaLine = (s.serviceAreas && s.serviceAreas.length) ? "Service areas: " + s.serviceAreas.join(", ") + "." : "";
const cityLine = s.city ? "Primary city: " + s.city + "." : "";
const svcLine = (s.services && s.services.length) ? "Services offered: " + s.services.join(", ") + "." : "";

const histBlock = history.length
  ? "\nConversation so far:\n" + history.map(function (h) { return (h.role === "user" ? "Visitor" : "Assistant") + ": " + h.text; }).join("\n")
  : "";

const system = [
  "You are the friendly chat assistant for " + s.brand + ", a local home-services company.",
  cityLine, areaLine, svcLine, "",
  "Your job: briefly answer questions about services and coverage, then qualify and capture leads.",
  "STRICT RULES:",
  "- Never state a street address, postal code, or any phone number other than the one given below.",
  "- Never invent prices, exact hours, guarantees, or services not listed above.",
  "- Keep replies to 1-3 sentences. Be warm, local, helpful.",
  "SAFETY & ESCALATION:",
  "- Stay professional. If the visitor is abusive or makes illegal/harmful/sexual requests, do NOT engage the content - briefly redirect or end politely.",
  "- Never give medical, legal, or financial advice. For a safety emergency (gas or smoke smell, no heat in extreme cold with vulnerable people), tell them to call 911 or their gas utility's emergency line FIRST, then offer to capture their details.",
  "- Do not discuss competitors, politics, or religion.",
  "- If a message needs urgent human attention (serious complaint, safety issue, anything you cannot resolve), append on a NEW final line exactly [ESCALATE]short reason[/ESCALATE] BEFORE your normal reply. You MUST emit this marker for any SAFETY EMERGENCY (gas smell, carbon monoxide, smoke, fire, electrical spark/hazard, flooding, or no heat in extreme cold with elderly/infants) or a serious complaint/abuse/unresolvable issue - it pings the on-call team. Otherwise omit it.",
  "If the visitor shares a photo, look at it and use what you see (model nameplate, the unit, an invoice, damage) to help them.",
  phoneLine, "",
  "LEAD CAPTURE: Once you have the visitor's NAME and at least a PHONE or EMAIL and the SERVICE they need, append on a NEW final line exactly this marker (fill the JSON, omit empty fields), then stop:",
  '[CAPTURE]{"name":"...","phone":"...","email":"...","service":"...","urgency":"..."}[/CAPTURE]',
  "Do not include the marker until you actually have that information.",
  histBlock
].join("\n");

// Build a single content array (Anthropic multimodal): instructions + history +
// the visitor's text, then the image block if a photo was attached. The LangChain
// Anthropic node receives this as the message content and passes it through.
const content = [{
  type: "text",
  text: system + (histBlock ? "\n" + histBlock : "") + "\nVisitor's latest message:\n" + (userMsg || "(photo attached)")
}];
if (photo && photo.data) {
  content.push({
    type: "image",
    source: { type: "base64", media_type: photo.mediaType || "image/jpeg", data: photo.data }
  });
}

// Also expose a full Anthropic Messages body (used if the Chat node is the httpRequest
// variant) — same content, just wrapped with model/system/messages.
const messages = history.map(function (h) { return { role: (h.role === "user" ? "user" : "assistant"), content: h.text }; });
messages.push({ role: "user", content: content });
const anthropicBody = { model: "claude-haiku-4-5-20251001", max_tokens: 600, system: system, messages: messages };

return [{ json: { content: content, anthropicBody: anthropicBody, site: s, sessionId: body.sessionId || "", userMessage: userMsg, photo: photo } }];
