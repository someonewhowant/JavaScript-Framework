import { track, trigger } from './effect.js';

export function reactive<T extends object>(target: T): T {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  return new Proxy(target, {
    get(target: any, key: string | symbol, receiver: any) {
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      return typeof result === 'object' && result !== null ? reactive(result as object) : result;
    },
    set(target: any, key: string | symbol, value: any, receiver: any) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
    deleteProperty(target: any, key: string | symbol) {
      const hasKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hasKey && result) {
        trigger(target, key);
      }
      return result;
    }
  }) as T;
}
