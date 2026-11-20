/*
 * SERVIÇO DA API
 * --------------
 * Este é o ÚNICO arquivo do site que conversa com a API.
 * As telas nunca chamam "fetch" diretamente: elas chamam as funções daqui.
 *
 * Vantagem: se o endereço da API mudar, mexemos só neste arquivo.
 */
import { toast } from "sonner";
import type {
  EmprestimoDetalhado,
  ExemplarComSituacao,
  NovaDevolucao,
  NovoEmprestimo,
  SituacaoEmprestimo,
} from "@biblioteca/tipos";

// Função base: faz o pedido para a API e devolve a resposta já convertida.
// Os pedidos para "/api/..." são repassados pelo Vite para a API
// (veja a parte "proxy" em vite.config.ts).
async function requisicao(caminho: string, metodo: string = "GET", dados?: object) {
  let resposta: Response;
  let corpo: any;

  try {
    resposta = await fetch("/api" + caminho, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      // JSON.stringify transforma o objeto em texto para enviar pela rede.
      body: dados ? JSON.stringify(dados) : undefined,
    });
    corpo = await resposta.json();
  } catch {
    // Cai aqui quando a API está desligada (não chega resposta em JSON).
    const mensagem = "Não foi possível falar com a API. Confira se ela está ligada.";
    toast.error(mensagem);
    throw new Error(mensagem);
  }

  // resposta.ok é falso quando o status é de erro (400, 404, 409, 500...).
  if (!resposta.ok) {
    const mensagem = corpo.erro ?? "A API recusou o pedido.";
    toast.error(mensagem); // mostra o aviso vermelho na tela
    throw new Error(mensagem); // interrompe quem chamou esta função
  }

  return corpo;
}

// ------------------------------------------------------------------
// Exemplares
// ------------------------------------------------------------------
export function listarExemplares(): Promise<ExemplarComSituacao[]> {
  return requisicao("/exemplares");
}

// ------------------------------------------------------------------
// Empréstimos
// ------------------------------------------------------------------

// situacao é opcional: se vier, a API devolve só os empréstimos daquela situação.
export function listarEmprestimos(situacao?: SituacaoEmprestimo): Promise<EmprestimoDetalhado[]> {
  if (situacao) {
    return requisicao("/emprestimos?situacao=" + situacao);
  }
  return requisicao("/emprestimos");
}

// Registra uma RETIRADA (cria um empréstimo em aberto).
export function registrarRetirada(dados: NovoEmprestimo): Promise<EmprestimoDetalhado> {
  return requisicao("/emprestimos", "POST", dados);
}

// Registra a DEVOLUÇÃO de um empréstimo.
export function registrarDevolucao(id: number, dados: NovaDevolucao): Promise<EmprestimoDetalhado> {
  return requisicao("/emprestimos/" + id + "/devolucao", "PUT", dados);
}
