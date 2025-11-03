import React, { useEffect, useState } from "react";
import { getJobs } from "../../api/studentApi";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getJobs()
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Available Jobs</h1>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <strong>{job.title}</strong> at {job.companyName}
            <ul>
              {job.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
