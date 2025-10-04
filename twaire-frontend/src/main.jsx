import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// I use Bootstrap for utility classes cuz I don't feel like using Tailwind
import "bootstrap/dist/css/bootstrap.min.css";
// TODO: Migrate from Bootstrap icons to MUI icons
import "bootstrap-icons/font/bootstrap-icons.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
