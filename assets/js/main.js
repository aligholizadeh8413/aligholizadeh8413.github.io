/* =========================================================
   Ali Gholizadeh — Portfolio
   main.js — no build step needed, plain vanilla JS
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
  const deviconUrl = (slug, version) => `${DEVICON_BASE}/${slug}/${slug}-${version}.svg`;

  /* ---------------------------------------------------------
     1. Nav: scrolled state + mobile burger + active link
     --------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinksWrap = document.getElementById('navLinks');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', () => {
    const isOpen = navLinksWrap.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinksWrap.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinksWrap.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  const sectionIds = ['about', 'projects', 'education', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => navObserver.observe(s));
  }

  /* ---------------------------------------------------------
     2. Scroll reveal animation for [data-reveal] elements
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach(el => {
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.setProperty('--d', delay);
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     3. Animated stat counters (hero)
     --------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const countObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(c => countObserver.observe(c));
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------------------------------------------------------
     4. Tech marquee (built from one data source, duplicated
        so the CSS animation loops seamlessly)
     --------------------------------------------------------- */
  const stack = [
    { name: 'Python', slug: 'python', v: 'original' },
    { name: 'Django', slug: 'django', v: 'plain' },
    { name: 'JavaScript', slug: 'javascript', v: 'original' },
    { name: 'HTML5', slug: 'html5', v: 'original' },
    { name: 'CSS3', slug: 'css3', v: 'original' },
    { name: 'MySQL', slug: 'mysql', v: 'original' },
    { name: 'MongoDB', slug: 'mongodb', v: 'original' },
    { name: 'Redis', slug: 'redis', v: 'original' },
    { name: 'Docker', slug: 'docker', v: 'original' },
    { name: 'Nginx', slug: 'nginx', v: 'original' },
    { name: 'Git', slug: 'git', v: 'original' },
    { name: 'Linux', slug: 'linux', v: 'original' },
  ];
  const marqueeTrack = document.getElementById('stackMarquee');
  if (marqueeTrack) {
    const itemsHtml = stack.map(t => `
      <span class="marquee__item">
        <span class="marquee__icon"><img src="${deviconUrl(t.slug, t.v)}" alt="" loading="lazy"></span>
        ${t.name}
      </span>`).join('');
    marqueeTrack.innerHTML = itemsHtml + itemsHtml; // duplicate for seamless loop
  }

  /* ---------------------------------------------------------
     5. Toolbox grid (icons + custom line icons for concepts
        that don't have an official logo)
     --------------------------------------------------------- */
  const customIcon = {
    oop: `<svg viewBox="0 0 24 24"><path d="M12 2l9 5-9 5-9-5 9-5z" fill="#ff6a35"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5" stroke="#ff6a35" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    patterns: `<svg viewBox="0 0 24 24"><path d="M9 3h4v2.2a2 2 0 104 0V3h4v4h-2.2a2 2 0 100 4H21v4h-4v-2.2a2 2 0 10-4 0V15H9v-4H6.8a2 2 0 100-4H9V3z" fill="#ff6a35"/></svg>`,
    testing: `<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 8.4-8 11-4.6-2.6-8-6-8-11V5l8-3z" fill="none" stroke="#ff6a35" stroke-width="1.6"/><path d="M8.5 12.2l2.3 2.3 4.7-4.7" stroke="#ff6a35" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    vps: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="6" rx="1.4" fill="none" stroke="#ff6a35" stroke-width="1.6"/><rect x="4" y="14" width="16" height="6" rx="1.4" fill="none" stroke="#ff6a35" stroke-width="1.6"/><circle cx="7.3" cy="7" r="1" fill="#ff6a35"/><circle cx="7.3" cy="17" r="1" fill="#ff6a35"/></svg>`,
    cicd: `<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0113-6.1M20 12a8 8 0 01-13 6.1" stroke="#ff6a35" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M17 3v4h-4M7 21v-4h4" stroke="#ff6a35" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    network: `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.3" fill="#ff6a35"/><circle cx="5" cy="19" r="2.3" fill="#ff6a35"/><circle cx="19" cy="19" r="2.3" fill="#ff6a35"/><path d="M12 7.3L6.3 17.3M12 7.3l5.7 10M7 19h10" stroke="#ff6a35" stroke-width="1.5" fill="none"/></svg>`,
  };

  const toolCategories = [
    {
      title: 'Languages',
      items: [
        { name: 'Python', icon: deviconUrl('python', 'original') },
        { name: 'C++', icon: deviconUrl('cplusplus', 'original') },
        { name: 'JavaScript', icon: deviconUrl('javascript', 'original') },
        { name: 'HTML5', icon: deviconUrl('html5', 'original') },
        { name: 'CSS3', icon: deviconUrl('css3', 'original') },
      ],
    },
    {
      title: 'Backend & concepts',
      items: [
        { name: 'Django', icon: deviconUrl('django', 'plain') },
        { name: 'OOP', svg: customIcon.oop },
        { name: 'Design patterns', svg: customIcon.patterns },
        { name: 'Unit testing', svg: customIcon.testing },
        { name: 'Selenium', icon: deviconUrl('selenium', 'original') },
        { name: 'RabbitMQ', icon: deviconUrl('rabbitmq', 'original') },
      ],
    },
    {
      title: 'Databases',
      items: [
        { name: 'MySQL', icon: deviconUrl('mysql', 'original') },
        { name: 'MongoDB', icon: deviconUrl('mongodb', 'original') },
        { name: 'Redis', icon: deviconUrl('redis', 'original') },
        { name: 'SQLite', icon: deviconUrl('sqlite', 'original') },
      ],
    },
    {
      title: 'DevOps & deployment',
      items: [
        { name: 'Docker', icon: deviconUrl('docker', 'original') },
        { name: 'Nginx', icon: deviconUrl('nginx', 'original') },
        { name: 'VPS deployment', svg: customIcon.vps },
        { name: 'CI/CD', svg: customIcon.cicd },
        { name: 'Git', icon: deviconUrl('git', 'original') },
        { name: 'Linux', icon: deviconUrl('linux', 'original') },
      ],
    },
    {
      title: 'Other skills',
      items: [
        { name: 'macOS', icon: deviconUrl('apple', 'original') },
        { name: 'Network+', svg: customIcon.network },
        { name: 'Photoshop', icon: deviconUrl('photoshop', 'original') },
        { name: 'Illustrator', icon: deviconUrl('illustrator', 'original') },
      ],
    },
  ];

  const toolsGrid = document.getElementById('toolsGrid');
  if (toolsGrid) {
    toolsGrid.innerHTML = toolCategories.map((cat, i) => `
      <div class="tool-panel" data-reveal data-reveal-delay="${i}">
        <h4>${cat.title}</h4>
        <div class="tool-items">
          ${cat.items.map(item => `
            <div class="tool-item">
              <span class="tool-chip">${item.svg ? item.svg : `<img src="${item.icon}" alt="" loading="lazy">`}</span>
              ${item.name}
            </div>`).join('')}
        </div>
      </div>`).join('');

    // newly injected [data-reveal] panels need to be picked up by the observer
    const newReveals = toolsGrid.querySelectorAll('[data-reveal]');
    newReveals.forEach(el => {
      const delay = el.getAttribute('data-reveal-delay');
      if (delay) el.style.setProperty('--d', delay);
    });
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            o.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      newReveals.forEach(el => obs.observe(el));
    } else {
      newReveals.forEach(el => el.classList.add('is-visible'));
    }
  }

  /* ---------------------------------------------------------
     6. Featured project video — graceful fallback when the
        real video file hasn't been added yet
     --------------------------------------------------------- */
  const video = document.getElementById('aiodeskVideo');
  const fallback = document.getElementById('aiodeskFallback');
  const playBtn = document.getElementById('aiodeskPlay');
  const playIcon = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';

  if (video && fallback && playBtn) {
    playBtn.hidden = true;

    video.addEventListener('loadeddata', () => {
      fallback.style.display = 'none';
      playBtn.hidden = false;
      video.play().catch(() => {});
      playBtn.innerHTML = pauseIcon;
    });

    video.addEventListener('error', () => {
      playBtn.hidden = true; // nothing to play yet — keep the "coming soon" message
    });

    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playBtn.innerHTML = pauseIcon;
      } else {
        video.pause();
        playBtn.innerHTML = playIcon;
      }
    });
  }

  /* ---------------------------------------------------------
     7. Toast helper, used by the CV / resume placeholder buttons
     --------------------------------------------------------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const cvBtn = document.getElementById('downloadCvBtn');
  const resumeBtn = document.getElementById('plainResumeBtn');
  if (cvBtn) cvBtn.addEventListener('click', () => showToast('CV file is not linked yet — add it to assets/files/'));
  if (resumeBtn) resumeBtn.addEventListener('click', () => showToast('Plain resume page is coming soon'));

  /* ---------------------------------------------------------
     8. Contact form — static site, so it opens the visitor's
        email app via the mailto form action. Swap this for
        Formspree / EmailJS later for a no-redirect version.
     --------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (form && formNote) {
    form.addEventListener('submit', () => {
      formNote.textContent = 'Opening your email app…';
    });
  }

  /* ---------------------------------------------------------
     9. Footer year
     --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
