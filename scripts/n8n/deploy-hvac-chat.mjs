// Create/update the "HVAC Chat" workflow on Headbanger n8n (auto.sdagents.ai) via the
// public REST API. Idempotent: PUT-updates if "HVAC Chat" exists, else POST-creates.
// Always leaves it INACTIVE (you flip it on in the n8n UI after review).
//
// ALL context is embedded (the sites map from scripts/n8n/sites.json is inlined into
// the Resolve node) — NO external Worker. Logs every turn to the "HVAC Chat Logs" sheet.
// Built on the PROVEN @n8n/n8n-nodes-langchain.anthropic chat node + basic nodes that
// already run in production on this instance.
//
// Run:
//   set -a && source ~/.n8n/headbanger-api && set +a
//   (cd ../.. && node scripts/gen-chat-context.mjs)   # regenerate scripts/n8n/sites.json
//   node scripts/n8n/deploy-hvac-chat.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = process.env.N8N_HB_URL;
const KEY = process.env.N8N_HB_KEY;
const NAME = "HVAC Chat";

// "HVAC Chat Logs" spreadsheet (tien@headbangermarketing.com) + existing Sheets cred.
const SHEET_ID = "1jOwMkEd8dUuK_dyTFEHOOWnuYKj4rajP_vobIBN9oVc";
const SHEETS_CRED = { googleSheetsOAuth2Api: { id: "xrXsntee1vsHtaKn", name: "Google Sheets account" } };
const ANTHROPIC_CRED = { anthropicApi: { id: "Z4IThWsSQ2AXfHxM", name: "Anthropic - HVAC - Headbanger" } };
const MODEL = "claude-haiku-4-5-20251001";

if (!URL || !KEY) {
  console.error("Missing N8N_HB_URL / N8N_HB_KEY — run: set -a && source ~/.n8n/headbanger-api && set +a");
  process.exit(1);
}

// Google Drive photo storage (optional). Enabled only when a folder id is provided AND a
// googleDriveOAuth2Api credential exists on this n8n. Requires a one-time Drive OAuth
// credential + a link-shared folder (see hvac-portfolio-chatbot memory).
const DRIVE_FOLDER_ID = process.env.HVAC_DRIVE_FOLDER_ID || "";
let driveCredId = null;
if (DRIVE_FOLDER_ID) {
  const credsList = await fetch(`${URL}/credentials?limit=200`, { headers: { "X-N8N-API-KEY": KEY } });
  const allCreds = ((await credsList.json()).data) || [];
  const drive = allCreds.find((c) => c.type === "googleDriveOAuth2Api");
  if (!drive) {
    console.error("HVAC_DRIVE_FOLDER_ID set but no googleDriveOAuth2Api credential found.\nCreate one in n8n (Credentials > New > Google Drive > connect with tien@headbangermarketing.com), then re-run.");
    process.exit(1);
  }
  driveCredId = drive.id;
  console.log("Drive photo storage ENABLED: folder=" + DRIVE_FOLDER_ID + " cred=" + driveCredId + " (" + drive.name + ")");
} else {
  console.log("Drive photo storage DISABLED (set HVAC_DRIVE_FOLDER_ID to enable).");
}
const driveEnabled = !!driveCredId;

// Inline the sites map into resolve.js (replaces the old Worker fetch).
const sitesBundle = JSON.parse(readFileSync(join(__dirname, "sites.json"), "utf8"));
const sitesMap = sitesBundle.sites || {};
const resolveCode = readFileSync(join(__dirname, "chat-nodes", "resolve.js"), "utf8")
  .replaceAll("__SITES_MAP__", JSON.stringify(sitesMap));
const captureCode = readFileSync(join(__dirname, "chat-nodes", "capture.js"), "utf8");

const sheetUrl = "https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/edit";

const nodes = [
  {
    parameters: { httpMethod: "POST", path: "hvac-chat", responseMode: "responseNode", options: {} },
    id: randomUUID(), name: "Webhook", type: "n8n-nodes-base.webhook", typeVersion: 2.1,
    position: [180, 300], webhookId: "hvac-chat"
  },
  {
    parameters: { jsCode: resolveCode },
    id: randomUUID(), name: "Resolve & Build Prompt", type: "n8n-nodes-base.code", typeVersion: 2,
    position: [440, 300]
  },
  {
    // Proven @n8n/n8n-nodes-langchain.anthropic node (text; image blocks are ignored
    // by this node, but photo presence is still logged). To enable the bot to actually
    // SEE photos, swap this node for an httpRequest to the Anthropic Messages API using
    // a one-time httpHeaderAuth "Anthropic API key" credential (see HVAC-CHAT-N8N-SPEC).
    parameters: {
      modelId: { __rl: true, value: MODEL, mode: "list", cachedResultName: MODEL },
      messages: { values: [{ content: "={{ $json.content }}" }] },
      options: {}
    },
    id: randomUUID(), name: "Chat", type: "@n8n/n8n-nodes-langchain.anthropic", typeVersion: 1,
    position: [700, 300], credentials: ANTHROPIC_CRED
  },
  {
    parameters: { jsCode: captureCode },
    id: randomUUID(), name: "Parse & Capture", type: "n8n-nodes-base.code", typeVersion: 2,
    position: [960, 300]
  },
  {
    parameters: {
      operation: "append",
      documentId: { __rl: true, value: SHEET_ID, mode: "list", cachedResultName: "HVAC Chat Logs", cachedResultUrl: sheetUrl },
      sheetName: { __rl: true, value: "gid=0", mode: "list", cachedResultName: "HVAC Chat Logs", cachedResultUrl: sheetUrl + "#gid=0" },
      columns: { mappingMode: "autoMapInputData" },
      options: {}
    },
    id: randomUUID(), name: "Log to Sheet", type: "n8n-nodes-base.googleSheets", typeVersion: 4.7,
    position: [1220, 440], credentials: SHEETS_CRED
  },
  {
    parameters: { respondWith: "json", responseBody: "={{ JSON.stringify({ reply: $json.botReply, captured: ($json.leadCaptured === 'yes') }) }}" },
    id: randomUUID(), name: "Respond to Webhook", type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.5,
    position: [1220, 300]
  },
  {
    // Escalation gate: if the model emitted [ESCALATE], ping the team Telegram.
    parameters: {
      conditions: {
        options: { caseSensitive: false },
        conditions: [{ leftValue: "={{ $json.escalated === 'yes' }}", operator: { type: "boolean", operation: "true", singleValue: true } }],
        combinator: "and"
      },
      options: {}
    },
    id: randomUUID(), name: "Check Escalation", type: "n8n-nodes-base.if", typeVersion: 2.3,
    position: [1480, 300]
  },
  {
    parameters: {
      operation: "sendMessage",
      chatId: "-5070071554",
      text: "={{ 'HVAC Chat escalation\\nSite: ' + $json.domain + '\\nSession: ' + $json.sessionId + '\\nReason: ' + ($json.escalateReason || 'needs human review') + '\\nBot reply: ' + ($json.botReply || '').slice(0,300) }}",
      additionalFields: {}
    },
    id: randomUUID(), name: "Telegram - Escalation", type: "n8n-nodes-base.telegram", typeVersion: 1.2,
    position: [1740, 300], credentials: { telegramApi: { id: "9JcEcJPuIvkKH6fc", name: "Telegram account" } }
  }
];

// --- optional Google Drive photo storage branch ---
if (driveEnabled) {
  const fileIdExpr = "={{ ($('Parse & Capture').item.json.sessionId || 'chat') + '-' + Math.random().toString(36).slice(2,8) + '.jpg' }}";
  const attachDriveLinkCode = [
    "// Merge the uploaded Drive file link back into the Parse & Capture log row.",
    "var row = $('Parse & Capture').item.json;",
    "var f = $json || {};",
    "var link = f.webViewLink || (f.id ? 'https://drive.google.com/file/d/' + f.id + '/view' : '');",
    "return [{ json: Object.assign({}, row, { photoLink: link }) }];"
  ].join("\n");
  nodes.push(
    {
      parameters: {
        conditions: {
          options: { caseSensitive: false },
          conditions: [{ leftValue: "={{ $json.hasPhoto === true }}", operator: { type: "boolean", operation: "true", singleValue: true } }],
          combinator: "and"
        },
        options: {}
      },
      id: randomUUID(), name: "Has Photo?", type: "n8n-nodes-base.if", typeVersion: 2.3,
      position: [1220, 340]
    },
    {
      parameters: {
        resource: "file",
        operation: "upload",
        inputDataFieldName: "photo",
        name: fileIdExpr,
        folderId: { __rl: true, value: DRIVE_FOLDER_ID, mode: "id" },
        options: {}
      },
      id: randomUUID(), name: "Upload Photo to Drive", type: "n8n-nodes-base.googleDrive", typeVersion: 3,
      position: [1500, 340], credentials: { googleDriveOAuth2Api: { id: driveCredId, name: "Google Drive account" } }
    },
    {
      parameters: { jsCode: attachDriveLinkCode },
      id: randomUUID(), name: "Attach Drive Link", type: "n8n-nodes-base.code", typeVersion: 2,
      position: [1780, 340]
    },
    {
      // PHOTO path: same sheet, same columns; fed the rebuilt row that includes the Drive link.
      parameters: {
        operation: "append",
        documentId: { __rl: true, value: SHEET_ID, mode: "list", cachedResultName: "HVAC Chat Logs", cachedResultUrl: sheetUrl },
        sheetName: { __rl: true, value: "gid=0", mode: "list", cachedResultName: "HVAC Chat Logs", cachedResultUrl: sheetUrl + "#gid=0" },
        columns: { mappingMode: "autoMapInputData" },
        options: {}
      },
      id: randomUUID(), name: "Log Photo to Sheet", type: "n8n-nodes-base.googleSheets", typeVersion: 4.7,
      position: [2060, 340], credentials: SHEETS_CRED
    }
  );
}

const connections = driveEnabled ? {
  "Webhook": { main: [[{ node: "Resolve & Build Prompt", type: "main", index: 0 }]] },
  "Resolve & Build Prompt": { main: [[{ node: "Chat", type: "main", index: 0 }]] },
  "Chat": { main: [[{ node: "Parse & Capture", type: "main", index: 0 }]] },
  // Parse & Capture fans out: visitor reply, escalation gate, and the photo branch.
  "Parse & Capture": { main: [[
    { node: "Respond to Webhook", type: "main", index: 0 },
    { node: "Check Escalation", type: "main", index: 0 },
    { node: "Has Photo?", type: "main", index: 0 }
  ]] },
  "Has Photo?": { main: [[{ node: "Upload Photo to Drive", type: "main", index: 0 }], [{ node: "Log to Sheet", type: "main", index: 0 }]] },
  "Upload Photo to Drive": { main: [[{ node: "Attach Drive Link", type: "main", index: 0 }]] },
  "Attach Drive Link": { main: [[{ node: "Log Photo to Sheet", type: "main", index: 0 }]] },
  "Check Escalation": { main: [[{ node: "Telegram - Escalation", type: "main", index: 0 }], []] }
} : {
  "Webhook": { main: [[{ node: "Resolve & Build Prompt", type: "main", index: 0 }]] },
  "Resolve & Build Prompt": { main: [[{ node: "Chat", type: "main", index: 0 }]] },
  "Chat": { main: [[{ node: "Parse & Capture", type: "main", index: 0 }]] },
  "Parse & Capture": { main: [[
    { node: "Respond to Webhook", type: "main", index: 0 },
    { node: "Log to Sheet", type: "main", index: 0 },
    { node: "Check Escalation", type: "main", index: 0 }
  ]] },
  "Check Escalation": { main: [[{ node: "Telegram - Escalation", type: "main", index: 0 }], []] }
};

const workflow = { name: NAME, nodes, connections, settings: { executionOrder: "v1" } };
const authH = { "X-N8N-API-KEY": KEY };

const listRes = await fetch(`${URL}/workflows?limit=200`, { headers: authH });
const list = await listRes.json();
const arr = list.data || list;
const existing = (arr || []).find(w => w.name === NAME);

let method, endpoint, body;
if (existing) {
  method = "PUT";
  endpoint = `${URL}/workflows/${existing.id}`;
  body = JSON.stringify(workflow);
} else {
  method = "POST";
  endpoint = `${URL}/workflows`;
  body = JSON.stringify(workflow);
}

const res = await fetch(endpoint, { method, headers: { ...authH, "Content-Type": "application/json" }, body });
const j = await res.json();
if (!res.ok) {
  console.error("FAILED " + res.status);
  console.error(JSON.stringify(j).slice(0, 1500));
  process.exit(1);
}
const wf = j.data || j;
console.log(`${method === "PUT" ? "updated" : "created"} "${wf.name}" id=${wf.id} active=${wf.active} sites=${Object.keys(sitesMap).length} logged->${SHEET_ID}`);
console.log(`review/activate: https://auto.sdagents.ai/workflow/${wf.id}`);
