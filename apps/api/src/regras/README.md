# 📏 apps/api/src/regras: regras de negócio

**Regra de negócio** é uma regra que vem do **mundo real** (da biblioteca), e não da programação.

| Arquivo | O que tem |
| --- | --- |
| [emprestimos.ts](emprestimos.ts) | `calcularSituacao`, `dataValida`, `devolucaoEhValida`, `formatarData` e a lista `SITUACOES` |

## As regras

```
Um exemplar só pode ter UM empréstimo em aberto por vez.     (enunciado)
Devolução igual ou depois da retirada:  devolução >= retirada (enunciado)
Sem data de devolução → "aberto"; com data → "devolvido"     (decisão do grupo)
```

Repare que estas funções **não sabem nada** de banco de dados nem de HTTP: só recebem valores
e devolvem uma resposta. Isso as deixa fáceis de entender, de mudar e de testar.

A regra "um empréstimo aberto por exemplar" precisa consultar o banco, por isso a consulta fica
na rota ([rotas/emprestimos.ts](../rotas/emprestimos.ts), função `criar`, passo 4).

## Quem usa estas regras?

- [rotas/emprestimos.ts](../rotas/emprestimos.ts): na listagem (situação e filtro), na retirada e na devolução.
