/*
 * FORMULÁRIO DE DEVOLUÇÃO
 * -----------------------
 * Abre quando clicamos em "Registrar devolução" numa linha em aberto.
 * Mostra qual livro está voltando e pede a data de devolução
 * (começa preenchida com hoje).
 *
 * Repare que o campo de data NÃO bloqueia datas anteriores à retirada.
 * É de propósito: quem confere a regra "devolução igual ou depois da retirada"
 * é a API. Se a data for anterior, a API recusa e a tela mostra o motivo.
 */
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { EmprestimoDetalhado } from "@biblioteca/tipos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Campo } from "@/components/Campo";
import { formatarData, hoje } from "@/lib/formatar";
import { registrarDevolucao } from "@/servicos/api";

type Props = {
  emprestimo: EmprestimoDetalhado;
  aoFechar: () => void;
  aoSalvar: () => void;
};

export function FormularioDevolucao({ emprestimo, aoFechar, aoSalvar }: Props) {
  const [dataDevolucao, setDataDevolucao] = useState(hoje());

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();

    if (!dataDevolucao) {
      toast.error("Preencha a data de devolução.");
      return;
    }

    try {
      await registrarDevolucao(emprestimo.id, { data_devolucao: dataDevolucao });
      toast.success(`Devolução registrada: ${emprestimo.exemplar_codigo} está disponível de novo.`);
      aoSalvar();
      aoFechar();
    } catch {
      // A mensagem de erro já foi mostrada por servicos/api.ts
    }
  }

  return (
    <Dialog open onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar devolução</DialogTitle>
          <DialogDescription>
            {emprestimo.exemplar_codigo} · {emprestimo.exemplar_titulo}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={aoEnviar} className="grid gap-4">
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p>
              <span className="text-muted-foreground">Com:</span> {emprestimo.nome_leitor}
            </p>
            <p>
              <span className="text-muted-foreground">Retirado em:</span> {formatarData(emprestimo.data_retirada)}
            </p>
          </div>

          <Campo rotulo="Data de devolução">
            <Input
              type="date"
              aria-label="Data de devolução"
              value={dataDevolucao}
              onChange={(e) => setDataDevolucao(e.target.value)}
            />
          </Campo>
          <p className="-mt-2 text-xs text-muted-foreground">
            A devolução deve ser no mesmo dia da retirada ou depois.
          </p>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar devolução</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
