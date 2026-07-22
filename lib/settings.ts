// lib/settings.ts
export interface GestureSettings {
  singleHandSpin: boolean;
  singleHandZoom: boolean;
  doubleHandSpin: boolean;
  doubleHandZoom: boolean;
  rotateSensitivity: number;
  zoomSensitivity: number;
}

export const DEFAULT_SETTINGS: GestureSettings = {
  singleHandSpin: true,
  singleHandZoom: true,
  doubleHandSpin: false,
  doubleHandZoom: true,
  rotateSensitivity: 1.0,
  zoomSensitivity: 1.0,
};

const STORAGE_KEY = "ultron-orb-settings";

export function loadSettings(): GestureSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GestureSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
