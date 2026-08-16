const CACHE='avtovip-shell-v1';
const SHELL=['./','./index.html','./assets/css/app.css','./assets/js/supabase.js','./assets/js/app.js','./assets/img/brand/icon-192.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;if(url.pathname.includes('/rest/v1/')||url.pathname.includes('/storage/v1/'))return;event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();if(r.ok)caches.open(CACHE).then(c=>c.put(event.request,copy));return r}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))))});
