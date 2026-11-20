/*
 * ROTAS DE EXEMPLARES  ->  /api/exemplares
 * ----------------------------------------
 * Os exemplares (livros) vêm dos dados de exemplo (banco/popular.ts).
 * Por isso aqui só existe a LISTAGEM: o enunciado permite que os dados
 * auxiliares do formulário venham de um conjunto fictício já no banco.
 *
 * Junto de cada exemplar, a API diz se ele está DISPONÍVEL,
 * ou seja, se não tem nenhum empréstimo em aberto.
 */
import type { BunRequest } from "bun";
import type { ExemplarComSituacao } from "@biblioteca/tipos";
import { banco } from "../banco/conexao";

// NOT EXISTS = "não existe nenhuma linha que...".
// Para cada exemplar, procuramos um empréstimo dele ainda sem devolução.
// Se não existir nenhum, o exemplar está disponível (1); senão, não está (0).
const SQL_EXEMPLARES = `
  SELECT
    x.*,
    NOT EXISTS (
      SELECT 1 FROM emprestimos e
      WHERE e.exemplar_id = x.id AND e.data_devolucao IS NULL
    ) AS disponivel
  FROM exemplares x
  ORDER BY x.codigo
`;

// O SQLite não tem o tipo "verdadeiro/falso": ele devolve 1 ou 0.
// Aqui convertemos para true/false, que é o que o tipo ExemplarComSituacao pede.
type LinhaDoBanco = Omit<ExemplarComSituacao, "disponivel"> & { disponivel: number };

// GET /api/exemplares
export function listar(_req: BunRequest) {
  const linhas = banco.query(SQL_EXEMPLARES).all() as LinhaDoBanco[];

  const exemplares: ExemplarComSituacao[] = linhas.map((linha) => ({
    ...linha,
    disponivel: linha.disponivel === 1,
  }));

  return Response.json(exemplares);
}
