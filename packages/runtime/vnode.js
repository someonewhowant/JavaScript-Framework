export function h(tag, props, ...children) {
  const normalizedChildren = children.flat().map(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      return { tag: null, props: null, children: String(child) };
    }
    return child;
  });
  return { tag, props, children: normalizedChildren };
}
