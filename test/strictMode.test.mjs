import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// DOM до загрузки React: react-dom смотрит на окружение при первом вызове
const dom = new JSDOM('<!doctype html><div id="root"></div>');
Object.assign(globalThis, {
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
  Node: dom.window.Node,
  window: dom.window
});
// jsdom не умеет execCommand, а pell зовёт его при запуске
dom.window.document.execCommand = () => false;

const { act, createElement, StrictMode } = await import('react');
const { createRoot } = await import('react-dom/client');
const { LetterEditor } = await import('../dist/index.js');

describe('LetterEditor in StrictMode', function () {
  it('builds one pell editor after the double mount', async function () {
    const container = dom.window.document.getElementById('root');
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(StrictMode, null,
        createElement(LetterEditor, { html: '<p>Текст</p>', onChange () {} })));
    });
    assert.equal(container.querySelectorAll('.pell-content').length, 1);
    assert.equal(container.querySelectorAll('.pell-actionbar').length, 1);
    assert.equal(container.querySelector('.pell-content').innerHTML, '<p>Текст</p>');
    await act(async () => root.unmount());
  });
});
