# AvtoVIP marka/model konsolidasiyası — 2026-11-15

- motorcycle: **BMW → BMW Motorrad**, mənbə 249 model, hədəf 214 model, yekun 249 model.
- aircraft: **ATR → ATR Aircraft**, mənbə 25 model, hədəf 6 model, yekun 31 model.
- commercial: **Edward Davies Commercials → Edward Davies**, mənbə 3 model, hədəf 3 model, yekun 4 model.
- Avtomobil: Kia Motors → KIA; model siyahısında təkrarlar silindi.
- BMW → BMW M: yalnız dəqiq M1/M2/M3/M4/M5/M6/M8/XM və X3/X4/X5/X6 M, Z3/Z4 M ailəsinə uyğun 79 qeyd köçürüldü; M Sport, M135i, M340i kimi modellər BMW-də saxlanıldı.

## Qəsdən birləşdirilməyənlər
- Airbus / Airbus Helicopters / Airbus Corporate Jets: fərqli məhsul xətləri.
- BYD / BYD Commercial: fərqli məhsul xətləri; üst-üstə düşən T3 modelinin ayrıca yoxlanılması lazımdır.
- Ford / Ford Trucks: Ford Trucks siyahısındakı 96 modelin hamısı Ford siyahısında da var, lakin Ford-un 693 modelini avtomatik yük maşını kimi təsnif etmək olmaz.
- Chevrolet / Chevrolet Commercial: ayrı kommersiya təsnifatı, mənbə kommersiya kataloqunda qarışıq modellər var.
- BMW / BMW Motorrad: motosiklet kateqoriyasında birləşdirildi, avtomobil BMW markasına toxunulmadı.

## Məhdudiyyətlər
- Bu dəyişiklik mövcud istifadəçi elanlarını və Supabase məlumatlarını köçürmür. Köhnə marka adları ilə saxlanmış elanlar üçün ayrıca DB migrasiyası tələb oluna bilər.
- Brend loqolarının eyni olması mütləq təkrar marka demək deyil. Loqo faylları dəyişdirilmədi.
- Bütün mümkün marka sinonimlərini avtomatik birləşdirmək model itkisi və yanlış təsnifat riski daşıyır.
