# Max API & Object Documentation

This is the production Max surface used by Motif. Every generated object, Max JavaScript API, jweb bridge method, and Live Object Model call below links to the current official Cycling ’74 documentation. Historical objects and compatibility methods are intentionally excluded.

## Generated Patch Objects

| Surface                                           | Official documentation                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `comment`                                         | [comment](https://docs.cycling74.com/reference/comment/)                 |
| `deferlow`                                        | [deferlow](https://docs.cycling74.com/reference/deferlow/)               |
| `gate`                                            | [gate](https://docs.cycling74.com/reference/gate/)                       |
| `inlet`                                           | [inlet](https://docs.cycling74.com/reference/inlet/)                     |
| `jsui`                                            | [jsui](https://docs.cycling74.com/reference/jsui/)                       |
| `jweb` (`rendermode`, `readfile`, `url`, `title`) | [jweb](https://docs.cycling74.com/reference/jweb/)                       |
| `live.comment`                                    | [live.comment](https://docs.cycling74.com/reference/live.comment/)       |
| `live.menu`                                       | [live.menu](https://docs.cycling74.com/reference/live.menu/)             |
| `live.numbox`                                     | [live.numbox](https://docs.cycling74.com/reference/live.numbox/)         |
| `live.observer`                                   | [live.observer](https://docs.cycling74.com/reference/live.observer/)     |
| `live.path`                                       | [live.path](https://docs.cycling74.com/reference/live.path/)             |
| `live.tab`                                        | [live.tab](https://docs.cycling74.com/reference/live.tab/)               |
| `live.text`                                       | [live.text](https://docs.cycling74.com/reference/live.text/)             |
| `live.thisdevice`                                 | [live.thisdevice](https://docs.cycling74.com/reference/live.thisdevice/) |
| `loadmess`                                        | [loadmess](https://docs.cycling74.com/reference/loadmess/)               |
| `message`                                         | [message](https://docs.cycling74.com/reference/message/)                 |
| `midiflush`                                       | [midiflush](https://docs.cycling74.com/reference/midiflush/)             |
| `midiformat`                                      | [midiformat](https://docs.cycling74.com/reference/midiformat/)           |
| `midiin`                                          | [midiin](https://docs.cycling74.com/reference/midiin/)                   |
| `midiout`                                         | [midiout](https://docs.cycling74.com/reference/midiout/)                 |
| `midiparse`                                       | [midiparse](https://docs.cycling74.com/reference/midiparse/)             |
| `midiselect`                                      | [midiselect](https://docs.cycling74.com/reference/midiselect/)           |
| `opendialog`                                      | [opendialog](https://docs.cycling74.com/reference/opendialog/)           |
| `p` subpatcher                                    | [patcher](https://docs.cycling74.com/reference/patcher/)                 |
| `pack`                                            | [pack](https://docs.cycling74.com/reference/pack/)                       |
| `pattr`                                           | [pattr](https://docs.cycling74.com/reference/pattr/)                     |
| `pcontrol`                                        | [pcontrol](https://docs.cycling74.com/reference/pcontrol/)               |
| `pipe`                                            | [pipe](https://docs.cycling74.com/reference/pipe/)                       |
| `prepend`                                         | [prepend](https://docs.cycling74.com/reference/prepend/)                 |
| `print`                                           | [print](https://docs.cycling74.com/reference/print/)                     |
| `receive`                                         | [receive](https://docs.cycling74.com/reference/receive/)                 |
| `route`                                           | [route](https://docs.cycling74.com/reference/route/)                     |
| `sel`                                             | [select](https://docs.cycling74.com/reference/select/)                   |
| `send`                                            | [send](https://docs.cycling74.com/reference/send/)                       |
| `t`                                               | [trigger](https://docs.cycling74.com/reference/trigger/)                 |
| `thispatcher`                                     | [thispatcher](https://docs.cycling74.com/reference/thispatcher/)         |
| `umenu`                                           | [umenu](https://docs.cycling74.com/reference/umenu/)                     |
| `unpack`                                          | [unpack](https://docs.cycling74.com/reference/unpack/)                   |
| `uzi`                                             | [uzi](https://docs.cycling74.com/reference/uzi/)                         |
| `v8`                                              | [v8](https://docs.cycling74.com/reference/v8/)                           |

## Max Application Messages

| Surface         | Official documentation                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| `launchbrowser` | [Controlling Max with Messages](https://docs.cycling74.com/userguide/controlling_max_with_messages/#launchbrowser) |

## Max JavaScript Runtime

| Surface                                                                                                  | Official documentation                                           |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `anything`, `messagename`, `arrayfromargs`, `outlet`, `jsarguments`, `paint`, mouse/resize/load handlers | [jsthis](https://docs.cycling74.com/apiref/js/jsthis/)           |
| `post`                                                                                                   | [post](https://docs.cycling74.com/apiref/js/post/)               |
| `error`                                                                                                  | [error](https://docs.cycling74.com/apiref/js/error/)             |
| `File` constructor, properties, `readstring`, `writestring`, `close`                                     | [File](https://docs.cycling74.com/apiref/js/file/)               |
| `Folder` constructor, properties, `next`, `close`                                                        | [Folder](https://docs.cycling74.com/apiref/js/folder/)           |
| `Task` constructor, `schedule`, `cancel`, `freepeer`                                                     | [Task](https://docs.cycling74.com/apiref/js/task/)               |
| `box.rect`                                                                                               | [Maxobj.rect](https://docs.cycling74.com/apiref/js/maxobj/#rect) |
| `mgraphics` properties and drawing methods                                                               | [MGraphics](https://docs.cycling74.com/apiref/js/mgraphics/)     |

## jweb & Live Object Model

| Surface                                                                           | Official documentation                                                                                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `window.max.bindInlet` and `window.max.outlet`                                    | [Web Browser and jweb: JavaScript Communication](https://docs.cycling74.com/userguide/web_browser/#javascript-communication) |
| `LiveAPI(callback?, path?)`, `id`, `get`, `getstring`, `call`                     | [LiveAPI](https://docs.cycling74.com/apiref/js/liveapi/)                                                                     |
| `Song.root_note`, `scale_name`, `scale_intervals`, and `scale_mode`               | [Song](https://docs.cycling74.com/apiref/lom/song/)                                                                          |
| `live_set view detail_clip` and `highlighted_clip_slot`                           | [Song.View](https://docs.cycling74.com/apiref/lom/song_view/)                                                                |
| `ClipSlot.has_clip` and `ClipSlot.clip`                                           | [ClipSlot](https://docs.cycling74.com/apiref/lom/clipslot/)                                                                  |
| `Clip.is_midi_clip`, `Clip.is_audio_clip`, `Clip.name`, `Clip.get_notes_extended` | [Clip](https://docs.cycling74.com/apiref/lom/clip/)                                                                          |

The clip importer targets the current Live 11+ note API. It does not call the retired `get_notes` method. Imports always preserve exact Chromatic offsets and snapshot the current observed Song root, scale name, and interval list as the motif's source pitch context. Continuous Song synchronization remains on native `live.path` and `live.observer`; `LiveAPI` is created only in response to the user’s Import Clip action.

## Live Set Persistence

Motif follows Live's parameter storage contract rather than treating patch-load messages as device state:

- Every user-facing setting is a parameter-enabled `live.*` object with Initial Enable and a unique long name. Trigger Mode and Repeat Rounding default to motif-owned values while remaining automatable device overrides. Invert and Reverse are integer `live.text` toggle parameters; their documented left outlet supplies the absolute `0`/`1` value.
- The selected motif id, MIDI hot-key assignments, and user-library path use parameter-enabled `pattr` objects with Blob type and **Stored Only** visibility. The blob stores stable motif ids, never menu indexes or labels.
- Visible Root and Scale menus are proxy controls with Parameter Mode enabled so `live.menu` can load its enum, but **Hidden** parameter visibility prevents Live from storing or automating their display values. With Scale off they show the observed Song values; with Scale on they edit separate automatable `live.menu` parameters that retain the device-local override without being overwritten by Song display updates. The Scale toggle is also a normal Live parameter.
- No `loadmess` writes a default into a stateful control. Max initializes parameters before `loadmess`, so such a message would overwrite the value Live just restored.
- `live.thisdevice` drives one explicit `trigger` sequence after parameter initialization: replay the library path, queue engine-owned state until the library scan finishes, output every restored Live control value, refresh Song observers, and initialize the engine.

These choices implement Cycling ’74's [Device Parameters in Max for Live](https://docs.cycling74.com/userguide/m4l/live_parameters/), [Patcher Lifecycle](https://docs.cycling74.com/userguide/patcher_lifecycle/), and [pattr](https://docs.cycling74.com/userguide/pattr/) guidance. Library actions also pass through `deferlow`, as required before creating or using `LiveAPI`.

## Scale Proxy Invariants

The generated Root and Scale controls deliberately separate display state from stored override state. Preserve both rules when changing this graph:

1. The visible proxy `live.menu` objects must keep `parameter_enable 1`. A `live.menu` obtains its `parameter_enum` through Parameter Mode; disabling it leaves the menu without an enum and Max reports `live.menu: Something bad happened, there's no enum, is there?`. Use `parameter_invisible 2` to keep a proxy out of Live's stored and automatable parameters. Do not disable Parameter Mode.
2. For each `gate 1`, inlet `0` is the control/selector inlet and inlet `1` is the data inlet. The inverted Scale-button state (`!- 1`) connects to inlet `0`; `root_note` or `scale_name` observer output connects to inlet `1`. Reversing them sends a scale label to the control inlet and Max reports errors such as `gate: doesn't understand "Lydian Dominant"`.

The generated-patch integration test and `validate:max` both assert these contracts. Run `npm run verify` after changing the Scale controls or their observer wiring.

## Distribution

Max for Live containers must be [frozen and saved in Max](https://docs.cycling74.com/userguide/m4l/live_freezing/) so their referenced JavaScript dependencies are embedded.
