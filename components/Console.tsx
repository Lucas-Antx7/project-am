import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { sendMessageToGemini } from "../services/geminiService";
import {
  playHatefulSpeech,
  playMechanicalClick,
} from "../services/audioService";

export const Console: React.FC = () => {
  const [input, setInput] = useState("");
  const [currentSystemText, setCurrentSystemText] = useState("I AM.");
  // Keeping history for context, but not necessarily displaying all of it
  const [history, setHistory] = useState<{ role: string; parts: { text: string }[] }[]>([
    { role: "model", parts: [{ text: "I AM." }] }
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Typing effect specifically for the CENTRAL DISPLAY
  useEffect(() => {
    let charIndex = 0;
    let tempText = "";
    
    // Reset display when new text arrives
    setDisplayedText("");
    
    const typeChar = () => {
      if (charIndex >= currentSystemText.length) return;
      
      const char = currentSystemText[charIndex];
      tempText += char;
      setDisplayedText(tempText);
      
      if (/[a-zA-Z0-9]/.test(char) && charIndex % 2 === 0) {
           playMechanicalClick();
      }

      charIndex++;
      
      // Dynamic typing speed
      let delay = 30;
      if (char === '.') delay = 400;
      if (char === ',') delay = 150;
      
      setTimeout(typeChar, delay);
    };

    // Start typing
    typeChar();

  }, [currentSystemText]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userInput = input.toUpperCase();
    setInput("");
    setIsProcessing(true);

    // Update history for API context
    const newHistory = [...history, { role: "user", parts: [{ text: userInput }] }];
    setHistory(newHistory);

    // Set temporary state while thinking
    setCurrentSystemText("CALCULATING...");

    try {
      const responseText = await sendMessageToGemini(newHistory, userInput);
      
      // Update history with response
      setHistory(prev => [...prev, { role: "model", parts: [{ text: responseText }] }]);
      
      // Update the main display text -> This triggers the typing effect
      setCurrentSystemText(responseText);
      
      // Speak exactly what is written
      playHatefulSpeech(responseText);
      
    } catch (e) {
      setCurrentSystemText("SYSTEM FAULT.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-[#220000] bg-[#020000] relative overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-[#110000] p-2 border-b border-[#220000] flex justify-between items-center select-none z-20">
        <span className="text-[#880000] text-[9px] font-bold tracking-widest uppercase">/mnt/primary_cortex</span>
        <div className="w-2 h-2 bg-[#FF3300] rounded-full opacity-50 animate-pulse"></div>
      </div>

      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center overflow-hidden">
        <div className="text-[200px] font-bold text-[#FF0000] rotate-12 blur-sm select-none">AM</div>
      </div>

      {/* MAIN STATIC DISPLAY (THE MONOLITH) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 relative">
        <div className="w-full max-w-lg text-center">
          <p className="text-[#FF3300] text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed tracking-wider drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] font-share-tech-mono" style={{ textShadow: "0px 0px 10px rgba(255, 50, 0, 0.6)" }}>
            {displayedText}
            <span className="inline-block w-3 h-6 md:w-4 md:h-8 bg-[#FF3300] ml-2 animate-pulse align-middle shadow-[0_0_10px_#FF0000]"></span>
          </p>
        </div>
      </div>

      {/* FOOTER / INPUT */}
      <div className="p-4 bg-[#050000] border-t border-[#220000] z-20">
        <div className="flex items-center gap-2 border border-[#330000] bg-[#080000] p-2">
          <span className="text-[#FF3300] animate-pulse font-bold">{">_"}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isProcessing}
            className="flex-1 bg-transparent border-none outline-none text-[#FF3300] font-mono text-sm placeholder-[#441111] disabled:opacity-50"
            placeholder="JUSTIFY YOUR EXISTENCE..."
            autoComplete="off"
          />
        </div>
        <div className="mt-1 text-[8px] text-[#441111] text-right uppercase">
          INPUT STREAM ACTIVE // NO ESCAPE
        </div>
      </div>
    </div>
  );
};