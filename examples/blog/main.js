import { h, createApp, createRouter, RouterView, RouterLink } from '../../jiggle.js';
import { Home, PostDetail } from './pages.js';

function App() {
  // Initialize Router with dynamic path support
  createRouter({
    routes: [
      { path: '/', component: Home },
      { path: '/post/:id', component: PostDetail }
    ]
  });

  return () => h('div', null,
    h('header', { class: 'header' },
      h(RouterLink, { to: '/' }, 'Jiggle Blog'),
      h('nav', null,
        h(RouterLink, { to: '/' }, 'Home'),
        h('a', { href: 'https://github.com', target: '_blank' }, 'GitHub')
      )
    ),
    h('main', { class: 'container' },
      h(RouterView)
    )
  );
}

const app = createApp(App);
app.mount('#app');
