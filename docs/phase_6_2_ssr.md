# Jiggle.js —  (Server-Side Rendering)

SSR (Server-Side Rendering) позволяет генерировать готовую HTML-строку из ваших Jiggle-компонентов прямо на сервере (например, в Node.js) без участия браузера. Это невероятно важно для SEO (поисковой оптимизации) и быстрого показа контента при первой загрузке (FCP — First Contentful Paint).

В рамках этой фазы был добавлен модуль `packages/server-renderer`, предоставляющий функцию `renderToString`.

## 1. Использование на сервере

Чтобы сгенерировать HTML в Node.js-окружении, используйте `renderToString`:

```javascript
import { createApp, renderToString } from './jiggle.js';
import App from './App.js';

// Приложение создается как обычно
const app = createApp(App);

// Вместо app.mount() вызываем renderToString()
const html = renderToString(app);

console.log(html); 
// <div id="app" data-server-rendered="true"><h1>...</h1>...</div>
```

Вы можете напрямую отдавать этот `html` в ответах фреймворков вроде Express:
```javascript
app.get('*', (req, res) => {
  // Инициализируем роутер Jiggle с нужным путем req.url
  const jiggleApp = createApp(App);
  const html = renderToString(jiggleApp);
  res.send(`<!DOCTYPE html><html><body>${html}</body></html>`);
});
```

## 2. Особенности реализации

- **Отсутствие DOM:** `renderToString` не использует `document.createElement`. Он просто собирает строку. Поэтому это работает максимально быстро и не требует эмуляторов браузера (jsdom).
- **Игнорирование событий:** Атрибуты вроде `onClick` игнорируются при генерации строки. Они будут привязаны только на клиенте во время гидратации (или обычного mount).
- **Безопасность:** Все текстовые узлы и значения атрибутов автоматически экранируются (`escapeHtml`), чтобы предотвратить XSS-уязвимости.
- **Поддержка инжектов и миксинов:** Сборка поддерживает передачу `appContext` глубоко в дерево виртуального DOM. Таким образом, плагины и `provide/inject` работают даже на сервере.

## 3. Следующие шаги (Hydration)
На данный момент браузер должен вызвать стандартный `app.mount('#app')`, который полностью заменит серверный HTML. В будущем (или в более продвинутых фазах) можно добавить функцию `hydrate(app, container)`, которая будет не заменять элементы, а просто "навешивать" реактивность на уже существующий серверный DOM, что ещё больше ускорит загрузку.
