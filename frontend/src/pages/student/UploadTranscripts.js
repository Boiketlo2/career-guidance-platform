import React, { useState } from "react";
import { uploadDocument } from "../../api/studentApi";

export default function UploadTranscripts() {
  const [file, setFile] = useState(null);
  const [uid, setUid] = useState("");

  const handleUpload = () => {
    if (!file || !uid) return alert("Provide UID and file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", uid);

    uploadDocument(formData)
      .then((res) => alert(res.data.message))
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      <h1>Upload Transcripts</h1>
      <input placeholder="Enter UID" value={uid} onChange={(e) => setUid(e.target.value)} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
