// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Recover from dynamic chunk load failures (common after a deploy when a
// cached index.html references old chunk filenames). On such failures we
// reload the page so the browser fetches the latest files.
window.addEventListener("error", (event) => {
  const msg = event && event.message;
  if (msg && /Loading chunk \d+ failed/.test(msg)) {
    console.warn("Detected chunk load failure — reloading page to recover.");
    window.location.reload();
  }
});

// Also catch rejected promises caused by failed dynamic imports
window.addEventListener("unhandledrejection", (event) => {
  const reason = event && event.reason;
  const message = reason && (reason.message || reason.toString && reason.toString());
  if (message && /Loading chunk \d+ failed/.test(message)) {
    console.warn("Detected chunk load failure in unhandledrejection — reloading page to recover.");
    window.location.reload();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
