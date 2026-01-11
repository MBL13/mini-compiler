import Lexer from "./lexer/Lexer";
import Parser from "./parser/Parser";
import SemanticAnalyzer from "./semantic/Semantic";
import { TokenType } from "./lexer/ILexer";
import fs from "fs";
import path from "path";

/**
 * PONTO de entrada do compilador.
 * O fluxo consiste em:
 * 1. Ler o código-fonte de um arquivo.
 * 2. Realizar a Análise Léxica (transformar string em tokens).
 * 3. Realizar a Análise Sintática (transformar tokens em uma AST).
 * 4. Realizar a Análise Semântica e Execução (percorrer a AST e processar a lógica).
 * Ola Mundo
 */

// Caminho do arquivo de entrada (.nt)
const filePath = path.join(__dirname, "input", "code.sa");
const code = fs.readFileSync(filePath, "utf-8");

// 1. Instância do Lexer com o código bruto
let lexer;
try {
  // Pré-análise Léxica: Varre todo o arquivo em busca de erros léxicos
  const errorScanner = new Lexer(code, "code.sa");
  let token = errorScanner.getNextToken();

  // Varre até encontrar EOF
  while (token.type !== TokenType.EOF) {
    token = errorScanner.getNextToken();
  }

  // Check if errorScanner found errors
  if (errorScanner.errors.length > 0) {
    errorScanner.errors.forEach((err) => console.error(err));
    process.exit(1);
  }

  // Se não houve erros léxicos, prossegue para o Parser
  lexer = new Lexer(code, "code.sa");
  const parser = new Parser(lexer);
  const ast = parser.parse();

  // 3. Instância do Analisador Semântico que executa a AST gerada
  const semantic = new SemanticAnalyzer();
  semantic.execute(ast);
} catch (error: any) {
  console.error(error.message);
}
