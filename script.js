// Theme toggle (default = light; dark via [data-theme="dark"])
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('cv-theme');
if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');

themeToggle.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  if (next === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
  localStorage.setItem('cv-theme', next);
});

// PDF export → uses html2pdf.js for true full-bleed (no Chrome margins)
const downloadBtn = document.getElementById('downloadPdf');

// Inside the html2canvas-cloned document, rewrite every `@media print`
// rule to `all` so the screen capture uses the print layout.
function activatePrintRulesIn(doc) {
  for (const sheet of doc.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    if (!rules) continue;
    for (const rule of rules) {
      if (rule.type === CSSRule.MEDIA_RULE &&
          /\bprint\b/i.test(rule.media.mediaText)) {
        try { rule.media.mediaText = 'all'; } catch { /* read-only sheet */ }
      }
    }
  }
}

async function exportPdf() {
  if (typeof html2pdf === 'undefined') {
    alert('Bibliothèque PDF en cours de chargement, réessayez dans une seconde.');
    return;
  }

  downloadBtn.disabled = true;
  const originalLabel = downloadBtn.innerHTML;
  downloadBtn.innerHTML = '<span style="font-size:12px">Génération…</span>';

  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  const cv = document.querySelector('.cv');
  const bg = getComputedStyle(document.body).backgroundColor;

  // A4 portrait at 96dpi → 794 × 1123 px. We render at this exact width
  // so the captured canvas maps 1:1 onto an A4 PDF page. Height is shaved
  // by 2px to dodge floating-point rounding (otherwise html2pdf creates
  // a phantom 2nd page from a 0.001-page overflow).
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1121;

  try {
    await html2pdf()
      .from(cv)
      .set({
        margin: 0,
        filename: 'CV_Martin_Bellot.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          backgroundColor: bg,
          windowWidth: A4_WIDTH_PX,
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            // 1) Activate @media print rules inside the clone
            activatePrintRulesIn(clonedDoc);
            // 2) Reset positioning artefacts so the .cv starts at (0,0)
            const cDoc = clonedDoc.documentElement;
            const cBody = clonedDoc.body;
            const cCv = clonedDoc.querySelector('.cv');
            cDoc.style.margin = '0';
            cDoc.style.padding = '0';
            cDoc.style.background = bg;
            cBody.style.margin = '0';
            cBody.style.padding = '0';
            cBody.style.background = bg;
            cBody.style.width = A4_WIDTH_PX + 'px';
            if (cCv) {
              cCv.style.margin = '0';
              cCv.style.maxWidth = '100%';
              cCv.style.width = A4_WIDTH_PX + 'px';
              cCv.style.boxSizing = 'border-box';
              cCv.style.background = bg;
            }
            // 3) Hide reveal-animation transforms (they'd offset the layout)
            clonedDoc.querySelectorAll('.section, .hero').forEach(el => {
              el.style.opacity = '1';
              el.style.transform = 'none';
              el.style.transition = 'none';
            });
            // 4) Hide the toolbar (it's fixed-position over the cv)
            const tb = clonedDoc.querySelector('.toolbar');
            if (tb) tb.style.display = 'none';
          },
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        },
        pagebreak: { mode: ['avoid-all'] },
      })
      .save();
  } catch (err) {
    console.error(err);
    alert('Erreur lors de la génération du PDF : ' + err.message);
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = originalLabel;
  }
}

downloadBtn.addEventListener('click', exportPdf);

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
