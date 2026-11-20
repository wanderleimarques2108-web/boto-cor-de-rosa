/*
 * FUNÇÕES DE DATA
 * Pequenas funções para mostrar e preencher datas na tela.
 * O banco guarda as datas como "AAAA-MM-DD"; a tela mostra "DD/MM/AAAA".
 */

// "2026-11-19" -> "19/11/2026"   |   null -> "—"
export function formatarData(texto: string | null) {
  if (texto === null) {
    return "—";
  }
  const [ano, mes, dia] = texto.split("-");
  return `${dia}/${mes}/${ano}`;
}

// A data de hoje no formato do banco ("AAAA-MM-DD"), no fuso do computador.
// É o valor inicial dos campos de data dos formulários.
// padStart(2, "0") completa com zero à esquerda: 7 -> "07".
export function hoje() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0"); // getMonth começa em 0 (janeiro)
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
