import { defineStore, ref } from '../../jiggle.js';

export const useBlogStore = defineStore('blog', () => {
  const posts = ref([
    {
      id: '1',
      title: 'Introduction to Jiggle.js',
      date: '2026-07-10',
      author: 'Admin',
      excerpt: 'Discover why Jiggle.js is the most lightweight and elegant frontend framework ever built.',
      content: 'Jiggle.js was born out of a desire for simplicity. We took the best ideas from Vue 3, React, and native web standards to create something truly magical.\n\nEnjoy the Proxy-based reactivity, Virtual DOM, and built-in Router and Store!'
    },
    {
      id: '2',
      title: 'Mastering the Plugin API',
      date: '2026-07-15',
      author: 'Jane Doe',
      excerpt: 'Learn how to extend your application using global mixins and dependency injection.',
      content: 'Plugins are the lifeblood of a mature framework ecosystem.\n\nBy leveraging createApp().use(), you can easily integrate third-party libraries, configure global logging, and inject API services across your entire component tree without prop-drilling.'
    },
    {
      id: '3',
      title: 'Why Server-Side Rendering Matters',
      date: '2026-07-17',
      author: 'SEO Expert',
      excerpt: 'Boost your site speed and SEO rankings by serving pure HTML directly from Node.js.',
      content: 'Client-side applications are great, but search engines love raw HTML.\n\nJiggles renderToString feature allows you to bridge the gap effortlessly, making your web apps blazingly fast on the first load.'
    }
  ]);

  return { posts };
});
