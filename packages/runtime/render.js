import { reactive } from '../core/reactive.js';
import { createEffect } from '../core/effect.js';
import { setCurrentInstance } from './lifecycle.js';

export function patchProp(el, key, oldValue, newValue) {
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

export function patchProps(el, oldProps, newProps) {
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

export function patchChildren(el, oldChildren, newChildren) {
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

export function unmount(vnode) {
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

export function mountComponent(vnode, container) {
  const initialProps = vnode.props || {};
  if (vnode.children && vnode.children.length > 0) {
    initialProps.children = vnode.children;
  }

  const instance = {
    vnode,
    props: reactive(initialProps),
    render: null,
    subTree: null,
    isMounted: false,
    el: null,
    hooks: { mounted: [], updated: [], unmounted: [] }
  };
  vnode.component = instance;

  setCurrentInstance(instance);
  instance.render = vnode.tag(instance.props);
  setCurrentInstance(null);

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

export function mount(vnode, container) {
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

export function patch(n1, n2) {
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
    if (n2.children && n2.children.length > 0) {
      newProps.children = n2.children;
    }
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

export function render(vnode, containerSelector) {
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
