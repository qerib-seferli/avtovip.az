AvtoVIP Patch 13 — 2026-09-15

Bu ZIP yalnız dəyişən faylları saxlayır.

Əsas düzəlişlər:
- Dil seçimi ilk səhifə yüklənməsində də tam tətbiq olunur; dil dəyişmədən sonra düzələn vəziyyət aradan qaldırılıb.
- Profil VIP/Premium görünüşü ilk açılışda tətbiq olunur.
- Profil ölkə bayrağı və ölkə seçicilərində bayraqlar sabitləşdirilib.
- Mesajlaşma PWA layout-u yenidən qurulub: chat composer alt naviqasiyanın altında qalmır.
- Blok vəziyyəti yoxlanarkən frontend xətası bütün mesajlaşmanı bağlamır.
- Mesaj blok trigger-i üçün idempotent SQL əlavə olunub.
- Realtime publication-a messages/notifications/user_blocks/user_follows cədvəllərinin qoşulması SQL-də yoxlanılır.
- Marka loqolarının ağ fon/çərçivəsi silinib; local/fallback görünüşü təmizlənib.
- Country custom-select menyularında ölkə kodundan düzgün bayraq yaradılır.
- Cache versiyası v13 edilib.

Quraşdırma:
1. ZIP-dəki faylları GitHub-da eyni yollarla əvəz edin.
2. Supabase SQL Editor-da 20260915_messages_block_realtime_fix.sql faylını 1 dəfə RUN edin.
3. GitHub Pages deploy bitəndən sonra brauzerdə Ctrl+F5 edin.
4. PWA-nı tam bağlayıb yenidən açın.

SQL məlumat silmir. Trigger-i düzgün blok məntiqi ilə yeniləyir və realtime publication-u tamamlayır.
