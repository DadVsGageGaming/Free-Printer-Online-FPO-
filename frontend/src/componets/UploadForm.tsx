import React, { useState } from "react";
import axios from "axios";

type Uploaded = { key: string; filename?: string; mime?: string };

export default function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const maxFiles = Number(import.meta.env.VITE_MAX_UPLOAD_FILES || 5);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files;
    if (!f) return;
    const arr = Array.from(f).slice(0, maxFiles);
    setFiles(arr);
  }

  async function uploadAll(): Promise<Uploaded[]> {
    // fetch presigned posts
    const resp = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/presign?count=${files.length}`);
    const uploads = resp.data.uploads as any[];
    const results: Uploaded[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const up = uploads[i];
      // construct form-data per presigned POST
      const form = new FormData();
      Object.entries(up.post.fields).forEach(([k, v]: any) => form.append(k, v));
      form.append("file", file);
      const uploadUrl = up.post.url;
      await axios.post(uploadUrl, form, { headers: { "Content-Type": "multipart/form-data" } });
      results.push({ key: up.key, filename: file.name, mime: file.type });
    }
    return results;
  }

  async function submitOrder() {
    if (!email || files.length === 0) {
      setStatus("Please provide email and at least one file.");
      return;
    }
    try {
      setStatus("Uploading...");
      const uploaded = await uploadAll();
      setStatus("Creating order...");
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/orders`, {
        email, name, address: {}, images: uploaded
      });
      setStatus("Order created. You'll receive an email when QC completes.");
      setFiles([]);
      setEmail("");
      setName("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to upload/create order.");
    }
  }

  return (
    <div>
      <h2>Upload photos (max {maxFiles})</h2>
      <input type="file" accept="image/*" multiple onChange={onFiles} />
      <div>
        <input placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <input placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <button className="btn-primary" onClick={submitOrder}>Submit Order</button>
      </div>
      {status && <p>{status}</p>}
      <div>
        <h3>Queued files</h3>
        <ul>
          {files.map(f => <li key={f.name}>{f.name} — {(f.size/1024/1024).toFixed(2)} MB</li>)}
        </ul>
      </div>
    </div>
  );
}
