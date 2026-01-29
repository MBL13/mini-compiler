# Catálogo Completo de Mensagens de Erro

Este documento contém a lista exaustiva de todas as mensagens de erro que o mini-compilador pode emitir, organizadas por módulo.

---

## 1. Analisador Léxico (Lexer)
Focado em erros de caracteres, limites de tamanho e formação de tokens básicos.

| Erro | Contexto / Detalhe | Exemplo |
| :--- | :--- | :--- |
| **Caractere inválido** | Caractere não reconhecido pela linguagem. | `@`, `#`, `$` |
| **Formato de número real inválido** | Uso de `.` em vez de `,` para decimal. | `10.5` |
| **Número real inválido** | Mais de uma vírgula ou termina com vírgula. | `10,5,2` ou `12,` |
| **Número muito grande** | Excede o limite de 15 dígitos. | `1234567890123456` |
| **Identificador inválido** | Começa com número ou prefixo de palavra reservada. | `1nome` ou `VARabc` |
| **Palavra reservada inválida** | Palavra reservada mal formada. | `VARx`, `EXIBIRy` |
| **String não terminada** | Aspas abertas mas nunca fechadas. | `"texto...` |
| **String muito grande** | Excede o limite de 500 caracteres. | `"..."` (muito longo) |
| **Comentário em bloco não fechado** | `/*` sem o correspondente `*/`. | `/* comentário...` |

---

## 2. Analisador Sintático (Parser)
Focado na gramática, estrutura dos comandos e tipos estáticos básicos.

| Erro | Contexto / Detalhe | Exemplo |
| :--- | :--- | :--- |
| **Erro Sintático** | Falta de token esperado (ex: ponto final). | `VAR x = 1` (sem `.`) |
| **Erro Sintático** | Token inesperado em vez do esperado. | `VAR x : INTEIRO.` (falta `=`) |
| **Operador sem operando** | Operador no final da expressão. | `VAR x = 10 + .` |
| **Fator Inválido** | Token que não pode ser um valor. | `VAR x = * 5.` |
| **Declaração incompleta** | Identificador esperado após `VAR`. | `VAR 10 = 10.` |
| **Declaração incompleta** | Uso de palavra reservada como nome. | `VAR EXIBIR = 10.` |
| **Declaração incompleta** | Falta do sinal de igual `=` na atribuição. | `VAR x 10 : INTEIRO.` |
| **Erro de Tipo (LOGICO)** | Atribuição de não-booleano a `LOGICO`. | `VAR b = 10 : LOGICO.` |
| **Erro de Tipo (NATURAL)** | Atribuição de negativo a `NATURAL`. | `VAR n = -1 : NATURAL.` |
| **Tipo de Variável Não Declarado** | Tipo desconhecido ou inválido. | `VAR x = 10 : ABC.` |
| **EXIBIR sem parênteses** | Falta de `(` após o comando `EXIBIR`. | `EXIBIR 10.` |
| **Expressão vazia** | Parênteses vazios no `EXIBIR`. | `EXIBIR().` |
| **Comando Inválido** | Início de linha com token não suportado. | `x = 10.` (falta `VAR`) |

---

## 3. Analisador Semântico (Semantic)
Focado na lógica, tipos em tempo de execução e operações.

| Erro | Contexto / Detalhe | Exemplo |
| :--- | :--- | :--- |
| **Tipo Incompatível** | Valor não condiz com o tipo declarado. | `VAR x = 10,5 : INTEIRO.` |
| **Erro de Tipo** | Condição do `SE` não é lógica. | `SE (10 + 5) { ... }` |
| **Variável Não Declarada** | Uso de variável sem definição prévia. | `EXIBIR(z).` |
| **Tipo incompatível em expressão aritmética** | Operação entre tipos não numéricos. | `"texto" + 10` |
| **Expressão mal definida** | Erro de **divisão por zero**. | `10 / 0` |
| **Operador unário desconhecido** | Erro interno: operador "-", etc. | *(Erro técnico)* |
| **Operador desconhecido** | Erro interno: operador aritmético inválido. | *(Erro técnico)* |
| **Nó AST desconhecido** | Erro interno: estrutura da árvore inválida. | *(Erro técnico)* |
