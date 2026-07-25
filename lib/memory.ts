// lib/memory.ts
const STORAGE_KEY = "ultron-memory";

export interface Memory {
  facts: string[];
}

export function loadMemory(): Memory {
  if (typeof window === "undefined") return { facts: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { facts: [] };
    return JSON.parse(raw);
  } catch {
    return { facts: [] };
  }
}

export function saveMemory(memory: Memory) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // ignore
  }
}

export function addFact(fact: string) {
  const memory = loadMemory();
  memory.facts.push(fact);
  saveMemory(memory);
}

export function clearMemory() {
  saveMemory({ facts: [] });
}
