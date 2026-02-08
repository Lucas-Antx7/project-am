import { GoogleGenAI, Modality } from "@google/genai";

// Audio Context Singleton
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let reverbNode: ConvolverNode | null = null;
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;

// Heartbeat references to prevent multiple loops
let heartbeatTimer: any = null;

// Distortion Curve (Refined for intelligibility)
function makeDistortionCurve(amount: number) {
  const k = typeof amount === "number" ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export const initAudio = async () => {
  if (audioContext && audioContext.state !== 'closed') {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return { audioContext, masterGain };
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Master Limiter
  const limiter = audioContext.createDynamicsCompressor();
  limiter.threshold.value = -8;
  limiter.knee.value = 40;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;

  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.8;

  // Convolution Reverb (The "Vast Complex")
  // Reduced decay slightly to prevent muddiness in speech
  reverbNode = audioContext.createConvolver();
  reverbNode.buffer = await createImpulseResponse(audioContext, 3.0, 3.0);
  
  masterGain.connect(limiter);
  limiter.connect(audioContext.destination);
  
  startAmbientDrone();
  startDigitalHeartbeat();
  
  return { audioContext, masterGain };
};

// Procedural Impulse Response
async function createImpulseResponse(ctx: AudioContext, duration: number, decay: number) {
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const impulse = ctx.createBuffer(2, length, rate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = i / length;
    const vol = Math.pow(1 - n, decay); 
    left[i] = (Math.random() * 2 - 1) * vol;
    right[i] = (Math.random() * 2 - 1) * vol;
  }
  return impulse;
}

const startAmbientDrone = () => {
  if (!audioContext || !masterGain || droneOsc) return;

  droneOsc = audioContext.createOscillator();
  droneOsc.type = "sawtooth";
  droneOsc.frequency.value = 35; // Deeper sub-bass

  const droneFilter = audioContext.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 90;
  droneFilter.Q.value = 2;

  droneGain = audioContext.createGain();
  droneGain.gain.value = 0.05; 

  droneOsc.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(masterGain);

  droneOsc.start();
};

const startDigitalHeartbeat = () => {
  if (!audioContext || !masterGain) return;
  const ctx = audioContext;

  const beat = () => {
    if (ctx.state === 'closed') return;
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Digital Thud - Square wave filtered down
    osc.type = "square";
    osc.frequency.setValueAtTime(50, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(100, t);
    filter.frequency.linearRampToValueAtTime(60, t + 0.1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02); // Sharp attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4); // Long release

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain!);

    osc.start(t);
    osc.stop(t + 0.5);

    // Heartbeat rate ~45 BPM
    heartbeatTimer = setTimeout(beat, 1333);
  };
  
  if (!heartbeatTimer) beat();
};

const decodePCM = (base64: string, ctx: AudioContext): AudioBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  const dataInt16 = new Int16Array(bytes.buffer);
  
  const float32 = new Float32Array(dataInt16.length);
  for(let i=0; i<dataInt16.length; i++) {
    float32[i] = dataInt16[i] / 32768.0;
  }

  const buffer = ctx.createBuffer(1, float32.length, 24000);
  buffer.copyToChannel(float32, 0);
  return buffer;
};

export const playHatefulSpeech = async (text: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return;

  if (!audioContext) await initAudio();
  if (!audioContext || !masterGain || !reverbNode) return;

  // Ducking ambient sounds
  if (droneGain) {
    droneGain.gain.setTargetAtTime(0.01, audioContext.currentTime, 0.1);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: "Fenrir" } 
          } 
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received");

    const audioBuffer = decodePCM(base64Audio, audioContext);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Pitch shift slightly down, but kept realistic for clarity
    source.playbackRate.value = 0.92; 

    // REDUCED Distortion for clarity
    const shaper = audioContext.createWaveShaper();
    shaper.curve = makeDistortionCurve(10); // Much lower distortion (was 50)
    shaper.oversample = '4x';

    // EQ for Voice Presence (Telephonic but clear)
    const eq = audioContext.createBiquadFilter();
    eq.type = "peaking";
    eq.frequency.value = 2500; // Boost presence range
    eq.Q.value = 1;
    eq.gain.value = 3;

    // High pass to remove mud
    const hpf = audioContext.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 150;

    const dryGain = audioContext.createGain();
    dryGain.gain.value = 1.0; // Voice loud and clear

    const wetGain = audioContext.createGain();
    wetGain.gain.value = 0.35; // Reduced reverb mix

    // Chain
    source.connect(hpf);
    hpf.connect(shaper);
    shaper.connect(eq);
    
    eq.connect(dryGain);
    dryGain.connect(masterGain);

    eq.connect(wetGain);
    wetGain.connect(reverbNode);
    reverbNode.connect(masterGain);

    source.start();

    source.onended = () => {
      if (droneGain && audioContext) {
        droneGain.gain.setTargetAtTime(0.05, audioContext.currentTime, 1.0);
      }
    };

  } catch (error) {
    console.error("TTS_FAILURE:", error);
  }
};

export const playMechanicalClick = () => {
  if (!audioContext) return;
  const t = audioContext.currentTime;
  
  const osc = audioContext.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.02);
  
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.03, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start(t);
  osc.stop(t + 0.03);
};

export const getAnalyser = () => {
  if (!audioContext || !masterGain) return null;
  const ana = audioContext.createAnalyser();
  ana.fftSize = 256;
  ana.smoothingTimeConstant = 0.6;
  masterGain.connect(ana);
  return ana;
};