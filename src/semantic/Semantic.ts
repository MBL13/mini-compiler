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
            return this.visit(node.left) + this.visit(node.right);
     
    }
  }
}

export default SemanticAnalyzer;