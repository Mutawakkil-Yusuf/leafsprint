"use client";

import { useSyncExternalStore } from "react";
import { todayKey, type DayKey } from "./day";

/**
 * Wall clock as an external store. Server snapshot is null (prerender-safe),
 * client snapshot is a cached day key refreshed on an interval so a
 * midnight rollover updates every mounted screen without any
 * setState-in-effect anywhere.
 */

const REFRESH_MS = 30_000;

let cache: { key: DayKey; at: number } | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (!timer) {
    timer = setInterval(() => {
      const key = todayKey();
      if (!cache || key !== cache.key) {
        cache = { key, at: Date.now() };
        listeners.forEach((l) => l());
      }
    }, REFRESH_MS);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getDaySnapshot(): DayKey | null {
  if (!cache) cache = { key: todayKey(), at: Date.now() };
  return cache.key;
}

function getNullSnapshot(): null {
  return null;
}

export function useToday(): DayKey | null {
  return useSyncExternalStore(subscribe, getDaySnapshot, getNullSnapshot);
}

function greet(hour: number): string {
  if (hour < 5) return "Late night pages";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

let greetCache: { text: string; at: number } | null = null;

export function useGreeting(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!greetCache || Date.now() - greetCache.at > REFRESH_MS) {
        greetCache = { text: greet(new Date().getHours()), at: Date.now() };
      }
      return greetCache.text;
    },
    getNullSnapshot
  );
}
