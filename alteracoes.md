# Mini-Compiler – Registro de Alterações

## Versão 0.2.0 – 2026-01-11

### Motivação
Reestruturar a sintaxe da linguagem para melhorar legibilidade,
aproximar de linguagens modernas e preparar o compilador para
 verificação de tipos.

---

## 1. ILexer

### Alterações
- Tradução dos lexemas para português
- Alteração da tabela de símbolos
- Adição de delimitadores
- Inclusão de tipos de variáveis
- Inclusão de operadores de comparação

### Novos Tokens
- VAR
- DOIS_PONTOS (:)
- NATURAL
- INTEIRO
- REAL
- Operadores relacionais (>, <, ==, !=, <=, >=)

---

## 2. Lexer

### Alterações
- Reconhecimento dos novos lexemas definidos no ILexer
- Suporte aos delimitadores: ponto e parenteses
- 



## 3. Parser

### Alterações na Sintaxe

#### Antes:

```
LET IDENTIFICADOR = expr TIPO ;
```

```
EXIBIR IDENTIFICADOR.

```

#### Depois:

```
VAR IDENTIFICADOR = expr : TIPO .
```
```
EXIBIR(IDENTIFICADOR).
```
---