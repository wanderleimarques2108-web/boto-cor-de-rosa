/*
 * FORMULÁRIO DE RETIRADA
 * ----------------------
 * Registra um novo empréstimo: escolhemos o exemplar, digitamos o nome
 * de quem retira e a data de retirada (começa preenchida com hoje).
 *
 * A lista mostra TODOS os exemplares, inclusive os emprestados (marcados
 * com "emprestado"). É de propósito: quem decide se pode emprestar é a API.
 * Se escolhermos um exemplar emprestado, a API recusa e a tela mostra o motivo.
 *
 * Detalhe importante: o componente Select trabalha com TEXTO,
 * mas os ids no banco são NÚMEROS. Por isso usamos:
 *   String(numero) -> para mostrar no Select
 *   Number(texto)  -> para guardar de volta nos dados
 */
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { ExemplarComSituacao, NovoEmprestimo } from "@biblioteca/tipos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Campo } from "@/components/Campo";
import { hoje } from "@/lib/formatar";
import { listarExemplares, registrarRetirada } from "@/servicos/api";

type Props = {
  aoFechar: () => void;
  aoSalvar: () => void;
};

export function FormularioRetirada({ aoFechar, aoSalvar }: Props) {
  // exemplar_id 0 = "nada escolhido ainda"
  const [dados, setDados] = useState<NovoEmprestimo>({
    exemplar_id: 0,
    nome_leitor: "",
    data_retirada: hoje(),
  });

  // Lista para preencher o Select de exemplares
  const [exemplares, setExemplares] = useState<ExemplarComSituacao[]>([]);

  useEffect(() => {
    listarExemplares()
      .then(setExemplares)
      .catch(() => {
        // A mensagem de erro já foi mostrada por servicos/api.ts
      });
  }, []);

  async function aoEnviar(evento: FormEvent) {
    // Impede o navegador de recarregar a página ao enviar o formulário.
    evento.preventDefault();

    if (!dados.exemplar_id || !dados.nome_leitor.trim() || !dados.data_retirada) {
      toast.error("Escolha o exemplar e preencha o nome de quem retira e a data.");
      return;
    }

    try {
      const emprestimo = await registrarRetirada(dados);
      toast.success(`Retirada registrada: ${emprestimo.exemplar_codigo} com ${emprestimo.nome_leitor}.`);
      aoSalvar();
      aoFechar();
    } catch {
      // A mensagem de erro (ex.: "já está emprestado") já foi mostrada por servicos/api.ts.
      // O formulário continua aberto para a pessoa corrigir.
    }
  }

  return (
    <Dialog open onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova retirada</DialogTitle>
          <DialogDescription>Um exemplar só pode ter um empréstimo em aberto por vez.</DialogDescription>
        </DialogHeader>

        <form onSubmit={aoEnviar} className="grid gap-4">
          <Campo rotulo="Exemplar">
            <Select
              value={dados.exemplar_id ? String(dados.exemplar_id) : ""}
              onValueChange={(valor) => setDados({ ...dados, exemplar_id: Number(valor) })}
            >
              <SelectTrigger className="w-full" aria-label="Exemplar">
                <SelectValue placeholder="Selecione o exemplar..." />
              </SelectTrigger>
              <SelectContent>
                {exemplares.map((exemplar) => (
                  <SelectItem key={exemplar.id} value={String(exemplar.id)}>
                    {exemplar.codigo} · {exemplar.titulo}
                    {!exemplar.disponivel && <span className="text-muted-foreground"> (emprestado)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo rotulo="Nome de quem retira">
            <Input
              placeholder="Ex.: Ana Souza"
              aria-label="Nome de quem retira"
              value={dados.nome_leitor}
              onChange={(e) => setDados({ ...dados, nome_leitor: e.target.value })}
            />
          </Campo>

          <Campo rotulo="Data de retirada">
            <Input
              type="date"
              aria-label="Data de retirada"
              value={dados.data_retirada}
              onChange={(e) => setDados({ ...dados, data_retirada: e.target.value })}
            />
          </Campo>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit">Registrar retirada</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
