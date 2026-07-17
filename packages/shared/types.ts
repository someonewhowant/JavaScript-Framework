export type EffectFn = {
  (...args: any[]): any;
};

export type DepsMap = WeakMap<object, Map<string | symbol, Set<EffectFn>>>;

// === Reactivity ===

export interface Ref<T = any> {
  value: T;
  /** @internal */
  _value: T;
}

export type ComputedRef<T = any> = Readonly<Ref<T>>;

export type UnwrapRef<T> = T extends Ref<infer V> ? V : T;

// === VNode & Component ===

export type Component<P extends Record<string, any> = any> = (props: P) => () => VNode;

export interface VNode {
  tag: string | Component | null;
  props: Record<string, any> | null;
  children: VNode[] | string;
  el?: Node | null;
  component?: ComponentInstance | null;
  appContext?: AppContext | null;
}

// === Component Instance (internal) ===

export interface LifecycleHooks {
  mounted: (() => void)[];
  updated: (() => void)[];
  unmounted: (() => void)[];
}

export interface ComponentInstance {
  vnode: VNode;
  props: Record<string, any>;
  appContext: AppContext;
  render: (() => VNode) | null;
  subTree: VNode | null;
  isMounted: boolean;
  el: Node | null;
  hooks: LifecycleHooks;
}

// === App & Plugins ===

export interface Mixin {
  onMounted?: () => void;
  onUpdated?: () => void;
  onUnmounted?: () => void;
}

export interface AppContext {
  mixins: Mixin[];
  provides: Record<string | symbol, any>;
  plugins: Set<Plugin>;
}

export interface Plugin {
  name?: string;
  install: (app: App, ...options: any[]) => void;
}

export type PluginFn = (app: App, ...options: any[]) => void;

export interface App {
  _context: AppContext;
  _component?: Component;
  _props?: Record<string, any> | null;
  use(plugin: Plugin | PluginFn, ...options: any[]): App;
  mixin(mixin: Mixin): App;
  provide(key: string | symbol, value: any): App;
  mount(selector: string): App;
}

// === Router ===

export interface RouteRecord {
  path: string;
  component: Component;
}

export interface MatchedRoute extends RouteRecord {
  params: Record<string, string>;
}

export interface RouterOptions {
  routes: RouteRecord[];
  initialPath?: string;
}

export interface Router {
  push(path: string): void;
  currentRoute: ComputedRef<MatchedRoute>;
  install(): void;
}

// === Store ===

export type StoreSetup<T> = () => T;

export type UseStore<T> = () => T & { $id: string };

// === Compiler (AST) ===

export interface ASTText {
  type: 3;
  text: string;
}

export interface ASTElement {
  type: 1;
  tag: string;
  props: Record<string, string>;
  directives: {
    if?: string;
    for?: string;
    model?: string;
    on?: Record<string, string>;
    bind?: Record<string, string>;
  };
  children: ASTNode[];
}

export type ASTNode = ASTElement | ASTText;

export type RenderTemplate = (ctx: Record<string, any>) => VNode;

// === SSR ===

export type SSRInput = App | VNode;
