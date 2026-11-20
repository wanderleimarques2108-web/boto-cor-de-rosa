# 🛣️ apps/api/src/rotas: o que cada endereço faz

Cada arquivo responde a um grupo de endereços. O mapa que liga endereço → função fica em
[../index.ts](../index.ts).

| Arquivo | Endereços |
| --- | --- |
| [exemplares.ts](exemplares.ts) | `GET /api/exemplares` (com a disponibilidade de cada um) |
| [emprestimos.ts](emprestimos.ts) | `GET /api/emprestimos`, `GET /api/emprestimos/:id`, `POST /api/emprestimos`, `PUT /api/emprestimos/:id/devolucao` |
| [documentacao.ts](documentacao.ts) | `GET /api/openapi.json` e `GET /api/docs` (Scalar) |
| [ajudantes.ts](ajudantes.ts) | Funções usadas por todas: `erro`, `verificarObrigatorios`, `lerCorpo`, `traduzirErroDoBanco` |

## O caminho de uma retirada (`POST /api/emprestimos`)

A função `criar` confere, nesta ordem, e para no primeiro problema:

| Passo | Pergunta | Se falhar |
| --- | --- | --- |
| 1 | Os campos vieram preenchidos? | 400 |
| 2 | A data está no formato `AAAA-MM-DD` e existe? | 400 |
| 3 | O exemplar existe? | 404 |
| 4 | O exemplar já tem empréstimo em aberto? | **409** |

Passou em tudo? Grava com `INSERT` e devolve **201** com o empréstimo criado.

## O caminho de uma devolução (`PUT /api/emprestimos/:id/devolucao`)

| Passo | Pergunta | Se falhar |
| --- | --- | --- |
| 1 | A data veio preenchida e é válida? | 400 |
| 2 | O empréstimo existe? | 404 |
| 3 | Ele ainda está em aberto? | 409 |
| 4 | A devolução é no mesmo dia da retirada ou depois? | 400 |

Passou em tudo? Grava a data com `UPDATE` e devolve **200**.
