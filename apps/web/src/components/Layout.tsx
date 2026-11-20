/*
 * LAYOUT (moldura do site)
 * É a estrutura que se repete em todas as telas:
 * o menu lateral à esquerda e o conteúdo da página à direita.
 */
import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { BookOpen, Library } from "lucide-react";

// Itens do menu: para adicionar uma tela nova ao menu, basta incluir aqui.
const ITENS_MENU = [
  { endereco: "/", texto: "Empréstimos", icone: BookOpen },
  { endereco: "/exemplares", texto: "Exemplares", icone: Library },
];

// Classes do link do menu. O NavLink nos diz se o link está "ativo"
// (é a página atual), e aí destacamos com outra cor.
function classesDoLink(ativo: boolean) {
  const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
  if (ativo) {
    return base + " bg-foreground text-background font-medium";
  }
  return base + " text-muted-foreground hover:bg-muted hover:text-foreground";
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      {/* MENU LATERAL (em telas pequenas ele vira uma barra no topo) */}
      <aside className="border-b bg-background md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <BookOpen className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Biblioteca</p>
            <p className="text-xs text-muted-foreground">Boto Cor de Rosa</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {ITENS_MENU.map((item) => (
            <NavLink
              key={item.endereco}
              to={item.endereco}
              end={item.endereco === "/"}
              className={({ isActive }) => classesDoLink(isActive)}
            >
              <item.icone className="size-4 shrink-0" />
              <span className="whitespace-nowrap">{item.texto}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* CONTEÚDO DA PÁGINA ATUAL */}
      <main className="flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
