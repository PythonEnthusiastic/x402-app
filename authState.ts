import { useSyncExternalStore } from 'react';

let isAuthenticated = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return isAuthenticated;
}

export function setIsAuthenticated(nextValue: boolean) {
  if (isAuthenticated === nextValue) return;
  isAuthenticated = nextValue;
  notifyListeners();
}

export function useIsAuthenticated() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}