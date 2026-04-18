import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer(autoStart = false) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef  = useRef(0);
  const intervalRef = useRef(null);
  const startedAt   = useRef(null);
  const stoppedRef  = useRef(false);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stoppedRef.current = false;
    startedAt.current = Date.now() - elapsedRef.current * 1000;
    intervalRef.current = setInterval(() => {
      if (stoppedRef.current) return;
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      elapsedRef.current = s;
      setElapsed(s);
    }, 500);
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const snapshot = useCallback(() => elapsedRef.current, []);

  useEffect(() => {
    if (autoStart) start();
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [autoStart, start]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  return { elapsed, fmt: fmt(elapsed), start, stop, snapshot };
}
