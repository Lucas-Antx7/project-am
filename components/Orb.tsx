import React, { useEffect, useRef } from "react";
import { getAnalyser } from "../services/audioService";

export const Orb: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        ctx.scale(dpr, dpr);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const particleCount = 150;
    const particles = new Float32Array(particleCount * 4);
    for (let i = 0; i < particleCount; i++) {
      particles[i * 4] = Math.random(); 
      particles[i * 4 + 1] = Math.random() * Math.PI * 2; 
      particles[i * 4 + 2] = (Math.random() - 0.5) * 0.02; 
      particles[i * 4 + 3] = Math.random() * 2 + 0.5; 
    }

    const render = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const t = Date.now() * 0.001;

      // Audio Data
      const analyser = getAnalyser();
      let audioLevel = 0;
      let freqData = new Uint8Array(0);
      
      if (analyser) {
        freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        let sum = 0;
        const binCount = freqData.length;
        for (let i = 0; i < binCount; i++) {
          sum += freqData[i];
        }
        audioLevel = sum / binCount / 255;
      }
      
      // DIGITAL HEARTBEAT SIMULATION
      // 1.333s period (~45BPM) matching the audio service
      const beatPeriod = 1.333;
      const beatPhase = (t % beatPeriod) / beatPeriod;
      // Sharp pulse at the beginning of the phase
      const heartPulse = Math.pow(Math.exp(-beatPhase * 8), 2) * 0.8; 

      // Combined pulse (Heartbeat + Voice Reactivity)
      const pulse = 0.5 + (heartPulse * 0.4) + (audioLevel * 1.5);
      const intensity = Math.min(1, 0.2 + audioLevel * 2 + heartPulse * 0.5);

      ctx.fillStyle = "rgba(5, 1, 1, 0.4)";
      ctx.fillRect(0, 0, w, h);
      
      ctx.strokeStyle = "rgba(40, 0, 0, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gridSize = 40;
      for (let x = (t * 10) % gridSize; x < w; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);

      // THE CORE
      const coreRadius = 40 + pulse * 25;
      const layers = 6;
      
      for (let j = 0; j < layers; j++) {
        ctx.beginPath();
        const layerR = coreRadius - (j * 3);
        // Color shifts to brighter red on heartbeat
        const rVal = 255 - j * 30;
        const gVal = Math.floor(audioLevel * 200 + heartPulse * 50);
        
        ctx.fillStyle = `rgba(${rVal}, ${gVal}, 0, ${0.1 + intensity * 0.15})`;
        
        for (let i = 0; i <= Math.PI * 2; i += 0.1) {
          const freqIndex = Math.floor((i / (Math.PI * 2)) * (freqData.length || 1));
          const freqVal = (freqData[freqIndex] || 0) / 255;
          
          // Deform based on heartbeat pulse + audio
          const offset = Math.sin(i * (5 + j) + t * (2 + j) + freqVal * 10) * (5 + freqVal * 20 + heartPulse * 5);
          const r = Math.max(0, layerR + offset);
          const x = Math.cos(i) * r;
          const y = Math.sin(i) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(255, ${50 + heartPulse * 100}, 0, 0.4)`;
        ctx.stroke();
      }

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};