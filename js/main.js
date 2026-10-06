/**
 * gerberxnails: Modern Editorial Nail Design Studio
 * Core JavaScript & Interactive Modules
 */

(function () {
  'use strict';

  /* Always start at the top on fresh load & reload. Prevent lingering hash from jumping to calculator */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var startHash = window.location.hash;
  if (window.location.hash) {
    try {
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
    } catch (e) {}
  }
  window.scrollTo(0, 0);
  window.addEventListener('load', function () {
    setTimeout(function () { window.scrollTo(0, 0); }, 40);
  });
  addEventListener('beforeunload', function () { window.scrollTo(0, 0); });

  // Intercept anchor clicks so hash doesn't get stuck in the address bar
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

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

  /* The vine and the drifting petals live at z-index -1, and the body
     background covers them completely: nobody has seen them in the current
     design, yet both redrew every frame on every device. They stay off until
     they get a place in the layout again. To bring them back, set this to
     true and remove the "#vine, #petals { display: none }" rule in style.css
     (and give them a stacking position above the body background). */
  var SHOW_VINE_AND_PETALS = false;

  /* ------------------------------------------------------------------
     Shared input. On a desktop this follows the mouse. On a phone there is
     no hover, so it follows the finger, and when nothing is being touched
     it drifts with how fast the page is scrolling.

     The gyroscope used to feed in here too. iPhones answered that with a
     permission prompt for motion sensors, and Android read the sensor
     without asking - neither is acceptable for a decorative effect, so the
     page no longer touches device sensors at all.
     ------------------------------------------------------------------ */
  var Input = (function () {
    var x = -9999, y = -9999;      // viewport coords, -9999 = no input
    var active = false;
    var scrollV = 0;               // smoothed scroll velocity in px/frame
    var lastY = window.scrollY;
    var idleT = 0;

    function set(cx, cy) { x = cx; y = cy; active = true; }
    function clear() { x = -9999; y = -9999; active = false; }

    addEventListener('mousemove', function (e) { set(e.clientX, e.clientY); }, { passive: true });
    addEventListener('mouseleave', clear, { passive: true });

    // a finger counts as the pointer; passive so scrolling is never held up
    function fromTouch(e) {
      if (!e.touches || !e.touches.length) return;
      set(e.touches[0].clientX, e.touches[0].clientY);
      idleT = 0;
    }
    addEventListener('touchstart', fromTouch, { passive: true });
    addEventListener('touchmove', fromTouch, { passive: true });
    addEventListener('touchend', function () { idleT = 0; }, { passive: true });

    addEventListener('scroll', function () {
      var d = window.scrollY - lastY;
      lastY = window.scrollY;
      scrollV = scrollV * 0.8 + d * 0.2;
      idleT = 0;
    }, { passive: true });

    return {
      // where the interaction is, in viewport coords
      get x() { return x; },
      get y() { return y; },
      get active() { return active; },
      get scrollV() { return scrollV; },
      // called once per frame by the animation loops
      tick: function () {
        scrollV *= 0.94;
        if (active && !fine) {
          // a finger lifts off without a mouseleave, so let it fade out
          idleT += 1;
          if (idleT > 90) clear();
        }
      }
    };
  })();
  var lerp = function (a, b, n) { return a + (b - a) * n; };

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
     4. PRELOADER: PETALS OPEN SYNCHRONOUSLY WITH PROGRESS
     ========================================================================== */
  function initPreloader() {
    var loader = document.getElementById('loader');
    var flower = document.getElementById('loadflower');
    var count = document.getElementById('count');
    var ring = document.getElementById('ring');
    if (!loader || !flower || !count || !ring) return;

    var petals = [].slice.call(flower.querySelectorAll('.lp'));
    var CIRC = 829.4;
    var pct = 0;

    var tick = setInterval(function () {
      pct = Math.min(100, pct + Math.random() * 11 + 4);
      count.textContent = String(Math.floor(pct)).padStart(3, '0');
      ring.setAttribute('stroke-dashoffset', CIRC * (1 - pct / 100));

      // One petal per 20% of the load
      var due = Math.floor(pct / 20);
      for (var i = 0; i < petals.length; i++) {
        if (i < due) petals[i].classList.add('on');
      }

      if (pct >= 100) {
        clearInterval(tick);
        petals.forEach(function (p) { p.classList.add('on'); });
        flower.classList.add('bloomed');
        setTimeout(function () {
          loader.classList.add('done');
        }, reduce ? 60 : 480);
      }
    }, reduce ? 18 : 75);
  }

  /* ==========================================================================
     5. CUSTOM CURSOR & MAGNETIC TARGETS
     ========================================================================== */
  function initCustomCursor() {
    if (!fine || reduce) return;

    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    // the ring is only shown once something moves it; otherwise it sat as a
    // quarter circle in the top left corner
    document.documentElement.classList.add('has-cursor');

    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
    });

    addEventListener('mouseleave', function () {
      document.body.classList.add('cur-hide');
    });

    addEventListener('mouseenter', function () {
      document.body.classList.remove('cur-hide');
    });

    document.querySelectorAll('a, button, .opt').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        document.body.classList.add(el.hasAttribute('data-view') ? 'cur-view' : 'cur-link');
      });
      el.addEventListener('mouseleave', function () {
        document.body.classList.remove('cur-link', 'cur-view');
      });
    });

    // Magnetic pull for interactive buttons
    var mags = [].slice.call(document.querySelectorAll('[data-mag]'));
    mags.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate3d(' + dx * 0.28 + 'px,' + dy * 0.4 + 'px,0)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });

    (function frame() {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(frame);
    })();
  }

  /* ==========================================================================
     7. SCROLL-DRIVEN MARQUEE & TILE PARALLAX
     ========================================================================== */
  function initMarqueeAndParallax() {
    if (reduce) return;

    var marq = document.getElementById('marq');
    var tiles = [].slice.call(document.querySelectorAll('[data-par]'));
    var last = scrollY, offset = 0, vel = 0;

    (function sframe() {
      var y = scrollY;
      vel = lerp(vel, y - last, 0.12);
      last = y;

      // Marquee drifts on its own and accelerates dynamically with scroll speed
      if (marq) {
        offset -= 0.55 + vel * 0.22;
        var half = marq.scrollWidth / 2;
        if (half > 0) {
          if (offset <= -half) offset += half;
          if (offset > 0) offset -= half;
          marq.style.transform = 'translate3d(' + offset.toFixed(2) + 'px,0,0)';
        }
      }

      // Portfolio tiles drift at their own pace inside the viewport
      var vh = innerHeight;
      // On a narrow screen the offset only makes the two columns look ragged,
      // and it costs a transform per tile per frame.
      if (document.documentElement.clientWidth < 760) {
        tiles.forEach(function (t) { if (t.style.transform) t.style.transform = ''; });
      } else
      tiles.forEach(function (t) {
        var r = t.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var mid = (r.top + r.height / 2 - vh / 2) / vh;
        t.style.transform = 'translate3d(0,' + (mid * parseFloat(t.getAttribute('data-par'))).toFixed(2) + 'px,0)';
      });

      requestAnimationFrame(sframe);
    })();
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
    var at = 0, timer, held = false;

    function go(n) {
      at = (n + slides.length) % slides.length;
      slides.forEach(function (el, i) { el.classList.toggle('is-on', i === at); });
      caps.forEach(function (el, i) { el.classList.toggle('is-on', i === at); });
      dots.forEach(function (el, i) { el.classList.toggle('is-on', i === at); });
      backdropImgs.forEach(function (el, i) { el.classList.toggle('is-on', i === at); });
    }

    function play() {
      if (reduce || held) return;
      clearInterval(timer);
      timer = setInterval(function () { go(at + 1); }, 4200);
    }

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
        es.forEach(function (e) { if (e.isIntersecting) play(); else clearInterval(timer); });
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
     8. THE LIVING VINE: ORGANIC SVG LAYER SPANNING FULL PAGE
     ========================================================================== */
  function initLivingVine() {
    var svg = document.getElementById('vine');
    if (!svg) return;

    var NS = 'http://www.w3.org/2000/svg';
    var NODES = 22;                                            // control points down the page
    var BLOOM_AT = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];    // nodes carrying a hibiscus
    var W = 0, H = 0, VH = 0;
    var pts = [], cur = [], blooms = [];
    var path, glow;

    /* The curve is still described in document coordinates, but the SVG itself only
       covers the viewport. Every frame we emit just the part of it that is on screen,
       shifted up by the scroll offset. The browser then repaints one screen instead
       of the whole 7000px page, which is the difference between 33 and 55 fps on a
       phone. */
    function build() {
      W = document.documentElement.clientWidth;
      VH = window.innerHeight;

      // The vine was switched off here while it still repainted the whole page
      // every frame. It now draws only the slice on screen, so a phone can carry
      // it again - and without it the mobile page felt static.
      svg.style.display = '';

      // measure the page with the vine hidden so it cannot inflate its own height
      var prevDisplay = svg.style.display;
      svg.style.display = 'none';
      H = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      svg.style.display = prevDisplay;

      svg.setAttribute('width', W);
      svg.setAttribute('height', VH);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + VH);
      svg.style.height = VH + 'px';
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      pts = [];
      for (var i = 0; i < NODES; i++) {
        var t = i / (NODES - 1);
        var amp = W * (W < 760 ? 0.30 : 0.26);
        var x = W * 0.5 + Math.sin(t * Math.PI * 3.1) * amp + Math.sin(t * Math.PI * 7.3) * amp * 0.22;
        pts.push({ bx: x, by: t * H });
      }
      cur = pts.map(function (q) { return { x: q.bx, y: q.by }; });

      // the soft halo doubles the paint cost; a phone does without it
      if (fine) {
        glow = document.createElementNS(NS, 'path');
        glow.setAttribute('fill', 'none');
        glow.setAttribute('stroke', 'url(#gVine)');
        glow.setAttribute('stroke-width', 16);
        glow.setAttribute('stroke-linecap', 'round');
        glow.setAttribute('opacity', '.28');
        svg.appendChild(glow);
      } else {
        glow = null;
      }

      path = document.createElementNS(NS, 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'url(#gVine)');
      path.setAttribute('stroke-width', W < 760 ? 3.4 : 3.2);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '.85');
      svg.appendChild(path);

      blooms = BLOOM_AT.map(function (idx, k) {
        var g = document.createElementNS(NS, 'g');
        var use = document.createElementNS(NS, 'use');
        use.setAttribute('href', '#bloom');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#bloom');
        g.appendChild(use);
        g.style.setProperty('--pf', k % 2 ? 'url(#gAqua)' : 'url(#gPink)');
        g.style.setProperty('--pc', k % 2 ? '#4A2E0F' : '#3A0A1E');
        g.setAttribute('opacity', '0');
        svg.appendChild(g);
        return { idx: idx, el: g, seed: k * 1.7, scale: 0, spin: 0, shown: false };
      });
    }

    // catmull-rom through the points, already converted to viewport space
    function toPath(list, off) {
      var out = 'M' + list[0].x.toFixed(1) + ',' + (list[0].y - off).toFixed(1);
      for (var i = 0; i < list.length - 1; i++) {
        var p0 = list[i > 0 ? i - 1 : 0], p1 = list[i], p2 = list[i + 1];
        var p3 = list[i + 2 < list.length ? i + 2 : list.length - 1];
        out += ' C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ',' + (p1.y + (p2.y - p0.y) / 6 - off).toFixed(1)
             + ' ' + (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ',' + (p2.y - (p3.y - p1.y) / 6 - off).toFixed(1)
             + ' ' + p2.x.toFixed(1) + ',' + (p2.y - off).toFixed(1);
      }
      return out;
    }

    var mx = -9999, my = -9999;   // document coords the vine bends toward

    /* Sections with a solid leopard background sit in front of the vine, so the
       thread used to stop dead at their top edge. Remember where they are and
       let the line fade out just before it reaches one, then return once it has
       passed - the thread reads as slipping behind the print, not as cut off. */
    var veils = [];
    function measureVeils() {
      veils = [];
      document.querySelectorAll('.leo-tex').forEach(function (el) {
        var r = el.getBoundingClientRect();
        var h = r.height;
        if (h < 40) return;                       // skip the thin transition strips
        veils.push({ top: r.top + window.scrollY, bottom: r.bottom + window.scrollY });
      });
    }

    function veilFade(docY) {
      // 1 = fully drawn, 0 = dissolved into the print
      var FADE = 220;
      for (var v = 0; v < veils.length; v++) {
        var s = veils[v];
        if (docY >= s.top && docY <= s.bottom) return 0;
        if (docY < s.top && docY > s.top - FADE) return (s.top - docY) / FADE;
        if (docY > s.bottom && docY < s.bottom + FADE) return (docY - s.bottom) / FADE;
      }
      return 1;
    }

    build();
    measureVeils();
    var rt;
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); measureVeils(); }, 180); });
    addEventListener('load', function () { setTimeout(function () { build(); measureVeils(); }, 500); });

    var lastD = '';

    (function tick() {
      // build() returns early below 768px, so there is no path to drive. Without
      // this guard the loop threw on the first frame and the exception escaped
      // initAll(), which silently killed everything registered after the vine -
      // including the price calculator.
      if (!path) return;

      Input.tick();

      if (Input.active) {
        mx = Input.x;
        my = Input.y + window.scrollY;
      } else if (!fine) {
        // Nobody is touching. A fixed target would make the vine settle and stop,
        // so drive it with a slow clock: the bend keeps travelling on its own and
        // the scroll speed rides on top of it.
        var t = Date.now() / 1000;
        var lean = Math.max(-1, Math.min(1, Input.scrollV / 22));
        var driftX = Math.sin(t * 0.55) * 0.30 + Math.sin(t * 0.23) * 0.16;
        var driftY = Math.cos(t * 0.41) * 0.18;
        mx = W * (0.5 + driftX + lean * 0.22);
        my = window.scrollY + innerHeight * (0.45 + driftY);
      } else {
        mx = -9999; my = -9999;
      }

      var reach = fine ? 340 : 420, pull = fine ? 0.55 : 0.4;
      var top = window.scrollY, bottom = top + VH;
      var pad = 260;

      for (var i = 0; i < pts.length; i++) {
        var q = pts[i], tx = q.bx, ty = q.by;

        // points far off screen cannot be seen, so leave them at rest
        if (q.by < top - 1400 || q.by > bottom + 1400) {
          cur[i].x = q.bx; cur[i].y = q.by;
          continue;
        }

        if (mx > -9000) {
          var dx = mx - q.bx, dy = my - q.by;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < reach) {
            var f = 1 - dist / reach;
            tx += dx * f * pull;
            ty += dy * f * pull * 0.35;
          }
        }
        cur[i].x = lerp(cur[i].x, tx, 0.09);
        cur[i].y = lerp(cur[i].y, ty, 0.09);
      }

      // collect just the span that crosses the screen, plus one node either side
      var from = 0, to = cur.length - 1;
      for (var a = 0; a < cur.length; a++) { if (cur[a].y >= top - pad) { from = Math.max(0, a - 1); break; } }
      for (var b = cur.length - 1; b >= 0; b--) { if (cur[b].y <= bottom + pad) { to = Math.min(cur.length - 1, b + 1); break; } }

      if (to - from >= 1) {
        var slice = cur.slice(from, to + 1);
        var dd = toPath(slice, top);
        if (dd !== lastD) {
          path.setAttribute('d', dd);
          if (glow) glow.setAttribute('d', dd);
          lastD = dd;
        }
        // fade where the line runs into a leopard band
        var fade = veilFade(top + VH * 0.5);
        var eased = fade * fade * (3 - 2 * fade);
        path.setAttribute('opacity', (0.85 * eased).toFixed(3));
        path.style.display = eased < 0.02 ? 'none' : '';
        if (glow) {
          glow.setAttribute('opacity', (0.28 * eased).toFixed(3));
          glow.style.display = eased < 0.02 ? 'none' : '';
        }
      } else {
        path.style.display = 'none';
        if (glow) glow.style.display = 'none';
      }

      for (var c = 0; c < blooms.length; c++) {
        var bl = blooms[c], n = cur[bl.idx];
        var vy = n.y - top;

        // hide anything off screen: no transform, no paint
        if (vy < -200 || vy > VH + 200) {
          if (bl.shown) { bl.el.setAttribute('opacity', '0'); bl.shown = false; }
          continue;
        }
        bl.shown = true;

        var near = 0;
        if (mx > -9000) {
          var ex = mx - n.x, ey = my - n.y;
          var el = Math.sqrt(ex * ex + ey * ey);
          near = el < 320 ? 1 - el / 320 : 0;
        }
        var narrow = W < 760;
        var restScale = narrow ? 0.17 : 0.28;
        bl.scale = lerp(bl.scale, restScale + near * 0.3, 0.08);
        bl.spin += 0.1 + near * 0.5;
        var bf = veilFade(n.y);
        bl.el.setAttribute('opacity', (((narrow ? 0.38 : 0.6) + near * 0.4) * bf * bf * (3 - 2 * bf)).toFixed(2));
        bl.el.setAttribute('transform',
          'translate(' + n.x.toFixed(1) + ',' + vy.toFixed(1) + ') rotate(' +
          (bl.spin * 0.3 + bl.seed * 40).toFixed(1) + ') scale(' + bl.scale.toFixed(3) + ')');
      }

      requestAnimationFrame(tick);
    })();
  }

  /* ==========================================================================
     9. DRIFTING PETALS CANVAS (DODGES CURSOR)
     ========================================================================== */
  function initFloatingPetals() {
    var cv = document.getElementById('petals');
    if (!cv || reduce) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, ps = [];

    function size() {
      w = innerWidth;
      h = innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = w + 'px';
      cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      var n = w < 760 ? 12 : 26;
      ps = [];
      for (var i = 0; i < n; i++) {
        ps.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: 0.18 + Math.random() * 0.4,
          r: 5 + Math.random() * 11,
          a: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.02,
          pink: Math.random() < 0.62,
          o: 0.2 + Math.random() * 0.3
        });
      }
    }

    size();
    seed();
    var rt2;
    addEventListener('resize', function () {
      clearTimeout(rt2);
      rt2 = setTimeout(function () { size(); seed(); }, 180);
    });

    var px = -9999, py = -9999;   // fed from the shared input each frame

    (function draw() {
      px = Input.active ? Input.x : -9999;
      py = Input.active ? Input.y : -9999;

      // scrolling blows the petals along, and a slow breeze keeps them moving
      // when the phone is just lying there
      var now = Date.now() / 1000;
      var gust = Math.max(-3, Math.min(3, Input.scrollV * 0.06));
      var breeze = fine ? 0 : (Math.sin(now * 0.4) * 0.5 + Math.sin(now * 0.17) * 0.3);
      var sway = breeze;

      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];

        if (px > -9000) {
          var dx = p.x - px, dy = p.y - py;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0.1) {
            var f = (1 - dist / 140) * 0.9;
            p.vx += (dx / dist) * f;
            p.vy += (dy / dist) * f;
          }
        }

        p.vx = p.vx * 0.96 + (Math.random() - 0.5) * 0.02 + sway * 0.04;
        p.vy = p.vy * 0.96 + 0.012;
        if (p.vy < 0.12) p.vy = 0.12;
        p.x += p.vx;
        p.y += p.vy + gust;
        p.a += p.spin + gust * 0.004;

        if (p.y - p.r > h) {
          p.y = -p.r;
          p.x = Math.random() * w;
          p.vx = 0;
          p.vy = 0.2;
        }
        if (p.x < -60) p.x = w + 60;
        if (p.x > w + 60) p.x = -60;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.globalAlpha = p.o;
        ctx.fillStyle = p.pink ? '#E8447F' : '#E8C89A';
        ctx.beginPath();
        ctx.moveTo(0, p.r);
        ctx.bezierCurveTo(-p.r * 0.9, p.r * 0.25, -p.r * 0.62, -p.r * 0.85, 0, -p.r);
        ctx.bezierCurveTo(p.r * 0.62, -p.r * 0.85, p.r * 0.9, p.r * 0.25, 0, p.r);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(draw);
    })();
  }

  /* ==========================================================================
     SHARED: COPY A REQUEST AND SAY SO
     Instagram has no way to pre-fill a message. Every request button copies a
     ready text in the same tap and opens the chat; the hint line under the
     header confirms the copy and is still there when someone comes back.
     ========================================================================== */
  var DM = 'https://ig.me/m/gerberxnails';   // opens the chat, not just the profile

  // resolves true when the text is on the clipboard
  function copyText(txt) {
    function legacy() {
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
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(txt).then(function () { return true; }, legacy);
    }
    return Promise.resolve(legacy());
  }

  var Send = { deliver: null };          // set by initRequests
  var Hint = { countdown: null, needTap: null };   // set by initHint

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
    var bubbleEl = document.getElementById('msg-bubble');
    var foldEl = document.getElementById('msg-fold');
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
        if (pressed(b)) items.push({ kind: 'Extra', name: name(b), r: range(b.getAttribute('data-extra')), open: true,
                                     unit: b.getAttribute('data-unit') || '' });
      });

      // A range in a price list ("35-40") counts with its upper price: one
      // clear figure, and the visitor never pays more than what was shown.
      items.forEach(function (it) { it.r = [it.r[1], it.r[1]]; });
      var min = 0, max = 0, open = false;
      items.forEach(function (it) { min += it.r[0]; max += it.r[1]; open = open || it.open; });
      return { solo: false, items: items, min: min, max: max, open: open };
    }

    var shown = null, rollId = null, lastMsg = null;

    // the message line by line, so the line that just changed can light up
    function paintMessage(text, animate) {
      var before = lastMsg === null ? [] : lastMsg.split('\n');
      var frag = document.createDocumentFragment();
      text.split('\n').forEach(function (line) {
        var el = document.createElement('span');
        el.className = line ? 'ml' : 'ml ml-gap';
        if (animate && line && before.indexOf(line) === -1) el.className += ' ml-new';
        el.textContent = line;
        frag.appendChild(el);
      });
      bubbleEl.textContent = '';
      bubbleEl.appendChild(frag);
    }

    function paint(a, b, open) {
      a = Math.round(a); b = Math.round(b);
      totalEl.textContent = (open || a === b) ? String(a) : a + ' bis ' + b;
    }

    function render() {
      var s = state();

      // the live message: exactly the text a tap on the button copies
      if (bubbleEl) {
        var text = buildInquiryText(s);
        if (text !== lastMsg) {
          paintMessage(text, !reduce && !!shown);
          // folded: the little bubble on the closed row winks instead
          if (shown && foldEl && !foldEl.open) pop(foldEl.querySelector('.msg-ic'));
          lastMsg = text;
        }
      }

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
        return '• ' + it.kind + ': ' + it.name + ' · ' + euro(it.r, it.open) + (it.unit ? ' ' + it.unit : '');
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
      document.querySelectorAll('[data-len],[data-lvl],[data-add],[data-extra]').forEach(function (b) {
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
      // runs after the field's own handler, so the new state is already set
      calcSec.addEventListener('click', function (e) {
        var o = e.target.closest('.opt');
        if (o && !o.disabled) pop(o);
      });
    }

    document.querySelectorAll('[data-add],[data-extra]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.setAttribute('aria-pressed', pressed(btn) ? 'false' : 'true');
        touched = true;
        render();
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

  /* ==========================================================================
     REQUESTS: ONE TAP
     Instagram cannot pre-fill a message. A request button therefore copies
     the finished text in the tap; the hint line says "Kopiert" for two
     seconds and then the chat with Sophie opens. The buttons say so
     beforehand ("Nachricht wird kopiert · öffnet Instagram").

     data-send="set"      the set from the calculator
     data-send="general"  the set if one was put together, else a hello
     ========================================================================== */
  function initRequests() {
    function general() {
      var set = Calc.chosenSet && Calc.chosenSet();
      if (set && Calc.request) return Calc.request();
      return 'Hi Sophie! 💅 Ich würde gerne einen Termin bei dir anfragen. Wann hättest du Zeit?';
    }

    var WAIT = 2.5;   // seconds to read the copied message before Instagram opens

    // A new tab still counts as opened by the tap within a few seconds in
    // most browsers. Where it is blocked (Safari): on a computer the chat
    // opens right here; a phone only hands a link to the Instagram app when
    // it is tapped, so the hint line asks for that one tap.
    function openChat() {
      var w = null;
      try { w = window.open(DM, '_blank'); } catch (err) { w = null; }
      if (w) { try { w.opener = null; } catch (err) { /* cross-origin */ } return; }
      if (fine || !Hint.needTap) location.href = DM;
      else Hint.needTap();
    }

    // copy inside the tap (browsers only allow it there), say so, then the chat
    Send.deliver = function (el, txt, e) {
      if (e) e.preventDefault();
      var menu = document.getElementById('menu');
      if (menu && menu.classList.contains('open')) {
        var close = document.getElementById('menu-close-btn');
        if (close) close.click();
      }
      copyText(txt).then(function (ok) {
        if (Hint.countdown) Hint.countdown(ok, WAIT, openChat, txt);
        else openChat();
      });
    };

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-send]');
      if (!el) return;
      Send.deliver(el, el.getAttribute('data-send') === 'set' && Calc.request ? Calc.request() : general(), e);
    });

    /* With a mouse: say what a click does before it happens. Phones get the
       line on each button and the hint line instead. */
    if (fine) {
      var tip = document.createElement('div');
      tip.id = 'send-tip';
      tip.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tip);
      var hideT;
      var TARGETS = '[data-send]';
      document.addEventListener('mouseover', function (e) {
        var el = e.target.closest(TARGETS);
        if (!el) return;
        clearTimeout(hideT);
        tip.textContent = el.getAttribute('data-tip') ||
          '✨ Kopiert deine fertige Nachricht und öffnet Instagram';
        var r = el.getBoundingClientRect();
        tip.classList.add('on');
        var w = tip.offsetWidth;
        var x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2));
        tip.style.left = x + 'px';
        tip.style.top = (r.top > 60 ? r.top - tip.offsetHeight - 10 : r.bottom + 10) + 'px';
      });
      document.addEventListener('mouseout', function (e) {
        var el = e.target.closest(TARGETS);
        if (!el || el.contains(e.relatedTarget)) return;
        hideT = setTimeout(function () { tip.classList.remove('on'); }, 60);
      });
      addEventListener('scroll', function () { tip.classList.remove('on'); }, { passive: true });
    }
  }

  /* Kleine Zeile unten am Bildschirm: taucht auf, sobald der Preisrechner
     erreicht ist, und sagt ab dort beim Scrollen, dass die Anfrage
     automatisch geschrieben und kopiert wird. Der Text passt sich dem
     Abschnitt an. Nach einem Tipp bestaetigt sie das Kopieren und zaehlt
     kurz herunter, bevor Instagram aufgeht - so bleibt Zeit, es zu lesen.
     Am Handy sitzt sie im Rechner ueber der Preisleiste; ueber einem
     Anfrage-Knopf und am Seitenende (Links im Fuss) tritt sie zur Seite. */
  function initHint() {
    var el = document.getElementById('hint');
    if (!el) return;
    var textEl = el.querySelector('.hint-text');
    var live = document.getElementById('hint-live');

    // [bold part, rest] - long for wider screens, short for phones
    var TEXTS = {
      start:   { href: '#preise',
                 l: ['Stell dein Set zusammen', ': Deine Nachricht an Sophie wird automatisch erstellt'],
                 s: ['Set erstellen', ': Nachricht kommt automatisch'] },
      preise:  { href: '#btn-calc-cta',
                 l: ['Set zusammenstellen & anfragen', ': Deine Nachricht an Sophie wird automatisch erstellt'],
                 s: ['Set wählen', ': Nachricht kommt automatisch'] },
      kontakt: { href: '#kontakt',
                 l: ['Ein Tipp genügt', ': Nachricht wird kopiert, Instagram öffnet sich'],
                 s: ['Ein Tipp', ': Nachricht kopiert, Instagram öffnet'] },
      wait:    { href: DM, out: true,
                 l: ['Nachricht kopiert', ': Gleich öffnet sich Instagram, dort nur einfügen & senden'],
                 s: ['Kopiert', ': Gleich öffnet sich Instagram'] },
      waitNo:  { href: DM, out: true,
                 l: ['Instagram öffnet sich gleich', ': Schreib Sophie dort einfach direkt'],
                 s: ['Instagram öffnet sich gleich', ''] },
      tap:     { href: DM, out: true,
                 l: ['Kopiert', ': Jetzt hier tippen, dann öffnet sich Instagram'],
                 s: ['Kopiert', ': Hier tippen für Instagram'] },
      copied:  { href: DM, out: true,
                 l: ['Nachricht kopiert', ': In Instagram ins Textfeld tippen, einfügen & senden'],
                 s: ['Kopiert', ': In Instagram einfügen & senden'] },
      failed:  { href: DM, out: true,
                 l: ['Instagram öffnet sich', ': Schreib Sophie dort einfach direkt'],
                 s: ['Instagram öffnet sich', ': Schreib direkt'] }
    };
    var ZONES = ['preise', 'kontakt'];
    var foot = document.querySelector('footer');
    var calc = document.getElementById('preise');
    var num = el.querySelector('.i-num');
    var peek = document.getElementById('msg-peek');
    var peekText = peek && peek.querySelector('.peek-bubble');
    var peekTitle = peek && peek.querySelector('.peek-title');
    var cur = null, flashing = false, flashT = null, swapT = null, ticking = false;
    var cdT = null, cdDone = null, lastTxt = '', lastOk = true;

    // the copied text as a chat bubble above the line: this is your message
    function showPeek() {
      if (!peek || !lastTxt) return;
      peekTitle.textContent = lastOk ? 'Deine Nachricht ist kopiert'
                                     : 'Kopieren ging nicht. Schreib Sophie zum Beispiel:';
      peekText.textContent = lastTxt;
      peek.classList.toggle('is-fail', !lastOk);
      peek.hidden = false;
      peekText.classList.toggle('is-long', peekText.scrollHeight > peekText.clientHeight + 2);
      void peek.offsetWidth;
      peek.classList.add('show');
    }

    function hidePeek() {
      if (peek) peek.classList.remove('show');
    }

    function part(cls, t) {
      var span = document.createElement('span');
      span.className = cls;
      var b = document.createElement('b');
      b.textContent = t[0];
      span.appendChild(b);
      span.appendChild(document.createTextNode(t[1]));
      return span;
    }

    function render(key) {
      var t = TEXTS[key];
      textEl.textContent = '';
      textEl.appendChild(part('l', t.l));
      textEl.appendChild(part('s', t.s));
      el.setAttribute('href', t.href);
      if (t.out) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
      else { el.removeAttribute('target'); el.removeAttribute('rel'); }
      el.classList.toggle('is-done', key === 'copied' || key === 'wait' || key === 'tap');
      el.classList.toggle('is-tap', key === 'tap');
      // one soft light sweep across the new wording; the countdown bar restarts
      el.classList.remove('sweep', 'is-counting');
      void el.offsetWidth;
      el.classList.add('sweep');
      if (key === 'wait' || key === 'waitNo') el.classList.add('is-counting');
    }

    function set(key) {
      if (key === cur) return;
      var firstTime = cur === null;
      cur = key;
      clearTimeout(swapT);
      if (firstTime || reduce) { render(key); return; }
      el.classList.add('swap');
      swapT = setTimeout(function () { render(key); el.classList.remove('swap'); }, 170);
    }

    function zone() {
      if (foot && foot.getBoundingClientRect().top < innerHeight - 10) return 'foot';
      var y = innerHeight * 0.45;
      // nothing to say before the price calculator
      if (calc && calc.getBoundingClientRect().top > y) return 'before';
      for (var i = 0; i < ZONES.length; i++) {
        var sec = document.getElementById(ZONES[i]);
        if (!sec) continue;
        var r = sec.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) return ZONES[i];
      }
      return 'start';
    }

    // a request button right under the line says it itself - step aside
    // rather than cover it
    var buttons = [].slice.call(document.querySelectorAll('main [data-send]'));
    function overButton() {
      var r = el.getBoundingClientRect();
      for (var i = 0; i < buttons.length; i++) {
        var q = buttons[i].getBoundingClientRect();
        if (q.bottom > r.top - 8 && q.top < r.bottom + 8 && q.right > r.left && q.left < r.right) return true;
      }
      return false;
    }

    // on a phone the calculator speaks for itself: first the price bar,
    // then the price card says the same - a third bar would cover the fields
    function calcSaysIt(z) {
      return z === 'preise' && innerWidth < 1024;
    }

    function check() {
      ticking = false;
      var z = zone();
      var aside = z === 'foot' || z === 'before' || overButton() || calcSaysIt(z);
      el.classList.toggle('away', aside && !flashing);
      if (!flashing && !aside) set(z);
    }

    function soon() {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    }

    function settle(ms) {
      clearTimeout(flashT);
      flashT = setTimeout(function () {
        if (cdT) return;
        flashing = false;
        hidePeek();
        check();
      }, ms);
    }

    function stopCount(open) {
      clearInterval(cdT);
      cdT = null;
      var done = cdDone;
      cdDone = null;
      el.classList.remove('is-counting');
      hidePeek();
      set(cur === 'waitNo' ? 'failed' : 'copied');
      settle(9000);
      if (open && done) done();
    }

    // "copied" with the message above, 2-1 in the circle and a running bar,
    // then the chat opens and the message card is gone
    Hint.countdown = function (ok, secs, done, txt) {
      lastTxt = txt || '';
      lastOk = ok;
      clearInterval(cdT);
      clearTimeout(flashT);
      clearTimeout(swapT);
      flashing = true;
      cdDone = done;
      var left = Math.max(1, Math.floor(secs));   // 2 -> 1, spread over the wait
      var step = secs * 1000 / left;
      if (num) num.textContent = left;
      el.style.setProperty('--wait', secs + 's');
      el.classList.remove('away', 'swap');
      cur = ok ? 'wait' : 'waitNo';
      render(cur);
      showPeek();
      if (live) {
        live.textContent = (ok ? 'Nachricht kopiert. ' : '') + 'Instagram öffnet sich gleich.';
      }
      cdT = setInterval(function () {
        left -= 1;
        if (left > 0) { if (num) num.textContent = left; }
        else stopCount(true);
      }, step);
    };

    // the browser would not open the chat by itself: one tap on the line
    Hint.needTap = function () {
      clearTimeout(swapT);
      clearTimeout(flashT);
      flashing = true;
      el.classList.remove('away', 'swap');
      cur = 'tap';
      render('tap');
      showPeek();
      // the card may cover the page briefly - the small line keeps asking
      setTimeout(function () { if (cur === 'tap') hidePeek(); }, 3500);
      if (live) live.textContent = 'Tippe auf den Hinweis unten, um Instagram zu öffnen.';
      settle(20000);
    };

    // while it counts (or waits for a tap), the line is the link to the chat
    el.addEventListener('click', function () {
      if (cdT) stopCount(false);
      else if (cur === 'tap') { hidePeek(); set('copied'); settle(9000); }
    });

    // back from Instagram: no message card any more, only the small line
    // confirms it for a few seconds
    document.addEventListener('visibilitychange', function () {
      if (document.hidden || cdT) return;
      hidePeek();
      if (flashing) settle(7000);
    });

    addEventListener('scroll', soon, { passive: true });
    addEventListener('resize', soon);

    el.hidden = false;
    check();
    // after the loading flower has gone
    setTimeout(function () { el.classList.add('on'); }, reduce ? 0 : 1400);
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
     beim Auswaehlen nie, was sich gerade aendert. */
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
        '<div><div class="lbl">Dein Preis</div><div class="amount"><b id="pb-total"></b> <span>&euro;</span></div></div>' +
        '<a href="' + DM + '" target="_blank" rel="noopener noreferrer" data-send="set" ' +
        'class="btn btn-solid px-5 py-2.5 text-[.85rem] flex-col !gap-0.5"><span id="pb-cta">Set anfragen</span>' +
        '<span class="btn-sub">Nachricht wird kopiert</span></a>' +
      '</div>';
    document.body.appendChild(bar);

    var pbTotal = bar.querySelector('#pb-total');
    var pre = document.getElementById('total-pre');
    var popT = null, popped = null;
    function sync() {
      pbTotal.textContent = (pre && !pre.hidden ? 'ab ' : '') + total.textContent.trim();
      clearTimeout(popT);
      popT = setTimeout(function () {
        if (popped !== null && popped !== pbTotal.textContent) pop(pbTotal);
        popped = pbTotal.textContent;
      }, 240);
    }
    sync();
    new MutationObserver(sync).observe(total.parentNode, { childList: true, characterData: true, subtree: true, attributes: true });

    // once the price card itself is in view it says all of this -
    // the bar steps aside instead of showing it twice
    var card = document.getElementById('calc-sum');
    var inSec = false, cardIn = false;
    function show() { bar.classList.toggle('on', inSec && !cardIn); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { inSec = e.isIntersecting; });
        show();
      }, { threshold: 0, rootMargin: '-15% 0px -15% 0px' }).observe(sec);
      if (card) new IntersectionObserver(function (es) {
        es.forEach(function (e) { cardIn = e.isIntersecting; });
        show();
      }, { threshold: 0, rootMargin: '0px 0px -96px 0px' }).observe(card);
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
      ['TextReveal', initTextReveal], ['Preloader', initPreloader],
      ['Cursor', initCustomCursor],
      ['HeroShow', initHeroShow], ['ShowcaseOrt', initShowcasePlacement], ['Lightbox', initLightbox],
      ['Marquee', initMarqueeAndParallax],
      ['Rechner', initPriceCalculator], ['Preisleiste', initPriceBar],
      ['Regeln', initRules], ['Hinweis', initHint], ['Anfragen', initRequests]
    ].concat(SHOW_VINE_AND_PETALS ? [['Vine', initLivingVine], ['Petals', initFloatingPetals]] : [])
     .forEach(function (pair) { start(pair[0], pair[1]); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
