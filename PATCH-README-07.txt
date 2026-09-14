AvtoVIP patch 07

1) Supabase SQL Editor-də sql/05_blocked_messaging_guard.sql faylını 1 dəfə RUN edin.
2) ZIP-dəki digər faylları GitHub-da eyni yollarla replace/add edin.
3) GitHub Pages deploy bitdikdən sonra Ctrl+F5 edin. PWA varsa tətbiqi tam bağlayıb yenidən açın.

Əsas dəyişikliklər:
- bloklanan istifadəçilər arasında mesaj server səviyyəsində qadağandır;
- bütün əsas select-lər AvtoVIP custom dropdown ilə açılır;
- profil məlumatları həmişə bağlı başlayır;
- PWA pinch-zoom söndürülüb;
- mobil profil 2 sütun, desktop 4 sütun;
- dil/bildiriş popup-ları opaque və viewport daxilindədir;
- sosial modal/avatar viewer daşmır;
- profil blok sayını göstərir;
- cache v7 və asset cache-busting əlavə olunub.
