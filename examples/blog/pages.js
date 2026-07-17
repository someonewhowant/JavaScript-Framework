import { h, RouterLink } from '../../jiggle.js';
import { useBlogStore } from './store.js';

export function Home() {
  const store = useBlogStore();

  return () => h('div', null,
    h('h1', { style: 'margin-bottom: 2rem;' }, 'Latest Posts'),
    h('div', { class: 'posts-grid' },
      ...store.posts.value.map(post => 
        h('article', { class: 'post-card' },
          h('h2', null, 
            h(RouterLink, { to: `/post/${post.id}` }, post.title)
          ),
          h('div', { class: 'post-meta' }, `${post.date} • by ${post.author}`),
          h('p', { class: 'post-excerpt' }, post.excerpt),
          h(RouterLink, { to: `/post/${post.id}`, class: 'read-more' }, 'Read article →')
        )
      )
    )
  );
}

export function PostDetail(props) {
  const store = useBlogStore();
  
  return () => {
    // Props.params is injected by the router for dynamic routes like /post/:id
    const post = store.posts.value.find(p => p.id === props.params.id);

    if (!post) {
      return h('div', { style: 'text-align: center; padding: 4rem 0;' }, 
        h('h1', null, '404'),
        h('p', null, 'Post not found.'),
        h(RouterLink, { to: '/' }, 'Return to Home')
      );
    }

    return h('article', { class: 'post-full' },
      h(RouterLink, { to: '/', class: 'back-link' }, '← Back to posts'),
      h('h1', null, post.title),
      h('div', { class: 'post-meta' }, `${post.date} • by ${post.author}`),
      h('div', { class: 'content' }, post.content)
    );
  };
}
