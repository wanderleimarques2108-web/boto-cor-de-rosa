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

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<p className="text-muted-foreground">Em construção.</p>} />
      </Routes>

      {/* Toaster = área onde aparecem os avisos (sucesso/erro) */}
      <Toaster position="top-right" richColors />
    </Layout>
  );
}
