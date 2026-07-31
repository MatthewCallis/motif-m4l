/**
 * Browser controller for the Motif Library page embedded by Max `jweb`.
 *
 * `scripts/build.ts` bundles this file as a minified browser IIFE targeting
 * ES2018, then inlines it into the generated `max/library.html`.
 *
 * @see https://docs.cycling74.com/reference/jweb/
 * @see https://docs.cycling74.com/userguide/web_browser/#javascript-communication
 */

import {
  MAX_LIBRARY_STATE_CHUNKS,
  type LibrarySelectedMotifData,
  type LibraryServerState,
  type LibraryStateChunk,
} from './library-protocol.js';
import {
  createStore,
  errorText,
  isFolderCollapsed,
  isLibraryStateChunk,
  optionalNumberValue,
  toggleCollapsedFolder,
} from './library-logic.js';

type PanelName = 'properties' | 'notes';
type DebugLevel = 'info' | 'ok' | 'error';
type NoteFieldName =
  | 'pitch'
  | 'accidental'
  | 'at'
  | 'duration'
  | 'gate'
  | 'velocity'
  | 'velocityOffset'
  | 'velocityScale'
  | 'legato'
  | 'tie';

interface MaxBridge {
  outlet: (...args: unknown[]) => void;
  bindInlet?: (name: string, handler: (...values: unknown[]) => void) => void;
}

declare global {
  interface Window {
    max?: MaxBridge;
    __motifBrowserInlets?: Map<string, (...values: unknown[]) => void>;
  }
}

interface NoteField {
  name: NoteFieldName;
  type: 'number' | 'checkbox';
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}

interface LibraryAction {
  type: string;
  [key: string]: unknown;
}

interface ModalState {
  title: string;
  message: string;
  confirmLabel?: string;
  dismissOnly?: boolean;
  onConfirm?: () => void;
}

interface LibraryPageState {
  server: LibraryServerState | null;
  modal: ModalState | null;
  formDirty: boolean;
  activePanel: PanelName;
  collapsedFolders: Set<string>;
}

interface PendingStateTransfer {
  id: number;
  total: number;
  parts: string[];
  received: Set<number>;
}

type ValueControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Diagnostic source label forwarded to the Max console. */
const PAGE = 'library';
/** Editable note schema used to generate rows and coerce outgoing field values. */
const NOTE_FIELDS: readonly NoteField[] = [
  { name: 'pitch', type: 'number', required: true, step: '1' },
  { name: 'accidental', type: 'number', step: '1' },
  { name: 'at', type: 'number', required: true, min: '0', step: '1' },
  { name: 'duration', type: 'number', required: true, min: '1', step: '1' },
  { name: 'gate', type: 'number', min: '0.01', step: '0.01' },
  { name: 'velocity', type: 'number', min: '1', max: '127', step: '1' },
  { name: 'velocityOffset', type: 'number', step: '1' },
  { name: 'velocityScale', type: 'number', min: '0', step: '0.01' },
  { name: 'legato', type: 'checkbox' },
  { name: 'tie', type: 'checkbox' },
];
/** Motif property controls that participate in dirty-state and edit-message handling. */
const PROPERTY_INPUT_IDS = [
  'name-edit',
  'description-edit',
  'pitch-mode-edit',
  'default-gate-edit',
  'meter-numerator-edit',
  'meter-denominator-edit',
  'curve-input-min',
  'curve-input-max',
  'curve-output-min',
  'curve-output-max',
  'curve-exponent',
] as const;

/**
 * Resolve a required DOM element and retain its concrete type.
 * @param {string} id Element id from the static Library template.
 * @returns {T} Required DOM element.
 */
function $<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Library element is missing: ${id}`);
  return value as T;
}

const nativeMax = window.max;
/** Whether the page is running inside Max's jweb bridge instead of a normal browser. */
const isMax = nativeMax !== undefined && typeof nativeMax.outlet === 'function';
const browserInlets = new Map<string, (...values: unknown[]) => void>();
const maxBridge: MaxBridge = isMax
  ? nativeMax
  : {
      outlet: (...args: unknown[]) => console.log('→ Max:', ...args),
      bindInlet: (name, handler) => browserInlets.set(name, handler),
    };
window.max = maxBridge;
if (!isMax) window.__motifBrowserInlets = browserInlets;

const store = createStore<LibraryPageState>({
  server: null,
  modal: null,
  formDirty: false,
  activePanel: 'properties',
  collapsedFolders: new Set<string>(),
});
const debugEntries: string[] = [];
let stateDeadline: ReturnType<typeof setTimeout> | null = null;
let payloadErrorSignature = '';
let pendingStateTransfer: PendingStateTransfer | null = null;
let latestStateTransferId = 0;
const debugIndicator = $<HTMLSpanElement>('debug-indicator');
const debugSummary = $<HTMLSpanElement>('debug-summary');
const debugPanel = $<HTMLDivElement>('debug-panel');

/**
 * Record a local diagnostic and mirror it to Max when embedded.
 * @param {DebugLevel} level Diagnostic severity.
 * @param {string} message Diagnostic text.
 */
function debug(level: DebugLevel, message: string): void {
  const line = `${new Date().toLocaleTimeString()} [${level}] ${message}`;
  debugEntries.push(line);
  if (debugEntries.length > 80) debugEntries.shift();
  debugSummary.textContent = message;
  debugIndicator.className = level === 'error' ? 'error' : level === 'ok' ? 'ok' : '';
  debugPanel.classList.toggle('has-error', debugEntries.some((entry) => entry.includes('[error]')));
  debugPanel.textContent = debugEntries.join('\n');
  if (isMax) maxBridge.outlet('web_debug', PAGE, level, encodeURIComponent(message));
}

window.addEventListener('error', (event) => {
  debug('error', `${event.message} @ ${event.filename}:${event.lineno}`);
});
window.addEventListener('unhandledrejection', (event) => {
  debug('error', `Unhandled promise: ${errorText(event.reason)}`);
});
$<HTMLButtonElement>('debug-toggle').addEventListener('click', () => {
  debugPanel.classList.toggle('open');
});

/**
 * Send one typed Library action through the jweb bridge.
 * @param {LibraryAction} action Device action.
 */
function send(action: LibraryAction): void {
  try {
    maxBridge.outlet('lib_action', encodeURIComponent(JSON.stringify(action)));
    debug('info', `Action: ${action.type}`);
  } catch (reason) {
    debug('error', `Action failed: ${errorText(reason)}`);
  }
}

/**
 * Include both browser-local form changes and device edit mutations.
 * @returns {boolean} Whether discarding requires confirmation.
 */
function hasUnsavedChanges(): boolean {
  const current = store.getState();
  return Boolean(current.formDirty || current.server?.editing.dirty);
}

/**
 * Display a modal.
 * @param {ModalState} options Modal content and optional callback.
 */
function openModal(options: ModalState): void {
  store.setState({ modal: options });
}

/** Close the active modal. */
function closeModal(): void {
  store.setState({ modal: null });
}

/**
 * Run an action immediately or after the user confirms discarding edits.
 * @param {() => void} onConfirm Confirmed action.
 * @param {string} message Confirmation detail.
 */
function confirmDiscard(
  onConfirm: () => void,
  message = 'Discard the unsaved changes to this motif?',
): void {
  if (!hasUnsavedChanges()) {
    onConfirm();
    return;
  }
  openModal({
    title: 'Discard unsaved changes?',
    message,
    confirmLabel: 'Discard',
    onConfirm,
  });
}

/**
 * Render the current modal.
 * @param {ModalState | null} modal Modal state.
 */
function renderModal(modal: ModalState | null): void {
  const backdrop = $<HTMLDivElement>('modal-backdrop');
  if (!modal) {
    backdrop.classList.add('hidden');
    return;
  }
  backdrop.classList.remove('hidden');
  $<HTMLDivElement>('modal-title').textContent = modal.title;
  $<HTMLDivElement>('modal-message').textContent = modal.message;
  $<HTMLButtonElement>('modal-confirm').textContent = modal.confirmLabel ?? 'Continue';
  $<HTMLButtonElement>('modal-cancel').classList.toggle('hidden', Boolean(modal.dismissOnly));
}

/**
 * Render grouped Library browser items.
 * @param {LibraryServerState | null} server Current device state.
 */
function renderBrowser(server: LibraryServerState | null): void {
  const list = $<HTMLDivElement>('browser-list');
  list.innerHTML = '';
  if (!server || server.items.length === 0) {
    const empty = document.createElement('div');
    empty.id = 'empty-list';
    empty.textContent = server?.query ? 'No matching motifs' : 'No motifs found';
    list.append(empty);
    return;
  }

  let currentFolder: string | null = null;
  let folderCollapsed = false;
  const collapsedFolders = store.getState().collapsedFolders;
  for (const item of server.items) {
    const folder = item.folder || 'Library';
    if (folder !== currentFolder) {
      currentFolder = folder;
      folderCollapsed = isFolderCollapsed(folder, server.query, collapsedFolders);
      const heading = document.createElement('button');
      heading.type = 'button';
      heading.className = 'browser-folder';
      heading.textContent = `${folderCollapsed ? '▸' : '▾'} ${folder}`;
      heading.setAttribute('aria-expanded', String(!folderCollapsed));
      heading.title = `${folderCollapsed ? 'Expand' : 'Collapse'} ${folder}`;
      heading.addEventListener('click', () => {
        store.setState({
          collapsedFolders: toggleCollapsedFolder(
            folder,
            store.getState().collapsedFolders,
          ),
        });
      });
      list.append(heading);
    }
    if (folderCollapsed) continue;

    const row = document.createElement('div');
    row.className = `browser-item${server.selected?.id === item.id ? ' selected' : ''}`;
    const name = document.createElement('div');
    name.className = 'browser-name';
    name.textContent = item.name;
    row.append(name);
    if (item.hotkeys.length > 0) {
      const badge = document.createElement('div');
      badge.className = 'hotkey-badge';
      badge.textContent = item.hotkeys
        .map((mapping) => `${mapping.label} ${mapping.action === 'select' ? '↦' : '▶'}`)
        .join(' ');
      row.append(badge);
    }
    if (item.showId) {
      const id = document.createElement('div');
      id.className = 'browser-id';
      id.textContent = item.id;
      row.append(id);
    }
    row.title = item.showId ? `${item.name}\nID: ${item.id}` : item.name;
    row.addEventListener('click', () => {
      if (server.selected?.id === item.id) return;
      confirmDiscard(() => send({
        type: 'select_browser',
        id: item.id,
        discardChanges: true,
      }));
    });
    list.append(row);
  }
}

/**
 * Render the device-formatted hot-key assignments.
 * @param {LibrarySelectedMotifData | null} selected Selected motif.
 */
function renderHotkeys(selected: LibrarySelectedMotifData | null): void {
  const input = $<HTMLInputElement>('hotkey-input');
  const action = $<HTMLSelectElement>('hotkey-action');
  const assign = $<HTMLButtonElement>('assign-hotkey-btn');
  const list = $<HTMLDivElement>('hotkey-list');
  const mappings = selected?.hotkeys ?? [];
  input.disabled = !selected;
  action.disabled = !selected;
  assign.disabled = !selected;
  list.innerHTML = '';
  if (!selected) return;
  if (mappings.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'help';
    empty.textContent = 'None';
    list.append(empty);
    return;
  }

  for (const mapping of mappings) {
    const chip = document.createElement('button');
    chip.className = 'hotkey-chip';
    const actionLabel = mapping.action === 'select' ? 'Select' : 'Trigger';
    chip.title = `Remove ${mapping.label} · ${actionLabel}`;
    chip.textContent = `${mapping.label} · ${actionLabel}  ×`;
    chip.addEventListener('click', () => {
      send({ type: 'unmap_trigger', pitch: mapping.pitch });
    });
    list.append(chip);
  }
}

/**
 * Render every editable note row.
 * @param {LibraryServerState | null} server Current device state.
 * @param {boolean} editing Whether note inputs are editable.
 */
function renderNoteRows(server: LibraryServerState | null, editing: boolean): void {
  const notes = server?.selected?.notes ?? [];
  const container = $<HTMLDivElement>('note-rows');
  container.innerHTML = '';
  notes.forEach((note, index) => {
    const row = document.createElement('div');
    row.className = 'note-row';
    const label = document.createElement('span');
    label.textContent = String(index + 1);
    row.append(label);

    for (const field of NOTE_FIELDS) {
      if (field.type === 'checkbox') {
        const cell = document.createElement('label');
        cell.className = 'check-cell';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = Boolean(note[field.name]);
        input.disabled = !editing;
        input.addEventListener('change', () => {
          send({
            type: 'edit_note_at',
            index,
            field: field.name,
            value: input.checked,
          });
        });
        cell.append(input);
        row.append(cell);
        continue;
      }

      const input = document.createElement('input');
      input.type = 'number';
      const fieldValue = note[field.name];
      input.value = fieldValue == null ? '' : String(fieldValue);
      input.disabled = !editing;
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step !== undefined) input.step = field.step;
      input.addEventListener('change', () => {
        const value = input.value === '' ? null : Number(input.value);
        if (value !== null && !Number.isFinite(value)) return;
        send({ type: 'edit_note_at', index, field: field.name, value });
      });
      row.append(input);
    }

    const remove = document.createElement('button');
    remove.className = 'remove-btn';
    remove.textContent = '✕';
    remove.title = 'Remove note';
    remove.disabled = !server?.selected?.canRemoveNote;
    remove.addEventListener('click', () => send({ type: 'remove_note', index }));
    row.append(remove);
    container.append(row);
  });
}

/**
 * Update one input unless the user is actively editing it.
 * @param {string} id Input id.
 * @param {unknown} value New value.
 * @param {boolean} editing Whether the form is editable.
 */
function setValue(id: string, value: unknown, editing: boolean): void {
  const input = $<ValueControl>(id);
  if (document.activeElement === input && editing) {
    return;
  }
  if (typeof value === 'string') {
    input.value = value;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    input.value = String(value);
  } else {
    input.value = '';
  }
}

/**
 * Apply read-only state to every motif property control.
 * @param {boolean} editing Whether controls are editable.
 */
function setEditable(editing: boolean): void {
  for (const id of PROPERTY_INPUT_IDS) {
    const input = $<ValueControl>(id);
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      if (id === 'name-edit' || id === 'description-edit') {
        input.readOnly = !editing;
        continue;
      }
    }
    input.disabled = !editing;
  }
}

/**
 * Render motif identity and property controls.
 * @param {LibrarySelectedMotifData | null} selected Selected motif.
 * @param {boolean} editing Whether properties are editable.
 */
function renderProperties(selected: LibrarySelectedMotifData | null, editing: boolean): void {
  const curve = selected?.velocityCurve;
  setValue('id-display', selected?.id ?? '', false);
  setValue('schema-display', selected ? `v${selected.schemaVersion}` : '', false);
  setValue('length-display', selected ? `${selected.length} ticks` : '', false);
  setValue('pitch-mode-edit', selected?.pitchMode ?? 'scale', editing);
  setValue('default-gate-edit', selected?.defaultGate, editing);
  setValue('meter-numerator-edit', selected?.sourceMeter.numerator ?? '', editing);
  setValue('meter-denominator-edit', selected?.sourceMeter.denominator ?? 4, editing);
  setValue('curve-input-min', curve?.inputMin, editing);
  setValue('curve-input-max', curve?.inputMax, editing);
  setValue('curve-output-min', curve?.outputMin, editing);
  setValue('curve-output-max', curve?.outputMax, editing);
  setValue('curve-exponent', curve?.exponent, editing);
}

/**
 * Render the selected motif detail surface.
 * @param {LibraryServerState | null} server Current device state.
 * @param {LibraryPageState} local Browser-local state.
 */
function renderDetail(server: LibraryServerState | null, local: LibraryPageState): void {
  const selected = server?.selected ?? null;
  const editing = Boolean(server?.actions.editing);
  const edit = $<HTMLButtonElement>('edit-btn');
  const cancel = $<HTMLButtonElement>('cancel-edit-btn');
  const save = $<HTMLButtonElement>('save-motif-btn');
  const add = $<HTMLButtonElement>('add-note-btn');
  $<HTMLButtonElement>('import-clip-btn').disabled = !server?.actions.canImportClip;

  if (!selected || !server) {
    setValue('name-edit', '', false);
    setValue('description-edit', '', false);
    setEditable(false);
    renderProperties(null, false);
    $<HTMLDivElement>('stats-line').textContent = '–';
    $<HTMLDivElement>('edit-state').textContent = '';
    edit.disabled = true;
    cancel.classList.add('hidden');
    save.disabled = true;
    add.disabled = true;
    renderNoteRows(server, false);
    renderHotkeys(null);
    return;
  }

  setValue('name-edit', selected.name, editing);
  setValue('description-edit', selected.description, editing);
  setEditable(editing);
  renderProperties(selected, editing);
  $<HTMLDivElement>('stats-line').textContent = selected.stats;
  $<HTMLDivElement>('edit-state').textContent = editing
    ? `${server.editing.dirty || local.formDirty ? 'Unsaved changes' : 'Editing'} · ${selected.id}`
    : selected.isBuiltin
      ? 'Built-in · Edit creates a user copy'
      : `${selected.isPersisted ? 'Saved' : 'Not yet saved'} · ${selected.id}`;
  edit.classList.toggle('hidden', editing);
  edit.disabled = !server.actions.canEdit;
  cancel.classList.toggle('hidden', !editing);
  cancel.disabled = false;
  save.disabled = !server.actions.canSave;
  save.title = server.libraryLoaded
    ? 'Save changes and exit editing'
    : 'Choose a valid library folder before saving';
  add.disabled = !selected.canAddNote;
  renderNoteRows(server, editing);
  renderHotkeys(selected);
}

/**
 * Display the active properties or notes panel.
 * @param {PanelName} activePanel Panel selected by the user.
 */
function renderPanels(activePanel: PanelName): void {
  $<HTMLDivElement>('properties-panel').classList.toggle(
    'hidden',
    activePanel !== 'properties',
  );
  $<HTMLDivElement>('notes-panel').classList.toggle(
    'hidden',
    activePanel !== 'notes',
  );
  document.querySelectorAll<HTMLButtonElement>('.panel-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset['panel'] === activePanel);
  });
}

/**
 * Render all browser state.
 * @param {LibraryPageState} state Current page state.
 */
function render(state: LibraryPageState): void {
  const { server } = state;
  renderBrowser(server);
  renderDetail(server, state);
  renderModal(state.modal);
  renderPanels(state.activePanel);
  const search = $<HTMLInputElement>('search');
  if (server && document.activeElement !== search) search.value = server.query;
  const libraryPath = $<HTMLDivElement>('library-path');
  libraryPath.textContent = server?.libraryPath
    ? `${server.libraryScanning ? 'Scanning · ' : server.libraryLoaded ? '' : 'Unavailable · '}${server.libraryPath}`
    : 'Built-ins only';
  libraryPath.title = server?.libraryPath || 'No user library selected';
  const refresh = $<HTMLButtonElement>('refresh-btn');
  refresh.disabled = !server?.actions.canRefreshLibrary;
  refresh.textContent = server?.libraryScanning ? 'Scanning...' : 'Refresh';
}

/**
 * Serialize the complete property form for device-side validation.
 * @returns {Record<string, unknown>} Submitted motif properties.
 */
function readProperties(): Record<string, unknown> {
  return {
    name: $<HTMLInputElement>('name-edit').value,
    description: $<HTMLTextAreaElement>('description-edit').value,
    pitchMode: $<HTMLSelectElement>('pitch-mode-edit').value,
    sourceMeter: {
      numerator: Number($<HTMLInputElement>('meter-numerator-edit').value),
      denominator: Number($<HTMLSelectElement>('meter-denominator-edit').value),
    },
    defaultGate: optionalNumberValue($<HTMLInputElement>('default-gate-edit').value),
    velocityCurve: {
      inputMin: optionalNumberValue($<HTMLInputElement>('curve-input-min').value),
      inputMax: optionalNumberValue($<HTMLInputElement>('curve-input-max').value),
      outputMin: optionalNumberValue($<HTMLInputElement>('curve-output-min').value),
      outputMax: optionalNumberValue($<HTMLInputElement>('curve-output-max').value),
      exponent: optionalNumberValue($<HTMLInputElement>('curve-exponent').value),
    },
  };
}

/** Submit property changes when an edit session is active. */
function pushProperties(): void {
  if (!store.getState().server?.actions.editing) return;
  send({ type: 'edit_motif', properties: readProperties() });
}

/**
 * Commit a complete authoritative device state to the local renderer.
 * @param {LibraryServerState} server Decoded device state.
 */
function applyServerState(server: LibraryServerState): void {
  const previous = store.getState();
  const selectedChanged = previous.server?.selected?.id !== server.selected?.id;
  const editingEnded = Boolean(previous.server?.editing.active && !server.editing.active);
  store.setState({
    ...previous,
    server,
    formDirty: selectedChanged || editingEnded ? false : previous.formDirty,
  });
  if (server.alert?.id && server.alert.id !== previous.server?.alert?.id) {
    openModal({
      title: server.alert.title,
      message: server.alert.message,
      confirmLabel: 'OK',
      dismissOnly: true,
    });
  }
  payloadErrorSignature = '';
  if (stateDeadline !== null) {
    clearTimeout(stateDeadline);
    stateDeadline = null;
  }
  debug(
    'ok',
    `State: ${server.items.length} motifs${server.libraryPath ? ` · ${server.libraryPath}` : ''}`,
  );
}

/**
 * Assemble one bounded state fragment and apply the completed state.
 * @param {LibraryStateChunk} payload State fragment.
 */
function receiveStateChunk(payload: LibraryStateChunk): void {
  const transferId = Number(payload.transferId);
  const index = Number(payload.index);
  const total = Number(payload.total);
  if (
    !Number.isInteger(transferId)
    || transferId < latestStateTransferId
    || !Number.isInteger(index)
    || !Number.isInteger(total)
    || index < 0
    || index >= total
    || total < 1
    || total > MAX_LIBRARY_STATE_CHUNKS
    || typeof payload.data !== 'string'
  ) return;

  if (!pendingStateTransfer || pendingStateTransfer.id !== transferId) {
    if (pendingStateTransfer && transferId < pendingStateTransfer.id) return;
    pendingStateTransfer = {
      id: transferId,
      total,
      parts: new Array<string>(total),
      received: new Set<number>(),
    };
  }

  if (pendingStateTransfer.total !== total) return;
  pendingStateTransfer.parts[index] = payload.data;
  pendingStateTransfer.received.add(index);
  if (pendingStateTransfer.received.size !== total) return;

  const encodedState = pendingStateTransfer.parts.join('');
  latestStateTransferId = transferId;
  pendingStateTransfer = null;
  applyServerState(
    JSON.parse(decodeURIComponent(encodedState)) as LibraryServerState,
  );
}

/**
 * Decode direct or chunked state messages received from Max.
 * @param {unknown[]} values jweb inlet atoms.
 */
function receiveData(...values: unknown[]): void {
  const encoded = values[values.length - 1];
  try {
    const payload = JSON.parse(decodeURIComponent(String(encoded))) as unknown;
    if (isLibraryStateChunk(payload)) {
      receiveStateChunk(payload);
      payloadErrorSignature = '';
      return;
    }
    pendingStateTransfer = null;
    applyServerState(payload as LibraryServerState);
  } catch (reason) {
    const detail = errorText(reason);
    if (detail === payloadErrorSignature) return;
    payloadErrorSignature = detail;
    debug('error', `Library data could not be displayed: ${detail}`);
  }
}

store.subscribe(render);
render(store.getState());

document.querySelectorAll<HTMLButtonElement>('.panel-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const panel = tab.dataset['panel'];
    if (panel === 'properties' || panel === 'notes') {
      store.setState({ activePanel: panel });
    }
  });
});
const searchInput = $<HTMLInputElement>('search');
searchInput.addEventListener('input', () => {
  send({ type: 'filter_motifs', query: searchInput.value });
});
$<HTMLButtonElement>('clear-search').addEventListener('click', () => {
  send({ type: 'filter_motifs', query: '' });
});
$<HTMLButtonElement>('choose-btn').addEventListener('click', () => {
  confirmDiscard(() => {
    if (store.getState().server?.editing.active) send({ type: 'cancel_edit' });
    maxBridge.outlet('choose_library');
  }, 'Discard the current edits and choose another library folder?');
});
$<HTMLButtonElement>('refresh-btn').addEventListener('click', () => {
  confirmDiscard(
    () => send({ type: 'refresh_library', discardChanges: true }),
    'Discard the current edits and reload the library folder?',
  );
});
$<HTMLButtonElement>('edit-btn').addEventListener('click', () => {
  send({ type: 'begin_edit' });
});
$<HTMLButtonElement>('cancel-edit-btn').addEventListener('click', () => {
  confirmDiscard(() => send({ type: 'cancel_edit' }));
});
$<HTMLButtonElement>('import-clip-btn').addEventListener('click', () => {
  confirmDiscard(
    () => send({
      type: 'import_clip',
      pitchMode: $<HTMLSelectElement>('import-mode').value,
    }),
    'Discard the current edits and import the selected Live clip?',
  );
});
$<HTMLButtonElement>('save-motif-btn').addEventListener('click', () => {
  send({ type: 'save_motif', properties: readProperties() });
});
$<HTMLButtonElement>('add-note-btn').addEventListener('click', () => {
  send({ type: 'add_note' });
});
$<HTMLButtonElement>('assign-hotkey-btn').addEventListener('click', () => {
  const selected = store.getState().server?.selected;
  if (!selected) return;
  send({
    type: 'map_trigger',
    pitch: $<HTMLInputElement>('hotkey-input').value,
    motifId: selected.id,
    action: $<HTMLSelectElement>('hotkey-action').value,
  });
});
$<HTMLInputElement>('hotkey-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    $<HTMLButtonElement>('assign-hotkey-btn').click();
  }
});

/** Attach event listeners to property input elements. */
for (const id of PROPERTY_INPUT_IDS) {
  const input = $<ValueControl>(id);
  input.addEventListener('input', () => store.setState({ formDirty: true }));
  input.addEventListener('change', pushProperties);
  if (input.tagName === 'TEXTAREA' || input instanceof HTMLInputElement && input.type === 'text') {
    input.addEventListener('blur', pushProperties);
  }
}

$<HTMLButtonElement>('modal-cancel').addEventListener('click', closeModal);
$<HTMLDivElement>('modal-backdrop').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
});
$<HTMLButtonElement>('modal-confirm').addEventListener('click', () => {
  const modal = store.getState().modal;
  closeModal();
  modal?.onConfirm?.();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && store.getState().modal) {
    closeModal();
  }
});

if (isMax) {
  if (typeof maxBridge.bindInlet !== 'function') {
    debug('error', 'Max jweb bridge is missing bindInlet');
  } else {
    maxBridge.bindInlet('receiveData', receiveData);
    debug('info', `Bridge ready; waiting for library state (${location.href})`);
    maxBridge.outlet('library_ready');
    stateDeadline = setTimeout(() => {
      if (!store.getState().server) {
        debug('error', 'No library state received within 2 seconds');
      }
    }, 2_000);
  }
} else {
  receiveData(encodeURIComponent(JSON.stringify({
    query: '',
    libraryPath: '/Users/example/Motifs',
    libraryLoaded: true,
    libraryScanning: false,
    scanProgress: null,
    editing: {
      active: false,
      dirty: false,
      created: false,
      sourceId: null,
      targetId: null,
    },
    actions: {
      editing: false,
      canEdit: true,
      canSave: false,
      canImportClip: true,
      canRefreshLibrary: true,
    },
    items: [
      {
        id: 'chromatic-turn',
        name: 'Chromatic Turn',
        showId: false,
        folder: 'Library',
        hotkeys: [],
      },
      {
        id: 'scale-turn',
        name: 'Scale Turn',
        showId: false,
        folder: 'Library',
        hotkeys: [],
      },
    ],
    selectedIndex: 0,
    selected: {
      schemaVersion: 1,
      id: 'chromatic-turn',
      name: 'Chromatic Turn',
      description: 'Fixed-interval phrase that ignores the selected scale.',
      pitchMode: 'chromatic',
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 3360,
      defaultGate: 0.82,
      velocityCurve: {
        inputMin: null,
        inputMax: null,
        outputMin: null,
        outputMax: null,
        exponent: null,
      },
      stats: '7 notes • 0.88 bars • 4/4 source • chromatic',
      isBuiltin: true,
      isPersisted: false,
      folder: 'Built-ins',
      hotkeys: [],
      noteCount: 2,
      noteLimit: 512,
      canAddNote: false,
      canRemoveNote: false,
      notes: [
        {
          pitch: 0,
          accidental: null,
          at: 0,
          duration: 480,
          gate: null,
          velocity: null,
          velocityOffset: null,
          velocityScale: null,
          legato: false,
          tie: false,
        },
        {
          pitch: 2,
          accidental: null,
          at: 480,
          duration: 480,
          gate: null,
          velocity: null,
          velocityOffset: null,
          velocityScale: null,
          legato: false,
          tie: false,
        },
      ],
    },
    alert: null,
  } satisfies LibraryServerState)));
}
