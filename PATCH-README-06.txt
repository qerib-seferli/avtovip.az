AvtoVIP Patch 06 — UX / Explore Search / Profile / i18n / Brand Logo resilience
Date: 2026-09-14

SQL: YOXDUR. Bu patch üçün Supabase SQL işlətməyin.

GitHub-da eyni yollarla replace/add edin:
- assets/js/app.js
- assets/js/social.js
- assets/css/app.css
- explore.html
- profile.html
- service-worker.js
- .github/workflows/snapshot-vehicle-catalog.yml

Sonra:
1) GitHub Pages deploy bitməsini gözləyin.
2) Actions > Freeze Vehicle Catalog > Run workflow (marka snapshot/logolar üçün) işlədin.
3) Yaşıl olduqdan sonra Ctrl+F5 edin.

Əsas dəyişikliklər:
- Dil seçicisində yalnız bayraqlar; dropdown opaque və sabitdir.
- Bildiriş paneli PWA-da viewport daxilində qalır.
- Sevimlilər boş mesajı dilə uyğunlaşdırılıb.
- Kəşfet demo izahı çıxarılıb və qlobal axtarış əlavə edilib (elan + istifadəçi).
- Profil PWA ölçüləri, dairəvi avatar, çıxış düyməsi, sosial statistika və blok rəngi düzəldilib.
- Profil məlumatları açılıb-bağlanan paneldir.
- Marka loqoları üçün local snapshot -> mənbə logo -> Simple Icons -> monogram fallback zənciri var.
- Freeze Vehicle Catalog workflow-un makes.json URL-i canonical CDN yoluna düzəldilib.
- Service Worker cache v7.
