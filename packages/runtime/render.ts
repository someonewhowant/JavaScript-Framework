import { reactive } from '../core/reactive.js';
import { createEffect } from '../core/effect.js';
import { setCurrentInstance } from './lifecycle.js';
import type { VNode, AppContext, ComponentInstance, Component, Mixin } from '../shared/types.js';

// ---------------------------------------------------------------------------
// Prop Patching
// ---------------------------------------------------------------------------

/** Apply a single prop (attribute or event listener) to a DOM element. */
export function patchProp(el: Element, key: string, oldValue: any, newValue: any): void {
  if (newValue === oldValue) return;

  if (key.startsWith('on')) {
    const eventName = key.slice(2).toLowerCase();
    if (oldValue) el.removeEventListener(eventName, oldValue);
    if (newValue) el.addEventListener(eventName, newValue);
  } else {
    if (newValue == null || newValue === false) el.removeAttribute(key);
    else el.setAttribute(key, String(newValue));
  }
}

/** Diff and apply all props between two VNodes. */
export function patchProps(
  el: Element,
  oldProps: Record<string, any> | null,
  newProps: Record<string, any> | null
): void {
  const prev = oldProps || {};
  const next = newProps || {};

  for (const key in next) patchProp(el, key, prev[key], next[key]);
  for (const key in prev) {
    if (!(key in next)) patchProp(el, key, prev[key], null);
  }
}

// ---------------------------------------------------------------------------
// Children Patching
// ---------------------------------------------------------------------------

/** Reconcile child VNode arrays on a parent element. */
export function patchChildren(
  el: Element,
  oldChildren: VNode[],
  newChildren: VNode[],
  appContext: AppContext | null
): void {
  const commonLength = Math.min(oldChildren.length, newChildren.length);

  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i], appContext);
  }

  if (newChildren.length > oldChildren.length) {
    for (let i = commonLength; i < newChildren.length; i++) {
      mount(newChildren[i], el, appContext);
    }
  } else if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= commonLength; i--) {
      unmount(oldChildren[i]);
    }
  }
}

// ---------------------------------------------------------------------------
// Unmount
// ---------------------------------------------------------------------------

/** Recursively remove a VNode tree from the DOM and fire unmounted hooks. */
export function unmount(vnode: VNode): void {
  if (vnode.component) {
    vnode.component.hooks.unmounted.forEach(cb => cb());
    if (vnode.component.subTree) {
      unmount(vnode.component.subTree);
    }
    return;
  }
  if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => unmount(child));
  }
  if (vnode.el?.parentNode) {
    vnode.el.parentNode.removeChild(vnode.el);
  }
}

// ---------------------------------------------------------------------------
// Component Mounting
// ---------------------------------------------------------------------------

/** Create a live component instance and wire it into the reactive effect system. */
export function mountComponent(
  vnode: VNode,
  container: Element,
  appContext: AppContext | null
): void {
  const initialProps: Record<string, any> = vnode.props || {};
  if (Array.isArray(vnode.children) && vnode.children.length > 0) {
    initialProps.children = vnode.children;
  }

  const resolvedContext: AppContext = vnode.appContext || appContext || {
    mixins: [],
    provides: {},
    plugins: new Set()
  };

  const instance: ComponentInstance = {
    vnode,
    props: reactive(initialProps),
    appContext: resolvedContext,
    render: null,
    subTree: null,
    isMounted: false,
    el: null,
    hooks: { mounted: [], updated: [], unmounted: [] }
  };

  // Apply global mixins
  for (const mixin of resolvedContext.mixins) {
    if (mixin.onMounted) instance.hooks.mounted.push(mixin.onMounted.bind(instance));
    if (mixin.onUpdated) instance.hooks.updated.push(mixin.onUpdated.bind(instance));
    if (mixin.onUnmounted) instance.hooks.unmounted.push(mixin.onUnmounted.bind(instance));
  }

  vnode.component = instance;

  // Set current instance so that lifecycle hooks (onMounted, inject, etc.) register correctly
  setCurrentInstance(instance);
  instance.render = (vnode.tag as Component)(instance.props);
  setCurrentInstance(null);

  createEffect(() => {
    if (!instance.isMounted) {
      const subTree = instance.render!();
      instance.subTree = subTree;
      mount(subTree, container, resolvedContext);
      vnode.el = subTree.el;
      instance.isMounted = true;
      instance.hooks.mounted.forEach(cb => cb());
    } else {
      const prevSubTree = instance.subTree!;
      const nextSubTree = instance.render!();
      instance.subTree = nextSubTree;
      patch(prevSubTree, nextSubTree, resolvedContext);
      vnode.el = nextSubTree.el;
      instance.hooks.updated.forEach(cb => cb());
    }
  });
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

/** Create real DOM nodes from a VNode tree and append them to `container`. */
export function mount(
  vnode: VNode,
  container: Element,
  appContext: AppContext | null = null
): void {
  // Component
  if (typeof vnode.tag === 'function') {
    mountComponent(vnode, container, appContext);
    return;
  }

  // Text node
  if (vnode.tag === null) {
    const el = document.createTextNode(vnode.children as string);
    vnode.el = el;
    container.appendChild(el);
    return;
  }

  // Element node
  const el = document.createElement(vnode.tag);
  vnode.el = el;

  if (vnode.props) {
    for (const key in vnode.props) {
      patchProp(el, key, null, vnode.props[key]);
    }
  }

  if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => mount(child, el, appContext));
  }

  container.appendChild(el);
}

// ---------------------------------------------------------------------------
// Patch (Diff + Update)
// ---------------------------------------------------------------------------

/** Diff two VNode trees and apply minimal DOM mutations. */
export function patch(
  n1: VNode,
  n2: VNode,
  appContext: AppContext | null = null
): void {
  if (n1 === n2) return;

  // --- Component patching ---
  if (typeof n1.tag === 'function' && typeof n2.tag === 'function') {
    if (n1.tag !== n2.tag) {
      // Different component — full remount
      const parent = n1.el!.parentNode as Element;
      unmount(n1);
      mount(n2, parent, appContext);
      return;
    }

    // Same component — update props to trigger reactive re-render
    const instance = n1.component!;
    n2.component = instance;
    instance.vnode = n2;

    const newProps: Record<string, any> = n2.props || {};
    if (Array.isArray(n2.children) && n2.children.length > 0) {
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

  // --- Tag mismatch — full remount ---
  if (n1.tag !== n2.tag) {
    const parent = n1.el!.parentNode as Element;
    unmount(n1);
    mount(n2, parent, appContext);
    return;
  }

  // --- Same tag — in-place update ---
  const el = n1.el!;
  n2.el = el;

  // Text node
  if (n2.tag === null) {
    if (n1.children !== n2.children) {
      el.textContent = n2.children as string;
    }
    return;
  }

  // Element node
  patchProps(el as Element, n1.props, n2.props);
  if (Array.isArray(n1.children) && Array.isArray(n2.children)) {
    patchChildren(el as Element, n1.children, n2.children, appContext);
  }
}

// ---------------------------------------------------------------------------
// Top-level Render
// ---------------------------------------------------------------------------

/** Mount or patch a VNode tree into a DOM container selected by CSS selector. */
export function render(vnode: VNode, containerSelector: string): void {
  const container = document.querySelector(containerSelector) as (Element & { _vnode?: VNode }) | null;
  if (!container) return;

  if (!container._vnode) {
    container.innerHTML = '';
    mount(vnode, container, vnode.appContext || null);
  } else {
    patch(container._vnode, vnode, vnode.appContext || null);
  }
  container._vnode = vnode;
}
