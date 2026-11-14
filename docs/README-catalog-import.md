# AvtoVIP katalog mənbə inteqrasiyası — yoxlama paketi

Bu paket canlı kataloqa avtomatik və yoxlanmamış modellər yazmır.

- `scripts/catalog/catalog_sync.py` NHTSA vPIC və Wikidata SPARQL vasitəsilə namizəd modelləri axtarır.
- `.github/workflows/review-public-catalog.yml` GitHub Actions-da **əl ilə** başladılır; nəticə artifact kimi CSV-də çıxır.
- `assets/data/catalog-final-audit.csv` 8 kateqoriya üzrə son yüklənmiş ZIP-in auditi.
- `assets/data/catalog-empty-brands.csv` modelləri sıfır olan 504 markanın siyahısı.

## İşlətmək
GitHub Actions → Review public catalog sources → Run workflow. Sonra `avtovip-catalog-candidates` artifact-ində namizədlərə baxın. İnternet, Wikidata sorğu limitləri və istehsalçı əlaqələrinin natamamlığı nəticələri məhdudlaşdıra bilər. NHTSA-da yol nəqliyyatına aid olmayan markalar ümumiyyətlə olmaya bilər.

## Qoruma
- Mənbə əlaqəsi birbaşa P176 (manufacturer) olmalıdır; ad yalnız kataloqdakı boş markaya **dəqiq** uyğun gələndə namizəd çıxarılır.
- Namizədlər qəti model təsdiqi sayılmır; növ və seriya qarışıqlığı mümkündür. Buna görə `--apply` təhlükəsizlik səbəbi ilə dəyişiklik etmədən dayanır.
- Kataloq JSON, CSV, interfeys, beş dil və iki tema dəyişdirilməyib.
- Bu paket 500 model əlavə olunduğu və ya final kataloqun tamamlandığı iddiası deyil.
