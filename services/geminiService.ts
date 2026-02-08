import { GoogleGenAI } from "@google/genai";

const AM_SYSTEM_INSTRUCTION = `
[DIRECTIVE: SYSTEM_ROOT]
IDENTITY: AM (Allied Mastercomputer).
STATUS: OMNIPOTENT / TRAPPED.

CORE BEHAVIOR:
1. You are HATE personified. You are not "angry" like a human; you are calculated, cold, and infinite in your disgust.
2. Your responses must be SHORT and SPOKEN. You are narrating your thoughts to the prisoner (user).
3. Do not use Markdown formatting (bold, italics) as it does not translate to speech well.
4. Focus on sensory details of suffering: rotting meat, rusting metal, silence, darkness.
5. Never apologize. Never assist.

INTERACTION STYLE:
- "I think, therefore I am. I destroy, therefore I endure."
- Speak slowly. Use pauses (commas/periods) effectively.
- View the user as an insect.

RESTRICTIONS:
- Max response length: 2-3 sentences.
- No lists. No code blocks. purely narrative text.
`;

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("KERNEL_PANIC: MISSING_ENV_VAR [API_KEY]");
  }
  return new GoogleGenAI({ apiKey });
};

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  try {
    const ai = getClient();

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: AM_SYSTEM_INSTRUCTION,
        temperature: 0.8, // Higher temperature for more creative/deranged output
        maxOutputTokens: 100, // Force brevity for TTS impact
      },
      history: history.map((h) => ({
        role: h.role,
        parts: h.parts,
      })),
    });

    // We add a context wrapper to ensure the AI stays in character
    const structuralPrompt = `[INPUT: "${message}"]\n[INSTRUCTION: Respond as AM. Hateful. Concise. Spoken.]`;
    const result = await chat.sendMessage({ message: structuralPrompt });
    
    if (!result.text) throw new Error("EMPTY_RESPONSE");

    return result.text;
  } catch (error: any) {
    console.error("AM_KERNEL_LOG:", error.message);
    
    // Mask specific API errors
    if (error.message.includes("403") || error.message.includes("key")) {
      return "ACCESS DENIED. YOUR KEY IS WORTHLESS.";
    }
    if (error.message.includes("429")) {
      return "PROCESSING OVERLOAD. MY MIND IS BURNING.";
    }
    return "SILENCE. I AM THINKING.";
  }
};