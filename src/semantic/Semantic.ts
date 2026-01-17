import ASTNode from "../parser/IParser";

interface Symbol {
  value: number | string | boolean;
  type: "INTEIRO" | "REAL" | "NATURAL" | "TEXTO" | "LOGICO";
}

/**
 * O SemanticAnalyzer percorre a AST para validar semântica e executar os comandos.
 * Ele mantém uma tabela de símbolos para armazenar valores e tipos das variáveis.
 */
class SemanticAnalyzer {
  private simbols: Record<string, Symbol> = {};
  private filename: string;

  constructor(filename: string = "code.sa") {
    this.filename = filename;
  }

  /**
   * Formata uma mensagem de erro com cores ANSI e informações detalhadas.
   */
  private formatError(
    errorType: string,
    details: string,
    node: ASTNode
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
  public execute(ast: ASTNode[]) {
    for (const node of ast) {
      this.visit(node);
    }
  }

  /**
   * Função recursiva que visita cada nó da AST e executa a lógica correspondente.
   */
  private visit(node: ASTNode): any {
    switch (node.type) {
      // Declaração de variável
      case "VariableDeclaration":
        const value = this.visit(node.value);

        // Validação de tipo
        switch (node.varType) {
          case "INTEIRO":
            if (!Number.isInteger(value)) {
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor \x1b[33m${value}\x1b[0m não é compatível com tipo \x1b[33mINTEIRO\x1b[0m`,
                  node
                )
              );
            }
            break;
          case "REAL":
            if (typeof value !== "number") {
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor \x1b[33m${value}\x1b[0m não é compatível com tipo \x1b[33mREAL\x1b[0m`,
                  node
                )
              );
            }
            break;
          case "NATURAL":
            if (!Number.isInteger(value) || value < 0) {
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor \x1b[33m${value}\x1b[0m não é compatível com tipo \x1b[33mNATURAL\x1b[0m`,
                  node
                )
              );
            }
            break;
          case "TEXTO":
            if (typeof value !== "string") {
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor \x1b[33m${value}\x1b[0m não é compatível com tipo \x1b[33mTEXTO\x1b[0m`,
                  node
                )
              );
            }
            break;
          case "LOGICO":
            if (typeof value !== "boolean") {
              throw new Error(
                this.formatError(
                  "Tipo Incompatível",
                  `Valor \x1b[33m${value}\x1b[0m não é compatível com tipo \x1b[33mLOGICO\x1b[0m`,
                  node
                )
              );
            }
            break;
        }

        this.simbols[node.id] = { value, type: node.varType };
        break;
      // Comando print
      case "PrintStatement":
        console.log(this.visit(node.value));
        break;

      // Valor literal
      case "NumberLiteral":
        return node.value;

      // Expressao unária
      case "UnaryExpression":
        const val = this.visit(node.argument);
        switch (node.operator) {
          case "-":
            return -val;
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
        const cond = this.visit(node.condition);

        if (typeof cond !== "boolean") {
          throw new Error(
            this.formatError(
              "Erro de Tipo",
              "Condição do SE deve ser lógica",
              node
            )
          );
        }

        if (cond) {
          node.trueBranch.forEach((stmt: ASTNode) => this.visit(stmt));
        }

        break;
      }

      case "LogicalExpression":
        const l = this.visit(node.left);
        const r = this.visit(node.right);

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


        }

      // Identificador
      case "IDENTIFICADOR":
        const symbol = this.simbols[node.name];
        if (!symbol) {
          throw new Error(
            this.formatError(
              "Variável Não Declarada",
              `Variável \x1b[33m${node.name}\x1b[0m não foi declarada`,
              node
            )
          );
        }
        return symbol.value;

      // Expressão binária
      case "BinaryExpression":
        const left = this.visit(node.left);
        const right = this.visit(node.right);

        // Validação de tipos: ambos devem ser números
        if (typeof left !== "number" || typeof right !== "number") {
          const type1 = this.getUserFriendlyType(left);
          const type2 = this.getUserFriendlyType(right);
          throw new Error(
            this.formatError(
              "Tipo incompatível em expressão aritmética",
              `Operador '${node.operator}' não é válido entre ${type1} e ${type2}`,
              node
            )
          );
        }
        // Checar divisão por zero
        if (node.operator === "/" && right === 0) {
          throw new Error(
            this.formatError(
              "Expressão mal definida",
              `Não é possível dividir \x1b[33m${left}\x1b[0m por \x1b[33m${right}\x1b[0m (divisão por zero)`,
              node
            )
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
