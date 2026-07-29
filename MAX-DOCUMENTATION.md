# Max API and object documentation

This is the production Max surface used by Motif. Every generated object, Max JavaScript API, jweb bridge method, and Live Object Model call below links to the current official Cycling ’74 documentation. Historical objects and compatibility methods are intentionally excluded.

## Generated patch objects

| Surface | Official documentation |
| --- | --- |
| `comment` | [comment](https://docs.cycling74.com/reference/comment/) |
| `deferlow` | [deferlow](https://docs.cycling74.com/reference/deferlow/) |
| `gate` | [gate](https://docs.cycling74.com/reference/gate/) |
| `inlet` | [inlet](https://docs.cycling74.com/reference/inlet/) |
| `jsui` | [jsui](https://docs.cycling74.com/reference/jsui/) |
| `jweb` (`rendermode`, `readfile`, `url`, `title`) | [jweb](https://docs.cycling74.com/reference/jweb/) |
| `live.comment` | [live.comment](https://docs.cycling74.com/reference/live.comment/) |
| `live.menu` | [live.menu](https://docs.cycling74.com/reference/live.menu/) |
| `live.numbox` | [live.numbox](https://docs.cycling74.com/reference/live.numbox/) |
| `live.observer` | [live.observer](https://docs.cycling74.com/reference/live.observer/) |
| `live.path` | [live.path](https://docs.cycling74.com/reference/live.path/) |
| `live.tab` | [live.tab](https://docs.cycling74.com/reference/live.tab/) |
| `live.text` | [live.text](https://docs.cycling74.com/reference/live.text/) |
| `live.thisdevice` | [live.thisdevice](https://docs.cycling74.com/reference/live.thisdevice/) |
| `loadmess` | [loadmess](https://docs.cycling74.com/reference/loadmess/) |
| `message` | [message](https://docs.cycling74.com/reference/message/) |
| `midiflush` | [midiflush](https://docs.cycling74.com/reference/midiflush/) |
| `midiformat` | [midiformat](https://docs.cycling74.com/reference/midiformat/) |
| `midiin` | [midiin](https://docs.cycling74.com/reference/midiin/) |
| `midiout` | [midiout](https://docs.cycling74.com/reference/midiout/) |
| `midiparse` | [midiparse](https://docs.cycling74.com/reference/midiparse/) |
| `midiselect` | [midiselect](https://docs.cycling74.com/reference/midiselect/) |
| `opendialog` | [opendialog](https://docs.cycling74.com/reference/opendialog/) |
| `p` subpatcher | [patcher](https://docs.cycling74.com/reference/patcher/) |
| `pack` | [pack](https://docs.cycling74.com/reference/pack/) |
| `pattr` | [pattr](https://docs.cycling74.com/reference/pattr/) |
| `pcontrol` | [pcontrol](https://docs.cycling74.com/reference/pcontrol/) |
| `pipe` | [pipe](https://docs.cycling74.com/reference/pipe/) |
| `prepend` | [prepend](https://docs.cycling74.com/reference/prepend/) |
| `print` | [print](https://docs.cycling74.com/reference/print/) |
| `receive` | [receive](https://docs.cycling74.com/reference/receive/) |
| `route` | [route](https://docs.cycling74.com/reference/route/) |
| `sel` | [select](https://docs.cycling74.com/reference/select/) |
| `send` | [send](https://docs.cycling74.com/reference/send/) |
| `t` | [trigger](https://docs.cycling74.com/reference/trigger/) |
| `thispatcher` | [thispatcher](https://docs.cycling74.com/reference/thispatcher/) |
| `umenu` | [umenu](https://docs.cycling74.com/reference/umenu/) |
| `unpack` | [unpack](https://docs.cycling74.com/reference/unpack/) |
| `v8` | [v8](https://docs.cycling74.com/reference/v8/) |

## Max JavaScript runtime

| Surface | Official documentation |
| --- | --- |
| `anything`, `messagename`, `arrayfromargs`, `outlet`, `jsarguments`, `paint`, mouse/resize/load handlers | [jsthis](https://docs.cycling74.com/apiref/js/jsthis/) |
| `post` | [post](https://docs.cycling74.com/apiref/js/post/) |
| `error` | [error](https://docs.cycling74.com/apiref/js/error/) |
| `File` constructor, properties, `readstring`, `writestring`, `close` | [File](https://docs.cycling74.com/apiref/js/file/) |
| `Folder` constructor, properties, `next`, `close` | [Folder](https://docs.cycling74.com/apiref/js/folder/) |
| `Task` constructor, `schedule`, `cancel`, `freepeer` | [Task](https://docs.cycling74.com/apiref/js/task/) |
| `box.rect` | [Maxobj.rect](https://docs.cycling74.com/apiref/js/maxobj/#rect) |
| `mgraphics` properties and drawing methods | [MGraphics](https://docs.cycling74.com/apiref/js/mgraphics/) |

## jweb and Live Object Model

| Surface | Official documentation |
| --- | --- |
| `window.max.bindInlet` and `window.max.outlet` | [Web Browser and jweb: JavaScript Communication](https://docs.cycling74.com/userguide/web_browser/#javascript-communication) |
| `LiveAPI(callback?, path?)`, `id`, `get`, `getstring`, `call` | [LiveAPI](https://docs.cycling74.com/apiref/js/liveapi/) |
| `live_set view detail_clip` and `highlighted_clip_slot` | [Song.View](https://docs.cycling74.com/apiref/lom/song_view/) |
| `ClipSlot.has_clip` and `ClipSlot.clip` | [ClipSlot](https://docs.cycling74.com/apiref/lom/clipslot/) |
| `Clip.is_midi_clip`, `Clip.is_audio_clip`, `Clip.name`, `Clip.get_notes_extended` | [Clip](https://docs.cycling74.com/apiref/lom/clip/) |

The clip importer targets the current Live 11+ note API. It does not call the retired `get_notes` method. Continuous Song synchronization remains on native `live.path` and `live.observer`; `LiveAPI` is created only in response to the user’s Import Clip action.

## Distribution

Max for Live containers must be [frozen and saved in Max](https://docs.cycling74.com/userguide/m4l/live_freezing/) so their referenced JavaScript dependencies are embedded. `npm run validate:amxd` checks that the packaged container matches the generated patch before release.
