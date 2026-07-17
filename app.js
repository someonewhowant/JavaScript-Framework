function Counter(props) {
  const count = ref(props.initial || 0);
  
  onMounted(() => {
    console.log('Counter mounted with initial:', props.initial);
  });
  
  onUpdated(() => {
    console.log('Counter updated, new count:', count.value);
  });
  
  onUnmounted(() => {
    console.log('Counter unmounted!');
  });
  
  return () => h('div', { class: 'counter-box', style: 'border: 1px solid #ccc; padding: 10px; margin-top: 10px;' },
    h('h3', null, `Counter Component (Initial: ${props.initial})`),
    h('p', null, `Count: ${count.value}`),
    h('button', { onClick: () => count.value++ }, '+1'),
    h('button', { onClick: () => count.value-- }, '-1')
  );
}

function App() {
  const showCounter = ref(true);
  const resetKey = ref(0);
  
  return () => h('div', { class: 'app' },
    h('h1', null, 'Jiggle.js Components!'),
    h('button', { onClick: () => showCounter.value = !showCounter.value }, showCounter.value ? 'Hide Counter' : 'Show Counter'),
    h('button', { onClick: () => resetKey.value++ }, 'Reset App Counter'),
    showCounter.value ? h(Counter, { initial: resetKey.value * 10 }) : h('p', null, 'Counter is hidden')
  );
}

render(h(App), '#container');