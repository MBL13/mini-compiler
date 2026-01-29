"use strict";
// src/ir/generator.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TacGenerator = void 0;
const IParser_1 = require("../parser/IParser");
let tempCounter = 0;
function newTemp() {
    return `t${++tempCounter}`;
}
class TacGenerator {
    program = [];
    generate(ast) {
        for (const node of ast) {
            this.visit(node);
        }
        return this.program;
    }
    visit(node) {
        if (node instanceof IParser_1.AstNode) {
            const initValue = this.visit(node.initializer);
            this.program.push({ op: '=', arg1: initValue, result: node.name });
            return node.name;
        }
        else if (node instanceof IParser_1.AstNode) {
            const value = this.visit(node.value);
            this.program.push({ op: '=', arg1: value, result: node.target });
            return node.target;
        }
        else if (node instanceof IParser_1.AstNode) {
            const left = this.visit(node.left);
            const right = this.visit(node.right);
            const temp = newTemp();
            this.program.push({ op: node.op, arg1: left, arg2: right, result: temp });
            return temp;
        }
        else if (node instanceof IParser_1.AstNode) {
            const arg = this.visit(node.expression);
            this.program.push({ op: 'print', arg1: arg });
            return arg;
        }
        else if (typeof node === 'number' || typeof node === 'string') { // Literais
            const temp = newTemp();
            this.program.push({ op: '=', arg1: node.toString(), result: temp });
            return temp;
        }
        throw new Error(`Node não suportado: ${node}`);
    }
}
exports.TacGenerator = TacGenerator;
//# sourceMappingURL=gerador.js.map