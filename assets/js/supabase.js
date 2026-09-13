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

  async function prepareImage(file,{maxWidth=1600,maxHeight=1600,quality=.82,maxBytes=2_500_000}={}){
    if(!file?.type?.startsWith('image/'))return file;
    if(file.size<=maxBytes && !['image/png'].includes(file.type)) return file;
    const bitmap=await createImageBitmap(file);
    const ratio=Math.min(1,maxWidth/bitmap.width,maxHeight/bitmap.height);
    const w=Math.max(1,Math.round(bitmap.width*ratio)),h=Math.max(1,Math.round(bitmap.height*ratio));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(bitmap,0,0,w,h);bitmap.close?.();
    let qualityNow=quality,blob=null;
    for(let i=0;i<4;i++){
      blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',qualityNow));
      if(!blob||blob.size<=maxBytes)break;qualityNow=Math.max(.55,qualityNow-.09);
    }
    if(!blob)return file;
    const base=(file.name||'image').replace(/\.[^.]+$/,'');
    return new File([blob],`${base}.webp`,{type:'image/webp',lastModified:Date.now()});
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
    prepareImage
  };
})();
