import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";

// Frontend entry point.
// It mounts the root React component into the div#root created in index.html.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
