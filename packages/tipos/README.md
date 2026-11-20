# 🏷️ packages/tipos: os tipos compartilhados

Este pacote descreve o **formato de cada informação** do sistema. Ele é o "cardápio"
que a API (cozinha) e o site (garçom) consultam para falar a mesma língua.

| Arquivo | O que tem |
| --- | --- |
| [index.ts](index.ts) | Todos os tipos do sistema |
| `package.json` | Dá o nome `@biblioteca/tipos` ao pacote |

## Os tipos

| Tipo | Representa |
| --- | --- |
| `Exemplar` | Uma linha da tabela `exemplares` (código, título, autor) |
| `ExemplarComSituacao` | Exemplar + `disponivel` (true quando não tem empréstimo em aberto) |
| `Emprestimo` | Uma linha da tabela `emprestimos` |
| `EmprestimoDetalhado` | Empréstimo + código, título e autor do exemplar + situação |
| `SituacaoEmprestimo` | `"aberto"` ou `"devolvido"` |
| `NovoEmprestimo` | O que o formulário de retirada envia (sem `id` e sem devolução) |
| `NovaDevolucao` | O que o formulário de devolução envia (só a data) |

## Quem usa?

- **API** (`apps/api/src/rotas/*.ts`): para saber o formato dos dados que chegam.
- **Site** (`apps/web/src/...`): para os estados, as props e as funções de `servicos/api.ts`.

## Uma observação importante

Tipos **só existem enquanto você programa**. Quando o código roda, eles somem.
Por isso o TypeScript **não impede** a API de receber dados errados pela rede.
É por isso que a API ainda confere os campos com `verificarObrigatorios` e as
regras de `regras/emprestimos.ts`.

> Os tipos protegem **você** (o programador) de errar.
> As validações protegem o **sistema** de dados errados.

## Recursos de TypeScript usados aqui

- `|` (ou): `"aberto" | "devolvido"` aceita só um desses dois textos.
- `&` (juntar): `Emprestimo & { situacao: ... }` é um empréstimo com um campo a mais.
- `Omit<>` (tirar campos): `Omit<Emprestimo, "id" | "data_devolucao">`.
- `string | null`: o campo pode ter texto ou estar vazio (`null`).
