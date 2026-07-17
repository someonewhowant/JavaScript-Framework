import { h } from './vnode.js';
import { render } from './render.js';
import type { App, AppContext, Plugin, PluginFn, Mixin, Component } from '../shared/types.js';

/** Type guard: does the plugin have an `install` method? */
function hasInstall(plugin: Plugin | PluginFn): plugin is Plugin {
  return typeof plugin === 'object' && typeof plugin.install === 'function';
}

/**
 * Creates an application instance — the root container for
 * plugins, mixins, dependency injection, and rendering.
 */
export function createApp(rootComponent: Component, rootProps: Record<string, any> | null = null): App {
  const context: AppContext = {
    mixins: [],
    provides: {},
    plugins: new Set()
  };

  const app: App = {
    _context: context,
    _component: rootComponent,
    _props: rootProps,

    use(plugin: Plugin | PluginFn, ...options: any[]) {
      if (hasInstall(plugin)) {
        plugin.install(app, ...options);
      } else {
        plugin(app, ...options);
      }
      context.plugins.add(plugin as Plugin);
      return app;
    },

    mixin(mixinObj: Mixin) {
      context.mixins.push(mixinObj);
      return app;
    },

    provide(key: string | symbol, value: any) {
      context.provides[key as string] = value;
      return app;
    },

    mount(containerSelector: string) {
      const vnode = h(rootComponent, rootProps);
      vnode.appContext = context;
      render(vnode, containerSelector);
      return app;
    }
  };

  return app;
}
