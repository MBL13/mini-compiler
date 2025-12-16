import ASTNode from "../parser/IParser";


class SemanticAnalyzer {

  private simbols : Record<string,number> = {}

  public execute(ast:ASTNode[]){
    for(const node of ast){
        this.visit(node);
    }
  }
  private visit(node : ASTNode):any{
    switch(node.type){
        case "VariableDeclaration":
            const value = this.visit(node.value);
            this.simbols[node.id] = value
            break;

        case "PrintStatement":
             console.log(this.visit(node.value))
            break;

        case "NumberLiteral":
            return node.value;

        case "Identifier":
            if(!(node.name in this.simbols)){
                throw new Error(`Erro semântico: variavel ${node.name} não foi declarada`);
            }
            return this.simbols[node.name];
        case "BinaryExpression":
                switch(node.operator){
                    case "+" : return this.visit(node.left) + this.visit(node.right);
                    case "-" : return this.visit(node.left) - this.visit(node.right);
                    case "*" : return this.visit(node.left) * this.visit(node.right);
                    case "/" : 
                            if(this.visit(node.right) === 0){
                                throw new Error(`Expressão mal definida: ${this.visit(node.left)} ${node.operator} ${this.visit(node.right)} . Não é possível dividir por zero`);
                            }
                            return this.visit(node.left) / this.visit(node.right);
                }
            break; 
     
    }
  }
}

export default SemanticAnalyzer;