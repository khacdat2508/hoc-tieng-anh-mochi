// Lưu đệm để mở được khi không có mạng (chỉ hoạt động khi chạy qua http/https).
const CACHE = 'be-hoc-ta-v4';
const FILES = ['./', 'index.html', 'css/styles.css', 'js/data.js', 'js/art.js', 'js/audio.js', 'js/app.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Ưu tiên bản mới từ mạng (để sửa đổi hiện ngay); mất mạng thì dùng bản đã lưu.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(cache => fetch(req, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
      .catch(() => cache.match(req, { ignoreSearch: true })))
  );
});
