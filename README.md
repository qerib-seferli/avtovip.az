# AvtoVİP.az

Azərbaycan üçün mobile-first avtomobil marketplace/PWA. Layihə GitHub Pages + Supabase üçün hazırlanıb.

## Quraşdırma

1. `sql/01_avtovip_full_schema.sql` faylını **Supabase → SQL Editor** bölməsində tam RUN edin.
2. **Authentication → URL Configuration** bölməsində GitHub Pages URL-ni əlavə edin:
   - Site URL: `https://qerib-seferli.github.io/avtovip.az/`
   - Redirect URLs: `https://qerib-seferli.github.io/avtovip.az/**`
3. `huseyn@avtovip.az` ilə qeydiyyatdan keçin. SQL trigger bu emaili avtomatik `admin` edir.
4. Faylları repo kökünə yükləyin və GitHub Pages deploy edin.
5. Admin: `admin/index.html`

## Struktur

- `assets/js/supabase.js` — yalnız Supabase public bağlantısı və auth/storage helper-ləri
- `assets/js/app.js` — istifadəçi saytının bütün frontend funksiyaları
- `assets/css/app.css` — bütün əsas UI/UX
- `admin/index.html`, `admin/js/admin.js`, `admin/css/admin.css` — admin ayrıca
- `assets/img/brands/` — avtomobil marka loqoları
- `assets/img/brand/` — AvtoVİP logo və PWA ikonları
- `sql/01_avtovip_full_schema.sql` — tam baza, RLS, storage, realtime, trigger və RPC-lər

## Manual ödəniş mərhələsi

`payment_requests` avtomatik bank ödənişi deyil. İstifadəçi VIP/Premium/Story üçün sorğu yaradır, admin real ödənişi ayrıca yoxlayır və paneldən təsdiqləyir. VÖEN/biznes hesabı + merchant müqaviləsi hazır olduqda bu modul dəyişmədən bank callback/verify axınına bağlana bilər.

## Təhlükəsizlik

Anon key frontend-də public istifadə üçün nəzərdə tutulub. **Supabase service_role key, bank merchant secret, OTP secret və başqa gizli açarlar repoya yazılmamalıdır.** RLS bütün kritik cədvəllərdə aktivdir.
