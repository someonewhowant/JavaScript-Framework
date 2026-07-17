import type { ComponentInstance } from '../shared/types.js';

export let currentInstance: ComponentInstance | null = null;

export function setCurrentInstance(instance: ComponentInstance | null): void {
  currentInstance = instance;
}

/** Register a callback to run after the component is mounted to the DOM. */
export function onMounted(fn: () => void): void {
  if (currentInstance) currentInstance.hooks.mounted.push(fn);
}

/** Register a callback to run after the component's reactive dependencies trigger a re-render. */
export function onUpdated(fn: () => void): void {
  if (currentInstance) currentInstance.hooks.updated.push(fn);
}

/** Register a callback to run when the component is removed from the DOM. */
export function onUnmounted(fn: () => void): void {
  if (currentInstance) currentInstance.hooks.unmounted.push(fn);
}

/**
 * Inject a value provided by an ancestor component or the app instance.
 * Returns `defaultValue` if no matching key is found.
 */
export function inject<T>(key: string | symbol, defaultValue?: T): T | undefined {
  if (currentInstance?.appContext) {
    const provides = currentInstance.appContext.provides;
    if (Object.prototype.hasOwnProperty.call(provides, key)) {
      return provides[key as string] as T;
    }
  }
  return defaultValue;
}
