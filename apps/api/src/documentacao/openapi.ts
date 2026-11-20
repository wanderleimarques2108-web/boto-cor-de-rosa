/*
 * ESPECIFICAÇÃO OPENAPI
 * ---------------------
 * OpenAPI é um formato padrão (usado no mundo todo) para DESCREVER uma API:
 * quais endereços existem, o que cada um recebe e o que devolve.
 *
 * Este arquivo é só um grande objeto JavaScript com essa descrição.
 * O Scalar lê este objeto e desenha uma página de documentação
 * interativa (dá até para testar a API por lá, no botão "Test Request").
 *
 * Veja o resultado em:  http://localhost:3333/api/docs
 * Veja o objeto "cru":  http://localhost:3333/api/openapi.json
 *
 * ⚠️ IMPORTANTE: este arquivo NÃO controla a API. Ele só a DESCREVE.
 * Se você criar uma rota nova em index.ts, lembre de documentá-la aqui também.
 */

// ------------------------------------------------------------------
// Pedaços reaproveitados em vários lugares
// ------------------------------------------------------------------

// O "id" que aparece no endereço, como em /api/emprestimos/{id}
const PARAMETRO_ID = {
  name: "id",
  in: "path",
  required: true,
  description: "Número que identifica o empréstimo",
  schema: { type: "integer", example: 1 },
};

// Resposta de erro padrão da nossa API: { "erro": "mensagem" }
function respostaDeErro(descricao: string, exemplo: string) {
  return {
    description: descricao,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Erro" },
        example: { erro: exemplo },
      },
    },
  };
}

// Resposta que devolve UM registro de um esquema
function respostaUm(descricao: string, esquema: string) {
  return {
    description: descricao,
    content: { "application/json": { schema: { $ref: "#/components/schemas/" + esquema } } },
  };
}

// Resposta que devolve uma LISTA de registros de um esquema
function respostaLista(descricao: string, esquema: string) {
  return {
    description: descricao,
    content: {
      "application/json": {
        schema: { type: "array", items: { $ref: "#/components/schemas/" + esquema } },
      },
    },
  };
}

// Os dados enviados no corpo do pedido (POST e PUT)
function corpoDoPedido(esquema: string) {
  return {
    required: true,
    content: { "application/json": { schema: { $ref: "#/components/schemas/" + esquema } } },
  };
}

// ------------------------------------------------------------------
// A ESPECIFICAÇÃO COMPLETA
// ------------------------------------------------------------------
export const especificacao = {
  openapi: "3.1.0",

  info: {
    title: "API · Biblioteca Boto Cor de Rosa",
    version: "1.0.0",
    description:
      "API de empréstimos da biblioteca da turma: registra a retirada e a devolução de cada exemplar.\n\n" +
      "Todas as respostas são em **JSON**. Em caso de erro, a resposta tem o formato `{ \"erro\": \"mensagem\" }`.\n\n" +
      "**Regras:** um exemplar só pode ter um empréstimo em aberto por vez, e a data de devolução " +
      "deve ser igual ou posterior à de retirada. A **situação** (`aberto` ou `devolvido`) é calculada " +
      "pela API: sem data de devolução, o empréstimo está em aberto.",
  },

  // Onde a API está rodando (usado pelo botão "Test Request").
  servers: [{ url: "http://localhost:3333", description: "API local" }],

  // Grupos que aparecem no menu lateral da documentação
  tags: [
    { name: "Exemplares", description: "Os livros da biblioteca (dados de exemplo)." },
    { name: "Empréstimos", description: "Retirada, devolução e consulta dos empréstimos." },
  ],

  paths: {
    "/api/exemplares": {
      get: {
        tags: ["Exemplares"],
        summary: "Listar exemplares",
        description: "Devolve todos os exemplares, em ordem de código, dizendo se cada um está disponível.",
        responses: { 200: respostaLista("Lista de exemplares", "ExemplarComSituacao") },
      },
    },

    "/api/emprestimos": {
      get: {
        tags: ["Empréstimos"],
        summary: "Listar empréstimos",
        description: "Os mais recentes primeiro. Use o filtro `situacao` para ver só os abertos ou só os devolvidos.",
        parameters: [
          {
            name: "situacao",
            in: "query",
            required: false,
            description: "Filtra pela situação do empréstimo",
            schema: { type: "string", enum: ["aberto", "devolvido"], example: "aberto" },
          },
        ],
        responses: {
          200: respostaLista("Lista de empréstimos", "EmprestimoDetalhado"),
          400: respostaDeErro("Filtro inválido", 'Situação inválida. Use "aberto" ou "devolvido".'),
        },
      },
      post: {
        tags: ["Empréstimos"],
        summary: "Registrar retirada",
        description: "Cria um empréstimo em aberto. É recusado se o exemplar já tiver um empréstimo em aberto.",
        requestBody: corpoDoPedido("NovoEmprestimo"),
        responses: {
          201: respostaUm("Empréstimo registrado", "EmprestimoDetalhado"),
          400: respostaDeErro("Campo vazio ou data inválida", 'O campo "nome_leitor" é obrigatório.'),
          404: respostaDeErro("Exemplar não existe", "Exemplar não encontrado."),
          409: respostaDeErro(
            "Exemplar já emprestado",
            "O exemplar B001 já está emprestado para Ana Souza desde 19/11/2026. Registre a devolução antes de emprestar de novo."
          ),
        },
      },
    },

    "/api/emprestimos/{id}": {
      parameters: [PARAMETRO_ID],
      get: {
        tags: ["Empréstimos"],
        summary: "Buscar empréstimo",
        responses: {
          200: respostaUm("Empréstimo encontrado", "EmprestimoDetalhado"),
          404: respostaDeErro("Não encontrado", "Empréstimo não encontrado."),
        },
      },
    },

    "/api/emprestimos/{id}/devolucao": {
      parameters: [PARAMETRO_ID],
      put: {
        tags: ["Empréstimos"],
        summary: "Registrar devolução",
        description: "Preenche a data de devolução. A data deve ser igual ou posterior à de retirada.",
        requestBody: corpoDoPedido("NovaDevolucao"),
        responses: {
          200: respostaUm("Devolução registrada", "EmprestimoDetalhado"),
          400: respostaDeErro(
            "Data inválida ou anterior à retirada",
            "A data de devolução deve ser igual ou posterior à retirada (19/11/2026)."
          ),
          404: respostaDeErro("Não encontrado", "Empréstimo não encontrado."),
          409: respostaDeErro("Já devolvido", "Este empréstimo já foi devolvido em 19/11/2026."),
        },
      },
    },
  },

  // ----------------------------------------------------------------
  // ESQUEMAS: o formato de cada dado.
  // São o equivalente, em OpenAPI, aos "type" de packages/tipos.
  // ["string", "null"] = pode ser texto ou null.
  // ----------------------------------------------------------------
  components: {
    schemas: {
      Erro: {
        type: "object",
        properties: { erro: { type: "string", example: 'O campo "nome_leitor" é obrigatório.' } },
      },

      ExemplarComSituacao: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          codigo: { type: "string", example: "B001" },
          titulo: { type: "string", example: "Lógica de Programação" },
          autor: { type: "string", example: "André Luiz Villar Forbellone" },
          disponivel: { type: "boolean", description: "true quando não há empréstimo em aberto", example: true },
        },
      },

      NovoEmprestimo: {
        type: "object",
        required: ["exemplar_id", "nome_leitor", "data_retirada"],
        properties: {
          exemplar_id: { type: "integer", example: 1 },
          nome_leitor: { type: "string", description: "Nome fictício de quem retira", example: "Ana Souza" },
          data_retirada: { type: "string", format: "date", example: "2026-11-19" },
        },
      },

      NovaDevolucao: {
        type: "object",
        required: ["data_devolucao"],
        properties: {
          data_devolucao: { type: "string", format: "date", example: "2026-11-20" },
        },
      },

      EmprestimoDetalhado: {
        type: "object",
        properties: {
          id: { type: "integer", example: 262 },
          exemplar_id: { type: "integer", example: 1 },
          nome_leitor: { type: "string", example: "Ana Souza" },
          data_retirada: { type: "string", format: "date", example: "2026-11-19" },
          data_devolucao: { type: ["string", "null"], format: "date", example: null },
          exemplar_codigo: { type: "string", example: "B001" },
          exemplar_titulo: { type: "string", example: "Lógica de Programação" },
          exemplar_autor: { type: "string", example: "André Luiz Villar Forbellone" },
          situacao: { type: "string", enum: ["aberto", "devolvido"], example: "aberto" },
        },
      },
    },
  },
};
