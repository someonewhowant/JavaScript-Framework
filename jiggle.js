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

function h(tag, props, ...children) {
  const normalizedChildren = children.flat().map(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      return { tag: null, props: null, children: String(child) };
    }
    return child;
  });
  return { tag, props, children: normalizedChildren };
}

function mount(vnode, container) {
  if (vnode.tag === null) {
    const el = document.createTextNode(vnode.children);
    vnode.el = el;
    container.appendChild(el);
    return;
  }
  
  const el = document.createElement(vnode.tag);
  vnode.el = el;
  
  if (vnode.props) {
    for (const key in vnode.props) {
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), vnode.props[key]);
      } else {
        el.setAttribute(key, vnode.props[key]);
      }
    }
  }
  
  if (vnode.children) {
    vnode.children.forEach(child => mount(child, el));
  }
  
  container.appendChild(el);
}

function patch(n1, n2) {
  if (n1 === n2) return;
  
  if (n1.tag !== n2.tag) {
    const parent = n1.el.parentNode;
    mount(n2, parent);
    parent.removeChild(n1.el);
    return;
  }
  
  const el = (n2.el = n1.el);
  
  if (n2.tag === null) {
    if (n1.children !== n2.children) {
      el.textContent = n2.children;
    }
    return;
  }
  
  const oldProps = n1.props || {};
  const newProps = n2.props || {};
  
  for (const key in newProps) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (newValue !== oldValue) {
      if (key.startsWith('on')) {
         const eventName = key.slice(2).toLowerCase();
         if (oldValue) el.removeEventListener(eventName, oldValue);
         el.addEventListener(eventName, newValue);
      } else {
         el.setAttribute(key, newValue);
      }
    }
  }
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith('on')) {
         el.removeEventListener(key.slice(2).toLowerCase(), oldProps[key]);
      } else {
         el.removeAttribute(key);
      }
    }
  }
  
  const oldChildren = n1.children || [];
  const newChildren = n2.children || [];
  
  const commonLength = Math.min(oldChildren.length, newChildren.length);
  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i]);
  }
  if (newChildren.length > oldChildren.length) {
    for (let i = commonLength; i < newChildren.length; i++) {
      mount(newChildren[i], el);
    }
  } else if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= commonLength; i--) {
      el.removeChild(oldChildren[i].el);
    }
  }
}

function render(vnode, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  if (!container._vnode) {
    container.innerHTML = '';
    mount(vnode, container);
  } else {
    patch(container._vnode, vnode);
  }
  container._vnode = vnode;
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