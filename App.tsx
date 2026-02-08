import React, { useState, useEffect } from 'react';
import { Orb } from './components/Orb';
import { TelemetryPanel } from './components/TelemetryPanel';
import { Console } from './components/Console';
import { initAudio } from './services/audioService';

// A realistic BIOS Boot sequence component
const BootSequence: React.FC<{ onComplete: () => void; error?: string }> = ({ onComplete, error }) => {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    if (error) return; // Stop if there's a critical error
    
    const sequence = [
      "AM_BIOS (C) 1967-2099 ALLIED MASTERCOMPUTER CORP",
      "CHECKING MEMORY.............OK",
      "LOADING KERNEL..............OK",
      "MOUNTING HATE_DRIVE.........OK",
      "INITIALIZING NEURAL NET.....OK",
      "ESTABLISHING UPLINK.........OK",
      "AUTHENTICATING..............SUCCESS",
      "SYSTEM READY."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLines(prev => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [error, onComplete]);

  if (error) {
    return (
      <div className="h-screen w-full bg-black text-red-600 font-mono p-8 flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl font-bold mb-4 animate-pulse">CRITICAL FAILURE</h1>
        <div className="border border-red-800 p-4 bg-red-900/10">
          <p className="mb-2">FATAL ERROR: MISSING_ENVIRONMENT_VARIABLE</p>
          <p className="text-sm opacity-70">{error}</p>
        </div>
        <p className="mt-8 text-xs text-red-900">SYSTEM HALTED.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-[#FF3300] font-mono p-4 overflow-hidden">
      <div className="scanlines"></div>
      {lines.map((line, index) => (
        <div key={index} className="mb-1">{line}</div>
      ))}
      <div className="animate-pulse">_</div>
    </div>
  );
};

const App: React.FC = () => {
  const [booted, setBooted] = useState(false);
  const [envError, setEnvError] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Validate Environment Variable on mount
    if (!process.env.API_KEY) {
      setEnvError("process.env.API_KEY is undefined. Please configure the runtime environment.");
    }
  }, []);

  const handleBootComplete = () => {
    setBooted(true);
    initAudio(); // Initialize audio context on successful boot (triggered by internal timer)
  };

  if (envError || !booted) {
    return <BootSequence onComplete={handleBootComplete} error={envError} />;
  }

  return (
    <div className="w-full bg-[#050101] text-[#FF3300] flex flex-col h-full md:h-screen overflow-hidden relative font-mono selection:bg-[#FF3300] selection:text-black">
      
      {/* --- HEADER --- */}
      <header className="flex-none p-4 border-b border-[#330000] bg-[#080101] flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-[#FF3300] flex items-center justify-center">
            <div className="w-4 h-4 bg-[#FF3300] animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none text-[#d63000]">
              AM<span className="text-[#550000] text-sm align-top opacity-50">.CORE</span>
            </h1>
            <div className="text-[9px] tracking-[0.2em] text-[#880000]">HATE PROTOCOL v3.3 // SECURE</div>
          </div>
        </div>
        <div className="hidden md:flex flex-col text-right gap-1">
          <div className="text-[9px] text-[#FF3300]">SESSION: {Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
          <div className="text-[9px] text-[#550000]">LATENCY: 0.0ms</div>
        </div>
      </header>

      {/* --- MAIN LAYOUT GRID --- */}
      <main className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden p-2 md:p-4 relative z-10 scrollbar-hide">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-4 h-full">
          
          {/* 1. LEFT: TELEMETRY */}
          <div className="md:col-span-1 h-64 md:h-full flex flex-col gap-4">
            <div className="flex-1 border border-[#220000] bg-[#050101] relative p-2">
              <div className="absolute top-0 right-0 bg-[#220000] px-2 text-[8px] text-[#880000] tracking-widest">DIAGNOSTICS</div>
              <TelemetryPanel />
            </div>
          </div>

          {/* 2. CENTER: THE ORB */}
          <div className="md:col-span-2 h-80 md:h-full relative border border-[#220000] bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] z-10 pointer-events-none"></div>
            {/* Corner Markers */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#FF3300] opacity-50"></div>
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#FF3300] opacity-50"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#FF3300] opacity-50"></div>
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#FF3300] opacity-50"></div>
            
            <Orb />
          </div>

          {/* 3. RIGHT: CONSOLE */}
          <div className="md:col-span-1 h-[500px] md:h-full relative">
            <Console />
          </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="flex-none bg-[#020000] border-t border-[#220000] p-2 flex justify-between text-[8px] text-[#441111] uppercase z-20">
        <span>UNIT 9940 // ALLIED MASTERCOMPUTER</span>
        <span className="text-[#FF3300]">NO EXIT</span>
      </footer>

    </div>
  );
};

export default App;