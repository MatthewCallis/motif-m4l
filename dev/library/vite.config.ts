import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import {
  LIBRARY_WINDOW_LIMITS,
  readLibraryWindowConfig,
  writeLibraryWindowConfig,
} from "../../scripts/library-window-config.js";

const API_PATH = "/__motif/library-window";
const MAX_REQUEST_BYTES = 8_192;

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(value));
}

async function readJsonRequest(request: IncomingMessage): Promise<unknown> {
  request.setEncoding("utf8");
  let body = "";
  let length = 0;
  for await (const value of request) {
    const chunk: unknown = value;
    if (typeof chunk !== "string") throw new TypeError("Request body must be UTF-8 text");
    length += Buffer.byteLength(chunk);
    if (length > MAX_REQUEST_BYTES) throw new RangeError("Request is too large");
    body += chunk;
  }
  return JSON.parse(body) as unknown;
}

function libraryWindowApi(): Plugin {
  return {
    name: "motif-library-window-api",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        void handleLibraryWindowRequest(request, response, next);
      });
    },
  };
}

async function handleLibraryWindowRequest(
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
): Promise<void> {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (pathname !== API_PATH) {
    next();
    return;
  }

  try {
    if (request.method === "GET") {
      sendJson(response, 200, {
        config: await readLibraryWindowConfig(),
        limits: LIBRARY_WINDOW_LIMITS,
      });
      return;
    }
    if (request.method === "PUT") {
      const config = await writeLibraryWindowConfig(await readJsonRequest(request));
      sendJson(response, 200, { config });
      return;
    }
    response.setHeader("Allow", "GET, PUT");
    sendJson(response, 405, { error: "Method not allowed" });
  } catch (reason) {
    sendJson(response, 400, {
      error: reason instanceof Error ? reason.message : String(reason),
    });
  }
}

export default defineConfig({
  root: ".",
  plugins: [libraryWindowApi()],
  server: {
    open: process.env["MOTIF_LIBRARY_NO_OPEN"] === "1" ? false : "/dev/library/",
  },
});
