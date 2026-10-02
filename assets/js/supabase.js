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

  async function upload(bucket, userId, file, prefix = '') {
    if (!file || !userId) throw new Error('Fayl və istifadəçi tələb olunur.');
    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
    const stem = cleanName(file.name?.replace(/\.[^.]+$/, '') || 'media');
    const fileName = `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}-${stem}.${ext}`;
    const path = `${userId}/${prefix ? `${prefix}/` : ''}${fileName}`;
    const { error } = await client.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    });
    if (error) throw error;
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return { path, url: data.publicUrl };
  }


  function storagePathFromPublicUrl(bucket, url='') {
    try {
      const marker=`/storage/v1/object/public/${bucket}/`;
      const i=String(url).indexOf(marker);
      return i>=0 ? decodeURIComponent(String(url).slice(i+marker.length).split('?')[0]) : null;
    } catch { return null; }
  }

  async function removePaths(bucket, paths=[]) {
    const clean=[...new Set((paths||[]).filter(Boolean))];
    if(!clean.length)return {data:[],error:null};
    return client.storage.from(bucket).remove(clean);
  }

  async function removeUrls(bucket, urls=[]) {
    return removePaths(bucket,(urls||[]).map(u=>storagePathFromPublicUrl(bucket,u)).filter(Boolean));
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
    /* Most Android/iPhone camera MP4 files are already directly usable. Do not re-encode them
       needlessly: it is much faster and preserves the original visual quality. MOV/HEVC and
       other containers still go through FFmpeg for cross-browser compatibility. */
    if(ext==='mp4' && String(file.type||'video/mp4').toLowerCase().includes('mp4')){
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
      mediaProgress(progressTitle,100,'Video hazırdır.');return out;
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
    prepareImage,
    transcodeVideo,
    prepareMedia,
    isHeicFile,
    isVideoFile,
    mediaProgress,
    mediaProgressHide
  };
})();
