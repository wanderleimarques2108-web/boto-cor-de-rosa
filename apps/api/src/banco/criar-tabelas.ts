/*
 * CRIAÇÃO DAS TABELAS
 * -------------------
 * Aqui escrevemos o SQL que cria a estrutura do banco.
 * "IF NOT EXISTS" faz o comando ser ignorado se a tabela já existir,
 * por isso podemos rodar este código toda vez que a API liga.
 */
import type { Database } from "bun:sqlite";

export function criarTabelas(banco: Database) {
  // EXEMPLARES: cada livro físico da biblioteca.
  // UNIQUE no código impede dois exemplares com a mesma etiqueta (ex.: dois "B001").
  banco.run(`
    CREATE TABLE IF NOT EXISTS exemplares (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      titulo TEXT NOT NULL,
      autor  TEXT NOT NULL
    )
  `);

  // EMPRÉSTIMOS: cada retirada de um exemplar.
  // REFERENCES = chave estrangeira: o exemplar_id precisa existir em "exemplares".
  // data_devolucao fica NULL (vazia) enquanto o livro não volta.
  // As datas são guardadas como texto no formato "AAAA-MM-DD". Nesse formato,
  // comparar os textos é o mesmo que comparar as datas ("2026-11-20" > "2026-11-19").
  // O CHECK garante a regra do enunciado: devolução igual ou depois da retirada.
  banco.run(`
    CREATE TABLE IF NOT EXISTS emprestimos (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      exemplar_id    INTEGER NOT NULL REFERENCES exemplares(id),
      nome_leitor    TEXT NOT NULL,
      data_retirada  TEXT NOT NULL,
      data_devolucao TEXT,
      CHECK (data_devolucao IS NULL OR data_devolucao >= data_retirada)
    )
  `);

  // REGRA "um exemplar só pode ter UM empréstimo em aberto por vez".
  // É um índice ÚNICO PARCIAL: o UNIQUE só vale para as linhas do WHERE,
  // ou seja, para os empréstimos ainda não devolvidos.
  //   - B001 aberto + B001 aberto    -> o banco recusa (repetido)
  //   - B001 devolvido + B001 aberto -> permitido (o devolvido fica fora do índice)
  // A API já confere isso antes de gravar (regras/emprestimos.ts); o índice é
  // a "última barreira", caso dois pedidos cheguem ao mesmo tempo.
  banco.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS um_emprestimo_aberto_por_exemplar
    ON emprestimos (exemplar_id)
    WHERE data_devolucao IS NULL
  `);
}
