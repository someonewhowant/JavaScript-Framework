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
  render('#container', `
    <h1>Hello, ${fullName.value}!</h1>
    <p>Age: ${state.age}</p>
    <p>Count: ${count.value}</p>
  `);
}

createEffect(renderApp);

setTimeout(() => {
  state.user.firstName = 'Jane'; // Tests nested reactivity
}, 1000);

setTimeout(() => {
  state.age = 31; // Tests watch and reactivity
}, 2000);

setTimeout(() => {
  count.value++; // Tests ref
}, 3000);