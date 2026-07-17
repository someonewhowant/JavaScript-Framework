import { ref } from '../core/ref.js';
import { computed } from '../core/computed.js';
import { h } from '../runtime/vnode.js';

let activeRouter = null;

export function createRouter(options) {
  const routes = options.routes || [];
  const isBrowser = typeof window !== 'undefined';
  
  const initialPath = isBrowser ? (window.location.hash.slice(1) || '/') : (options.initialPath || '/');
  const currentPath = ref(initialPath);

  if (isBrowser) {
    window.addEventListener('hashchange', () => {
      currentPath.value = window.location.hash.slice(1) || '/';
    });
  }

  const push = (path) => {
    if (isBrowser) window.location.hash = path;
    else currentPath.value = path;
  };

  const currentRoute = computed(() => {
    for (const r of routes) {
      if (r.path === currentPath.value) {
        return { ...r, params: {} };
      }
      if (r.path.includes(':')) {
        const routeParts = r.path.split('/');
        const currentParts = currentPath.value.split('/');
        if (routeParts.length === currentParts.length) {
          let match = true;
          const params = {};
          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
              params[routeParts[i].slice(1)] = currentParts[i];
            } else if (routeParts[i] !== currentParts[i]) {
              match = false;
              break;
            }
          }
          if (match) return { ...r, params };
        }
      }
    }
    return { path: currentPath.value, component: null, params: {} };
  });

  const router = {
    push,
    currentRoute,
    install() {
      activeRouter = this;
    }
  };
  
  router.install();

  return router;
}

export function useRouter() {
  return activeRouter;
}

export function useRoute() {
  return activeRouter ? activeRouter.currentRoute : null;
}

export function RouterView() {
  return () => {
    if (!activeRouter) return h('div', null, 'Router not initialized');
    const route = activeRouter.currentRoute.value;
    if (route && route.component) {
      return h(route.component, { params: route.params || {} });
    }
    return h('div', null, '404 - Page Not Found');
  };
}

export function RouterLink(props) {
  return () => {
    const to = props.to;
    const isActive = activeRouter && activeRouter.currentRoute.value.path === to;
    const classes = ((props.class || '') + (isActive ? ' router-link-active' : '')).trim() || undefined;
    
    return h('a', { 
      href: '#' + to, 
      class: classes 
    }, ...(props.children || []));
  }
}
