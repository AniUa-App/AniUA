// upload.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const API_URL = "https://api.yuzka.site/functions/v1/uploadNewAppVersion";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "<PUT_YOUR_KEY_HERE>";

if (process.argv.length < 3) {
  console.error("Usage: node upload.js <path-to-file>");
  process.exit(2);
}

const filePath = process.argv[2];

async function requestPresign(filename, size, contentType) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Key": SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ filename, size, contentType })
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>null);
    throw new Error(`Presign failed: ${res.status} ${res.statusText} ${txt||""}`);
  }
  return res.json();
}

async function uploadFile(presignUrl, filePath, contentType) {
  const stream = fs.createReadStream(filePath);
  const res = await fetch(presignUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType || "application/octet-stream"
    },
    body: stream,
    duplex: "half",  // <-- добавлено, чтобы Node 18+ принял stream
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>null);
    throw new Error(`Upload failed: ${res.status} ${res.statusText} ${txt||""}`);
  }
  return res;
}


(async () => {
  try {
    const stat = fs.statSync(filePath);
    const filename = path.basename(filePath);
    const size = stat.size;
    const contentType = "application/octet-stream";

    console.log("Requesting presign...");
    const presignResp = await requestPresign(filename, size, contentType);
    console.log("Presign response:", presignResp);

    if (!presignResp.presignUrl) throw new Error("No presignUrl in response");

    console.log("Uploading file to presign URL...");
    const res = await uploadFile(presignResp.presignUrl, filePath, contentType);
    console.log("Upload finished with status:", res.status);

    if (presignResp.url) console.log("Public URL:", presignResp.url);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
})();
