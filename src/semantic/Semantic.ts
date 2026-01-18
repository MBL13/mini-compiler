import ASTNode from "../parser/IParser";
import readlineSync from "readline-sync";
import { execSync } from "child_process";

interface Symbol {
  value: number | string | boolean;
  type: "INTEIRO" | "REAL" | "NATURAL" | "TEXTO" | "LOGICO";
}

/**
 * O SemanticAnalyzer percorre a AST para validar semântica e executar os comandos.
 * Ele mantém uma tabela de símbolos para armazenar valores e tipos das variáveis.
 */

class BreakSignal {}
class ContinueSignal {}

class SemanticAnalyzer {
  private simbols: Record<string, Symbol> = {};
  private filename: string;
  private printCallback: (message: string) => void;
  private inputCallback: (prompt: string) => Promise<string>;

  constructor(
    filename: string = "code.sa",
    printCallback: (message: string) => void = console.log,
    inputCallback?: (prompt: string) => Promise<string>,
  ) {
    this.filename = filename;
    this.printCallback = printCallback;

    if (inputCallback) {
      this.inputCallback = inputCallback;
    } else {
      // Estratégia padrão para CLI (Terminal)
      this.inputCallback = async (prompt: string) => {
        if (process.platform === "win32") {
          try {
            process.stdout.write(prompt);
            const command = `powershell -NoProfile -Command "[Console]::InputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::In.ReadLine()"`;
            return execSync(command, {
              encoding: "utf8",
              stdio: ["inherit", "pipe", "inherit"],
            }).trim();
          } catch (e) {
            return readlineSync.question(prompt);
          }
        }
        return readlineSync.question(prompt);
      };
    }
  }

  /**
   * Formata uma mensagem de erro com cores ANSI e informações detalhadas.
   */
  private formatError(
    errorType: string,
    details: string,
    node: ASTNode,
  ): string {
    return `\x1b[31m========================================\x1b[0m
\x1b[31m[ERRO] ${errorType}\x1b[0m
\x1b[31m========================================\x1b[0m
\x1b[1mDetalhes:\x1b[0m
  - \x1b[36mArquivo:\x1b[0m \x1b[33m${this.filename}\x1b[0m
  - \x1b[36mLinha:\x1b[0m \x1b[33m${node.linha || "?"}\x1b[0m
  - \x1b[36mColuna:\x1b[0m \x1b[33m${node.coluna || "?"}\x1b[0m
  - \x1b[36mContexto:\x1b[0m ${details}`;
  }

  /**
   * Executa a lista de comandos representada pela AST.
   */
  public async execute(ast: ASTNode[]) {
    for (const node of ast) {
      await this.visit(node);
    }
  }

  /**
   * Função recursiva que visita cada nó da AST e executa a lógica correspondente.
   */
  private async visit(node: ASTNode): Promise<any> {
    switch (node.type) {
      // Declaração de variável
      case "VariableDeclaration": {
        let value: any = null;

        if (node.value) {
          value = await this.visit(node.value);
        }

        // Valores padrão
        if (value === null) {
          switch (node.varType) {
            case "INTEIRO":
            case "REAL":
            case "NATURAL":
              value = 0;
              break;
            case "TEXTO":
              value = "";
              break;
            case "LOGICO":
              value = false;
              break;
          }
        }

        // Validação de tipo
        switch (node.varType) {
          case "INTEIRO":
            if (!Number.isInteger(value))
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor ${value} não é compatível com INTEIRO`,
                  node,
                ),
              );
            break;

          case "REAL":
            if (typeof value !== "number")
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor ${value} não é compatível com REAL`,
                  node,
                ),
              );
            break;

          case "NATURAL":
            if (!Number.isInteger(value) || value < 0)
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor ${value} não é compatível com NATURAL`,
                  node,
                ),
              );
            break;

          case "TEXTO":
            if (typeof value !== "string")
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor ${value} não é compatível com TEXTO`,
                  node,
                ),
              );
            break;

          case "LOGICO":
            if (typeof value !== "boolean")
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor ${value} não é compatível com LOGICO`,
                  node,
                ),
              );
            break;
        }

        this.simbols[node.id] = {
          value,
          type: node.varType,
        };

        break;
      }

      // Atribuição de valor a variável
      case "Assignment": {
        const symbol = this.simbols[node.id];

        if (!symbol) {
          throw new Error(
            this.formatError(
              "Variável Não Declarada",
              `Variável '${node.id}' não foi declarada`,
              node,
            ),
          );
        }

        const newValue = await this.visit(node.value);

        // Validação de tipo
        switch (symbol.type) {
          case "INTEIRO":
            if (!Number.isInteger(newValue))
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Variável '${node.id}' espera INTEIRO`,
                  node,
                ),
              );
            break;

          case "REAL":
            if (typeof newValue !== "number")
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Variável '${node.id}' espera REAL`,
                  node,
                ),
              );
            break;

          case "NATURAL":
            if (!Number.isInteger(newValue) || newValue < 0)
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Variável '${node.id}' espera NATURAL`,
                  node,
                ),
              );
            break;

          case "TEXTO":
            if (typeof newValue !== "string")
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Variável '${node.id}' espera TEXTO`,
                  node,
                ),
              );
            break;

          case "LOGICO":
            if (typeof newValue !== "boolean")
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Variável '${node.id}' espera LOGICO`,
                  node,
                ),
              );
            break;
        }

        // Atribuição segura
        symbol.value = newValue;
        break;
      }

      // Comando print para saida de dados
      case "PrintStatement": {
        let output = "";

        for (const arg of node.arguments) {
          const value = await this.visit(arg);

          if (
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
          ) {
            throw new Error(
              this.formatError(
                "Erro de Tipo",
                "EXIBIR aceita apenas TEXTO, NUMERO ou LOGICO",
                node,
              ),
            );
          }

          // Formatação: REAL com vírgula
          if (typeof value === "number" && !Number.isInteger(value)) {
            output += value.toString().replace(".", ",");
          } else {
            output += value.toString();
          }
        }

        this.printCallback(output);
        break;
      }

      // Comando EXIBIR para entrada de dados
      case "InputStatement": {
        const symbol = this.simbols[node.id];

        if (!symbol) {
          throw new Error(
            this.formatError(
              "Variável Não Declarada",
              `Variável '${node.id}' não foi declarada`,
              node,
            ),
          );
        }

        const msg = node.promptMessage ?? "";

        let input = "";
        input = await this.inputCallback(msg + " ");

        switch (symbol.type) {
          case "INTEIRO": {
            if (!/^-?\d+$/.test(input)) {
              throw new Error(
                this.formatError(
                  "Entrada inválida",
                  `Esperado INTEIRO (apenas números), recebido '${input}'`,
                  node,
                ),
              );
            }
            const v = parseInt(input, 10);
            if (Number.isNaN(v)) {
              throw new Error(
                this.formatError(
                  "Entrada inválida",
                  `Esperado INTEIRO, recebido '${input}'`,
                  node,
                ),
              );
            }
            symbol.value = v;
            break;
          }

          case "REAL": {
            if (!/^-?\d+(,\d+)?$/.test(input)) {
              throw new Error(
                this.formatError(
                  "Entrada inválida",
                  `Esperado REAL (use vírgula, ex: 10,5), recebido '${input}'`,
                  node,
                ),
              );
            }
            const v = parseFloat(input.replace(",", "."));
            if (Number.isNaN(v)) {
              throw new Error(
                this.formatError(
                  "Entrada inválida",
                  `Esperado REAL (use vírgula), recebido '${input}'`,
                  node,
                ),
              );
            }
            symbol.value = v;
            break;
          }

          case "TEXTO":
            symbol.value = input;
            break;

          case "LOGICO":
            symbol.value = input === "VERDADEIRO";
            break;
        }

        break;
      }

      // Comando Para repetição
      case "WhileStatement": {
        let iterations = 0;
        const MAX_ITERATIONS = 10000;

        while (await this.visit(node.condition)) {
          let shouldContinue = false;

          try {
            for (const stmt of node.body) {
              await this.visit(stmt);
            }
          } catch (signal) {
            if (signal instanceof BreakSignal) {
              break;
            }

            if (signal instanceof ContinueSignal) {
              shouldContinue = true;
            } else {
              throw signal;
            }
          }

          iterations++;
          if (iterations > MAX_ITERATIONS) {
            throw new Error("Loop ENQUANTO excedeu 10000 iterações.");
          }

          if (shouldContinue) {
            continue;
          }
        }

        break;
      }

      case "ForStatement": {
        let iterations = 0;
        const MAX_ITERATIONS = 10000;

        // Inicialização
        await this.visit(node.init);

        while (true) {
          // Condição
          const cond = await this.visit(node.condition);
          if (!cond) break;

          let shouldContinue = false;

          try {
            for (const stmt of node.body) {
              await this.visit(stmt);
            }
          } catch (signal) {
            if (signal instanceof BreakSignal) {
              break;
            }

            if (signal instanceof ContinueSignal) {
              shouldContinue = true;
            } else {
              throw signal;
            }
          }

          // Incremento (SEMPRE EXECUTA)
          await this.visit(node.increment);

          iterations++;
          if (iterations > MAX_ITERATIONS) {
            throw new Error("Loop PARA excedeu 10000 iterações.");
          }

          if (shouldContinue) {
            continue;
          }
        }

        break;
      }

      case "DoWhileStatement": {
        let iterations = 0;
        const MAX_ITERATIONS = 10000;

        do {
          let shouldContinue = false;

          try {
            for (const stmt of node.body) {
              await this.visit(stmt);
            }
          } catch (signal) {
            if (signal instanceof BreakSignal) {
              break;
            }

            if (signal instanceof ContinueSignal) {
              shouldContinue = true;
            } else {
              throw signal;
            }
          }

          iterations++;
          if (iterations > MAX_ITERATIONS) {
            throw new Error("Loop FACA...ENQUANTO excedeu 10000 iterações.");
          }

          // continue no do...while cai aqui
          if (shouldContinue) {
            // não faz nada, apenas deixa cair para a condição
          }
        } while (await this.visit(node.condition));

        break;
      }

      // Controle de fluxo - PARAR
      case "BreakStatement": {
        throw new BreakSignal();
      }

      // Controle de fluxo - CONTINUAR
      case "ContinueStatement": {
        throw new ContinueSignal();
      }

      // Operações matemáticas especiais
      case "CalcStatement": {
        const operation = node.operation; // "RAIZ" ou "EXPOENTE"
        const args = node.arguments;

        if (args.length !== 2) {
          throw new Error(
            `CalcStatement precisa de 2 argumentos, encontrou ${args.length}`,
          );
        }

        // Avalia os dois argumentos
        const arg1 = await this.visit(args[0]); // pode ser qualquer expressão
        const arg2 = await this.visit(args[1]); // idem

        let result: number;

        switch (operation) {
          case "RAIZ":
            if (arg2 === 0)
              throw new Error("Não é possível calcular raiz de índice zero.");
            result = Math.pow(arg1, 1 / arg2);
            break;

          case "EXPOENTE":
            result = Math.pow(arg1, arg2);
            break;

          default:
            throw new Error(`Operação desconhecida: ${operation}`);
        }

        return result;
      }

      // Valor literal
      case "NumberLiteral":
        return node.value;

      // Expressao unária
      case "UnaryExpression":
        const val = await this.visit(node.argument);
        switch (node.operator) {
          case "-":
            return -val;
          case "!":
            return !val;
          default:
            throw new Error(`Operador unário desconhecido: ${node.operator}`);
        }

      // Texto literal
      case "StringLiteral":
        return node.value;

      // Valor lógico
      case "BooleanLiteral":
        return node.value;

      //

      case "IfStatement": {
        const cond = await this.visit(node.condition);

        if (typeof cond !== "boolean") {
          throw new Error(
            this.formatError(
              "Erro de Tipo",
              "Condição do SE deve ser lógica",
              node,
            ),
          );
        }

        if (cond) {
          // SE verdadeiro
          for (const stmt of node.trueBranch) {
            await this.visit(stmt);
          }
        } else if (node.falseBranch) {
          // Se Falso
          if (Array.isArray(node.falseBranch)) {
            for (const stmt of node.falseBranch) {
              await this.visit(stmt);
            }
          } else {
            // recursivamente visita o IfStatement (SENAO SE)
            await this.visit(node.falseBranch as ASTNode);
          }
        }

        break;
      }

      case "LogicalExpression":
        const l = await this.visit(node.left);
        const r = await this.visit(node.right);

        switch (node.operator) {
          case "==":
            return l === r;
          case "!=":
            return l !== r;
          case ">":
            return l > r;
          case "<":
            return l < r;
          case ">=":
            return l >= r;
          case "<=":
            return l <= r;
          case "E":
            return l && r;
          case "OU":
            return l || r;
        }

      // Identificador
      case "IDENTIFICADOR":
        const symbol = this.simbols[node.name];
        if (!symbol) {
          throw new Error(
            this.formatError(
              "Variável Não Declarada",
              `Variável \x1b[33m${node.name}\x1b[0m não foi declarada`,
              node,
            ),
          );
        }
        return symbol.value;

      // Expressão binária
      case "BinaryExpression":
        const left = await this.visit(node.left);
        const right = await this.visit(node.right);

        // Validação de tipos: ambos devem ser números
        if (typeof left !== "number" || typeof right !== "number") {
          const type1 = this.getUserFriendlyType(left);
          const type2 = this.getUserFriendlyType(right);
          throw new Error(
            this.formatError(
              "Tipo incompatível em expressão aritmética",
              `Operador '${node.operator}' não é válido entre ${type1} e ${type2}`,
              node,
            ),
          );
        }
        // Checar divisão por zero
        if (node.operator === "/" && right === 0) {
          throw new Error(
            this.formatError(
              "Expressão mal definida",
              `Não é possível dividir \x1b[33m${left}\x1b[0m por \x1b[33m${right}\x1b[0m (divisão por zero)`,
              node,
            ),
          );
        }

        switch (node.operator) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
          default:
            throw new Error(`Operador desconhecido: ${node.operator}`);
        }

      default:
        throw new Error(`Nó AST desconhecido: ${node.type}`);
    }
  }

  private getUserFriendlyType(value: any): string {
    if (typeof value === "number") return "INTEIRO"; // simplifies for now, maybe distinguish later if needed
    if (typeof value === "string") return "TEXTO";
    if (typeof value === "boolean") return "LOGICO";
    return typeof value;
  }
}

export default SemanticAnalyzer;
