# Banco de dados: tabelas, relacionamento e restrições

O banco é **SQLite**: fica inteiro em **um arquivo**, `apps/api/biblioteca.sqlite`.
Como os dados ficam gravados nesse arquivo, eles **continuam lá depois de reiniciar o servidor**.

As tabelas são criadas por [apps/api/src/banco/criar-tabelas.ts](../apps/api/src/banco/criar-tabelas.ts)
toda vez que a API liga (`CREATE TABLE IF NOT EXISTS`: se já existe, nada acontece).
Os dados de exemplo vêm de [apps/api/src/banco/popular.ts](../apps/api/src/banco/popular.ts).

## Diagrama

```
┌──────────────────────────────┐             ┌──────────────────────────────────────┐
│ exemplares                   │             │ emprestimos                          │
├──────────────────────────────┤  1       N  ├──────────────────────────────────────┤
│ id      INTEGER  PK          │◄────────────│ exemplar_id     INTEGER  FK          │
│ codigo  TEXT     UNIQUE      │             │ id              INTEGER  PK          │
│ titulo  TEXT                 │             │ nome_leitor     TEXT                 │
│ autor   TEXT                 │             │ data_retirada   TEXT  (AAAA-MM-DD)   │
└──────────────────────────────┘             │ data_devolucao  TEXT  ou NULL        │
                                             └──────────────────────────────────────┘
```

**Relacionamento 1 para N:** um exemplar pode ter **vários** empréstimos ao longo do tempo
(o histórico), mas cada empréstimo é de **um** exemplar só.

## Tabela `exemplares`

| Coluna | Tipo | Restrição | Significado |
| --- | --- | --- | --- |
| `id` | INTEGER | `PRIMARY KEY AUTOINCREMENT` | Número criado pelo banco |
| `codigo` | TEXT | `NOT NULL UNIQUE` | Código da etiqueta (ex.: `B001`). Não pode repetir |
| `titulo` | TEXT | `NOT NULL` | Título do livro |
| `autor` | TEXT | `NOT NULL` | Autor do livro |

## Tabela `emprestimos`

| Coluna | Tipo | Restrição | Significado |
| --- | --- | --- | --- |
| `id` | INTEGER | `PRIMARY KEY AUTOINCREMENT` | Número criado pelo banco |
| `exemplar_id` | INTEGER | `NOT NULL REFERENCES exemplares(id)` | Qual exemplar foi emprestado (chave estrangeira) |
| `nome_leitor` | TEXT | `NOT NULL` | Nome fictício de quem retirou |
| `data_retirada` | TEXT | `NOT NULL` | Data da retirada, `AAAA-MM-DD` |
| `data_devolucao` | TEXT | pode ser `NULL` | Data da devolução. `NULL` = o livro ainda não voltou |

## As regras dentro do banco

### 1. Um exemplar, um empréstimo em aberto

```sql
CREATE UNIQUE INDEX um_emprestimo_aberto_por_exemplar
ON emprestimos (exemplar_id)
WHERE data_devolucao IS NULL;
```

É um **índice único parcial**: o `UNIQUE` só vale para as linhas do `WHERE`, ou seja, para os
empréstimos **ainda não devolvidos**.

| Situação | Resultado |
| --- | --- |
| B001 em aberto + novo B001 em aberto | ❌ recusado (repetiria o `exemplar_id` no índice) |
| B001 devolvido + novo B001 em aberto | ✅ aceito (o devolvido não entra no índice) |

### 2. Devolução igual ou depois da retirada

```sql
CHECK (data_devolucao IS NULL OR data_devolucao >= data_retirada)
```

As datas são texto no formato `AAAA-MM-DD`. Nesse formato, comparar os textos dá o mesmo resultado
que comparar as datas: `"2026-11-20" >= "2026-11-19"` é verdadeiro.

### 3. O exemplar precisa existir

`REFERENCES exemplares(id)` é a **chave estrangeira**. No SQLite ela só funciona com
`PRAGMA foreign_keys = ON`, que ligamos em [conexao.ts](../apps/api/src/banco/conexao.ts).

## Por que conferir na API **e** no banco?

A API confere as regras **antes** de gravar (em [rotas/emprestimos.ts](../apps/api/src/rotas/emprestimos.ts))
para devolver uma **mensagem clara** para a tela, como *"O exemplar B001 já está emprestado para Ana..."*.
As restrições do banco são a **última barreira**: mesmo que alguém grave direto no banco, ou que
dois pedidos cheguem ao mesmo tempo, o dado errado não entra.

## A situação não é guardada

Não existe coluna `situacao`. A API calcula:

```
data_devolucao vazia (NULL)  →  "aberto"
data_devolucao preenchida    →  "devolvido"
```

Assim é impossível existir um empréstimo "devolvido" sem data, ou "aberto" com data.

## Consultas usadas

**Empréstimos com o título do livro** (`JOIN` junta as duas tabelas):

```sql
SELECT e.*, x.codigo AS exemplar_codigo, x.titulo AS exemplar_titulo, x.autor AS exemplar_autor
FROM emprestimos e
JOIN exemplares x ON x.id = e.exemplar_id
WHERE e.data_devolucao IS NULL          -- só quando o filtro é "aberto"
ORDER BY e.data_retirada DESC, e.id DESC;
```

**Exemplares com a disponibilidade** (`NOT EXISTS` = "não existe nenhum empréstimo aberto dele"):

```sql
SELECT x.*,
  NOT EXISTS (
    SELECT 1 FROM emprestimos e
    WHERE e.exemplar_id = x.id AND e.data_devolucao IS NULL
  ) AS disponivel
FROM exemplares x
ORDER BY x.codigo;
```

Todas as consultas usam `?` para os valores (SQL **parametrizado**). Os valores nunca são colados
no texto do SQL, o que evita erros e ataques de *SQL injection*.

## Zerar o banco

Rode `bun run banco:popular` (apaga e recria os dados de exemplo) ou apague o arquivo
`apps/api/biblioteca.sqlite` (a API cria um banco vazio quando ligar).
