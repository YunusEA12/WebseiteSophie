import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Window } = require(process.env.TEST_DOM_MODULE || 'happy-dom');
const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');

function fixture({ hash = '', clipboard = true } = {}) {
  const window = new Window({ url: 'https://gerberxnails.de/' + hash,
    settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  window.document.write(read('index.html'));
  const errors = [];
  window.console.error = (...args) => errors.push(args.join(' '));
  window.matchMedia = query => ({ matches: query.includes('reduced-motion') || query.includes('min-width'),
    addEventListener() {}, addListener() {} });
  let copied = '';
  Object.defineProperty(window, 'isSecureContext', { value: true });
  Object.defineProperty(window.navigator, 'clipboard', { value: {
    writeText: async text => { if (!clipboard) throw Error('denied'); copied = text; }
  } });
  window.document.execCommand = () => false;
  window.eval(read('js/requests.js'));
  window.eval(read('js/main.js'));
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  return { window, document: window.document, errors, copied: () => copied,
    close: () => window.happyDOM.abort() };
}

test('every price combination, quantities and exclusive Soak Off', async () => {
  const f = fixture(), d = f.document;
  try {
    for (const length of d.querySelectorAll('[data-len]')) {
      for (const level of d.querySelectorAll('[data-lvl]')) {
        length.click(); level.click();
        assert.equal(+d.querySelector('#total').textContent, +length.dataset.len + +level.dataset.lvl);
      }
    }
    d.querySelector('[data-len="40"]').click(); d.querySelector('[data-lvl="10"]').click();
    const charm = d.querySelector('[data-extra="1"]'); charm.click();
    const plus = charm.closest('.opt-qty').querySelector('[data-step="1"]');
    for (let i = 0; i < 15; i++) plus.click();
    assert.equal(+d.querySelector('#total').textContent, 60);
    assert.equal(charm.dataset.qty, '10');
    assert.equal(d.querySelector('#total-pre').hidden, false);
    d.querySelector('[data-add]').click();
    d.querySelector('[data-extra="5"]').click();
    assert.equal(+d.querySelector('#total').textContent, 75);
    d.querySelector('[data-solo]').click();
    assert.equal(+d.querySelector('#total').textContent, 20);
    assert.equal(d.querySelector('#total-pre').hidden, true);
    assert.equal(d.querySelector('[data-len]').disabled, true);
    d.querySelector('[data-solo]').click();
    assert.equal(+d.querySelector('#total').textContent, 75);
    assert.deepEqual(f.errors, []);
  } finally { await f.close(); }
});

for (const clipboard of [true, false]) test('request preview and clipboard ' + (clipboard ? 'success' : 'failure'), async () => {
  const f = fixture({ clipboard }), d = f.document;
  try {
    d.querySelector('[data-len="50"]').click();
    d.querySelector('#btn-calc-cta').click();
    const dialog = d.querySelector('#request-dialog');
    assert.equal(dialog.open, true);
    assert.match(d.querySelector('#request-text').value, /60 €/);
    const mail = d.querySelector('.request-email').href;
    assert.equal(new URL(mail).searchParams.get('body'), d.querySelector('#request-text').value);
    d.querySelector('.request-copy').click();
    await new Promise(resolve => setTimeout(resolve, 20));
    const status = d.querySelector('#request-status').textContent;
    assert.match(status, clipboard ? /^Kopiert\./ : /nicht möglich/);
    if (clipboard) assert.equal(f.copied(), d.querySelector('#request-text').value);
    else assert.equal(d.activeElement.id, 'request-text');
    assert.equal(f.window.location.href, 'https://gerberxnails.de/');
    dialog.close();
    assert.deepEqual(f.errors, []);
  } finally { await f.close(); }
});

test('deep links are retained and radio controls support arrow keys', async () => {
  const f = fixture({ hash: '#preise' }), d = f.document;
  try {
    assert.equal(f.window.location.hash, '#preise');
    const first = d.querySelector('[data-len="40"]'); first.focus();
    first.dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const next = d.querySelector('[data-len="45"]');
    assert.equal(next.getAttribute('aria-checked'), 'true');
    assert.equal(next.tabIndex, 0);
    assert.equal(d.activeElement, next);
    assert.deepEqual(f.errors, []);
  } finally { await f.close(); }
});

test('no-script content, local assets, skip link and script order', async () => {
  const w = new Window({ settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  try {
    w.document.write(read('index.html'));
    assert.equal(w.document.querySelector('script:not([src])'), null);
    assert.equal(w.document.querySelector('#loader'), null);
    const skip = w.document.querySelector('.skip-link');
    assert.ok(w.document.querySelector(skip.getAttribute('href')));
    const scripts = [...w.document.querySelectorAll('script[src]')].map(x => x.getAttribute('src').split('?')[0]);
    assert.deepEqual(scripts, ['js/requests.js', 'js/main.js']);
    for (const path of ['index.html', 'impressum.html', 'datenschutz.html', 'widerruf.html', '404.html']) {
      const html = read(path);
      const page = new w.DOMParser().parseFromString(html, 'text/html');
      for (const element of page.querySelectorAll('[href], [src]')) {
        const link = (element.getAttribute('href') || element.getAttribute('src')).split(/[?#]/)[0];
        if (!link || /^[a-z]+:|^\/\//i.test(link) || link === './') continue;
        assert.ok(fs.existsSync(new URL(link, root)), path + ': ' + link);
      }
    }
    assert.doesNotMatch(read('css/style.css'), /:where\(\.js\) \.rv/);
  } finally { await w.happyDOM.abort(); }
});
