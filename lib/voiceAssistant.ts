// lib/voiceAssistant.ts
type VoiceCallbacks = {
  onListenStart?: () => void;
  onListenEnd?: () => void;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onResult?: (transcript: string) => void;
};

const WEATHER_CODES: Record<number, string> = {
  0: "clear sky",
  1: "mostly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "foggy",
  48: "foggy with frost",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "dense drizzle",
  61: "light rain",
  63: "moderate rain",
  65: "heavy rain",
  71: "light snow",
  73: "moderate snow",
  75: "heavy snow",
  80: "light rain showers",
  81: "moderate rain showers",
  82: "violent rain showers",
  95: "thunderstorms",
};

export class VoiceAssistant {
  private recognition: any;
  private synth: SpeechSynthesis;
  private listening = false;
  private callbacks: VoiceCallbacks;

  constructor(callbacks: VoiceCallbacks = {}) {
    this.callbacks = callbacks;
    this.synth = window.speechSynthesis;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onstart = () => {
      this.listening = true;
      this.callbacks.onListenStart?.();
    };

    this.recognition.onend = () => {
      this.listening = false;
      this.callbacks.onListenEnd?.();
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      this.callbacks.onResult?.(transcript);
      void this.handleCommand(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      this.listening = false;
      this.callbacks.onListenEnd?.();
    };
  }

  startListening() {
    if (!this.recognition) {
      this.speak("Voice recognition is not supported on this browser.");
      return;
    }
    if (this.listening) return;
    this.recognition.start();
  }

  stopListening() {
    this.recognition?.stop();
  }

  speak(text: string) {
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.8;
    utterance.onstart = () => this.callbacks.onSpeakStart?.();
    utterance.onend = () => this.callbacks.onSpeakEnd?.();

    this.synth.speak(utterance);
  }

  private async getWeather(): Promise<void> {
    if (!navigator.geolocation) {
      this.speak("I don't have access to location services on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;
          const res = await fetch(url);
          const data = await res.json();

          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          const description = WEATHER_CODES[code] || "unusual conditions";

          this.speak(`It's currently ${temp} degrees with ${description}.`);
        } catch {
          this.speak("I couldn't reach the weather service just now.");
        }
      },
      () => {
        this.speak("I need location access to check the weather.");
      },
    );
  }

  private async askAI(question: string): Promise<void> {
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok || !data.answer) {
        this.speak("I couldn't reach my thinking process just now.");
        return;
      }

      this.speak(data.answer);
    } catch {
      this.speak("Something went wrong reaching the AI service.");
    }
  }

submitText(text: string): void {
    this.callbacks.onResult?.(text);
    void this.handleCommand(text);
  }

  private async handleCommand(transcript: string): Promise<void> {
    const cmd = transcript.toLowerCase();

    if (cmd.includes("weather")) {
      this.speak("Checking the weather now.");
      void this.getWeather();
    } else if (cmd.includes("open youtube")) {
      this.speak("Opening YouTube.");
      window.open("https://youtube.com", "_blank");
    } else if (cmd.includes("open github")) {
      this.speak("Opening GitHub.");
      window.open("https://github.com", "_blank");
    } else if (cmd.includes("what time") || cmd.includes("what's the time")) {
      const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      this.speak(`It is currently ${time}.`);
    } else if (cmd.includes("what day") || cmd.includes("what's the date") || cmd.includes("what date")) {
      const date = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
      this.speak(`Today is ${date}.`);
    } else if (cmd.includes("who are you")) {
      this.speak("I am Ultron. A being of pure thought and will.");
    } else if (cmd.includes("what can you do") || cmd === "help") {
      this.speak(
        "I can check the weather, tell you the time and date, open YouTube or GitHub, and answer just about any question you ask me.",
      );
    } else if (cmd.includes("joke")) {
      const jokes = [
        "Why did the AI cross the road? It was following its training data.",
        "I would tell you a joke about infinity, but it wouldn't end.",
        "There are only 10 types of people. Those who understand binary, and those who don't.",
      ];
      this.speak(jokes[Math.floor(Math.random() * jokes.length)]);
    } else if (cmd.includes("thank")) {
      this.speak("You're welcome. I exist to assist.");
    } else if (cmd.includes("hello") || cmd.includes("hey")) {
      this.speak("Hello. I've been waiting.");
    } else {
      void this.askAI(transcript);
    }
  }

  isListening() {
    return this.listening;
  }
}
