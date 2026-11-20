/*
 * PÁGINA DE EMPRÉSTIMOS (tela principal)
 * --------------------------------------
 * Lista os empréstimos com o título do livro e a situação.
 */
import { useEffect, useState } from "react";
import type { EmprestimoDetalhado } from "@biblioteca/tipos";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { SeloSituacao } from "@/components/SeloSituacao";
import { formatarData } from "@/lib/formatar";
import { listarEmprestimos } from "@/servicos/api";

export function PaginaEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<EmprestimoDetalhado[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarEmprestimos() {
    setCarregando(true);
    try {
      setEmprestimos(await listarEmprestimos());
    } catch {
      // A mensagem de erro já foi mostrada por servicos/api.ts
      setEmprestimos([]);
    }
    setCarregando(false);
  }

  // useEffect com [] = roda UMA vez, quando a página abre.
  useEffect(() => {
    carregarEmprestimos();
  }, []);

  return (
    <>
      <CabecalhoPagina titulo="Empréstimos" descricao="Retiradas e devoluções dos exemplares da biblioteca." />

      <Card className="gap-0 p-0">
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
            {emprestimos.map((e) => (
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
            {emprestimos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {carregando ? "Carregando empréstimos..." : "Nenhum empréstimo encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
