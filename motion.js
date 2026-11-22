(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const root = document.documentElement;
  root.classList.add('motion-ready');

  // Lightweight scroll depth: progress indicator plus a restrained hero parallax.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  const hero = document.querySelector('.hero');
  const heroCard = document.querySelector('.hero-image-card');
  const heroVisual = document.querySelector('.hero-visual');
  const compactMotion = window.matchMedia('(max-width: 700px)').matches;
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
  let scrollFrame = 0;

  const updateScrollMotion = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${maxScroll > 0 ? window.scrollY / maxScroll : 0})`;
      if (!compactMotion && !lowPower && hero && heroCard) {
        const rect = hero.getBoundingClientRect();
        const progressInHero = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
        heroCard.style.setProperty('--scroll-depth', `${progressInHero * -26}px`);
        hero.style.setProperty('--hero-scroll', `${progressInHero * 18}px`);
      }
    });
  };
  window.addEventListener('scroll', updateScrollMotion, { passive: true });
  window.addEventListener('resize', updateScrollMotion, { passive: true });
  updateScrollMotion();

  // Perspective reveal for content groups, with a small stagger within each group.
  const revealTargets = document.querySelectorAll(
    '.section-header, .about-grid, .vision-mission, .key-features, .faculty-card, .project-card, .event-card, .lab-card, .contact-info, .contact-form-wrap, .highlight-card, .qnav-card'
  );
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('motion-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -4% 0px' });

  revealTargets.forEach((element, index) => {
    if (element.matches('.animate-fade-up, .animate-slide-up, .animate-slide-left, .animate-slide-right')) return;
    element.classList.add('motion-reveal');
    element.style.setProperty('--motion-delay', `${Math.min(index % 5, 4) * 55}ms`);
    revealObserver.observe(element);
  });

  // Gentle pointer tilt adds depth on mouse/trackpad, while touch stays simple.
  const tiltTargets = document.querySelectorAll('.faculty-card, .project-card, .event-card, .lab-card');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tiltTargets.forEach(card => {
      card.classList.add('tilt-card');
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const px = (event.clientX - bounds.left) / bounds.width;
        const py = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--tilt-x', `${(0.5 - py) * 5}deg`);
        card.style.setProperty('--tilt-y', `${(px - 0.5) * 6}deg`);
        card.style.setProperty('--glow-x', `${px * 100}%`);
        card.style.setProperty('--glow-y', `${py * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--glow-x', '50%');
        card.style.setProperty('--glow-y', '50%');
      });
    });

    if (heroVisual && heroCard) {
      heroVisual.addEventListener('pointermove', event => {
        const bounds = heroVisual.getBoundingClientRect();
        const px = (event.clientX - bounds.left) / bounds.width;
        const py = (event.clientY - bounds.top) / bounds.height;
        heroCard.style.setProperty('--hero-tilt-x', `${(0.5 - py) * 5}deg`);
        heroCard.style.setProperty('--hero-tilt-y', `${(px - 0.5) * 7}deg`);
      });
      heroVisual.addEventListener('pointerleave', () => {
        heroCard.style.setProperty('--hero-tilt-x', '0deg');
        heroCard.style.setProperty('--hero-tilt-y', '0deg');
      });
    }
  }
})();
