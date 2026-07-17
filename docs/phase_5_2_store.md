# Jiggle.js — Документация Фазы 5.2 (Стейт-менеджер)

В Jiggle.js встроен собственный стейт-менеджер, вдохновленный **Pinia** (официальный стейт-менеджер Vue 3). 
Он полностью полагается на ядро нашей реактивности (`ref`, `computed`, `reactive`), поэтому его реализация невероятно лаконична (около 20 строк кода), но при этом он обладает всей необходимой мощью.

## 1. Концепция (Setup Stores)

В отличие от Vuex с его мутациями, экшенами и геттерами, `jiggle-store` использует концепцию **Composition API (Setup Stores)**.
Вы просто передаёте функцию инициализации, в которой объявляете переменные (`ref`), вычисляемые свойства (`computed`) и функции для их изменения (actions). Функция должна вернуть объект публичного интерфейса хранилища.

`defineStore` автоматически реализует паттерн "Синглтон" (Singleton): сколько бы раз вы ни вызывали хранилище в разных компонентах, функция `setup` выполнится лишь единожды при первом обращении, а все последующие вызовы вернут один и тот же реактивный инстанс.

## 2. Использование

### Шаг 1: Определение хранилища

```javascript
import { defineStore, ref, computed } from './jiggle.js';

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0);
  
  // Getters
  const doubleCount = computed(() => count.value * 2);
  
  // Actions
  const increment = () => count.value++;
  const decrement = () => count.value--;

  return { count, doubleCount, increment, decrement };
});
```

### Шаг 2: Использование в компонентах

```javascript
import { h } from './jiggle.js';
import { useCounterStore } from './store.js';

function MyComponent() {
  const store = useCounterStore(); // Получаем глобальный инстанс

  return () => h('div', null, 
    h('p', null, `Count: ${store.count.value}`),
    h('button', { onClick: store.increment }, 'Increment')
  );
}
```

## 3. Под капотом
Все созданные хранилища кэшируются во внутренней `Map`. Метод `getStores()` позволяет получить доступ ко всем зарегистрированным на данный момент хранилищам (может быть полезно для создания инструментов разработчика — devtools).
