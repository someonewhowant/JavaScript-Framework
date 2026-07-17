import { createEffect } from './effect.js';
import type { Ref } from '../shared/types.js';

export function watchEffect(fn: (...args: any[]) => any): void {
  createEffect(fn);
}

export function watch<T>(
  source: Ref<T> | (() => T),
  cb: (newValue: T, oldValue: T | undefined) => void
): void {
  let oldValue: T | undefined;
  let isInit = true;

  createEffect(() => {
    const newValue: T = typeof source === 'function'
      ? source()
      : source.value;

    if (!isInit && newValue !== oldValue) {
      cb(newValue, oldValue);
    }
    oldValue = newValue;
    isInit = false;
  });
}
