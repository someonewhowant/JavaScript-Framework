import { h, render, createRouter, RouterView, RouterLink } from './jiggle.js';

function Home() {
  return () => h('div', null, 
    h('h2', { style: 'color: #42b883;' }, 'Home Page'), 
    h('p', null, 'Welcome to Jiggle.js Router!')
  );
}

function About() {
  return () => h('div', null, 
    h('h2', { style: 'color: #35495e;' }, 'About Page'), 
    h('p', null, 'Jiggle.js is a lightweight frontend framework built from scratch.')
  );
}

function App() {
  // Initialize router inside the root component
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

render(h(App), '#container');