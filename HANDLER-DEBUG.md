# Max v8 handler debugging

Motif uses one top-level Max handler, `anything()`. All selectors-including `song_context`, `note`, and `initialize`-are dispatched from there into the TypeScript engine.

## Expected beginning of `motif-device.js`

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

Max can keep the currently compiled JavaScript in memory. After copying in a new `motif-device.js`, either:

1. Send `compile` to `v8 motif-device.js`, or
2. Close the Max editor, remove the device from Live, and add it again.

## Contract check

```bash
npm run verify
```

`tests/max-handler-contract.test.ts` invokes every selector the patch sends through `anything()`. A new `prepend` selector cannot be added without updating that contract.
