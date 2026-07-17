import { ref } from './ref.js';
import { createEffect } from './effect.js';

export function computed(getter) {
  const result = ref();
  createEffect(() => {
    result.value = getter();
  });
  return result;
}
