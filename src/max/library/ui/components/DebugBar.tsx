/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks";
import { subscribeDebug } from "../bridge.js";
import type { DebugLevel } from "../page-state.js";

/** Collapsible debug log bar for the Library page. */
export function DebugBar() {
  const [entries, setEntries] = useState<string[]>([]);
  const [level, setLevel] = useState<DebugLevel>("info");
  const [summary, setSummary] = useState("Loading jweb bridge...");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return subscribeDebug((nextEntries, nextLevel, message) => {
      setEntries([...nextEntries]);
      setLevel(nextLevel);
      setSummary(message);
    });
  }, []);

  let indicatorClass = "";
  if (level === "error") {
    indicatorClass = "error";
  } else if (level === "ok") {
    indicatorClass = "ok";
  }
  const hasError = entries.some((entry) => entry.includes("[error]"));

  let panelClass = "";
  if (open) {
    panelClass += "open";
  }
  if (hasError) {
    panelClass += (panelClass ? " " : "") + "has-error";
  }

  return (
    <>
      <div id="debug-panel" class={panelClass || undefined} aria-live="polite">
        {entries.join("\n")}
      </div>
      <div id="debug-bar">
        <span id="debug-indicator" class={indicatorClass || undefined}>
          ●
        </span>
        <span id="debug-summary">{summary}</span>
        <button id="debug-toggle" type="button" onClick={() => setOpen((value) => !value)}>
          Debug
        </button>
      </div>
    </>
  );
}
