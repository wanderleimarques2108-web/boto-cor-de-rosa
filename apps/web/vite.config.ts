/*
 * CONFIGURAÇÃO DO VITE
 * O Vite é a ferramenta que roda o site durante o desenvolvimento
 * e que gera a versão final (build) para publicar.
 */
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    // Atalho: "@/" significa "a pasta src/".
    // Assim escrevemos  import { Button } from "@/components/ui/button"
    // em vez de         import { Button } from "../../components/ui/button"
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },

    // Garante que exista UMA ÚNICA cópia do React no site.
    // Sem isso, algumas bibliotecas (ícones, shadcn/radix, avisos) podiam
    // carregar uma segunda cópia do React, e a página ficava em branco
    // (erro "Invalid hook call" no console do navegador).
    dedupe: ["react", "react-dom"],
  },

  server: {
    port: 5173,
    // Se a porta 5173 já estiver ocupada, o Vite PARA com um aviso,
    // em vez de abrir uma segunda cópia do site em outra porta.
    strictPort: true,
    // "Proxy": todo pedido que começar com /api é repassado para a API.
    // Assim o site e a API parecem estar no mesmo endereço,
    // e não precisamos configurar CORS.
    proxy: {
      "/api": "http://localhost:3333",
    },
  },
});
