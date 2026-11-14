/* Azmi Finance service worker. Ubah V setiap rilis supaya cache lama dibuang. */
const V = 'azmi-20261114g';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // CDN (mis. Tesseract) tidak disentuh
  const isPage = r.mode === 'navigate' || r.destination === 'document' || /\.html?$/.test(u.pathname) || u.pathname.endsWith('/');
  if (isPage) {
    // Halaman utama: ambil versi terbaru dari jaringan, jatuh ke cache bila offline
    e.respondWith(
      fetch(r, {cache: 'no-cache'}).then(res => {
        if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => caches.match(r).then(m => m || caches.match('index.html') || caches.match('./')))
    );
    return;
  }
  // Aset lain: pakai cache dulu, perbarui di belakang layar
  e.respondWith(
    caches.match(r).then(m => {
      const net = fetch(r).then(res => {
        if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => m);
      return m || net;
    })
  );
});
