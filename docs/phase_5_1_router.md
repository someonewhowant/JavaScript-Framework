# Jiggle.js — Документация Фазы 5.1 (Роутер)

Jiggle.js теперь поддерживает клиентский роутинг (SPA) на основе `hash` (HashRouter). Это позволяет создавать многостраничные приложения без перезагрузки страницы.

## 1. Инициализация Router

Для работы роутера необходимо вызвать `createRouter` и передать массив маршрутов `routes`.

```javascript
import { createRouter } from './jiggle.js';
import { Home, About } from './pages.js';

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});
```

## 2. Встроенные компоненты

### `RouterView`
Специальный компонент, который рендерит текущий активный маршрут. Поместите его туда, где должны отображаться страницы.

```javascript
import { h, RouterView } from './jiggle.js';

function App() {
  return () => h('div', null, 
    h('header', null, 'Мой Сайт'),
    h(RouterView) // Здесь отрендерится Home или About
  );
}
```

### `RouterLink`
Компонент для навигации. Принимает свойство `to` (путь). При совпадении с текущим путем автоматически добавляет CSS-класс `router-link-active`. В отличие от обычного тега `a`, он является реактивным и позволяет вкладывать дочерние элементы (`children`).

```javascript
import { h, RouterLink } from './jiggle.js';

// h(RouterLink, { to: '/about' }, 'О нас')
```

## 3. Хуки навигации
Доступны хуки для работы с роутером внутри других компонентов:
* `useRouter()` — возвращает экземпляр роутера с методом `.push(path)`.
* `useRoute()` — возвращает реактивное свойство `currentRoute`.

## 4. Поддержка `children` в компонентах
В рамках реализации `RouterLink` была улучшена логика `mountComponent`. Теперь дочерние VNode, переданные в компонент, автоматически прокидываются внутрь `props.children`, что открывает дорогу для создания слотов (slots) и композиции UI!
