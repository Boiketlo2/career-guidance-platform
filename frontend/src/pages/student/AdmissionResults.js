import React, { useState } from "react";
import { getResults } from "../../api/studentApi";

export default function AdmissionResults() {
  const [uid, setUid] = useState("");
  const [results, setResults] = useState([]);

  const fetchResults = () => {
    getResults(uid)
      .then((res) => setResults(res.data))
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      <h1>Admission Results</h1>
      <input placeholder="Enter UID" value={uid} onChange={(e) => setUid(e.target.value)} />
      <button onClick={fetchResults}>Get Results</button>

      <ul>
        {results.map((res) => (
          <li key={res.id}>
            {res.institutionId} - {res.courseId} - {res.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
