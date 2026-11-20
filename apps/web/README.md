# 🖥️ apps/web: o site

As telas que o usuário vê no navegador, feitas com **React**, **Vite**, **Tailwind CSS** e
componentes do **shadcn/ui**. O visual é o mesmo do modelo da aula.

## Estrutura

```
web/
├── src/
│   ├── main.tsx           ← primeiro arquivo: desenha o React na página
│   ├── App.tsx            ← qual página aparece em cada endereço
│   ├── index.css          ← Tailwind e cores do tema
│   ├── components/        ← peças reaproveitadas (Layout, CabecalhoPagina, Campo, SeloSituacao)
│   │   └── ui/            ← componentes do shadcn (botão, tabela, janela, select...)
│   ├── paginas/
│   │   ├── emprestimos/   ← tela principal: lista, filtro, retirada e devolução
│   │   └── exemplares/    ← lista dos livros e se estão disponíveis
│   ├── servicos/api.ts    ← o ÚNICO arquivo que conversa com a API
│   └── lib/               ← funções de data e utilitários
├── index.html
└── vite.config.ts         ← porta 5173 e proxy /api → 3333
```

## As telas

| Endereço | Tela | O que tem |
| --- | --- | --- |
| `/` | **Empréstimos** | Lista com o título do livro, busca, filtro em aberto/devolvido, **Nova retirada** e **Registrar devolução** |
| `/exemplares` | **Exemplares** | Os 43 livros, com busca e a situação disponível/emprestado |

## Mensagens para o usuário

| Caso | O que aparece |
| --- | --- |
| Sucesso | Aviso verde (sonner), ex.: "Retirada registrada: B001 com Ana Souza." |
| Erro da API | Aviso vermelho com a mensagem da API, ex.: "O exemplar B001 já está emprestado..." |
| API desligada | Aviso vermelho: "Não foi possível falar com a API. Confira se ela está ligada." |
| Lista vazia | "Nenhum empréstimo em aberto.", "Nenhum empréstimo devolvido." etc. |

Os avisos de erro são mostrados por `requisicao`, em [src/servicos/api.ts](src/servicos/api.ts).
