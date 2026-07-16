const depsMap = new Map()
let currentEffect = null
const effectsStack = []

function createEffect(fn) {
  const effect = function effect(...args) {
    if (effectsStack.indexOf(effect) === -1) {
      try {
        currentEffect = effect
        effectsStack.push(effect)
        return fn(...args)
      } finally {
        effectsStack.pop()
        currentEffect = effectsStack[effectsStack.length - 1]
      }
    }
  }
  effect()
}

function render(element, content) {
  const app = document.querySelector(element)
  if (app !== null) {
    app.innerHTML = content
  }
}

function reactive(target) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      // Recursively make nested objects reactive
      return typeof result === 'object' && result !== null ? reactive(result) : result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    }
  });
}

function ref(initialValue) {
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

function computed(getter) {
  const result = ref();
  createEffect(() => {
    result.value = getter();
  });
  return result;
}

function watchEffect(fn) {
  createEffect(fn);
}

function watch(source, cb) {
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

  function track(target, key) {
    if (currentEffect) {
      let deps = depsMap.get(target)
      if (!deps) {
        deps = new Map()
        depsMap.set(target, deps)
      }
      let dep = deps.get(key)
      if (!dep) {
        dep = new Set()
        deps.set(key, dep)
      }
      dep.add(currentEffect)
    }
  }
  
  function trigger(target, key) {
   const deps = depsMap.get(target)
    if (!deps) return;
    const dep = deps.get(key)
    if (dep) {
      const effectsToRun = new Set(dep)
      effectsToRun.forEach(effect => {
        effect()
      })
    }
  }