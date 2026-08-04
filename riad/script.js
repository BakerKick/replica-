/* Riad Sa'eed replica — interactions */
(function () {
  'use strict';

  /* ── Preloader ── */
  const preloader = document.getElementById('preloader');
  const preloaderInner = document.getElementById('preloader-inner');
  const preloaderLine = document.getElementById('preloader-line');

  requestAnimationFrame(() => {
    if (preloaderInner) {
      preloaderInner.style.opacity = '1';
      preloaderInner.style.transform = 'scale(1)';
    }
    if (preloaderLine) preloaderLine.style.transform = 'scaleX(1)';
  });

  window.addEventListener('load', () => hidePreloader(600));
  // Safety net in case load hangs on slow assets
  setTimeout(() => hidePreloader(0), 3500);

  let preloaderHidden = false;
  function hidePreloader(delay) {
    if (preloaderHidden || !preloader) return;
    preloaderHidden = true;
    setTimeout(() => {
      preloader.classList.add('done');
      setTimeout(() => preloader.remove(), 900);
    }, delay);
  }

  /* ── Scroll progress bar ── */
  const progress = document.getElementById('scroll-progress');
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const frac = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = 'scaleX(' + frac + ')';
  }

  /* ── Header scrolled state + floating buttons ── */
  const header = document.getElementById('site-header');
  const whatsappBtn = document.getElementById('whatsapp-btn');
  const musicBtn = document.getElementById('music-btn');

  function updateHeader() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 60);
    const show = y > 300;
    [whatsappBtn, musicBtn].forEach((btn) => {
      if (!btn) return;
      btn.classList.toggle('opacity-0', !show);
      btn.classList.toggle('pointer-events-none', !show);
      btn.classList.toggle('translate-y-8', !show && btn === whatsappBtn);
      btn.classList.toggle('translate-y-4', !show && btn === musicBtn);
    });
  }

  window.addEventListener('scroll', () => {
    updateProgress();
    updateHeader();
  }, { passive: true });
  updateProgress();
  updateHeader();

  /* ── Mobile menu ── */
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      mobileMenu.classList.toggle('flex', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  /* ── Star ratings (5 gold stars per .stars container) ── */
  const STAR =
    '<svg viewBox="0 0 20 20" class="h-4 w-4 text-gold" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
  document.querySelectorAll('.stars').forEach((el) => {
    el.innerHTML = STAR.repeat(5);
  });

  /* ── Reveal on scroll ── */
  const revealables = document.querySelectorAll('[data-reveal]');
  const lines = document.querySelectorAll('[data-line]');
  const dots = document.querySelectorAll('[data-dot], [data-star]');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.hasAttribute('data-reveal')) {
          el.classList.add('revealed');
        }
        if (el.hasAttribute('data-line')) {
          el.style.width = '60px';
          el.style.opacity = '1';
        }
        if (el.hasAttribute('data-dot') || el.hasAttribute('data-star')) {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)' + (el.hasAttribute('data-star') ? ' rotate(0deg)' : '');
        }
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealables.forEach((el) => io.observe(el));
  lines.forEach((el) => io.observe(el));
  dots.forEach((el) => io.observe(el));

  /* Hero content is above the fold — reveal it right after the preloader */
  setTimeout(() => {
    document
      .querySelectorAll('section:first-of-type [data-reveal], section:first-of-type [data-line]')
      .forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('revealed');
          if (el.hasAttribute('data-line')) {
            el.style.width = '60px';
            el.style.opacity = '1';
          }
        }, i * 150);
      });
  }, 900);
})();
