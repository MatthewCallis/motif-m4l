/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks";
import { subscribeDebug } from "../bridge.js";
import { classNames } from "../class-names.js";
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

  const hasError = entries.some((entry) => entry.includes("[error]"));

  return (
    <>
      <div
        id="debug-panel"
        className={classNames({ open, "has-error": hasError })}
        aria-live="polite"
      >
        {entries.join("\n")}
      </div>
      <div id="debug-bar">
        <span
          id="debug-indicator"
          className={classNames({ error: level === "error", ok: level === "ok" })}
          aria-hidden="true"
        >
          ●
        </span>
        <span id="debug-summary">{summary}</span>
        <button
          id="debug-toggle"
          type="button"
          aria-controls="debug-panel"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Debug
        </button>
      </div>
    </>
  );
}
