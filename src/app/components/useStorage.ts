import { useState, useEffect } from "react";
import { isWebPlatform, syncToGoogleSheets } from "../services/googleSheetsService";

// Event listener mechanism for external sync updates
const listeners = new Map<string, Set<(val: any) => void>>();

export function notifyStorageChange(key: string, value: any) {
  const set = listeners.get(key);
  if (set) {
    set.forEach(cb => cb(value));
  }
}

export function useStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}

      // Sync to Google Sheets if running on Web format
      if (isWebPlatform()) {
        syncToGoogleSheets(key, next);
      }

      notifyStorageChange(key, next);
      return next;
    });
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setState(JSON.parse(stored));
    } catch {}

    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    const callback = (val: any) => setState(val);
    listeners.get(key)!.add(callback);

    return () => {
      listeners.get(key)?.delete(callback);
    };
  }, [key]);

  return [state, setValue];
}
