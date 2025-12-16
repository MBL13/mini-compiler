import { Token, TokenType } from "./ILexer";


class Lexer{

    private text : string;
    private position : number = 0;

    constructor(text : string){
        this.text = text
    }

    private peek(): string{
        return this.text[this.position] || "";
    }
    private advance(){
        this.position++;
    }

    public getNextToken():Token {
        while(this.position < this.text.length){
            const char = this.peek();
            const isBlankSpace = /\s/
            const isNumber = /[0-9]/
            const isWord = /[a-zA-Z]/

            if(isBlankSpace.test(char)){
                this.advance();
                continue;
            }

            if(char === "+"){
                this.advance();
                return {type: TokenType.PLUS, value: "+"}
            }
             if(char === "/"){
                this.advance();
                return {type: TokenType.DIVIDED, value: "/"}
            }

               if(char === "*"){
                this.advance();
                return {type: TokenType.MULT, value: "*"}
            }

               if(char === "-"){
                this.advance();
                return {type: TokenType.MINUS, value: "-"}
            }

             if(char === "="){
                this.advance();
                return {type: TokenType.ASSIGN, value: "="}
            }

             if(char === ";"){
                this.advance();
                return {type: TokenType.SEMICOLON, value: ";"}
            }
            if(isNumber.test(char)){
                let num = "";
                while(isNumber.test(this.peek())){
                    num += this.peek();
                    this.advance();
                }
                return {type: TokenType.NUMBER, value: num}
            }

            if(isWord.test(char)){
                let word = "";
                while(isWord.test(this.peek())){
                    word += this.peek();
                    this.advance();
                }

                if(word === "let") return {type: TokenType.LET,value : word}
                if(word === "print") return {type: TokenType.PRINT,value : word}
               
               return {type: TokenType.IDENTIFIER,value : word} 
            }
            throw new Error(`Caractere inválido: ${char}`);
        }

        return { type : TokenType.EOF, value:""}
    }

}

export default Lexer;