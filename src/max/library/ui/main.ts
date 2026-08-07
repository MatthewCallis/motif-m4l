/**
 * Browser entry for the Motif Library page embedded by Max `jweb`.
 *
 * `scripts/build.ts` bundles this file as a minified browser IIFE targeting
 * ES2018, then inlines it into the generated `max/library.html`.
 *
 * @see https://docs.cycling74.com/reference/jweb/
 * @see https://docs.cycling74.com/userguide/web_browser/#javascript-communication
 */

import { h, render } from "preact";
import { LibraryApp } from "./app.js";
import { startLibraryBridge } from "./bridge.js";

const mount = document.getElementById("root");
if (!mount) {
  throw new Error("Library root element is missing");
}
render(h(LibraryApp, null), mount);
startLibraryBridge();
