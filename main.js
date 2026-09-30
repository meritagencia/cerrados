/* ═══════════════════════════════════════════════════
   CERRADO IMOBILIÁRIA — MAIN JS
   Apple-inspired animations & interactions
   ═══════════════════════════════════════════════════ */

'use strict';



/* ── NAV: SCROLL STYLE ── */
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  if (sy > 48) {
    mainNav.classList.add('scrolled');
  } else {
    mainNav.classList.remove('scrolled');
  }
  lastScrollY = sy;
}, { passive: true });

/* ── NAV: MOBILE HAMBURGER ── */
const hamburger  = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── HERO PARALLAX ── */
const heroBg = document.getElementById('hero-bg');
const heroScrollHint = document.getElementById('hero-scroll-hint');

window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  if (heroBg) {
    const factor = sy * 0.3;
    heroBg.style.transform = `scale(1.05) translateY(${factor}px)`;
  }
  if (heroScrollHint) {
    heroScrollHint.style.opacity = Math.max(0, 1 - sy / 300);
  }
}, { passive: true });

/* ── REVEAL ON SCROLL (IntersectionObserver) ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll('.reveal-up, .reveal-fade').forEach(el => {
  revealObserver.observe(el);
});

/* ── TAGLINE WORD-BY-WORD REVEAL ── */
const taglineWords = document.querySelectorAll('.tagline__word');
const taglineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      taglineWords.forEach((word, i) => {
        setTimeout(() => {
          word.classList.add('visible');
        }, i * 100);
      });
      taglineObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

if (taglineWords.length) {
  taglineObserver.observe(document.getElementById('tagline-text'));
}

/* ── ANIMATED COUNTERS ── */
function animateCounter(el, target, duration = 2000) {
  let start = null;
  const startVal = 0;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    el.textContent = Math.floor(eased * (target - startVal) + startVal).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat__number');
      nums.forEach(num => {
        const target = parseInt(num.dataset.target, 10);
        animateCounter(num, target);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) counterObserver.observe(statsSection);

/* ── PARALLAX IMAGES ── */
const parallaxImgs = document.querySelectorAll('.parallax-img');

window.addEventListener('scroll', () => {
  parallaxImgs.forEach(img => {
    const rect   = img.closest('.feature-section__img-wrap').getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const vhCenter = window.innerHeight / 2;
    const offset = (center - vhCenter) * parseFloat(img.dataset.speed || 0.07);
    img.style.transform = `translateY(${offset}px)`;
  });
}, { passive: true });

/* ── GALLERY DRAG SCROLL ── */
const galleryWrap  = document.querySelector('.gallery-scroll-wrap');
const galleryTrack = document.getElementById('gallery-track');

if (galleryWrap) {
  let isDown    = false;
  let startX    = 0;
  let scrollLeft = 0;
  let velocity  = 0;
  let lastX     = 0;
  let rafId;

  galleryWrap.addEventListener('mousedown', e => {
    isDown = true;
    galleryWrap.classList.add('dragging');
    startX    = e.pageX - galleryWrap.offsetLeft;
    scrollLeft = galleryWrap.scrollLeft;
    lastX     = e.pageX;
    cancelAnimationFrame(rafId);
  });

  galleryWrap.addEventListener('mouseleave', () => {
    isDown = false;
    galleryWrap.classList.remove('dragging');
    applyMomentum();
  });

  galleryWrap.addEventListener('mouseup', () => {
    isDown = false;
    galleryWrap.classList.remove('dragging');
    applyMomentum();
  });

  galleryWrap.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - galleryWrap.offsetLeft;
    const walk = (x - startX) * 1.5;
    velocity   = e.pageX - lastX;
    lastX      = e.pageX;
    galleryWrap.scrollLeft = scrollLeft - walk;
  });

  // Touch support
  let touchStartX = 0;
  let touchScrollLeft = 0;

  galleryWrap.addEventListener('touchstart', e => {
    touchStartX    = e.touches[0].pageX;
    touchScrollLeft = galleryWrap.scrollLeft;
    cancelAnimationFrame(rafId);
  }, { passive: true });

  galleryWrap.addEventListener('touchmove', e => {
    const diff = touchStartX - e.touches[0].pageX;
    galleryWrap.scrollLeft = touchScrollLeft + diff;
  }, { passive: true });

  function applyMomentum() {
    if (Math.abs(velocity) < 1) return;
    velocity *= 0.92;
    galleryWrap.scrollLeft -= velocity;
    rafId = requestAnimationFrame(applyMomentum);
  }
}

/* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const offset = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

/* ── CONTACT FORM SUBMIT ── */
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('form-submit');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const nome     = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const interesse = document.getElementById('interesse').value;

    if (!nome || !telefone) {
      shake(submitBtn);
      return;
    }

    submitBtn.querySelector('span').textContent = 'Enviando...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    const payload = {
      nome: nome,
      telefone: telefone,
      interesse: interesse
    };

    fetch('https://hook.us2.make.com/vo36k7mk8wgsu9lhb7ajsb6ks12wve3d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(() => {
      submitBtn.querySelector('span').textContent = '✓ Redirecionando...';
      submitBtn.style.background = '#4A7C59';
      submitBtn.style.opacity = '1';
      window.location.href = 'obrigado.html';
    })
    .catch(err => {
      console.error(err);
      submitBtn.querySelector('span').textContent = 'Erro ao enviar. Tente novamente.';
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Quero ser atendido';
        submitBtn.style.opacity = '1';
      }, 3000);
    });
  });
}

function shake(el) {
  el.style.animation = 'none';
  el.style.transform = 'translateX(-8px)';
  setTimeout(() => { el.style.transform = 'translateX(8px)'; }, 80);
  setTimeout(() => { el.style.transform = 'translateX(-5px)'; }, 160);
  setTimeout(() => { el.style.transform = 'translateX(5px)'; }, 240);
  setTimeout(() => { el.style.transform = 'translateX(0)'; }, 320);
}

/* ── WHATSAPP BUTTON ENTRANCE ── */
const wabtn = document.getElementById('whatsapp-btn');
if (wabtn) {
  wabtn.style.opacity = '0';
  wabtn.style.transform = 'scale(0.5) translateY(20px)';
  setTimeout(() => {
    wabtn.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    wabtn.style.opacity = '1';
    wabtn.style.transform = 'scale(1) translateY(0)';
  }, 2000);
}

/* ── ACTIVE NAV LINK ON SCROLL ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));

/* ── NAV LINK ACTIVE STYLE ── */
const style = document.createElement('style');
style.textContent = `.nav__link.active { opacity: 1; font-weight: 600; }`;
document.head.appendChild(style);

/* ── PAGE LOAD REVEAL ── */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  // Stagger hero elements
  const heroEls = document.querySelectorAll('#hero-eyebrow, #hero-title, #hero-subtitle, .hero__actions');
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    setTimeout(() => {
      el.style.transition = `opacity 0.8s ease, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 400 + i * 150);
  });
});

console.log('%c🌿 Cerrado Imobiliária', 'font-size:20px; font-weight:bold; color:#8B5E3C;');
console.log('%cFeito com ❤️ e inspiração Apple.', 'font-size:13px; color:#C8845A;');

/* ── INTERIOR CAROUSEL LOGIC ── */
function setupCarousel(trackId) {
  const track = document.getElementById(trackId + '-track');
  const wrapper = document.getElementById(trackId);
  if (!track || !wrapper) return;

  const prevBtn = wrapper.querySelector('.simple-carousel__btn--prev');
  const nextBtn = wrapper.querySelector('.simple-carousel__btn--next');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      const width = track.clientWidth;
      track.scrollBy({ left: -width, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      const width = track.clientWidth;
      track.scrollBy({ left: width, behavior: 'smooth' });
    });
  }
}

setupCarousel('interior-carousel');
setupCarousel('condo-carousel');
setupCarousel('company-carousel');

/* ── MODAL LOGIC ── */
const modal = document.getElementById('contact-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const openModalBtns = document.querySelectorAll('.open-modal-btn, #open-modal-btn, #hero-cta-primary');

function openModal(e) {
  if (e) e.preventDefault();
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

if (modal) {
  openModalBtns.forEach(btn => btn.addEventListener('click', openModal));
  modalOverlay.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
}

