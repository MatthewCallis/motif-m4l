import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

type Box = {
  maxclass: string;
  text?: string;
  patcher?: { boxes?: Array<{ box: Box }> };
};

const MAX_OBJECT_DOCS: Readonly<Record<string, string>> = {
  comment: "https://docs.cycling74.com/reference/comment/",
  deferlow: "https://docs.cycling74.com/reference/deferlow/",
  gate: "https://docs.cycling74.com/reference/gate/",
  inlet: "https://docs.cycling74.com/reference/inlet/",
  jsui: "https://docs.cycling74.com/reference/jsui/",
  jweb: "https://docs.cycling74.com/reference/jweb/",
  "live.comment": "https://docs.cycling74.com/reference/live.comment/",
  "live.menu": "https://docs.cycling74.com/reference/live.menu/",
  "live.numbox": "https://docs.cycling74.com/reference/live.numbox/",
  "live.observer": "https://docs.cycling74.com/reference/live.observer/",
  "live.path": "https://docs.cycling74.com/reference/live.path/",
  "live.tab": "https://docs.cycling74.com/reference/live.tab/",
  "live.text": "https://docs.cycling74.com/reference/live.text/",
  "live.thisdevice": "https://docs.cycling74.com/reference/live.thisdevice/",
  loadmess: "https://docs.cycling74.com/reference/loadmess/",
  message: "https://docs.cycling74.com/reference/message/",
  midiflush: "https://docs.cycling74.com/reference/midiflush/",
  midiformat: "https://docs.cycling74.com/reference/midiformat/",
  midiin: "https://docs.cycling74.com/reference/midiin/",
  midiout: "https://docs.cycling74.com/reference/midiout/",
  midiparse: "https://docs.cycling74.com/reference/midiparse/",
  midiselect: "https://docs.cycling74.com/reference/midiselect/",
  opendialog: "https://docs.cycling74.com/reference/opendialog/",
  p: "https://docs.cycling74.com/reference/patcher/",
  pack: "https://docs.cycling74.com/reference/pack/",
  pattr: "https://docs.cycling74.com/reference/pattr/",
  pcontrol: "https://docs.cycling74.com/reference/pcontrol/",
  pipe: "https://docs.cycling74.com/reference/pipe/",
  prepend: "https://docs.cycling74.com/reference/prepend/",
  print: "https://docs.cycling74.com/reference/print/",
  receive: "https://docs.cycling74.com/reference/receive/",
  route: "https://docs.cycling74.com/reference/route/",
  sel: "https://docs.cycling74.com/reference/select/",
  send: "https://docs.cycling74.com/reference/send/",
  t: "https://docs.cycling74.com/reference/trigger/",
  thispatcher: "https://docs.cycling74.com/reference/thispatcher/",
  umenu: "https://docs.cycling74.com/reference/umenu/",
  unpack: "https://docs.cycling74.com/reference/unpack/",
  v8: "https://docs.cycling74.com/reference/v8/",
};

function collectBoxes(boxes: Array<{ box: Box }>, result: Box[] = []): Box[] {
  for (const { box } of boxes) {
    result.push(box);
    if (box.patcher?.boxes) collectBoxes(box.patcher.boxes, result);
  }
  return result;
}

describe("Max documentation contract", () => {
  it("links every generated Max object class to current official documentation", async () => {
    const patch = JSON.parse(await readFile("max/Motif.maxpat", "utf8")) as {
      patcher: { boxes: Array<{ box: Box }> };
    };
    const documentation = await readFile("MAX-DOCUMENTATION.md", "utf8");
    const surfaces = new Set<string>();

    for (const box of collectBoxes(patch.patcher.boxes)) {
      const surface =
        box.maxclass === "newobj"
          ? String(box.text ?? "")
              .trim()
              .split(/\s+/, 1)[0]
          : box.maxclass;
      if (surface) surfaces.add(surface);
    }

    const missing = [...surfaces].filter((surface) => MAX_OBJECT_DOCS[surface] === undefined);
    assert.deepEqual(missing, [], `undocumented generated Max surfaces: ${missing.join(", ")}`);
    for (const surface of surfaces) {
      const url = MAX_OBJECT_DOCS[surface]!;
      assert.ok(url.startsWith("https://docs.cycling74.com/"));
      assert.ok(
        documentation.includes(url),
        `${surface} documentation link is missing from MAX-DOCUMENTATION.md`,
      );
    }
  });

  it("keeps Max JavaScript and LiveAPI calls on the documented current surface", async () => {
    const [_device, liveApi, globals, preview, libraryTemplate, libraryClient, documentation] =
      await Promise.all([
        readFile("src/max/device.ts", "utf8"),
        readFile("src/max/live-api.ts", "utf8"),
        readFile("src/max/globals.d.ts", "utf8"),
        readFile("src/max/motif-preview.js", "utf8"),
        readFile("src/max/library.html", "utf8"),
        readFile("src/max/library.ts", "utf8"),
        readFile("MAX-DOCUMENTATION.md", "utf8"),
      ]);

    assert.match(
      globals,
      /constructor\(callback\?: \(args: unknown\[\]\) => void, path\?: string\)/,
    );
    assert.match(liveApi, /new LiveAPI\(undefined, ["']live_set view detail_clip["']\)/);
    assert.match(liveApi, /clip\.call\(["']get_notes_extended["'], 0, 128, 0, 4096\)/);
    assert.doesNotMatch(liveApi, /clip\.call\(["']get_notes["']/);
    assert.match(globals, /^\s*id: number;$/m);
    assert.doesNotMatch(globals, /readonly id: number/);
    assert.match(preview, /https:\/\/docs\.cycling74\.com\/apiref\/js\/mgraphics\//);
    assert.match(
      libraryTemplate,
      /https:\/\/docs\.cycling74\.com\/userguide\/web_browser\/#javascript-communication/,
    );
    assert.match(libraryClient, /maxBridge\.bindInlet\(["']receiveData["'], receiveData\)/);
    assert.ok(documentation.includes("https://docs.cycling74.com/apiref/lom/clip/"));
  });
});
