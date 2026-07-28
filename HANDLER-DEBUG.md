# Max v8 handler debugging

Motif uses one top-level Max handler, `anything()`. All selectors-including `song_context`, `note`, and `initialize`-are dispatched from there into the TypeScript engine.

## Expected beginning of `motif-device-<hash>.js`

```js
var inlets = 1;
var outlets = 1;

function anything() {
  var message = messagename;
  var args = arrayfromargs(arguments);
  return MotifEngine.dispatch(message, args);
}
```

There should be no generated top-level `function song_context()` wrapper.

## Reloading after replacing the file

Max can keep compiled JavaScript in memory. Do not replace a file under the same name: run the build and copy the newly content-addressed file and generated patch together. If manually testing a stable build artifact, either:

1. Send `compile` to the `v8` object, or
2. Close the Max editor, remove the device from Live, and add it again.

## Contract check

```bash
npm run verify
```

`tests/max-handler-contract.test.ts` invokes every selector the patch sends through `anything()`. A new `prepend` selector cannot be added without updating that contract.
