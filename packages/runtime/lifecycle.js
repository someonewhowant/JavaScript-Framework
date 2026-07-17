export let currentInstance = null;

export function setCurrentInstance(instance) {
  currentInstance = instance;
}

export function onMounted(fn) {
  if (currentInstance) currentInstance.hooks.mounted.push(fn);
}

export function onUpdated(fn) {
  if (currentInstance) currentInstance.hooks.updated.push(fn);
}

export function onUnmounted(fn) {
  if (currentInstance) currentInstance.hooks.unmounted.push(fn);
}

export function inject(key, defaultValue) {
  if (currentInstance && currentInstance.appContext) {
    if (key in currentInstance.appContext.provides) {
      return currentInstance.appContext.provides[key];
    }
  }
  return defaultValue;
}
