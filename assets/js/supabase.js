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

  window.avtoDb = {
    client,
    url: SUPABASE_URL,
    adminEmail: ADMIN_EMAIL,
    getUser,
    getProfile,
    current,
    requireAuth,
    requireAdmin,
    upload
  };
})();
