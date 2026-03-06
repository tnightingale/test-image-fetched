const express = require(‘express’);
const archiver = require(‘archiver’);
const fetch = require(‘node-fetch’);

const app = express();
const PORT = 3000;

const HASHES = [
“1eef69990efc21a49fe3876cce2dae57”,“40988d4f83578f8a17209766e890d31f”,
“430d4fd72d381fb162e229632b8b957f”,“f811973e34516aa9f96e3ede624cd6ee”,
“90ecb4864a2539ce5194fad26726aa34”,“77b56547361e0dfc3a457985d269ca0c”,
“384233e25d52cce8a24ee3fc3ea2fd8a”,“b6f5ef493b96381a4fca33f33dfa418d”,
“6965072deb569ebeff13c0cd2613149e”,“87a22e93b4e8a8f73ea630c23ade7cc6”,
“0b0af7f9daa8a00e6f8d0a1977539916”,“1229ad405f1add159c9c13e0ea40baa0”,
“2ed1f0379515694d3b8f3e904998ce03”,“bb22d1951a5d4024a2871d37ccfb7565”,
“d86b7de0664fbae8e2f9b3dd16bf70b3”,“03a33e0f57428eb3910cacf98f8ae552”,
“8f63d6dcad825d55a8748348047eed69”,“f0c9082149cfe298188981b29b379d70”,
“5f72f6935c5bbd9825b5eb66d5f13646”,“1bf459d266ef34fa90b60742e542bb08”,
“66545052c021500543f256bc70656170”,“5e301922376e6faccff61f1ef9889a67”,
“56261b058bc1bef03c6c4c0d5f1c9212”,“1e95ddb5c5a7e7df0529758bb2c8c554”
];

const HEADERS = {
‘User-Agent’: ‘Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36’,
‘Referer’: ‘https://www.oneroof.co.nz/’
};

function imageUrl(hash, width = 1920) {
return `https://s.oneroof.co.nz/image/${hash.slice(0,2)}/${hash.slice(2,4)}/${hash}.jpg?x-oss-process=image/quality,q_80/resize,w_${width}/format,webp`;
}

// Serve the UI
app.get(’/’, (req, res) => {
res.send(`<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>90A Paetawa Road — Photos</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=DM+Mono:wght@300;400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--sand:#f5f0e8;--dusk:#2a3540;--ocean:#4a7c8e;--accent:#c9a96e}
  body{font-family:'DM Mono',monospace;background:var(--sand);color:var(--dusk);min-height:100vh}
  header{background:var(--dusk);padding:1.8rem 1.2rem 2.5rem;position:relative;overflow:hidden}
  header::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:36px;background:var(--sand);clip-path:ellipse(55% 100% at 50% 100%)}
  .eye{font-size:.58rem;letter-spacing:.25em;text-transform:uppercase;color:var(--accent);margin-bottom:.4rem}
  h1{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(1.6rem,6vw,2.2rem);color:#fff;line-height:1.2}
  h1 em{font-style:italic;color:var(--accent)}
  .sub{font-size:.58rem;color:rgba(255,255,255,.4);margin-top:.3rem;letter-spacing:.1em}
  .container{max-width:500px;margin:0 auto;padding:1.5rem 1rem 3rem}
  .status-box{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:12px;padding:1rem 1.2rem;margin-bottom:1.2rem;box-shadow:0 2px 12px rgba(42,53,64,.06)}
  .status-label{font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--ocean);margin-bottom:.35rem}
  .status-text{font-size:.78rem;min-height:1.2em}
  .prog-wrap{margin-top:.7rem;background:#e8f0f2;border-radius:99px;height:5px;overflow:hidden}
  .prog-bar{height:100%;background:linear-gradient(90deg,var(--ocean),var(--accent));border-radius:99px;width:0%;transition:width .4s}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:1.2rem}
  .thumb{aspect-ratio:4/3;background:#e8f0f2;border-radius:8px;overflow:hidden;position:relative;border:2px solid transparent;transition:border-color .2s}
  .thumb.ok{border-color:var(--ocean)}
  .thumb.err{border-color:#e07070}
  .thumb img{width:100%;height:100%;object-fit:cover;display:block}
  .num{position:absolute;bottom:3px;left:4px;font-size:.55rem;color:#fff;background:rgba(0,0,0,.5);padding:1px 4px;border-radius:3px}
  .badge{position:absolute;top:3px;right:3px;font-size:.65rem;width:17px;height:17px;display:flex;align-items:center;justify-content:center;border-radius:50%}
  .thumb.ok .badge{background:var(--ocean);color:#fff}
  .thumb.err .badge{background:#e07070;color:#fff}
  .btn{display:block;width:100%;padding:1rem;border:none;border-radius:10px;font-family:'DM Mono',monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-bottom:.75rem}
  .btn-primary{background:var(--dusk);color:#fff}
  .btn-primary:disabled{opacity:.35;cursor:not-allowed}
  .btn-secondary{background:#fff;color:var(--dusk);border:1.5px solid var(--dusk)}
  .btn-secondary:disabled{opacity:.35;cursor:not-allowed}
  .log{background:var(--dusk);color:rgba(255,255,255,.65);border-radius:10px;padding:1rem;font-size:.6rem;line-height:1.8;max-height:180px;overflow-y:auto;margin-top:.5rem}
  .ok{color:#7ec8a0}.err{color:#e07070}.info{color:var(--accent)}
</style>
</head>
<body>
<header>
  <div class="eye">Property Photo Downloader</div>
  <h1>90A Paetawa Road<br><em>Peka Peka</em></h1>
  <div class="sub">WTN11260 · 24 photos · server-side fetch</div>
</header>
<div class="container">
  <div class="status-box">
    <div class="status-label">Status</div>
    <div class="status-text" id="status">Ready — tap Preview Photos to begin</div>
    <div class="prog-wrap"><div class="prog-bar" id="prog"></div></div>
  </div>

  <div class="grid" id="grid"></div>

<button class="btn btn-primary" id="btnPreview" onclick="previewAll()">Preview Photos</button>
<button class="btn btn-secondary" id="btnZip" onclick="downloadZip()">Download ZIP (server-side)</button>

  <div class="log" id="log"><div class="info">Ready. Photos will be fetched server-side — no CORS issues.</div></div>
</div>

<script>
const HASHES = ${JSON.stringify(HASHES)};
const TOTAL = HASHES.length;
const cells = [];

// Build grid
const grid = document.getElementById('grid');
for (let i = 0; i < TOTAL; i++) {
  const d = document.createElement('div');
  d.className = 'thumb';
  d.innerHTML = '<span class="num">' + (i+1) + '</span>';
  grid.appendChild(d);
  cells.push(d);
}

function log(msg, cls='') {
  const el = document.getElementById('log');
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}
function setStatus(t) { document.getElementById('status').textContent = t; }
function setProg(n, t) { document.getElementById('prog').style.width = Math.round(n/t*100) + '%'; }

async function previewAll() {
  document.getElementById('btnPreview').disabled = true;
  log('Loading previews via server…', 'info');

  for (let i = 0; i < TOTAL; i++) {
    const cell = cells[i];
    // Use server proxy endpoint to avoid CORS in browser
    const proxyUrl = '/image/' + i;
    setStatus('Loading ' + (i+1) + ' / ' + TOTAL + '…');
    setProg(i, TOTAL);

    await new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        cell.className = 'thumb ok';
        cell.innerHTML = '<img src="' + proxyUrl + '"><span class="num">' + (i+1) + '</span><span class="badge">✓</span>';
        log('[' + String(i+1).padStart(2,'0') + '] ✓ loaded', 'ok');
        resolve();
      };
      img.onerror = () => {
        cell.className = 'thumb err';
        cell.innerHTML = '<span class="num">' + (i+1) + '</span><span class="badge">✗</span>';
        log('[' + String(i+1).padStart(2,'0') + '] ✗ failed', 'err');
        resolve();
      };
      img.src = proxyUrl;
    });
  }

  setProg(TOTAL, TOTAL);
  setStatus('Done! Tap Download ZIP to save all photos.');
  log('─── Preview complete ───', 'info');
  document.getElementById('btnPreview').disabled = false;
}

function downloadZip() {
  setStatus('Requesting ZIP from server…');
  log('Building ZIP server-side, please wait…', 'info');
  // Just navigate to the zip endpoint — server streams it back
  window.location.href = '/download-zip';
}
</script>

</body>
</html>`);
});

// Proxy a single image by index (for preview grid — solves browser CORS)
app.get(’/image/:index’, async (req, res) => {
const i = parseInt(req.params.index);
if (isNaN(i) || i < 0 || i >= HASHES.length) return res.status(400).send(‘Invalid index’);

const url = imageUrl(HASHES[i]);
try {
const response = await fetch(url, { headers: HEADERS });
if (!response.ok) throw new Error(`Upstream ${response.status}`);
res.set(‘Content-Type’, response.headers.get(‘content-type’) || ‘image/jpeg’);
res.set(‘Cache-Control’, ‘public, max-age=3600’);
response.body.pipe(res);
} catch (err) {
console.error(`Image ${i} failed:`, err.message);
res.status(502).send(‘Failed to fetch image’);
}
});

// Fetch all images and stream a ZIP back
app.get(’/download-zip’, async (req, res) => {
console.log(‘Building ZIP…’);
res.set(‘Content-Type’, ‘application/zip’);
res.set(‘Content-Disposition’, ‘attachment; filename=“90a_paetawa_road_photos.zip”’);

const archive = archiver(‘zip’, { zlib: { level: 6 } });
archive.pipe(res);

archive.on(‘error’, err => {
console.error(‘Archive error:’, err);
res.status(500).end();
});

let ok = 0, fail = 0;
for (let i = 0; i < HASHES.length; i++) {
const url = imageUrl(HASHES[i]);
const filename = `photo_${String(i+1).padStart(2,'0')}.jpg`;
console.log(`Fetching ${i+1}/${HASHES.length}: ${filename}`);
try {
const response = await fetch(url, { headers: HEADERS });
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const buffer = await response.buffer();
archive.append(buffer, { name: filename });
ok++;
} catch (err) {
console.error(`  ✗ ${filename}: ${err.message}`);
fail++;
}
}

console.log(`ZIP complete: ${ok} ok, ${fail} failed`);
await archive.finalize();
});

app.listen(PORT, () => {
console.log(`╔═══════════════════════════════════════╗ ║  90A Paetawa Road Photo Downloader    ║ ║  Running at http://localhost:${PORT}      ║ ╚═══════════════════════════════════════╝`);
});
