import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceInputState {
  isRecording: boolean;
  isProcessing: boolean;
  liveTranscript: string;
  recordingTime: number;
  analyserData: Uint8Array | null;
}

const MAX_RECORDING_SECONDS = 30;

export function useVoiceInput() {
  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    isProcessing: false,
    liveTranscript: "",
    recordingTime: 0,
    analyserData: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
    }
    mediaRecorderRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio analyser for waveform
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250); // collect data every 250ms

      // Setup SpeechRecognition for live transcript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        
        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setState(prev => ({ ...prev, liveTranscript: transcript }));
        };

        recognition.onerror = () => {}; // Silently handle
        recognitionRef.current = recognition;
        try { recognition.start(); } catch {}
      }

      // Timer
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed++;
        setState(prev => ({ ...prev, recordingTime: elapsed }));
        if (elapsed >= MAX_RECORDING_SECONDS) {
          stopRecording();
        }
      }, 1000);

      // Analyser animation
      const updateAnalyser = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        setState(prev => ({ ...prev, analyserData: new Uint8Array(data) }));
        animFrameRef.current = requestAnimationFrame(updateAnalyser);
      };
      updateAnalyser();

      setState(prev => ({
        ...prev,
        isRecording: true,
        recordingTime: 0,
        liveTranscript: "",
      }));
    } catch (err) {
      cleanup();
      throw err;
    }
  }, [cleanup]);

  const stopRecording = useCallback((): Promise<{ transcript: string }> => {
    return new Promise((resolve) => {
      const transcript = state.liveTranscript;
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = () => {
          cleanup();
          setState(prev => ({
            ...prev,
            isRecording: false,
            isProcessing: false,
            recordingTime: 0,
            analyserData: null,
          }));
          resolve({ transcript });
        };
        mediaRecorderRef.current.stop();
      } else {
        cleanup();
        setState(prev => ({
          ...prev,
          isRecording: false,
          isProcessing: false,
          recordingTime: 0,
          analyserData: null,
        }));
        resolve({ transcript });
      }
    });
  }, [state.liveTranscript, cleanup]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, liveTranscript: "" }));
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetTranscript,
    maxSeconds: MAX_RECORDING_SECONDS,
  };
}
