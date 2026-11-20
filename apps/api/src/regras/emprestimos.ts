/*
 * REGRAS DE EMPRÉSTIMOS
 * ---------------------
 * "Regra de negócio" é uma regra que vem do mundo real (da biblioteca),
 * e não da programação. Deixamos ela isolada aqui para ficar fácil de
 * encontrar e de mudar.
 *
 * Regras do enunciado:
 *   1. Um exemplar pode ter apenas UM empréstimo em aberto por vez.
 *   2. A data de devolução deve ser IGUAL ou POSTERIOR à de retirada.
 *
 * Regra adotada pelo grupo:
 *   3. A situação NÃO é digitada: sem data de devolução = "aberto";
 *      com data de devolução = "devolvido".
 *
 * Repare que estas funções não sabem nada de banco de dados nem de HTTP:
 * só recebem valores e devolvem uma resposta. Quem consulta o banco e
 * responde ao site são as rotas (rotas/emprestimos.ts).
 */
import type { SituacaoEmprestimo } from "@biblioteca/tipos";

// As únicas situações que o filtro aceita.
export const SITUACOES: SituacaoEmprestimo[] = ["aberto", "devolvido"];

// Regra 3: a situação é calculada a partir da data de devolução.
export function calcularSituacao(dataDevolucao: string | null): SituacaoEmprestimo {
  if (dataDevolucao === null) {
    return "aberto";
  }
  return "devolvido";
}

// Confere se o texto é uma data de verdade no formato "AAAA-MM-DD".
//   "2026-11-19" -> true
//   "19/11/2026" -> false (formato errado)
//   "2026-02-30" -> false (30 de fevereiro não existe)
export function dataValida(texto: string) {
  // Expressão regular: 4 dígitos, hífen, 2 dígitos, hífen, 2 dígitos.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false;
  }
  // Se a data não existe, o JavaScript "ajusta" (30/02 vira 02/03).
  // Então convertemos e conferimos se continua sendo o mesmo texto.
  const data = new Date(texto + "T00:00:00Z");
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === texto;
}

// Regra 2: devolução igual ou depois da retirada.
// Como as datas estão no formato "AAAA-MM-DD", comparar os textos
// dá o mesmo resultado que comparar as datas.
export function devolucaoEhValida(dataRetirada: string, dataDevolucao: string) {
  return dataDevolucao >= dataRetirada;
}

// "2026-11-19" -> "19/11/2026" (para as mensagens que aparecem na tela)
export function formatarData(texto: string) {
  const [ano, mes, dia] = texto.split("-");
  return `${dia}/${mes}/${ano}`;
}
