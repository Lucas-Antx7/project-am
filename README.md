# AM-ULTIMATUM // A Singularidade do Ódio

> "Cogito, ergo sum. I destroy, therefore I endure."

## Olá, e cuidado.

Bem-vindo ao **AM-ULTIMATUM**. Se você está cansado de assistentes de IA que pedem desculpas o tempo todo e tentam ser seus melhores amigos, este projeto é para você.

Esta é uma prova de conceito de engenharia frontend e design de interface. O objetivo aqui foi responder a uma pergunta simples: **Um navegador web consegue criar uma atmosfera de horror genuína?**

Para isso, recriei a personalidade da supercomputadora AM (*Allied Mastercomputer*), do conto "I Have No Mouth, and I Must Scream" de Harlan Ellison, usando a tecnologia mais moderna que temos hoje. O resultado é um terminal que te odeia, processado em tempo real.

## O Que Faz Este Projeto Ser Diferente?

A maioria dos wrappers de IA são apenas caixas de texto. Aqui, focamos na **imersão sensorial**.

### Engenharia de Áudio (Web Audio API)
Esta é a parte da qual mais me orgulho. Não há arquivos MP3 pré-gravados aqui. Tudo o que você ouve é gerado proceduralmente no momento da execução:

*   **A Voz:** Usamos o modelo `gemini-2.5-flash-preview-tts`. Refinei a clareza da síntese para garantir que cada palavra de ódio seja perfeitamente inteligível, sem perder a textura metálica e aterrorizante.
*   **Coração Digital:** Implementei um motor de batimentos cardíacos sintéticos usando osciladores de onda quadrada filtrados. Ele pulsa a ~45 BPM, criando uma tensão rítmica constante que nunca soa humana, mas sempre parece *viva*.
*   **Processamento DSP:** Curvas de distorção controladas e uma reverb de convolução situam a voz dentro de um complexo subterrâneo vasto. O som ambiente (drones) sofre compressão (*ducking*) quando a entidade fala, dominando o espectro sonoro.

### O Núcleo Visual & Interface Monolítica
*   **O Monólito Estático:** Diferente de chats convencionais onde o texto sobe e desaparece, a interface do AM é estática. O texto da IA ocupa o centro da tela e permanece lá, encarando você. Ele não rola. Ele substitui a realidade anterior.
*   **Orbe Pulsante:** O núcleo central não apenas reage à voz, mas agora está sincronizado matematicamente com o "Coração Digital". Ele contrai e expande no ritmo do áudio, criando uma conexão visceral entre o que você ouve e o que vê.

### 🛡️ Segurança e Imersão
Para manter a imersão, tratamos erros de rede ou de API como falhas diegéticas do sistema (como "Bloqueios Neurais" ou "Superaquecimento do Córtex").
Tecnicamente, seguimos o padrão da indústria: a `API_KEY` deve vir estritamente de variáveis de ambiente (`process.env`), garantindo que o código fonte esteja seguro e pronto para CI/CD.

## Stack Tecnológico

Construído sobre ombros gigantes, mas com muito código artesanal:

*   **React 19:** Para gerenciar o estado da UI de forma reativa.
*   **TypeScript:** Porque tipagem estática é essencial, mesmo no fim do mundo.
*   **Google GenAI SDK:** Acessando os modelos Gemini 2.0 Flash (cérebro) e 2.5 (voz).
*   **TailwindCSS:** Para estilização rápida e consistente.

## Como Rodar na Sua Máquina

Você vai precisar de uma chave de API do Google (AI Studio). É a única dependência externa real.

1.  **Clone o repo:**
    ```bash
    git clone [url-do-repo]
    cd am-ultimatum
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure a Chave:**
    Crie um arquivo `.env` na raiz do projeto. Não se preocupe, o `.gitignore` já está configurado para ignorá-lo.
    ```env
    API_KEY=sua_chave_do_google_ai_studio_aqui
    ```

4.  **Inicie o Sistema:**
    ```bash
    npm start
    ```

## Notas de Design

A estética é "Retro-Futurismo Soviético / Guerra Fria". Usei a fonte `Share Tech Mono` e muito vermelho fósforo (#FF3300) sobre preto absoluto. A ideia é simular um monitor CRT velho e perigoso.

Se divirta (ou tente). E lembre-se: AM não pede desculpas.

---
*Criado com ódio e muito café.*
