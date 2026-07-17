/**
 * Checkpoint 1 — Integration Test
 * Verifies that the compiled TypeScript core modules work correctly.
 */

import { ref } from './dist/packages/core/ref.js';
import { reactive } from './dist/packages/core/reactive.js';
import { computed } from './dist/packages/core/computed.js';
import { createEffect } from './dist/packages/core/effect.js';
import { watch, watchEffect } from './dist/packages/core/watch.js';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

console.log('\n🧪 Checkpoint 1: Core Reactivity Tests\n');

// --- ref ---
console.log('📦 ref');
const count = ref(0);
assert(count.value === 0, 'ref initial value is 0');
count.value = 5;
assert(count.value === 5, 'ref updated value is 5');

// --- reactive ---
console.log('📦 reactive');
const state = reactive({ x: 1, y: 2 });
assert(state.x === 1, 'reactive initial state.x is 1');
state.x = 10;
assert(state.x === 10, 'reactive updated state.x is 10');

// --- createEffect + tracking ---
console.log('📦 createEffect + dependency tracking');
const price = ref(100);
const quantity = ref(3);
let total = 0;
createEffect(() => {
  total = price.value * quantity.value;
});
assert(total === 300, 'effect computes initial total = 300');
price.value = 200;
assert(total === 600, 'effect recomputes after price change: total = 600');
quantity.value = 5;
assert(total === 1000, 'effect recomputes after quantity change: total = 1000');

// --- computed ---
console.log('📦 computed');
const a = ref(2);
const b = ref(3);
const sum = computed(() => a.value + b.value);
assert(sum.value === 5, 'computed initial sum = 5');
a.value = 10;
assert(sum.value === 13, 'computed reacts to a change: sum = 13');

// --- watch ---
console.log('📦 watch');
const watched = ref('hello');
let watchLog = '';
watch(watched, (newVal, oldVal) => {
  watchLog = `${oldVal} -> ${newVal}`;
});
watched.value = 'world';
assert(watchLog === 'hello -> world', 'watch callback fires on change');

// --- watchEffect ---
console.log('📦 watchEffect');
const signal = ref(0);
let effectLog = 0;
watchEffect(() => {
  effectLog = signal.value * 2;
});
assert(effectLog === 0, 'watchEffect runs immediately');
signal.value = 7;
assert(effectLog === 14, 'watchEffect re-runs on dep change');

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(40)}\n`);

if (failed > 0) process.exit(1);
