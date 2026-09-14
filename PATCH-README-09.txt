AvtoVIP PATCH 09 — 2026-09-14

1) Supabase SQL Editor-də yalnız sql/07_currency_wallet_blocking.sql faylını 1 dəfə RUN edin.
2) ZIP-dəki digər faylları GitHub-da eyni yol ilə replace/add edin.
3) GitHub Pages deploy tamamlandıqdan sonra brauzerdə Ctrl+F5 edin; PWA-nı tam bağlayıb yenidən açın.

Əsas dəyişikliklər:
- Ana səhifədə böyük hero hissəsi çıxarıldı; Avto Hekayələr birinci oldu; təkrar Hekayə yerləşdir düyməsi silindi.
- Google Fonts şəbəkə asılılığı çıxarıldı, səhifə ilk açılışı yüngülləşdirildi.
- Dil dəyişimi tam səhifə reload etmədən işləyir; dropdown scrollbar/əsimə problemi sıxlaşdırıldı.
- Kəşfet və balans/ödəniş mətnlərinin AZ/EN/RU/TR/KA tərcümələri artırıldı.
- Profil Yeni elan düyməsi çıxarıldı.
- Ölkəyə görə preferred/wallet currency (AZN/RUB/TRY/GEL/USD/EUR...) hazırlandı. Balans > 0 olduqda valyuta avtomatik dəyişdirilmir ki, məbləğ səhv çevrilməsin.
- Blok münasibətində hər iki istiqamətdə mesaj insert DB səviyyəsində qadağandır; composer gizlənir və səbəbə uyğun xəbərdarlıq görünür.
- Mesaj başlığından qarşı tərəfin profilinə keçid var; söhbət kartları sabit ölçüdədir.
- Verified nişanı rozet tipinə keçirildi. VIP avatarına tac, Premium avatarına gem + ikiqat premium frame əlavə edildi.
- Admin istifadəçi avatarları 46x46 ölçüyə kilidləndi, naviqasiya ikon/söz aralığı düzəldildi.
- Marka lenti requestAnimationFrame-dən yüngül intervala keçirildi və touch scroll saxlanıldı.

Vacib: Bu patch valyuta uçotunu ölkəyə uyğunlaşdırır, amma real kart/bank ödənişinin avtomatik məzənnə + settlement ilə hesabınıza düşməsi üçün ayrıca payment gateway (məs. Stripe/Adyen/Checkout.com və ya yerli PSP) merchant hesabı/API açarları lazımdır. Gateway qoşulmadan sistem bank köçürməsini özü icra edə bilməz.
