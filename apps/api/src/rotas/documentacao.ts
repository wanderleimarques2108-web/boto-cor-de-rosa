/*
 * ROTAS DA DOCUMENTAÇÃO (Scalar)
 * ------------------------------
 *   GET /api/openapi.json  -> a descrição da API no formato OpenAPI (JSON)
 *   GET /api/docs          -> a página de documentação interativa (Scalar)
 *
 * Como funciona:
 *   1. A página /api/docs é um HTML gerado pelo pacote do Scalar.
 *   2. Esse HTML, ao abrir no navegador, baixa a interface do Scalar
 *      (pela internet, de um CDN) e lê o /api/openapi.json.
 *   3. Com essas informações, o Scalar desenha a documentação.
 */
import { renderApiReference } from "@scalar/client-side-rendering";
import { especificacao } from "../documentacao/openapi";

export function openapi() {
  return Response.json(especificacao);
}

export function paginaDocumentacao() {
  // renderApiReference devolve o HTML completo da página, como texto.
  const html = renderApiReference({
    pageTitle: "API · Biblioteca Boto Cor de Rosa",
    config: {
      // De onde o Scalar lê a descrição da API (endereço relativo a /api/docs).
      url: "openapi.json",
    },
  });

  // Avisamos ao navegador que a resposta é uma página HTML (e não JSON).
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
