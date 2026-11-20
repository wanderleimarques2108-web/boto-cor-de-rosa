/*
 * CONEXÃO COM O BANCO DE DADOS
 * ----------------------------
 * O SQLite guarda o banco inteiro em UM ÚNICO ARQUIVO no computador.
 * Não precisa instalar nenhum servidor de banco: o próprio Bun já sabe
 * ler e escrever nesse arquivo (através do módulo "bun:sqlite").
 *
 * Como os dados ficam num arquivo, eles CONTINUAM LÁ quando o servidor
 * é desligado e ligado de novo.
 */
import { Database } from "bun:sqlite";
import { criarTabelas } from "./criar-tabelas";

// import.meta.dir = pasta onde ESTE arquivo está (src/banco).
// Subimos duas pastas para salvar o arquivo na raiz da API (apps/api).
// Se a variável de ambiente BIBLIOTECA_BANCO existir, usamos o caminho dela.
const caminhoDoArquivo = Bun.env.BIBLIOTECA_BANCO || import.meta.dir + "/../../biblioteca.sqlite";

// Abre o arquivo (e cria, se ainda não existir).
export const banco = new Database(caminhoDoArquivo, { create: true });

// Liga a checagem de chaves estrangeiras (relacionamentos entre tabelas).
// No SQLite ela vem DESLIGADA por padrão!
banco.run("PRAGMA foreign_keys = ON");

// Garante que as tabelas existem antes de qualquer consulta.
criarTabelas(banco);
