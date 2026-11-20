/*
 * CAMPO DE FORMULÁRIO
 * Junta um rótulo (Label) com o campo que vier dentro dele.
 * Evita repetir a mesma estrutura em todos os formulários.
 *
 * Uso:
 *   <Campo rotulo="Nome">
 *     <Input ... />
 *   </Campo>
 */
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type Props = {
  rotulo: string;
  children: ReactNode;
};

export function Campo({ rotulo, children }: Props) {
  return (
    <div className="grid gap-2">
      <Label>{rotulo}</Label>
      {children}
    </div>
  );
}
