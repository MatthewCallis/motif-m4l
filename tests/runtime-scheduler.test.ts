import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeScheduler } from '../src/core/runtime-scheduler.js';
import type { ScheduledMidiEvent } from '../src/core/types.js';

function event(
  instanceId: number,
  velocity: number,
  offsetTicks: number,
): ScheduledMidiEvent {
  return {
    pitch: 60,
    velocity,
    channel: 1,
    offsetTicks,
    offsetMs: offsetTicks / 2,
    instanceId,
  };
}

test('does not emit overlapping duplicate note-ons or premature note-offs', () => {
  const scheduler = new RuntimeScheduler();
  const first = scheduler.add([event(1, 100, 0), event(1, 0, 960)], 0, 'ticks');
  assert.deepEqual(first.map(({ velocity, delay }) => [velocity, delay]), [[100, 0], [0, 960]]);

  // The first note is now active. A second instance of the same pitch should not
  // retrigger it, and the first instance's note-off should not silence instance 2.
  const second = scheduler.add([event(2, 100, 0), event(2, 0, 960)], 10, 'ticks');
  assert.deepEqual(second.map(({ velocity, delay }) => [velocity, delay]), [[0, 960]]);
});

test('cancels multiple instances in one queue rebuild', () => {
  const scheduler = new RuntimeScheduler();
  scheduler.add([event(1, 100, 0), event(1, 0, 960)], 0, 'ticks');
  scheduler.add([event(2, 100, 0), event(2, 0, 1920)], 10, 'ticks');
  const output = scheduler.cancelInstances([1, 2], 20, 'ticks');
  assert.deepEqual(output.filter(({ velocity }) => velocity === 0).map(({ pitch }) => pitch), [60]);
});
