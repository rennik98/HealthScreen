// เปลี่ยนเลขนี้ทุกครั้งที่ต้องการล้างแคชเก่าทิ้งทั้งหมด
const CACHE_NAME = 'healthscreen-v2';
const PRECACHE = ['/', '/index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const isHTML = (req) =>
  req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // อย่าแคชการเรียก Google Apps Script
  if (req.url.includes('script.google.com')) return;

  // index.html ต้องเอาจากเน็ตก่อนเสมอ เพราะข้างในชี้ไปยังไฟล์ JS ที่ชื่อมี hash
  // ถ้าแคชไว้แบบ cache-first เครื่องจะติดโค้ดเวอร์ชันเก่าถาวร แม้จะ deploy ใหม่แล้วก็ตาม
  if (isHTML(req)) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req).then(c => c || caches.match('/index.html')))
    );
    return;
  }

  // ไฟล์ asset มี hash อยู่ในชื่อ เปลี่ยนเนื้อหาเมื่อไหร่ชื่อก็เปลี่ยน — cache-first ปลอดภัย
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      });
    })
  );
});
