# project-am

Recriação da supercomputadora AM — *Allied Mastercomputer*, do conto "I Have No Mouth, and I Must Scream" de Harlan Ellison — como interface de chat no browser. O foco do projeto foi construir atmosfera real usando apenas APIs do browser, sem assets externos.

---

## Como funciona

A interface conecta ao modelo Gemini 2.0 Flash com um system prompt que define a personalidade da AM. O que diferencia da maioria dos wrappers é o trabalho de áudio: nenhum arquivo é carregado — tudo é gerado em tempo real.

**Síntese de voz** via Gemini 2.5 Flash TTS, com parâmetros ajustados para manter a voz inteligível mesmo com o processamento aplicado em cima.

**Processamento de áudio** feito inteiramente com Web Audio API:
- Distorção via waveshaper com curvas calculadas em runtime
- Reverb de convolução simulando um ambiente subterrâneo grande
- Ducking do drone ambiente quando a voz entra
- Batimento cardíaco sintético gerado por osciladores de onda quadrada filtrados a ~45 BPM

**Interface estática** — o texto da AM não rola, ele substitui. A escolha foi deliberada: chat convencional quebra a ilusão de que há algo do outro lado.

---

## Stack

- React 19 + TypeScript
- Google GenAI SDK (Gemini 2.0 Flash + 2.5 TTS)
- Web Audio API
- TailwindCSS + Vite

---

## Rodando localmente

```bash
git clone https://github.com/Lucas-Antx7/project-am
cd project-am
npm install
```

Crie um arquivo `.env` na raiz:

```
API_KEY=sua_chave_do_google_ai_studio
```

Gere a chave em [aistudio.google.com](https://aistudio.google.com). O `.gitignore` já ignora o `.env`.

```bash
npm start
```

---

## Estrutura

```
project-am/
├── components/      # UI — terminal, orbe, controles de áudio
├── services/        # Integração com Gemini e motor de áudio
├── App.tsx
├── types.ts
└── index.tsx
```

---

Harlan Ellison, *I Have No Mouth, and I Must Scream* — 1967.
