import { ref } from './ref.js';
import { createEffect } from './effect.js';
import type { Ref } from '../shared/types.js';

/**
 * Creates a computed reactive reference.
 * The getter runs inside an effect, so any reactive dependencies
 * are automatically tracked and the value re-evaluated on change.
 */
export function computed<T>(getter: () => T): Readonly<Ref<T>> {
  // createEffect runs `fn` synchronously on first call,
  // so result.value is guaranteed to be T (not undefined) after this line.
  const result = ref<T>(undefined as T);
  createEffect(() => {
    result.value = getter();
  });
  return result;
}
