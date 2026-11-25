/* AvtoVİP.az — Supabase bağlantısı. Anon key front-end üçün public açardır.
   SERVICE_ROLE və digər gizli açarlar heç vaxt bu fayla yazılmamalıdır. */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://pihmvkhbeydfzfzjhjeb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpaG12a2hiZXlkZnpmempoamViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDQ4MTUsImV4cCI6MjEwMjQ4MDgxNX0.y4ktB7ZTPhknoNkOo928ky3D-EWCYUSiUAiQ9lrRH7U';
  const ADMIN_EMAIL = 'huseyn@avtovip.az';

  if (!window.supabase?.createClient) {
    console.error('Supabase JS kitabxanası yüklənməyib.');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'avtovip-auth'
    },
    realtime: { params: { eventsPerSecond: 10 } }
  });

  async function getUser() {
    /* Fast path: persisted session is enough for UI; RLS still validates every DB request. */
    const { data: sessionData } = await client.auth.getSession();
    if (sessionData?.session?.user) return sessionData.session.user;
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data?.user || null;
  }

  async function getProfile(id) {
    if (!id) return null;
    const { data, error } = await client.from('users').select('*').eq('id', id).maybeSingle();
    if (error) console.warn('Profil oxunmadı:', error.message);
    return data || null;
  }

  async function current() {
    const user = await getUser();
    const profile = user ? await getProfile(user.id) : null;
    return { user, profile };
  }

  async function requireAuth(redirect = true) {
    const user = await getUser();
    if (!user && redirect) {
      const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      location.href = `login.html?next=${next}`;
    }
    return user;
  }

  async function requireAdmin() {
    const user = await getUser();
    if (!user) {
      location.href = '../login.html?next=admin/index.html';
      return null;
    }
    const profile = await getProfile(user.id);
    if (profile?.role !== 'admin') {
      location.href = '../index.html';
      return null;
    }
    return { user, profile };
  }

  function cleanName(name = 'file') {
    return String(name)
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .slice(-90);
  }

  // R2 production adapter for public media. Private messages/stories stay on legacy
  // Storage until recipient-authorized reads and expiry cleanup are deployed.
  const R2_API = 'https://avtovip-media-api.seferovqerib09.workers.dev';
  const R2_CATEGORIES = Object.freeze({avatars:'profile','elan-images':'listing','social-media':'post','story-media':'story','chat-media':'message','place-media':'place'});
  // All supported user-media buckets are R2-only; no legacy upload switch.
  const R2_URL_RE = /^https:\/\/avtovip-media-api\.seferovqerib09\.workers\.dev\/v1\/media\/([0-9a-f-]{36})$/i;
  async function r2Token(){
    const {data,error}=await client.auth.getSession();
    if(error||!data?.session?.access_token)throw new Error('R2 üçün aktiv giriş tələb olunur');
    return data.session.access_token;
  }
  async function r2Upload(file,category){
    const jwt=await r2Token();
    const response=await fetch(`${R2_API}/v1/media?category=${encodeURIComponent(category)}`,{
      method:'POST',headers:{Authorization:`Bearer ${jwt}`,'Content-Type':file.type},body:file
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.id||!data.url)throw new Error(data.error||`R2 upload HTTP ${response.status}`);
    return {path:`r2:${data.id}`,url:data.url,provider:'r2',mediaId:data.id};
  }
  // A DB row is persisted before linking. Retry only transient failures; never
  // retry authorization/ownership or "URL not persisted" failures.
  // A persisted entity must remain usable when its /link call encounters a
  // transient outage. Queue only R2 identifiers (never JWTs or media bytes),
  // and reconcile them on the next online/visible session in the same tab.
  const R2_PENDING_LINKS_KEY='avtovip-r2-pending-links-v2';
  const R2_PENDING_MAX_AGE=48*60*60*1000;
  const R2_ENTITY_TYPES=new Set(['profile','listing','post','reel','story','message','place']);
  let r2PendingOwner=null;
  function pendingR2Links(owner=r2PendingOwner){
    if(!owner)return [];
    try{
      const items=JSON.parse(sessionStorage.getItem(R2_PENDING_LINKS_KEY)||'[]');
      if(!Array.isArray(items))return [];
      return items.filter(x=>x&&x.owner===owner&&R2_URL_RE.test(x.url)&&R2_ENTITY_TYPES.has(x.type)&&
        /^[0-9a-f-]{36}$/i.test(x.id)&&Number.isFinite(x.at)&&Date.now()-x.at<R2_PENDING_MAX_AGE).slice(-100);
    }catch{return []}
  }
  function savePendingR2Links(items){
    try{sessionStorage.setItem(R2_PENDING_LINKS_KEY,JSON.stringify(items.slice(-100)))}catch{}
  }
  function enqueueR2Link(url,type,id,owner){
    if(!owner||!R2_URL_RE.test(String(url||''))||!R2_ENTITY_TYPES.has(type))return;
    // A delayed upload/link response must never create work under a different account.
    if(owner!==r2PendingOwner)return;
    const items=pendingR2Links(owner).filter(x=>!(x.url===url&&x.type===type&&x.id===id));
    items.push({url,type,id,owner,at:Date.now()});savePendingR2Links(items);
  }
  function clearPendingR2Link(url,type,id,owner){
    if(!owner||owner!==r2PendingOwner)return;
    const items=pendingR2Links(owner);
    if(items.some(x=>x.url===url&&x.type===type&&x.id===id))
      savePendingR2Links(items.filter(x=>!(x.url===url&&x.type===type&&x.id===id)));
  }
  async function linkR2MediaRequest(mediaUrl,entityType,entityId){
    const match=R2_URL_RE.exec(String(mediaUrl||''));
    if(!match)return null;
    const jwt=await r2Token();
    for(let attempt=0;attempt<3;attempt++){
      let response;
      try{
        response=await fetch(`${R2_API}/v1/media/${match[1]}/link`,{
          method:'POST',headers:{Authorization:`Bearer ${jwt}`,'Content-Type':'application/json'},
          body:JSON.stringify({entity_type:entityType,entity_id:entityId})
        });
      }catch(error){
        if(attempt===2){error.retryable=true;throw error;}
        await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));
        continue;
      }
      if(response.ok)return match[1];
      const data=await response.json().catch(()=>({}));
      if(![429,500,502,503,504].includes(response.status)||attempt===2){
        const error=new Error(data.error||`R2 media link HTTP ${response.status}`);
        error.retryable=[429,500,502,503,504].includes(response.status);
        throw error;
      }
      await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));
    }
    throw new Error('R2 media link retry exhausted');
  }
  async function linkR2Media(mediaUrl,entityType,entityId){
    const {data:authData}=await client.auth.getSession();
    const owner=authData?.session?.user?.id||null;
    if(!owner)throw new Error('R2 media əlaqələndirməsi üçün aktiv hesab tələb olunur');
    if(!r2PendingOwner)r2PendingOwner=owner;
    if(r2PendingOwner!==owner)throw new Error('R2 hesabı dəyişib; media əlaqələndirməsi dayandırıldı');
    try{
      const result=await linkR2MediaRequest(mediaUrl,entityType,entityId);
      clearPendingR2Link(mediaUrl,entityType,entityId,owner);
      return result;
    }catch(error){
      if(error.retryable)enqueueR2Link(mediaUrl,entityType,entityId,owner);
      throw error;
    }
  }
  let reconcilingR2Links=false;
  async function reconcilePendingR2Links(){
    if(reconcilingR2Links||document.visibilityState==='hidden'||!navigator.onLine)return;
    const {data:authData}=await client.auth.getSession();
    const owner=authData?.session?.user?.id||null;
    if(!owner||owner!==r2PendingOwner)return;
    const items=pendingR2Links(owner);if(!items.length)return;
    reconcilingR2Links=true;
    try{
      for(const item of items){
        if(owner!==r2PendingOwner)break;
        try{await linkR2MediaRequest(item.url,item.type,item.id);clearPendingR2Link(item.url,item.type,item.id,owner)}
        catch(error){
          // A permanent rejection means the entity was deleted, ownership
          // changed, or the persisted URL no longer matches: do not retry.
          if(!error.retryable)clearPendingR2Link(item.url,item.type,item.id,owner);
        }
      }
    }finally{reconcilingR2Links=false;}
  }
  window.addEventListener('online',()=>{reconcilePendingR2Links().catch(()=>{})});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reconcilePendingR2Links().catch(()=>{})});
  // Wait until auth has restored its session; avoid racing page initialization.
  client.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'){r2PendingOwner=null;savePendingR2Links([]);return;}
    if(event==='INITIAL_SESSION'||event==='SIGNED_IN'||event==='TOKEN_REFRESHED'){
      r2PendingOwner=session?.user?.id||null;
      setTimeout(()=>reconcilePendingR2Links().catch(()=>{}),1000);
    }
  });
  async function unlinkR2Media(mediaUrl,entityType,entityId){
    const match=R2_URL_RE.exec(String(mediaUrl||''));if(!match)return null;
    // The entity may already have been removed from the DB. Retry only
    // temporary transport/server errors; 403/409 mean deletion is unsafe.
    for(let attempt=0;attempt<3;attempt++){
      try{
        const jwt=await r2Token();
        const response=await fetch(`${R2_API}/v1/media/${match[1]}/unlink`,{
          method:'POST',headers:{Authorization:`Bearer ${jwt}`,'Content-Type':'application/json'},
          body:JSON.stringify({entity_type:entityType,entity_id:entityId}),cache:'no-store'
        });
        const data=await response.json().catch(()=>null);
        if(!response.ok){
          const error=new Error(`R2 unlink HTTP ${response.status}: ${data?.error||'Unknown error'} [${entityType}/${entityId}, ${match[1]}]`);
          error.retryable=[408,429,500,502,503,504].includes(response.status);
          throw error;
        }
        if(data?.unlinked!==true||data?.id!==match[1])
          throw Object.assign(new Error('R2 unlink confirmation missing or mismatched'),{retryable:false});
        return match[1];
      }catch(error){
        if(error?.retryable===false||attempt===2)throw error;
        await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
      }
    }
  }
  // Retry only transient R2 deletion failures while the same authenticated
  // owner is active. Never persist tokens or bypass Worker reference checks.
  const R2_PENDING_DELETES_KEY='avtovip-r2-pending-deletes-v1';
  const R2_PENDING_DELETES_AGE=24*60*60*1000;
  let reconcilingR2Deletes=false;
  function pendingR2Deletes(owner){
    if(!owner)return [];
    try{
      const items=JSON.parse(sessionStorage.getItem(R2_PENDING_DELETES_KEY)||'[]');
      return Array.isArray(items)?items.filter(x=>x&&x.owner===owner&&
        /^[0-9a-f-]{36}$/i.test(x.id)&&Number.isFinite(x.at)&&
        Date.now()-x.at>=0&&Date.now()-x.at<R2_PENDING_DELETES_AGE).slice(-100):[];
    }catch{return []}
  }
  function savePendingR2Deletes(items){
    try{sessionStorage.setItem(R2_PENDING_DELETES_KEY,JSON.stringify(items.slice(-100)))}catch{}
  }
  function queueR2Delete(id,owner){
    if(!owner||owner!==r2PendingOwner)return;
    const items=pendingR2Deletes(owner).filter(x=>x.id!==id);
    items.push({id,owner,at:Date.now()});savePendingR2Deletes(items);
  }
  function clearR2Delete(id,owner){
    if(owner&&owner===r2PendingOwner)
      savePendingR2Deletes(pendingR2Deletes(owner).filter(x=>x.id!==id));
  }
  async function reconcilePendingR2Deletes(){
    if(reconcilingR2Deletes||!r2PendingOwner)return;
    reconcilingR2Deletes=true;
    const owner=r2PendingOwner;
    try{
      for(const item of pendingR2Deletes(owner)){
        if(owner!==r2PendingOwner)break;
        try{await r2Remove(item.id,{skipQueue:true});clearR2Delete(item.id,owner)}
        catch(error){
          // 409/423/403 are not transient. Keep no retry work for those.
          if(error?.retryable===false)clearR2Delete(item.id,owner);
        }
      }
    }finally{reconcilingR2Deletes=false}
  }
  window.addEventListener('online',()=>reconcilePendingR2Deletes().catch(()=>{}));
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')reconcilePendingR2Deletes().catch(()=>{});
  });
  client.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'){savePendingR2Deletes([]);return;}
    if(['INITIAL_SESSION','SIGNED_IN','TOKEN_REFRESHED'].includes(event)&&session?.user?.id)
      setTimeout(()=>reconcilePendingR2Deletes().catch(()=>{}),1500);
  });
  async function r2Remove(id,{skipQueue=false}={}){
    // Network interruption or a temporary Worker/DB failure should not leave
    // an uploaded object orphaned after the domain row has been removed.
    // Retrying DELETE is safe because the Worker verifies ownership, checks
    // authoritative references, and treats an already-deleted ID idempotently.
    // Never retry a 409/423: another live reference may still exist.
    let lastError=null;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const jwt=await r2Token();
        const response=await fetch(`${R2_API}/v1/media/${id}`,{
          method:'DELETE',headers:{Authorization:`Bearer ${jwt}`},cache:'no-store'
        });
        const data=await response.json().catch(()=>null);
        // HTTP 423 means the Worker deployment has deletion disabled, NOT
        // that another database row references the media. Distinguish this
        // from HTTP 409 (a real live reference) in production diagnostics.
        if(response.status===423){
          throw Object.assign(new Error(`R2 DELETE disabled (HTTP 423): ${data?.error||'R2_DELETE_ENABLED is not true'} [${id}]`),{retryable:false,httpStatus:423});
        }
        if(response.status===409){
          throw Object.assign(new Error(`R2 media still referenced (HTTP 409): ${data?.error||'Active database/media_links reference'} [${id}]`),{retryable:false,httpStatus:409});
        }
        if(!response.ok){
          const error=new Error(`R2 DELETE HTTP ${response.status}: ${data?.error||'Unknown error'} [${id}]`);
          // Retry only transient failures, not authorization or active links.
          error.retryable=[408,429,500,502,503,504].includes(response.status);
          error.httpStatus=response.status;
          throw error;
        }
        if(data?.deleted!==true || data?.id!==id)
          throw Object.assign(new Error('R2 deletion confirmation missing or mismatched'),{retryable:false});
        return;
      }catch(error){
        lastError=error;
        if(error?.retryable===false||attempt===2)break;
        // fetch() network errors are retryable; unknown HTTP failures above
        // are explicitly classified before reaching this point.
        await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
      }
    }
    if(!skipQueue&&lastError?.retryable!==false&&r2PendingOwner){
      queueR2Delete(id,r2PendingOwner);
      console.warn('[AvtoVIP R2] Transient DELETE queued for retry',id,lastError);
    }
    throw lastError;
  }

  // Authenticated private R2 media: never put JWT in a URL or localStorage.
  // Caller must revoke returned object URL when the preview is closed.
  // Download private R2 media with the same authenticated endpoint as previews.
  // Do not place access tokens in query strings, download links or browser history.
  async function downloadR2Media(mediaUrl){
    const match=R2_URL_RE.exec(String(mediaUrl||''));
    if(!match)throw new Error('Invalid R2 media URL');
    const jwt=await r2Token();
    const response=await fetch(mediaUrl,{headers:{Authorization:`Bearer ${jwt}`},cache:'no-store'});
    if(!response.ok)throw new Error(`Media download failed (${response.status})`);
    const declared=Number(response.headers.get('Content-Length'));
    if(declared>50*1024*1024)throw new Error('Media exceeds 50 MB');
    const blob=await response.blob();
    if(blob.size>50*1024*1024)throw new Error('Media exceeds 50 MB');
    return {blob,filename:`avtovip-${match[1]}.${blob.type.includes('video/mp4')?'mp4':blob.type.includes('video/webm')?'webm':blob.type.includes('png')?'png':blob.type.includes('webp')?'webp':blob.type.includes('gif')?'gif':'jpg'}`};
  }

  async function privateR2ObjectUrl(mediaUrl){
    const m=R2_URL_RE.exec(String(mediaUrl||''));
    if(!m)throw new Error('Invalid R2 media URL');
    const jwt=await r2Token();
    const response=await fetch(mediaUrl,{headers:{Authorization:`Bearer ${jwt}`},cache:'no-store'});
    if(!response.ok)throw new Error(`Private media access failed (${response.status})`);
    const declared=Number(response.headers.get('Content-Length'));
    if(declared>50*1024*1024)throw new Error('Private media exceeds 50 MB');
    const blob=await response.blob();
    if(blob.size>50*1024*1024)throw new Error('Private media exceeds 50 MB');
    return URL.createObjectURL(blob);
  }

  async function upload(bucket, userId, file, prefix = '') {
    if (!file || !userId) throw new Error('Fayl və istifadəçi tələb olunur.');
    // Route every supported user-media bucket to R2; fail closed otherwise.
    const category=bucket==='social-media'&&/^reels?(?:\/|$)/i.test(prefix)?'reel':R2_CATEGORIES[bucket];
    // All seven supported user-media buckets are R2-only. A stale global
    // AV_R2_UPLOADS_ENABLED=false must not silently redirect new uploads to
    // Supabase Storage (especially on cached PWA clients).
    if(category){
      if(!Number.isSafeInteger(file.size)||file.size<1)throw new Error('Boş və ya etibarsız media faylı.');
      if(['profile','place'].includes(category)&&file.type.startsWith('video/'))throw new Error('Profil və Məkanlar yalnız şəkil qəbul edir.');
      // Once enabled, never silently send an unsupported/oversized file to legacy Storage.
      if(file.size>50*1024*1024)throw new Error('R2 fayl ölçüsü maksimum 50 MB ola bilər.');
      if(!['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'].includes(file.type))
        throw new Error('R2 bu media formatını qəbul etmir.');
      const {data}=await client.auth.getSession();
      if(data?.session?.user?.id!==userId)throw new Error('R2 istifadəçi təsdiqi uğursuz oldu.');
      return r2Upload(file,category);
    }

    // Fail closed for unknown buckets: no unexpected user-media uploads
    // should fall through to Supabase Storage.
    throw new Error('Naməlum media bölməsi: R2-yə yükləmə dayandırıldı.');

  }


  function storagePathFromPublicUrl(bucket, url='') {
    // Never derive a local deletion key from a URL belonging to another host,
    // or from a lookalike path containing the bucket name.
    try {
      const raw=String(url);
      // URL() normalizes dot-segments, so reject encoded traversal before parsing.
      if(/%2e|%2f|%5c/i.test(raw) || /(?:^|\/)\.{1,2}(?:\/|\?|#|$)/.test(raw))return null;
      const source=new URL(raw);
      const project=new URL(SUPABASE_URL);
      if(source.origin!==project.origin || source.username || source.password)return null;
      const marker=`/storage/v1/object/public/${bucket}/`;
      if(!source.pathname.startsWith(marker))return null;
      const encoded=source.pathname.slice(marker.length);
      if(!encoded || /%2f|%5c/i.test(encoded))return null;
      const path=decodeURIComponent(encoded);
      const segments=path.split('/');
      if(segments.some(segment=>!segment || segment==='.' || segment==='..' || segment.includes('\\')))return null;
      return path;
    } catch { return null; }
  }

  async function removePaths(bucket, paths=[]) {
    const input=Array.isArray(paths)?paths:(paths==null?[]:[paths]);
    const clean=[...new Set(input.filter(p=>typeof p==='string'&&p.trim()))];
    if(!clean.length)return {data:[],error:null};
    const r2Ids=clean.filter(p=>/^r2:[0-9a-f-]{36}$/i.test(p)).map(p=>p.slice(3));
    // A malformed R2 identifier must never be forwarded to Supabase Storage.
    // But it must not prevent cleanup of other, valid files in the same batch.
    const malformedR2=clean.filter(p=>String(p).startsWith('r2:')&&!/^r2:[0-9a-f-]{36}$/i.test(p));
    // Storage paths must be relative object keys, never absolute paths or
    // traversal sequences. Validate here as well as in URL extraction because
    // removePaths() is also called directly by other application modules.
    const validLegacyPath=p=>typeof p==='string' && p.length>0 &&
      !p.startsWith('/') && !p.includes('\\') && !/[?#\x00-\x1f]/.test(p) &&
      !/%(?:2e|2f|5c)/i.test(p) &&
      p.split('/').every(part=>part && part!=='.' && part!=='..');
    const legacyCandidates=clean.filter(p=>!String(p).startsWith('r2:'));
    const invalidLegacy=legacyCandidates.filter(p=>!validLegacyPath(p));
    const legacy=legacyCandidates.filter(validLegacyPath);
    // Process every valid object even if another item is invalid or fails.
    // Preserve the existing {data,error} contract so callers see a partial failure.
    let firstError=malformedR2.length?new Error('Invalid R2 media reference'):(invalidLegacy.length?new Error('Invalid Storage media path'):null);
    for(const id of r2Ids){try{await r2Remove(id)}catch(error){firstError??=error}}
    if(!legacy.length)return {data:[],error:firstError};
    try{
      const result=await client.storage.from(bucket).remove(legacy);
      return {data:result.data||[],error:firstError||result.error||null};
    }catch(error){return {data:[],error:firstError||error}}

  }

  async function removeUrls(bucket, urls=[], entityType=null, entityId=null) {
    const input=Array.isArray(urls)?urls:(urls==null?[]:[urls]);
    const unique=[...new Set(input.filter(u=>typeof u==='string'&&u.trim()))];
    if(!unique.length)return {data:[],error:null};
    // Multiple images from one listing must not cause a long chain of serial
    // network round trips. Keep concurrency bounded for Worker and Supabase.
    // Every R2 object still gets its own authoritative ownership/reference check.
    const results=new Array(unique.length);
    let cursor=0;
    await Promise.all(Array.from({length:Math.min(3,unique.length)},async()=>{
      while(cursor<unique.length){
        const index=cursor++;
        const mediaUrl=unique[index];
        const r2=R2_URL_RE.exec(mediaUrl);
        try{
          if(r2){
            // DELETE already verifies ownership, domain references and prunes stale links.
            // Avoid a redundant unlink round trip for these cleanup paths only.
            if(!['post','reel','story','place'].includes(entityType)&&entityType&&entityId){
              try{await unlinkR2Media(mediaUrl,entityType,entityId)}catch(error){console.warn('[AvtoVIP R2 unlink]',entityType,entityId,error);}
            }
            await r2Remove(r2[1]);
            results[index]={data:[],error:null};
          }else{
            const path=storagePathFromPublicUrl(bucket,mediaUrl);
            if(!path)throw new Error('Media URL is not an AvtoVIP R2 or Supabase Storage URL');
            const result=await removePaths(bucket,[path]);
            if(result?.error)throw result.error;
            results[index]=result;
          }
        }catch(error){
          console.warn('[AvtoVIP media cleanup]',entityType,entityId,mediaUrl,error);
          results[index]={data:[],error};
        }
      }
    }));
    const firstError=results.find(x=>x?.error)?.error;
    if(firstError)throw firstError;
    return {data:results.flatMap(x=>x?.data||[]),error:null};
  }

  /*
   * AvtoVİP universal media normalizer.
   * - Images: HEIC/HEIF -> JPEG -> WebP, with size/dimension limits.
   * - Videos: any common phone/container/codec -> H.264/AAC MP4.
   * - FFmpeg uses the single-thread core so SharedArrayBuffer/COOP/COEP is NOT required.
   * - A small global progress UI keeps the user informed while conversion/upload is running.
   */
  let heicLoaderPromise = null;
  let ffmpegLoaderPromise = null;
  let ffmpegInstance = null;
  let mediaProgressEl = null;

  function mediaUi(){
    if(mediaProgressEl) return mediaProgressEl;
    const style=document.createElement('style');
    style.textContent=`
      #avMediaProgress{position:fixed;left:50%;top:calc(var(--header-h,68px) + env(safe-area-inset-top) + 10px);transform:translateX(-50%);width:min(92vw,520px);z-index:2147483000;display:none;pointer-events:none}
      #avMediaProgress.show{display:block}
      #avMediaProgress .av-mp-card{background:rgba(18,20,26,.97);border:1px solid rgba(255,255,255,.13);border-radius:16px;box-shadow:0 14px 40px rgba(0,0,0,.42);padding:12px 14px;color:#fff;backdrop-filter:blur(14px)}
      #avMediaProgress .av-mp-row{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:700}
      #avMediaProgress .av-mp-spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.25);border-top-color:#e10b18;border-radius:50%;animation:avMpSpin .75s linear infinite;flex:0 0 auto}
      #avMediaProgress .av-mp-track{height:7px;margin-top:9px;background:rgba(255,255,255,.10);border-radius:99px;overflow:hidden}
      #avMediaProgress .av-mp-bar{height:100%;width:0;background:linear-gradient(90deg,#9d111b,#e10b18,#ff3340);border-radius:99px;transition:width .18s ease}
      #avMediaProgress .av-mp-detail{margin-top:6px;font-size:11px;color:rgba(255,255,255,.68)}
      @keyframes avMpSpin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
    const el=document.createElement('div');el.id='avMediaProgress';el.innerHTML='<div class="av-mp-card"><div class="av-mp-row"><span class="av-mp-spin"></span><span class="av-mp-title">Media hazırlanır...</span></div><div class="av-mp-track"><div class="av-mp-bar"></div></div><div class="av-mp-detail"></div></div>';
    document.body.appendChild(el);mediaProgressEl=el;return el;
  }
  function mediaProgress(title='Media hazırlanır...',percent=0,detail=''){
    clearTimeout(mediaHideTimer);const el=mediaUi();el.classList.add('show');el.querySelector('.av-mp-title').textContent=title;el.querySelector('.av-mp-bar').style.width=`${Math.max(0,Math.min(100,Number(percent)||0))}%`;el.querySelector('.av-mp-detail').textContent=detail||'';
  }
  let mediaHideTimer=0;
  function mediaProgressHide(delay=120){const el=mediaProgressEl;if(!el)return;clearTimeout(mediaHideTimer);mediaHideTimer=setTimeout(()=>{el.classList.remove('show');el.querySelector('.av-mp-bar').style.width='0%'},delay)}

  function isHeicFile(file){
    const name=String(file?.name||'').toLowerCase(),type=String(file?.type||'').toLowerCase();
    return /heic|heif/.test(type)||/\.(heic|heif)$/i.test(name);
  }
  function isVideoFile(file){
    const name=String(file?.name||'').toLowerCase(),type=String(file?.type||'').toLowerCase();
    return type.startsWith('video/')||/\.(mp4|m4v|mov|qt|webm|mkv|avi|3gp|3g2|mpeg|mpg|mts|m2ts|ts|wmv|flv|ogv|vob)$/i.test(name);
  }

  async function loadScriptOnce(src,globalName,kind){
    if(window[globalName])return window[globalName];
    const key=kind==='heic'?'heicLoaderPromise':'ffmpegLoaderPromise';
    if(window.avtoDb[key])return window.avtoDb[key];
    const promise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=src;script.async=true;script.crossOrigin='anonymous';
      script.onload=()=>window[globalName]?resolve(window[globalName]):reject(new Error('Media emal modulu yüklənmədi.'));
      script.onerror=()=>reject(new Error('Media emal modulu yüklənmədi.'));document.head.appendChild(script);
    }).catch(e=>{if(kind==='heic')heicLoaderPromise=null;else ffmpegLoaderPromise=null;throw e});
    if(kind==='heic')heicLoaderPromise=promise;else ffmpegLoaderPromise=promise;return promise;
  }

  async function heicToJpeg(file){
    const lib=await loadScriptOnce('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js','heic2any','heic');
    const out=await lib({blob:file,toType:'image/jpeg',quality:.96});
    const blob=Array.isArray(out)?out[0]:out;
    if(!blob)throw new Error('HEIC/HEIF şəkli çevrilə bilmədi.');
    return new File([blob],`${String(file.name||'image').replace(/\.[^.]+$/,'')}.jpg`,{type:'image/jpeg',lastModified:Date.now()});
  }

  async function prepareImage(file,{maxWidth=2400,maxHeight=2400,quality=.90,maxBytes=4_000_000,progressTitle='Şəkil hazırlanır...'}={}){
    if(!file)return file;
    if(isVideoFile(file))return file;
    let src=file;
    mediaProgress(progressTitle,8,'Şəkil oxunur...');
    if(isHeicFile(src)){
      mediaProgress('Şəkil çevrilir...',18,'Telefon formatı uyğun formata hazırlanır...');
      src=await heicToJpeg(src);
    }
    const type=String(src.type||'').toLowerCase();
    if(!type.startsWith('image/'))throw new Error('Bu fayl şəkil kimi oxuna bilmədi.');
    if(src.size<=maxBytes && type==='image/webp'){
      mediaProgress(progressTitle,100,'Şəkil hazırdır.');mediaProgressHide(100);return src;
    }
    let bitmap;
    try{bitmap=await createImageBitmap(src,{imageOrientation:'from-image'});}catch{try{bitmap=await createImageBitmap(src)}catch{throw new Error('Şəkil oxuna bilmədi. Telefon formatı çevrilərkən xəta baş verdi.')}}
    const ratio=Math.min(1,maxWidth/bitmap.width,maxHeight/bitmap.height);
    const w=Math.max(1,Math.round(bitmap.width*ratio)),h=Math.max(1,Math.round(bitmap.height*ratio));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx){bitmap.close?.();throw new Error('Şəkil emalı üçün brauzer dəstəyi yoxdur.');}
    ctx.drawImage(bitmap,0,0,w,h);bitmap.close?.();
    let qualityNow=quality,blob=null;
    for(let i=0;i<4;i++){
      mediaProgress('Şəkil hazırlanır...',55+i*9,`${w}×${h}`);
      blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',qualityNow));
      if(!blob)break;if(blob.size<=maxBytes)break;qualityNow=Math.max(.68,qualityNow-.06);
    }
    if(!blob)throw new Error('Şəkil düzgün formata çevrilə bilmədi.');
    const base=String(src.name||'image').replace(/\.[^.]+$/,'');
    const out=new File([blob],`${base}.webp`,{type:'image/webp',lastModified:Date.now()});
    mediaProgress(progressTitle,100,'Şəkil hazırdır.');mediaProgressHide(100);return out;
  }

  async function loadFFmpeg(){
    const lib=await loadScriptOnce('https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js','FFmpeg','ffmpeg');
    if(!lib?.createFFmpeg||!lib?.fetchFile)throw new Error('Video emal modulu yüklənmədi.');
    if(!ffmpegInstance){
      ffmpegInstance=lib.createFFmpeg({
        log:false,
        mainName:'main',
        corePath:'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js'
      });
    }
    if(!ffmpegInstance.isLoaded())await ffmpegInstance.load();
    return {lib,ffmpeg:ffmpegInstance};
  }

  async function transcodeVideo(file,{maxWidth=1280,maxHeight=1280,progressTitle='Video hazırlanır...',onProgress=null}={}){
    if(!file)return file;if(!isVideoFile(file))throw new Error('Bu fayl video kimi oxuna bilmədi.');
    const ext=String(file.name||'').split('.').pop().toLowerCase();
    /* Keep small MP4 uploads fast. Large MP4 files need a size-reduction pass so
       repeated feed/Reels playback does not transfer the original camera file.
       This only changes newly uploaded media; existing Storage files are untouched. */
    const MAX_DIRECT_MP4_BYTES=20*1024*1024;
    if(ext==='mp4' && String(file.type||'').toLowerCase()==='video/mp4' && file.size<=MAX_DIRECT_MP4_BYTES){
      mediaProgress(progressTitle,100,'Video hazırdır.');onProgress?.(100);mediaProgressHide(100);return file;
    }
    mediaProgress(progressTitle,6,'Video uyğunluğu yoxlanılır...');
    const {lib,ffmpeg}=await loadFFmpeg();
    const base=String(file.name||'video').replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]+/gi,'-')||'video';
    const stamp=Date.now();const input=`av-input-${stamp}.${(String(file.name||'mp4').split('.').pop()||'mp4').replace(/[^a-z0-9]/gi,'')||'mp4'}`;const output=`av-output-${stamp}.mp4`;
    mediaProgress(progressTitle,10,'Video hazırlanır...');
    try{
      ffmpeg.setProgress?.(({ratio})=>{const pct=Math.max(12,Math.min(94,12+(Number(ratio)||0)*82));mediaProgress(progressTitle,pct,`Çevrilir... ${Math.round((Number(ratio)||0)*100)}%`);onProgress?.(pct)});
      ffmpeg.FS('writeFile',input,await lib.fetchFile(file));
      mediaProgress(progressTitle,14,'Video çevrilir...');
      const run=async args=>{await ffmpeg.run(...args)};
      const common=['-i',input,'-map','0:v:0','-map','0:a:0?','-vf',`scale=w=${maxWidth}:h=${maxHeight}:force_original_aspect_ratio=decrease:force_divisible_by=2`,'-r','30','-c:v','libx264','-preset','ultrafast','-crf','27','-pix_fmt','yuv420p','-threads','1','-c:a','aac','-b:a','96k','-ar','44100','-ac','2','-movflags','+faststart',output];
      await run(common);
      const data=ffmpeg.FS('readFile',output);if(!data?.length)throw new Error('empty-output');
      const out=new File([data.buffer],`${base}.mp4`,{type:'video/mp4',lastModified:Date.now()});
      // Never replace a valid MP4 with a larger encoded copy.
      const originalIsSupportedMp4=ext==='mp4' && String(file.type||'').toLowerCase()==='video/mp4';
      const result=(originalIsSupportedMp4 && out.size>=file.size)?file:out;
      mediaProgress(progressTitle,100,'Video hazırdır.');return result;
    }catch(e){
      console.error('[AvtoVIP media] video conversion failed',e);
      throw new Error('Video uyğun MP4 formatına çevrilə bilmədi. Zəhmət olmasa videonu yenidən seçin.');
    }finally{try{ffmpeg.FS('unlink',input)}catch{}try{ffmpeg.FS('unlink',output)}catch{}mediaProgressHide(500)}
  }

  async function prepareMedia(file,opts={}){
    if(isVideoFile(file))return transcodeVideo(file,opts);
    return prepareImage(file,opts);
  }

  window.avtoDb = {
    client,
    url: SUPABASE_URL,
    adminEmail: ADMIN_EMAIL,
    getUser,
    getProfile,
    current,
    requireAuth,
    requireAdmin,
    upload,
    storagePathFromPublicUrl,
    removePaths,
    removeUrls,
    privateR2ObjectUrl,
    downloadR2Media,
    linkR2Media,
    unlinkR2Media,
    prepareImage,
    transcodeVideo,
    prepareMedia,
    isHeicFile,
    isVideoFile,
    mediaProgress,
    mediaProgressHide
  };
})();
