/**
 * In-process MIDI event scheduler for overlap-safe note-on/off bookkeeping.
 *
 * Used by unit tests and pure-engine reasoning.
 * The Live device does **not** import this class,
 * it schedules note events through Max `pipe` using
 * `emit('event', pitch, velocity, channel, delayMs)` from `device.ts`.
 *
 * The model tracks per-instance active notes so a cancelled or replaced
 * trigger only releases pitches that no other instance still holds.
 *
 * @see https://docs.cycling74.com/reference/pipe
 */

import type { ScheduleUnit, ScheduledMidiEvent } from './types.js';

/**
 * Relative MIDI event returned after queue rebuild (delay from `now`).
 * @property {number} pitch The pitch of the MIDI note.
 * @property {number} velocity The velocity of the MIDI note.
 * @property {number} channel The channel of the MIDI note.
 * @property {number} delay The delay from `now` in the schedule unit.
 * @property {ScheduleUnit} unit The schedule unit.
 * @property {number} instanceId The instance ID.
 */
export interface RuntimeMidiEvent {
  pitch: number;
  velocity: number;
  channel: number;
  delay: number;
  unit: ScheduleUnit;
  instanceId: number;
}

interface QueuedEvent extends ScheduledMidiEvent {
  due: number;
  unit: ScheduleUnit;
}

interface NoteKeyParts {
  pitch: number;
  channel: number;
}

function noteKey(pitch: number, channel: number): string {
  return `${channel}:${pitch}`;
}

function parseNoteKey(key: string): NoteKeyParts {
  const [channel = '1', pitch = '0'] = key.split(':');
  return { channel: Number(channel), pitch: Number(pitch) };
}

/**
 * Absolute-time event queue with reference-counted note holds.
 * Callers rebuild a relative delay list after every `add` / cancel so consumers
 * can flush and reschedule (mirrors how Max `pipe` lists are replaced).
 */
export class RuntimeScheduler {
  #queue: QueuedEvent[] = [];
  #activeByInstance = new Map<number, Map<string, number>>();
  #activeTotals = new Map<string, number>();
  #unit: ScheduleUnit | undefined;
  #lastNow = 0;

  /**
   * Read the active schedule unit.
   * @returns {ScheduleUnit | undefined} The active unit, or undefined before the first event.
   */
  get unit(): ScheduleUnit | undefined {
    return this.#unit;
  }

  /**
   * Clear the queue and release every still-held pitch.
   * @returns {RuntimeMidiEvent[]} Immediate note-off events for held pitches.
   */
  reset(): RuntimeMidiEvent[] {
    const releases = [...this.#activeTotals.entries()]
      .filter(([, count]) => count > 0)
      .map(([key]) => {
        const { pitch, channel } = parseNoteKey(key);
        return { pitch, velocity: 0, channel, delay: 0, unit: 'ms' as const, instanceId: -1 };
      });

    this.#queue = [];
    this.#activeByInstance.clear();
    this.#activeTotals.clear();
    this.#unit = undefined;
    this.#lastNow = 0;
    return releases;
  }

  /**
   * Apply due events at `now`. Resets if the unit changes or time jumps backward.
   * @param {number} now The current absolute scheduler time.
   * @param {ScheduleUnit} unit The unit used by `now` and queued events.
   * @returns {void}
   */
  advance(now: number, unit: ScheduleUnit): void {
    if (this.#unit !== undefined && this.#unit !== unit) {
      this.reset();
      this.#unit = unit;
      this.#lastNow = now;
      return;
    }

    if (this.#unit === unit && now + 1 < this.#lastNow) {
      this.reset();
    }

    this.#unit = unit;
    this.#lastNow = now;

    const remaining: QueuedEvent[] = [];
    for (const event of this.#queue) {
      if (event.due <= now + 0.5) {
        this.#apply(event);
      } else {
        remaining.push(event);
      }
    }
    this.#queue = remaining;
  }

  /**
   * Enqueue compiled events and return a full relative schedule from `now`,
   * with duplicate note-offs collapsed via active-note reference counts.
   * @param {readonly ScheduledMidiEvent[]} events The compiled events to enqueue.
   * @param {number} now The current absolute scheduler time.
   * @param {ScheduleUnit} unit The unit used by the schedule.
   * @returns {RuntimeMidiEvent[]} The rebuilt schedule relative to `now`.
   */
  add(
    events: readonly ScheduledMidiEvent[],
    now: number,
    unit: ScheduleUnit,
  ): RuntimeMidiEvent[] {
    this.advance(now, unit);
    for (const event of events) {
      const offset = unit === 'ticks' ? event.offsetTicks : event.offsetMs;
      this.#queue.push({ ...event, due: now + offset, unit });
    }
    this.#queue.sort((left, right) => left.due - right.due || left.velocity - right.velocity);
    return this.#rebuild(now, unit);
  }

  /**
   * Cancel one trigger instance.
   * @param {number} instanceId The trigger instance to cancel.
   * @param {number} now The current absolute scheduler time.
   * @param {ScheduleUnit} unit The unit used by the schedule.
   * @returns {RuntimeMidiEvent[]} Immediate releases followed by the rebuilt schedule.
   */
  cancelInstance(instanceId: number, now: number, unit: ScheduleUnit): RuntimeMidiEvent[] {
    return this.cancelInstances([instanceId], now, unit);
  }

  /**
   * Drop pending events for the given instances and release pitches no longer
   * held by any remaining instance.
   * @param {readonly number[]} instanceIds The trigger instances to cancel.
   * @param {number} now The current absolute scheduler time.
   * @param {ScheduleUnit} unit The unit used by the schedule.
   * @returns {RuntimeMidiEvent[]} Immediate releases followed by the rebuilt schedule.
   */
  cancelInstances(
    instanceIds: readonly number[],
    now: number,
    unit: ScheduleUnit,
  ): RuntimeMidiEvent[] {
    this.advance(now, unit);
    const ids = new Set(instanceIds);
    this.#queue = this.#queue.filter((event) => !ids.has(event.instanceId));

    const releases: RuntimeMidiEvent[] = [];
    for (const instanceId of ids) {
      const instanceNotes = this.#activeByInstance.get(instanceId);
      if (!instanceNotes) {
        continue;
      }

      for (const [key, count] of instanceNotes.entries()) {
        if (count <= 0) {
          continue;
        }
        const total = Math.max(0, (this.#activeTotals.get(key) ?? 0) - count);
        this.#activeTotals.set(key, total);
        if (total === 0) {
          const { pitch, channel } = parseNoteKey(key);
          releases.push({ pitch, velocity: 0, channel, delay: 0, unit: 'ms', instanceId });
        }
      }
      this.#activeByInstance.delete(instanceId);
    }

    return [...releases, ...this.#rebuild(now, unit)];
  }

  #apply(event: QueuedEvent): void {
    const key = noteKey(event.pitch, event.channel);
    const instance = this.#activeByInstance.get(event.instanceId) ?? new Map<string, number>();
    const delta = event.velocity > 0 ? 1 : -1;
    const instanceCount = Math.max(0, (instance.get(key) ?? 0) + delta);
    const totalCount = Math.max(0, (this.#activeTotals.get(key) ?? 0) + delta);

    instance.set(key, instanceCount);
    this.#activeByInstance.set(event.instanceId, instance);
    this.#activeTotals.set(key, totalCount);
  }

  #rebuild(now: number, unit: ScheduleUnit): RuntimeMidiEvent[] {
    const simulatedTotals = new Map(this.#activeTotals);
    const output: RuntimeMidiEvent[] = [];

    for (const event of this.#queue) {
      const key = noteKey(event.pitch, event.channel);
      const before = simulatedTotals.get(key) ?? 0;
      const after = Math.max(0, before + (event.velocity > 0 ? 1 : -1));
      simulatedTotals.set(key, after);

      if ((event.velocity > 0 && before === 0) || (event.velocity === 0 && after === 0 && before > 0)) {
        output.push({
          pitch: event.pitch,
          velocity: event.velocity,
          channel: event.channel,
          delay: Math.max(0, event.due - now),
          unit,
          instanceId: event.instanceId,
        });
      }
    }

    return output;
  }
}
