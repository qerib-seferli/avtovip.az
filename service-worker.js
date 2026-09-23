const CACHE='avtovip-profile-stable-135';
const STATIC=[
  './assets/css/app.css','./assets/css/patch11.css','./assets/css/ui-pro.css','./assets/css/profile-final.css','./assets/css/detail-final-v124.css',
  './assets/js/supabase.js','./assets/js/international.js','./assets/js/app.js','./assets/js/social.js','./assets/js/patch11.js','./assets/js/ui-pro.js','./assets/js/feed-v20.js','./assets/js/profile-final.js',
  './assets/img/brand/logo.png','./assets/img/brand/icon-192.png','./assets/img/brand/icon-512.png','./assets/img/identity/vip-frame.svg','./assets/img/identity/premium-frame.svg','./site.webmanifest'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  /* Let HTML/navigation use the browser's normal HTTP cache. This avoids the extra
     service-worker cache lookup + background network request that made page changes feel heavy. */
  if(r.mode==='navigate'||/\.html$/.test(u.pathname))return;
  if(!/\.(?:css|js|webmanifest|png|jpg|jpeg|webp|svg|ico)$/.test(u.pathname))return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    if(hit)return hit;
    try{const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}catch{return Response.error()}
  }));
});
