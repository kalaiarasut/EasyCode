"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, X, Check, Loader2, Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface AudioRecordingVisualizerProps {
  isOpen: boolean;
  onTranscription: (transcribedText: string) => void;
  onCancel: () => void;
  customKeys?: Record<string, string>;
}

export default function AudioRecordingVisualizer({
  isOpen,
  onTranscription,
  onCancel,
  customKeys = {},
}: AudioRecordingVisualizerProps) {
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [frequencyBars, setFrequencyBars] = useState<number[]>(new Array(28).fill(4));

  // Audio Processing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize recording on mount / open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setRecordingSeconds(0);
    setIsProcessing(false);
    setLiveTranscript("");
    audioChunksRef.current = [];

    // 1. Start Recording Timer
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // 2. Initialize Browser Speech Recognition (Live Streaming & Fallback)
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let fullText = "";
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript;
          }
          if (isMounted) {
            setLiveTranscript(fullText.trim());
          }
        };

        recognition.onerror = () => {};
        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch (e) {}

    // 3. Initialize Web Audio API & MediaRecorder
    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        // Setup Web Audio Analyser
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        // 60FPS Frequency Loop: Centers strongest voice energy in the middle, radiating symmetrically outward
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateFrequency = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average speech energy across voice frequency bands
          let speechSum = 0;
          const voiceBins = Math.min(dataArray.length, 24);
          for (let b = 0; b < voiceBins; b++) {
            speechSum += dataArray[b];
          }
          const speechLevel = voiceBins > 0 ? speechSum / voiceBins : 0;

          // 28 bars total: center is at index 13.5
          // When sound occurs, the highest bars are in the center, tapering symmetrically left and right
          const bars: number[] = [];
          for (let i = 0; i < 28; i++) {
            const distFromCenter = Math.abs(i - 13.5); // 0.5 (center) to 13.5 (edges)
            // Gaussian bell curve factor: 1.0 in center down to ~0.15 at edges
            const bell = Math.max(0.12, Math.cos((distFromCenter / 14) * (Math.PI / 2)));
            // Sample nearby frequency bin
            const binIdx = Math.min(dataArray.length - 1, Math.floor(distFromCenter * 1.5));
            const binEnergy = dataArray[binIdx] || speechLevel;
            const combinedEnergy = 0.65 * speechLevel + 0.35 * binEnergy;

            // Height scaling from 4px (silence) up to 28px (loud voice in middle)
            const height = Math.max(4, Math.min(30, Math.floor((combinedEnergy / 255) * 26 * bell) + 4));
            bars.push(height);
          }

          if (isMounted) {
            setFrequencyBars(bars);
          }
          animationFrameRef.current = requestAnimationFrame(updateFrequency);
        };

        updateFrequency();

        // Setup MediaRecorder for Groq Whisper High-Quality Audio
        let mimeType = "audio/webm";
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;
      })
      .catch((err) => {
        toast.error("Microphone access denied or not available.");
        onCancel();
      });

    return () => {
      isMounted = false;
      cleanupAudio();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  // Format timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle Finish & Transcribe
  const handleDone = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const fallbackTranscript = liveTranscript.trim();

    // Stop recording tracks
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    // Wait 150ms for final chunk
    await new Promise((r) => setTimeout(r, 150));

    const audioBlob =
      audioChunksRef.current.length > 0
        ? new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || "audio/webm",
          })
        : null;

    cleanupAudio();

    let preferredEngine = "auto";
    try {
      preferredEngine = localStorage.getItem("easycode_speech_engine") || "auto";
    } catch (e) {}

    // If user explicitly chose Browser Web Speech API
    if (preferredEngine === "browser") {
      if (fallbackTranscript) {
        toast.success("Transcribed with Browser Web Speech API");
        onTranscription(fallbackTranscript);
      } else {
        toast.info("No speech detected in microphone.");
        onCancel();
      }
      return;
    }

    if (!audioBlob || audioBlob.size < 500) {
      if (fallbackTranscript) {
        toast.success("Transcribed using Browser Speech Recognition");
        onTranscription(fallbackTranscript);
      } else {
        toast.info("No audio recorded.");
        onCancel();
      }
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("engine", preferredEngine);
      formData.append("customKeys", JSON.stringify(customKeys));

      const res = await fetch("/api/ai/audio-transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.text) {
        const engineLabel = data.provider
          ? `Transcribed with ${data.provider}`
          : "Transcribed successfully";
        toast.success(engineLabel);
        onTranscription(data.text);
      } else {
        // Fallback: If cloud engine hit rate limit or failed, use browser SpeechRecognition text
        if (fallbackTranscript) {
          toast.info("Using Browser Speech Recognition (Cloud engine unavailable)");
          onTranscription(fallbackTranscript);
        } else if (data.message) {
          toast.error(data.message);
          onCancel();
        } else {
          toast.error("Could not transcribe audio.");
          onCancel();
        }
      }
    } catch (err: any) {
      if (fallbackTranscript) {
        toast.info("Using Browser Speech Recognition fallback");
        onTranscription(fallbackTranscript);
      } else {
        toast.error(err?.message || "Transcription failed.");
        onCancel();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    cleanupAudio();
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white dark:bg-[#1E1D1B] border border-[#DFDAD0] dark:border-[#383532] shadow-sm animate-in fade-in duration-150">
      {/* Left: REC Indicator & Timer */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 dark:bg-neutral-500 opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1C1B19] dark:bg-white" />
        </span>
        <span className="text-xs font-mono font-semibold text-[#1C1B19] dark:text-[#EDEDEB]">
          {formatTimer(recordingSeconds)}
        </span>
      </div>

      {/* Center: Live Dancing Frequency Equalizer Bars */}
      <div className="flex-1 flex items-center justify-center gap-[3px] h-8 overflow-hidden px-2">
        {isProcessing ? (
          <div className="flex items-center gap-2 text-xs text-[#7A756C] dark:text-[#8C8880] font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1C1B19] dark:text-white" />
            <span>Transcribing with Groq Whisper...</span>
          </div>
        ) : (
          frequencyBars.map((height, idx) => (
            <div
              key={idx}
              style={{
                height: `${height}px`,
                transition: "height 0.05s ease-out",
              }}
              className="w-[3px] rounded-full bg-[#1C1B19] dark:bg-white opacity-85 hover:opacity-100"
            />
          ))
        )}
      </div>

      {/* Right: Actions (Cancel & Done) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isProcessing}
          className="p-1.5 rounded-lg text-[#7A756C] dark:text-[#8C8880] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
          title="Cancel recording"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleDone}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-xs"
          title="Finish & Transcribe"
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span>Done</span>
        </button>
      </div>
    </div>
  );
}
