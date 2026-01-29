// src/ir/optimizer.ts

import { TacInstruction, TacProgram } from "./tac";

export class TacOptimizer {

  optimize(program: TacProgram): TacProgram {
    let result = [...program];

    result = this.constantPropagation(result);
    result = this.commonSubexpressionElimination(result);
    result = this.deadCodeElimination(result);

    return result;
  }

  /* =====================================
   * Propagação e dobra de constantes
   * ===================================== */
  private constantPropagation(program: TacProgram): TacProgram {
    const constants = new Map<string, string>();
    const newProgram: TacProgram = [];

    for (const instr of program) {
      const arg1 = instr.arg1 ? this.resolve(instr.arg1, constants) : undefined;
      const arg2 = instr.arg2 ? this.resolve(instr.arg2, constants) : undefined;

      /* -------- Atribuição -------- */
      if (instr.op === "=" && instr.result) {

        if (arg1 !== undefined && this.isConstant(arg1)) {
          constants.set(instr.result, arg1);
        } else {
          constants.delete(instr.result);
        }

        const updatedInstr: TacInstruction = {
          op: instr.op,
          result: instr.result,
        };
        
        if (arg1 !== undefined) updatedInstr.arg1 = arg1;
        if (arg2 !== undefined) updatedInstr.arg2 = arg2;
        
        newProgram.push(updatedInstr);
        
        continue;
      }

      /* -------- Expressões -------- */
      if (this.isArithmetic(instr.op) && arg1 && arg2 && this.isConstant(arg1) && this.isConstant(arg2)) {

        const value = this.eval(instr.op, arg1, arg2);
        constants.set(instr.result!, value);

        const updatedInstr: TacInstruction = {
          op: instr.op,
        };
        
        if (arg1 !== undefined) updatedInstr.arg1 = arg1;
        if (arg2 !== undefined) updatedInstr.arg2 = arg2;
        if (instr.result !== undefined) updatedInstr.result = instr.result;
        
        newProgram.push(updatedInstr);
        
        continue;
      }

      /* -------- Fallback -------- */
      const instrCopy: TacInstruction = { op: instr.op };
      if (arg1 !== undefined) instrCopy.arg1 = arg1;
      if (arg2 !== undefined) instrCopy.arg2 = arg2;
      if (instr.result !== undefined) instrCopy.result = instr.result;

      newProgram.push(instrCopy);
    }

    return newProgram;
  }

  /* =====================================
   * Eliminação de subexpressões comuns
   * ===================================== */
  private commonSubexpressionElimination(program: TacProgram): TacProgram {
    const exprMap = new Map<string, string>();
    const newProgram: TacProgram = [];

    for (const instr of program) {

      if (
        this.isArithmetic(instr.op) &&
        instr.arg1 &&
        instr.arg2 &&
        instr.result
      ) {
        const key = `${instr.op}|${instr.arg1}|${instr.arg2}`;

        if (exprMap.has(key)) {
          newProgram.push({
            op: "=",
            arg1: exprMap.get(key)!,
            result: instr.result
          });
          continue;
        }

        exprMap.set(key, instr.result);
      }

      newProgram.push({ ...instr });
    }

    return newProgram;
  }

  /* =====================================
   * Eliminação de código morto
   * ===================================== */
  private deadCodeElimination(program: TacProgram): TacProgram {
    const used = new Set<string>();

    for (let i = program.length - 1; i >= 0; i--) {
      const instr = program[i] as any;

      if (instr.op === "print" && instr.arg1) {
        used.add(instr.arg1);
        continue;
      }

      if (instr.result && used.has(instr.result)) {
        if (instr.arg1) used.add(instr.arg1);
        if (instr.arg2) used.add(instr.arg2);
      }
    }

    return program.filter(instr =>
      instr.op === "print" ||
      (instr.result && used.has(instr.result))
    );
  }

  /* =====================================
   * Utilitários
   * ===================================== */
  private resolve(name: string, constants: Map<string, string>): string {
    return constants.get(name) ?? name;
  }

  private isConstant(value: string): boolean {
    return !isNaN(Number(value));
  }

  private isArithmetic(op: string): boolean {
    return op === "+" || op === "-" || op === "*" || op === "/";
  }

  private eval(op: string, a: string, b: string): string {
    const x = Number(a);
    const y = Number(b);

    switch (op) {
      case "+": return (x + y).toString();
      case "-": return (x - y).toString();
      case "*": return (x * y).toString();
      case "/": return (x / y).toString();
      default: throw new Error(`Operador inválido: ${op}`);
    }
  }
}
