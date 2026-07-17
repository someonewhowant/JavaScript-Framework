const state = reactive({
  user: {
    firstName: 'John',
    lastName: 'Doe'
  },
  age: 30
});

const count = ref(0);

const fullName = computed(() => `${state.user.firstName} ${state.user.lastName}`);

watch(() => state.age, (newVal, oldVal) => {
  console.log(`Age changed from ${oldVal} to ${newVal}`);
});

function renderApp() {
  const vnode = h('div', { class: 'app' },
    h('h1', null, `Hello, ${fullName.value}!`),
    h('p', null, `Age: ${state.age}`),
    h('p', null, `Count: ${count.value}`),
    h('button', { onClick: () => count.value++ }, 'Increment Count'),
    h('button', { onClick: () => state.age++ }, 'Happy Birthday'),
    h('button', { onClick: () => state.user.firstName = state.user.firstName === 'John' ? 'Jane' : 'John' }, 'Toggle Name')
  );
  render(vnode, '#container');
}

createEffect(renderApp);