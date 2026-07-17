import { h, createApp, createRouter, RouterView, RouterLink, defineStore, ref, inject } from './jiggle.js';


const LoggerPlugin = {
  name: 'logger',
  install(app, options = {}) {
    // Add a global mixin
    app.mixin({
      onMounted() {
        if (options.enableLogs) {
          console.log(`[LoggerPlugin] Component Mounted.`);
        }
      }
    });

    // 2. Provide a global service
    app.provide('logger', {
      info: (msg) => console.info(`ℹ️ ${msg}`),
      success: (msg) => console.log(`✅ ${msg}`)
    });
  }
};

// Global Store
const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const increment = () => count.value++;
  const decrement = () => count.value--;

  return { count, increment, decrement };
});

function Home() {
  const store = useCounterStore();
  const logger = inject('logger');

  return () => h('div', null,
    h('h2', { style: 'color: #42b883;' }, 'Home Page'),
    h('p', null, 'Welcome to Jiggle.js Router, Store & Plugins!'),
    h('div', { style: 'padding: 10px; border: 1px solid #ccc; margin-top: 10px;' },
      h('h3', null, 'Global Counter'),
      h('p', null, `Count: ${store.count.value}`),
      h('button', {
        onClick: () => {
          store.increment();
          logger.info(`Incremented to ${store.count.value}`);
        },
        style: 'margin-right: 5px;'
      }, '+ Increment Global')
    )
  );
}

function About() {
  const store = useCounterStore();

  return () => h('div', null,
    h('h2', { style: 'color: #35495e;' }, 'About Page'),
    h('p', null, 'Jiggle.js is a lightweight frontend framework built from scratch.'),
    h('div', { style: 'padding: 10px; border: 1px solid #ccc; margin-top: 10px;' },
      h('h3', null, 'Global Counter (Shared State)'),
      h('p', null, `Count from Home: ${store.count.value}`),
      h('button', { onClick: store.decrement }, '- Decrement Global')
    )
  );
}

function App() {
  createRouter({
    routes: [
      { path: '/', component: Home },
      { path: '/about', component: About }
    ]
  });

  return () => h('div', { class: 'app-container', style: 'padding: 20px; font-family: sans-serif;' },
    h('h1', null, 'Jiggle.js App'),
    h('nav', { style: 'margin-bottom: 20px; display: flex; gap: 15px;' },
      h(RouterLink, { to: '/', style: 'color: blue; text-decoration: none;' }, 'Home'),
      h(RouterLink, { to: '/about', style: 'color: blue; text-decoration: none;' }, 'About')
    ),
    h('hr'),
    h('div', { style: 'margin-top: 20px;' },
      h(RouterView)
    )
  );
}

// Bootstrap with createApp and Plugin API
const app = createApp(App);
app.use(LoggerPlugin, { enableLogs: true });
app.mount('#container');