/*
 * AJUDANTES
 * ---------
 * Pequenas funções reaproveitadas por todas as rotas.
 * Assim evitamos repetir o mesmo código em vários arquivos.
 */

// Devolve uma resposta de erro no formato { "erro": "mensagem" }.
// Status 400 = "o pedido veio com problema" (padrão).
// Status 404 = "não encontrado".
// Status 409 = "conflito": o pedido é válido, mas choca com o que já está no banco
//              (ex.: emprestar um livro que já está emprestado).
export function erro(mensagem: string, status: number = 400) {
  return Response.json({ erro: mensagem }, { status: status });
}

// Confere se os campos obrigatórios vieram preenchidos.
// Devolve uma mensagem de erro, ou null se estiver tudo certo.
// Obs.: "any" diz ao TypeScript "aceite qualquer coisa aqui".
export function verificarObrigatorios(dados: any, campos: string[]) {
  for (const campo of campos) {
    const valor = dados[campo];
    if (valor === undefined || valor === null || String(valor).trim() === "") {
      return `O campo "${campo}" é obrigatório.`;
    }
  }
  return null;
}

// Lê o corpo do pedido como JSON.
// Se o corpo não for um JSON válido, devolve null (em vez de "quebrar" a rota).
export async function lerCorpo(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

// O SQLite devolve mensagens em inglês e bem técnicas.
// Aqui traduzimos as mais comuns para algo que o usuário entenda.
export function traduzirErroDoBanco(mensagemOriginal: string) {
  if (mensagemOriginal.includes("UNIQUE constraint failed: emprestimos.exemplar_id")) {
    return "Este exemplar já tem um empréstimo em aberto. Registre a devolução antes de emprestar de novo.";
  }
  if (mensagemOriginal.includes("UNIQUE constraint failed")) {
    return "Já existe um cadastro com esses dados (por exemplo, o mesmo código de exemplar).";
  }
  if (mensagemOriginal.includes("FOREIGN KEY constraint failed")) {
    return "O exemplar informado não existe.";
  }
  if (mensagemOriginal.includes("CHECK constraint failed")) {
    return "A data de devolução deve ser igual ou posterior à data de retirada.";
  }
  return "Erro inesperado: " + mensagemOriginal;
}
