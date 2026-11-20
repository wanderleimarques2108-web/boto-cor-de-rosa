# 🍳 apps/api: o servidor

A API recebe os pedidos do site, confere as regras, busca ou grava no banco e devolve
a resposta em **JSON**. Ela **não tem telas**.

Feita com **Bun** (`Bun.serve` e `bun:sqlite`), **SQLite** e **nenhum framework**, como no modelo da aula.

## Estrutura

```
api/
├── src/
│   ├── index.ts          ← liga o servidor e lista as rotas (o "cardápio")
│   ├── banco/            ← conexão, tabelas e dados de exemplo
│   ├── rotas/            ← o que cada endereço faz
│   ├── regras/           ← regras de negócio dos empréstimos
│   └── documentacao/     ← descrição da API (OpenAPI) para o Scalar
├── biblioteca.sqlite     ← o banco (criado sozinho; não vai para o Git)
├── package.json          ← nome, scripts e dependências da API
└── tsconfig.json         ← configuração do TypeScript
```

## Comandos

Rode da **raiz** do monorepo:

| Comando | O que faz |
| --- | --- |
| `bun run dev:api` | Liga a API e **reinicia sozinha** quando você salva um arquivo |
| `bun run banco:popular` | Apaga tudo e coloca os dados de exemplo |

## Testando no navegador

Com a API ligada, abra:

- http://localhost:3333/api/docs: documentação interativa (Scalar), com o botão *Test Request*.
- http://localhost:3333/api/exemplares
- http://localhost:3333/api/emprestimos?situacao=aberto

Veja todas as rotas, com exemplos, em [docs/api.md](../../docs/api.md).

## Por onde começar a ler o código?

1. [src/index.ts](src/index.ts): o mapa de rotas.
2. [src/rotas/emprestimos.ts](src/rotas/emprestimos.ts): retirada, devolução e filtro.
3. [src/regras/emprestimos.ts](src/regras/emprestimos.ts): as regras do enunciado.
4. [src/banco/criar-tabelas.ts](src/banco/criar-tabelas.ts): as tabelas e as restrições.
