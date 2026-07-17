import type { EffectFn } from '../shared/types.js';

/**
 * Global dependency map: target → key → Set<effects>.
 * Uses Map (not WeakMap) to match original behavior — ref objects
 * are plain literals whose identity must be preserved across effect runs.
 */
export const depsMap = new Map<object, Map<string | symbol, Set<EffectFn>>>();
export let currentEffect: EffectFn | null = null;
export const effectsStack: EffectFn[] = [];

export function track(target: object, key: string | symbol) {
  if (currentEffect) {
    let deps = depsMap.get(target);
    if (!deps) {
      deps = new Map();
      depsMap.set(target, deps);
    }
    let dep = deps.get(key);
    if (!dep) {
      dep = new Set();
      deps.set(key, dep);
    }
    dep.add(currentEffect);
  }
}

export function trigger(target: object, key: string | symbol) {
  const deps = depsMap.get(target);
  if (!deps) return;
  const dep = deps.get(key);
  if (dep) {
    const effectsToRun = new Set(dep);
    effectsToRun.forEach(effect => {
      effect();
    });
  }
}

export function createEffect(fn: (...args: any[]) => any) {
  const effect: EffectFn = function effect(...args: any[]) {
    if (effectsStack.indexOf(effect) === -1) {
      try {
        currentEffect = effect;
        effectsStack.push(effect);
        return fn(...args);
      } finally {
        effectsStack.pop();
        currentEffect = effectsStack.length > 0 ? effectsStack[effectsStack.length - 1] : null;
      }
    }
  };
  effect();
}
