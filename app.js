

let state = reactive({message: 'Hello Universe'});


function renderApp() {
  render('#container', `<h1>${state.message}</h1>`)
}

createEffect(renderApp)

setTimeout(() => {
  state.message = 'Hello World'
}, 1000);