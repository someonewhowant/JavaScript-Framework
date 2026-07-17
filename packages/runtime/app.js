import { h } from './vnode.js';
import { render } from './render.js';

export function createApp(rootComponent, rootProps = null) {
  const context = {
    mixins: [],
    provides: {},
    plugins: new Set()
  };

  const app = {
    _context: context,
    use(plugin, ...options) {
      if (plugin && typeof plugin.install === 'function') {
        plugin.install(app, ...options);
      } else if (typeof plugin === 'function') {
        plugin(app, ...options);
      }
      context.plugins.add(plugin);
      return app;
    },
    mixin(mixinObj) {
      context.mixins.push(mixinObj);
      return app;
    },
    provide(key, value) {
      context.provides[key] = value;
      return app;
    },
    mount(containerSelector) {
      const vnode = h(rootComponent, rootProps);
      vnode.appContext = context;
      render(vnode, containerSelector);
      return app;
    }
  };

  return app;
}
