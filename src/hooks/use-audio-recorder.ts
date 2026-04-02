import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access failed:", err);
      throw err;
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr) return resolve(new Blob());

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        mr.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        resolve(blob);
      };
      mr.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording };
}
