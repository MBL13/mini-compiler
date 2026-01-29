// src/ir/generator.ts

import ASTNode from "../parser/IParser";
import { TacProgram } from "./tac";

let tempCounter = 0;

function newTemp(): string {
  return `t${++tempCounter}`;
}

export class TacGenerator {
  private program: TacProgram = [];

  generate(ast: ASTNode[]): TacProgram {
    this.program = [];
    tempCounter = 0;

    for (const node of ast) {
      this.visit(node);
    }

    return this.program;
  }

  private visit(node: ASTNode): string {
    switch (node.type) {

      /* ============================
       * Declaração de Variável
       * ============================ */
      case "VariableDeclaration": {
        const value = this.visit(node.initializer);
        this.program.push({
          op: "=",
          arg1: value,
          result: node.name
        });
        return node.name;
      }

      /* ============================
       * Atribuição
       * ============================ */
      case "Assignment": {
        const value = this.visit(node.value);
        this.program.push({
          op: "=",
          arg1: value,
          result: node.target
        });
        return node.target;
      }

      /* ============================
       * Expressão Binária
       * ============================ */
      case "BinaryExpression": {
        const left = this.visit(node.left);
        const right = this.visit(node.right);
        const temp = newTemp();

        this.program.push({
          op: node.operator,
          arg1: left,
          arg2: right,
          result: temp
        });

        return temp;
      }

      /* ============================
       * Impressão
       * ============================ */
      case "PrintStatement": {
        const arg = this.visit(node.expression);
        this.program.push({
          op: "print",
          arg1: arg
        });
        return arg;
      }

      /* ============================
       * Literais
       * ============================ */
      case "NumberLiteral":
      case "StringLiteral":
      case "BooleanLiteral": {
        const temp = newTemp();
        this.program.push({
          op: "=",
          arg1: node.value.toString(),
          result: temp
        });
        return temp;
      }

      /* ============================
       * Identificador
       * ============================ */
      case "IDENTIFICADOR":
        return node.name;

      default:
        throw new Error(`Tipo de nó AST não suportado no TAC: ${node.type}`);
    }
  }
}
