import { createEffect } from './effect.js';

export function watchEffect(fn) {
  createEffect(fn);
}

export function watch(source, cb) {
  let oldValue;
  let isInit = true;
  createEffect(() => {
    let newValue;
    if (typeof source === 'function') {
      newValue = source();
    } else if (source && source._value !== undefined) {
      newValue = source.value;
    }

    if (!isInit && newValue !== oldValue) {
      cb(newValue, oldValue);
    }
    oldValue = newValue;
    isInit = false;
  });
}
