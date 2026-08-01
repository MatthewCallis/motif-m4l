import type { LibraryAction, LibraryServerState } from "../../src/max/library-protocol.js";
import { applyFixtureAction, createFixture, type FixtureName } from "./fixtures.js";

interface WindowConfig {
  width: number;
  height: number;
}

interface WindowLimits {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

interface ConfigResponse {
  config: WindowConfig;
  limits?: WindowLimits;
  error?: string;
}

declare global {
  interface Window {
    max?: {
      outlet: (...args: unknown[]) => void;
    };
  }
}

const API_PATH = "/__motif/library-window";
const WORKBENCH_STATE_MESSAGE = "motif-library-workbench-state";

function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Workbench element is missing: ${id}`);
  return value as T;
}

const windowElement = element<HTMLDivElement>("library-window");
const frame = element<HTMLIFrameElement>("library-frame");
const widthInput = element<HTMLInputElement>("width-input");
const heightInput = element<HTMLInputElement>("height-input");
const sizeReadout = element<HTMLElement>("size-readout");
const status = element<HTMLDivElement>("save-status");
const saveButton = element<HTMLButtonElement>("save-button");
const resetButton = element<HTMLButtonElement>("reset-button");
const fixtureSelect = element<HTMLSelectElement>("fixture-select");
const actionLog = element<HTMLPreElement>("action-log");

let savedConfig: WindowConfig = { width: 640, height: 460 };
let currentConfig: WindowConfig = { ...savedConfig };
let currentState: LibraryServerState = createFixture("normal");
const events: string[] = [];

function sameSize(left: WindowConfig, right: WindowConfig): boolean {
  return left.width === right.width && left.height === right.height;
}

function setStatus(message: string, kind: "" | "dirty" | "saved" | "error" = ""): void {
  status.textContent = message;
  status.className = `status${kind ? ` ${kind}` : ""}`;
}

function refreshDimensionUi(): void {
  widthInput.value = String(currentConfig.width);
  heightInput.value = String(currentConfig.height);
  sizeReadout.textContent = `${currentConfig.width} × ${currentConfig.height}`;
  const clean = sameSize(currentConfig, savedConfig);
  saveButton.disabled = clean;
  resetButton.disabled = clean;
  if (clean) setStatus(`Source size: ${savedConfig.width} × ${savedConfig.height}`, "saved");
  else setStatus(`Unsaved size: ${currentConfig.width} × ${currentConfig.height}`, "dirty");
}

function setDimensions(config: WindowConfig): void {
  currentConfig = {
    width: Math.round(config.width),
    height: Math.round(config.height),
  };
  windowElement.style.width = `${currentConfig.width}px`;
  windowElement.style.height = `${currentConfig.height}px`;
  refreshDimensionUi();
}

function inputDimensions(): WindowConfig | null {
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  return Number.isInteger(width) && Number.isInteger(height) ? { width, height } : null;
}

function sendState(): void {
  frame.contentWindow?.postMessage(
    {
      type: WORKBENCH_STATE_MESSAGE,
      payload: encodeURIComponent(JSON.stringify(currentState)),
    },
    window.location.origin,
  );
}

function appendEvent(values: unknown[]): void {
  const selector = typeof values[0] === "string" ? values[0] : "message";
  let detail = values
    .slice(1)
    .map((value) => (typeof value === "string" ? value : JSON.stringify(value)))
    .join(" ");
  try {
    detail = decodeURIComponent(detail);
  } catch {
    // Keep the original message when it is not URL encoded.
  }
  events.push(`${new Date().toLocaleTimeString()}  ${selector}${detail ? `  ${detail}` : ""}`);
  if (events.length > 80) events.shift();
  actionLog.textContent = events.join("\n");
  actionLog.scrollTop = actionLog.scrollHeight;
}

function handleLibraryOutlet(...values: unknown[]): void {
  appendEvent(values);
  if (values[0] !== "lib_action") return;
  try {
    const encodedAction = typeof values[1] === "string" ? values[1] : "";
    const action = JSON.parse(decodeURIComponent(encodedAction)) as LibraryAction;
    currentState = applyFixtureAction(currentState, action);
    sendState();
  } catch (reason) {
    appendEvent(["workbench_error", reason instanceof Error ? reason.message : String(reason)]);
  }
}

function attachFrameBridge(): void {
  const target = frame.contentWindow;
  if (target?.max) target.max.outlet = handleLibraryOutlet;
  appendEvent(["workbench_ready", "Library fixture channel attached"]);
  sendState();
}

new ResizeObserver((entries) => {
  const entry = entries[0];
  if (!entry) return;
  const width = Math.round(entry.contentRect.width);
  const height = Math.round(entry.contentRect.height);
  if (width === currentConfig.width && height === currentConfig.height) return;
  currentConfig = { width, height };
  refreshDimensionUi();
}).observe(windowElement);

for (const input of [widthInput, heightInput]) {
  input.addEventListener("change", () => {
    const dimensions = inputDimensions();
    if (dimensions) setDimensions(dimensions);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const dimensions = inputDimensions();
      if (dimensions) setDimensions(dimensions);
    }
  });
}

document.querySelectorAll<HTMLButtonElement>("[data-size]").forEach((button) => {
  button.addEventListener("click", () => {
    const match = button.dataset["size"]?.match(/^(\d+)x(\d+)$/);
    if (match?.[1] && match[2])
      setDimensions({ width: Number(match[1]), height: Number(match[2]) });
  });
});

fixtureSelect.addEventListener("change", () => {
  currentState = createFixture(fixtureSelect.value as FixtureName);
  appendEvent(["fixture", fixtureSelect.selectedOptions[0]?.textContent ?? fixtureSelect.value]);
  sendState();
});

resetButton.addEventListener("click", () => setDimensions(savedConfig));

async function saveDimensions(): Promise<void> {
  saveButton.disabled = true;
  setStatus("Saving size to source…");
  try {
    const response = await fetch(API_PATH, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentConfig),
    });
    const payload = (await response.json()) as ConfigResponse;
    if (!response.ok) throw new Error(payload.error ?? "The size could not be saved");
    savedConfig = payload.config;
    currentConfig = { ...payload.config };
    refreshDimensionUi();
    setStatus(`Saved ${savedConfig.width} × ${savedConfig.height} to source`, "saved");
  } catch (reason) {
    setStatus(reason instanceof Error ? reason.message : String(reason), "error");
    saveButton.disabled = false;
  }
}

saveButton.addEventListener("click", () => void saveDimensions());

element<HTMLButtonElement>("clear-log-button").addEventListener("click", () => {
  events.length = 0;
  actionLog.textContent = "No Library actions yet.";
});

frame.addEventListener("load", attachFrameBridge);

async function initialize(): Promise<void> {
  try {
    const response = await fetch(API_PATH, { headers: { Accept: "application/json" } });
    const payload = (await response.json()) as ConfigResponse;
    if (!response.ok) throw new Error(payload.error ?? "Could not load the saved size");
    savedConfig = payload.config;
    if (payload.limits) {
      widthInput.min = String(payload.limits.minWidth);
      widthInput.max = String(payload.limits.maxWidth);
      heightInput.min = String(payload.limits.minHeight);
      heightInput.max = String(payload.limits.maxHeight);
      windowElement.style.minWidth = `${payload.limits.minWidth}px`;
      windowElement.style.maxWidth = `${payload.limits.maxWidth}px`;
      windowElement.style.minHeight = `${payload.limits.minHeight}px`;
      windowElement.style.maxHeight = `${payload.limits.maxHeight}px`;
    }
    setDimensions(savedConfig);
  } catch (reason) {
    setStatus(reason instanceof Error ? reason.message : String(reason), "error");
    setDimensions(savedConfig);
  }
}

void initialize();
