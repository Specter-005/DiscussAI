import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceConfig {
  rate: number;
  pitch: number;
}

const PERSONA_VOICES: Record<string, VoiceConfig> = {
  Alex: { rate: 0.9, pitch: 0.9 },
  Casey: { rate: 1.15, pitch: 1.0 },
  Jordan: { rate: 1.0, pitch: 1.1 },
  Morgan: { rate: 0.95, pitch: 1.05 },
  Riley: { rate: 0.85, pitch: 0.95 },
};

export function useTTS() {
  const [isMuted, setIsMuted] = useState(false);
  const [speakingPersona, setSpeakingPersona] = useState<string | null>(null);
  const queueRef = useRef<{ text: string; persona: string }[]>([]);
  const isSpeakingRef = useRef(false);

  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis?.getVoices() || [];
    // Prefer an English voice
    return voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
  }, []);

  const processQueue = useCallback(() => {
    if (isSpeakingRef.current || queueRef.current.length === 0) return;
    
    const { text, persona } = queueRef.current.shift()!;
    const config = PERSONA_VOICES[persona] || { rate: 1.0, pitch: 1.0 };
    
    isSpeakingRef.current = true;
    setSpeakingPersona(persona);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = 0.8;
    
    const voice = getVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setSpeakingPersona(null);
      processQueue();
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setSpeakingPersona(null);
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }, [getVoice]);

  const speak = useCallback((text: string, persona: string) => {
    if (isMuted || !window.speechSynthesis) return;
    // Clean AI prefix from text
    const cleanText = text.replace(/^(Alex|Jordan|Casey|Morgan|Riley):\s*/i, "");
    queueRef.current.push({ text: cleanText, persona });
    processQueue();
  }, [isMuted, processQueue]);

  const replayMessage = useCallback((text: string, persona: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    queueRef.current = [];
    
    const config = PERSONA_VOICES[persona] || { rate: 1.0, pitch: 1.0 };
    const cleanText = text.replace(/^(Alex|Jordan|Casey|Morgan|Riley):\s*/i, "");
    
    setSpeakingPersona(persona);
    isSpeakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = 0.8;
    
    const voice = getVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setSpeakingPersona(null);
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setSpeakingPersona(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [getVoice]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) {
        window.speechSynthesis?.cancel();
        isSpeakingRef.current = false;
        setSpeakingPersona(null);
        queueRef.current = [];
      }
      return !prev;
    });
  }, []);

  const stopAll = useCallback(() => {
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    setSpeakingPersona(null);
    queueRef.current = [];
  }, []);

  // Load voices
  useEffect(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  return { speak, replayMessage, toggleMute, stopAll, isMuted, speakingPersona };
}
