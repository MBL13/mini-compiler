import { Token, TokenType } from "../lexer/ILexer";
import Lexer from "../lexer/Lexer";
import ASTNode from "./IParser";


class Parser {

    private lexer : Lexer;
    private currentToken : Token;

    constructor(lexer: Lexer){
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    private eat(type: TokenType){
        if(this.currentToken.type === type){
            this.currentToken = this.lexer.getNextToken();
        }else{
            throw new Error(`Erro sintático: esperado ${type}, encontrado ${this.currentToken.type}`);
        }
    }
    private factor():ASTNode {
        const token = this.currentToken
        if(token.type === TokenType.NUMBER){
            this.eat(TokenType.NUMBER);
            return { type : "NumberLiteral", value: Number(token.value) }
        }

         if(token.type === TokenType.IDENTIFIER){
            this.eat(TokenType.IDENTIFIER);
            return { type : "Identifier", name: token.value }
        }
        throw new Error("Factor inválido");
    }

    private expr():ASTNode{
        let node = this.factor();
        while(this.currentToken.type === TokenType.PLUS){
            this.eat(TokenType.PLUS);
            node = {
                type: "BinaryExpression",
                operator: "+",
                left: node,
                right: this.factor()
            }
        }

         while(this.currentToken.type === TokenType.DIVIDED){
            this.eat(TokenType.DIVIDED);
            node = {
                type: "BinaryExpression",
                operator: "/",
                left: node,
                right: this.factor()
            }
        }

         while(this.currentToken.type === TokenType.MULT){
            this.eat(TokenType.MULT);
            node = {
                type: "BinaryExpression",
                operator: "*",
                left: node,
                right: this.factor()
            }
        }

         while(this.currentToken.type === TokenType.MINUS){
         
            this.eat(TokenType.MINUS);
            node = {
                type: "BinaryExpression",
                operator: "-",
                left: node,
                right: this.factor()
            }
        }



            return node;
    }
    
    private statement():ASTNode{
       if(this.currentToken.type === TokenType.LET){
         this.eat(TokenType.LET);

         const id = this.currentToken.value;
         this.eat(TokenType.IDENTIFIER);
         this.eat(TokenType.ASSIGN);

         const value = this.expr();
         this.eat(TokenType.SEMICOLON);

         return {
            type: "VariableDeclaration",
            id,
            value
         }
       } 
      if(this.currentToken.type === TokenType.PRINT){
        this.eat(TokenType.PRINT);

        const value = this.expr();
        this.eat(TokenType.SEMICOLON);

        return {
            type: "PrintStatement",
            value
        }
      }
    throw new Error(`Comando inválido`);
    }


    public parse():ASTNode[]{
        const statements : ASTNode[] = [];
        while(this.currentToken.type !== TokenType.EOF){
            statements.push(this.statement());
        }
        return statements
    }
}

export default Parser;