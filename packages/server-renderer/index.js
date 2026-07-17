import { setCurrentInstance } from '../runtime/lifecycle.js';

export function renderToString(appOrVNode) {
  if (appOrVNode && appOrVNode._context && appOrVNode._component) {
    // If it's an App instance (created by createApp)
    const rootVNode = {
      tag: appOrVNode._component,
      props: appOrVNode._props,
      appContext: appOrVNode._context
    };
    return renderVNodeToString(rootVNode, appOrVNode._context);
  }
  return renderVNodeToString(appOrVNode);
}

function renderVNodeToString(vnode, appContext = null) {
  if (vnode === null || vnode === undefined) {
    return '';
  }

  // Array of VNodes (Fragments)
  if (Array.isArray(vnode)) {
    return vnode.map(v => renderVNodeToString(v, appContext)).join('');
  }

  // Text node
  if (vnode.tag === null) {
    return escapeHtml(String(vnode.children));
  }

  // Component
  if (typeof vnode.tag === 'function') {
    const initialProps = vnode.props || {};
    if (vnode.children && vnode.children.length > 0) {
      initialProps.children = vnode.children;
    }
    
    // Set up dummy instance so inject() and hooks don't crash
    const resolvedContext = vnode.appContext || appContext || { mixins: [], provides: {} };
    const instance = {
      appContext: resolvedContext,
      hooks: { mounted: [], updated: [], unmounted: [] }
    };

    setCurrentInstance(instance);
    const renderFn = vnode.tag(initialProps);
    setCurrentInstance(null);
    
    const subTree = renderFn();
    return renderVNodeToString(subTree, resolvedContext);
  }

  // HTML Element
  let html = `<${vnode.tag}`;
  
  if (vnode.props) {
    for (const key in vnode.props) {
      if (key === 'children') continue;
      const value = vnode.props[key];
      if (key.startsWith('on')) {
        // Event listeners are ignored in SSR
        continue;
      }
      if (value === true) {
        html += ` ${key}`;
      } else if (value !== false && value != null) {
        html += ` ${key}="${escapeHtml(String(value))}"`;
      }
    }
  }

  html += '>';

  // Void elements (self-closing)
  const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  if (voidElements.has(vnode.tag.toLowerCase())) {
    return html;
  }

  if (vnode.children) {
    if (Array.isArray(vnode.children)) {
      for (const child of vnode.children) {
        html += renderVNodeToString(child, appContext);
      }
    } else {
      html += escapeHtml(String(vnode.children));
    }
  }

  html += `</${vnode.tag}>`;
  
  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
