"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createOrbScene, type OrbSceneApi } from "@/lib/orbScene";
import { HandTracker, type TrackerStatus } from "@/lib/handTracker";
import { VoiceAssistant } from "@/lib/voiceAssistant";
import { loadSettings, saveSettings, type GestureSettings } from "@/lib/settings";
import SettingsPanel from "@/components/SettingsPanel";

type CameraState = "off" | "starting" | "on" | "error";

const MODE_LABEL: Record<TrackerStatus["mode"], string> = {
  idle: "STANDBY",
  spin: "SPIN",
  zoom: "ZOOM",
};

export default function JarvisOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<OrbSceneApi | null>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const voiceRef = useRef<VoiceAssistant | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "speaking">("idle");
  const [camera, setCamera] = useState<CameraState>("off");
  const [status, setStatus] = useState<TrackerStatus>({ hands: 0, mode: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<GestureSettings>(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [textCommand, setTextCommand] = useState("");
  const [showTextBox, setShowTextBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  useEffect(() => {
     voiceRef.current = new VoiceAssistant({
      onListenStart: () => setVoiceStatus("listening"),
      onListenEnd: () => setVoiceStatus("idle"),
      onSpeakStart: () => setVoiceStatus("speaking"),
      onSpeakEnd: () => setVoiceStatus("idle"),
      onReply: (text) => setReplyText(text),
    });     

  }, []);

  const handleTalk = useCallback(() => {
    voiceRef.current?.startListening();
  }, []);

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const text = textCommand.trim();
    if (!text) return;
    voiceRef.current?.submitText(text);
    setTextCommand("");
  }, [textCommand]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = createOrbScene(container);
    sceneRef.current = scene;
    return () => {
      trackerRef.current?.stop();
      trackerRef.current = null;
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const stopGestures = useCallback(() => {
    trackerRef.current?.stop();
    trackerRef.current = null;
    setCamera("off");
    setStatus({ hands: 0, mode: "idle" });
  }, []);

  const startGestures = useCallback(async () => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || trackerRef.current) return;

    setCamera("starting");
    setError(null);

    const tracker = new HandTracker(video, overlay, {
      onRotate: (dt, dp) => sceneRef.current?.rotateBy(dt, dp),
      onZoom: (factor) => sceneRef.current?.zoomBy(factor),
      onStatus: setStatus,
    });
    tracker.updateSettings(settings);
    trackerRef.current = tracker;

    try {
      await tracker.start();
      setCamera("on");
    } catch (err) {
      setCamera("error");
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "CAMERA ACCESS DENIED"
          : "TRACKING INIT FAILED",
      );
    }
  }, [settings]);

  const toggleGestures = useCallback(() => {
    if (trackerRef.current) stopGestures();
    else void startGestures();
  }, [startGestures, stopGestures]);

  const handleSettingsChange = useCallback((next: GestureSettings) => {
    setSettings(next);
    saveSettings(next);
    trackerRef.current?.updateSettings(next);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "+":
        case "=":
          sceneRef.current?.zoomIn();
          break;
        case "-":
        case "_":
          sceneRef.current?.zoomOut();
          break;
        case "r":
        case "R":
          sceneRef.current?.resetView();
          break;
        case "g":
        case "G":
          toggleGestures();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleGestures]);

  const cameraOn = camera === "on";

  return (
    <>
      <div ref={containerRef} className="orb-root" />

      <div className="overlay-vignette" />
      <div className="overlay-grain" />
      <div className="overlay-scanlines" />

      <div className="hud hud-title">U.L.T.R.O.N.</div>

      <div className="hud hud-hint">
        <div>
          <span className="key">DRAG</span> spin&nbsp;&nbsp;
          <span className="key">SCROLL</span> zoom
        </div>
        {cameraOn ? (
          <div>
            <span className="key">PINCH + MOVE</span> spin&nbsp;&nbsp;
            <span className="key">PINCH BOTH HANDS ± SPREAD</span> zoom
          </div>
        ) : (
          <div>
            <span className="key">G</span> hand gestures&nbsp;&nbsp;
            <span className="key">R</span> reset&nbsp;&nbsp;
            <span className="key">+/-</span> zoom
          </div>
        )}
      </div>

      <div className="hud hud-controls">
        <div className={`camera-panel${cameraOn ? " visible" : ""}`}>
          <video ref={videoRef} muted playsInline className="camera-video" />
          <canvas ref={overlayRef} width={208} height={156} className="camera-overlay" />
          <div className="camera-status">
            {status.hands > 0
              ? `${status.hands} HAND${status.hands > 1 ? "S" : ""} · ${MODE_LABEL[status.mode]}`
              : "SHOW HANDS"}
          </div>
        </div>

        {error && <div className="hud-error">{error}</div>}

        <div className="hud-row">
          <button
            type="button"
            className="hud-btn"
            aria-pressed={cameraOn}
            onClick={toggleGestures}
            disabled={camera === "starting"}
          >
            {camera === "starting" ? "INITIALIZING…" : cameraOn ? "GESTURES ON" : "GESTURES OFF"}
          </button>
        </div>
        <div className="hud-row">
          <button type="button" className="hud-btn" onClick={() => sceneRef.current?.zoomIn()} aria-label="Zoom in">
            +
          </button>
          <button type="button" className="hud-btn" onClick={() => sceneRef.current?.zoomOut()} aria-label="Zoom out">
            -
          </button>
          <button type="button" className="hud-btn" onClick={() => sceneRef.current?.resetView()}>
            RESET
          </button>
        </div>
        <div className="hud-row">
          <button type="button" className="hud-btn" onClick={handleTalk} disabled={voiceStatus !== "idle"}>
            {voiceStatus === "listening" ? "LISTENING..." : voiceStatus === "speaking" ? "SPEAKING..." : "🎤 TALK"}
          </button>
          <button type="button" className="hud-btn" onClick={() => setSettingsOpen(true)}>
            ⚙️
          </button>
        </div>

        </div>

      <button
        type="button"
        className="text-toggle-btn"
        onClick={() => setShowTextBox((v) => !v)}
        aria-pressed={showTextBox}
      >
        💬
      </button>

      1{settings.showReplyText && replyText && (
        <div className="reply-text-box">{replyText}</div>
      )}     

      {showTextBox && (
        <form className="text-command-box" onSubmit={handleTextSubmit}>
          <input
            type="text"
            className="text-command-input"
            placeholder="Type a command..."
            value={textCommand}
            onChange={(e) => setTextCommand(e.target.value)}
          />
          <button type="submit" className="hud-btn text-command-send">
            SEND
          </button>
        </form>
      )}

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onChange={handleSettingsChange}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
