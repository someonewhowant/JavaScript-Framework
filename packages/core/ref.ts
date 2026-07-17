import { track, trigger } from './effect.js';
import type { Ref } from '../shared/types.js';

export function ref<T>(initialValue: T): Ref<T> {
  return {
    _value: initialValue,
    get value(): T {
      track(this, 'value');
      return this._value;
    },
    set value(newValue: T) {
      if (newValue !== this._value) {
        this._value = newValue;
        trigger(this, 'value');
      }
    }
  };
}
