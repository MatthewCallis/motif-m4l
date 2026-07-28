/**
 * Release-only validation for the frozen Max for Live container.
 *
 * Max must create this binary by freezing and saving the generated patch. This
 * check prevents an older embedded patch or JavaScript dependency from being
 * shipped after the source build has moved on.
 *
 * @see https://docs.cycling74.com/userguide/m4l/live_freezing/
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

type Patcher = {
  dependency_cache: Array<{ name: string }>;
};

const generated = (JSON.parse(await readFile('max/Motif.maxpat', 'utf8')) as { patcher: Patcher }).patcher;
const dependencyNames = generated.dependency_cache.map(({ name }) => name);
const engineFilename = dependencyNames.find((name) => /^motif-device-[a-f0-9]{12}\.js$/.test(name));
const previewFilename = dependencyNames.find((name) => /^motif-preview-[a-f0-9]{12}\.js$/.test(name));
assert.ok(engineFilename && previewFilename, 'generated patch does not identify its hashed runtime dependencies');

const amxd = (await readFile('max/Motif.amxd')).toString('latin1');
const problems: string[] = [];

for (const filename of [engineFilename, previewFilename]) {
  if (!amxd.includes(filename)) problems.push(`missing current frozen dependency ${filename}`);
}

const staleSurfaces: Array<[RegExp, string]> = [
  [/clip\.call\(["']get_notes["']/, 'retired Live Object Model get_notes call'],
  [/function edit_meta\(/, 'retired edit_meta handler'],
  [/function select_note\(/, 'retired select_note handler'],
  [/route choose_library library_ready web_debug lib_action url title onloadend/, 'undocumented jweb onloadend route'],
  [/"autosize"\s*:\s*1/, 'undocumented jweb autosize attribute'],
  [/\bMitsuda Lick\b|\bSalt Peanuts\b/, 'obsolete built-in motif data'],
];

for (const [pattern, description] of staleSurfaces) {
  if (pattern.test(amxd)) problems.push(`contains ${description}`);
}

if (!/"text"\s*:\s*"close"/.test(amxd)) {
  problems.push('missing the repeated-Info close/defer/reopen lifecycle');
}

if (problems.length > 0) {
  throw new Error(
    `Packaged max/Motif.amxd is not synchronized with max/Motif.maxpat:\n${problems.map((problem) => `- ${problem}`).join('\n')}\n`
    + 'Open the device from Live, replace its patch with max/Motif.maxpat, then freeze and save it.',
  );
}

console.log(`Validated frozen Motif.amxd: ${engineFilename}, ${previewFilename}.`);
