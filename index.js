"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Lexer_1 = __importDefault(require("./lexer/Lexer"));
const Parser_1 = __importDefault(require("./parser/Parser"));
const Semantic_1 = __importDefault(require("./semantic/Semantic"));
const gerador_1 = require("./c\u00F3digointemerdiario/gerador");
const optimizar_1 = require("./c\u00F3digointemerdiario/optimizar");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const filePath = path_1.default.join(__dirname, "input", "code.nt");
const code = fs_1.default.readFileSync(filePath, "utf-8");
const lexer = new Lexer_1.default(code);
const parser = new Parser_1.default(lexer);
const ast = parser.parse();
const semantic = new Semantic_1.default();
semantic.execute(ast);
const generator = new gerador_1.TacGenerator;
const TacOriginal = generator.generate(ast);
console.log('TAC Antes da optimização');
console.log('tacOriginal');
const optimizar = new optimizar_1.TacOptimizer();
const Tacoptimized = optimizar.optimize(TacOriginal);
console.log('TAC Depois da Optimização:');
console.log(Tacoptimized);
//# sourceMappingURL=index.js.map