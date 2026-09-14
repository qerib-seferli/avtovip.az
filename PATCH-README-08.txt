AvtoVIP Patch 08 — 2026-09-14

Bu arxiv yalnız dəyişən/yeni fayllardan ibarətdir.

ARDICILLIQ
1) Supabase SQL Editor-də sql/06_wallet_membership_notifications.sql faylını 1 dəfə RUN edin.
2) Arxivdəki digər faylları GitHub repo-da eyni yollarla replace/add edin.
3) GitHub Actions > Freeze Vehicle Catalog workflow-u 1 dəfə manual başladın. Workflow plowman/open-vehicle-db models.csv mənbəsini local snapshot-a çevirir; xarici logo sorğuları edilmir.
4) GitHub Pages deploy bitəndən sonra brauzerdə Ctrl+F5 edin. PWA-nı tam bağlayıb yenidən açın.

ƏSAS DƏYİŞİKLİKLƏR
- vehicle catalog local-first; 404 logo request storm çıxarıldı
- lokal marka ikon fallback-ları əlavə edildi
- marka lenti touch scroll + stabil auto-scroll
- PWA FOUC/köhnə stil flash qoruması
- custom select və color select yarışması dayandırıldı
- dil/bildiriş popup-ları viewport daxilində və opaque
- profil ölkəsi + bayraq + wallet + membership tier + verified
- profil desktop 4 sütun, mobil 2 sütun
- blok privacy və bloklu DM composer gizlətmə
- DM conversation kartları sabit ölçülü
- actor şəkilli və qruplaşdırılmış notification metadata
- follow/message/like/comment notification trigger-ləri
- admin native confirm/prompt çıxarıldı, AvtoVIP dialog əlavə edildi
- admin AZ/EN/RU/TR/KA başlanğıc lokalizasiya
- admin Free/VIP/Premium + Verified idarəsi
- ödənişlərdə lokal bank/provider adları istifadəçiyə göstərilmir
- story müddəti bitmiş media admin cleanup-da dərhal təmizlənir

QEYD
İlk local snapshot-da işlək fallback kataloq var. Freeze Vehicle Catalog workflow-u yaşıl bitəndən sonra repo-dakı vehicle-models.csv daha geniş 1,600+ model mənbəyi ilə yenilənir.
