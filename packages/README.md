# 📦 packages/: código compartilhado

Aqui fica o código que **não roda sozinho**, só é **usado** pelos programas de `apps/`.

| Pasta | O que é |
| --- | --- |
| [tipos/](tipos/README.md) | O formato de cada dado (`Exemplar`, `Emprestimo`...), usado pela API e pelo site |

Os programas usam este pacote pelo nome `@biblioteca/tipos`, por exemplo:

```ts
import type { Emprestimo } from "@biblioteca/tipos";
```

Isso funciona porque o `package.json` da raiz declara `"workspaces": ["apps/*", "packages/*"]`:
o Bun liga os pacotes entre si quando rodamos `bun install`.
