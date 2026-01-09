Lexer
A verificação de palavras reservadas está incompleta.
Falta adicionar simbolos ao lexer
Exemplo: 
1. let let
2. let let7
3. let var_

Nos 2 exemplos mostra a mesma mensagem de erro: 
 throw new Error(`Erro sintático: esperado ${type}, encontrado ${this.currentToken.type}`);
                  ^
Error: Erro sintático: esperado IDENTIFIER, encontrado LET

O exemplo 1 está realmente errado, mas a mensagem do erro deveria ser que esta é uma palavra reservada "let"

O exemplo 2 está correto, pois é permitido

Causa do problema:
arquivo lexer/Lexer.ts
    while (isWord.test(this.peek())) {
        word += this.peek();
        this.advance();
    }
Este trexo de código verifica apenas se é um caractere Albetico e caso tenha números ou simbolos mais a diante e antes encontrou uma palavra reservada mostra a mensagem de erro acima mencionada.

               


