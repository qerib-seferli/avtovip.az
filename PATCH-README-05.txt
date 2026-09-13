AvtoVIP — Social/Explore/Notifications/Draft patch (2026-09-14)

1) Supabase SQL Editor-də sql/04_social_explore_follow_notifications.sql faylını 1 dəfə RUN edin.
2) ZIP-dəki digər faylları GitHub-da eyni yerlərə əlavə/replace edin.
3) GitHub Actions -> Freeze Vehicle Catalog -> Run workflow. Bu versiyada makes.json üçün 404 yaradan owner yolu düzəldilib.
4) GitHub Pages deploy bitəndən sonra Ctrl+F5 edin.

Yeni əsas funksiyalar:
- Dil selectoru custom/stabil + bayraqlar; köhnə dil ikonunun çıxarılması.
- Header: Sevimlilər + Bildiriş zəngi və kompakt notification popover.
- Bottom nav: Sevimlilər yerinə Kəşfet.
- Explore: 20-20 lazy pagination, Premium/VIP prioritet, like/comment/share/save/WhatsApp.
- Follow/unfollow, block/unblock, public user profile, avatar full-screen viewer.
- Profil: follower/following/blocked siyahıları və unblock.
- Sosial hadisələrdən notification trigger-ləri.
- Filter və elan formu draft persistence (localStorage).
- Elan şəkillərində X ilə seçilmiş şəkli submitdən əvvəl silmək.
- Quick filter Axtar düyməsi input hündürlüyünə uyğun.
- Bottom-nav uzun mətnləri kompakt və mərkəzli.
- Service worker cache v5.

Qeyd: brauzer təhlükəsizliyinə görə file input-dakı seçilmiş fayllar səhifə refreshindən sonra avtomatik bərpa edilmir. Mətn/select/checkbox məlumatları cihazda draft olaraq qalır. Şəkillər serverə elan submit edilənədək yüklənmir; bu, Supabase storage-da orphan fayl yığılmasının qarşısını alır.
