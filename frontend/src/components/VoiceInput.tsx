"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function VoiceInput({
  onTranscription,
  isListening,
  onStart,
  onStop,
}: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopListening = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    onStop();
  }, [onStop]);

  const startListening = useCallback(() => {
    setError(null);
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError("Speech recognition not supported");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      // Increase timeout for speech detection
      recognition.continuous = true;
      
      let finalTranscript = "";
      let speechDetected = false;
      
      recognition.onstart = () => {
        console.log("Voice recognition started");
        onStart();
        speechDetected = false;
      };
      
      recognition.onsoundstart = () => {
        console.log("Sound detected");
        speechDetected = true;
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + transcript;
            onTranscription(finalTranscript);
          } else {
            interimTranscript = transcript;
            onTranscription(interimTranscript);
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.log("Recognition error:", event.error);
        
        if (event.error === "no-speech") {
          // Try to restart if no speech detected after 2 seconds
          if (!speechDetected && restartTimeoutRef.current === null) {
            restartTimeoutRef.current = setTimeout(() => {
              console.log("No speech detected, restarting...");
              if (recognitionRef.current && isListening) {
                try {
                  recognitionRef.current.stop();
                  setTimeout(() => {
                    if (isListening) {
                      startListening();
                    }
                  }, 100);
                } catch (e) {}
              }
              restartTimeoutRef.current = null;
            }, 2000);
          }
        } else if (event.error === "not-allowed") {
          setError("Microphone access denied");
          setTimeout(() => setError(null), 2000);
          stopListening();
        } else if (event.error !== "aborted" && event.error !== "no-speech") {
          setError(`Error: ${event.error}`);
          setTimeout(() => setError(null), 2000);
        }
      };
      
      recognition.onend = () => {
        console.log("Recognition ended");
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (err: any) {
      console.error("Start error:", err);
      setError("Could not start voice input");
      onStop();
    }
  }, [onStart, onTranscription, onStop, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <button type="button" className="p-1.5 rounded opacity-50 cursor-not-allowed" disabled>
        <MicOff className="h-4.5 w-4.5" />
      </button>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={toggleListening}
        className={`p-1.5 rounded border transition-all duration-250 shrink-0 ${
          isListening
            ? "bg-red-500/15 border-red-500 text-red-500"
            : "text-neutral-500 hover:text-foreground hover:bg-surface border-transparent hover:border-border"
        }`}
      >
        <Mic className={`h-4.5 w-4.5 ${isListening ? "animate-pulse" : ""}`} />
      </button>
      {error && !isListening && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-500/90 text-white text-[9px] font-mono px-2 py-1 rounded z-30">
          {error}
        </div>
      )}
      {isListening && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-accent/90 text-white text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          LISTENING
          <span className="text-[8px] opacity-80">(say something)</span>
        </div>
      )}
    </div>
  );
}
