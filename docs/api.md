# API: rotas, exemplos de requisição e resposta

A API roda em **http://localhost:3333**. Todas as respostas são em **JSON**.
Quando algo dá errado, a resposta tem sempre o formato:

```json
{ "erro": "mensagem explicando o problema" }
```

A documentação interativa (Scalar) fica em **http://localhost:3333/api/docs**: dá para testar
cada rota pelo botão **Test Request**. Ela é gerada a partir de
[apps/api/src/documentacao/openapi.ts](../apps/api/src/documentacao/openapi.ts).

## Resumo das rotas

| Método | Endereço | O que faz | Arquivo |
| --- | --- | --- | --- |
| GET | `/api/exemplares` | Lista os exemplares e se cada um está disponível | [rotas/exemplares.ts](../apps/api/src/rotas/exemplares.ts) |
| GET | `/api/emprestimos` | Lista os empréstimos (filtro opcional `?situacao=`) | [rotas/emprestimos.ts](../apps/api/src/rotas/emprestimos.ts) |
| GET | `/api/emprestimos/:id` | Busca um empréstimo | rotas/emprestimos.ts |
| POST | `/api/emprestimos` | Registra uma **retirada** | rotas/emprestimos.ts |
| PUT | `/api/emprestimos/:id/devolucao` | Registra a **devolução** | rotas/emprestimos.ts |
| GET | `/api/docs` e `/api/openapi.json` | Documentação (Scalar) | [rotas/documentacao.ts](../apps/api/src/rotas/documentacao.ts) |

## Códigos de status usados

| Status | Significado | Quando acontece |
| --- | --- | --- |
| **200** | OK | Consulta ou devolução deu certo |
| **201** | Criado | Retirada registrada |
| **400** | Pedido com problema | Campo vazio, data inválida, devolução antes da retirada, filtro inválido |
| **404** | Não encontrado | Exemplar ou empréstimo que não existe, ou rota que não existe |
| **409** | Conflito | Exemplar já emprestado; empréstimo já devolvido |

---

## GET /api/exemplares

Lista todos os exemplares em ordem de código. O campo `disponivel` é calculado pela API:
`true` quando o exemplar **não tem** empréstimo em aberto.

```bash
curl http://localhost:3333/api/exemplares
```

**Resposta 200**

```json
[
  { "id": 1, "codigo": "B001", "titulo": "Lógica de Programação", "autor": "André Luiz Villar Forbellone", "disponivel": true },
  { "id": 2, "codigo": "B002", "titulo": "Lógica de Programação", "autor": "André Luiz Villar Forbellone", "disponivel": false }
]
```

---

## GET /api/emprestimos

Lista os empréstimos, dos mais recentes para os mais antigos, com o código, o título e o autor
do exemplar. A `situacao` é calculada pela API: sem `data_devolucao` = `"aberto"`.

| Filtro (opcional) | Resultado |
| --- | --- |
| *(sem filtro)* | Todos os empréstimos |
| `?situacao=aberto` | Só os que ainda não voltaram |
| `?situacao=devolvido` | Só os que já voltaram |

```bash
curl "http://localhost:3333/api/emprestimos?situacao=aberto"
```

**Resposta 200**

```json
[
  {
    "id": 261,
    "exemplar_id": 43,
    "nome_leitor": "Rodrigo Brito",
    "data_retirada": "2026-11-19",
    "data_devolucao": null,
    "exemplar_codigo": "B043",
    "exemplar_titulo": "Inteligência Artificial",
    "exemplar_autor": "Stuart Russell e Peter Norvig",
    "situacao": "aberto"
  }
]
```

**Resposta 400** (filtro inválido, ex.: `?situacao=perdido`)

```json
{ "erro": "Situação inválida. Use \"aberto\" ou \"devolvido\"." }
```

---

## GET /api/emprestimos/:id

```bash
curl http://localhost:3333/api/emprestimos/1
```

**Resposta 200**: o empréstimo, no mesmo formato da listagem.
**Resposta 404**: `{ "erro": "Empréstimo não encontrado." }`

---

## POST /api/emprestimos (registrar retirada)

**Corpo do pedido**

| Campo | Tipo | Obrigatório | Exemplo |
| --- | --- | --- | --- |
| `exemplar_id` | número | sim | `1` |
| `nome_leitor` | texto | sim | `"Ana Souza"` |
| `data_retirada` | texto `AAAA-MM-DD` | sim | `"2026-11-19"` |

```bash
curl -X POST http://localhost:3333/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"exemplar_id": 1, "nome_leitor": "Ana Souza", "data_retirada": "2026-11-19"}'
```

No PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3333/api/emprestimos `
  -ContentType "application/json" `
  -Body '{"exemplar_id": 1, "nome_leitor": "Ana Souza", "data_retirada": "2026-11-19"}'
```

**Resposta 201** (empréstimo criado, em aberto)

```json
{
  "id": 262,
  "exemplar_id": 1,
  "nome_leitor": "Ana Souza",
  "data_retirada": "2026-11-19",
  "data_devolucao": null,
  "exemplar_codigo": "B001",
  "exemplar_titulo": "Lógica de Programação",
  "exemplar_autor": "André Luiz Villar Forbellone",
  "situacao": "aberto"
}
```

**Respostas de erro**

| Status | Quando | Exemplo de `erro` |
| --- | --- | --- |
| 400 | Campo vazio | `O campo "nome_leitor" é obrigatório.` |
| 400 | Data inválida (ex.: `2026-02-30`) | `Data de retirada inválida. Use o formato AAAA-MM-DD.` |
| 404 | Exemplar não existe | `Exemplar não encontrado.` |
| **409** | **Exemplar já tem empréstimo em aberto** | `O exemplar B001 já está emprestado para Ana Souza desde 19/11/2026. Registre a devolução antes de emprestar de novo.` |

---

## PUT /api/emprestimos/:id/devolucao (registrar devolução)

**Corpo do pedido**

| Campo | Tipo | Obrigatório | Exemplo |
| --- | --- | --- | --- |
| `data_devolucao` | texto `AAAA-MM-DD` | sim | `"2026-11-20"` |

```bash
curl -X PUT http://localhost:3333/api/emprestimos/262/devolucao \
  -H "Content-Type: application/json" \
  -d '{"data_devolucao": "2026-11-20"}'
```

**Resposta 200**: o empréstimo, agora com `"data_devolucao": "2026-11-20"` e `"situacao": "devolvido"`.

**Respostas de erro**

| Status | Quando | Exemplo de `erro` |
| --- | --- | --- |
| 400 | **Devolução antes da retirada** | `A data de devolução deve ser igual ou posterior à retirada (19/11/2026).` |
| 400 | Data inválida | `Data de devolução inválida. Use o formato AAAA-MM-DD.` |
| 404 | Empréstimo não existe | `Empréstimo não encontrado.` |
| 409 | Já foi devolvido | `Este empréstimo já foi devolvido em 19/11/2026.` |
