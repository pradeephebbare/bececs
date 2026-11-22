/* ===========================
   ECS DEPARTMENT - SCRIPT.JS
   =========================== */

'use strict';
document.documentElement.classList.add('js');

// ===========================
// NAVBAR: Scroll + Hamburger
// ===========================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('navToggle');
const navLinks = document.getElementById('mainNav');
const navLinkItems = document.querySelectorAll('.fnav-item');

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollTicking = false;
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateBackTop();
  });
}, { passive: true });

function setMobileMenu(open) {
  if (!hamburger || !navLinks) return;
  hamburger.classList.toggle('open', open);
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
}
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => setMobileMenu(!hamburger.classList.contains('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMobileMenu(false); });
  document.addEventListener('click', e => {
    if (hamburger.classList.contains('open') && !e.target.closest('#floatingNav')) setMobileMenu(false);
  });
}

// Secondary event pages use the compact legacy header markup.
const compactMenu = document.getElementById('hamburger');
const compactLinks = document.getElementById('navLinks');
if (compactMenu && compactLinks) {
  compactMenu.addEventListener('click', () => {
    const isOpen = compactMenu.classList.toggle('open');
    compactLinks.classList.toggle('open', isOpen);
    compactMenu.setAttribute('aria-expanded', String(isOpen));
  });
  const closeCompact = () => {
    compactMenu.classList.remove('open');
    compactLinks.classList.remove('open');
    compactMenu.setAttribute('aria-expanded', 'false');
  };
  compactLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeCompact));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCompact(); });
  document.addEventListener('click', e => {
    if (compactMenu.classList.contains('open') && !e.target.closest('.nav-container')) closeCompact();
  });
}

navLinkItems.forEach(link => {
  link.addEventListener('click', (event) => {
    const parent = link.closest('.has-submenu');
    if (parent) {
      event.preventDefault();
      const isOpen = parent.classList.toggle('submenu-open');
      link.setAttribute('aria-expanded', String(isOpen));
      return;
    }
    if (hamburger) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
    if (navLinks) navLinks.classList.remove('open');
  });
});
document.querySelectorAll('.submenu-item').forEach(link => link.addEventListener('click', () => {
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  if (navLinks) navLinks.classList.remove('open');
}));

// Active nav highlight: IntersectionObserver (no layout reads on every scroll tick)
(function initScrollSpy() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if (!sections.length || !navLinkItems.length || !('IntersectionObserver' in window)) return;
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinkItems.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
      window.dispatchEvent(new CustomEvent('ecs:spy', { detail: { id } }));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(sec => spy.observe(sec));
})();

// ===========================
// BACK TO TOP
// ===========================
const backTop = document.getElementById('backTop');
function updateBackTop() {
  if (!backTop) return;
  backTop.classList.toggle('visible', window.scrollY > 400);
}

// ===========================
// INTERSECTION OBSERVER: Animations
// ===========================
const animateEls = document.querySelectorAll(
  '.animate-fade-up, .animate-slide-up, .animate-slide-left, .animate-slide-right'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

animateEls.forEach(el => observer.observe(el));

// Section title underline animation
const sectionTitles = document.querySelectorAll('.section-title');
const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('animated');
  });
}, { threshold: 0.5 });
sectionTitles.forEach(t => titleObserver.observe(t));

// ===========================
// COUNTER ANIMATION
// ===========================
const counters = document.querySelectorAll('.stat-num');
let counted = false;

function startCounters() {
  if (counted) return;
  const heroSection = document.getElementById('home');
  if (!heroSection) return;
  const rect = heroSection.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    counted = true;
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1800;
      const start = 0;
      const frameMs = 16;
      const steps = Math.max(1, Math.ceil(duration / frameMs));
      const increment = target / steps;
      let current = start;
      let stepIndex = 0;

      const timer = setInterval(() => {
        stepIndex += 1;
        current = Math.min(target, current + increment);
        if (stepIndex >= steps) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = `${Math.floor(current)}${suffix}`;
      }, frameMs);
    });
  }
}

window.addEventListener('scroll', startCounters, { passive: true });
// Trigger on page load too (if hero visible)
setTimeout(startCounters, 1000);

// ===========================
// EVENTS TABS
// ===========================
const evtTabs = document.querySelectorAll('.evt-tab');
const upcomingEvents = document.getElementById('upcomingEvents');
const pastEvents = document.getElementById('pastEvents');

evtTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    evtTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.getAttribute('data-tab');
    if (which === 'upcoming') {
      upcomingEvents.classList.remove('hidden');
      pastEvents.classList.add('hidden');
    } else {
      upcomingEvents.classList.add('hidden');
      pastEvents.classList.remove('hidden');
    }
  });
});

// ===========================
// EVENT MODAL (Gallery Popup)
// ===========================
const eventModal = document.getElementById('eventModal');
const modalTitle = document.getElementById('modalTitle');
const modalGallery = document.getElementById('modalGallery');

const eventGalleries = {
  gallery1: {
    title: 'Quantitative Aptitude and Soft-Skills – Preview',
    images: [
      'sdp_events_gallery/event1.jpg',
      'sdp_events_gallery/event2.jpg',
      'sdp_events_gallery/event3.jpg',
      'sdp_events_gallery/event4.jpg',

    
    
    ]
  },
  gallery2: {
    title: 'Addvanced C Programming – Gallery',
    images: [
      'sdp_events_gallery/event6.jpg',
      'sdp_events_gallery/event5.jpeg',
    ]
  },
gallery4: {
  title: 'AADI 2024 – Freshers Celebration – Gallery',
  images: [
    'past_events_gallery/otech1.jpg',
    'past_events_gallery/otech2.jpg',
    'past_events_gallery/otech3.jpg',
  ]
},
  gallery5: {
    title: 'Showcase of Talents– Gallery',
    images: [
      'past_events_gallery/otech4.jpg',
    'past_events_gallery/otech5.jpg',
    ]
  },
  gallery6: {
    title: 'Tech Rung – Gallery',
    images: [
    'past_events_gallery/otech6.jpg',
    'past_events_gallery/otech7.jpg',
    'past_events_gallery/otech8.jpg',
    ]
  },
  gallery7: {
    title: 'Tech Rung – Gallery',
    images: [
    'past_events_gallery/otech9.jpg',
    'past_events_gallery/otech10.jpg',
    'past_events_gallery/otech11.jpg',
    ]
  },
  gallery8: {
    title: 'VISTARA-2025 – Gallery',
    images: [
    'past_events_gallery/otech12.jpeg',
    'past_events_gallery/otech13.jpeg',
    'past_events_gallery/otech14.jpeg',
    'past_events_gallery/otech15.jpeg',
    'past_events_gallery/otech16.jpeg',
    'past_events_gallery/otech17.jpeg',
    ]
  },
  gallery9: {
    title: 'Tech Rung – Gallery',
    images: [
    'past_events_gallery/otech18.jpeg',
    'past_events_gallery/otech19.jpeg',
    'past_events_gallery/otech20.jpeg',
    ]
  },
    gallery10: {
    title: 'Engineer`s Arena – Gallery',
    images: [
    'past_events_gallery/otech21.jpeg',
    'past_events_gallery/otech22.jpeg',
    'past_events_gallery/otech23.jpeg',
    'past_events_gallery/otech24.jpeg',
    'past_events_gallery/otech25.jpeg',
    'past_events_gallery/otech26.jpeg',
    ]
  },

};

// ---- Accessible dialog helpers (focus trap + focus restore) ----
let lastFocused = null;
function focusables(root) {
  return Array.from(root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter(el => el.offsetParent !== null);
}
function trapTab(e, root) {
  if (e.key !== 'Tab') return;
  const items = focusables(root);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function openModal(galleryId) {
  if (!eventModal || !modalTitle || !modalGallery) return;
  const data = Object.prototype.hasOwnProperty.call(eventGalleries, galleryId) ? eventGalleries[galleryId] : null;
  if (!data) return;
  lastFocused = document.activeElement;
  modalTitle.textContent = data.title;
  modalGallery.replaceChildren();               // no innerHTML: nothing is ever parsed as markup
  data.images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${data.title} - photo ${index + 1} of ${data.images.length}`;
    img.loading = 'eager';
    img.decoding = 'async';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.dataset.index = String(index);
    modalGallery.append(img);
  });
  eventModal.classList.add('active');
  eventModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeBtn = eventModal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  if (!eventModal) return;
  eventModal.classList.remove('active');
  eventModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

// ---- Lightbox (works on any list of images: arrows, keyboard, swipe) ----
const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCount = document.getElementById('lightboxCount');
let lightboxList = [];
let lightboxIndex = 0;
let lightboxOpener = null;

function showLightbox(index) {
  if (!lightbox || !lightboxList.length) return;
  lightboxIndex = (index + lightboxList.length) % lightboxList.length;
  const item = lightboxList[lightboxIndex];
  lightboxImg.classList.add('is-changing');
  const next = new Image();
  next.onload = next.onerror = () => {
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxImg.classList.remove('is-changing');
  };
  next.src = item.src;
  if (lightboxCount) lightboxCount.textContent = `${lightboxIndex + 1} / ${lightboxList.length}`;
  lightbox.classList.toggle('single', lightboxList.length < 2);
}

function openLightbox(list, index) {
  if (!lightbox) return;
  lightboxOpener = document.activeElement;
  lightboxList = list;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  showLightbox(index);
  const closeBtn = lightbox.querySelector('.lightbox-close');
  if (closeBtn) closeBtn.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  // keep page locked if the gallery modal is still open underneath
  document.body.style.overflow = (eventModal && eventModal.classList.contains('active')) ? 'hidden' : '';
  if (lightboxOpener && typeof lightboxOpener.focus === 'function') lightboxOpener.focus();
}

// ---- One delegated listener replaces every inline onclick="" ----
document.addEventListener('click', e => {
  const galleryBtn = e.target.closest('[data-gallery]');
  if (galleryBtn) { openModal(galleryBtn.dataset.gallery); return; }

  if (e.target.closest('[data-close-modal]') && (!e.target.closest('.modal-box') || e.target.closest('.modal-close'))) {
    closeModal(); return;
  }

  const thumb = e.target.closest('#modalGallery img');
  if (thumb) {
    const imgs = Array.from(modalGallery.querySelectorAll('img')).map(i => ({ src: i.src, alt: i.alt }));
    openLightbox(imgs, Number(thumb.dataset.index) || 0);
    return;
  }

  if (e.target.closest('[data-lightbox-prev]')) { showLightbox(lightboxIndex - 1); return; }
  if (e.target.closest('[data-lightbox-next]')) { showLightbox(lightboxIndex + 1); return; }
  if (lightbox && lightbox.classList.contains('active') && (e.target === lightbox || e.target.closest('.lightbox-close'))) {
    closeLightbox();
  }
});

document.addEventListener('keydown', e => {
  const lightboxOpen = lightbox && lightbox.classList.contains('active');
  const modalOpen = eventModal && eventModal.classList.contains('active');
  if (lightboxOpen) {
    if (e.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
    else if (e.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
    else if (e.key === 'Escape') closeLightbox();
    else trapTab(e, lightbox);
    return;
  }
  if (modalOpen) {
    if (e.key === 'Escape') closeModal();
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('#modalGallery img')) { e.preventDefault(); e.target.click(); }
    else trapTab(e, eventModal);
  }
});

// Swipe left/right on touch screens
if (lightbox) {
  let startX = 0, startY = 0;
  lightbox.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; startY = e.changedTouches[0].clientY; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) showLightbox(lightboxIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

// ===========================
// SMOOTH SCROLL for nav links
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const hash = this.getAttribute('href');
    if (!hash || hash === '#' || !hash.startsWith('#')) return;

    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===========================
// On DOMContentLoaded: Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  // Stagger visible animations already in viewport
  animateEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });
  sectionTitles.forEach(t => {
    const rect = t.getBoundingClientRect();
    if (rect.top < window.innerHeight) t.classList.add('animated');
  });
  // Floating navbar indicator logic (premium nav)
  (function initFloatingNav(){
    const fnavItems = Array.from(document.querySelectorAll('.fnav-item'));
    const indicator = document.getElementById('navIndicator');
    const floatingNav = document.getElementById('floatingNav');
    if (!fnavItems.length || !indicator || !floatingNav) return;

    function moveTo(el) {
      const navRect = floatingNav.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      // center indicator above the item
      const left = itemRect.left - navRect.left + (itemRect.width - indicator.offsetWidth) / 2;
      indicator.style.left = `${left}px`;
      indicator.style.transform = 'translateY(-6px)';
      setTimeout(() => indicator.style.transform = 'translateY(0)', 420);
    }

    // Initialize to current location or first
    const hash = location.hash || '#home';
    let activeItem = fnavItems.find(a => a.getAttribute('href') === hash) || fnavItems[0];
    moveTo(activeItem);

    window.addEventListener('ecs:spy', e => {
      const match = fnavItems.find(a => a.getAttribute('href') === '#' + e.detail.id);
      if (match && match !== activeItem) { activeItem = match; moveTo(match); }
    });

    fnavItems.forEach(a => {
      a.addEventListener('click', (e) => {
        // update active item and move indicator
        activeItem = a;
        moveTo(a);
      });
      a.addEventListener('focus', () => moveTo(a));
      a.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          a.click();
        }
      });
    });

    // Make indicator follow cursor while hovering the nav (desktop only)
    const pointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (pointerFine) {
      const navRect = floatingNav.getBoundingClientRect();
      const first = fnavItems[0].getBoundingClientRect();
      const last = fnavItems[fnavItems.length - 1].getBoundingClientRect();
      const minLeft = first.left - navRect.left - (indicator.offsetWidth - first.width) / 2;
      const maxLeft = last.left - navRect.left - (indicator.offsetWidth - last.width) / 2;

      let raf = null;
      function onMove(e) {
        const x = e.clientX - navRect.left - (indicator.offsetWidth / 2);
        const clamped = Math.max(minLeft, Math.min(maxLeft, x));
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { indicator.style.left = clamped + 'px'; });
      }
      function onLeave() {
        if (raf) cancelAnimationFrame(raf);
        moveTo(activeItem);
      }
      floatingNav.addEventListener('mousemove', onMove);
      floatingNav.addEventListener('mouseleave', onLeave);
      // update bounds on resize
      window.addEventListener('resize', () => {
        const newNavRect = floatingNav.getBoundingClientRect();
        // DOMRect properties are read-only; recalculate the offset from the latest bounds.
        moveTo(activeItem);
      });
    } else {
      window.addEventListener('resize', () => moveTo(activeItem));
    }

    // Desktop: keep the submenu open on hover/focus and allow a click to prevent the hash jump.
    // Touch devices: use a click toggle so the menu can be controlled on mobile.
    const submenuParents = Array.from(document.querySelectorAll('.has-submenu'));
    submenuParents.forEach(parent => {
      const trigger = parent.querySelector('.fnav-item');
      const menu = parent.querySelector('.submenu');
      if (!trigger || !menu) return;

      const setMenuState = (isOpen) => {
        parent.classList.toggle('open', isOpen);
        menu.style.display = isOpen ? 'block' : 'none';
        trigger.setAttribute('aria-expanded', String(isOpen));
      };

      const closeOthers = () => {
        submenuParents.forEach(other => {
          if (other !== parent) {
            other.classList.remove('open');
            const otherMenu = other.querySelector('.submenu');
            const otherTrigger = other.querySelector('.fnav-item');
            if (otherMenu) otherMenu.style.display = 'none';
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });
      };

      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 480;
      if (!isTouchDevice) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          if (parent.classList.contains('open')) {
            setMenuState(false);
            return;
          }
          closeOthers();
          setMenuState(true);
        });

        trigger.addEventListener('focus', () => {
          closeOthers();
          setMenuState(true);
        });

        parent.addEventListener('mouseenter', () => {
          closeOthers();
          setMenuState(true);
        });

        parent.addEventListener('mouseleave', () => setMenuState(false));
        menu.addEventListener('mouseleave', () => setMenuState(false));

        menu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => setMenuState(false));
        });

        return;
      }

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const currentlyOpen = parent.classList.contains('open');
        closeOthers();
        setMenuState(!currentlyOpen);
      });

      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenuState(false));
      });

      document.addEventListener('click', (ev) => {
        if (!parent.contains(ev.target)) {
          setMenuState(false);
        }
      });
    });
  })();

  // ===========================
  // GLOBAL SCROLL REVEAL (auto-attach reveal classes to common elements)
  // ===========================
  (function initScrollReveal() {
    // Respect user preference for reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // reveal everything immediately
      document.querySelectorAll('section, .section, .hero, .section-header, .section-title, .card, .gallery-item, .stat, .feature, .container > *').forEach(el => el.classList.add('revealed'));
      return;
    }

    const selectors = [
      'section', '.section', '.hero', '.section-header', '.section-title', '.card', '.gallery-item', '.stat', '.feature', '.container > *'
    ];
    const nodes = new Set();
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(n => nodes.add(n)));

    const toReveal = Array.from(nodes).filter(el => !el.closest('#navbar') && !el.classList.contains('floating-nav'));
    toReveal.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.revealDelay || '0', 10);
        if (delay) el.style.transitionDelay = delay + 'ms';
        // stagger support: if container has data-reveal="stagger", stagger children
        if (el.dataset && el.dataset.reveal === 'stagger') {
          const children = Array.from(el.children);
          children.forEach((ch, i) => {
            ch.style.transitionDelay = (i * (parseInt(el.dataset.revealDelay || '80', 10) || 80)) + 'ms';
            ch.classList.add('revealed');
          });
        } else {
          el.classList.add('revealed');
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    toReveal.forEach(el => revealObserver.observe(el));
  })();

  // Magazine feature removed per user request.
});

