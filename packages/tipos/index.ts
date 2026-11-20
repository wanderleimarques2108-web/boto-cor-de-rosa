/*
 * TIPOS COMPARTILHADOS
 * --------------------
 * Este arquivo descreve o "formato" de cada informação do sistema.
 * Ele é usado TANTO pela API quanto pelo site (web).
 *
 * Pense em um "type" como um formulário em branco: ele diz quais campos
 * existem e que tipo de valor cada campo aceita (texto, número...).
 *
 * Por que deixar aqui, num pacote separado?
 * Porque assim, se mudarmos um campo, a API e o site enxergam a mudança
 * ao mesmo tempo. Essa é uma das grandes vantagens de um monorepo.
 */

// ------------------------------------------------------------------
// Exemplar (um livro físico da biblioteca)
// ------------------------------------------------------------------
export type Exemplar = {
  id: number;
  codigo: string; // código único escrito na etiqueta do livro, ex.: "B001"
  titulo: string;
  autor: string;
};

// Quando listamos os exemplares, a API também diz se cada um está
// disponível (sem empréstimo em aberto) ou não.
// O "&" junta dois tipos em um só.
export type ExemplarComSituacao = Exemplar & {
  disponivel: boolean;
};

// ------------------------------------------------------------------
// Empréstimo (a retirada de um exemplar por uma pessoa)
// ------------------------------------------------------------------

// A situação só pode ser um destes dois textos (e nenhum outro).
// Ela NÃO é guardada no banco: a API calcula a partir da data de devolução.
export type SituacaoEmprestimo = "aberto" | "devolvido";

export type Emprestimo = {
  id: number;
  exemplar_id: number;
  nome_leitor: string; // nome fictício de quem retirou o livro
  data_retirada: string; // formato "AAAA-MM-DD", ex.: "2026-11-19"
  data_devolucao: string | null; // null = o livro ainda não voltou
};

// Na listagem, a API devolve também o código, o título e o autor do
// exemplar (para mostrar na tela) e a situação calculada.
export type EmprestimoDetalhado = Emprestimo & {
  exemplar_codigo: string;
  exemplar_titulo: string;
  exemplar_autor: string;
  situacao: SituacaoEmprestimo;
};

// ------------------------------------------------------------------
// Dados que o formulário envia
// Omit<Tipo, "campo"> = "o mesmo Tipo, mas sem esse campo".
// ------------------------------------------------------------------

// Retirada: o banco cria o id, e a devolução ainda não existe.
export type NovoEmprestimo = Omit<Emprestimo, "id" | "data_devolucao">;

// Devolução: só precisamos da data em que o livro voltou.
export type NovaDevolucao = {
  data_devolucao: string;
};
