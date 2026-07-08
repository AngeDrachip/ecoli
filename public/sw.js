// Ecoli service worker — offline-first for card images and app shell.
const CACHE = "ecoli-v1";
const SHELL = ["/", "/wallet", "/auth", "/manifest.webmanifest", "/apple-touch-icon.png", "/apple-touch-icon-transparent.png", "/favicon.ico"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache OAuth / auth traffic.
  if (url.pathname.startsWith("/~oauth") || url.pathname.startsWith("/auth/v1")) return;

  // Card images from Supabase Storage: cache-first, then network, update in bg.
  if (url.pathname.includes("/storage/v1/object/") || url.pathname.includes("card-images")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req, { ignoreSearch: true });
        const fetchPromise = fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      }),
    );
    return;
  }

  // Static assets & navigation: network-first with cache fallback.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.mode === "navigate" || url.origin === self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("/wallet"))),
  );
});
