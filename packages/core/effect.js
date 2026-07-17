export const depsMap = new Map();
export let currentEffect = null;
export const effectsStack = [];

export function track(target, key) {
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

export function trigger(target, key) {
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

export function createEffect(fn) {
  const effect = function effect(...args) {
    if (effectsStack.indexOf(effect) === -1) {
      try {
        currentEffect = effect;
        effectsStack.push(effect);
        return fn(...args);
      } finally {
        effectsStack.pop();
        currentEffect = effectsStack[effectsStack.length - 1];
      }
    }
  };
  effect();
}
