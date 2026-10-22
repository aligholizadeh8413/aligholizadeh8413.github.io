(() => {
  'use strict';
  const config = window.PORTFOLIO_CONFIG || {};
  // Older mobile browsers expose addListener instead of addEventListener.
  function watchMedia(query, listener) {
    if (query.addEventListener) query.addEventListener('change', listener);
    else if (query.addListener) query.addListener(listener);
  }
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
  watchMedia(matchMedia('(min-width: 851px)'), event => { if(event.matches) setMenu(false); });
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
      watchMedia(reduceMotion, event => {
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
    const value = config.cvUrl;
    if (value) {
      link.href = value;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('title');
      link.querySelector('span')?.remove();
      if (link.dataset.resume === 'cv') link.setAttribute('download','Ali-Gholizadeh-CV.pdf');
    } else {
      const message = 'My CV will be available here soon.';
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
    initializeGallery();
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

  // Thumbnails load when the project opens; missing screenshots have an honest empty state.
  const galleryEntries = (config.projectGallery || []).slice(0, 4);
  const galleryGrid = document.getElementById('gallery-grid');
  const viewer = document.getElementById('gallery-viewer');
  const viewerImage = document.getElementById('viewer-image');
  const galleryCards = [];
  let galleryInitialized = false;
  let activeImage = 0;
  let imageTrigger;

  function gallerySource(src, retry = false) {
    const url = new URL(src, document.baseURI);
    url.searchParams.set('gallery', '4');
    if (retry) url.searchParams.set('retry', Date.now().toString());
    return url.href;
  }

  function initializeGallery() {
    if (galleryInitialized) return;
    galleryInitialized = true;
    galleryEntries.forEach((entry, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gallery-card';
      card.disabled = true;
      card.style.setProperty('--card-index', index);
      card.setAttribute('aria-label', `Enlarge ${entry.title}`);
      card.innerHTML = '<span class="gallery-empty"><svg class="icon" aria-hidden="true"><use href="#i-image"/></svg><span>Preview coming soon</span></span><span class="gallery-card-caption"><strong></strong><span></span></span><span class="gallery-expand" aria-hidden="true"><svg class="icon"><use href="#i-arrow"/></svg></span>';
      card.querySelector('strong').textContent = entry.title;
      card.querySelector('.gallery-card-caption > span').textContent = entry.description;
      const img = document.createElement('img');
      img.alt = entry.title + ' — AioDesk';
      img.hidden = true;
      img.loading = 'eager';
      const finishLoading = () => {
        if (!img.naturalWidth) return;
        card.disabled = false;
        card.classList.add('has-image');
        card.querySelector('.gallery-empty').hidden = true;
        img.hidden = false;
        card.querySelector('.gallery-empty > span').textContent = 'Preview coming soon';
        card.setAttribute('aria-label', `Enlarge ${entry.title}`);
      };
      img.addEventListener('load', finishLoading);
      img.addEventListener('error', () => {
        card.disabled = false;
        card.setAttribute('aria-label', `Retry ${entry.title} image`);
        card.querySelector('.gallery-empty > span').textContent = 'Image unavailable · tap to retry';
        card.classList.remove('has-image');
        img.hidden = true;
        card.querySelector('.gallery-empty').hidden = false;
      });
      card.prepend(img);
      galleryGrid.append(card);
      galleryCards.push(card);
      card.addEventListener('click', () => {
        if (!card.classList.contains('has-image')) {
          card.disabled = true;
          card.querySelector('.gallery-empty > span').textContent = 'Loading image…';
          img.src = gallerySource(entry.src, true);
          return;
        }
        imageTrigger = card;
        showImage(index);
        viewer.showModal();
        viewer.querySelector('.viewer-close').focus();
      });
      if (entry.src) {
        img.src = gallerySource(entry.src);
        if (img.complete && img.naturalWidth) finishLoading();
      }
    });
  }

  function showImage(index) {
    activeImage = index;
    const entry = galleryEntries[index];
    viewer.classList.add('is-loading');
    document.getElementById('viewer-error').hidden = true;
    document.getElementById('viewer-title').textContent = entry.title;
    document.getElementById('viewer-description').textContent = entry.description;
    document.getElementById('viewer-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(galleryEntries.length).padStart(2, '0')} — AIODESK`;
    viewerImage.alt = entry.title + ' — ' + entry.description;
    viewerImage.src = galleryCards[index].querySelector('img').src;
    if (viewerImage.complete && viewerImage.naturalWidth) viewer.classList.remove('is-loading');
    const navigationDisabled = galleryCards.filter(card => card.classList.contains('has-image')).length < 2;
    document.getElementById('viewer-previous').disabled = navigationDisabled;
    document.getElementById('viewer-next').disabled = navigationDisabled;
  }

  function stepImage(direction) {
    for (let step = 1; step < galleryEntries.length; step++) {
      const next = (activeImage + direction * step + galleryEntries.length) % galleryEntries.length;
      if (galleryCards[next].classList.contains('has-image')) { showImage(next); return; }
    }
  }
  viewerImage.addEventListener('load', () => viewer.classList.remove('is-loading'));
  viewerImage.addEventListener('error', () => {
    document.getElementById('viewer-error').hidden = false;
  });
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  document.getElementById('viewer-previous').addEventListener('click', () => stepImage(-1));
  document.getElementById('viewer-next').addEventListener('click', () => stepImage(1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepImage(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); stepImage(1); }
  });
  viewer.addEventListener('close', () => { imageTrigger?.focus(); });
  viewer.addEventListener('click', event => {
    const rect = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) viewer.close();
  });

  const video = document.getElementById('aiodesk-video');
  if (config.aiodeskVideo) {
    // Set inaudible, inline playback before attaching the source.
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.controls = false;
    video.loop = true;
    const tryAutoplay = () => {
      if (video.hidden || video.error || document.hidden) return;
      const playback = video.play();
      if (playback) playback.catch(() => {
        // Respect browser autoplay settings; do not show native controls.
      });
    };
    video.addEventListener('loadedmetadata', () => {
      if (video.videoWidth && video.videoHeight) {
        video.parentElement.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      }
    });
    video.addEventListener('canplay', tryAutoplay);
    video.src = config.aiodeskVideo;
    video.hidden = false;
    document.getElementById('project-poster').hidden = true;
    document.querySelector('.project-preview').hidden = true;
    document.getElementById('media-label').hidden = true;
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
      video.parentElement.style.removeProperty('aspect-ratio');
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) tryAutoplay();
      }, {threshold:0.1}).observe(video);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tryAutoplay(); });
    window.addEventListener('pageshow', tryAutoplay);
    tryAutoplay();
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
