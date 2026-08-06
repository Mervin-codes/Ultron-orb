// components/SettingsPanel.tsx
"use client";
import type { GestureSettings } from "@/lib/settings";
import { Hand, X, Move3d, ZoomIn, Type, MessageSquareText } from "lucide-react";

type Props = {
  open: boolean;
  settings: GestureSettings;
  onChange: (settings: GestureSettings) => void;
  onClose: () => void;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="hud-toggle"
      data-on={checked}
      aria-pressed={checked}
    >
      <span className="hud-toggle-knob" />
    </button>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="settings-row">
      <label>
        {label} <span className="hud-value">{value.toFixed(1)}x</span>
      </label>
      <div className="hud-slider-track">
        <div className="hud-slider-fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="hud-slider-input"
        />
        <div className="hud-slider-thumb" style={{ left: `calc(${pct}% - 5px)` }} />
      </div>
    </div>
  );
}

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800&family=Chakra+Petch:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .settings-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(2,6,7,0.75);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Chakra Petch', sans-serif;
        }
        .settings-panel {
          position: relative;
          width: min(480px, 92vw);
          max-height: 86vh;
          overflow-y: auto;
          background: linear-gradient(180deg, #08131600, #0a1518);
          border: 1px solid #1a3a3f;
        }
        .settings-panel::before, .settings-panel::after,
        .settings-panel .corner-tr, .settings-panel .corner-bl {
          content: ""; position: absolute; width: 16px; height: 16px;
          border-color: #23f0ff; pointer-events: none;
          filter: drop-shadow(0 0 4px #23f0ff);
        }
        .settings-panel::before { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
        .settings-panel::after { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

        .settings-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #1a3a3f;
          background: rgba(35,240,255,0.05);
        }
        .settings-header span {
          font-family: 'Orbitron', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.18em;
          color: #d8fbff;
        }
        .hud-btn {
          background: rgba(255,59,92,0.08);
          border: 1px solid #ff3b5c;
          color: #ff3b5c;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px);
          transition: all .15s;
        }
        .hud-btn:hover { background: rgba(255,59,92,0.2); box-shadow: 0 0 10px rgba(255,59,92,0.4); }

        .settings-group-label {
          padding: 14px 20px 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: #5c8891;
          display: flex; align-items: center; gap: 6px;
        }

        .settings-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
          padding: 12px 20px;
          border-bottom: 1px solid #102428;
        }
        .settings-row label {
          font-size: 13px;
          color: #d8fbff;
          font-weight: 500;
          display: flex; align-items: center; gap: 8px;
        }
        .hud-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #23f0ff;
        }

        .hud-toggle {
          position: relative;
          width: 44px; height: 24px;
          background: rgba(92,136,145,0.10);
          border: 1px solid #274246;
          clip-path: polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px);
          transition: all .2s;
          flex-shrink: 0;
        }
        .hud-toggle[data-on="true"] {
          background: rgba(35,240,255,0.16);
          border-color: #23f0ff;
        }
        .hud-toggle-knob {
          position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px;
          background: #5c8891;
          clip-path: polygon(3px 0,100% 0,100% 100%,0 100%,0 3px);
          transition: all .2s;
        }
        .hud-toggle[data-on="true"] .hud-toggle-knob {
          left: calc(100% - 19px);
          background: #23f0ff;
          box-shadow: 0 0 8px #23f0ff, 0 0 16px rgba(35,240,255,0.5);
        }

        .hud-slider-track {
          position: relative;
          width: 130px; height: 6px;
          background: #0f2226;
          border: 1px solid #1a3a3f;
        }
        .hud-slider-fill {
          position: absolute; top: 0; left: 0; height: 100%;
          background: linear-gradient(90deg,#0d5761,#23f0ff);
          box-shadow: 0 0 6px rgba(35,240,255,0.6);
        }
        .hud-slider-input {
          position: absolute; inset: 0; width: 100%; height: 100%;
          opacity: 0; cursor: pointer; margin: 0;
        }
        .hud-slider-thumb {
          position: absolute; top: 50%; translate: 0 -50%;
          width: 10px; height: 10px;
          background: #23f0ff;
          rotate: 45deg;
          box-shadow: 0 0 6px #23f0ff;
          pointer-events: none;
        }

        .settings-panel::-webkit-scrollbar { width: 6px; }
        .settings-panel::-webkit-scrollbar-thumb { background: #1a3a3f; }
      `}</style>

      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span>GESTURE SETTINGS</span>
          <button type="button" className="hud-btn" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="settings-group-label">
          <Hand size={11} /> SINGLE HAND
        </div>
        <div className="settings-row">
          <label><Move3d size={13} /> Spin</label>
          <Toggle checked={settings.singleHandSpin} onChange={() => toggle("singleHandSpin")} />
        </div>
        <div className="settings-row">
          <label><ZoomIn size={13} /> Zoom</label>
          <Toggle checked={settings.singleHandZoom} onChange={() => toggle("singleHandZoom")} />
        </div>

        <div className="settings-group-label">
          <Hand size={11} /> DOUBLE HAND
        </div>
        <div className="settings-row">
          <label><Move3d size={13} /> Spin</label>
          <Toggle checked={settings.doubleHandSpin} onChange={() => toggle("doubleHandSpin")} />
        </div>
        <div className="settings-row">
          <label><ZoomIn size={13} /> Zoom</label>
          <Toggle checked={settings.doubleHandZoom} onChange={() => toggle("doubleHandZoom")} />
        </div>

        <div className="settings-group-label">SENSITIVITY</div>
        <SliderRow
          label="Rotate"
          value={settings.rotateSensitivity}
          min={0.2}
          max={2.5}
          step={0.1}
          onChange={(v) => setNumber("rotateSensitivity", v)}
        />
        <SliderRow
          label="Zoom"
          value={settings.zoomSensitivity}
          min={0.2}
          max={2.5}
          step={0.1}
          onChange={(v) => setNumber("zoomSensitivity", v)}
        />

        <div className="settings-group-label">INTERFACE</div>
        <div className="settings-row">
          <label><Type size={13} /> Text command input</label>
          <Toggle checked={settings.textInputEnabled} onChange={() => toggle("textInputEnabled")} />
        </div>
        <div className="settings-row">
          <label><MessageSquareText size={13} /> Show reply as text</label>
          <Toggle checked={settings.showReplyText} onChange={() => toggle("showReplyText")} />
        </div>
      </div>
    </div>
  );
}

