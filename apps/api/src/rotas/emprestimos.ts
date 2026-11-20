/*
 * ROTAS DE EMPRÉSTIMOS  ->  /api/emprestimos
 * ------------------------------------------
 *   GET  /api/emprestimos                  -> lista (filtro opcional ?situacao=aberto|devolvido)
 *   GET  /api/emprestimos/:id              -> um empréstimo
 *   POST /api/emprestimos                  -> registra uma RETIRADA
 *   PUT  /api/emprestimos/:id/devolucao    -> registra a DEVOLUÇÃO
 *
 * A situação (aberto/devolvido) NÃO vem do formulário:
 * ela é CALCULADA pela API, usando a regra de src/regras/emprestimos.ts.
 */
import type { BunRequest } from "bun";
import type { Emprestimo, EmprestimoDetalhado, NovaDevolucao, NovoEmprestimo } from "@biblioteca/tipos";
import { banco } from "../banco/conexao";
import { SITUACOES, calcularSituacao, dataValida, devolucaoEhValida, formatarData } from "../regras/emprestimos";
import { erro, lerCorpo, verificarObrigatorios } from "./ajudantes";

// JOIN = "junte com outra tabela". Assim trazemos, junto do empréstimo,
// o código, o título e o autor do exemplar (para mostrar na tela).
const SQL_EMPRESTIMOS_COM_EXEMPLAR = `
  SELECT
    e.*,
    x.codigo AS exemplar_codigo,
    x.titulo AS exemplar_titulo,
    x.autor  AS exemplar_autor
  FROM emprestimos e
  JOIN exemplares x ON x.id = e.exemplar_id
`;

// Uma linha do banco ainda não tem a "situacao": acrescentamos aqui.
type LinhaDoBanco = Omit<EmprestimoDetalhado, "situacao">;

function comSituacao(linha: LinhaDoBanco): EmprestimoDetalhado {
  return { ...linha, situacao: calcularSituacao(linha.data_devolucao) };
}

function buscarPorId(id: number | string) {
  const linha = banco.query(SQL_EMPRESTIMOS_COM_EXEMPLAR + " WHERE e.id = ?").get(id) as LinhaDoBanco | null;
  return linha ? comSituacao(linha) : null;
}

// ------------------------------------------------------------------
// GET /api/emprestimos
// Aceita o filtro opcional na URL:
//   /api/emprestimos?situacao=aberto     -> só os que ainda não voltaram
//   /api/emprestimos?situacao=devolvido  -> só os que já voltaram
// ------------------------------------------------------------------
export function listar(req: BunRequest) {
  const url = new URL(req.url);
  const situacao = url.searchParams.get("situacao");

  let sql = SQL_EMPRESTIMOS_COM_EXEMPLAR;

  if (situacao) {
    // "includes" confere se o texto está na lista de situações permitidas.
    if (!SITUACOES.includes(situacao as never)) {
      return erro('Situação inválida. Use "aberto" ou "devolvido".');
    }
    // Aberto = sem data de devolução. Devolvido = com data de devolução.
    if (situacao === "aberto") {
      sql = sql + " WHERE e.data_devolucao IS NULL";
    } else {
      sql = sql + " WHERE e.data_devolucao IS NOT NULL";
    }
  }

  // Os mais recentes primeiro.
  sql = sql + " ORDER BY e.data_retirada DESC, e.id DESC";

  const linhas = banco.query(sql).all() as LinhaDoBanco[];
  return Response.json(linhas.map(comSituacao));
}

// ------------------------------------------------------------------
// GET /api/emprestimos/:id
// ------------------------------------------------------------------
export function buscar(req: BunRequest<"/api/emprestimos/:id">) {
  const emprestimo = buscarPorId(req.params.id);

  if (!emprestimo) {
    return erro("Empréstimo não encontrado.", 404);
  }
  return Response.json(emprestimo);
}

// ------------------------------------------------------------------
// POST /api/emprestimos  (registrar uma RETIRADA)
// Corpo: { "exemplar_id": 1, "nome_leitor": "Ana", "data_retirada": "2026-11-19" }
// ------------------------------------------------------------------
export async function criar(req: BunRequest) {
  const dados = (await lerCorpo(req)) as NovoEmprestimo | null;
  if (!dados) {
    return erro("Envie os dados do empréstimo em formato JSON.");
  }

  // 1. Campos preenchidos?
  const problema = verificarObrigatorios(dados, ["exemplar_id", "nome_leitor", "data_retirada"]);
  if (problema) {
    return erro(problema);
  }

  // 2. Data num formato que o banco entende?
  if (!dataValida(dados.data_retirada)) {
    return erro("Data de retirada inválida. Use o formato AAAA-MM-DD.");
  }

  // 3. O exemplar existe?
  const exemplar = banco.query("SELECT id, codigo FROM exemplares WHERE id = ?").get(dados.exemplar_id) as
    | { id: number; codigo: string }
    | null;
  if (!exemplar) {
    return erro("Exemplar não encontrado.", 404);
  }

  // 4. REGRA: o exemplar já tem um empréstimo em aberto?
  const emAberto = banco
    .query("SELECT nome_leitor, data_retirada FROM emprestimos WHERE exemplar_id = ? AND data_devolucao IS NULL")
    .get(exemplar.id) as Pick<Emprestimo, "nome_leitor" | "data_retirada"> | null;
  if (emAberto) {
    return erro(
      `O exemplar ${exemplar.codigo} já está emprestado para ${emAberto.nome_leitor} ` +
        `desde ${formatarData(emAberto.data_retirada)}. Registre a devolução antes de emprestar de novo.`,
      409
    );
  }

  // Tudo certo: gravamos. O "?" é trocado pelos valores com segurança
  // (nunca juntamos os valores direto no texto do SQL).
  const resultado = banco
    .query("INSERT INTO emprestimos (exemplar_id, nome_leitor, data_retirada) VALUES (?, ?, ?)")
    .run(exemplar.id, String(dados.nome_leitor).trim(), dados.data_retirada);

  return Response.json(buscarPorId(Number(resultado.lastInsertRowid)), { status: 201 });
}

// ------------------------------------------------------------------
// PUT /api/emprestimos/:id/devolucao  (registrar a DEVOLUÇÃO)
// Corpo: { "data_devolucao": "2026-11-20" }
// ------------------------------------------------------------------
export async function devolver(req: BunRequest<"/api/emprestimos/:id/devolucao">) {
  const dados = (await lerCorpo(req)) as NovaDevolucao | null;
  if (!dados) {
    return erro("Envie a data de devolução em formato JSON.");
  }

  // 1. Campo preenchido e com data válida?
  const problema = verificarObrigatorios(dados, ["data_devolucao"]);
  if (problema) {
    return erro(problema);
  }
  if (!dataValida(dados.data_devolucao)) {
    return erro("Data de devolução inválida. Use o formato AAAA-MM-DD.");
  }

  // 2. O empréstimo existe?
  const emprestimo = buscarPorId(req.params.id);
  if (!emprestimo) {
    return erro("Empréstimo não encontrado.", 404);
  }

  // 3. Já foi devolvido antes?
  if (emprestimo.situacao === "devolvido") {
    return erro(`Este empréstimo já foi devolvido em ${formatarData(emprestimo.data_devolucao!)}.`, 409);
  }

  // 4. REGRA: devolução igual ou depois da retirada.
  if (!devolucaoEhValida(emprestimo.data_retirada, dados.data_devolucao)) {
    return erro(
      `A data de devolução deve ser igual ou posterior à retirada (${formatarData(emprestimo.data_retirada)}).`
    );
  }

  banco.query("UPDATE emprestimos SET data_devolucao = ? WHERE id = ?").run(dados.data_devolucao, emprestimo.id);

  return Response.json(buscarPorId(emprestimo.id));
}
