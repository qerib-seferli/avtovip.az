const CACHE = 'avtovip-shell-18d5da986d1a';
const STATIC = [
  "./admin/css/admin.css?av=f023cef9b6ef",
  "./admin/js/admin-places.js?av=103a0beace13",
  "./admin/js/admin.js?av=1670f37948d1",
  "./assets/css/app.css?av=3b6ed49f2a29",
  "./assets/css/detail-final-v124.css?av=c6e8f0bcabd1",
  "./assets/css/patch11.css?av=03817c3c1c54",
  "./assets/css/places/places.css?av=cf70c7430ebe",
  "./assets/css/profile-final.css?av=94ac81542f5e",
  "./assets/css/ui-pro.css?av=058ef6282443",
  "./assets/css/vehicle-categories.css?av=555cab4d6f33",
  "./assets/data/places/categories.js?av=a4cbb381928a",
  "./assets/img/brand/icon-192.png",
  "./assets/img/brand/icon-512.png",
  "./assets/img/brand/logo.png",
  "./assets/img/loading/world.webp",
  "./assets/js/app.js?av=fafabff9af70",
  "./assets/js/feed-v20.js?av=758d2dc7c9b3",
  "./assets/js/international.js?av=63581ed8b368",
  "./assets/js/patch11.js?av=ec196b8fb043",
  "./assets/js/places/place-add.js?av=1db30b6aa285",
  "./assets/js/places/place-i18n.js?av=b653a4a80b4a",
  "./assets/js/places/places.js?av=90a18e483b97",
  "./assets/js/places/profile-places.js?av=e1e0c81d7191",
  "./assets/js/profile-final.js?av=fbdb5299fed6",
  "./assets/js/social.js?av=bf94a204cc9e",
  "./assets/js/supabase.js?av=dad8abf6266d",
  "./assets/js/ui-pro.js?av=ea9b4b876151",
  "./assets/js/vehicle-categories.js?av=8eeb64cd8c8c",
  "./site.webmanifest"
];
const scope = self.registration.scope;
const shellUrls = new Set([
  "./ayarlar.html",
  "./elan-ver.html",
  "./elan.html",
  "./explore.html",
  "./hekaye-ver.html",
  "./index.html",
  "./lent.html",
  "./login.html",
  "./logo-yoxlama-8f3c.html",
  "./mesajlar.html",
  "./muqayise.html",
  "./place-add.html",
  "./places.html",
  "./post-ver.html",
  "./profile.html",
  "./reels.html",
  "./reset-password.html",
  "./sevimliler.html",
  "./user.html"
].map(path => new URL(path, scope).href));
shellUrls.add(scope);
const staticUrls = new Set(STATIC.map(path => new URL(path, scope).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Fetch all release assets together. An incomplete release leaves the active Worker intact.
    await cache.addAll([...staticUrls].map(url => new Request(url, {cache:'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name !== CACHE && name.startsWith('avtovip-')) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

async function networkFirst(request, cacheKey) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, {cache:'no-cache'});
    if (response.ok && !response.redirected) await cache.put(cacheKey,response.clone()).catch(() => {});
    return response;
  } catch {
    return await cache.match(cacheKey) || Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('Authorization')) return;
  const url = new URL(request.url);
  if (!url.href.startsWith(scope)) return;

  if (request.mode === 'navigate') {
    const shell = new URL(url.pathname,url.origin).href;
    if (shellUrls.has(shell)) {
      // Never persist redirects or callback/query-specific responses.
      if (!url.search) event.respondWith(networkFirst(request,shell));
      else event.respondWith(fetch(request,{cache:'no-cache'}).catch(async () => (await caches.open(CACHE)).match(shell).then(hit => hit || Response.error())));
    }
    return;
  }

  if (!/\.(?:css|js|webmanifest|png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname)) return;
  if (staticUrls.has(url.href)) {
    event.respondWith((async () => (await (await caches.open(CACHE)).match(request)) || fetch(request))());
  } else {
    event.respondWith(networkFirst(request,request));
  }
});
