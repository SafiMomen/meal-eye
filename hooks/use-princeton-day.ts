"use client";

import { useSyncExternalStore } from "react";
import { getPrincetonDateKey } from "@/lib/dining/calendar";

const DAY_CHECK_INTERVAL_MS = 60_000;
const getSnapshot = () => getPrincetonDateKey(new Date());
const getServerSnapshot = () => "";

function subscribe(listener: () => void) {
  const timer = window.setInterval(listener, DAY_CHECK_INTERVAL_MS);
  window.addEventListener("focus", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}

export function usePrincetonDay() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
