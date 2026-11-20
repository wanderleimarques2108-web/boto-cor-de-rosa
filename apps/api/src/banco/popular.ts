/*
 * POPULAR O BANCO (dados de exemplo)
 * ----------------------------------
 * Rode com:  bun run banco:popular
 *
 * Este script APAGA tudo e coloca dados de exemplo no banco.
 * Serve para o sistema não começar vazio e para a apresentação.
 * Em inglês, esse tipo de script costuma se chamar "seed" (semente).
 *
 * Os nomes das pessoas são FICTÍCIOS, como pede o enunciado.
 *
 * O que ele cria:
 *   - cerca de 40 exemplares (alguns livros têm mais de uma cópia,
 *     como numa biblioteca de verdade: cada cópia tem o seu código);
 *   - um histórico de empréstimos de agosto a novembro de 2026,
 *     com livros já devolvidos e livros ainda em aberto.
 *
 * Os dados são "sorteados", mas SEMPRE saem iguais (veja a função sortear),
 * e SEMPRE respeitam as regras do enunciado:
 *   - um exemplar nunca tem dois empréstimos em aberto;
 *   - a devolução nunca é antes da retirada.
 */
import { banco } from "./conexao";

console.log("🧹 Limpando dados antigos...");
// A ordem importa: primeiro os empréstimos, que dependem dos exemplares.
banco.run("DELETE FROM emprestimos");
banco.run("DELETE FROM exemplares");
// Faz os ids voltarem a começar do 1.
banco.run("DELETE FROM sqlite_sequence");

// ------------------------------------------------------------------
// Sorteio que se repete
// Um sorteio comum (Math.random) daria dados diferentes a cada vez.
// Aqui usamos uma fórmula simples que, a partir de um número inicial
// (a "semente"), gera sempre a MESMA sequência de números.
// Assim todo o grupo tem exatamente os mesmos dados de exemplo.
// ------------------------------------------------------------------
let semente = 2026;

// Devolve um número inteiro entre minimo e maximo (incluindo os dois).
function sortear(minimo: number, maximo: number) {
  semente = (semente * 1103515245 + 12345) % 2147483648;
  return minimo + (semente % (maximo - minimo + 1));
}

// ------------------------------------------------------------------
// Datas
// As datas ficam no formato "AAAA-MM-DD" (ex.: "2026-11-19").
// Esta função soma dias a uma data: somarDias("2026-08-30", 5) = "2026-09-04".
// Usamos UTC para o fuso horário não "comer" um dia na conta.
// ------------------------------------------------------------------
function somarDias(data: string, dias: number) {
  const resultado = new Date(data + "T00:00:00Z");
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
}

const INICIO_DO_HISTORICO = "2026-08-03";
const HOJE_NOS_EXEMPLOS = "2026-11-19"; // nenhum dado passa desta data

// ------------------------------------------------------------------
// Exemplares
// ------------------------------------------------------------------
console.log("📚 Cadastrando exemplares...");
// Livros usados nas disciplinas do curso de Ciência da Computação.
// (A disciplina aparece só no comentário: o enunciado pede que o exemplar
// tenha apenas código, título e autor.)
//  título, autor, quantas cópias a biblioteca tem
const livros: [string, string, number][] = [
  // Algoritmos e Lógica de Programação
  ["Lógica de Programação", "André Luiz Villar Forbellone", 3],
  ["Entendendo Algoritmos", "Aditya Y. Bhargava", 2],
  ["Algoritmos: Teoria e Prática", "Thomas H. Cormen", 3],
  // Estruturas de Dados
  ["Estruturas de Dados e Algoritmos em Java", "Michael T. Goodrich", 2],
  // Matemática Discreta e Cálculo
  ["Matemática Discreta e Suas Aplicações", "Kenneth H. Rosen", 2],
  ["Cálculo, Volume 1", "James Stewart", 2],
  // Banco de Dados
  ["Sistemas de Banco de Dados", "Ramez Elmasri e Shamkant B. Navathe", 2],
  ["Sistema de Banco de Dados", "Abraham Silberschatz", 1],
  ["Aprendendo SQL", "Alan Beaulieu", 1],
  // Programação Web
  ["JavaScript: O Guia Definitivo", "David Flanagan", 2],
  ["Programando com TypeScript", "Boris Cherny", 1],
  // Programação Orientada a Objetos
  ["Use a Cabeça! Java", "Kathy Sierra e Bert Bates", 1],
  ["Padrões de Projeto", "Erich Gamma", 1],
  // Python
  ["Python Fluente", "Luciano Ramalho", 2],
  // Engenharia de Software
  ["Engenharia de Software", "Ian Sommerville", 2],
  ["Engenharia de Software: Uma Abordagem Profissional", "Roger S. Pressman", 1],
  ["Código Limpo", "Robert C. Martin", 3],
  ["Arquitetura Limpa", "Robert C. Martin", 1],
  ["Refatoração", "Martin Fowler", 1],
  ["O Programador Pragmático", "Andrew Hunt e David Thomas", 1],
  // Redes de Computadores
  ["Redes de Computadores e a Internet", "James F. Kurose e Keith W. Ross", 2],
  ["Redes de Computadores", "Andrew S. Tanenbaum", 1],
  // Sistemas Operacionais e Arquitetura de Computadores
  ["Sistemas Operacionais Modernos", "Andrew S. Tanenbaum", 2],
  ["Arquitetura e Organização de Computadores", "William Stallings", 1],
  // Teoria da Computação e Compiladores
  ["Introdução à Teoria da Computação", "Michael Sipser", 1],
  ["Compiladores: Princípios, Técnicas e Ferramentas", "Alfred V. Aho", 1],
  // Inteligência Artificial
  ["Inteligência Artificial", "Stuart Russell e Peter Norvig", 1],
];

// Cada cópia ganha o próximo código: B001, B002, B003...
// padStart(3, "0") completa com zeros à esquerda: 7 -> "007".
const codigos: string[] = [];
for (const [titulo, autor, copias] of livros) {
  for (let copia = 1; copia <= copias; copia++) {
    const codigo = "B" + String(codigos.length + 1).padStart(3, "0");
    banco.query("INSERT INTO exemplares (codigo, titulo, autor) VALUES (?, ?, ?)").run(codigo, titulo, autor);
    codigos.push(codigo);
  }
}

// ------------------------------------------------------------------
// Leitores (nomes fictícios)
// ------------------------------------------------------------------
const leitores = [
  "Lucas Ferreira", "Marina Costa", "Rafael Lima", "Sofia Almeida", "Thiago Rocha",
  "Beatriz Nogueira", "Gustavo Pinto", "Larissa Monteiro", "Felipe Cardoso", "Camila Ribeiro",
  "Pedro Azevedo", "Juliana Barros", "Mateus Correia", "Isabela Duarte", "Vinícius Moura",
  "Letícia Farias", "Bruno Teixeira", "Amanda Freitas", "Diego Campos", "Natália Pires",
  "Gabriel Antunes", "Fernanda Lopes", "Henrique Vieira", "Carolina Mendes", "Eduardo Ramos",
  "Yasmin Cavalcanti", "Rodrigo Brito", "Aline Siqueira", "Otávio Rezende", "Priscila Matos",
];

// ------------------------------------------------------------------
// Empréstimos
// Para CADA exemplar, montamos uma "linha do tempo":
//   retirada -> fica alguns dias com a pessoa -> devolução -> pausa -> nova retirada...
// Como um empréstimo só começa DEPOIS da devolução do anterior, nunca
// existem dois empréstimos em aberto do mesmo exemplar.
// ------------------------------------------------------------------
console.log("📝 Cadastrando empréstimos...");

const inserirEmprestimo = banco.query(
  "INSERT INTO emprestimos (exemplar_id, nome_leitor, data_retirada, data_devolucao) VALUES (?, ?, ?, ?)"
);

let totalDevolvidos = 0;
let totalEmAberto = 0;

codigos.forEach((codigo, posicao) => {
  const exemplarId = posicao + 1; // os ids foram criados na mesma ordem dos códigos
  let retirada = somarDias(INICIO_DO_HISTORICO, sortear(0, 20));

  while (retirada <= HOJE_NOS_EXEMPLOS) {
    const leitor = leitores[sortear(0, leitores.length - 1)];
    const devolucao = somarDias(retirada, sortear(0, 21)); // de 0 (mesmo dia) a 21 dias depois

    if (devolucao <= HOJE_NOS_EXEMPLOS) {
      // O livro já voltou: empréstimo DEVOLVIDO.
      inserirEmprestimo.run(exemplarId, leitor, retirada, devolucao);
      totalDevolvidos++;
      retirada = somarDias(devolucao, sortear(1, 15)); // fica na estante alguns dias
    } else {
      // A devolução "cairia no futuro": o livro ainda está com a pessoa.
      // O B001 fica sempre DISPONÍVEL, porque é o exemplar do teste do enunciado.
      if (codigo !== "B001") {
        inserirEmprestimo.run(exemplarId, leitor, retirada, null);
        totalEmAberto++;
      }
      break;
    }
  }
});

console.log(`   ${codigos.length} exemplares, ${totalDevolvidos} empréstimos devolvidos e ${totalEmAberto} em aberto.`);
console.log("✅ Pronto! Banco populado com dados de exemplo.");
