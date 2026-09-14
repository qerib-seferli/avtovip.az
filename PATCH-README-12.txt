AvtoVIP Patch 12 — mobile/PWA + chat + i18n correction

Bu ZIP yalnız dəyişən faylları ehtiva edir.

Əsas düzəlişlər:
- PWA mesajlaşma panelinin yan-yana sıxılıb dağılması aradan qaldırıldı.
- Chat seçildikdə mesaj sahəsi və göndər düyməsi normal tam en düzülüşündə işləyir.
- Bloklanmış münasibət zamanı composer gizlənir; blok yoxdursa yazışma aktivdir.
- Əvvəl bloklu açılan söhbət sonradan blokdan çıxarılanda submit handler itmir.
- Kəşfet daxil olmaqla alt naviqasiya bütün dillərdə yenidən lokallaşdırılır.
- Ölkə filtrlərində seçilmiş ölkənin bayrağı + adı custom select düyməsində saxlanılır.
- Mobil header, dil menyusu, bildiriş popoveri və alt naviqasiya viewport-dan daşmır.
- Profil sosial statistikaları və balans/ödəniş hissəsi alt nav ilə üst-üstə düşmür.
- PWA səhifələrinə aşağı safe-area boşluğu əlavə edildi.
- Cache versiyası v12 edildi.

SQL tələb olunmur. Əvvəl işlədilmiş realtime SQL-i yenidən işlətməyə ehtiyac yoxdur.

Quraşdırma:
1) ZIP-dəki faylları GitHub-da eyni qovluqlara replace edin.
2) GitHub Pages deploy bitsin.
3) Brauzerdə Ctrl+F5 edin.
4) PWA-nı tam bağlayıb yenidən açın.
