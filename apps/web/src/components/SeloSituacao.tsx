/*
 * SELO DE SITUAÇÃO
 * Uma etiqueta colorida para a situação do empréstimo:
 *   âmbar = em aberto (o livro está com alguém) | verde = devolvido
 */
import type { SituacaoEmprestimo } from "@biblioteca/tipos";
import { Badge } from "@/components/ui/badge";

// Para cada situação, guardamos o texto e as cores (classes do Tailwind).
const APARENCIA = {
  aberto: { texto: "Em aberto", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  devolvido: { texto: "Devolvido", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export function SeloSituacao({ situacao }: { situacao: SituacaoEmprestimo }) {
  const aparencia = APARENCIA[situacao];
  return (
    <Badge variant="outline" className={aparencia.classes}>
      {aparencia.texto}
    </Badge>
  );
}
