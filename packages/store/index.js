const activeStores = new Map();

export function defineStore(id, storeSetup) {
  return function useStore() {
    if (!activeStores.has(id)) {
      if (typeof storeSetup !== 'function') {
        throw new Error('[jiggle-store] defineStore requires a setup function.');
      }
      
      const storeInstance = storeSetup();
      storeInstance.$id = id;
      
      activeStores.set(id, storeInstance);
    }
    return activeStores.get(id);
  };
}

export function getStores() {
  return activeStores;
}
