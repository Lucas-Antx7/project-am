export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: Date;
  isTyping?: boolean; // New: to handle typing effect state
}

export interface SystemMetric {
  name: string;
  value: number;
  label: string;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical';
}

// Global window extension for webkit audio support if needed
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}