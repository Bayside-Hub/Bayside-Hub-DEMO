const CACHE = "bayside-hub-assets-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.mode === "navigate") return;

  // HTML and API responses can contain account-specific data. Only cache
  // presentation assets; authenticated pages always remain network-only.
  const cacheable = url.pathname.startsWith("/_next/static/") ||
    ["style", "script", "font", "image"].includes(event.request.destination);
  if (!cacheable || url.pathname.startsWith("/_next/image") || url.pathname.startsWith("/api/")) return;

  event.respondWith(fetch(event.request).then(async (response) => {
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(CACHE);
      await cache.put(event.request, response.clone());
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
