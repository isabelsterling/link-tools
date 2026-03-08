/* ─────────────────────────────────────────
   LINKKIT — main.js
   Lógica para: acortador de URL + generador QR
───────────────────────────────────────── */

/* ── ENTER KEY ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('short-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') shortenURL();
  });
  document.getElementById('qr-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') generateQR();
  });
});

/* ─────────────────────────────
   TAB SWITCHING
───────────────────────────── */
function switchTab(tab) {
  document.getElementById('panel-shortener').classList.remove('active');
  document.getElementById('panel-qr').classList.remove('active');
  document.getElementById('tab-short').className = 'tab-btn';
  document.getElementById('tab-qr').className = 'tab-btn';

  if (tab === 'shortener') {
    document.getElementById('panel-shortener').classList.add('active');
    document.getElementById('tab-short').classList.add('active-shortener');
  } else {
    document.getElementById('panel-qr').classList.add('active');
    document.getElementById('tab-qr').classList.add('active-qr');
  }
}

/* ─────────────────────────────
   URL SHORTENER
───────────────────────────── */
async function shortenURL() {
  const input  = document.getElementById('short-input').value.trim();
  const btn    = document.getElementById('short-btn');
  const loader = document.getElementById('short-loader');
  const result = document.getElementById('short-result');
  const urlEl  = document.getElementById('short-url');

  result.classList.remove('visible');
  hideError('short-error');

  if (!input) {
    showError('short-error', '⚠ Ingresa una URL para acortar.');
    return;
  }
  if (!isValidURL(input)) {
    showError('short-error', '⚠ URL no válida. Asegúrate de incluir https://');
    return;
  }

  btn.disabled = true;
  loader.classList.add('visible');

  try {
    const res  = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(input)}`);
    const data = await res.json();

    if (data.shorturl) {
      urlEl.textContent = data.shorturl;
      result.classList.add('visible');
    } else {
      showError('short-error', '⚠ No se pudo acortar. ' + (data.errormessage || 'Intenta de nuevo.'));
    }
  } catch (e) {
    showError('short-error', '⚠ Error de conexión. Verifica tu internet e intenta de nuevo.');
  } finally {
    btn.disabled = false;
    loader.classList.remove('visible');
  }
}

function copyURL() {
  const url = document.getElementById('short-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copiar';
      btn.classList.remove('copied');
    }, 2000);
  });
}

/* ─────────────────────────────
   QR GENERATOR
───────────────────────────── */
let qrSize     = 220;
let qrInstance = null;

function setSize(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  qrSize = size;
  if (document.getElementById('qr-result').classList.contains('visible')) {
    generateQR();
  }
}

function generateQR() {
  const input     = document.getElementById('qr-input').value.trim();
  const result    = document.getElementById('qr-result');
  const container = document.getElementById('qr-container');

  hideError('qr-error');

  if (!input) {
    showError('qr-error', '⚠ Ingresa una URL o texto para generar el QR.');
    return;
  }

  container.innerHTML = '';
  qrInstance = null;

  try {
    qrInstance = new QRCode(container, {
      text: input,
      width: qrSize,
      height: qrSize,
      colorDark: '#1a1a18',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('qr-url-text').textContent = input;
    result.classList.add('visible');
  } catch (e) {
    showError('qr-error', '⚠ No se pudo generar el QR. Intenta con un texto más corto.');
  }
}

function downloadQR() {
  const container = document.getElementById('qr-container');
  const canvas    = container.querySelector('canvas');
  const img       = container.querySelector('img');
  const link      = document.createElement('a');
  link.download   = 'qrcode-linkkit.png';

  if (canvas) {
    link.href = canvas.toDataURL('image/png');
  } else if (img) {
    link.href = img.src;
  }
  link.click();
}

function clearQR() {
  document.getElementById('qr-input').value      = '';
  document.getElementById('qr-container').innerHTML = '';
  document.getElementById('qr-result').classList.remove('visible');
  hideError('qr-error');
  qrInstance = null;
}

/* ─────────────────────────────
   HELPERS
───────────────────────────── */
function isValidURL(str) {
  try { new URL(str); return true; } catch { return false; }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('visible');
}

function hideError(id) {
  document.getElementById(id).classList.remove('visible');
}