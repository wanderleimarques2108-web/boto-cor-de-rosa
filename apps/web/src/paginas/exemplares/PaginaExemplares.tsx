/*
 * PÁGINA DE EXEMPLARES
 * --------------------
 * Mostra os livros da biblioteca e se cada um está DISPONÍVEL ou EMPRESTADO.
 * Responde à primeira pergunta do enunciado: "quais exemplares estão disponíveis?".
 *
 * Os exemplares vêm dos dados de exemplo (bun run banco:popular),
 * por isso esta tela só consulta: não cadastra nem edita.
 * Quem calcula "disponível" é a API (veja apps/api/src/rotas/exemplares.ts).
 */
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { ExemplarComSituacao } from "@biblioteca/tipos";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { listarExemplares } from "@/servicos/api";

export function PaginaExemplares() {
  const [exemplares, setExemplares] = useState<ExemplarComSituacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    listarExemplares()
      .then(setExemplares)
      .catch(() => {
        // A mensagem de erro já foi mostrada por servicos/api.ts
      })
      .finally(() => setCarregando(false));
  }, []);

  const termo = busca.trim().toLowerCase();
  const exemplaresFiltrados = exemplares.filter(
    (x) =>
      x.titulo.toLowerCase().includes(termo) ||
      x.autor.toLowerCase().includes(termo) ||
      x.codigo.toLowerCase().includes(termo)
  );

  // filter(...).length = quantos itens passam no teste
  const disponiveis = exemplares.filter((x) => x.disponivel).length;

  return (
    <>
      <CabecalhoPagina
        titulo="Exemplares"
        descricao={`${exemplares.length} exemplares no acervo · ${disponiveis} disponíveis · ${exemplares.length - disponiveis} emprestados`}
      />

      <Card className="gap-0 p-0">
        <div className="border-b p-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por título, autor ou código..."
              aria-label="Buscar exemplares"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Código</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exemplaresFiltrados.map((x) => (
              <TableRow key={x.id}>
                <TableCell className="pl-4 font-mono text-xs">{x.codigo}</TableCell>
                <TableCell className="font-medium">{x.titulo}</TableCell>
                <TableCell className="text-muted-foreground">{x.autor}</TableCell>
                <TableCell>
                  {x.disponivel ? (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      Disponível
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                      Emprestado
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {exemplaresFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {carregando ? "Carregando exemplares..." : "Nenhum exemplar encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
