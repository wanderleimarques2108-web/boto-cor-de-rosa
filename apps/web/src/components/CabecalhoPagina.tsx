/*
 * CABEÇALHO DE PÁGINA
 * Título + descrição no topo de cada tela, com espaço à direita para botões.
 *
 * "children" é tudo o que for colocado ENTRE as tags do componente:
 *   <CabecalhoPagina titulo="Alunos">  <Button>Novo</Button>  </CabecalhoPagina>
 *                                       ^^^^^^^^^^^^^^^^^^^^^ isto é o children
 */
import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descricao: string;
  children?: ReactNode; // o "?" quer dizer: opcional
};

export function CabecalhoPagina({ titulo, descricao, children }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
