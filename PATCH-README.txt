AvtoVIP international catalog / i18n / UX patch — 2026-09-14

Bu ZIP yalnız dəyişən və yeni fayllardan ibarətdir.

TƏTBİQ:
1) ZIP-dəki faylları GitHub repo-da eyni yollarla replace/add et.
2) Bu patch üçün Supabase SQL RUN ETMƏK LAZIM DEYİL — DB sxemi dəyişmir.
3) GitHub → Actions → “Freeze Vehicle Catalog” workflow-unu 1 dəfə manual işə sal.
   Bu addım marka/model snapshotını və mümkün marka loqolarını sənin öz repo-na yazır.
   Sayt local snapshotı birinci istifadə edir; xarici source sonradan silinsə belə snapshot qalır.
4) Workflow yaşıl olduqdan sonra GitHub Pages deploy-u gözlə və Ctrl+F5 et.

NƏ DƏYİŞDİ:
- Marka rail-də ikiqat logo problemi silindi; bir marka yalnız bir dəfə render olunur.
- Rail səhifəni üfüqi genişləndirmir və sonsuz dövrə DOM elementlərini daşımaqla işləyir.
- Marka kataloqu və model autocomplete geniş qlobal dataset + lokal fallback ilə işləyir. 160 model limiti silinib.
- Manual “Freeze Vehicle Catalog” workflow marka/model datasını repo-ya snapshot edir.
- Marka logo URL-ləri datasetdən avtomatik götürülür; snapshot workflow mümkün logo fayllarını lokal repo-ya da saxlayır. Alınmayan logo üçün baş hərflər fallback kimi göstərilir.
- AZ/EN/RU/TR/KA dil selectorunda bayraqlar var.
- Brend adı domen suffixsizdir: AvtoVIP / AutoVIP / АвтоVIP / OtoVIP / ავტოVIP.
- Dinamik UI tərcümələri genişləndirilib; AZ sözlərinin digər dillərə sızması üçün observer aktivdir.
- Rəng seçimi real rəng swatch-ları və daha geniş rəng palitrası ilə custom picker-dir.
- AZ dilində rəng və təchizat adlarının English fallback problemi düzəldilib.
- Düymə və uzun tərcümələr üçün wrap/compact qaydaları gücləndirilib.
- Global horizontal overflow qoruması gücləndirilib.
- Voice recognition TR/KA daxil seçilən dilə uyğun işləyir.
- PWA manifest təsviri artıq yalnız Azərbaycan bazarı ilə məhdud deyil.

ETİBARLILIQ:
- vehicle-makes.json + vehicle-models.csv snapshot workflow-dan sonra sənin GitHub repo-da qalır.
- runtime local-first-dir: əvvəl assets/data snapshot, sonra remote source, sonra built-in fallback/cache.
- dünya ölkə/region/şəhər datası hələ lazy remote source + browser cache modelindədir; bu patch onu repo-ya tam kopyalamır. Gələcəkdə geo dataset üçün də ayrıca snapshot workflow qurmaq olar.

SQL: yoxdur.
