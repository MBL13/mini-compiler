

/**
 * Representa um nó na Árvore de Sintaxe Abstrata (AST).
 */
interface ASTNode {
    type: string;           // Tipo do nó (ex: VariableDeclaration, BinaryExpression)
    linha?: number;         // Linha onde o nó ocorre
    coluna?: number;        // Coluna onde o nó ocorre
    [key: string]: any    // Propriedades dinâmicas dependendo do tipo do nó
}

export default ASTNode;