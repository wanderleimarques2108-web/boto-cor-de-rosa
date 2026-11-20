/*
 * PONTO DE ENTRADA DA API
 * -----------------------
 * Este é o primeiro arquivo executado quando rodamos "bun run dev".
 * Ele liga um servidor web e diz qual função responde a cada endereço.
 *
 * Pense neste arquivo como o "cardápio" da API: ele lista tudo o que
 * a API sabe fazer. A "receita" de cada item fica na pasta rotas/.
 */
import * as exemplares from "./rotas/exemplares";
import * as emprestimos from "./rotas/emprestimos";
import * as documentacao from "./rotas/documentacao";
import { erro, traduzirErroDoBanco } from "./rotas/ajudantes";

const PORTA = 3333;

Bun.serve({
  port: PORTA,

  // MAPA DE ROTAS
  // Endereço  ->  { MÉTODO HTTP: função que responde }
  // O ":id" é uma parte variável do endereço (ex.: /api/emprestimos/7).
  routes: {
    "/api/exemplares": { GET: exemplares.listar },

    "/api/emprestimos": { GET: emprestimos.listar, POST: emprestimos.criar },
    "/api/emprestimos/:id": { GET: emprestimos.buscar },
    "/api/emprestimos/:id/devolucao": { PUT: emprestimos.devolver },

    // Documentação interativa (Scalar). Abra /api/docs no navegador.
    "/api/openapi.json": { GET: documentacao.openapi },
    "/api/docs": { GET: documentacao.paginaDocumentacao },
  },

  // Chamado quando o endereço pedido não existe no mapa acima.
  fetch() {
    return erro("Rota não encontrada.", 404);
  },

  // Chamado quando alguma rota "quebra" (lança um erro).
  // Assim a API nunca cai: ela responde com uma mensagem amigável.
  error(problema) {
    console.error(problema);
    return erro(traduzirErroDoBanco(problema.message));
  },
});

console.log(`✅ API rodando em http://localhost:${PORTA}/api`);
console.log(`📖 Documentação em http://localhost:${PORTA}/api/docs`);
