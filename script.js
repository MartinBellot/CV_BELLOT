// Theme toggle
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('cv-theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  if (next === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
  localStorage.setItem('cv-theme', next);
});

// PDF export → uses native print to PDF (best fidelity, no extra libs)
document.getElementById('downloadPdf').addEventListener('click', () => {
  const originalTitle = document.title;
  document.title = 'CV_Martin_Bellot';
  window.print();
  setTimeout(() => { document.title = originalTitle; }, 1000);
});

// Subtle reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.section, .hero').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = `opacity 0.6s ease ${i * 0.06}s, transform 0.6s cubic-bezier(.2,.7,.2,1) ${i * 0.06}s`;
  io.observe(el);
});
