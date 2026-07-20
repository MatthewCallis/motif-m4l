import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
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

describe('RuntimeScheduler', () => {
  it('does not emit overlapping duplicate note-ons or premature note-offs', () => {
    const scheduler = new RuntimeScheduler();
    const first = scheduler.add([event(1, 100, 0), event(1, 0, 960)], 0, 'ticks');
    assert.deepEqual(first.map(({ velocity, delay }) => [velocity, delay]), [[100, 0], [0, 960]]);

    // The first note is now active. A second instance of the same pitch should not
    // retrigger it, and the first instance's note-off should not silence instance 2.
    const second = scheduler.add([event(2, 100, 0), event(2, 0, 960)], 10, 'ticks');
    assert.deepEqual(second.map(({ velocity, delay }) => [velocity, delay]), [[0, 960]]);
  });

  it('cancels multiple instances in one queue rebuild', () => {
    const scheduler = new RuntimeScheduler();
    scheduler.add([event(1, 100, 0), event(1, 0, 960)], 0, 'ticks');
    scheduler.add([event(2, 100, 0), event(2, 0, 1920)], 10, 'ticks');
    const output = scheduler.cancelInstances([1, 2], 20, 'ticks');
    assert.deepEqual(output.filter(({ velocity }) => velocity === 0).map(({ pitch }) => pitch), [60]);
  });

  it('tracks units, applies due events, and resets active notes', () => {
    const scheduler = new RuntimeScheduler();
    assert.equal(scheduler.unit, undefined);

    scheduler.add([event(7, 100, 0), event(7, 0, 960)], 100, 'ms');
    assert.equal(scheduler.unit, 'ms');
    scheduler.advance(100, 'ms');

    assert.deepEqual(scheduler.reset(), [{
      pitch: 60,
      velocity: 0,
      channel: 1,
      delay: 0,
      unit: 'ms',
      instanceId: -1,
    }]);
    assert.equal(scheduler.unit, undefined);
    assert.deepEqual(scheduler.reset(), []);
  });

  it('resets on unit changes and backward time jumps', () => {
    const scheduler = new RuntimeScheduler();
    scheduler.add([event(1, 100, 0), event(1, 0, 960)], 100, 'ticks');
    scheduler.advance(100, 'ticks');
    scheduler.advance(100, 'ms');
    assert.equal(scheduler.unit, 'ms');

    scheduler.add([event(2, 100, 0), event(2, 0, 960)], 200, 'ms');
    scheduler.advance(200, 'ms');
    scheduler.advance(100, 'ms');
    assert.equal(scheduler.unit, 'ms');
  });

  it('cancels one active instance and ignores missing or inactive holds', () => {
    const scheduler = new RuntimeScheduler();
    scheduler.add([event(3, 100, 0), event(3, 0, 960)], 0, 'ticks');
    scheduler.advance(0, 'ticks');
    const cancelled = scheduler.cancelInstance(3, 10, 'ticks');
    assert.deepEqual(cancelled.map(({ velocity, instanceId }) => [velocity, instanceId]), [[0, 3]]);
    assert.deepEqual(scheduler.cancelInstance(999, 10, 'ticks'), []);

    scheduler.add([event(4, 0, 0)], 20, 'ticks');
    scheduler.advance(20, 'ticks');
    assert.deepEqual(scheduler.cancelInstance(4, 20, 'ticks'), []);
  });
});
