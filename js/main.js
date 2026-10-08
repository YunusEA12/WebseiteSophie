/**
 * gerberxnails: Modern Editorial Nail Design Studio
 * Core JavaScript & Interactive Modules
 */

(function () {
  'use strict';

  var startHash = window.location.hash;

  // Environment & Accessibility detection
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // restart a short CSS animation on an element
  function pop(el) {
    if (!el || reduce) return;
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
  }
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Initialize dynamic copyright year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     1. DIALOG SHEETS (Studio Policy)
     There is no consent banner: nothing on this site needs consent. Imprint
     and privacy policy are their own pages so they work without script.
     ========================================================================== */
  function initDialogs() {
    // Open/close sheets via data attributes
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-open]');
      if (opener) {
        var dlg = document.getElementById(opener.getAttribute('data-open'));
        if (dlg && typeof dlg.showModal === 'function') {
          dlg.showModal();
        } else if (dlg) {
          dlg.setAttribute('open', '');
        }
        return;
      }

      var closer = e.target.closest('[data-close]');
      if (closer) {
        var d = closer.closest('dialog');
        if (d) d.close();
      }
    });

    // Click on dialog backdrop closes the sheet
    document.querySelectorAll('dialog.sheet').forEach(function (d) {
      d.addEventListener('click', function (e) {
        if (e.target === d) d.close();
      });
    });

    // a link to .../#agb opens the rules right away; Sophie sends it with every booking
    if (startHash === '#agb' || startHash === '#widerruf') {
      var rules = document.getElementById('dlg-policy');
      if (rules && typeof rules.showModal === 'function') {
        rules.showModal();
        var part = startHash === '#widerruf' && document.getElementById('widerruf');
        if (part) part.scrollIntoView();
      }
    }
  }

  /* ==========================================================================
     2. MOBILE NAVIGATION OVERLAY & BURGER BUTTON
     ========================================================================== */
  function initMobileMenu() {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('menu');
    if (!burger || !menu) return;

    var open = false;
    function set(next) {
      var was = open;
      open = next;
      menu.classList.toggle('open', open);
      menu.inert = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      document.body.style.overflow = open ? 'hidden' : '';
      // keyboard and screen reader users land inside the menu, and back on
      // the burger when it closes
      if (open && !was) {
        var first = menu.querySelector('.menu-link');
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
      } else if (!open && was && menu.contains(document.activeElement)) {
        burger.focus({ preventScroll: true });
      }
    }

    // Tab stays inside the open menu instead of wandering behind the overlay
    menu.addEventListener('keydown', function (e) {
      if (!open || e.key !== 'Tab') return;
      var items = [].slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      set(!open);
    });

    var closeBtn = document.getElementById('menu-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        set(false);
      });
    }

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') || e.target === menu) {
        set(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) {
        set(false);
        burger.focus();
      }
    });
  }

  /* ==========================================================================
     3. TYPOGRAPHY SPLIT & SCROLL REVEAL
     ========================================================================== */
  function initTextReveal() {
    // Effects enhance visible content; a failed script must not hide the page.
    // 3.1 Split headlines into maskable words
    document.querySelectorAll('[data-split]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach(function (w, i) {
        var span = document.createElement('span');
        span.className = 'rv-word';
        var inner = document.createElement('i');
        inner.textContent = w;
        inner.style.transitionDelay = (i * 0.045) + 's';
        span.appendChild(inner);
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
    });

    // 3.2 Reveal on scroll via IntersectionObserver
    var groups = document.querySelectorAll('.js-rv');
    function revealAll() {
      groups.forEach(function (g) { g.classList.add('is-in'); });
    }
    window.__revealAll = revealAll;

    if (reduce || !('IntersectionObserver' in window)) {
      revealAll();
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

      groups.forEach(function (g) { io.observe(g); });
    }
  }

  /* ==========================================================================
     HERO SLIDESHOW
     ========================================================================== */
  function initHeroShow() {
    var box = document.getElementById('heroShow');
    if (!box) return;
    var slides = [].slice.call(box.querySelectorAll('.hero-slide'));

    /* Am Desktop steht das Hochformat in einem Rahmen, links und rechts bliebe
       sonst tote Flaeche. Eine unscharfe Kopie desselben Bildes fuellt sie und
       traegt die Stimmung der Aufnahme in die Breite. */
    var backdrop = null;
    var backdropImgs = [];
    var sec = document.getElementById('showcase');
    if (sec && slides.length) {
      backdrop = document.createElement('div');
      backdrop.className = 'showcase-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      slides.forEach(function (im, i) {
        var c = document.createElement('img');
        c.src = im.getAttribute('src');
        c.alt = '';
        c.loading = 'lazy';
        c.decoding = 'async';
        if (i === 0) c.className = 'is-on';
        backdrop.appendChild(c);
        backdropImgs.push(c);
      });
      sec.insertBefore(backdrop, sec.firstChild);
    }
    var caps = [].slice.call(box.querySelectorAll('.hero-cap'));
    var dots = [].slice.call(box.querySelectorAll('.hero-dot'));
    if (slides.length < 2) return;
    var at = 0, timer, held = false, paused = reduce, visible = true;

    function go(n) {
      at = (n + slides.length) % slides.length;
      slides.forEach(function (el, i) { el.classList.toggle('is-on', i === at); });
      caps.forEach(function (el, i) { el.classList.toggle('is-on', i === at); });
      dots.forEach(function (el, i) { el.classList.toggle('is-on', i === at); });
      backdropImgs.forEach(function (el, i) { el.classList.toggle('is-on', i === at); });
    }

    function play() {
      if (paused || held || !visible || document.hidden) return;
      clearInterval(timer);
      timer = setInterval(function () { go(at + 1); }, 4200);
    }

    var pause = document.createElement('button');
    pause.type = 'button';
    pause.className = 'slideshow-pause';
    function labelPause() {
      pause.textContent = paused ? 'Slideshow starten' : 'Slideshow pausieren';
      pause.setAttribute('aria-label', pause.textContent);
    }
    labelPause();
    box.appendChild(pause);
    pause.addEventListener('click', function () {
      paused = !paused;
      labelPause();
      clearInterval(timer);
      play();
    });
    document.addEventListener('visibilitychange', function () {
      clearInterval(timer);
      play();
    });

    // A mouse resting on the picture or keyboard focus on the dots keeps it
    // still. Only a real pointer and visible focus count: a tap fires the same
    // events on a phone and would freeze the show until the next tap elsewhere.
    function hold(on) {
      held = on;
      if (on) clearInterval(timer); else play();
    }
    if (fine) {
      box.addEventListener('mouseenter', function () { hold(true); });
      box.addEventListener('mouseleave', function () { hold(false); });
    }
    box.addEventListener('focusin', function (e) {
      try { if (e.target.matches(':focus-visible')) hold(true); } catch (err) {}
    });
    box.addEventListener('focusout', function (e) {
      if (held && !box.contains(e.relatedTarget)) hold(false);
    });

    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(+d.getAttribute('data-go')); play(); });
    });

    // a swipe moves the card along
    var sx = null;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { go(at + (dx < 0 ? 1 : -1)); play(); }
      sx = null;
    }, { passive: true });

    // pause while the card is off screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { visible = e.isIntersecting; clearInterval(timer); play(); });
      }, { threshold: .2 }).observe(box);
    }
    play();
  }

  /* ==========================================================================
     LIGHTBOX FOR THE PORTFOLIO
     ========================================================================== */
  function initLightbox() {
    var tiles = [].slice.call(document.querySelectorAll('.tile[data-view]'));
    if (!tiles.length) return;

    var box = document.createElement('div');
    box.id = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Arbeit in groß');
    box.innerHTML =
      '<button type="button" id="lbClose" aria-label="Schließen">&times;</button>' +
      '<button type="button" id="lbPrev" aria-label="Vorheriges Bild">&#8249;</button>' +
      '<button type="button" id="lbNext" aria-label="Nächstes Bild">&#8250;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(box);

    var img = box.querySelector('img');
    var cap = box.querySelector('figcaption');
    var at = 0, lastFocus = null;

    function show(i) {
      at = (i + tiles.length) % tiles.length;
      var t = tiles[at];
      var src = t.querySelector('img');
      var title = t.querySelector('.media-cap > span');
      var sub = t.querySelectorAll('.media-cap > span')[1];
      img.src = src.getAttribute('data-full') || src.getAttribute('src');
      img.alt = src.getAttribute('alt') || '';
      cap.textContent = '';
      var strong = document.createElement('b');
      strong.textContent = title ? title.textContent : '';
      cap.appendChild(strong);
      cap.appendChild(document.createTextNode(sub ? sub.textContent : ''));
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add('on');
      document.body.style.overflow = 'hidden';
      document.getElementById('lbClose').focus();
    }

    function close() {
      box.classList.remove('on');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    tiles.forEach(function (t, i) {
      t.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });

    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', function () { show(at - 1); });
    document.getElementById('lbNext').addEventListener('click', function () { show(at + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
      // keep Tab on the three controls while the picture is open
      if (e.key === 'Tab') {
        var ctrls = [].slice.call(box.querySelectorAll('button'));
        var i = ctrls.indexOf(document.activeElement);
        e.preventDefault();
        ctrls[(i + (e.shiftKey ? -1 : 1) + ctrls.length) % ctrls.length].focus();
      }
    });

    var sx = null;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) show(at + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  /* ==========================================================================
     SHARED: COPY A REQUEST
     The preview lets visitors copy explicitly and choose a contact channel.
     ========================================================================== */
  var DM = 'https://ig.me/m/gerberxnails';   // opens the chat, not just the profile

  // resolves true when the text is on the clipboard
  function copyText(txt) {
    function legacy() {
      var focused = document.activeElement;
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      if (focused && focused.isConnected) focused.focus({ preventScroll: true });
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(txt).then(function () { return true; }, legacy);
    }
    return Promise.resolve(legacy());
  }


  // Filled in by the calculator once it runs.
  var Calc = {
    request: null,   // () -> the full request text for the chosen set
    chosenSet: null  // () -> lines describing the set, or null if untouched
  };

  /* ==========================================================================
     10. DYNAMIC PRICE CONFIGURATOR
     The price list has ranges (S 35-40 EUR, Level 1 +5-10 EUR) and open-ended
     extras (charms "ab +1 EUR"). Every option carries "min-max" or a single
     number; the total shows as a range, or as "ab ..." once an open-ended
     extra is in the set.
     ========================================================================== */
  function initPriceCalculator() {
    var totalEl = document.getElementById('total');
    var preEl = document.getElementById('total-pre');
    var ctaEl = document.getElementById('cta-label');
    if (!totalEl || !ctaEl) return;

    var touched = false;

    // "35-40" -> [35, 40], "45" -> [45, 45]
    function range(v) {
      var p = String(v || '0').split('-');
      var lo = +p[0] || 0;
      return [lo, p.length > 1 ? (+p[1] || lo) : lo];
    }

    function euro(r, open) {
      if (open) return 'ab ' + r[0] + ' €';
      return (r[0] === r[1] ? r[0] : r[0] + ' bis ' + r[1]) + ' €';
    }

    function pressed(el) { return !!el && el.getAttribute('aria-pressed') === 'true'; }

    // charms and 3D models come in pieces (1 to 10): picked, a stepper
    // opens below the field, and the field shows what they add up to
    function qtyOf(b) { return +b.getAttribute('data-qty') || 1; }

    function setQty(b, n) {
      var max = +b.getAttribute('data-max') || 1;
      n = Math.max(1, Math.min(max, n));
      b.setAttribute('data-qty', n);
      var wrap = b.closest('.opt-qty');
      if (!wrap) return;
      var on = pressed(b);
      wrap.classList.toggle('is-on', on);
      wrap.querySelector('.qty').hidden = !on;
      wrap.querySelector('.qty-n').textContent = n;
      wrap.querySelector('[data-step="-1"]').setAttribute('aria-disabled', n <= 1 ? 'true' : 'false');
      wrap.querySelector('[data-step="1"]').setAttribute('aria-disabled', n >= max ? 'true' : 'false');
      b.querySelector('.t-display').textContent = 'ab +' + range(b.getAttribute('data-extra'))[1] * n + '\u2009€';
    }

    function name(el) {
      return el ? el.querySelector('span').childNodes[0].textContent.trim() : '';
    }

    function state() {
      var soloBtn = document.querySelector('[data-solo]');
      if (pressed(soloBtn)) {
        var sr = range(soloBtn.getAttribute('data-solo'));
        return { solo: true, items: [{ kind: 'Soak Off', name: 'Soak Off ohne neues Set', r: sr, open: false }],
                 min: sr[0], max: sr[1], open: false };
      }

      var items = [];
      var len = document.querySelector('[data-len][aria-checked="true"]');
      var lvl = document.querySelector('[data-lvl][aria-checked="true"]');
      if (len) {
        var size = len.querySelector('.opt-size');
        items.push({ kind: 'Länge', name: name(len) + (size ? ' (' + size.textContent.replace(/[^A-Z]/g, '') + ')' : ''),
                     r: range(len.getAttribute('data-len')), open: false, note: ' · inkl. russischer Maniküre' });
      }
      if (lvl) items.push({ kind: 'Design', name: name(lvl), r: range(lvl.getAttribute('data-lvl')), open: false });
      document.querySelectorAll('[data-add]').forEach(function (b) {
        if (pressed(b)) items.push({ kind: 'Zusatz', name: name(b), r: range(b.getAttribute('data-add')), open: false });
      });
      document.querySelectorAll('[data-extra]').forEach(function (b) {
        if (!pressed(b)) return;
        var n = qtyOf(b), r = range(b.getAttribute('data-extra'));
        items.push({ kind: 'Extra', name: name(b) + (b.hasAttribute('data-max') ? ' (' + n + ' Stück)' : ''),
                     r: [r[0] * n, r[1] * n], open: true });
      });

      // A range in a price list ("35-40") counts with its upper price: one
      // clear figure, and the visitor never pays more than what was shown.
      items.forEach(function (it) { it.r = [it.r[1], it.r[1]]; });
      var min = 0, max = 0, open = false;
      items.forEach(function (it) { min += it.r[0]; max += it.r[1]; open = open || it.open; });
      return { solo: false, items: items, min: min, max: max, open: open };
    }

    var shown = null, rollId = null;

    function paint(a, b, open) {
      a = Math.round(a); b = Math.round(b);
      totalEl.textContent = (open || a === b) ? String(a) : a + ' bis ' + b;
    }

    function render() {
      var s = state();

      if (preEl) preEl.hidden = !s.open;
      ctaEl.textContent = (s.solo ? 'Soak Off' : 'Set') + (s.open ? ' ' : ' für ') +
                          euro([s.min, s.max], s.open) + ' anfragen';

      // short ease-out count toward the new figures
      var target = [s.min, s.max];
      if (rollId) { cancelAnimationFrame(rollId); rollId = null; }
      if (reduce || !shown) {
        shown = target;
        paint(target[0], target[1], s.open);
        return;
      }
      var from = shown.slice();
      if (from[0] !== target[0] || from[1] !== target[1]) pop(totalEl);
      var t0 = performance.now();
      (function roll(now) {
        var p = Math.min(1, ((now || performance.now()) - t0) / 200);
        var e = 1 - Math.pow(1 - p, 3);
        shown = [from[0] + (target[0] - from[0]) * e, from[1] + (target[1] - from[1]) * e];
        paint(shown[0], shown[1], s.open);
        if (p < 1) rollId = requestAnimationFrame(roll);
        else { shown = target; rollId = null; }
      })(t0);
    }

    function setLines(s) {
      if (s.solo) return ['• Nur Soak Off, ohne neues Set (' + euro([s.min, s.max]) + ')'];
      var out = s.items.map(function (it) {
        return '• ' + it.kind + ': ' + it.name + ' · ' + euro(it.r, it.open);
      });
      out.push('• Russische Maniküre: inklusive');
      out.push('• Preis laut Rechner: ' + euro([s.min, s.max], s.open));
      return out;
    }

    function buildInquiryText(s) {
      if (s.solo) {
        return 'Hi Sophie! 💅 Ich möchte gerne einen Termin für reines Soak Off (Ablösen ohne neues Set, ' +
               euro([s.min, s.max]) + ') anfragen. Wann hättest du Zeit?';
      }
      return ['Hi Sophie! 💅 Ich habe mir auf deiner Website mein Wunsch-Set zusammengestellt:']
        .concat(setLines(s), ['', 'Welche Termine hast du demnächst frei?'])
        .join('\n');
    }

    Calc.request = function () { return buildInquiryText(state()); };
    // only a set the visitor actually put together is worth quoting
    Calc.chosenSet = function () { return touched ? setLines(state()) : null; };

    function setSoloVisual(on) {
      document.querySelectorAll('[data-len],[data-lvl],[data-add],[data-extra],.qty-btn').forEach(function (b) {
        b.disabled = on;
        b.style.opacity = on ? '.35' : '';
        b.style.pointerEvents = on ? 'none' : '';
      });
    }

    document.querySelectorAll('[data-len],[data-lvl]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var attr = btn.hasAttribute('data-len') ? 'data-len' : 'data-lvl';
        document.querySelectorAll('[' + attr + ']').forEach(function (b) {
          b.setAttribute('aria-checked', 'false');
        });
        btn.setAttribute('aria-checked', 'true');
        touched = true;
        render();
      });
    });

    /* A radiogroup is one tab stop; the arrow keys move between its options
       and select them, as screen readers announce it. */
    function syncTabStops() {
      document.querySelectorAll('[role="radiogroup"]').forEach(function (g) {
        g.querySelectorAll('[role="radio"]').forEach(function (r) {
          r.tabIndex = r.getAttribute('aria-checked') === 'true' ? 0 : -1;
        });
      });
    }
    document.querySelectorAll('[role="radiogroup"]').forEach(function (g) {
      g.addEventListener('keydown', function (e) {
        var step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        var radios = [].slice.call(g.querySelectorAll('[role="radio"]:not([disabled])'));
        var i = radios.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        var next = radios[(i + step + radios.length) % radios.length];
        next.click();
        next.focus();
      });
      g.addEventListener('click', syncTabStops);
    });
    syncTabStops();

    var calcSec = document.getElementById('preise');
    if (calcSec && !reduce) {
      calcSec.addEventListener('pointerdown', function (e) {
        var o = e.target.closest('.opt');
        if (!o || o.disabled) return;
        var r = o.getBoundingClientRect();
        var size = Math.max(r.width, r.height) * 2.2;
        var dot = document.createElement('span');
        dot.className = 'opt-ripple';
        dot.setAttribute('aria-hidden', 'true');
        dot.style.width = dot.style.height = size + 'px';
        dot.style.left = (e.clientX - r.left - size / 2) + 'px';
        dot.style.top = (e.clientY - r.top - size / 2) + 'px';
        o.appendChild(dot);
        setTimeout(function () { if (dot.parentNode) dot.parentNode.removeChild(dot); }, 700);
      });
      // Run after the field has updated.
      calcSec.addEventListener('click', function (e) {
        var o = e.target.closest('.opt');
        if (o && !o.disabled) { pop(o);  }
      });
    }

    document.querySelectorAll('[data-add],[data-extra]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.setAttribute('aria-pressed', pressed(btn) ? 'false' : 'true');
        if (btn.hasAttribute('data-max')) {
          setQty(btn, 1);
          if (pressed(btn)) revealQty(btn.closest('.opt-qty'));
        }
        touched = true;
        render();
      });
    });

    // a stepper that opens under the floating line or the price bar
    // scrolls up just far enough to be seen
    function revealQty(wrap) {
      var box = wrap && wrap.querySelector('.qty');
      if (!box) return;
      var limit = innerHeight;
      ['pricebar'].forEach(function (id) {
        var o = document.getElementById(id);
        if (o && o.classList.contains('on') && !o.classList.contains('away')) {
          limit = Math.min(limit, o.getBoundingClientRect().top);
        }
      });
      // the wrapper, not the box: the box is still mid-animation
      var over = wrap.getBoundingClientRect().bottom - (limit - 10);
      if (over > 0) window.scrollBy({ top: over, behavior: reduce ? 'auto' : 'smooth' });
    }

    document.querySelectorAll('.opt-qty').forEach(function (wrap) {
      var b = wrap.querySelector('.opt');
      wrap.querySelectorAll('.qty-btn').forEach(function (q) {
        q.addEventListener('click', function () {
          var n = qtyOf(b) + (+q.getAttribute('data-step'));
          if (!pressed(b) || n < 1 || n > (+b.getAttribute('data-max') || 1)) return;
          setQty(b, n);
          touched = true;
          render();
          pop(wrap.querySelector('.qty-val'));
          pop(b.querySelector('.t-display'));

        });
      });
    });

    var soloBtn = document.querySelector('[data-solo]');
    if (soloBtn) {
      soloBtn.addEventListener('click', function () {
        var on = !pressed(this);
        this.setAttribute('aria-pressed', on ? 'true' : 'false');
        setSoloVisual(on);
        touched = true;
        render();
      });
    }

    render();
  }

  function initRequests() {
    if (!window.GerberRequests) return;
    window.GerberRequests.init({
      copy: copyText,
      message: function (kind) {
        if (Calc.request && (kind === 'set' || (Calc.chosenSet && Calc.chosenSet()))) {
          return Calc.request();
        }
        return 'Hi Sophie! 💅 Ich würde gerne einen Termin bei dir anfragen. Wann hättest du Zeit?';
      }
    });
  }

  /* Studio-Regeln: am Handy kurze Zeilen zum Aufklappen, am Computer stehen
     alle vier offen nebeneinander und lassen sich nicht zuklappen. */
  function initRules() {
    var rules = [].slice.call(document.querySelectorAll('details.pol'));
    if (!rules.length) return;
    var desk = window.matchMedia('(min-width: 1024px)');

    function sync() {
      rules.forEach(function (d) {
        d.open = desk.matches;
        d.querySelector('summary').tabIndex = desk.matches ? -1 : 0;
      });
    }

    rules.forEach(function (d) {
      d.querySelector('summary').addEventListener('click', function (e) {
        if (desk.matches) e.preventDefault();
      });
    });

    sync();
    if (desk.addEventListener) desk.addEventListener('change', sync);
    else if (desk.addListener) desk.addListener(sync);
  }

  /* ==========================================================================
     INITIALIZATION ON DOM CONTENT LOADED
     ========================================================================== */
  /* The bar stays out of the way over the hero and only takes on a surface
     once the page has moved - the opening screen belongs to the brand. */
  function initHeaderState() {
    var head = document.querySelector('header');
    if (!head) return;
    var on = false;
    function check() {
      var should = window.scrollY > 40;
      if (should !== on) { on = should; head.classList.toggle('is-stuck', on); }
    }
    addEventListener('scroll', check, { passive: true });
    check();
  }

  /* Traegt den Preis mit, solange der Rechner im Bild ist - sonst sieht man
     beim Auswaehlen nie, was sich gerade aendert. Am Handy ersetzt sie die
     Preiskarte ganz, damit Preis und Knopf nicht doppelt stehen. */
  function initPriceBar() {
    var sec = document.getElementById('preise');
    var total = document.getElementById('total');
    if (!sec || !total) return;

    var bar = document.createElement('div');
    bar.id = 'pricebar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Dein Preis');
    bar.innerHTML =
      '<div class="inner">' +
        '<div><div class="lbl">Dein Preis</div><div class="amount" aria-live="polite" aria-atomic="true"><b id="pb-total"></b> <span>&euro;</span></div></div>' +
        '<a href="' + DM + '" target="_blank" rel="noopener noreferrer" data-send="set" ' +
        'class="btn btn-solid px-5 py-2.5 text-[.85rem] flex-col !gap-0.5"><span id="pb-cta">Set anfragen</span>' +
        '<span class="btn-sub">Nachricht ansehen</span></a>' +
      '</div>';
    document.body.appendChild(bar);

    var pbTotal = bar.querySelector('#pb-total');
    var pre = document.getElementById('total-pre');
    var popT = null, popped = null;
    function sync() {
      pbTotal.textContent = (pre && !pre.hidden ? 'ab ' : '') + total.textContent.trim();
      var solo = document.querySelector('[data-solo][aria-pressed="true"]');
      bar.querySelector('#pb-cta').textContent = solo ? 'Soak Off anfragen' : 'Set anfragen';
      clearTimeout(popT);
      popT = setTimeout(function () {
        if (popped !== null && popped !== pbTotal.textContent) pop(pbTotal);
        popped = pbTotal.textContent;
      }, 240);
    }
    sync();
    new MutationObserver(sync).observe(total.parentNode, { childList: true, characterData: true, subtree: true, attributes: true });

    function show(on) {
      bar.classList.toggle('on', on);
      bar.inert = !on;
      bar.setAttribute('aria-hidden', String(!on));
    }
    show(false);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { show(e.isIntersecting); });
      }, { threshold: 0, rootMargin: '-15% 0px -15% 0px' }).observe(sec);
    }
  }

  /* Am Desktop steht die Slideshow besser unten bei "Let's do your nails",
     wo sie das feste Bild ersetzt. Auf dem Handy bleibt sie oben, wo sie
     randlos wirkt. Der Knoten wandert, statt ihn doppelt anzulegen - so
     laeuft dieselbe Slideshow weiter, ohne Zustand zu verlieren. */
  function initShowcasePlacement() {
    var sec = document.getElementById('showcase');
    var home = document.getElementById('showcaseHome');
    var slot = document.getElementById('kontaktShow');
    var still = document.getElementById('kontaktStill');
    if (!sec || !home || !slot) return;

    function place() {
      var desktop = window.matchMedia('(min-width: 1024px)').matches;
      if (desktop) {
        if (sec.parentElement !== slot) slot.appendChild(sec);
        if (still) still.style.display = 'none';
      } else {
        if (sec.previousElementSibling !== home) {
          home.parentNode.insertBefore(sec, home.nextSibling);
        }
        if (still) still.style.display = '';
      }
    }

    place();
    var t;
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(place, 200); });
  }

  function initAll() {
    // Each feature is started on its own. If one throws, the rest still come up.
    function start(name, fn) {
      try { fn(); }
      catch (err) { if (window.console) console.error('[gerberxnails] ' + name + ':', err); }
    }
    [
      ['Header', initHeaderState],
      ['Dialoge', initDialogs], ['Menue', initMobileMenu],
      ['TextReveal', initTextReveal],
      ['HeroShow', initHeroShow], ['ShowcaseOrt', initShowcasePlacement], ['Lightbox', initLightbox],
      ['Rechner', initPriceCalculator], ['Preisleiste', initPriceBar],
      ['Regeln', initRules], ['Anfragen', initRequests]
    ]
     .forEach(function (pair) { start(pair[0], pair[1]); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
