(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  if (reduce) root.classList.add('reduce');

  /* ---------- Page-load sequence ---------- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add('loaded'); });
  });
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ticker: duplicate track for a seamless loop */
  var tt = document.querySelector('.ticker-track');
  if (tt) tt.innerHTML += tt.innerHTML;

  /* ---------- Language (ES / EN) ---------- */
  var lang = 'es';
  var btn = document.getElementById('langBtn');
  var i18n = Array.prototype.slice.call(document.querySelectorAll('[data-en]'));
  i18n.forEach(function (el) { el.setAttribute('data-es', el.innerHTML); });
  var labelEls = Array.prototype.slice.call(document.querySelectorAll('[data-en-label]'));
  labelEls.forEach(function (el) { el.setAttribute('data-es-label', el.getAttribute('aria-label')); });

  function setLang(l) {
    lang = l;
    i18n.forEach(function (el) { el.innerHTML = el.getAttribute(l === 'en' ? 'data-en' : 'data-es'); });
    labelEls.forEach(function (el) { el.setAttribute('aria-label', el.getAttribute(l === 'en' ? 'data-en-label' : 'data-es-label')); });
    root.lang = l;
    btn.textContent = l === 'en' ? 'ES' : 'EN';
    btn.setAttribute('aria-label', l === 'en' ? 'Cambiar a español' : 'Switch to English');
    document.title = l === 'en' ? 'Tiffani Heredia · Social Communicator' : 'Tiffani Heredia · Comunicadora Social';
    try { localStorage.setItem('th-lang', l); } catch (e) {}
  }
  btn.addEventListener('click', function () { setLang(lang === 'es' ? 'en' : 'es'); });
  var initial = null;
  try { initial = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  if (!initial) { try { initial = localStorage.getItem('th-lang'); } catch (e) {} }
  if (initial === 'en') setLang('en');

  /* ---------- Nav state ---------- */
  var nav = document.getElementById('nav');
  var stage = document.getElementById('hard-rock');
  var contact = document.getElementById('contacto');
  var voice = document.getElementById('voz');
  function onScroll() {
    var y = window.scrollY;
    var mid = 40;
    var dark = [stage, voice, contact].some(function (s) {
      var r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    });
    nav.classList.toggle('dark', dark);
    nav.classList.toggle('solid', !dark && y > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* active link */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) secIO.observe(s); });
  }

  /* mobile menu */
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  menuBtn.addEventListener('click', function () {
    var open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', open);
    navLinks.classList.toggle('open', open);
  });
  links.forEach(function (a) { a.addEventListener('click', function () { menuBtn.setAttribute('aria-expanded', 'false'); navLinks.classList.remove('open'); }); });

  /* ---------- Stage: curtain + reveals ---------- */
  var curtain = document.querySelector('.curtain');
  var revealEls = stage.querySelectorAll('.stage-head, .cover, .brief > div, .setlist-title, .setlist li, .stage-quote');
  Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window && !reduce) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { curtain.classList.add('open'); obs.disconnect(); } });
    }, { threshold: 0.18 }).observe(stage);
    var rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rIO.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    Array.prototype.forEach.call(revealEls, function (el) { rIO.observe(el); });
  } else {
    curtain.classList.add('open');
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('in'); });
  }

  /* counters */
  var counters = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window && !reduce) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, to = +el.getAttribute('data-to'), t0 = performance.now();
        cIO.unobserve(el);
        (function step(t) {
          var p = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
          el.textContent = v.toLocaleString('en-US');
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (c) { cIO.observe(c); });
  }

  /* ---------- Lightbox ---------- */
  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  var missing = [3, 51, 77, 83, 88, 99];
  function avail(list) { return list.filter(function (n) { return missing.indexOf(n) === -1; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function slides(list) {
    return avail(list).map(function (n) { return { src: 'assets/hardrock/s' + pad(n) + '.webp', thumb: 'assets/hardrock/t' + pad(n) + '.webp', n: n }; });
  }
  var decks = {
    all: { title: 'Built for the Hard Rock Culture', items: slides(range(1, 98)) },
    p1: { title: '01 · The Beat Behind the Experience', items: slides(range(4, 50)) },
    p2: { title: '02 · The Final Encore', items: slides(range(52, 76)) },
    p3: { title: '03 · Backstage Pass', items: slides(range(78, 82)) },
    p4: { title: '04 · RockSync', items: slides(range(84, 87)) },
    p5: { title: '05 · Pause with Purpose', items: slides(range(89, 98)) }
  };

  var lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg'),
      lbTitle = document.getElementById('lbTitle'), lbCount = document.getElementById('lbCount'),
      lbStrip = document.getElementById('lbStrip');
  var cur = null, idx = 0, lastFocus = null;

  function open(deck, start) {
    cur = deck; idx = start || 0; lastFocus = document.activeElement;
    lbTitle.textContent = deck.title;
    lbStrip.innerHTML = '';
    lbStrip.classList.toggle('tall', !!deck.tall);
    deck.items.forEach(function (it, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (lang === 'en' ? 'Go to image ' : 'Ir a la imagen ') + (i + 1));
      var im = document.createElement('img'); im.src = it.thumb; im.alt = ''; im.loading = 'lazy';
      b.appendChild(im);
      b.addEventListener('click', function () { show(i); });
      lbStrip.appendChild(b);
    });
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(idx);
    document.getElementById('lbClose').focus();
  }
  function show(i) {
    var n = cur.items.length;
    idx = (i + n) % n;
    var it = cur.items[idx];
    lbImg.src = it.src;
    lbImg.alt = it.alt || (cur.title + ' — ' + (idx + 1));
    lbCount.textContent = (idx + 1) + ' / ' + n;
    Array.prototype.forEach.call(lbStrip.children, function (b, j) { b.classList.toggle('on', j === idx); });
    var on = lbStrip.children[idx];
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
    [1, -1].forEach(function (d) { var p = cur.items[(idx + d + n) % n]; if (p) { var im = new Image(); im.src = p.src; } });
  }
  function close() {
    lb.hidden = true; document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function () { show(idx - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(idx + 1); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'Tab') {
      var f = lb.querySelectorAll('button'); var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  lb.addEventListener('click', function (e) { if (e.target.classList.contains('lb-stage')) close(); });
  var sx = null;
  lbImg.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lbImg.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-deck]'), function (b) {
    b.addEventListener('click', function () { open(decks[b.getAttribute('data-deck')], 0); });
  });

  /* image galleries (work + credentials) */
  var galleryTitles = {
    starbound: ['StarBound', 'StarBound'],
    dga: ['Dirección General de Aduanas', 'Dominican Customs Agency'],
    creds: ['Formación y credenciales', 'Education and credentials']
  };
  function galleryOf(name) {
    var sel = name === 'creds' ? '[data-gallery^="creds"]' : '[data-gallery="' + name + '"]';
    var btns = Array.prototype.slice.call(document.querySelectorAll(sel + ' button'));
    return btns;
  }
  ['starbound', 'dga', 'creds'].forEach(function (name) {
    var btns = galleryOf(name);
    btns.forEach(function (b, i) {
      b.setAttribute('aria-label', (b.querySelector('img').alt));
      b.addEventListener('click', function () {
        var items = btns.map(function (x) { var im = x.querySelector('img'); return { src: im.getAttribute('src'), thumb: im.getAttribute('src'), alt: im.alt }; });
        open({ title: galleryTitles[name][lang === 'en' ? 1 : 0], items: items, tall: name === 'creds' }, i);
      });
    });
  });
})();
