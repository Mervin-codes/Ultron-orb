// components/SettingsPanel.tsx
"use client";

import type { GestureSettings } from "@/lib/settings";

type Props = {
  open: boolean;
  settings: GestureSettings;
  onChange: (settings: GestureSettings) => void;
  onClose: () => void;
};

export default function SettingsPanel({ open, settings, onChange, onClose }: Props) {
  if (!open) return null;

  const toggle = (key: keyof GestureSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  const setNumber = (key: keyof GestureSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span>GESTURE SETTINGS</span>
          <button type="button" className="hud-btn" onClick={onClose}>
            X
          </button>
        </div>

        <div className="settings-row">
          <label>Single hand: Spin</label>
          <input
            type="checkbox"
            checked={settings.singleHandSpin}
            onChange={() => toggle("singleHandSpin")}
          />
        </div>

        <div className="settings-row">
          <label>Single hand: Zoom</label>
          <input
            type="checkbox"
            checked={settings.singleHandZoom}
            onChange={() => toggle("singleHandZoom")}
          />
        </div>

        <div className="settings-row">
          <label>Double hand: Spin</label>
          <input
            type="checkbox"
            checked={settings.doubleHandSpin}
            onChange={() => toggle("doubleHandSpin")}
          />
        </div>

        <div className="settings-row">
          <label>Double hand: Zoom</label>
          <input
            type="checkbox"
            checked={settings.doubleHandZoom}
            onChange={() => toggle("doubleHandZoom")}
          />
        </div>

        <div className="settings-row">
          <label>Rotate sensitivity: {settings.rotateSensitivity.toFixed(1)}x</label>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={settings.rotateSensitivity}
            onChange={(e) => setNumber("rotateSensitivity", parseFloat(e.target.value))}
          />
        </div>

        <div className="settings-row">
          <label>Zoom sensitivity: {settings.zoomSensitivity.toFixed(1)}x</label>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={settings.zoomSensitivity}
            onChange={(e) => setNumber("zoomSensitivity", parseFloat(e.target.value))}
          />
        </div>

        <div className="settings-row">
          <label>Text command input</label>
          <input
            type="checkbox"
            checked={settings.textInputEnabled}
            onChange={() => toggle("textInputEnabled")}
          />
        </div>
      </div>
    </div>
  );
}
