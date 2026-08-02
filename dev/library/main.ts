import type { LibraryAction, LibraryServerState } from "../../src/max/library-protocol.js";
import sourceConfig from "../../config/library-window.json";
import type { LibraryWindowConfig } from "../../scripts/library-window-config.js";
import { applyFixtureAction, createFixture, type FixtureName } from "./fixtures.js";

type WindowConfig = LibraryWindowConfig;
type WindowLimits = Record<keyof WindowConfig, { min: number; max: number }>;

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
const WORKBENCH_LAYOUT_MESSAGE = "motif-library-workbench-layout";

function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Workbench element is missing: ${id}`);
  return value as T;
}

const windowElement = element<HTMLDivElement>("library-window");
const frame = element<HTMLIFrameElement>("library-frame");
const widthInput = element<HTMLInputElement>("width-input");
const heightInput = element<HTMLInputElement>("height-input");
const sidebarMinWidthInput = element<HTMLInputElement>("sidebar-min-width-input");
const sidebarMaxWidthInput = element<HTMLInputElement>("sidebar-max-width-input");
const detailMinWidthInput = element<HTMLInputElement>("detail-min-width-input");
const sidebarResizerWidthInput = element<HTMLInputElement>("sidebar-resizer-width-input");
const sizeReadout = element<HTMLElement>("size-readout");
const status = element<HTMLDivElement>("save-status");
const saveButton = element<HTMLButtonElement>("save-button");
const resetButton = element<HTMLButtonElement>("reset-button");
const fixtureSelect = element<HTMLSelectElement>("fixture-select");
const actionLog = element<HTMLPreElement>("action-log");

let savedConfig: WindowConfig = { ...sourceConfig };
let currentConfig: WindowConfig = { ...savedConfig };
let currentState: LibraryServerState = createFixture("normal");
const events: string[] = [];

function sameConfig(left: WindowConfig, right: WindowConfig): boolean {
  return (Object.keys(left) as Array<keyof WindowConfig>).every((key) => left[key] === right[key]);
}

function setStatus(message: string, kind: "" | "dirty" | "saved" | "error" = ""): void {
  status.textContent = message;
  status.className = `status${kind ? ` ${kind}` : ""}`;
}

function refreshConfigurationUi(): void {
  widthInput.value = String(currentConfig.width);
  heightInput.value = String(currentConfig.height);
  sidebarMinWidthInput.value = String(currentConfig.sidebarMinWidth);
  sidebarMaxWidthInput.value = String(currentConfig.sidebarMaxWidth);
  detailMinWidthInput.value = String(currentConfig.detailMinWidth);
  sidebarResizerWidthInput.value = String(currentConfig.sidebarResizerWidth);
  sizeReadout.textContent = `${currentConfig.width} × ${currentConfig.height}`;
  const clean = sameConfig(currentConfig, savedConfig);
  saveButton.disabled = clean;
  resetButton.disabled = clean;
  if (clean) setStatus("Source configuration loaded", "saved");
  else setStatus("Unsaved configuration", "dirty");
}

function sendLayout(): void {
  frame.contentWindow?.postMessage(
    {
      type: WORKBENCH_LAYOUT_MESSAGE,
      payload: {
        sidebarMinWidth: currentConfig.sidebarMinWidth,
        sidebarMaxWidth: currentConfig.sidebarMaxWidth,
        detailMinWidth: currentConfig.detailMinWidth,
        sidebarResizerWidth: currentConfig.sidebarResizerWidth,
      },
    },
    window.location.origin,
  );
}

function setConfiguration(config: WindowConfig): void {
  currentConfig = {
    width: Math.round(config.width),
    height: Math.round(config.height),
    sidebarMinWidth: Math.round(config.sidebarMinWidth),
    sidebarMaxWidth: Math.round(config.sidebarMaxWidth),
    detailMinWidth: Math.round(config.detailMinWidth),
    sidebarResizerWidth: Math.round(config.sidebarResizerWidth),
  };
  windowElement.style.width = `${currentConfig.width}px`;
  windowElement.style.height = `${currentConfig.height}px`;
  refreshConfigurationUi();
  sendLayout();
}

function setDimensions(width: number, height: number): void {
  setConfiguration({ ...currentConfig, width, height });
}

function inputConfiguration(): WindowConfig | null {
  const config: WindowConfig = {
    width: Number(widthInput.value),
    height: Number(heightInput.value),
    sidebarMinWidth: Number(sidebarMinWidthInput.value),
    sidebarMaxWidth: Number(sidebarMaxWidthInput.value),
    detailMinWidth: Number(detailMinWidthInput.value),
    sidebarResizerWidth: Number(sidebarResizerWidthInput.value),
  };
  return Object.values(config).every(Number.isInteger) ? config : null;
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
  sendLayout();
}

new ResizeObserver((entries) => {
  const entry = entries[0];
  if (!entry) return;
  const width = Math.round(entry.contentRect.width);
  const height = Math.round(entry.contentRect.height);
  if (width === currentConfig.width && height === currentConfig.height) return;
  currentConfig = { ...currentConfig, width, height };
  refreshConfigurationUi();
}).observe(windowElement);

const configurationInputs = [
  widthInput,
  heightInput,
  sidebarMinWidthInput,
  sidebarMaxWidthInput,
  detailMinWidthInput,
  sidebarResizerWidthInput,
];

for (const input of configurationInputs) {
  input.addEventListener("change", () => {
    const config = inputConfiguration();
    if (config) setConfiguration(config);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const config = inputConfiguration();
      if (config) setConfiguration(config);
    }
  });
}

document.querySelectorAll<HTMLButtonElement>("[data-size]").forEach((button) => {
  button.addEventListener("click", () => {
    const match = button.dataset["size"]?.match(/^(\d+)x(\d+)$/);
    if (match?.[1] && match[2]) setDimensions(Number(match[1]), Number(match[2]));
  });
});

fixtureSelect.addEventListener("change", () => {
  currentState = createFixture(fixtureSelect.value as FixtureName);
  appendEvent(["fixture", fixtureSelect.selectedOptions[0]?.textContent ?? fixtureSelect.value]);
  sendState();
});

resetButton.addEventListener("click", () => setConfiguration(savedConfig));

async function saveConfiguration(): Promise<void> {
  saveButton.disabled = true;
  setStatus("Saving configuration to source…");
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
    refreshConfigurationUi();
    setStatus("Saved configuration to source", "saved");
  } catch (reason) {
    setStatus(reason instanceof Error ? reason.message : String(reason), "error");
    saveButton.disabled = false;
  }
}

saveButton.addEventListener("click", () => void saveConfiguration());

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
      for (const input of configurationInputs) {
        const key = input.dataset["configKey"] as keyof WindowConfig | undefined;
        if (!key) continue;
        input.min = String(payload.limits[key].min);
        input.max = String(payload.limits[key].max);
      }
      windowElement.style.minWidth = `${payload.limits.width.min}px`;
      windowElement.style.maxWidth = `${payload.limits.width.max}px`;
      windowElement.style.minHeight = `${payload.limits.height.min}px`;
      windowElement.style.maxHeight = `${payload.limits.height.max}px`;
    }
    setConfiguration(savedConfig);
  } catch (reason) {
    setStatus(reason instanceof Error ? reason.message : String(reason), "error");
    setConfiguration(savedConfig);
  }
}

void initialize();
