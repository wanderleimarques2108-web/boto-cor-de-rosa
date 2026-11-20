# 🗄️ apps/api/src/banco: o banco de dados

| Arquivo | O que faz |
| --- | --- |
| [conexao.ts](conexao.ts) | Abre o arquivo `biblioteca.sqlite`, liga as chaves estrangeiras e garante que as tabelas existem |
| [criar-tabelas.ts](criar-tabelas.ts) | O SQL das tabelas `exemplares` e `emprestimos` e das regras do banco |
| [popular.ts](popular.ts) | Apaga tudo e coloca os dados de exemplo (`bun run banco:popular`) |

## Os dados de exemplo

- **43 exemplares** de 27 livros usados nas disciplinas de Ciência da Computação. Alguns livros têm
  mais de uma cópia, e cada cópia tem o seu código (`B001`, `B002`...).
- Um histórico de **cerca de 260 empréstimos**, de agosto a 19/11/2026, com 30 leitores fictícios.
- Os dados são "sorteados" a partir de um número fixo (a **semente**), por isso saem **sempre iguais**
  para todo o grupo.
- O **B001 começa disponível**, porque é o exemplar do teste do enunciado.

As tabelas, o relacionamento e as restrições estão explicados em
[docs/banco-de-dados.md](../../../../docs/banco-de-dados.md).
