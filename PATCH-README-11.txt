AvtoVIP PATCH 11 — realtime + UI + i18n stability

1) Supabase SQL Editor-də sql/09_realtime_full_hardening.sql faylını 1 dəfə RUN edin.
   Gözlənilən nəticə: Success. No rows returned.
2) ZIP-dəki bütün faylları GitHub-da eyni yollar üzrə replace/add edin.
3) GitHub Pages deploy bitdikdən sonra brauzerdə Ctrl+F5 edin.
4) PWA açıqdırsa tam bağlayıb yenidən açın. Service worker cache v11-dir.

Əsas dəyişikliklər:
- Realtime publication/replica identity və chat block guard möhkəmləndirildi.
- Mesajlar/notification/follow/block/payment/wallet realtime yeniləmələri üçün retry/reconnect əlavə edildi.
- Mesaj seçilməyənədək composer gizlidir; conversation kartı sabit grid quruluşundadır.
- Verified badge stabil SVG rozet formasına keçirildi.
- VIP/Premium profil kartları avatarla yanaşı bütün kart səviyyəsində fərqləndirilir.
- Dil dəyişərkən profil ölkə siyahısı, balans/ödənişlər, mesajlar və dinamik mətnlər yenidən lokallaşdırılır.
- Lokal dil bayraqları stabilləşdirildi; ABŞ üçün local us.svg əlavə edildi.
- Admin realtime retry/reconnect və mobil/sidebar layout stabilləşdirildi.
- 70 vehicle make local logo path yoxlanılıb; remote brand-logo CDN asılılığı yoxdur.
