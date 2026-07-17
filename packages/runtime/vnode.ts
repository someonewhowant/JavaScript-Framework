import type { VNode, Component } from '../shared/types.js';

/**
 * Creates a Virtual DOM node.
 * Normalizes children: strings and numbers become text VNodes.
 */
export function h(tag: string | Component | null, props: Record<string, any> | null, ...children: any[]): VNode {
  const normalizedChildren: VNode[] = children.flat().map((child): VNode => {
    if (typeof child === 'string' || typeof child === 'number') {
      return { tag: null, props: null, children: String(child) };
    }
    return child as VNode;
  });
  return { tag, props, children: normalizedChildren };
}
