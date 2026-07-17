import { track, trigger } from './effect.js';

export function ref(initialValue) {
  return {
    _value: initialValue,
    get value() {
      track(this, 'value');
      return this._value;
    },
    set value(newValue) {
      if (newValue !== this._value) {
        this._value = newValue;
        trigger(this, 'value');
      }
    }
  };
}
