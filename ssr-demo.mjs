import { h, createApp, createRouter, renderToString } from './jiggle.js';

// Define a simple component
function UserProfile(props) {
  return () => h('div', { class: 'user-profile' },
    h('h2', { style: 'color: blue;' }, `User: ${props.name}`),
    h('p', null, 'This HTML was generated on the server (Node.js)!')
  );
}

function App() {
  createRouter({
    initialPath: '/users', // Simulate server request URL
    routes: []
  });

  return () => h('div', { id: 'app', 'data-server-rendered': 'true' },
    h('h1', null, 'Jiggle.js SSR Demo'),
    h(UserProfile, { name: 'Alice' })
  );
}

const app = createApp(App);

console.log('--- Generating HTML on the server ---');
const html = renderToString(app);
console.log(html);
console.log('-------------------------------------');
console.log('Success! This string can be sent directly as an HTTP response.');
