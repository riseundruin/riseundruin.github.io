/* Rise & Ruin v2 motion engine (Vista). Vanilla, no dependencies. Respects prefers-reduced-motion. */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var d = document, b = d.body;

  // scroll progress + header state + active nav
  var prog = d.createElement('div'); prog.className = 'v2-prog'; b.appendChild(prog);
  var navLinks = [].slice.call(d.querySelectorAll('.top nav a[href^="#"]'));
  var secs = navLinks.map(function (a) { return d.querySelector(a.getAttribute('href')); });
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var h = d.documentElement, max = h.scrollHeight - h.clientHeight, y = h.scrollTop || b.scrollTop;
      prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      b.classList.toggle('scrolled', y > 20);
      var cur = -1;
      secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) cur = i; });
      navLinks.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
      quoteLight();
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });

  // hero intro: split headline into words
  var hero = d.querySelector('.hero');
  if (hero) {
    var h1 = hero.querySelector('h1');
    if (h1) {
      [].slice.call(h1.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t.trim()) { frag.appendChild(d.createTextNode(t)); return; }
            var w = d.createElement('span'); w.className = 'w'; var i = d.createElement('span'); i.textContent = t; w.appendChild(i); frag.appendChild(w);
          });
          h1.replaceChild(frag, n);
        } else if (n.nodeName === 'EM') {
          var t = n.textContent; n.textContent = '';
          t.split(/(\s+)/).forEach(function (p) {
            if (!p.trim()) { n.appendChild(d.createTextNode(p)); return; }
            var w = d.createElement('span'); w.className = 'w'; var i = d.createElement('span'); i.textContent = p; w.appendChild(i); n.appendChild(w);
          });
        }
      });
      [].slice.call(h1.querySelectorAll('.w>span')).forEach(function (s, i) { s.style.transitionDelay = (0.08 + i * 0.09) + 's'; });
    }
    // giant background Rex
    var rex = d.createElement('img'); rex.className = 'hero-rex'; rex.alt = ''; rex.src = '/assets/rex-600.png'; rex.setAttribute('aria-hidden', 'true');
    hero.insertBefore(rex, hero.firstChild);
    var cue = d.createElement('a'); cue.className = 'scroll-cue'; cue.href = '#episodes'; cue.innerHTML = '<i></i>SCROLL'; hero.appendChild(cue);
    var media = hero.querySelector('.player'); if (media && media.parentElement) media.parentElement.classList.add('hero-media');
    requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('go'); countStats(); }, 60); });
    if (FINE && !RM) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        hero.style.setProperty('--mx', (x * 100) + '%'); hero.style.setProperty('--my', (y * 100) + '%');
        hero.style.setProperty('--px', ((x - .5) * -40) + 'px'); hero.style.setProperty('--py', ((y - .5) * -30) + 'px');
        if (media) {
          var m = media.getBoundingClientRect(), mx = (e.clientX - m.left) / m.width, my = (e.clientY - m.top) / m.height;
          media.style.setProperty('--ry', (-8 + (mx - .5) * 10) + 'deg'); media.style.setProperty('--rx', (4 - (my - .5) * 8) + 'deg');
          media.style.setProperty('--gx', (mx * 100) + '%'); media.style.setProperty('--gy', (my * 100) + '%');
        }
      });
    }
  }

  // count-up numbers in hero stats
  function countStats() {
    [].slice.call(d.querySelectorAll('.hero .stats div')).forEach(function (el) {
      var node = el.firstChild; if (!node || node.nodeType !== 3) return;
      var m = node.nodeValue.match(/^(\d+)(.*)$/); if (!m) return;
      var end = +m[1], suf = m[2], t0 = null;
      if (RM) return;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
        node.nodeValue = Math.round(end * e) + suf; if (p < 1) requestAnimationFrame(step); }
      node.nodeValue = '0' + suf; requestAnimationFrame(step);
    });
  }

  // reveal-on-scroll for section heads, subs and blocks
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }) : null;
  function watch(el) { if (io) io.observe(el); else el.classList.add('in'); }
  [].slice.call(d.querySelectorAll('section h2')).forEach(function (h) {
    if (h.closest('.hero')) return;
    var txt = h.textContent; h.textContent = ''; h.classList.add('v2-h'); h.setAttribute('aria-label', txt);
    txt.split('').forEach(function (c, i) {
      var s = d.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c; s.style.transitionDelay = (i * 0.025) + 's'; h.appendChild(s);
    });
    watch(h);
  });
  [].slice.call(d.querySelectorAll('.sec-sub,.tools,.aut,.hub,.faq,.next,.sh-row,.how,.founder')).forEach(function (el) { el.classList.add('v2-in'); watch(el); });
  var tl = d.querySelector('.tl'); if (tl) { tl.classList.add('v2-tl'); watch(tl);
    [].slice.call(tl.children).forEach(function (a, i) { a.style.transitionDelay = (i * 0.05) + 's'; }); }

  // quote: light words as it crosses the viewport
  var qws = [];
  var q = d.querySelector('.quote p');
  if (q) {
    function wrapWords(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t.trim()) { frag.appendChild(d.createTextNode(t)); return; }
            var s = d.createElement('span'); s.className = 'qw'; s.textContent = t; frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.nodeName !== 'BR') wrapWords(n);
      });
    }
    wrapWords(q); qws = [].slice.call(q.querySelectorAll('.qw'));
    q.closest('.quote').classList.remove('rv'); q.closest('.quote').classList.add('in');
  }
  function quoteLight() {
    if (!qws.length) return;
    var r = q.getBoundingClientRect(), p = (innerHeight * 0.85 - r.top) / (innerHeight * 0.6);
    var n = Math.round(Math.max(0, Math.min(1, p)) * qws.length);
    qws.forEach(function (w, i) { w.classList.toggle('lit', RM || i < n); });
  }

  // 3D tilt + glare on episode cards (delegated; grid re-renders)
  if (FINE && !RM) {
    d.addEventListener('mousemove', function (e) {
      var c = e.target.closest && e.target.closest('.card'); if (!c) return;
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--ry', ((x - .5) * 10) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 8) + 'deg');
      c.style.setProperty('--gx', (x * 100) + '%'); c.style.setProperty('--gy', (y * 100) + '%');
    });
    // magnetic buttons
    [].slice.call(d.querySelectorAll('.btn,.top nav .sub,.aut-go')).forEach(function (bt) {
      bt.addEventListener('mousemove', function (e) { var r = bt.getBoundingClientRect();
        bt.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25) + 'px)'; });
      bt.addEventListener('mouseleave', function () { bt.style.transform = ''; });
    });
    // soft cursor glow
    var g = d.createElement('div'); g.className = 'v2-glow'; b.appendChild(g);
    addEventListener('mousemove', function (e) { g.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)'; }, { passive: true });
  }

  // animate cards whenever the grid re-renders (filters, load more)
  var grid = d.getElementById('grid');
  if (grid && 'MutationObserver' in window && !RM) {
    new MutationObserver(function (ms) {
      var k = 0;
      ms.forEach(function (m) { [].slice.call(m.addedNodes).forEach(function (n) {
        if (n.classList && n.classList.contains('card')) { n.style.animationDelay = (k++ % 8) * 0.06 + 's'; n.classList.add('pop'); }
      }); });
    }).observe(grid, { childList: true });
    [].slice.call(grid.children).forEach(function (n, i) { n.style.animationDelay = (i % 8) * 0.06 + 's'; n.classList.add('pop'); });
  }

  onScroll();
})();
