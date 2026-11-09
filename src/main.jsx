import { createRoot } from "react-dom/client";
import D from "./content.json";
import { applyTheme } from "./theme.js";
import App from "./App.jsx";
import "./style.css";
applyTheme(D.theme);
createRoot(document.getElementById("root")).render(<App />);
