Plano de Integração: Interface Gráfica (Pamdu-Ali) e Mini-Compilador
Este documento descreve a estratégia para conectar a interface gráfica Electron (pamdu-ali) ao núcleo do compilador, sem afetar o funcionamento via terminal (CLI).

Diagnóstico Atual
Compilador (/src):

Desenvolvido em TypeScript.
A lógica de execução (src/index.ts) está acoplada à interface de linha de comando (CLI).
O SemanticAnalyzer imprime os resultados diretamente no terminal usando console.log, o que impede que a interface gráfica capture a saída facilmente.
Interface Gráfica (/interface_grafica/pamdu-ali):

Desenvolvida com Electron (JS Vanilla).
Atualmente isolada, sem comunicação com o compilador.
Não possui configuração de IPC (Inter-Process Communication) para enviar código ou receber resultados.
Estratégia de Solução
Para integrar os dois sistemas sem quebras, propõe-se uma arquitetura em camadas:

1. Refatoração do Núcleo (Compilador)
Precisamos separar a "Lógica de Compilação" da "Interface de Terminal".

Ação: Modificar o SemanticAnalyzer para aceitar uma função de callback de impressão.
Como é hoje: console.log("Resultado")
Como ficará: this.print("Resultado") (onde print pode ser o console.log no terminal, ou uma função que envia para a GUI na interface gráfica).
Ação: Criar um ponto de entrada (API) que receba o código fonte como string e retorne os resultados, em vez de ler arquivos do disco obrigatoriamente.
2. Comunicação (Electron)
Usaremos o sistema de IPC do Electron para ligar o frontend (HTML/JS) ao backend (Node.js/Compilador).

Processo Principal (main): Importará as classes do compilador (Lexer, Parser, Semantic). Ele ouvirá eventos do tipo compile-code.
Preload Script: Exporá uma função segura api.compile(sourceCode) para o frontend.
Renderer (index.html): Chamará api.compile() quando o usuário clicar em "Executar" e exibirá a resposta na tela de logs.
Plano de Implementação (Passo a Passo)
Passo 1: Preparar o Compilador
Alterar src/semantic/Semantic.ts para permitir redirecionamento de saída.
Extrair a lógica de execução de src/index.ts para uma função reutilizável (ex: executeCode(source)).
Passo 2: Configurar o Electron
No pamdu-ali/src/index.js, configurar o ipcMain para receber o código.
Importar o compilador compilado (arquivos JS da pasta dist).
Capturar o saída do compilador e retorná-la via IPC.
Passo 3: Frontend
Atualizar pamdu-ali/src/preload.js com a ponte contextBridge.
No index.html, adicionar o JavaScript para capturar o clique do botão, enviar o código e mostrar o retorno.
NOTE

Essa abordagem garante que o comando npm run dev (CLI) continue funcionando exatamente como antes, pois passaremos o console.log original como callback. A interface gráfica passará um callback customizado.