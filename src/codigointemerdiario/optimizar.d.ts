import { TacProgram } from './tac';
export declare class TacOptimizer {
    optimize(program: TacProgram): TacProgram;
    private constantPropagation;
    private replaceWithConstant;
    private commonSubexpressionElimination;
    private deadCodeElimination;
}
//# sourceMappingURL=optimizar.d.ts.map