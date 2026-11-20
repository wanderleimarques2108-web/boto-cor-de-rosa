/*
 * PONTO DE ENTRADA DO SITE
 * ------------------------
 * Primeiro arquivo executado pelo navegador.
 * Ele pega a <div id="root"> do index.html e desenha o React dentro dela.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App";
import "./index.css";

// O "!" diz ao TypeScript: "pode confiar, esse elemento existe".
const elementoRaiz = document.getElementById("root")!;

createRoot(elementoRaiz).render(
  <StrictMode>
    {/* BrowserRouter permite trocar de página sem recarregar o site. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
