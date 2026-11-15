import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/neucha/cyrillic-400.css";
import "@fontsource/neucha/latin-400.css";
import { App } from "./app/App";
import "./app/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
