# 📁 apps/: os programas

Aqui ficam os **programas que rodam**, aqueles que você liga com `bun run dev`.

| Pasta | O que é | Porta |
| --- | --- | --- |
| [api/](api/README.md) | O **servidor**: recebe pedidos, consulta o banco e devolve JSON | 3333 |
| [web/](web/README.md) | O **site**: as telas que o usuário vê no navegador | 5173 |

## Como os dois conversam?

```
 navegador ──► web (5173) ──/api/...──► api (3333) ──► biblioteca.sqlite
```

O site **nunca** acessa o banco diretamente. Ele sempre pede à API, e é a API que confere
as regras (um empréstimo aberto por exemplar, devolução depois da retirada) antes de gravar.
