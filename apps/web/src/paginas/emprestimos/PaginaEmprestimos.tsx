/*
 * PÁGINA DE EMPRÉSTIMOS (tela principal)
 * --------------------------------------
 * Lista os empréstimos com o título do livro e a situação.
 *
 * Dois jeitos de filtrar:
 *   - SITUAÇÃO (em aberto / devolvido): quem filtra é a API.
 *     A tela pede /api/emprestimos?situacao=aberto e recebe só esses.
 *   - BUSCA (título, código ou leitor): filtra na própria tela,
 *     dentro da lista que já chegou.
 */
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { EmprestimoDetalhado, SituacaoEmprestimo } from "@biblioteca/tipos";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { SeloSituacao } from "@/components/SeloSituacao";
import { formatarData } from "@/lib/formatar";
import { listarEmprestimos } from "@/servicos/api";

// O Select precisa de um valor de texto para "sem filtro".
const TODAS = "todas";

// Mensagem de lista vazia para cada filtro.
const LISTA_VAZIA = {
  todas: "Nenhum empréstimo encontrado.",
  aberto: "Nenhum empréstimo em aberto.",
  devolvido: "Nenhum empréstimo devolvido.",
};

export function PaginaEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<EmprestimoDetalhado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [situacao, setSituacao] = useState<SituacaoEmprestimo | typeof TODAS>(TODAS);
  const [busca, setBusca] = useState("");

  async function carregarEmprestimos() {
    setCarregando(true);
    try {
      // Sem filtro, não mandamos a situação para a API.
      setEmprestimos(await listarEmprestimos(situacao === TODAS ? undefined : situacao));
    } catch {
      // A mensagem de erro já foi mostrada por servicos/api.ts
      setEmprestimos([]);
    }
    setCarregando(false);
  }

  // useEffect com [situacao] = roda quando a página abre
  // e de novo TODA VEZ que o filtro de situação muda.
  useEffect(() => {
    carregarEmprestimos();
  }, [situacao]);

  const termo = busca.trim().toLowerCase();
  const emprestimosFiltrados = emprestimos.filter(
    (e) =>
      e.exemplar_titulo.toLowerCase().includes(termo) ||
      e.exemplar_codigo.toLowerCase().includes(termo) ||
      e.nome_leitor.toLowerCase().includes(termo)
  );

  return (
    <>
      <CabecalhoPagina titulo="Empréstimos" descricao="Retiradas e devoluções dos exemplares da biblioteca." />

      <Card className="gap-0 p-0">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por título, código ou leitor..."
              aria-label="Buscar empréstimos"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>

          <Select value={situacao} onValueChange={(valor) => setSituacao(valor as typeof situacao)}>
            <SelectTrigger className="w-44" aria-label="Filtrar por situação">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas as situações</SelectItem>
              <SelectItem value="aberto">Em aberto</SelectItem>
              <SelectItem value="devolvido">Devolvidos</SelectItem>
            </SelectContent>
          </Select>

          <p className="ml-auto text-sm text-muted-foreground">
            {emprestimosFiltrados.length} {emprestimosFiltrados.length === 1 ? "empréstimo" : "empréstimos"}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Código</TableHead>
              <TableHead>Livro</TableHead>
              <TableHead>Leitor</TableHead>
              <TableHead>Retirada</TableHead>
              <TableHead>Devolução</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emprestimosFiltrados.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="pl-4 font-mono text-xs">{e.exemplar_codigo}</TableCell>
                <TableCell>
                  <p className="font-medium">{e.exemplar_titulo}</p>
                  <p className="text-xs text-muted-foreground">{e.exemplar_autor}</p>
                </TableCell>
                <TableCell>{e.nome_leitor}</TableCell>
                <TableCell className="tabular-nums">{formatarData(e.data_retirada)}</TableCell>
                <TableCell className="tabular-nums">{formatarData(e.data_devolucao)}</TableCell>
                <TableCell>
                  <SeloSituacao situacao={e.situacao} />
                </TableCell>
              </TableRow>
            ))}

            {/* Mensagem quando a lista está vazia (ou ainda carregando) */}
            {emprestimosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {carregando ? "Carregando empréstimos..." : termo ? "Nenhum empréstimo corresponde à busca." : LISTA_VAZIA[situacao]}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
