/*
 * APP (componente principal)
 * --------------------------
 * Define QUAL página aparece para CADA endereço do navegador.
 * Para criar uma página nova: crie o componente em paginas/ e
 * adicione uma <Route> aqui (e um item no menu, em components/Layout.tsx).
 */
import { Route, Routes } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/Layout";
import { PaginaEmprestimos } from "@/paginas/emprestimos/PaginaEmprestimos";
import { PaginaExemplares } from "@/paginas/exemplares/PaginaExemplares";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PaginaEmprestimos />} />
        <Route path="/exemplares" element={<PaginaExemplares />} />
      </Routes>

      {/* Toaster = área onde aparecem os avisos (sucesso/erro) */}
      <Toaster position="top-right" richColors />
    </Layout>
  );
}
