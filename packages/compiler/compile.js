import { h } from '../runtime/vnode.js';

export function compile(templateStr) {
  const tpl = document.createElement('template');
  tpl.innerHTML = templateStr.trim();
  
  function createAST(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text.trim()) return null;
      return { type: 3, text };
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const astNode = {
        type: 1,
        tag: node.tagName.toLowerCase(),
        props: {},
        directives: {},
        children: []
      };
      
      Array.from(node.attributes).forEach(attr => {
        const name = attr.name;
        const value = attr.value;
        if (name === 'j-if') astNode.directives.if = value;
        else if (name === 'j-for') astNode.directives.for = value;
        else if (name === 'j-model') astNode.directives.model = value;
        else if (name.startsWith('j-on:') || name.startsWith('@')) {
          const event = (name.startsWith('@') ? name.slice(1) : name.slice(5)).split('.')[0];
          astNode.directives.on = astNode.directives.on || {};
          astNode.directives.on[event] = value;
        }
        else if (name.startsWith('j-bind:') || name.startsWith(':')) {
          const prop = name.startsWith(':') ? name.slice(1) : name.slice(7);
          astNode.directives.bind = astNode.directives.bind || {};
          astNode.directives.bind[prop] = value;
        }
        else {
          astNode.props[name] = value;
        }
      });
      
      Array.from(node.childNodes).forEach(child => {
        const childAST = createAST(child);
        if (childAST) astNode.children.push(childAST);
      });
      
      return astNode;
    }
  }
  
  const ast = createAST(tpl.content.firstChild);
  
  function generateCode(node) {
    if (node.type === 3) {
      const text = node.text.replace(/\{\{(.+?)\}\}/g, (match, expr) => `\${${expr.trim()}}`);
      return text !== node.text ? `\`${text}\`` : JSON.stringify(node.text);
    }
    
    if (node.directives.if) {
      const condition = node.directives.if;
      delete node.directives.if;
      const childCode = generateCode(node);
      return `(${condition}) ? ${childCode} : h('div', {style: 'display:none;'}, '')`;
    }
    
    if (node.directives.for) {
      const [item, list] = node.directives.for.split(' in ').map(s => s.trim());
      delete node.directives.for;
      const childCode = generateCode(node);
      return `...(${list}).map(${item} => ${childCode})`;
    }
    
    let propsCode = '{ ';
    for (const key in node.props) {
      propsCode += `'${key}': ${JSON.stringify(node.props[key])}, `;
    }
    
    if (node.directives.bind) {
      for (const key in node.directives.bind) {
        propsCode += `'${key}': ${node.directives.bind[key]}, `;
      }
    }
    
    if (node.directives.on) {
      for (const key in node.directives.on) {
        const expr = node.directives.on[key];
        const handler = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(expr) ? expr : `($event) => { ${expr} }`;
        propsCode += `'on${key.charAt(0).toUpperCase() + key.slice(1)}': ${handler}, `;
      }
    }
    
    if (node.directives.model) {
      const prop = node.directives.model;
      propsCode += `'value': ${prop}, `;
      propsCode += `'onInput': ($event) => { ${prop} = $event.target.value }, `;
    }
    
    propsCode += '}';
    
    const childrenCode = node.children.map(generateCode).filter(c => c).join(', ');
    return `h('${node.tag}', ${propsCode}${childrenCode ? ', ' + childrenCode : ''})`;
  }
  
  const code = generateCode(ast);
  
  return function renderTemplate(ctx) {
    const proxyCtx = new Proxy(ctx, {
      get(target, key) {
        if (key === 'h') return h;
        const val = Reflect.get(target, key);
        return (val && val._value !== undefined) ? val.value : val;
      },
      set(target, key, value) {
        const val = Reflect.get(target, key);
        if (val && val._value !== undefined) {
          val.value = value;
          return true;
        }
        return Reflect.set(target, key, value);
      },
      has(target, key) {
        if (key === 'h') return true;
        return key in target;
      }
    });
    
    const fn = new Function('ctx', `
      with (ctx) {
        return ${code};
      }
    `);
    return fn(proxyCtx);
  }
}
