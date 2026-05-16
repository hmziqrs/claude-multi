import { useState } from "react";

interface Message {
  text: string;
  type: "error" | "success";
}

export function useMessage() {
  const [message, setMessage] = useState<Message | null>(null);
  return {
    error: message?.type === "error" ? message.text : null,
    success: message?.type === "success" ? message.text : null,
    setError: (text: string) => setMessage({ text, type: "error" }),
    setSuccess: (text: string) => setMessage({ text, type: "success" }),
    clear: () => setMessage(null),
  };
}
