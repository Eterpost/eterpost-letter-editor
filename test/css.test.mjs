import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';


// Селекторы правил CSS; правила внутри @media и @supports тоже, сами эти блоки — нет
function selectors (css) {
  const found = [];
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let start = 0;
  const stack = [];
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '{') {
      const prelude = text.slice(start, index).trim();
      const isGroup = /^@(media|supports)/.test(prelude);
      if (!isGroup && !prelude.startsWith('@') && !stack.includes('rule')) {
        found.push(prelude);
      }
      stack.push(isGroup ? 'group' : prelude.startsWith('@') ? 'at' : 'rule');
      start = index + 1;
    } else if (char === '}') {
      stack.pop();
      start = index + 1;
    } else if (char === ';' && stack.at(-1) !== 'rule') {
      start = index + 1;
    }
  }
  return found;
}

describe('letter-editor.css', function () {
  it('css is scoped', function () {
    const css = readFileSync(new URL('../dist/letter-editor.css', import.meta.url), 'utf8');
    const list = selectors(css);
    assert.ok(list.length > 10, 'стили собраны');
    for (const selector of list) {
      for (const part of selector.split(',')) {
        assert.match(part.trim(), /^(:where\()?\.le-editor(?![\w-])/,
          `правило вне .le-editor: ${part}`);
      }
    }
  });

  it('leaves host elements in extra tabs alone', function () {
    const css = readFileSync(new URL('../dist/letter-editor.css', import.meta.url), 'utf8');
    for (const selector of selectors(css)) {
      assert.doesNotMatch(selector, /(^|[\s>,])(textarea|input|select|button)(?![\w-])/,
        `голый элемент: ${selector}`);
    }
  });

  it('lets the host set colours on the editor or above', function () {
    const css = readFileSync(new URL('../dist/letter-editor.css', import.meta.url), 'utf8');
    // Свои переменные пакет не присваивает: только читает с запасным значением
    assert.doesNotMatch(css, /--le-[a-z]+\s*:/);
    assert.match(css, /var\(--le-bg,/);
    // Тёмная тема ОС не действует, если хозяин выбрал светлую
    const darkByOs = /prefers-color-scheme:\s*dark[^{]*\{[^{]*:not\(\[data-color-scheme=light\]\)/;
    assert.match(css, darkByOs);
    assert.match(css, /\[data-color-scheme=dark\]/);
  });
});

