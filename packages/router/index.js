import { ref } from '../core/ref.js';
import { computed } from '../core/computed.js';
import { h } from '../runtime/vnode.js';

let activeRouter = null;

export function createRouter(options) {
  const routes = options.routes || [];
  
  const currentPath = ref(window.location.hash.slice(1) || '/');

  window.addEventListener('hashchange', () => {
    currentPath.value = window.location.hash.slice(1) || '/';
  });

  const push = (path) => {
    window.location.hash = path;
  };

  const currentRoute = computed(() => {
    const matched = routes.find(r => r.path === currentPath.value);
    return matched || { path: currentPath.value, component: null };
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
      return h(route.component, {});
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
