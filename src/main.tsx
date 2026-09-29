import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ignoreBrokenMetaMaskInjection } from "./lib/extensionErrorGuard.ts";
import "./index.css";

ignoreBrokenMetaMaskInjection();

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontró el contenedor principal de la aplicación.");
}

createRoot(root).render(<App />);
