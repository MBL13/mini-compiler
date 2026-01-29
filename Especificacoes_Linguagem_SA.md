# Especificações da Linguagem .sa (SeteAO)

Este documento detalha o funcionamento interno e as regras gramaticais da linguagem baseada na implementação atual do compilador.

## 1. Estruturas de Controlo (Sintaxe Detalhada)

A linguagem utiliza chavetas `{ }` para delimitar blocos de código e parênteses `( )` para condições.

### Condicionais (SE / SENAO)
```sa
SE (condição) {
    # código
} SENAO SE (condição) {
    # código
} SENAO {
    # código
}
```

### Ciclo ENQUANTO
```sa
ENQUANTO (condição) {
    # código
}
```

### Ciclo PARA
```sa
PARA (inicialização; condição; incremento) {
    # código
}
```
*   **Inicialização**: Pode ser uma declaração `VAR i = 0 : INTEIRO` ou uma atribuição `i = 0`.
*   **Separadores**: Utiliza ponto e vírgula `;`.

### Ciclo FACA...ENQUANTO
```sa
FACA {
    # código
} ENQUANTO (condição).
```
*   **Nota**: Diferente das outras estruturas, esta termina com um ponto final `.` após a condição.

---

## 2. Operadores e Precedência

### Operadores Aritméticos
| Símbolo | Operação | Símbolo | Operação |
|---|---|---|---|
| `+` | Soma | `++` | Incremento |
| `-` | Subtração / Unário | `--` | Decremento |
| `*` | Multiplicação | `+=` | Soma atributiva |
| `/` | Divisão | `-=` | Subtração atributiva |

### Operadores Relacionais
| Símbolo | Descrição |
|---|---|
| `==` | Igual a |
| `!=` | Diferente de |
| `>` | Maior que |
| `<` | Menor que |
| `>=` | Maior ou igual a |
| `<=` | Menor ou igual a |

### Operadores Lógicos
Embora reservados no Lexer, os operadores `E`, `OU` e `NAO` atualmente **não estão implementados** na gramática do Parser para expressões complexas. Apenas comparações simples são suportadas em estruturas de controlo.

### Precedência (da maior para a menor)
1.  **Explícita**: Parênteses `( )`
2.  **Unária**: `-` (negativo), `RAIZ(...)`, `EXPOENTE(...)`
3.  **Multiplicativa**: `*`, `/`
4.  **Aditiva**: `+`, `-`
5.  **Relacional**: `==`, `!=`, `>`, `<`, `>=`, `<=`

---

## 3. Funções Matemáticas Específicas

As funções `RAIZ` e `EXPOENTE` são tratadas como expressões de alta precedência.

*   **RAIZ**: `RAIZ(valor, indice)`
    *   Exemplo: `VAR x = RAIZ(25, 2).` (Raiz quadrada de 25)
*   **EXPOENTE**: `EXPOENTE(base, expoente)`
    *   Exemplo: `VAR y = EXPOENTE(2, 3).` (2 elevado a 3)

Ambas podem ser atribuídas a variáveis ou usadas dentro de outras expressões:
`VAR calc = RAIZ(100, 2) + EXPOENTE(5, 2).`

---

## 4. Definição Detalhada de Tipos e Literais

### Strings (TEXTO)
*   **Delimitadores**: Devem usar **aspas duplas** (`"`). Aspas simples não são suportadas.
*   **Limite**: O compilador impõe um limite de **500 caracteres** por string literal.

### Números (INTEIRO / REAL)
*   **REAL**: Utiliza a **vírgula** `,` como separador decimal no código-fonte (ex: `3,14`), que é convertida internamente para ponto.
*   **Limites**: 
    *   Limite sintático de **15 dígitos** no Lexer.
    *   Internamente, são tratados como `Number` (64-bit float IEEE 754), com precisão de aproximadamente 15-17 dígitos significativos.

---

## 5. Estrutura Geral do Programa

*   **Anatomia**: Um arquivo `.sa` não requer um bloco principal como `INICIO...FIM`. O código é executado sequencialmente de cima para baixo.
*   **Declarações**: Devem obrigatoriamente usar a palavra-chave `VAR`. Podem ocorrer em qualquer lugar do arquivo (escopo global ou dentro de blocos).
*   **Ponto Final**: Instruções de declaração, atribuição, `EXIBIR`, `INSERIR`, `CONTINUAR`, `PARAR` e o final do `FACA...ENQUANTO` exigem um ponto final `.` para encerrar a linha.

---

## Tabela de Esclarecimentos

| Categoria | Definição na Linguagem |
|---|---|
| **Delimitadores de Bloco** | Chavetas `{ }` |
| **Ponto Final `.`** | Obrigatório em comandos (VAR, EXIBIR, etc.) |
| **Variáveis** | Sempre iniciadas com `VAR nome = valor : TIPO.` |
| **Booleano** | Literais `VERDADEIRO` e `FALSO` (Tipo `LOGICO`) |
| **Comentários** | `#` para linha e `## ... ##` para blocos |
