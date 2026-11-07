(() => {
  const button = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  button?.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
    button?.setAttribute('aria-label', 'Abrir menu');
  }));
  const sections = document.querySelectorAll('.momento');
  const cine = document.querySelector('.cine');
  let scheduled = false;
  const updateCine = () => {
    scheduled = false;
    if (!cine) return;
    const rect = cine.getBoundingClientRect();
    const travel = Math.max(1, cine.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    const active = Math.min(2, Math.floor(progress * 3));
    sections.forEach((section, i) => section.classList.toggle('is-active', i === active));
    document.querySelector('.progress i')?.style.setProperty('transform', `scaleX(${progress})`);
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateCine); }
  }, { passive: true });
  window.addEventListener('resize', updateCine);
  updateCine();
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));
  const year = document.getElementById('ano');
  if (year) year.textContent = new Date().getFullYear();

  const writer = document.querySelector('[data-typewriter]');
  if (writer) {
    const copy = writer.dataset.text || writer.textContent.trim();
    writer.setAttribute('aria-label', copy);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      writer.textContent = copy;
    } else {
      writer.textContent = '';
      let started = false;
      const type = () => {
        if (started) return;
        started = true;
        let i = 0;
        const tick = () => {
          writer.textContent = copy.slice(0, i++);
          if (i <= copy.length) window.setTimeout(tick, 24);
        };
        tick();
      };
      const typeObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          type();
          typeObserver.disconnect();
        }
      }, { threshold: .25 });
      typeObserver.observe(writer);
    }
  }

  const feedbackTrack = document.getElementById('feedback-track');
  if (feedbackTrack) {
    const slides = [...feedbackTrack.querySelectorAll('.feedback-slide')];
    const counter = document.getElementById('feedback-count');
    let current = 0;
    const showFeedback = (index, direction) => {
      current = (index + slides.length) % slides.length;
      feedbackTrack.dataset.direction = direction;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.hidden = !active;
        slide.classList.toggle('is-current', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };
    document.querySelector('[data-feedback-prev]')?.addEventListener('click', () => showFeedback(current - 1, 'previous'));
    document.querySelector('[data-feedback-next]')?.addEventListener('click', () => showFeedback(current + 1, 'next'));
    feedbackTrack.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); showFeedback(current - 1, 'previous'); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showFeedback(current + 1, 'next'); }
    });
    let touchStart = 0;
    feedbackTrack.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
    feedbackTrack.addEventListener('touchend', event => {
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 45) showFeedback(current + (distance < 0 ? 1 : -1), distance < 0 ? 'next' : 'previous');
    }, { passive: true });
  }
})();
