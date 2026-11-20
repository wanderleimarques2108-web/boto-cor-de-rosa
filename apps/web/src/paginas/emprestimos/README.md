# 📖 paginas/emprestimos: a tela principal

| Arquivo | O que faz |
| --- | --- |
| [PaginaEmprestimos.tsx](PaginaEmprestimos.tsx) | Lista os empréstimos, filtra por situação, busca por texto e abre os formulários |
| [FormularioRetirada.tsx](FormularioRetirada.tsx) | Escolhe o exemplar, o nome de quem retira e a data; envia `POST /api/emprestimos` |
| [FormularioDevolucao.tsx](FormularioDevolucao.tsx) | Pede a data de devolução; envia `PUT /api/emprestimos/:id/devolucao` |

## Dois filtros diferentes

- **Situação** (em aberto / devolvidos): quem filtra é a **API**. Quando o `Select` muda, o
  `useEffect(..., [situacao])` busca de novo `/api/emprestimos?situacao=...`.
- **Busca** (título, código ou leitor): filtra **na tela**, dentro da lista que já chegou.

## Quem decide as regras é a API

- O formulário de retirada mostra **todos** os exemplares, inclusive os emprestados
  (marcados com "emprestado"). Se escolher um emprestado, a API recusa e a tela mostra o motivo.
- O campo de data da devolução não bloqueia datas antigas. Se a data for anterior à retirada,
  a API recusa.

Assim a tela nunca "esconde" a regra: ela é sempre conferida no servidor.

## Depois de salvar

Cada formulário recebe duas funções por **props**:

- `aoSalvar`: a página passa `carregarEmprestimos`, para a lista atualizar;
- `aoFechar`: fecha o formulário.

Se a API recusar, o formulário **continua aberto** para a pessoa corrigir.
