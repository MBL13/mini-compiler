
enum TokenType {
    NUMBER = "NUMBER",
    LET = "LET",
    PRINT = "PRINT",
    ASSIGN = "ASSIGN",
    MINUS = "MINUS",
    DIVIDED = "DIVIDED",
    MULT = "MULT",
    PLUS = "PLUS",
    SEMICOLON = "SEMICOLON",
    IDENTIFIER = "IDENTIFIER",
    EOF = "EOF"
}

interface Token {
    type : TokenType,
    value : string
}

export { Token, TokenType}