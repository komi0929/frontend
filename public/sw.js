// 最小限のキャッシュ戦略（静的のみ）
const CACHE = "anshin-cache-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["/","/display","/manifest.json"])));
});
self.addEventListener("fetch", (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request);
    if (r) return r;
    const resp = await fetch(e.request);
    return resp;
  })());
});