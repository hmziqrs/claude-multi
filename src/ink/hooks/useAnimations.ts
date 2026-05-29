import { useState, useEffect } from "react";

const isCapture = () =>
  process.env.CAPTURE_MODE === "1" || process.env.NODE_ENV === "test";

export function useTypewriter(text: string, speed = 25) {
  const [displayed, setDisplayed] = useState(() => isCapture() ? text : "");

  useEffect(() => {
    if (isCapture() || text.length === 0) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayed;
}

export function useDrawLine(length: number, delay = 0, speed = 2) {
  const [drawn, setDrawn] = useState(() => isCapture() ? length : 0);

  useEffect(() => {
    if (isCapture()) { setDrawn(length); return; }
    setDrawn(0);
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      let current = 0;
      intervalId = setInterval(() => {
        current = Math.min(current + speed, length);
        setDrawn(current);
        if (current >= length) clearInterval(intervalId!);
      }, 8);
    }, delay);
    return () => {
      clearTimeout(start);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [length, delay, speed]);

  return drawn;
}

export function useStaggeredReveal(count: number, delay = 40) {
  const [visible, setVisible] = useState(() => isCapture() ? count : 0);

  useEffect(() => {
    if (isCapture()) { setVisible(count); return; }
    setVisible(0);
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setVisible(current);
      if (current >= count) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [count, delay]);

  return visible;
}

export function useFadeIn(delay = 0) {
  const [visible, setVisible] = useState(() => isCapture());

  useEffect(() => {
    if (isCapture()) { setVisible(true); return; }
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return visible;
}

export function usePulse(frames = ["●", "○", "●"], speed = 500) {
  const [frame, setFrame] = useState(0);
  const framesKey = frames.join("");

  useEffect(() => {
    if (isCapture()) return;
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, speed);
    return () => clearInterval(timer);
  }, [framesKey, frames.length, speed]);

  return frames[frame];
}

export function useCounter(target: number, duration = 600) {
  const [value, setValue] = useState(() => isCapture() ? target : 0);

  useEffect(() => {
    if (isCapture()) { setValue(target); return; }
    if (target === 0) { setValue(0); return; }
    const steps = Math.min(target, 20);
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);

  return value;
}
