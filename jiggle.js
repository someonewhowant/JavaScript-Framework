const depsMap = new Map()
let currentEffect = null
const effectsStack = []
let currentInstance = null;

function onMounted(fn) {
  if (currentInstance) currentInstance.hooks.mounted.push(fn);
}

function onUpdated(fn) {
  if (currentInstance) currentInstance.hooks.updated.push(fn);
}

function onUnmounted(fn) {
  if (currentInstance) currentInstance.hooks.unmounted.push(fn);
}

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

function patchProp(el, key, oldValue, newValue) {
  if (newValue === oldValue) return;

  if (key.startsWith('on')) {
    const eventName = key.slice(2).toLowerCase();
    if (oldValue) {
      el.removeEventListener(eventName, oldValue);
    }
    if (newValue) {
      el.addEventListener(eventName, newValue);
    }
  } else {
    if (newValue == null || newValue === false) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, newValue);
    }
  }
}

function patchProps(el, oldProps, newProps) {
  oldProps = oldProps || {};
  newProps = newProps || {};

  for (const key in newProps) {
    patchProp(el, key, oldProps[key], newProps[key]);
  }

  for (const key in oldProps) {
    if (!(key in newProps)) {
      patchProp(el, key, oldProps[key], null);
    }
  }
}

function patchChildren(el, oldChildren, newChildren) {
  oldChildren = oldChildren || [];
  newChildren = newChildren || [];

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
      unmount(oldChildren[i]);
    }
  }
}

function unmount(vnode) {
  if (vnode.component) {
    vnode.component.hooks.unmounted.forEach(cb => cb());
    unmount(vnode.component.subTree);
    return;
  }

  if (vnode.children && Array.isArray(vnode.children)) {
    vnode.children.forEach(child => unmount(child));
  }

  if (vnode.el && vnode.el.parentNode) {
    vnode.el.parentNode.removeChild(vnode.el);
  }
}

function mountComponent(vnode, container) {
  const instance = {
    vnode,
    props: reactive(vnode.props || {}),
    render: null,
    subTree: null,
    isMounted: false,
    el: null,
    hooks: { mounted: [], updated: [], unmounted: [] }
  };
  vnode.component = instance;

  currentInstance = instance;
  instance.render = vnode.tag(instance.props);
  currentInstance = null;

  createEffect(() => {
    if (!instance.isMounted) {
      const subTree = instance.render();
      instance.subTree = subTree;
      mount(subTree, container);
      vnode.el = subTree.el;
      instance.isMounted = true;
      instance.hooks.mounted.forEach(cb => cb());
    } else {
      const prevSubTree = instance.subTree;
      const nextSubTree = instance.render();
      instance.subTree = nextSubTree;
      patch(prevSubTree, nextSubTree);
      vnode.el = nextSubTree.el;
      instance.hooks.updated.forEach(cb => cb());
    }
  });
}

function mount(vnode, container) {
  if (typeof vnode.tag === 'function') {
    mountComponent(vnode, container);
    return;
  }

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
      patchProp(el, key, null, vnode.props[key]);
    }
  }

  if (vnode.children) {
    vnode.children.forEach(child => mount(child, el));
  }

  container.appendChild(el);
}

function patch(n1, n2) {
  if (n1 === n2) return;

  if (typeof n1.tag === 'function' && typeof n2.tag === 'function') {
    if (n1.tag !== n2.tag) {
      const parent = n1.el.parentNode;
      unmount(n1);
      mount(n2, parent);
      return;
    }

    const instance = (n2.component = n1.component);
    instance.vnode = n2;
    const newProps = n2.props || {};
    for (const key in newProps) {
      instance.props[key] = newProps[key];
    }
    for (const key in instance.props) {
      if (!(key in newProps)) {
        delete instance.props[key];
      }
    }
    return;
  }

  if (n1.tag !== n2.tag) {
    const parent = n1.el.parentNode;
    unmount(n1);
    mount(n2, parent);
    return;
  }

  const el = (n2.el = n1.el);

  if (n2.tag === null) {
    if (n1.children !== n2.children) {
      el.textContent = n2.children;
    }
    return;
  }

  patchProps(el, n1.props, n2.props);
  patchChildren(el, n1.children, n2.children);
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
    },
    deleteProperty(target, key) {
      const hasKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hasKey && result) {
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