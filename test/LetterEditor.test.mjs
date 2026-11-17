import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { collectFieldStats, LetterEditor } from '../dist/index.js';
import { editorActions } from '../dist/actions.js';


const fields = [
  { key: 'name', title: 'Имя' },
  { key: 'extraData.if_own_3', title: 'Крупный клиент' }
];

function render (props) {
  return renderToStaticMarkup(createElement(LetterEditor, props));
}

describe('LetterEditor', function () {
  it('renders field buttons with host titles', function () {
    const html = render({ fields, html: '<p>Текст</p>' });
    assert.match(html, /class="le-editor/);
    assert.match(html, /Вставить поле:/);
    assert.match(html, />Крупный клиент</);
    assert.match(html, /title="Вставить \{\{receiver\.extraData\.if_own_3\}\}"/);
  });

  it('warns with host titles', function () {
    const stats = collectFieldStats([{ email: 'a@x.ru', extraData: { if_own_3: '' } }]);
    const html = render({ fields, html: '{{receiver.extraData.if_own_3}}', stats });
    assert.match(html, /«Крупный клиент»: пусто у всех получателей\./);
  });

  it('renders without optional props', function () {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get () {
        throw new Error('storage is blocked');
      }
    });
    try {
      const html = render({ html: '<p>Текст</p>' });
      assert.match(html, /class="le-editor/);
      assert.doesNotMatch(html, /le-fields/);
      assert.doesNotMatch(html, /le-warnings/);
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, 'localStorage', descriptor);
      } else {
        delete globalThis.localStorage;
      }
    }
  });

  it('adds the image button only with uploadImage', function () {
    const titles = actions => actions.map(action => action.title || action);
    assert.ok(!titles(editorActions()).includes('Вставить изображение'));
    assert.ok(titles(editorActions(() => {})).includes('Вставить изображение'));
  });

  it('does not offer fields Handlebars cannot address', function () {
    const withBracket = [...fields, { key: 'extraData.a]b', title: 'Скобка' }];
    const html = render({ fields: withBracket, html: '' });
    assert.match(html, />Крупный клиент</);
    assert.doesNotMatch(html, />Скобка</);
  });

  it('marks the colour scheme chosen by the host', function () {
    assert.match(render({ colorScheme: 'light', html: '' }), /data-color-scheme="light"/);
    assert.doesNotMatch(render({ html: '' }), /data-color-scheme/);
  });
});
