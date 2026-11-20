# 📚 Biblioteca Boto Cor de Rosa: empréstimos da biblioteca

Trabalho em grupo da N2 de **Programação para Sistemas Web**, **Grupo 01 · Boto Cor de Rosa**.

A biblioteca da turma precisa saber **quais exemplares estão disponíveis** e **com quem estão
os exemplares emprestados**. A aplicação registra a **retirada** e a **devolução** de cada exemplar.

O projeto segue o modelo do **Controle Acadêmico** visto em aula: o mesmo monorepo, a mesma
stack e os mesmos padrões de código (tudo em português).

## 👥 Integrantes

- Adam Lucas Smith de Carvalho
- Herton Nascimento Cavalcante
- Igor Haniel Albuquerque Alves
- John Kleverson Barbosa Rosa
- Kaiky de Brito Cinta Larga
- Maggio Henrique Valente Lobo
- Pedro Henrique Albuquerque Lopes
- Pedro Henrique Teixeira Souza de Sá
- Wanderlei Marques Filho

---

## 📏 O que o sistema faz

| Item do enunciado | Onde está |
| --- | --- |
| Cada **exemplar** tem código único, título e autor | Tabela `exemplares` ([banco de dados](docs/banco-de-dados.md)) |
| Cada **empréstimo** guarda o exemplar, o nome fictício de quem retirou, a data de retirada e a data de devolução | Tabela `emprestimos` |
| Registrar uma **retirada** escolhendo um exemplar | Botão **Nova retirada** na tela de Empréstimos |
| **Listar** os empréstimos com o título do livro | Tela de Empréstimos |
| **Filtrar por situação**: em aberto ou devolvido | Seletor "Todas as situações" (a API filtra com `?situacao=`) |
| Ação para **registrar a devolução** | Botão **Registrar devolução** nas linhas em aberto |
| **Regra:** um exemplar só pode ter um empréstimo em aberto por vez | API ([regras](apps/api/src/regras/emprestimos.ts) e [rota](apps/api/src/rotas/emprestimos.ts)) + índice único no banco |
| **Regra:** a devolução deve ser igual ou posterior à retirada | API + `CHECK` no banco |

Além disso, a tela **Exemplares** mostra todos os livros e se cada um está disponível ou emprestado.

---

## ▶️ Como rodar o projeto

### 1. Instale o Bun (só na primeira vez)

**Windows** (no PowerShell):

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Linux / macOS**:

```bash
curl -fsSL https://bun.sh/install | bash
```

Feche e abra o terminal, e confira com `bun --version`.

### 2. Instale as dependências

Na pasta raiz do projeto:

```bash
bun install
```

### 3. Crie o banco com os dados de exemplo

```bash
bun run banco:popular
```

Isso cria o arquivo `apps/api/biblioteca.sqlite` com **43 exemplares** de livros das disciplinas
de Ciência da Computação e cerca de **260 empréstimos** (de agosto a novembro de 2026).
Os nomes das pessoas são fictícios. O exemplar **B001 começa disponível**, para o teste do enunciado.

> ⚠️ Este comando **apaga tudo** e recria os dados de exemplo. Rode só quando quiser recomeçar.

### 4. Ligue a API e o site

```bash
bun run dev
```

Abra no navegador: **http://localhost:5173**

| O que | Endereço |
| --- | --- |
| Site (telas) | http://localhost:5173 |
| API (dados em JSON) | http://localhost:3333/api/emprestimos |
| Documentação da API (Scalar) | http://localhost:3333/api/docs |

> Para desligar, aperte `Ctrl + C` no terminal.

### Outros comandos

| Comando | O que faz |
| --- | --- |
| `bun run dev` | Liga a API e o site ao mesmo tempo |
| `bun run dev:api` | Liga só a API (porta 3333) |
| `bun run dev:web` | Liga só o site (porta 5173) |
| `bun run banco:popular` | Apaga os dados e coloca os dados de exemplo |
| `bun run build` | Gera a versão final do site (pasta `apps/web/dist`) |

---

## 🧪 Como testar as regras

1. Na tela **Empréstimos**, clique em **Nova retirada**, escolha **B001**, digite um nome e salve.
   Aparece o aviso verde *"Retirada registrada"*.
2. Repita com o **B001** e outro nome. A API **recusa** e aparece o aviso vermelho:
   *"O exemplar B001 já está emprestado para ... Registre a devolução antes de emprestar de novo."*
3. Na linha do B001, clique em **Registrar devolução**. Experimente uma data **anterior** à retirada:
   a API **recusa**. Depois use a data de hoje e confirme.
4. Empreste o **B001** para outra pessoa: agora **funciona**.
5. Use o filtro **Em aberto / Devolvidos**.
6. Desligue o servidor (`Ctrl + C`), ligue de novo (`bun run dev`) e recarregue a página:
   **os empréstimos continuam lá**, porque ficam gravados no arquivo do SQLite.

---

## 🏗️ Como o projeto está organizado

```
boto-cor-de-rosa/
│
├── apps/                  ← os PROGRAMAS que rodam
│   ├── api/               ← o servidor: recebe pedidos e fala com o banco (Bun + SQLite)
│   └── web/               ← o site: as telas (React + shadcn/ui)
│
├── packages/
│   └── tipos/             ← o "formato" de cada dado, usado pela API e pelo site
│
├── docs/                  ← rotas da API e banco de dados
│
├── package.json           ← configura o monorepo e os comandos principais
└── README.md              ← você está aqui
```

Cada pasta tem o seu próprio `README.md` explicando o que existe nela.

### A viagem de um clique (registrar uma retirada)

```
 Tela (React)                        API (Bun)                              Banco (SQLite)
 ─────────────                       ─────────                              ──────────────
 FormularioRetirada.tsx
   └─ registrarRetirada(dados)
        servicos/api.ts
        POST /api/emprestimos  ───►  index.ts  →  rotas/emprestimos.ts
        { exemplar_id,                  1. campos preenchidos?
          nome_leitor,                  2. data válida?
          data_retirada }               3. o exemplar existe?          ───►  SELECT exemplares
                                        4. já tem empréstimo aberto?   ───►  SELECT emprestimos
                                           sim → 409 + mensagem               WHERE data_devolucao IS NULL
                                           não → grava                 ───►  INSERT INTO emprestimos
 aviso verde ou vermelho  ◄────────  201 { empréstimo } ou { erro }
 a lista recarrega
```

---

## 🧰 Stack

| Ferramenta | Para que serve |
| --- | --- |
| **Bun** | Roda a API, instala pacotes e executa os scripts |
| **TypeScript** | JavaScript com tipos: avisa erros antes de rodar |
| **SQLite** (`bun:sqlite`) | Banco de dados em um único arquivo |
| **React** + **Vite** | As telas do site e o servidor de desenvolvimento |
| **Tailwind CSS** + **shadcn/ui** | Estilo e componentes (botões, tabelas, janelas, avisos) |
| **Scalar** | Página de documentação interativa da API |

## 📖 Documentação

| Documento | Conteúdo |
| --- | --- |
| [docs/api.md](docs/api.md) | Rotas da API com exemplos de requisição e resposta |
| [docs/banco-de-dados.md](docs/banco-de-dados.md) | Tabelas, relacionamento e restrições |

## ⚠️ Avisos

- **Não há login nem senha.** É proposital, como no modelo da aula.
- O arquivo `biblioteca.sqlite` **não vai para o Git** (está no `.gitignore`).
  Cada integrante cria o seu com `bun run banco:popular`.
