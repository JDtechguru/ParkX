/* ParkX offline cache: opens instantly from cache (works with no signal in a basement),
   and quietly fetches the newest files in the background for the next launch. */
const CACHE = "parkx-v1";
const FILES = ["./", "./index.html", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if(r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const cached = await c.match(r, { ignoreSearch:true });
    const net = fetch(r).then(res => { if(res && res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
    return cached || (await net) || c.match("./index.html");
  }));
});
