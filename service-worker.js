const CACHE='avtovip-v92';
const CORE=[
  './','./index.html','./site.webmanifest',
  './assets/css/app.css','./assets/css/patch11.css','./assets/css/ui-pro.css',
  './assets/js/supabase.js','./assets/js/international.js','./assets/js/app.js','./assets/js/social.js','./assets/js/patch11.js','./assets/js/ui-pro.js','./assets/js/feed-v20.js',
  './assets/img/brand/logo.png','./assets/img/brand/icon-192.png','./assets/img/brand/icon-512.png','./assets/img/brand/pwa-splash-192.png','./assets/img/brand/pwa-splash-512.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  const isStatic=/\.(?:css|js|webmanifest|png|jpg|jpeg|webp|svg|ico)$/.test(u.pathname);
  if(isStatic){
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match(r,{ignoreSearch:true});
      const refresh=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>null);
      if(hit){e.waitUntil(refresh);return hit}
      const res=await refresh;return res||Response.error();
    }));
    return;
  }
  if(r.mode==='navigate'||/\.html$/.test(u.pathname)){
    e.respondWith(fetch(new Request(r,{cache:'no-store'})).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res})));
});
