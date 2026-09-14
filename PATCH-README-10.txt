AvtoVIP — Patch 10 (stability / realtime / local assets / i18n)

1) Supabase SQL Editor-də sql/08_realtime_ui_hardening.sql faylını 1 dəfə RUN edin.
2) ZIP-dəki dəyişən faylları GitHub-da eyni yollara əlavə/replace edin.
3) GitHub Pages deploy bitəndən sonra bir dəfə Ctrl+F5 edin; PWA-nı tam bağlayıb açın.

Əsas düzəlişlər:
- Realtime publication + replica identity + server-side bloklanmış mesaj qoruması.
- Mesaj və bildiriş realtime kanalları statuslu/yenilənən edildi; admin panel də realtime yenilənir.
- Səhifə ilk açılışda DB/şəbəkəni gözləyib qaranlıq/boş qalmır.
- Marka loqolarından runtime üçüncü tərəf CDN asılılığı çıxarıldı; yalnız repodakı lokal snapshot istifadə olunur.
- Dil bayrağı seçildikdən dərhal sonra düzgün yenilənir.
- Profil ölkə bayrağında xarici flagcdn asılılığı çıxarıldı.
- 0 elan / profil / maliyyə statusları və əlavə statik mətnlər dillərə uyğunlaşdırıldı.
- Mesaj siyahısı və chat mobil/desktop layout sabitləşdirildi.
- Custom select popover-ləri viewport daxilində sabit açılır.
- Admin istifadəçi avatarları və sol naviqasiya ölçüləri kilidləndi.
- Cache versiyası v10-a qaldırıldı.

Qeyd: Real beynəlxalq kart/bank ödənişini avtomatik settlement etmək üçün ayrıca merchant/payment-gateway inteqrasiyası tələb olunur; bu patch məzənnəni uydurmur və real pul köçürməsini saxta simulyasiya etmir.
