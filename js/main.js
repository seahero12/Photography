// ── Scroll Reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Active Nav ──
const currentFile = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.main-nav a').forEach(link => {
  const linkFile = link.getAttribute('href').split('#')[0];
  if (linkFile === currentFile || (currentFile === '' && linkFile === 'index.html')) {
    link.classList.add('active');
  }
});

// Mark Galleries active when on any project page
if (document.querySelector('.project-nav')) {
  document.querySelectorAll('.main-nav a').forEach(link => {
    if (link.getAttribute('href') === 'galleries.html') {
      link.classList.add('active');
    }
  });
}

// ── Project Sub-Nav: highlight current + scroll into view ──
const projectNavList = document.querySelector('.project-nav__list');
if (projectNavList) {
  projectNavList.querySelectorAll('a').forEach(link => {
    if (link.getAttribute('href') === currentFile) {
      link.classList.add('active');
      requestAnimationFrame(() => {
        link.scrollIntoView({ inline: 'center', block: 'nearest' });
      });
    }
  });
}

// ── Lightbox ──
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Photo viewer');
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close photo viewer">&#x2715;</button>
    <button class="lightbox-prev" aria-label="Previous photo">&#8592;</button>
    <button class="lightbox-next" aria-label="Next photo">&#8594;</button>
    <div class="lightbox-inner">
      <img class="lightbox-img" src="" alt="" />
      <p class="lightbox-caption"></p>
    </div>
  `;
  document.body.appendChild(overlay);

  let pool = [];
  let idx = 0;

  function show() {
    const { src, alt, caption } = pool[idx];
    overlay.querySelector('.lightbox-img').src = src;
    overlay.querySelector('.lightbox-img').alt = alt;
    overlay.querySelector('.lightbox-caption').textContent = caption;
    const hasMultiple = pool.length > 1;
    overlay.querySelector('.lightbox-prev').hidden = !hasMultiple;
    overlay.querySelector('.lightbox-next').hidden = !hasMultiple;
  }

  function open(images, startIdx) {
    pool = images;
    idx = startIdx;
    show();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('.lightbox-close').focus();
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  overlay.querySelector('.lightbox-close').addEventListener('click', close);
  overlay.querySelector('.lightbox-prev').addEventListener('click', () => {
    idx = (idx - 1 + pool.length) % pool.length;
    show();
  });
  overlay.querySelector('.lightbox-next').addEventListener('click', () => {
    idx = (idx + 1) % pool.length;
    show();
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') { idx = (idx - 1 + pool.length) % pool.length; show(); }
    if (e.key === 'ArrowRight') { idx = (idx + 1) % pool.length; show(); }
  });

  document.querySelectorAll('.photo-grid').forEach(grid => {
    const imgs = [...grid.querySelectorAll('img')];
    const imageData = imgs.map(img => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
      caption: img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() ?? ''
    }));
    imgs.forEach((img, i) => {
      img.addEventListener('click', () => open(imageData, i));
    });
  });
})();
