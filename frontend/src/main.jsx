// ─────────────────────────────────────────────
// src/main.jsx  –  App Entry Point
// ─────────────────────────────────────────────
// This is the very first file that runs.
// It mounts your React app into the HTML page (index.html).
// The <div id="root"> in index.html is where React "lives".

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Global style reset — removes default margins/padding
// so your styling starts from a clean slate
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* StrictMode helps catch bugs during development.
        It runs effects twice in dev mode — this is normal! */}
    <App />
  </StrictMode>
);