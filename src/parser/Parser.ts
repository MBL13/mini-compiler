import { Token, TokenType } from "../lexer/ILexer";
import Lexer from "../lexer/Lexer";
import ASTNode from "./IParser";

/**
 * O Parser é responsável por transformar uma sequência de Tokens em uma Árvore de Sintaxe Abstrata (AST).
 * Utiliza a técnica de Descida Recursiva para processar a gramática.
 */
class Parser {
    private lexer: Lexer;
    private currentToken: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    /**
     * Formata uma mensagem de erro com cores ANSI e informações detalhadas.
     */
    private formatError(
        errorType: string,
        details: string,
        token?: Token
    ): string {
        const t = token || this.currentToken;
        return `\x1b[31m========================================\x1b[0m
\x1b[31m[ERRO] ${errorType}\x1b[0m
\x1b[31m========================================\x1b[0m
\x1b[1mDetalhes:\x1b[0m
  - \x1b[36mArquivo:\x1b[0m \x1b[33m${this.lexer.filename}\x1b[0m
  - \x1b[36mLinha:\x1b[0m \x1b[33m${t.linha}\x1b[0m
  - \x1b[36mColuna:\x1b[0m \x1b[33m${t.coluna}\x1b[0m
  - \x1b[36mContexto:\x1b[0m ${details}`;
    }

    /**
     * Traduz nomes de tipos internos para nomes amigáveis ao usuário.
     */
    private translateTypeName(type: string): string {
        const translations: { [key: string]: string } = {
            NumberLiteral: "Numero literal",
            StringLiteral: "Texto literal",
            BooleanLiteral: "Valor logico literal",
            BinaryExpression: "Expressao binaria",
            UnaryExpression: "Expressao unaria",
            IDENTIFICADOR: "Identificador",
        };
        return translations[type] || type;
    }

    /**
     * Traduz nomes de tokens para nomes amigáveis em português.
     */
    private translateTokenName(type: TokenType): string {
        const translations: { [key in TokenType]?: string } = {
            [TokenType.PONTO]: "ponto final (.)",
            [TokenType.DOIS_PONTOS]: "dois pontos (:)",
            [TokenType.ATRIBUICAO]: "igual (=)",
            [TokenType.PARENTESE_ESQUERDO]: "parentese esquerdo '('",
            [TokenType.PARENTESE_DIREITO]: "parentese direito ')'",
            [TokenType.CHAVE_ESQUERDA]: "chave esquerda '{'",
            [TokenType.CHAVE_DIREITA]: "chave direita '}'",
        };
        return translations[type] || type;
    }

    /**
     * Consome o token atual se ele for do tipo esperado, caso contrário, lança um erro.
     */
    private eat(type: TokenType) {
        if (this.currentToken.type === type) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            let details = `Esperado \x1b[33m${this.translateTokenName(type)}\x1b[0m, encontrado \x1b[33m${this.translateTokenName(this.currentToken.type)}\x1b[0m`;

            if (type === TokenType.PONTO) {
                details = "Faltou o ponto final (.) ao terminar a linha.";
            }

            throw new Error(
                this.formatError(
                    "Erro Sintático",
                    details
                )
            );
        }
    }

    /**
     * Processa um 'fator', que pode ser um número ou um identificador.
     * Gramática: factor -> inteiro | IDENTIFICADOR
     */
    private factor(): ASTNode {
        const token = this.currentToken;

        // Caso: número negativo
        if (token.type === TokenType.MENOS) {
            this.eat(TokenType.MENOS);
            const node = this.factor(); // aplica o menos no próximo factor
            return {
                type: "UnaryExpression",
                operator: "-",
                argument: node,
                linha: token.linha,
                coluna: token.coluna,
            };
        }

        if (token.type === TokenType.INTEIRO || token.type === TokenType.REAL) {
            this.eat(token.type);
            return {
                type: "NumberLiteral",
                value: Number(token.value.replace(",", ".")),
                numberType: token.type,
                linha: token.linha,
                coluna: token.coluna,
            };
        }

        if (token.type === TokenType.TEXTO) {
            this.eat(TokenType.TEXTO);
            return {
                type: "StringLiteral",
                value: token.value,
                linha: token.linha,
                coluna: token.coluna,
            };
        }

        // Valores booleanos
        if (token.type === TokenType.VERDADEIRO || token.type === TokenType.FALSO) {
            this.eat(token.type);
            return {
                type: "BooleanLiteral",
                value: token.type === TokenType.VERDADEIRO, // true se VERDADEIRO, false se FALSO
                linha: token.linha,
                coluna: token.coluna,
            };
        }

        // Caso: expressão entre parênteses
        if (token.type === TokenType.PARENTESE_ESQUERDO) {
            this.eat(TokenType.PARENTESE_ESQUERDO);
            const node = this.expr(); // avalia a expressão interna
            this.eat(TokenType.PARENTESE_DIREITO);
            return node;
        }

        if (token.type === TokenType.IDENTIFICADOR) {
            this.eat(TokenType.IDENTIFICADOR);
            return { type: "IDENTIFICADOR", name: token.value, linha: token.linha, coluna: token.coluna };
        }

        if ((token.type as any) === TokenType.EOF) {
            throw new Error(
                this.formatError(
                    "Operador sem operando",
                    "Operador sem operando à direita"
                )
            );
        }

        throw new Error(
            this.formatError(
                "Fator Inválido",
                `Token inesperado: \x1b[33m${this.translateTokenName(token.type)}\x1b[0m`
            )
        );
    }

    /**
     * Processa termos (multiplicação e divisão).
     * Gramática: term -> factor ((MULTIPLICACAO | DIVISAO) factor)*
     */
    private term(): ASTNode {
        var node = this.factor();

        while (
            this.currentToken.type === TokenType.MULTIPLICACAO ||
            this.currentToken.type === TokenType.DIVISAO
        ) {
            const operatorToken = this.currentToken;
            const operator = operatorToken.type;
            this.eat(operator);

            node = {
                type: "BinaryExpression",
                operator: operator === TokenType.MULTIPLICACAO ? "*" : "/",
                left: node,
                right: this.factor(),
                linha: operatorToken.linha,
                coluna: operatorToken.coluna,
            };
        }

        return node;
    }

    /**
     * Processa expressões aritméticas respeitando a precedência e associatividade.
     * Gramática: expr -> term ((MAIS | MENOS) term)*
     */
    private expr(): ASTNode {
        var node = this.term();

        while (
            this.currentToken.type === TokenType.MAIS ||
            this.currentToken.type === TokenType.MENOS
        ) {
            const operatorToken = this.currentToken;
            const operator = operatorToken.type;
            this.eat(operator);

            node = {
                type: "BinaryExpression",
                operator: operator === TokenType.MAIS ? "+" : "-",
                left: node,
                right: this.term(),
                linha: operatorToken.linha,
                coluna: operatorToken.coluna,
            };
        }

        return node;
    }

    /**
     * Processa um comando (statement), como declaração de variável ou comando de impressão.
     * Gramática:
     *  - statement -> VAR IDENTIFICADOR ATRIBUICAO expr PONTO
     *  - statement -> exibir expr PONTO
     */
    private statement(): ASTNode {
        // Caso: var x = expression: TIPO;
        if (this.currentToken.type === TokenType.VAR) {
            const varToken = this.currentToken;
            this.eat(TokenType.VAR);

            const idToken = this.currentToken;
            if ((idToken.type as any) !== TokenType.IDENTIFICADOR) {
                let errorMsg = "Identificador esperado após VAR";
                if (
                    (idToken.type as any) === TokenType.VAR ||
                    (idToken.type as any) === TokenType.EXIBIR ||
                    (idToken.type as any) === TokenType.INTEIRO ||
                    (idToken.type as any) === TokenType.REAL ||
                    (idToken.type as any) === TokenType.NATURAL ||
                    (idToken.type as any) === TokenType.TEXTO ||
                    (idToken.type as any) === TokenType.LOGICO ||
                    (idToken.type as any) === TokenType.SE ||
                    (idToken.type as any) === TokenType.SENAO ||
                    (idToken.type as any) === TokenType.VERDADEIRO ||
                    (idToken.type as any) === TokenType.FALSO
                ) {
                    errorMsg = "Palavra reservada não pode ser usada como identificador";
                }

                throw new Error(
                    this.formatError(
                        "Declaração incompleta",
                        errorMsg
                    )
                );
            }

            const id = idToken.value;
            this.eat(TokenType.IDENTIFICADOR);

            if ((this.currentToken.type as any) !== TokenType.ATRIBUICAO) {
                throw new Error(
                    this.formatError(
                        "Declaração incompleta",
                        "Esperado '=' após identificador"
                    )
                );
            }
            this.eat(TokenType.ATRIBUICAO);

            const value = this.expr();

            this.eat(TokenType.DOIS_PONTOS);

            const varType = this.currentToken;
            if (
                varType.type === TokenType.INTEIRO ||
                varType.type === TokenType.REAL ||
                varType.type === TokenType.NATURAL ||
                varType.type === TokenType.TEXTO ||
                varType.type === TokenType.LOGICO
            ) {
                // Validação de Tipos no Parser (Sintaxe Estendida)
                /* 
                if (
                    varType.type === TokenType.TEXTO &&
                    value.type !== "StringLiteral"
                ) {
                    throw new Error(
                        this.formatError(
                            "Erro de Tipo (TEXTO)",
                            `Variável do tipo \x1b[33mTEXTO\x1b[0m deve receber uma string entre aspas. Encontrado: \x1b[33m${this.translateTypeName(value.type)}\x1b[0m`,
                            varType
                        )
                    );
                }
                */

                if (
                    varType.type === TokenType.LOGICO &&
                    value.type !== "BooleanLiteral"
                ) {
                    throw new Error(
                        this.formatError(
                            "Erro de Tipo (LOGICO)",
                            `Variável do tipo \x1b[33mLOGICO\x1b[0m deve receber \x1b[33mVERDADEIRO\x1b[0m ou \x1b[33mFALSO\x1b[0m. Encontrado: \x1b[33m${this.translateTypeName(value.type)}\x1b[0m`,
                            varType
                        )
                    );
                }

                if (varType.type === TokenType.NATURAL) {
                    // Checa se é um literal numérico negativo (UnaryExpression com operador -)
                    if (value.type === "UnaryExpression" && value.operator === "-") {
                        throw new Error(
                            this.formatError(
                                "Erro de Tipo (NATURAL)",
                                `Variável do tipo \x1b[33mNATURAL\x1b[0m não pode receber número negativo.`,
                                varType
                            )
                        );
                    }
                }

                this.eat(varType.type);
            } else {
                throw new Error(
                    this.formatError(
                        "Tipo de Variável Não Declarado",
                        `Tipo da variável \x1b[33m${id}\x1b[0m não foi declarado ou tipo \x1b[33m${varType.value}\x1b[0m é inválido. Esperado um dos tipos: \x1b[33mINTEIRO, REAL, NATURAL, TEXTO, LOGICO\x1b[0m`,
                        varType
                    )
                );
            }

            this.eat(TokenType.PONTO);
            return {
                type: "VariableDeclaration",
                id,
                value,
                varType: varType.type,
                linha: varToken.linha,
                coluna: varToken.coluna,
            };
        }

        // Caso: print expression;
        if (this.currentToken.type === TokenType.EXIBIR) {
            const exibirToken = this.currentToken;
            this.eat(TokenType.EXIBIR);

            if ((this.currentToken.type as any) !== TokenType.PARENTESE_ESQUERDO) {
                throw new Error(
                    this.formatError(
                        "EXIBIR sem parênteses",
                        "Esperado '(' após EXIBIR"
                    )
                );
            }
            this.eat(TokenType.PARENTESE_ESQUERDO);

            if ((this.currentToken.type as any) === TokenType.PARENTESE_DIREITO) {
                throw new Error(
                    this.formatError(
                        "Expressão vazia",
                        "Expressão vazia não é permitida"
                    )
                );
            }

            const value = this.expr();
            this.eat(TokenType.PARENTESE_DIREITO);
            this.eat(TokenType.PONTO);

            return {
                type: "PrintStatement",
                value,
                linha: exibirToken.linha,
                coluna: exibirToken.coluna,
            };
        }

        // caso: SE
        if (this.currentToken.type === TokenType.SE) {
            const seToken = this.currentToken;
            this.eat(TokenType.SE);
            this.eat(TokenType.PARENTESE_ESQUERDO);

            const condition = this.logicalExpr();
            this.eat(TokenType.PARENTESE_DIREITO);
            this.eat(TokenType.CHAVE_ESQUERDA);

            const trueBranch = this.block();
            this.eat(TokenType.CHAVE_DIREITA);

            return {
                type: "IfStatement",
                condition,
                trueBranch,
                linha: seToken.linha,
                coluna: seToken.coluna,
            };
        }

        // comando inválido
        throw new Error(
            this.formatError(
                "Comando Inválido",
                `Token \x1b[33m${this.currentToken.value}\x1b[0m não pode iniciar um comando. Comandos válidos: \x1b[33mVAR\x1b[0m, \x1b[33mEXIBIR\x1b[0m, \x1b[33mSE\x1b[0m`
            )
        );
    }

    /**
     * Inicia o processo de análise sintática e retorna a lista de nós da AST.
     */
    public parse(): ASTNode[] {
        const statements: ASTNode[] = [];
        while (this.currentToken.type !== TokenType.EOF) {
            statements.push(this.statement());
        }
        return statements;
    }

    /**
     * Expressão lógica
     * Por enquanto aceita apenas literais booleanos ou identificadores
     */
    private logicalExpr(): ASTNode {
        let left = this.factor();

        if (
            this.currentToken.type === TokenType.IGUALDADE ||
            this.currentToken.type === TokenType.DIFERENTE_DE ||
            this.currentToken.type === TokenType.MAIOR_QUE ||
            this.currentToken.type === TokenType.MENOR_QUE ||
            this.currentToken.type === TokenType.MAIOR_OU_IGUAL ||
            this.currentToken.type === TokenType.MENOR_OU_IGUAL
        ) {
            const operatorToken = this.currentToken;
            this.eat(operatorToken.type);

            const right = this.factor();

            return {
                type: "LogicalExpression",
                operator: operatorToken.value,
                left,
                right,
                linha: operatorToken.linha,
                coluna: operatorToken.coluna,
            };
        }

        return left;
    }

    private block(): ASTNode[] {
        const nodes: ASTNode[] = [];

        while (this.currentToken.type !== TokenType.CHAVE_DIREITA) {
            nodes.push(this.statement());
        }

        return nodes;
    }
}

export default Parser;
