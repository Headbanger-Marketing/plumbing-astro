// HVAC Chat — "Parse & Capture" code node.
// Reads the model reply; if it emitted [CAPTURE]{...}[/CAPTURE], submits a Shape-A
// lead to the shared hvac-sites pipeline (same one the forms use), then strips the
// marker. Output fields are named to match the 'HVAC Chat Logs' sheet headers so the
// Log node can auto-map them.
const LEAD_WEBHOOK = "https://auto.sdagents.ai/webhook/hvac-sites";

// site/userMessage/sessionId came from Resolve; the Chat node only outputs model text.
const resolveItem = $("Resolve & Build Prompt").item.json;
const site = resolveItem.site || {};

// The Chat (@n8n/n8n-nodes-langchain.anthropic) node outputs { content: [{ text }] }.
const chatJson = $json;
let text = "";
if (chatJson.content && Array.isArray(chatJson.content)) {
  text = (chatJson.content[0] && chatJson.content[0].text) || "";
} else if (typeof chatJson.text === "string") {
  text = chatJson.text;
}

let reply = (text || "").trim();
const m = reply.match(/\[CAPTURE\](\{[\s\S]*?\})\[\/CAPTURE\]/);
let captured = false;

if (m) {
  reply = reply.replace(/\s*\[CAPTURE\][\s\S]*?\[\/CAPTURE\]\s*$/g, "").trim();
  let lead = {};
  try { lead = JSON.parse(m[1]); } catch (e) {}

  const p2 = function (x) { return String(x).padStart(2, "0"); };
  const n = new Date();
  const stamp = n.getFullYear() + "-" + p2(n.getMonth() + 1) + "-" + p2(n.getDate()) + " " +
                p2(n.getHours()) + ":" + p2(n.getMinutes()) + ":" + p2(n.getSeconds());

  const intent = ["Chat lead.", lead.service || "", lead.urgency ? "Urgency: " + lead.urgency : ""]
    .filter(Boolean).join(" - ");

  const payload = new URLSearchParams({
    "1.3": lead.name || "",
    "2": lead.email || "",
    "3": intent,
    "4": lead.phone || "",
    "5.3": site.city || "",
    source_url: site.sourceUrl || "",
    date_created: stamp
  }).toString();

  try {
    await this.helpers.httpRequest({
      method: "POST",
      url: LEAD_WEBHOOK,
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload,
      timeout: 8000
    });
    captured = true;
  } catch (e) {
    captured = false;
  }
}

// Escalation marker (model emits [ESCALATE]reason[/ESCALATE] for urgent human attention).
var escalated = false; var escalateReason = "";
var esc = reply.match(/\[ESCALATE\]([\s\S]*?)\[\/ESCALATE\]/);
if (esc) {
  reply = reply.replace(/\s*\[ESCALATE\][\s\S]*?\[\/ESCALATE\]\s*/g, "").trim();
  escalated = true;
  escalateReason = esc[1].trim().slice(0, 200);
}

// Light profanity scrub for the LOG only (visitor + bot still see raw text).
function scrub(t) {
  if (!t) return t;
  return t.replace(/\b(fuck|shit|bitch|asshole|cunt|dick|bastard)\b/gi, "***");
}

var photo = resolveItem.photo || null;
var hasPhoto = !!(photo && photo.data);
var item = {
  json: {
    timestamp: new Date().toISOString(),
    sessionId: resolveItem.sessionId || "",
    domain: site.domain || "",
    brand: site.brand || "",
    userMessage: scrub(resolveItem.userMessage || ""),
    botReply: reply,
    leadCaptured: captured ? "yes" : "no",
    photoLink: "",            // filled by the "Attach Drive Link" node on the photo branch
    hasPhoto: hasPhoto,
    escalated: escalated ? "yes" : "no",
    escalateReason: escalateReason
  }
};
// Carry the raw photo as binary so the Google Drive node can upload it. The no-photo
// branch (Has Photo? = false) never reaches that node, so binary stays undefined here.
if (hasPhoto) {
  var safeSid = String(resolveItem.sessionId || "session").replace(/[^a-z0-9]/gi, "").slice(0, 16);
  item.binary = { photo: { data: photo.data, mimeType: photo.mediaType || "image/jpeg", fileName: "chat-" + safeSid + ".jpg" } };
}
return [item];
