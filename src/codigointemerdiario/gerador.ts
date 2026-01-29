
import Parser  from '../parser/Parser';  // Ajusta o import da tua AST
import { TacProgram } from './tac';
import ASTNode from '../parser/IParser';

let tempCounter = 0;

function newTemp(): string {
  return `t${++tempCounter}`;
}

export class TacGenerator {
  private program: TacProgram = [];

  generate(ast: ASTNode[]): TacProgram {
    for (const node of ast) {
      this.visit(node);
    }
    return this.program;
  }

  private visit(node: ASTNode): string {
    if (node instanceof Parser) {
      const initValue = this.visit(node.initializer);
      this.program.push({ op: '=', arg1: initValue, result: node.name });
      return node.name;
    } else if (node instanceof Parser) {
      const value = this.visit(node.value);
      this.program.push({ op: '=', arg1: value, result: node.target });
      return node.target;
    } else if (node instanceof Parser) {
      const left = this.visit(node.left);
      const right = this.visit(node.right);
      const temp = newTemp();
      this.program.push({ op: node.op, arg1: left, arg2: right, result: temp });
      return temp;
    } else if (node instanceof Parser) {
      const arg = this.visit(node.expression);
      this.program.push({ op: 'print', arg1: arg });
      return arg;
    } else if (typeof node === 'number' || typeof node === 'string') {  // Literais
      const temp = newTemp();
      this.program.push({ op: '=', arg1: (node as any).toString(), result: temp });
      return temp;
    }
    throw new Error(`Node não suportado: ${node}`);
  }
}