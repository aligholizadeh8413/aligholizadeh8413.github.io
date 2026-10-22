(() => {
  'use strict';
  const config = window.PORTFOLIO_CONFIG || {};
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.getElementById('site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const toast = document.getElementById('toast');
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4200);
  }
  function setMenu(open) {
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  menuToggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', event => { if (event.target.closest('a[href^="#"]')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { setMenu(false); menuToggle.focus(); }
  });
  document.addEventListener('click', event => { if (!menu.hidden && !header.contains(event.target)) setMenu(false); });
  matchMedia('(min-width: 851px)').addEventListener('change', event => { if(event.matches) setMenu(false); });
  let scrollScheduled = false;
  const updateHeader = () => { header.classList.toggle('scrolled', window.scrollY > 100); scrollScheduled = false; };
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateHeader); }
  }, {passive:true});
  updateHeader();
  document.getElementById('year').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    if (!reduceMotion.matches) {
      document.documentElement.classList.add('motion-ready');
      const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
        });
      }, {threshold:0.08, rootMargin:'0px 0px -25px 0px'});
      document.querySelectorAll('.reveal').forEach(element => reveal.observe(element));
      reduceMotion.addEventListener('change', event => {
        if (event.matches) { reveal.disconnect(); document.documentElement.classList.remove('motion-ready'); }
      });
    }
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.desktop-nav a').forEach(link => {
            const active = link.hash === '#' + entry.target.id;
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
          });
        }
      });
    }, {rootMargin:'-20% 0px -55% 0px', threshold:0});
    document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
  }

  // A missing resume has an explicit state, never a broken download link.
  document.querySelectorAll('[data-resume]').forEach(link => {
    const value = link.dataset.resume === 'cv' ? config.cvUrl : config.plainResumeUrl;
    if (value) {
      link.href = value;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('title');
      link.querySelector('span')?.remove();
      if (link.dataset.resume === 'cv') link.setAttribute('download','Ali-Gholizadeh-CV.pdf');
    } else {
      const message = link.dataset.resume === 'cv' ? 'My CV will be available here soon.' : 'The plain resume is coming soon.';
      link.addEventListener('click', event => { event.preventDefault(); notify(message); });
      link.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); notify(message); }
      });
    }
  });

  const dialog = document.getElementById('project-dialog');
  let dialogTrigger;
  let previousOverflow = '';
  document.querySelectorAll('[data-open-project]').forEach(button => button.addEventListener('click', () => {
    dialogTrigger = button;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('.dialog-close').focus();
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; dialogTrigger?.focus(); });

  const video = document.getElementById('aiodesk-video');
  if (config.aiodeskVideo) {
    video.src = config.aiodeskVideo;
    video.hidden = false;
    document.getElementById('project-poster').hidden = true;
    document.querySelector('.project-preview').hidden = true;
    document.getElementById('media-label').hidden = true;
    video.loop = true;
    if (config.aiodeskCaptions) {
      const track = document.createElement('track');
      track.kind = 'captions'; track.label = 'English'; track.srclang = 'en'; track.src = config.aiodeskCaptions;
      video.append(track);
    }
    video.addEventListener('error', () => {
      video.hidden = true;
      document.getElementById('project-poster').hidden = false;
      document.querySelector('.project-preview').hidden = false;
      document.getElementById('media-label').hidden = false;
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting && !video.paused) video.pause();
      }, {threshold:0.1}).observe(video);
    }
    document.addEventListener('visibilitychange', () => { if(document.hidden) video.pause(); });
  }

  document.getElementById('copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('aligholizadeh8413@gmail.com');
      notify('Email address copied. Let’s talk!');
    } catch (_) { notify('Email me at aligholizadeh8413@gmail.com'); }
  });
  document.getElementById('contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `[Portfolio] ${data.get('topic')}`;
    const body = `Hi Ali,\n\n${data.get('message').trim()}\n\n${data.get('name').trim()}\n${data.get('email').trim()}`;
    document.getElementById('form-feedback').textContent = 'Your email draft is ready in your email app. Review it and press Send there. If no app opens, use the email link or copy the address.';
    window.location.href = `mailto:aligholizadeh8413@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
