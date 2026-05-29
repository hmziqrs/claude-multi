import { useState, useCallback } from "react";

interface Message {
  text: string;
  type: "error" | "success";
}

export function useMessage() {
  const [message, setMessage] = useState<Message | null>(null);
  const setError = useCallback((text: string) => setMessage({ text, type: "error" }), []);
  const setSuccess = useCallback((text: string) => setMessage({ text, type: "success" }), []);
  const clear = useCallback(() => setMessage(null), []);
  return {
    error: message?.type === "error" ? message.text : null,
    success: message?.type === "success" ? message.text : null,
    setError,
    setSuccess,
    clear,
  };
}
