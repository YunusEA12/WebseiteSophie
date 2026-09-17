/**
 * gerberxnails — Modern Editorial Nail Design Studio
 * Core JavaScript & Interactive Modules
 */

(function () {
  'use strict';

  // Environment & Accessibility detection
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var lerp = function (a, b, n) { return a + (b - a) * n; };

  // Initialize dynamic copyright year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     1. CONSENT BANNER & LEGAL DIALOGS (DSGVO / GDPR)
     ========================================================================== */
  function initConsentAndDialogs() {
    var KEY = 'gxn-consent';
    var bar = document.getElementById('consent');
    if (!bar) return;

    function read() {
      try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function write(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
    }
    function show() { bar.classList.add('show'); }
    function hide() { bar.classList.remove('show'); }

    if (!read()) {
      setTimeout(function () {
        if (!read()) show();
      }, 1400);
    }

    var consentAll = document.getElementById('consent-all');
    if (consentAll) {
      consentAll.addEventListener('click', function () {
        write('all');
        hide();
      });
    }

    var consentMin = document.getElementById('consent-min');
    if (consentMin) {
      consentMin.addEventListener('click', function () {
        write('min');
        hide();
      });
    }

    var reset = document.getElementById('consent-reset');
    if (reset) {
      reset.addEventListener('click', function () {
        try { localStorage.removeItem(KEY); } catch (e) {}
        var open = document.querySelector('dialog.sheet[open]');
        if (open) open.close();
        show();
      });
    }

    // Open/close legal sheets via data attributes
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
      open = next;
      menu.classList.toggle('open', open);
      menu.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      document.body.style.overflow = open ? 'hidden' : '';
    }

    burger.addEventListener('click', function () { set(!open); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) set(false);
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
        }, reduce ? 60 : 720);
      }
    }, reduce ? 18 : 105);
  }

  /* ==========================================================================
     5. CUSTOM CURSOR & MAGNETIC TARGETS
     ========================================================================== */
  function initCustomCursor() {
    if (!fine || reduce) return;

    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

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

    document.querySelectorAll('a, button, .opt, .srv').forEach(function (el) {
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
     6. SERVICE LIST HOVER IMAGE PREVIEW (PEEK)
     ========================================================================== */
  function initServicePeek() {
    if (!fine || reduce) return;

    var peek = document.getElementById('peek');
    if (!peek) return;
    var pimg = peek.querySelector('img');
    var px = 0, py = 0, tx = 0, ty = 0, peeking = false;

    document.querySelectorAll('.srv').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        pimg.src = row.getAttribute('data-peek');
        peek.classList.add('on');
        peeking = true;
      });
      row.addEventListener('mouseleave', function () {
        peek.classList.remove('on');
        peeking = false;
      });
    });

    addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });

    (function pframe() {
      if (peeking) {
        px = lerp(px, tx, 0.1);
        py = lerp(py, ty, 0.1);
        peek.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) translate(-50%,-50%) rotate(' +
          ((tx - px) * 0.05).toFixed(2) + 'deg)';
      } else {
        px = tx;
        py = ty;
      }
      requestAnimationFrame(pframe);
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
     8. THE LIVING VINE: ORGANIC SVG LAYER SPANNING FULL PAGE
     ========================================================================== */
  function initLivingVine() {
    var svg = document.getElementById('vine');
    if (!svg) return;

    var NS = 'http://www.w3.org/2000/svg';
    var NODES = 22; // Control points running down the page
    var BLOOM_AT = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]; // Nodes carrying a hibiscus
    var W = 0, H = 0;
    var pts = [], cur = [], blooms = [];
    var path, glow, len = 0;

    function build() {
      W = document.documentElement.clientWidth;
      H = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.style.height = H + 'px';
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      pts = [];
      for (var i = 0; i < NODES; i++) {
        var t = i / (NODES - 1);
        var amp = W * (W < 760 ? 0.30 : 0.26);
        var x = W * 0.5 + Math.sin(t * Math.PI * 3.1) * amp + Math.sin(t * Math.PI * 7.3) * amp * 0.22;
        pts.push({ bx: x, by: t * H });
      }
      cur = pts.map(function (q) { return { x: q.bx, y: q.by }; });

      glow = document.createElementNS(NS, 'path');
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke', 'url(#gVine)');
      glow.setAttribute('stroke-width', W < 760 ? 10 : 16);
      glow.setAttribute('stroke-linecap', 'round');
      glow.setAttribute('opacity', '.28');
      svg.appendChild(glow);

      path = document.createElementNS(NS, 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'url(#gVine)');
      path.setAttribute('stroke-width', W < 760 ? 2 : 2.8);
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
        g.style.setProperty('--pc', k % 2 ? '#0E3330' : '#4A0D26');
        g.setAttribute('opacity', '0');
        svg.appendChild(g);
        return { idx: idx, el: g, seed: k * 1.7, scale: 0, spin: 0 };
      });

      len = 0;
    }

    // Catmull-Rom through the points, written as cubic beziers
    function toPath(list) {
      var out = 'M' + list[0].x.toFixed(1) + ',' + list[0].y.toFixed(1);
      for (var i = 0; i < list.length - 1; i++) {
        var p0 = list[i > 0 ? i - 1 : 0], p1 = list[i], p2 = list[i + 1];
        var p3 = list[i + 2 < list.length ? i + 2 : list.length - 1];
        out += ' C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ',' + (p1.y + (p2.y - p0.y) / 6).toFixed(1)
          + ' ' + (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ',' + (p2.y - (p3.y - p1.y) / 6).toFixed(1)
          + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
      }
      return out;
    }

    var mx = -9999, my = -9999;
    if (fine) {
      addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY + window.scrollY;
      });
      addEventListener('mouseleave', function () {
        mx = -9999;
        my = -9999;
      });
    }

    build();
    var rt;
    addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(build, 180);
    });
    addEventListener('load', function () {
      setTimeout(build, 500);
    });

    (function tick() {
      var reach = 340, pull = 0.55;

      for (var i = 0; i < pts.length; i++) {
        var q = pts[i], tx = q.bx, ty = q.by;
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

      var dd = toPath(cur);
      path.setAttribute('d', dd);
      glow.setAttribute('d', dd);

      if (!len) len = path.getTotalLength();
      var room = H - innerHeight;
      var prog = room > 0 ? Math.min(1, Math.max(0, window.scrollY / room)) : 1;
      var grown = 0.18 + prog * 0.82;
      var drawn = len * grown;
      path.setAttribute('stroke-dasharray', len);
      path.setAttribute('stroke-dashoffset', len - drawn);
      glow.setAttribute('stroke-dasharray', len);
      glow.setAttribute('stroke-dashoffset', len - drawn);

      for (var b = 0; b < blooms.length; b++) {
        var bl = blooms[b], n = cur[bl.idx];
        var reached = (bl.idx / (NODES - 1)) <= grown + 0.03;
        var near = 0;
        if (mx > -9000) {
          var ex = mx - n.x, ey = my - n.y;
          var el = Math.sqrt(ex * ex + ey * ey);
          near = el < 320 ? 1 - el / 320 : 0;
        }
        bl.scale = lerp(bl.scale, reached ? (0.28 + near * 0.3) : 0, 0.08);
        bl.spin += 0.1 + near * 0.5;
        bl.el.setAttribute('opacity', reached ? (0.6 + near * 0.4).toFixed(3) : '0');
        bl.el.setAttribute('transform',
          'translate(' + n.x.toFixed(1) + ',' + n.y.toFixed(1) + ') rotate(' +
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

    var px = -9999, py = -9999;
    if (fine) {
      addEventListener('mousemove', function (e) {
        px = e.clientX;
        py = e.clientY;
      });
      addEventListener('mouseleave', function () {
        px = -9999;
        py = -9999;
      });
    }

    (function draw() {
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

        p.vx = p.vx * 0.96 + (Math.random() - 0.5) * 0.02;
        p.vy = p.vy * 0.96 + 0.012;
        if (p.vy < 0.12) p.vy = 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.spin;

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
        ctx.fillStyle = p.pink ? '#C8974F' : '#12968D';
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
     10. DYNAMIC PRICE CONFIGURATOR
     ========================================================================== */
  function initPriceCalculator() {
    var totalEl = document.getElementById('total');
    var listEl = document.getElementById('breakdown');
    var ctaEl = document.getElementById('cta-label');
    if (!totalEl || !listEl || !ctaEl) return;

    var shown = 45;

    function pick(sel) {
      var e = document.querySelector(sel);
      return e ? +e.getAttribute(sel.indexOf('len') > -1 ? 'data-len' : 'data-lvl') : 0;
    }

    function state() {
      var soloBtn = document.querySelector('[data-solo]');
      var solo = soloBtn && soloBtn.getAttribute('aria-pressed') === 'true';
      if (solo) return { solo: true, total: +soloBtn.getAttribute('data-solo') };

      var len = pick('[data-len][aria-checked="true"]');
      var lvl = pick('[data-lvl][aria-checked="true"]');
      var addBtn = document.querySelector('[data-add]');
      var add = (addBtn && addBtn.getAttribute('aria-pressed') === 'true') ? +addBtn.getAttribute('data-add') : 0;
      return { solo: false, len: len, lvl: lvl, add: add, total: len + lvl + add };
    }

    function label(sel) {
      var e = document.querySelector(sel);
      return e ? e.querySelector('span').childNodes[0].textContent.trim() : '';
    }

    function rows(s) {
      if (s.solo) return [['Soak Off ohne neues Set', s.total]];
      var out = [
        [label('[data-len][aria-checked="true"]') + ' · inkl. russischer Maniküre', s.len],
        [label('[data-lvl][aria-checked="true"]'), s.lvl]
      ];
      if (s.add) out.push(['Fremde Arbeit entfernen', s.add]);
      return out;
    }

    function render() {
      var s = state();
      listEl.innerHTML = '';
      rows(s).forEach(function (r) {
        var li = document.createElement('li');
        li.className = 'flex items-baseline gap-3';
        var a = document.createElement('span');
        a.textContent = r[0];
        var b = document.createElement('span');
        b.className = 'flex-1 border-b border-dotted border-chalk/20';
        var c = document.createElement('span');
        c.className = 't-display text-chalk';
        c.textContent = r[1] + ' €';
        li.appendChild(a);
        li.appendChild(b);
        li.appendChild(c);
        listEl.appendChild(li);
      });
      ctaEl.textContent = 'Set für ' + s.total + ' € anfragen';

      // Smooth count-up animation to the new total
      var target = s.total;
      if (reduce) {
        shown = target;
        totalEl.textContent = target;
        return;
      }
      (function roll() {
        shown = lerp(shown, target, 0.22);
        if (Math.abs(target - shown) < 0.5) {
          shown = target;
          totalEl.textContent = target;
          return;
        }
        totalEl.textContent = Math.round(shown);
        requestAnimationFrame(roll);
      })();
    }

    function setSoloVisual(on) {
      document.querySelectorAll('[data-len],[data-lvl],[data-add]').forEach(function (b) {
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
        render();
      });
    });

    var addBtn = document.querySelector('[data-add]');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        this.setAttribute('aria-pressed', this.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        render();
      });
    }

    var soloBtn = document.querySelector('[data-solo]');
    if (soloBtn) {
      soloBtn.addEventListener('click', function () {
        var on = this.getAttribute('aria-pressed') !== 'true';
        this.setAttribute('aria-pressed', on ? 'true' : 'false');
        setSoloVisual(on);
        render();
      });
    }

    render();
  }

  /* ==========================================================================
     INITIALIZATION ON DOM CONTENT LOADED
     ========================================================================== */
  function initAll() {
    initConsentAndDialogs();
    initMobileMenu();
    initTextReveal();
    initPreloader();
    initCustomCursor();
    initServicePeek();
    initMarqueeAndParallax();
    initLivingVine();
    initFloatingPetals();
    initPriceCalculator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
