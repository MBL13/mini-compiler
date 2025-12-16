import Lexer from "./lexer/Lexer";
import Parser from "./parser/Parser";
import SemanticAnalyzer from "./semantic/Semantic";


const code = `
    let x = 5;
    let y = x + 3;
    print y;
`;
const lexer = new Lexer(code);
const parser = new Parser(lexer);
const ast = parser.parse();

const semantic = new SemanticAnalyzer();
semantic.execute(ast);