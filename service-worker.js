/* AvtoVİP PWA v20 — stale UI is never served while online. */
const CACHE='avtovip-v25-20260916-layout-message-db';
const CORE=['./','index.html','assets/css/app.css?v=20','assets/css/patch11.css?v=20','assets/css/ui-pro.css?v=20','assets/js/supabase.js','assets/js/international.js','assets/js/app.js?v=20','assets/js/social.js?v=20','assets/js/patch11.js?v=20','assets/js/ui-pro.js?v=20','assets/img/brand/icon-192.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;const ui=r.mode==='navigate'||/\.(?:html|css|js)$/.test(u.pathname);if(ui){e.respondWith(fetch(new Request(r,{cache:'no-store'})).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res}).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))));return}e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res}))) });
