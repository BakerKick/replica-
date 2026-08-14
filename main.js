/* ============================================================
   SHIRAUME LODGE — Interactions
   Base behaviors from the approved concept site, plus features
   merged in from the interactive prototype (index 2):
   splash, custom cursor, scroll progress, page transitions,
   hero ticker, counters, room detail views, booking, lightbox.
   ============================================================ */

// ─── LANGUAGE TOGGLE ────────────────────────────────────────
const html = document.documentElement;
function setLang(lang) {
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang === 'ja' ? 'ja' : 'en');
}
document.getElementById('lang-toggle').addEventListener('click', () => {
  setLang(html.getAttribute('data-lang') === 'ja' ? 'en' : 'ja');
});
document.getElementById('mobile-lang-toggle').addEventListener('click', () => {
  setLang(html.getAttribute('data-lang') === 'ja' ? 'en' : 'ja');
  closeMenu();
});

// ─── DAY / NIGHT THEME ──────────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const sunSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>';
const moonSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>';
// Unified day/night: real Japan time on load, moon button flips it, choice remembered.
const heroEl = document.getElementById('hero');
function japanIsNight() {
  const h = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', hour: '2-digit', hour12: false }).format(new Date()), 10);
  return h >= 18 || h < 6; // 6pm–6am
}
function applyMode(night) {
  html.classList.toggle('dark', night);
  heroEl.classList.toggle('show-night', night);
  themeToggleBtn.innerHTML = night ? sunSvg : moonSvg;
  themeToggleBtn.setAttribute('aria-label', night ? 'Switch to light mode' : 'Switch to dark mode');
}
let savedMode = null;
try { savedMode = localStorage.getItem('shiraume-hero-mode'); } catch (e) {}
heroEl.classList.add('no-anim');
applyMode(savedMode ? savedMode === 'night' : japanIsNight());
requestAnimationFrame(() => requestAnimationFrame(() => heroEl.classList.remove('no-anim')));
themeToggleBtn.addEventListener('click', () => {
  const night = !html.classList.contains('dark');
  applyMode(night);
  try { localStorage.setItem('shiraume-hero-mode', night ? 'night' : 'day'); } catch (e) {}
});

// ─── HEADER SCROLL STATE ────────────────────────────────────
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20 || VIEW === 'room');
}, { passive: true });

// ─── MOBILE MENU ────────────────────────────────────────────
const mobileMenu = document.getElementById('mobile-menu');
function openMenu() {
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.getElementById('mobile-menu-btn').addEventListener('click', openMenu);
document.getElementById('mobile-close').addEventListener('click', closeMenu);
document.getElementById('mobile-logo-close').addEventListener('click', (e) => { e.preventDefault(); closeMenu(); });
document.querySelectorAll('.mobile-nav-link').forEach(link => link.addEventListener('click', closeMenu));

// ─── FEATURE FLAGS / ENVIRONMENT ────────────────────────────
const HERO_ENHANCED = document.body.classList.contains('hero-enhanced');
const REDUCED_MOTION = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

// ─── CUSTOM CURSOR ──────────────────────────────────────────
(function () {
  const c = document.getElementById('cursor');
  if (!c || !FINE_POINTER) return;
  document.body.classList.add('cursor-on');
  document.addEventListener('mousemove', (e) => {
    c.style.left = e.clientX + 'px';
    c.style.top = e.clientY + 'px';
  });
  // Delegated so dynamically inserted room content also grows the cursor
  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('button, a, select, [onclick], [data-room], .other-link, .gal-grid img, .splash-skip');
    c.classList.toggle('grow', !!t);
  });
})();

// ─── SPLASH SEQUENCE ────────────────────────────────────────
let splashDone = false;
const TAGLINE_JP = '巡礼の宿る　山のほとり';
const TAGLINE_EN = 'Where the pilgrimage rests';

function buildTickerChars(el, text) {
  el.innerHTML = '';
  text.split('').forEach((ch) => {
    const s = document.createElement('span');
    s.className = 'ticker-char';
    s.textContent = (ch === ' ' || ch === '　') ? ' ' : ch;
    el.appendChild(s);
  });
  return el.querySelectorAll('.ticker-char');
}

function animateTagline(text, onDone, hold, dir, speed) {
  const el = document.getElementById('splash-tagline');
  if (!el) return;
  const els = buildTickerChars(el, text);
  const n = els.length;
  const perChar = speed || 150;
  for (let i = 0; i < n; i++) {
    const order = (dir === 'ltr') ? i : (n - 1 - i);
    setTimeout(() => els[i].classList.add('show'), order * perChar);
  }
  if (onDone) setTimeout(onDone, n * perChar + (hold != null ? hold : 700));
}

function hideTagline(onDone) {
  const el = document.getElementById('splash-tagline');
  if (!el) { if (onDone) onDone(); return; }
  const els = el.querySelectorAll('.ticker-char');
  els.forEach((s, i) => setTimeout(() => { s.classList.remove('show'); s.classList.add('hide'); }, i * 40));
  if (onDone) setTimeout(onDone, els.length * 40 + 250);
}

let tickerStarted = false;
function dismissSplash() {
  if (splashDone) return;
  splashDone = true;
  const s = document.getElementById('splash');
  if (s) { s.classList.add('hidden'); setTimeout(() => { s.style.display = 'none'; }, 950); }
  revealHero();
  if (!tickerStarted) { tickerStarted = true; setTimeout(runTicker, 1200); }
}

function revealHero() {
  if (!HERO_ENHANCED) return;
  document.querySelectorAll('.hero-in').forEach((el) => {
    const order = parseInt(el.getAttribute('data-hero-order')) || 0;
    setTimeout(() => el.classList.add('show'), 150 + order * 180);
  });
}

(function () {
  if (REDUCED_MOTION) { dismissSplash(); return; }
  setTimeout(() => {
    if (splashDone) return;
    animateTagline(TAGLINE_JP, () => {
      if (splashDone) return;
      hideTagline(() => {
        if (splashDone) return;
        animateTagline(TAGLINE_EN, () => setTimeout(dismissSplash, 450), 350, 'ltr', 45);
      });
    }, 300, null, 95);
  }, 350);
  // Safety: never trap the visitor on the splash
  setTimeout(dismissSplash, 12000);
})();

// ─── HERO VERTICAL TICKER (enhanced hero only) ──────────────
let tLang = 'jp';
let tTimer = null;
function runTicker() {
  if (!HERO_ENHANCED || REDUCED_MOTION) return;
  const col = document.getElementById('ticker-col');
  if (!col) return;
  const text = tLang === 'jp' ? TAGLINE_JP : TAGLINE_EN;
  tLang = (tLang === 'jp') ? 'en' : 'jp';
  const els = buildTickerChars(col, text);
  const n = els.length;
  const perChar = 150;
  for (let i = 0; i < n; i++) {
    setTimeout(() => els[i].classList.add('show'), (n - 1 - i) * perChar);
  }
  const allShownAt = n * perChar;
  const holdTime = 3500;
  setTimeout(() => {
    for (let i = 0; i < n; i++) {
      setTimeout(() => { els[i].classList.remove('show'); els[i].classList.add('hide'); }, (n - 1 - i) * 55);
    }
  }, allShownAt + holdTime);
  clearTimeout(tTimer);
  tTimer = setTimeout(runTicker, allShownAt + holdTime + n * 55 + 600 + 3000);
}

// ─── STAT COUNTERS ──────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || REDUCED_MOTION) return;
  els.forEach((el) => { el.textContent = '0'; });
  let run = false;
  function animate(el, target, duration) {
    const step = target / (duration / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { el.textContent = target; clearInterval(timer); return; }
      el.textContent = Math.floor(cur);
    }, 16);
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !run) {
        run = true;
        els.forEach((el) => animate(el, parseInt(el.getAttribute('data-count')), 1800));
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  obs.observe(document.querySelector('.stats-bar'));
})();

// ─── SCROLL REVEAL ──────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.view.active .reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 100);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach((el) => { el.classList.remove('visible'); obs.observe(el); });
}
initReveal();

// ─── VIEWS, WIPE & ROUTING ──────────────────────────────────
let VIEW = 'home';
const SITE_TITLE = 'Shiraume Lodge — A Ryokan Concept, Hikosan, Fukuoka';

function wipe(cb) {
  if (REDUCED_MOTION) { cb(); window.scrollTo(0, 0); return; }
  const w = document.getElementById('wipe');
  w.className = 'in';
  setTimeout(() => {
    cb();
    window.scrollTo(0, 0);
    w.className = 'out';
    setTimeout(() => { w.className = ''; }, 520);
  }, 480);
}

function showView(id) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  header.classList.toggle('scrolled', id === 'room' || window.scrollY > 20);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top: top, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
}

function goHome(sectionId) {
  if (VIEW === 'home') {
    if (sectionId) scrollToSection(sectionId);
    else window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    return;
  }
  wipe(() => {
    VIEW = 'home';
    document.title = SITE_TITLE;
    showView('home');
    initReveal();
    if (sectionId) setTimeout(() => scrollToSection(sectionId), 60);
  });
}

function goRoom(slug) {
  if (!ROOMS[slug]) return;
  wipe(() => {
    VIEW = 'room';
    populateRoom(slug);
    showView('room');
    const bf = document.getElementById('bk-form');
    const bs = document.getElementById('bk-success');
    if (bf) bf.style.display = '';
    if (bs) bs.classList.remove('show');
    initReveal();
  });
}

// Route all in-page anchors through the view system so navigation
// works from the room detail view too.
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    if (!id) { goHome(); return; }
    goHome(id);
  });
});
document.querySelectorAll('[data-room]').forEach((el) => {
  el.addEventListener('click', () => goRoom(el.getAttribute('data-room')));
});

// ─── ROOM DATA (copy follows the approved concept site) ─────
const ROOMS = {
  koke: {
    nameEn: 'Koke', nameJp: '苔',
    eyebrow: 'Room 01 · 客室01',
    type: 'First Floor · Japandi Room · 1階・ジャパンディルーム',
    size: '12-mat Tatami', sizeShort: '12畳',
    price: 'From ¥22,000 / night · inc. breakfast',
    priceBadge: 'From ¥22,000 / night',
    cap: 4,
    lead: 'A full 12-mat tatami room opening directly onto the garden, with a private ensuite ofuro bath finished in warm stone.',
    descEn: 'The largest of the three first-floor rooms, and the most traditional in feel. The Japandi interior blends Japanese and Scandinavian sensibilities — natural materials, quiet palettes, and direct access to the garden. Like every room at Shiraume, Koke includes yukata on arrival, premium toiletries, high-quality bedding, Wi-Fi, television, and an in-room coffee and tea setup.',
    descJp: '庭へと直接開かれた、12畳の和室。温かみのある石造りの専用露天風呂付き。1階の3室の中で最も広く、最も和の趣を残した客室です。浴衣、上質なアメニティ、寝具、Wi-Fi、テレビ、コーヒー・お茶セットを完備しています。',
    feats: ['12-Mat Tatami · 12畳', 'Garden Access · 庭へのアクセス', 'Ensuite Ofuro · 専用露天風呂', 'Yukata · 浴衣', 'Wi-Fi & TV · Wi-Fi・テレビ', 'Coffee & Tea Setup · コーヒー・お茶セット'],
    bgImg: 'assets/img/room-koke.jpg',
    thumb: 'assets/img/room-koke.jpg',
    gallery: ['assets/img/room-koke.jpg', 'assets/img/s2-room-koke.jpg']
  },
  shizuka: {
    nameEn: 'Shizuka', nameJp: '静',
    eyebrow: 'Room 02 · 客室02',
    type: 'First Floor · Japandi Room · 1階・ジャパンディルーム',
    size: 'Platform Bed + Tatami', sizeShort: '高床式ベッド',
    price: 'From ¥22,000 / night · inc. breakfast',
    priceBadge: 'From ¥22,000 / night',
    cap: 3,
    lead: 'A raised platform bed sits across hardwood and tatami flooring, with room to add futons for additional guests.',
    descEn: 'Shizuka pairs a raised platform bed with hardwood and tatami flooring — a Japandi sensibility that feels neither purely traditional nor modern, but specifically of this place. Direct garden access and a private ensuite ofuro bath. A futon can be added for a third guest.',
    descJp: 'フローリングと畳を組み合わせた床の上に、高床式のベッドを配置。布団を追加することも可能です。庭への直接アクセスと専用露天風呂付き。',
    feats: ['Platform Bed · 高床式ベッド', 'Garden Access · 庭へのアクセス', 'Ensuite Ofuro · 専用露天風呂', 'Futon Option (3rd guest) · 布団追加可', 'Yukata · 浴衣', 'Wi-Fi & TV · Wi-Fi・テレビ'],
    bgImg: 'assets/img/room-shizuka.jpg',
    thumb: 'assets/img/room-shizuka.jpg',
    gallery: ['assets/img/room-shizuka.jpg', 'assets/img/s2-room-shizuka.jpg']
  },
  yamabiko: {
    nameEn: 'Yamabiko', nameJp: '山彦',
    eyebrow: 'Room 03 · 客室03',
    type: 'First Floor · Japandi Room · 1階・ジャパンディルーム',
    size: 'Platform Bed + Tatami', sizeShort: '高床式ベッド',
    price: 'From ¥22,000 / night · inc. breakfast',
    priceBadge: 'From ¥22,000 / night',
    cap: 3,
    lead: 'The third Japandi room, following the same raised platform bed and hardwood-and-tatami layout as Room 02, with its own garden outlook.',
    descEn: 'Yamabiko follows the platform-bed layout of Shizuka with its own garden outlook and a private ensuite ofuro bath. Soft, filtered light enters through shoji screens throughout the day. A futon can be added for a third guest.',
    descJp: '客室02と同様、高床式ベッドとフローリング・畳を組み合わせた3室目のジャパンディルーム。専用の庭の眺めと露天風呂付き。布団追加で3名まで対応。',
    feats: ['Platform Bed · 高床式ベッド', 'Garden Outlook · 庭の眺め', 'Ensuite Ofuro · 専用露天風呂', 'Futon Option (3rd guest) · 布団追加可', 'Yukata · 浴衣', 'Wi-Fi & TV · Wi-Fi・テレビ'],
    bgImg: 'assets/img/room-yamabiko.jpg',
    thumb: 'assets/img/room-yamabiko.jpg',
    gallery: ['assets/img/room-yamabiko.jpg', 'assets/img/s2-room-yamabiko.jpg']
  },
  hinoki: {
    nameEn: 'Hinoki', nameJp: '檜',
    eyebrow: 'Room 04 · 客室04',
    type: 'Second Floor · Traditional Room · 2階・伝統的な客室',
    size: '10-mat Tatami', sizeShort: '10畳',
    price: 'From ¥30,000 / night · inc. breakfast',
    priceBadge: 'From ¥30,000 / night',
    cap: 6,
    lead: 'A 10-mat tatami room within the inn’s original second-floor structure, comfortably suited to up to six guests.',
    descEn: 'Original ceiling beams remain exposed above the sleeping area, and futons are made up on the floor in traditional style. Second-floor guests additionally share the balcony, engawa, and the mountain-viewing lounge — a natural gathering space for families and small groups. Private ensuite ofuro bath.',
    descJp: '宿の元の2階構造をそのまま残した10畳の和室。最大6名まで快適にご利用いただけます。寝室の上には当時の天井梁が残されています。バルコニー、縁側、山を望むラウンジを共有。専用露天風呂付き。',
    feats: ['10-Mat Tatami · 10畳', 'Up to 6 Guests · 最大6名', 'Original Roof Beams · 元の梁', 'Shared Balcony & Engawa · バルコニー・縁側', 'Mountain-viewing Lounge · 山望ラウンジ', 'Ensuite Ofuro · 専用露天風呂', 'Yukata · 浴衣'],
    bgImg: 'assets/img/room-hinoki.jpg',
    thumb: 'assets/img/room-hinoki.jpg',
    gallery: ['assets/img/room-hinoki.jpg', 'assets/img/s2-room-hinoki.jpg']
  },
  higashiyama: {
    nameEn: 'Higashiyama', nameJp: '東山',
    eyebrow: 'Room 05 · 客室05',
    type: 'Second Floor · Traditional Room · 2階・伝統的な客室',
    size: '18-mat Tatami', sizeShort: '18畳',
    price: 'From ¥35,000 / night · inc. breakfast',
    priceBadge: 'From ¥35,000 / night',
    cap: 10,
    lead: 'The largest room in the inn — 18 tatami mats accommodating up to eight to ten guests, anchored by a circular window original to the building.',
    descEn: 'Large enough for group dining within the room on request, Higashiyama sits within the inn’s preserved original architecture and looks out across the forested ridge of Hikosan. The room shares the second-floor balcony, engawa, and mountain-viewing lounge. Private ensuite ofuro bath.',
    descJp: '宿最大の客室──18畳、最大8〜10名まで対応。建物本来の円窓が特徴です。ご希望に応じて、室内での団体でのお食事にも対応できる広さです。バルコニー、縁側、ラウンジを共有。専用露天風呂付き。',
    feats: ['18-Mat Tatami · 18畳', 'Up to 8–10 Guests · 最大8〜10名', 'Circular Window · 円窓', 'Group Dining Option · 団体お食事対応', 'Shared Balcony & Engawa · バルコニー・縁側', 'Ensuite Ofuro · 専用露天風呂', 'Yukata · 浴衣'],
    bgImg: 'assets/img/room-higashiyama.jpg',
    thumb: 'assets/img/room-higashiyama.jpg',
    gallery: ['assets/img/room-higashiyama.jpg', 'assets/img/s2-room-higashiyama.jpg']
  }
};

// ─── POPULATE ROOM DETAIL ───────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function populateRoom(slug) {
  const r = ROOMS[slug];
  document.title = r.nameEn + ' · ' + SITE_TITLE;
  const bg = document.getElementById('rdh-bg');
  if (bg) bg.style.backgroundImage = "url('" + r.bgImg + "')";
  setText('rd-type', r.type);
  setText('rd-name', r.nameEn);
  setText('rd-jp', r.nameJp);
  setText('rd-size', r.sizeShort);
  setText('rd-price-hero', r.priceBadge);
  setText('rd-eyebrow', r.eyebrow);
  setText('rd-lead', r.lead);
  setText('rd-body-en', r.descEn);
  setText('rd-body-jp', r.descJp);
  setText('bk-name', r.nameEn + ' — ' + r.nameJp);
  setText('bk-price', r.price);

  const featsEl = document.getElementById('rd-feats');
  if (featsEl) featsEl.innerHTML = r.feats.map((f) => {
    const parts = f.split(' · ');
    return '<span class="feat">' + parts[0] + (parts[1] ? '<span class="feat-jp">· ' + parts[1] + '</span>' : '') + '</span>';
  }).join('');

  const galEl = document.getElementById('rd-gallery');
  if (galEl) galEl.innerHTML = r.gallery.map((src, i) =>
    '<img src="' + src + '" alt="' + r.nameEn + ' gallery ' + (i + 1) + '" loading="lazy" onclick="openLightbox(\'' + src + '\')"/>'
  ).join('');

  const guests = document.getElementById('bk-guests');
  if (guests) {
    let opts = '';
    for (let i = 1; i <= r.cap; i++) {
      opts += '<option' + (i === 2 ? ' selected' : '') + '>' + i + (i === 1 ? ' Guest · 1名' : ' Guests · ' + i + '名') + '</option>';
    }
    guests.innerHTML = opts;
  }

  const othersEl = document.getElementById('other-rooms');
  if (othersEl) {
    let out = '<div class="other-lbl">Other Rooms · 他の客室</div>';
    Object.keys(ROOMS).forEach((k) => {
      if (k === slug) return;
      const v = ROOMS[k];
      out += '<div class="other-link" onclick="goRoom(\'' + k + '\')">'
        + '<img src="' + v.thumb + '" alt="' + v.nameEn + '"/>'
        + '<div><div class="other-en">' + v.nameEn + '</div>'
        + '<div class="other-jp">' + v.nameJp + ' · ' + v.size + '</div></div>'
        + '</div>';
    });
    othersEl.innerHTML = out;
  }
}

// ─── LIGHTBOX ───────────────────────────────────────────────
function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (lb && img) { img.src = src; lb.classList.add('open'); }
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
}
document.getElementById('lightbox').addEventListener('click', function (e) {
  if (e.target === this) closeLightbox();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ─── FORMS ──────────────────────────────────────────────────
function submitBooking() {
  const bf = document.getElementById('bk-form');
  const bs = document.getElementById('bk-success');
  if (bf) bf.style.display = 'none';
  if (bs) bs.classList.add('show');
}
function submitInq(e) {
  if (e && e.preventDefault) e.preventDefault();
  const fw = document.getElementById('inq-form-wrap');
  const fs = document.getElementById('inq-success');
  if (fw) fw.style.display = 'none';
  if (fs) fs.classList.add('show');
}

// ─── SCROLL PROGRESS + FLOATING BUTTONS ─────────────────────
(function () {
  const bar = document.getElementById('progress');
  const fi = document.getElementById('float-inq');
  const snd = document.getElementById('float-snd');
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    const show = splashDone && VIEW === 'home' && window.scrollY > 500;
    if (fi) fi.classList.toggle('on', show);
    if (snd) snd.classList.toggle('on', show);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();

// ─── AMBIENT SOUND (appears only when assets/ambient.mp3 exists)
(function () {
  const a = document.getElementById('ambient');
  const b = document.getElementById('float-snd');
  if (!a || !b) return;
  a.volume = 0.35;
  a.addEventListener('loadedmetadata', () => b.classList.add('ready'));
  b.addEventListener('click', () => {
    if (a.paused) {
      a.play().then(() => {
        b.classList.add('playing');
        b.setAttribute('aria-pressed', 'true');
        b.setAttribute('aria-label', 'Pause ambient sound · 環境音を停止');
      }).catch(() => {});
    } else {
      a.pause();
      b.classList.remove('playing');
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', 'Play ambient sound · 環境音');
    }
  });
})();
