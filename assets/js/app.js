/* ============================================================
   AvtoVİP — əsas frontend modulu
   1 əsas JS + ayrıca supabase.js. Admin kodu admin/js/admin.js-dədir.
   ============================================================ */
(() => {
  'use strict';
  const db = window.avtoDb;
  if (!db) return;
  const sb = db.client;
  const intl = window.AvtoVIPInternational || null;
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const page = document.body.dataset.page || 'home';
  const params = new URLSearchParams(location.search);

  const BRANDS = [
    ['Audi','audi_logo.png'],['BMW','bmw_logo.png'],['BYD','byd_logo.png'],['Changan','changan_logo.png'],
    ['Chery','chery_logo.png'],['Chevrolet','chevrolet_logo.png'],['Ford','ford_logo.png'],['Hyundai','hyundai_logo.png'],
    ['Infiniti','infiniti_logo.png'],['Jeep','jeep_logo.png'],['Khazar','khazar_logo.png'],['Kia','kia_logo.png'],
    ['Lada/VAZ','lada_vaz_logo.png'],['Land Rover','land_rover_logo.png'],['Lexus','lexus_logo.png'],['Mazda','mazda_logo.png'],
    ['Mercedes-Benz','mercedes_logo.png'],['Mitsubishi','mitsubishi_logo.png'],['Nissan','nissan_logo.png'],['Opel','opel_logo.png'],
    ['Porsche','porsche_logo.png'],['Renault','renault_logo.png'],['Toyota','toyota_logo.png'],['Volkswagen','volkswagen_logo.png']
  ];
  const BODY_TYPES = ['Avtobus','Avtokran','Dartqı','Fastbek','Fayton','Furqon','Hetçbek (3 qapı)','Hetçbek (4 qapı)','Hetçbek (5 qapı)','Kabriolet','Karvan','Kompakt-Van','Kupe','Kvadrosikl','Liftbek','Limuzin','Mikroavtobus','Mikrovan','Minivan','Moped','Motosiklet','Offroader / SUV (3 qapı)','Offroader / SUV (5 qapı)','Offroader / SUV (açıq)','Pikap (bir yarım kabin)','Pikap (ikiqat kabin)','Pikap (tək kabin)','Qolfkar','Rodster','Sedan','Skuter','Spidster','SUV Kupe','Tarqa','Trisikl','Universal (3 qapı)','Universal (5 qapı)','Van','Yük maşını','Digər'];
  const FUELS = ['Benzin','Dizel','Qaz','Elektro','Hibrid','Plug-in Hibrid','Hidrogen','Dizel-Hibrid'];
  const TRANSMISSIONS = ['Avtomat (AT)','Avtomat (DHT)','Avtomat (Robot)','Avtomat (Variator)','Avtomat (Reduktor)','Mexaniki (MT)'];
  const DRIVETRAINS = ['Ön','Arxa','Tam'];
  const COLOR_OPTIONS = [
    ['Qara','#111111','Black','Чёрный','Siyah','შავი'],['Antrasit','#30343b','Anthracite','Антрацит','Antrasit','ანტრაციტი'],['Qrafit','#4a4f56','Graphite','Графитовый','Grafit','გრაფიტისფერი'],['Yaş asfalt','#555a60','Asphalt gray','Мокрый асфальт','Asfalt gri','ასფალტისფერი'],['Tünd boz','#5f6368','Dark gray','Тёмно-серый','Koyu gri','მუქი ნაცრისფერი'],['Boz','#80858c','Gray','Серый','Gri','ნაცრისფერი'],['Gümüşü','#c5c9ce','Silver','Серебристый','Gümüş','ვერცხლისფერი'],['Ağ','#f4f4f2','White','Белый','Beyaz','თეთრი'],['Mirvari ağ','#fffdf2','Pearl white','Жемчужно-белый','İnci beyaz','მარგალიტის თეთრი'],['Fil sümüyü','#eee4cc','Ivory','Слоновая кость','Fildişi','სპილოს ძვლისფერი'],['Bej','#d8c7a8','Beige','Бежевый','Bej','ბეჟი'],['Şampan','#d7c19a','Champagne','Шампань','Şampanya','შამპანური'],['Bürünc','#a56f42','Bronze','Бронзовый','Bronz','ბრინჯაოსფერი'],['Qəhvəyi','#70462e','Brown','Коричневый','Kahverengi','ყავისფერი'],['Tünd qəhvəyi','#4a2c20','Dark brown','Тёмно-коричневый','Koyu kahverengi','მუქი ყავისფერი'],['Bordo','#7b1822','Burgundy','Бордовый','Bordo','ბორდოსფერი'],['Qırmızı','#d5222e','Red','Красный','Kırmızı','წითელი'],['Al qırmızı','#f04444','Scarlet','Алый','Kızıl','ალისფერი'],['Mərcan','#eb6b5c','Coral','Коралловый','Mercan','მარჯნისფერი'],['Çəhrayı','#e98ca9','Pink','Розовый','Pembe','ვარდისფერი'],['Qızılgül rəngi','#c96f87','Rose','Пыльная роза','Gül kurusu','ვარდისფერი'],['Narıncı','#e77820','Orange','Оранжевый','Turuncu','ნარინჯისფერი'],['Mis','#b66a35','Copper','Медный','Bakır','სპილენძისფერი'],['Qızılı','#c5a04b','Gold','Золотистый','Altın','ოქროსფერი'],['Sarı','#e2cc25','Yellow','Жёлтый','Sarı','ყვითელი'],['Limon sarısı','#dbe531','Lime yellow','Лимонный','Limon sarısı','ლიმონისფერი'],['Xaki','#77774b','Khaki','Хаки','Haki','ხაკისფერი'],['Zeytun','#687447','Olive','Оливковый','Zeytin','ზეთისხილისფერი'],['Tünd yaşıl','#1f5137','Dark green','Тёмно-зелёный','Koyu yeşil','მუქი მწვანე'],['Yaşıl','#2f8c4b','Green','Зелёный','Yeşil','მწვანე'],['Nanə yaşıl','#86c6a1','Mint green','Мятный','Nane yeşili','პიტნისფერი'],['Firuzəyi','#39aeb0','Turquoise','Бирюзовый','Turkuaz','ფირუზისფერი'],['Açıq mavi','#73a7d8','Light blue','Голубой','Açık mavi','ცისფერი'],['Göy','#2359a8','Blue','Синий','Mavi','ლურჯი'],['Tünd göy','#173a72','Navy blue','Тёмно-синий','Lacivert','მუქი ლურჯი'],['Bənövşəyi','#744e9a','Purple','Фиолетовый','Mor','იისფერი'],['Lavanda','#9a85c4','Lavender','Лавандовый','Lavanta','ლავანდისფერი']
  ].map(([value,hex,en,ru,tr,ka])=>({value,az:value,hex,en,ru,tr,ka}));
  const COLORS = COLOR_OPTIONS.map(x=>x.value);
  const EQUIPMENT_OPTIONS = [
    ['Yüngül lehimli disklər','Alloy wheels','Легкосплавные диски','Alaşım jantlar','მსუბუქი დისკები'],
    ['ABS','ABS','ABS','ABS','ABS'],['ESP / ESC','ESP / ESC','ESP / ESC','ESP / ESC','ESP / ESC'],['Dartı nəzarəti (TCS)','Traction control (TCS)','Антипробуксовочная система (TCS)','Çekiş kontrolü (TCS)','მოჭიდების კონტროლი (TCS)'],
    ['Hava yastıqları','Airbags','Подушки безопасности','Hava yastıkları','აირბაგები'],['Yan pərdələr','Side curtain airbags','Шторки безопасности','Perde hava yastıkları','გვერდითი ფარდები'],['ISOFIX','ISOFIX','ISOFIX','ISOFIX','ISOFIX'],
    ['Kruiz-kontrol','Cruise control','Круиз-контроль','Hız sabitleyici','კრუიზ-კონტროლი'],['Adaptiv kruiz-kontrol','Adaptive cruise control','Адаптивный круиз-контроль','Adaptif hız sabitleyici','ადაპტიური კრუიზ-კონტროლი'],
    ['Ölü zona köməkçisi','Blind-spot monitoring','Контроль слепых зон','Kör nokta uyarısı','ბრმა ზონის მონიტორინგი'],['Zolaqda qalma yardımı','Lane keeping assist','Удержание в полосе','Şerit takip asistanı','ზოლში დარჩენის ასისტენტი'],['Zolaqdan çıxma xəbərdarlığı','Lane departure warning','Предупреждение о сходе с полосы','Şeritten çıkma uyarısı','ზოლიდან გადასვლის გაფრთხილება'],
    ['Ön toqquşma xəbərdarlığı','Forward collision warning','Предупреждение о столкновении','Ön çarpışma uyarısı','წინა შეჯახების გაფრთხილება'],['Avtomatik təcili əyləc','Automatic emergency braking','Автоматическое экстренное торможение','Otomatik acil fren','ავტომატური საგანგებო დამუხრუჭება'],
    ['Yoxuşda dəstək sistemi','Hill-start assist','Помощь при старте в гору','Yokuş kalkış desteği','აღმართზე დაძვრის ასისტენტი'],['Enişə nəzarət','Hill descent control','Помощь при спуске','Yokuş iniş desteği','დაღმართის კონტროლი'],
    ['Park radarı','Parking sensors','Парктроник','Park sensörü','პარკინგის სენსორები'],['Ön park radarı','Front parking sensors','Передний парктроник','Ön park sensörü','წინა პარკინგის სენსორები'],['Arxa park radarı','Rear parking sensors','Задний парктроник','Arka park sensörü','უკანა პარკინგის სენსორები'],
    ['Arxa görüntü kamerası','Rear-view camera','Камера заднего вида','Geri görüş kamerası','უკანა ხედვის კამერა'],['Ön kamera','Front camera','Передняя камера','Ön kamera','წინა კამერა'],['360º kamera','360° camera','Камера 360°','360° kamera','360° კამერა'],['Avtomatik park sistemi','Automatic parking','Автопарковка','Otomatik park','ავტოპარკინგი'],
    ['Mərkəzi qapanma','Central locking','Центральный замок','Merkezi kilit','ცენტრალური საკეტი'],['Açarsız giriş','Keyless entry','Бесключевой доступ','Anahtarsız giriş','გასაღების გარეშე შესვლა'],['Açarsız işə salma','Keyless start','Запуск без ключа','Anahtarsız çalıştırma','გასაღების გარეშე დაქოქვა'],['Uzaqdan işə salma','Remote start','Дистанционный запуск','Uzaktan çalıştırma','დისტანციური დაქოქვა'],['Start-stop sistemi','Start-stop system','Система Start-Stop','Start-stop sistemi','Start-stop სისტემა'],['Siqnalizasiya','Alarm system','Сигнализация','Alarm','სიგნალიზაცია'],['İmmobilayzer','Immobilizer','Иммобилайзер','İmmobilizer','იმობილაიზერი'],
    ['Kondisioner','Air conditioning','Кондиционер','Klima','კონდიციონერი'],['Klimat-kontrol','Climate control','Климат-контроль','Otomatik klima','კლიმატ-კონტროლი'],['2 zonalı klimat-kontrol','Dual-zone climate control','2-зонный климат-контроль','Çift bölgeli klima','2-ზონიანი კლიმატი'],['3/4 zonalı klimat-kontrol','3/4-zone climate control','3/4-зонный климат-контроль','3/4 bölgeli klima','3/4-ზონიანი კლიმატი'],
    ['Dəri salon','Leather interior','Кожаный салон','Deri döşeme','ტყავის სალონი'],['Alkantara salon','Alcantara interior','Салон Alcantara','Alcantara döşeme','Alcantara სალონი'],['Oturacaqların isidilməsi','Heated seats','Подогрев сидений','Koltuk ısıtma','სავარძლების გათბობა'],['Arxa oturacaqların isidilməsi','Heated rear seats','Подогрев задних сидений','Arka koltuk ısıtma','უკანა სავარძლების გათბობა'],['Oturacaqların ventilyasiyası','Ventilated seats','Вентиляция сидений','Koltuk havalandırma','სავარძლების ვენტილაცია'],['Oturacaq masajı','Massage seats','Массаж сидений','Masaj koltukları','მასაჟის სავარძლები'],['Elektrik oturacaqlar','Power seats','Электрорегулировка сидений','Elektrikli koltuklar','ელექტრო სავარძლები'],['Oturacaq yaddaşı','Seat memory','Память сидений','Koltuk hafızası','სავარძლის მეხსიერება'],['Sükan isidilməsi','Heated steering wheel','Подогрев руля','Direksiyon ısıtma','საჭის გათბობა'],
    ['Lyuk','Sunroof','Люк','Sunroof','ლუქი'],['Panoramik dam','Panoramic roof','Панорамная крыша','Panoramik tavan','პანორამული ჭერი'],['Baqajın avtomatik açılması','Power tailgate','Электропривод багажника','Elektrikli bagaj','ელექტრო საბარგული'],['Hands-free baqaj','Hands-free tailgate','Багажник hands-free','Temassız bagaj','hands-free საბარგული'],['Güzgülərin qatlanması','Power-folding mirrors','Складывающиеся зеркала','Katlanır aynalar','დასაკეცი სარკეები'],['Güzgülərin isidilməsi','Heated mirrors','Обогрев зеркал','Isıtmalı aynalar','სარკეების გათბობა'],
    ['Yağış sensoru','Rain sensor','Датчик дождя','Yağmur sensörü','წვიმის სენსორი'],['İşıq sensoru','Light sensor','Датчик света','Far sensörü','სინათლის სენსორი'],['Avtomatik uzaq işıq','Automatic high beam','Автоматический дальний свет','Otomatik uzun far','ავტომატური შორი განათება'],['Ksenon lampalar','Xenon headlights','Ксеноновые фары','Xenon farlar','ქსენონის ფარები'],['LED faralar','LED headlights','LED-фары','LED farlar','LED ფარები'],['Matrix LED','Matrix LED','Matrix LED','Matrix LED','Matrix LED'],['Duman faraları','Fog lights','Противотуманные фары','Sis farları','ნისლის ფარები'],
    ['Naviqasiya sistemi','Navigation system','Навигация','Navigasyon','ნავიგაცია'],['Monitor (Multimediya)','Multimedia display','Мультимедийный экран','Multimedya ekranı','მულტიმედიის ეკრანი'],['Rəqəmsal cihaz paneli','Digital instrument cluster','Цифровая приборная панель','Dijital gösterge paneli','ციფრული პანელი'],['Head-Up Display','Head-Up Display','Проекционный дисплей','Head-Up Display','Head-Up Display'],['Apple CarPlay / Android Auto','Apple CarPlay / Android Auto','Apple CarPlay / Android Auto','Apple CarPlay / Android Auto','Apple CarPlay / Android Auto'],['Bluetooth','Bluetooth','Bluetooth','Bluetooth','Bluetooth'],['USB','USB','USB','USB','USB'],['Simsiz şarj','Wireless charging','Беспроводная зарядка','Kablosuz şarj','უსადენო დამუხტვა'],['Premium audio','Premium audio','Премиальная аудиосистема','Premium ses sistemi','Premium აუდიო'],['Arxa sərnişin monitoru','Rear entertainment screen','Экран для задних пассажиров','Arka eğlence ekranı','უკანა მგზავრის ეკრანი'],
    ['Multi-sükan','Multifunction steering wheel','Мультируль','Çok fonksiyonlu direksiyon','მულტიფუნქციური საჭე'],['Sükan gücləndiricisi','Power steering','Усилитель руля','Direksiyon desteği','საჭის გამაძლიერებელი'],['Adaptiv asqı','Adaptive suspension','Адаптивная подвеска','Adaptif süspansiyon','ადაპტიური საკიდარი'],['Pnevmatik asqı','Air suspension','Пневмоподвеска','Havalı süspansiyon','პნევმატური საკიდარი'],['TPMS təkər təzyiqi nəzarəti','TPMS tire pressure monitoring','Контроль давления в шинах TPMS','TPMS lastik basınç takibi','TPMS საბურავის წნევის კონტროლი'],['Gecə görmə sistemi','Night vision','Ночное видение','Gece görüşü','ღამის ხედვა'],['Yedək qarmağı','Tow hitch','Фаркоп','Çeki demiri','ბუქსირის კაუჭი'],['Dam reylinqləri','Roof rails','Рейлинги','Tavan rayları','სახურავის რელსები']
  ].map(([value,en,ru,tr,ka])=>({value,az:value,en,ru,tr,ka}));
  const EQUIPMENT = EQUIPMENT_OPTIONS.map(x=>x.value);
  const CITIES = ['Bakı','Bərdə','Gəncə','Mingəçevir','Naxçıvan','Sumqayıt','Xırdalan'];
  let countryCatalog=[]; let vehicleMakes=[]; let activeLocationData=null;

  const I18N = {
    az:{home:'Əsas',favorites:'Sevimlilər',messages:'Mesajlar',profile:'Profil',create:'Elan ver',login:'Giriş',logout:'Çıxış',search:'Axtar',advanced:'Ətraflı',all:'Hamısı',brand:'Marka',model:'Model',price:'Qiymət',year:'İl',mileage:'Yürüş',city:'Şəhər',newListings:'Son elanlar',smartTitle:'Nə axtardığınızı adi cümlə ilə yazın',smartHint:'Məsələn: 30 minə qədər, 2018-dən yuxarı, avtomat ağ Toyota, kredit olsun.',storyTitle:'Avto Hekayələr',storySub:'24 saatlıq premium vitrin',addStory:'Hekayə yerləşdir',empty:'Uyğun nəticə tapılmadı.',pending:'Moderasiya gözləyir',approved:'Aktiv',rejected:'Rədd edildi',sold:'Satılıb',save:'Yadda saxla',cancel:'Ləğv et',send:'Göndər',call:'Zəng et',whatsapp:'WhatsApp',compare:'Müqayisə',share:'Paylaş',report:'Şikayət',goodPrice:'Yaxşı qiymət',marketPrice:'Bazar qiymətində',highPrice:'Bazardan yüksək',install:'Tətbiqi yüklə'},
    en:{home:'Home',favorites:'Favorites',messages:'Messages',profile:'Profile',create:'Post ad',login:'Sign in',logout:'Sign out',search:'Search',advanced:'More filters',all:'All',brand:'Make',model:'Model',price:'Price',year:'Year',mileage:'Mileage',city:'City',newListings:'Latest listings',smartTitle:'Describe the car you want in a sentence',smartHint:'Example: white automatic Toyota under 30k, 2018+, with credit.',storyTitle:'Auto Stories',storySub:'24-hour premium showcase',addStory:'Post story',empty:'No matching results.',pending:'Pending review',approved:'Active',rejected:'Rejected',sold:'Sold',save:'Save',cancel:'Cancel',send:'Send',call:'Call',whatsapp:'WhatsApp',compare:'Compare',share:'Share',report:'Report',goodPrice:'Good price',marketPrice:'Market price',highPrice:'Above market',install:'Install app'},
    ru:{home:'Главная',favorites:'Избранное',messages:'Сообщения',profile:'Профиль',create:'Подать объявление',login:'Войти',logout:'Выйти',search:'Поиск',advanced:'Фильтры',all:'Все',brand:'Марка',model:'Модель',price:'Цена',year:'Год',mileage:'Пробег',city:'Город',newListings:'Новые объявления',smartTitle:'Опишите нужный автомобиль обычной фразой',smartHint:'Например: белая Toyota автомат до 30 тыс., от 2018 года, в кредит.',storyTitle:'Авто Истории',storySub:'Премиум-витрина на 24 часа',addStory:'Добавить историю',empty:'Подходящих результатов нет.',pending:'На модерации',approved:'Активно',rejected:'Отклонено',sold:'Продано',save:'Сохранить',cancel:'Отмена',send:'Отправить',call:'Позвонить',whatsapp:'WhatsApp',compare:'Сравнить',share:'Поделиться',report:'Пожаловаться',goodPrice:'Хорошая цена',marketPrice:'Рыночная цена',highPrice:'Выше рынка',install:'Установить'},
    tr:{home:'Ana Sayfa',favorites:'Favoriler',messages:'Mesajlar',profile:'Profil',create:'İlan Ver',login:'Giriş',logout:'Çıkış',search:'Ara',advanced:'Detaylı Filtre',all:'Tümü',brand:'Marka',model:'Model',price:'Fiyat',year:'Yıl',mileage:'Kilometre',city:'Şehir',newListings:'Yeni İlanlar',smartTitle:'Aradığınız aracı normal bir cümleyle yazın',smartHint:'Örnek: 30 bin altı, 2018 üstü, beyaz otomatik Toyota, kredi olsun.',storyTitle:'Avto Hikayeler',storySub:'24 saatlik premium vitrin',addStory:'Hikaye Ekle',empty:'Uygun sonuç bulunamadı.',pending:'İncelemede',approved:'Aktif',rejected:'Reddedildi',sold:'Satıldı',save:'Kaydet',cancel:'İptal',send:'Gönder',call:'Ara',whatsapp:'WhatsApp',compare:'Karşılaştır',share:'Paylaş',report:'Şikayet Et',goodPrice:'İyi fiyat',marketPrice:'Piyasa fiyatı',highPrice:'Piyasanın üstünde',install:'Uygulamayı yükle'},
    ka:{home:'მთავარი',favorites:'რჩეულები',messages:'შეტყობინებები',profile:'პროფილი',create:'განცხადების დამატება',login:'შესვლა',logout:'გასვლა',search:'ძებნა',advanced:'დეტალური ფილტრი',all:'ყველა',brand:'ბრენდი',model:'მოდელი',price:'ფასი',year:'წელი',mileage:'გარბენი',city:'ქალაქი',newListings:'ახალი განცხადებები',smartTitle:'აღწერეთ სასურველი ავტომობილი ჩვეულებრივი წინადადებით',smartHint:'მაგალითი: თეთრი ავტომატური Toyota 30 ათასამდე, 2018+.',storyTitle:'ავტო ისტორიები',storySub:'24 საათიანი პრემიუმ ვიტრინა',addStory:'ისტორიის დამატება',empty:'შესაბამისი შედეგი ვერ მოიძებნა.',pending:'მოდერაციაზე',approved:'აქტიური',rejected:'უარყოფილია',sold:'გაყიდულია',save:'შენახვა',cancel:'გაუქმება',send:'გაგზავნა',call:'დარეკვა',whatsapp:'WhatsApp',compare:'შედარება',share:'გაზიარება',report:'საჩივარი',goodPrice:'კარგი ფასი',marketPrice:'საბაზრო ფასი',highPrice:'ბაზარზე მაღალი',install:'აპის დაყენება'}
  };
  const STATIC_I18N = {
    'Ad':['Name','Имя'],'Soyad':['Surname','Фамилия'],'Telefon':['Phone','Телефон'],'Telefon *':['Phone *','Телефон *'],'Ünvan':['Address','Адрес'],'Haqqında':['About','О себе'],
    'Əsas səhifə':['Home','Главная'],'Avtomobil tap':['Find a car','Найти авто'],'Axtarış':['Search','Поиск'],'Ətraflı':['More filters','Фильтры'],'Sıfırla':['Reset','Сбросить'],
    'Markalar':['Makes','Марки'],'Son elanlar':['Latest listings','Новые объявления'],'Yeni elan':['New ad','Новое объявление'],'Yeni elanlar':['New ads','Новые объявления'],
    'Qiymət min':['Min price','Цена от'],'Qiymət max':['Max price','Цена до'],'İl min':['Year from','Год от'],'İl max':['Year to','Год до'],'Yürüş max':['Max mileage','Пробег до'],
    'Ban növü':['Body type','Кузов'],'Yanacaq':['Fuel','Топливо'],'Sürətlər qutusu':['Transmission','Коробка передач'],'Ötürücü':['Drive','Привод'],'Rəng':['Color','Цвет'],'Şəhər':['City','Город'],'Şəhər *':['City *','Город *'],
    'Kredit':['Credit','Кредит'],'Barter':['Trade-in','Бартер'],'Kredit mümkündür':['Credit available','Возможен кредит'],'Barter mümkündür':['Trade-in available','Возможен бартер'],
    'Ən yeni':['Newest','Новые'],'Qiymət ↑':['Price ↑','Цена ↑'],'Qiymət ↓':['Price ↓','Цена ↓'],'İl ↓':['Year ↓','Год ↓'],'Sırala':['Sort','Сортировка'],
    'Avtomobil elanı yerləşdir':['Post a vehicle ad','Разместить объявление'],'Məlumatları dəqiq doldurun. Yeni elan əvvəlcə moderasiyaya göndərilir.':['Enter accurate information. New ads are reviewed before publication.','Заполните данные точно. Новое объявление сначала проходит модерацию.'],
    'Əsas məlumatlar':['Main details','Основные данные'],'Marka *':['Make *','Марка *'],'Model *':['Model *','Модель *'],'Nəsil':['Generation','Поколение'],'Komplektasiya':['Trim','Комплектация'],'Buraxılış ili *':['Year *','Год выпуска *'],'Qiymət *':['Price *','Цена *'],'Valyuta':['Currency','Валюта'],
    'Texniki məlumatlar':['Technical details','Технические данные'],'Mühərrik, L':['Engine, L','Двигатель, л'],'Güc, a.g.':['Power, hp','Мощность, л.с.'],'Yürüş, km *':['Mileage, km *','Пробег, км *'],'Oturacaq sayı':['Seats','Количество мест'],'Sahib sayı':['Owners','Количество владельцев'],'Bazar mənşəyi':['Market origin','Рынок происхождения'],
    'Yeni avtomobil':['New vehicle','Новый автомобиль'],'Vuruğu var':['Has accident damage','Есть повреждения'],'Rənglənib':['Repainted','Красился'],'Təchizat':['Equipment','Оснащение'],'Şəkillər':['Photos','Фотографии'],
    'Minimum 3, maksimum 15 şəkil. Hər fayl maksimum 10 MB.':['Minimum 3, maximum 15 photos. Each file up to 10 MB.','Минимум 3, максимум 15 фото. Каждый файл до 10 МБ.'],
    'Satıcı və açıqlama':['Seller and description','Продавец и описание'],'WhatsApp nömrəsi':['WhatsApp number','Номер WhatsApp'],'Açıqlama':['Description','Описание'],'Moderasiyaya göndər':['Send for review','Отправить на модерацию'],
    '24 saatlıq Avto Hekayə':['24-hour Auto Story','Авто-история на 24 часа'],'24 saatlıq premium vitrin':['24-hour premium showcase','Премиум-витрина на 24 часа'],'Hekayə yerləşdir':['Post story','Добавить историю'],
    'Şəkil və ya video *':['Photo or video *','Фото или видео *'],'Elana bağla':['Link to an ad','Привязать к объявлению'],'Elana bağlama':['Do not link','Не привязывать'],'Qısa mətn':['Short text','Короткий текст'],'Aktivləşdirmə':['Activation','Активация'],
    'Ödəniş üsulu':['Payment method','Способ оплаты'],'Kartdan karta':['Card transfer','Перевод на карту'],'Digər/manual':['Other/manual','Другое/вручную'],'Ödəniş qeydi':['Payment note','Комментарий к оплате'],'Hekayə sorğusu göndər':['Submit story request','Отправить заявку на историю'],
    'İlk mərhələdə manual təsdiq':['Manual approval at the first stage','На первом этапе ручное подтверждение'],
    'Sayt pulun gəldiyini avtomatik təsdiqləmir. Admin paneldə yoxlanıldıqdan sonra hekayə aktivləşdirilir.':['The site does not auto-confirm receipt of funds. The story is activated after admin verification.','Сайт не подтверждает оплату автоматически. История активируется после проверки администратором.'],
    'Avtomobilləri müqayisə et':['Compare vehicles','Сравнить автомобили'],'Maksimum 4 elanı yan-yana müqayisə edin.':['Compare up to 4 ads side by side.','Сравнивайте до 4 объявлений рядом.'],'Elan seç':['Select ad','Выберите объявление'],
    'Bəyəndiyiniz avtomobillər və qiymət endirimi bildirişləri.':['Cars you liked and price-drop alerts.','Избранные авто и уведомления о снижении цены.'],
    'Satıcı və alıcı arasında real-time yazışma.':['Real-time chat between buyer and seller.','Чат в реальном времени между покупателем и продавцом.'],'Söhbət':['Conversation','Диалог'],'AvtoVİP mesajlaşma':['AvtoVİP messaging','Чат AvtoVİP'],
    'Profil məlumatları':['Profile details','Данные профиля'],'Mənim elanlarım':['My ads','Мои объявления'],'Bildirişlər':['Notifications','Уведомления'],'Ödəniş sorğuları':['Payment requests','Заявки на оплату'],'Yadda saxla':['Save','Сохранить'],'Çıxış':['Sign out','Выйти'],
    'AvtoVİP hesabı':['AvtoVİP account','Аккаунт AvtoVİP'],'Elan, mesaj, sevimlilər və premium xidmətlər bir hesabda.':['Ads, messages, favorites and premium services in one account.','Объявления, сообщения, избранное и премиум-услуги в одном аккаунте.'],
    'Giriş et':['Sign in','Войти'],'Qeydiyyat':['Register','Регистрация'],'Hesab yarat':['Create account','Создать аккаунт'],'Email':['Email','Email'],'Şifrə':['Password','Пароль'],'Şifrə təkrar':['Repeat password','Повторите пароль'],'Şifrəni unutmusunuz?':['Forgot password?','Забыли пароль?'],
    'Şifrəni yenilə':['Reset password','Сбросить пароль'],'Hesabınıza yenidən giriş üçün təhlükəsiz link alın.':['Get a secure link to regain access to your account.','Получите безопасную ссылку для восстановления доступа.'],'Link göndər':['Send link','Отправить ссылку'],'Giriş səhifəsinə qayıt':['Back to sign in','Вернуться ко входу'],'Yeni şifrə':['New password','Новый пароль'],'Şifrəni dəyiş':['Change password','Изменить пароль'],
    'Tətbiqi yüklə':['Install app','Установить приложение'],'AvtoVİP-ı telefona tətbiq kimi əlavə edin.':['Add AvtoVİP to your phone as an app.','Добавьте AvtoVİP на телефон как приложение.'],
    'Ölkə':['Country','Страна'],'Ölkə *':['Country *','Страна *'],'Region / Ştat':['Region / State','Регион / Штат'],'Rayon / Bölgə':['District / Area','Район / Округ'],'Qiymət və il':['Price and year','Цена и год'],'Texniki göstəricilər':['Technical specifications','Технические характеристики'],'Əlavə şərtlər':['Additional conditions','Дополнительные условия'],'Avtomobilin təchizatı':['Vehicle equipment','Оснащение автомобиля'],'Yürüş min':['Min mileage','Пробег от'],'Mühərrik min, L':['Engine min, L','Двигатель от, л'],'Mühərrik max, L':['Engine max, L','Двигатель до, л'],'Güc min, a.g.':['Min power, hp','Мощность от, л.с.'],'Güc max, a.g.':['Max power, hp','Мощность до, л.с.'],'Oturacaq min':['Min seats','Мест от'],'Oturacaq max':['Max seats','Мест до'],'Sahib sayı max':['Max owners','Владельцев до'],'Vəziyyət':['Condition','Состояние'],'Sürülmüş':['Used','С пробегом'],'Yeni':['New','Новый'],'Bazar mənşəyi':['Market origin','Рынок происхождения'],'Məkan':['Location','Местоположение'],'Yürüş ↑':['Mileage ↑','Пробег ↑'],'Hamısı':['All','Все'],'Seçin':['Select','Выберите'],
    'Premium avtomobil bazarı':['Premium car marketplace','Премиум авторынок'],'Avtomobil bazarının ağıllı tərəfi.':['The smarter side of the car market.','Умная сторона авторынка.'],'Al, sat, müqayisə et, qiyməti analiz et və satıcı ilə birbaşa əlaqə saxla.':['Buy, sell, compare, analyze prices and contact the seller directly.','Покупайте, продавайте, сравнивайте, анализируйте цены и связывайтесь с продавцом напрямую.'],
    'Bir toxunuşla filtr':['One-tap filters','Фильтры в одно касание'],'Premium və VIP elanlar ön sırada':['Premium and VIP ads come first','Premium и VIP объявления выше'],'WhatsApp əlaqəsi':['WhatsApp contact','Связь через WhatsApp'],'Sevimli':['Favorite','Избранное'],'Aktiv elan':['Active ads','Активные объявления']
  };


  const BRAND_BY_LANG = {
    az:{name:'AvtoVİP',tagline:'Premium avtomobil bazarı'},
    en:{name:'AutoVIP',tagline:'Premium car marketplace'},
    ru:{name:'АвтоVIP',tagline:'Премиум авторынок'},
    tr:{name:'OtoVIP',tagline:'Premium otomobil pazarı'},
    ka:{name:'ავტოVIP',tagline:'პრემიუმ ავტომობილების ბაზარი'}
  };

  const DOMAIN_TEXT = {
    'Benzin':{en:'Petrol',ru:'Бензин',tr:'Benzin',ka:'ბენზინი'},'Dizel':{en:'Diesel',ru:'Дизель',tr:'Dizel',ka:'დიზელი'},'Qaz':{en:'Gas/LPG',ru:'Газ/LPG',tr:'LPG/Gaz',ka:'გაზი/LPG'},'Elektro':{en:'Electric',ru:'Электро',tr:'Elektrik',ka:'ელექტრო'},'Hibrid':{en:'Hybrid',ru:'Гибрид',tr:'Hibrit',ka:'ჰიბრიდი'},'Plug-in Hibrid':{en:'Plug-in hybrid',ru:'Plug-in гибрид',tr:'Plug-in hibrit',ka:'Plug-in ჰიბრიდი'},'Hidrogen':{en:'Hydrogen',ru:'Водород',tr:'Hidrojen',ka:'წყალბადი'},'Dizel-Hibrid':{en:'Diesel hybrid',ru:'Дизель-гибрид',tr:'Dizel hibrit',ka:'დიზელ-ჰიბრიდი'},
    'Avtomat (AT)':{en:'Automatic (AT)',ru:'Автомат (AT)',tr:'Otomatik (AT)',ka:'ავტომატური (AT)'},'Avtomat (DHT)':{en:'Automatic (DHT)',ru:'Автомат (DHT)',tr:'Otomatik (DHT)',ka:'ავტომატური (DHT)'},'Avtomat (Robot)':{en:'Automated manual (Robot)',ru:'Робот',tr:'Robotik',ka:'რობოტი'},'Avtomat (Variator)':{en:'CVT',ru:'Вариатор',tr:'CVT',ka:'ვარიატორი'},'Avtomat (Reduktor)':{en:'Reducer / single-speed',ru:'Редуктор',tr:'Redüktör',ka:'რედუქტორი'},'Mexaniki (MT)':{en:'Manual (MT)',ru:'Механика (MT)',tr:'Manuel (MT)',ka:'მექანიკური (MT)'},
    'Ön':{en:'Front-wheel drive',ru:'Передний',tr:'Önden çekiş',ka:'წინა ამძრავი'},'Arxa':{en:'Rear-wheel drive',ru:'Задний',tr:'Arkadan çekiş',ka:'უკანა ამძრავი'},'Tam':{en:'All-wheel drive',ru:'Полный',tr:'Dört çeker',ka:'სრული ამძრავი'},
    'Avtobus':{en:'Bus',ru:'Автобус',tr:'Otobüs',ka:'ავტობუსი'},'Avtokran':{en:'Mobile crane',ru:'Автокран',tr:'Mobil vinç',ka:'ავტოკრანი'},'Dartqı':{en:'Tractor unit',ru:'Тягач',tr:'Çekici',ka:'საწევარი'},'Fastbek':{en:'Fastback',ru:'Фастбек',tr:'Fastback',ka:'ფასტბეკი'},'Fayton':{en:'Phaeton',ru:'Фаэтон',tr:'Fayton',ka:'ფაეტონი'},'Furqon':{en:'Cargo van',ru:'Фургон',tr:'Panelvan',ka:'ფურგონი'},'Hetçbek (3 qapı)':{en:'Hatchback (3-door)',ru:'Хэтчбек (3 дв.)',tr:'Hatchback (3 kapı)',ka:'ჰეჩბეკი (3 კარი)'},'Hetçbek (4 qapı)':{en:'Hatchback (4-door)',ru:'Хэтчбек (4 дв.)',tr:'Hatchback (4 kapı)',ka:'ჰეჩბეკი (4 კარი)'},'Hetçbek (5 qapı)':{en:'Hatchback (5-door)',ru:'Хэтчбек (5 дв.)',tr:'Hatchback (5 kapı)',ka:'ჰეჩბეკი (5 კარი)'},'Kabriolet':{en:'Convertible',ru:'Кабриолет',tr:'Cabrio',ka:'კაბრიოლეტი'},'Karvan':{en:'Caravan',ru:'Караван',tr:'Karavan',ka:'ქარავანი'},'Kompakt-Van':{en:'Compact van',ru:'Компактвэн',tr:'Kompakt van',ka:'კომპაქტ-ვენი'},'Kupe':{en:'Coupe',ru:'Купе',tr:'Coupe',ka:'კუპე'},'Kvadrosikl':{en:'Quadricycle',ru:'Квадрицикл',tr:'Quadricycle',ka:'კვადროციკლი'},'Liftbek':{en:'Liftback',ru:'Лифтбек',tr:'Liftback',ka:'ლიფტბეკი'},'Limuzin':{en:'Limousine',ru:'Лимузин',tr:'Limuzin',ka:'ლიმუზინი'},'Mikroavtobus':{en:'Minibus',ru:'Микроавтобус',tr:'Minibüs',ka:'მიკროავტობუსი'},'Mikrovan':{en:'Microvan',ru:'Микровэн',tr:'Microvan',ka:'მიკროვენი'},'Minivan':{en:'Minivan',ru:'Минивэн',tr:'Minivan',ka:'მინივენი'},'Moped':{en:'Moped',ru:'Мопед',tr:'Moped',ka:'მოპედი'},'Motosiklet':{en:'Motorcycle',ru:'Мотоцикл',tr:'Motosiklet',ka:'მოტოციკლი'},'Offroader / SUV (3 qapı)':{en:'SUV (3-door)',ru:'Внедорожник / SUV (3 дв.)',tr:'SUV (3 kapı)',ka:'SUV (3 კარი)'},'Offroader / SUV (5 qapı)':{en:'SUV (5-door)',ru:'Внедорожник / SUV (5 дв.)',tr:'SUV (5 kapı)',ka:'SUV (5 კარი)'},'Offroader / SUV (açıq)':{en:'Open SUV',ru:'Открытый внедорожник',tr:'Açık SUV',ka:'ღია SUV'},'Pikap (bir yarım kabin)':{en:'Pickup (extended cab)',ru:'Пикап (полуторная кабина)',tr:'Pickup (uzatılmış kabin)',ka:'პიკაპი (გრძელი კაბინა)'},'Pikap (ikiqat kabin)':{en:'Pickup (double cab)',ru:'Пикап (двойная кабина)',tr:'Pickup (çift kabin)',ka:'პიკაპი (ორმაგი კაბინა)'},'Pikap (tək kabin)':{en:'Pickup (single cab)',ru:'Пикап (одинарная кабина)',tr:'Pickup (tek kabin)',ka:'პიკაპი (ერთი კაბინა)'},'Qolfkar':{en:'Golf cart',ru:'Гольф-кар',tr:'Golf aracı',ka:'გოლფ-ქარი'},'Rodster':{en:'Roadster',ru:'Родстер',tr:'Roadster',ka:'როდსტერი'},'Sedan':{en:'Sedan',ru:'Седан',tr:'Sedan',ka:'სედანი'},'Skuter':{en:'Scooter',ru:'Скутер',tr:'Scooter',ka:'სკუტერი'},'Spidster':{en:'Speedster',ru:'Спидстер',tr:'Speedster',ka:'სპიდსტერი'},'SUV Kupe':{en:'SUV Coupe',ru:'SUV Купе',tr:'SUV Coupe',ka:'SUV კუპე'},'Tarqa':{en:'Targa',ru:'Тарга',tr:'Targa',ka:'ტარგა'},'Trisikl':{en:'Tricycle',ru:'Трицикл',tr:'Tricycle',ka:'ტრიციკლი'},'Universal (3 qapı)':{en:'Wagon (3-door)',ru:'Универсал (3 дв.)',tr:'Station wagon (3 kapı)',ka:'უნივერსალი (3 კარი)'},'Universal (5 qapı)':{en:'Wagon (5-door)',ru:'Универсал (5 дв.)',tr:'Station wagon (5 kapı)',ka:'უნივერსალი (5 კარი)'},'Van':{en:'Van',ru:'Вэн',tr:'Van',ka:'ვენი'},'Yük maşını':{en:'Truck',ru:'Грузовик',tr:'Kamyon',ka:'სატვირთო'},'Digər':{en:'Other',ru:'Другое',tr:'Diğer',ka:'სხვა'}
  };

  /* Complete UI fallback map. Values not explicitly translated never leak Azerbaijani
     into non-AZ locales: EN is the final safe fallback. */
  const FULL_TEXT = {
    'AVTOVİP SMART MARKETPLACE':{en:'AUTOVIP SMART MARKETPLACE',ru:'АВТОVIP УМНЫЙ АВТОРЫНОК',tr:'OTOVIP AKILLI OTOMOBİL PAZARI',ka:'ავტოVIP ჭკვიანი ავტობაზარი'},
    'Pulsuz ağıllı axtarış':{en:'Free smart search',ru:'Бесплатный умный поиск',tr:'Ücretsiz akıllı arama',ka:'უფასო ჭკვიანი ძებნა'},
    'Elan yerləşdir':{en:'Post ad',ru:'Подать объявление',tr:'İlan ver',ka:'განცხადების დამატება'},
    'Avtomobil tap':{en:'Find a car',ru:'Найти авто',tr:'Araç bul',ka:'ავტომობილის პოვნა'},
    'Markalar':{en:'Makes',ru:'Марки',tr:'Markalar',ka:'ბრენდები'},
    'Bir toxunuşla filtr':{en:'One-tap filters',ru:'Фильтр в одно касание',tr:'Tek dokunuşla filtre',ka:'ერთი შეხებით ფილტრი'},
    'Məkan':{en:'Location',ru:'Местоположение',tr:'Konum',ka:'მდებარეობა'},
    'Qiymət və il':{en:'Price and year',ru:'Цена и год',tr:'Fiyat ve yıl',ka:'ფასი და წელი'},
    'Texniki göstəricilər':{en:'Technical specifications',ru:'Технические характеристики',tr:'Teknik özellikler',ka:'ტექნიკური მახასიათებლები'},
    'Əlavə şərtlər':{en:'Additional conditions',ru:'Дополнительные условия',tr:'Ek koşullar',ka:'დამატებითი პირობები'},
    'Avtomobilin təchizatı':{en:'Vehicle equipment',ru:'Оснащение автомобиля',tr:'Araç donanımı',ka:'ავტომობილის აღჭურვილობა'},
    'Premium və VIP elanlar ön sırada':{en:'Premium and VIP ads come first',ru:'Premium и VIP объявления показываются первыми',tr:'Premium ve VIP ilanlar önce gösterilir',ka:'Premium და VIP განცხადებები პირველ რიგში ჩანს'},
    'Aktiv elan':{en:'Active ads',ru:'Активные объявления',tr:'Aktif ilanlar',ka:'აქტიური განცხადებები'},
    'Sevimli':{en:'Favorites',ru:'Избранное',tr:'Favoriler',ka:'რჩეულები'},
    'WhatsApp əlaqəsi':{en:'WhatsApp contact',ru:'Связь через WhatsApp',tr:'WhatsApp iletişimi',ka:'WhatsApp კავშირი'},
    'Ölkə':{en:'Country',ru:'Страна',tr:'Ülke',ka:'ქვეყანა'},'Ölkə *':{en:'Country *',ru:'Страна *',tr:'Ülke *',ka:'ქვეყანა *'},
    'Region / Ştat':{en:'Region / State',ru:'Регион / Штат',tr:'Bölge / Eyalet',ka:'რეგიონი / შტატი'},
    'Rayon / Bölgə':{en:'District / Area',ru:'Район / Округ',tr:'İlçe / Bölge',ka:'რაიონი / ზონა'},
    'Hamısı':{en:'All',ru:'Все',tr:'Tümü',ka:'ყველა'},'Seçin':{en:'Select',ru:'Выберите',tr:'Seçin',ka:'აირჩიეთ'},
    'Qiymət min':{en:'Min price',ru:'Цена от',tr:'Min fiyat',ka:'მინ. ფასი'},'Qiymət max':{en:'Max price',ru:'Цена до',tr:'Maks fiyat',ka:'მაქს. ფასი'},
    'İl min':{en:'Year from',ru:'Год от',tr:'Min yıl',ka:'წლიდან'},'İl max':{en:'Year to',ru:'Год до',tr:'Maks yıl',ka:'წლამდე'},
    'Vəziyyət':{en:'Condition',ru:'Состояние',tr:'Durum',ka:'მდგომარეობა'},'Yeni':{en:'New',ru:'Новый',tr:'Yeni',ka:'ახალი'},'Sürülmüş':{en:'Used',ru:'С пробегом',tr:'İkinci el',ka:'მეორადი'},
    'Yürüş min':{en:'Min mileage',ru:'Пробег от',tr:'Min km',ka:'მინ. გარბენი'},'Yürüş max':{en:'Max mileage',ru:'Пробег до',tr:'Maks km',ka:'მაქს. გარბენი'},
    'Mühərrik min, L':{en:'Engine min, L',ru:'Двигатель от, л',tr:'Motor min, L',ka:'ძრავი მინ, ლ'},'Mühərrik max, L':{en:'Engine max, L',ru:'Двигатель до, л',tr:'Motor maks, L',ka:'ძრავი მაქს, ლ'},
    'Güc min, a.g.':{en:'Min power, hp',ru:'Мощность от, л.с.',tr:'Min güç, bg',ka:'მინ. სიმძლავრე, ცხ.ძ.'},'Güc max, a.g.':{en:'Max power, hp',ru:'Мощность до, л.с.',tr:'Maks güç, bg',ka:'მაქს. სიმძლავრე, ცხ.ძ.'},
    'Oturacaq min':{en:'Min seats',ru:'Мест от',tr:'Min koltuk',ka:'მინ. ადგილი'},'Oturacaq max':{en:'Max seats',ru:'Мест до',tr:'Maks koltuk',ka:'მაქს. ადგილი'},'Sahib sayı max':{en:'Max owners',ru:'Владельцев до',tr:'Maks sahip',ka:'მაქს. მფლობელი'},
    'Sırala':{en:'Sort',ru:'Сортировка',tr:'Sırala',ka:'დალაგება'},'Ən yeni':{en:'Newest',ru:'Сначала новые',tr:'En yeni',ka:'უახლესი'},
    'Sıfırla':{en:'Reset',ru:'Сбросить',tr:'Sıfırla',ka:'გასუფთავება'},
    'Yürüş ↑':{en:'Mileage ↑',ru:'Пробег ↑',tr:'Kilometre ↑',ka:'გარბენი ↑'},
    'Avtomobil elanı yerləşdir':{en:'Post a vehicle ad',ru:'Разместить объявление',tr:'Araç ilanı ver',ka:'ავტომობილის განცხადების დამატება'},
    'Məlumatları dəqiq doldurun. Yeni elan əvvəlcə moderasiyaya göndərilir.':{en:'Enter accurate information. New ads are reviewed before publication.',ru:'Заполните данные точно. Новое объявление сначала проходит модерацию.',tr:'Bilgileri doğru doldurun. Yeni ilan önce moderasyona gönderilir.',ka:'შეავსეთ მონაცემები ზუსტად. ახალი განცხადება ჯერ მოდერაციას გაივლის.'},
    'Əsas məlumatlar':{en:'Main details',ru:'Основные данные',tr:'Temel bilgiler',ka:'ძირითადი ინფორმაცია'},
    'Marka *':{en:'Make *',ru:'Марка *',tr:'Marka *',ka:'ბრენდი *'},'Model *':{en:'Model *',ru:'Модель *',tr:'Model *',ka:'მოდელი *'},
    'Nəsil':{en:'Generation',ru:'Поколение',tr:'Nesil',ka:'თაობა'},'Komplektasiya':{en:'Trim',ru:'Комплектация',tr:'Donanım paketi',ka:'კომპლექტაცია'},
    'Buraxılış ili *':{en:'Year *',ru:'Год выпуска *',tr:'Model yılı *',ka:'გამოშვების წელი *'},'Qiymət *':{en:'Price *',ru:'Цена *',tr:'Fiyat *',ka:'ფასი *'},'Valyuta':{en:'Currency',ru:'Валюта',tr:'Para birimi',ka:'ვალუტა'},
    'Texniki məlumatlar':{en:'Technical details',ru:'Технические данные',tr:'Teknik bilgiler',ka:'ტექნიკური ინფორმაცია'},
    'Ban növü':{en:'Body type',ru:'Кузов',tr:'Kasa tipi',ka:'ძარის ტიპი'},'Rəng':{en:'Color',ru:'Цвет',tr:'Renk',ka:'ფერი'},'Yanacaq':{en:'Fuel',ru:'Топливо',tr:'Yakıt',ka:'საწვავი'},'Sürətlər qutusu':{en:'Transmission',ru:'Коробка передач',tr:'Şanzıman',ka:'გადაცემათა კოლოფი'},'Ötürücü':{en:'Drive',ru:'Привод',tr:'Çekiş',ka:'ამძრავი'},
    'Mühərrik, L':{en:'Engine, L',ru:'Двигатель, л',tr:'Motor, L',ka:'ძრავი, ლ'},'Güc, a.g.':{en:'Power, hp',ru:'Мощность, л.с.',tr:'Güç, bg',ka:'სიმძლავრე, ცხ.ძ.'},'Yürüş, km *':{en:'Mileage, km *',ru:'Пробег, км *',tr:'Kilometre, km *',ka:'გარბენი, კმ *'},
    'Oturacaq sayı':{en:'Seats',ru:'Количество мест',tr:'Koltuk sayısı',ka:'ადგილების რაოდენობა'},'Sahib sayı':{en:'Owners',ru:'Количество владельцев',tr:'Sahip sayısı',ka:'მფლობელების რაოდენობა'},'Bazar mənşəyi':{en:'Market origin',ru:'Рынок происхождения',tr:'Pazar menşei',ka:'ბაზრის წარმომავლობა'},
    'Yeni avtomobil':{en:'New vehicle',ru:'Новый автомобиль',tr:'Sıfır araç',ka:'ახალი ავტომობილი'},'Kredit mümkündür':{en:'Credit available',ru:'Возможен кредит',tr:'Kredi mümkün',ka:'კრედიტი შესაძლებელია'},'Barter mümkündür':{en:'Trade-in available',ru:'Возможен обмен',tr:'Takas mümkün',ka:'გაცვლა შესაძლებელია'},'Vuruğu var':{en:'Has accident damage',ru:'Есть повреждения',tr:'Hasar kaydı var',ka:'აქვს ავარიული დაზიანება'},'Rənglənib':{en:'Repainted',ru:'Красился',tr:'Boyalı',ka:'შეღებილია'},
    'Təchizat':{en:'Equipment',ru:'Оснащение',tr:'Donanım',ka:'აღჭურვილობა'},'Şəkillər':{en:'Photos',ru:'Фотографии',tr:'Fotoğraflar',ka:'ფოტოები'},
    'Minimum 3, maksimum 15 şəkil. Hər fayl maksimum 10 MB.':{en:'Minimum 3, maximum 15 photos. Images are optimized before upload.',ru:'Минимум 3, максимум 15 фото. Изображения оптимизируются перед загрузкой.',tr:'En az 3, en fazla 15 fotoğraf. Görseller yüklemeden önce optimize edilir.',ka:'მინიმუმ 3, მაქსიმუმ 15 ფოტო. სურათები ატვირთვამდე ოპტიმიზდება.'},
    'Satıcı və açıqlama':{en:'Seller and description',ru:'Продавец и описание',tr:'Satıcı ve açıklama',ka:'გამყიდველი და აღწერა'},'Telefon *':{en:'Phone *',ru:'Телефон *',tr:'Telefon *',ka:'ტელეფონი *'},'WhatsApp nömrəsi':{en:'WhatsApp number',ru:'Номер WhatsApp',tr:'WhatsApp numarası',ka:'WhatsApp ნომერი'},'Açıqlama':{en:'Description',ru:'Описание',tr:'Açıklama',ka:'აღწერა'},'Moderasiyaya göndər':{en:'Send for review',ru:'Отправить на модерацию',tr:'Moderasyona gönder',ka:'მოდერაციაზე გაგზავნა'},
    'Avtomobilin vəziyyəti, servis tarixi və digər vacib məlumatları yazın.':{en:'Describe the vehicle condition, service history and other important information.',ru:'Опишите состояние автомобиля, историю обслуживания и другие важные сведения.',tr:'Aracın durumunu, servis geçmişini ve diğer önemli bilgileri yazın.',ka:'აღწერეთ ავტომობილის მდგომარეობა, სერვისის ისტორია და სხვა მნიშვნელოვანი ინფორმაცია.'},
    'Mesajlar':{en:'Messages',ru:'Сообщения',tr:'Mesajlar',ka:'შეტყობინებები'},'Satıcı və alıcı arasında real-time yazışma.':{en:'Real-time chat between buyer and seller.',ru:'Чат в реальном времени между покупателем и продавцом.',tr:'Alıcı ve satıcı arasında gerçek zamanlı mesajlaşma.',ka:'რეალურ დროში ჩატი მყიდველსა და გამყიდველს შორის.'},'Söhbət':{en:'Conversation',ru:'Диалог',tr:'Sohbet',ka:'საუბარი'},'AvtoVİP mesajlaşma':{en:'AutoVIP messaging',ru:'Чат АвтоVIP',tr:'OtoVIP mesajlaşma',ka:'ავტოVIP მიმოწერა'},
    'Sevimlilər':{en:'Favorites',ru:'Избранное',tr:'Favoriler',ka:'რჩეულები'},'Bəyəndiyiniz avtomobillər və qiymət endirimi bildirişləri.':{en:'Cars you liked and price-drop alerts.',ru:'Избранные авто и уведомления о снижении цены.',tr:'Beğendiğiniz araçlar ve fiyat düşüş bildirimleri.',ka:'რჩეული ავტომობილები და ფასის შემცირების შეტყობინებები.'},
    'Müqayisə':{en:'Compare',ru:'Сравнить',tr:'Karşılaştır',ka:'შედარება'},'Avtomobilləri müqayisə et':{en:'Compare vehicles',ru:'Сравнить автомобили',tr:'Araçları karşılaştır',ka:'ავტომობილების შედარება'},'Maksimum 4 elanı yan-yana müqayisə edin.':{en:'Compare up to 4 ads side by side.',ru:'Сравнивайте до 4 объявлений рядом.',tr:'En fazla 4 ilanı yan yana karşılaştırın.',ka:'შეადარეთ მაქსიმუმ 4 განცხადება გვერდიგვერდ.'},'Elan seç':{en:'Select ad',ru:'Выберите объявление',tr:'İlan seç',ka:'აირჩიეთ განცხადება'},
    'Profil məlumatları':{en:'Profile details',ru:'Данные профиля',tr:'Profil bilgileri',ka:'პროფილის მონაცემები'},'Mənim elanlarım':{en:'My ads',ru:'Мои объявления',tr:'İlanlarım',ka:'ჩემი განცხადებები'},'Ödəniş sorğuları':{en:'Payment requests',ru:'Заявки на оплату',tr:'Ödeme talepleri',ka:'გადახდის მოთხოვნები'},'Bildirişlər':{en:'Notifications',ru:'Уведомления',tr:'Bildirimler',ka:'შეტყობინებები'},'Etibar':{en:'Trust',ru:'Доверие',tr:'Güven',ka:'ნდობა'},
    'Ad':{en:'Name',ru:'Имя',tr:'Ad',ka:'სახელი'},'Soyad':{en:'Surname',ru:'Фамилия',tr:'Soyad',ka:'გვარი'},'Telefon':{en:'Phone',ru:'Телефон',tr:'Telefon',ka:'ტელეფონი'},'Ünvan':{en:'Address',ru:'Адрес',tr:'Adres',ka:'მისამართი'},'Haqqında':{en:'About',ru:'О себе',tr:'Hakkında',ka:'შესახებ'},'Yadda saxla':{en:'Save',ru:'Сохранить',tr:'Kaydet',ka:'შენახვა'},'Çıxış':{en:'Sign out',ru:'Выйти',tr:'Çıkış',ka:'გასვლა'},'Yeni elan':{en:'New ad',ru:'Новое объявление',tr:'Yeni ilan',ka:'ახალი განცხადება'},
    'AvtoVİP hesabı':{en:'AutoVIP account',ru:'Аккаунт АвтоVIP',tr:'OtoVIP hesabı',ka:'ავტოVIP ანგარიში'},'Elan, mesaj, sevimlilər və premium xidmətlər bir hesabda.':{en:'Ads, messages, favorites and premium services in one account.',ru:'Объявления, сообщения, избранное и премиум-услуги в одном аккаунте.',tr:'İlanlar, mesajlar, favoriler ve premium hizmetler tek hesapta.',ka:'განცხადებები, შეტყობინებები, რჩეულები და პრემიუმ სერვისები ერთ ანგარიშში.'},
    'Giriş':{en:'Sign in',ru:'Вход',tr:'Giriş',ka:'შესვლა'},'Qeydiyyat':{en:'Register',ru:'Регистрация',tr:'Kayıt',ka:'რეგისტრაცია'},'Email':{en:'Email',ru:'Email',tr:'E-posta',ka:'ელფოსტა'},'Şifrə':{en:'Password',ru:'Пароль',tr:'Şifre',ka:'პაროლი'},'Şifrə təkrar':{en:'Repeat password',ru:'Повторите пароль',tr:'Şifre tekrar',ka:'გაიმეორეთ პაროლი'},'Giriş et':{en:'Sign in',ru:'Войти',tr:'Giriş yap',ka:'შესვლა'},'Hesab yarat':{en:'Create account',ru:'Создать аккаунт',tr:'Hesap oluştur',ka:'ანგარიშის შექმნა'},'Şifrəni unutmusunuz?':{en:'Forgot password?',ru:'Забыли пароль?',tr:'Şifrenizi mi unuttunuz?',ka:'დაგავიწყდათ პაროლი?'},'Əsas səhifə':{en:'Home',ru:'Главная',tr:'Ana sayfa',ka:'მთავარი'},
    'Şifrəni yenilə':{en:'Reset password',ru:'Сбросить пароль',tr:'Şifreyi yenile',ka:'პაროლის აღდგენა'},'Hesabınıza yenidən giriş üçün təhlükəsiz link alın.':{en:'Get a secure link to regain access to your account.',ru:'Получите безопасную ссылку для восстановления доступа.',tr:'Hesabınıza yeniden erişmek için güvenli bağlantı alın.',ka:'მიიღეთ უსაფრთხო ბმული ანგარიშზე წვდომის აღსადგენად.'},'Link göndər':{en:'Send link',ru:'Отправить ссылку',tr:'Bağlantı gönder',ka:'ბმულის გაგზავნა'},'Yeni şifrə':{en:'New password',ru:'Новый пароль',tr:'Yeni şifre',ka:'ახალი პაროლი'},'Təkrar':{en:'Repeat',ru:'Повторите',tr:'Tekrar',ka:'გაიმეორეთ'},'Şifrəni dəyiş':{en:'Change password',ru:'Изменить пароль',tr:'Şifreyi değiştir',ka:'პაროლის შეცვლა'},'Giriş səhifəsinə qayıt':{en:'Back to sign in',ru:'Вернуться ко входу',tr:'Girişe dön',ka:'შესვლაზე დაბრუნება'},
    '24 saatlıq Avto Hekayə':{en:'24-hour Auto Story',ru:'Авто-история на 24 часа',tr:'24 saatlik Oto Hikaye',ka:'24-საათიანი ავტო ისტორია'},'Instagram/WhatsApp status tipli premium vitrin. Admin ödənişi təsdiqləyəndən sonra 24 saat aktiv qalır.':{en:'Premium Instagram/WhatsApp-style showcase. It stays active for 24 hours after payment approval.',ru:'Премиум-витрина в стиле Instagram/WhatsApp. Активна 24 часа после подтверждения оплаты.',tr:'Instagram/WhatsApp tarzı premium vitrin. Ödeme onayından sonra 24 saat aktif kalır.',ka:'Instagram/WhatsApp-ის სტილის პრემიუმ ვიტრინა. გადახდის დადასტურების შემდეგ 24 საათი აქტიურია.'},
    'Şəkil və ya video *':{en:'Photo or video *',ru:'Фото или видео *',tr:'Fotoğraf veya video *',ka:'ფოტო ან ვიდეო *'},'Elana bağla':{en:'Link to an ad',ru:'Привязать к объявлению',tr:'İlana bağla',ka:'განცხადებასთან დაკავშირება'},'Elana bağlama':{en:'Do not link',ru:'Не привязывать',tr:'İlana bağlama',ka:'არ დააკავშირო'},'Qısa mətn':{en:'Short text',ru:'Короткий текст',tr:'Kısa metin',ka:'მოკლე ტექსტი'},'Aktivləşdirmə':{en:'Activation',ru:'Активация',tr:'Aktivasyon',ka:'აქტივაცია'},'İlk mərhələdə manual təsdiq':{en:'Manual approval at the first stage',ru:'На первом этапе ручное подтверждение',tr:'İlk aşamada manuel onay',ka:'პირველ ეტაპზე ხელით დადასტურება'},'Ödəniş üsulu':{en:'Payment method',ru:'Способ оплаты',tr:'Ödeme yöntemi',ka:'გადახდის მეთოდი'},'Kartdan karta':{en:'Card transfer',ru:'Перевод на карту',tr:'Karta havale',ka:'ბარათზე გადარიცხვა'},'Digər/manual':{en:'Other/manual',ru:'Другое/вручную',tr:'Diğer/manuel',ka:'სხვა/ხელით'},'Ödəniş qeydi':{en:'Payment note',ru:'Комментарий к оплате',tr:'Ödeme notu',ka:'გადახდის შენიშვნა'},'Hekayə sorğusu göndər':{en:'Submit story request',ru:'Отправить заявку на историю',tr:'Hikaye talebi gönder',ka:'ისტორიის მოთხოვნის გაგზავნა'},
    'Yüklənir...':{en:'Loading...',ru:'Загрузка...',tr:'Yükleniyor...',ka:'იტვირთება...'},'Elan yüklənir...':{en:'Loading ad...',ru:'Объявление загружается...',tr:'İlan yükleniyor...',ka:'განცხადება იტვირთება...'},
    'Mesaj yoxdur.':{en:'No messages.',ru:'Сообщений нет.',tr:'Mesaj yok.',ka:'შეტყობინებები არ არის.'},'İstifadəçi':{en:'User',ru:'Пользователь',tr:'Kullanıcı',ka:'მომხმარებელი'},
    'Satıldı':{en:'Sold',ru:'Продано',tr:'Satıldı',ka:'გაყიდულია'},'Sil':{en:'Delete',ru:'Удалить',tr:'Sil',ka:'წაშლა'},'baxış':{en:'views',ru:'просмотров',tr:'görüntüleme',ka:'ნახვა'},
    'Tətbiqi yüklə':{en:'Install app',ru:'Установить приложение',tr:'Uygulamayı yükle',ka:'აპის დაყენება'},'AvtoVİP-ı telefona tətbiq kimi əlavə edin.':{en:'Add AutoVIP to your phone as an app.',ru:'Добавьте АвтоVIP на телефон как приложение.',tr:'OtoVIP uygulamasını telefonunuza ekleyin.',ka:'დაამატეთ ავტოVIP ტელეფონში აპის სახით.'},
    'Premium avtomobil bazarı':{en:'Premium car marketplace',ru:'Премиум авторынок',tr:'Premium otomobil pazarı',ka:'პრემიუმ ავტომობილების ბაზარი'},
    'Avtomobil bazarının ağıllı tərəfi.':{en:'The smarter side of the car market.',ru:'Умная сторона авторынка.',tr:'Otomobil pazarının akıllı tarafı.',ka:'ავტობაზრის ჭკვიანი მხარე.'},
    'Al, sat, müqayisə et, qiyməti analiz et və satıcı ilə birbaşa əlaqə saxla.':{en:'Buy, sell, compare, analyze prices and contact the seller directly.',ru:'Покупайте, продавайте, сравнивайте, анализируйте цены и связывайтесь с продавцом напрямую.',tr:'Al, sat, karşılaştır, fiyatı analiz et ve satıcıyla doğrudan iletişime geç.',ka:'იყიდეთ, გაყიდეთ, შეადარეთ, გააანალიზეთ ფასი და პირდაპირ დაუკავშირდით გამყიდველს.'}
  };


  Object.assign(FULL_TEXT, {
    'Sevimlilərdən çıxarıldı':{en:'Removed from favorites.',ru:'Удалено из избранного.',tr:'Favorilerden çıkarıldı.',ka:'რჩეულებიდან წაიშალა.'},
    'Sevimlilərə əlavə edildi':{en:'Added to favorites.',ru:'Добавлено в избранное.',tr:'Favorilere eklendi.',ka:'რჩეულებში დაემატა.'},
    'Maksimum 4 avtomobil müqayisə oluna bilər.':{en:'You can compare up to 4 vehicles.',ru:'Можно сравнить максимум 4 автомобиля.',tr:'En fazla 4 araç karşılaştırılabilir.',ka:'შესაძლებელია მაქსიმუმ 4 ავტომობილის შედარება.'},
    'Müqayisəyə əlavə edildi':{en:'Added to comparison.',ru:'Добавлено к сравнению.',tr:'Karşılaştırmaya eklendi.',ka:'შედარებაში დაემატა.'},
    'Müqayisədən çıxarıldı':{en:'Removed from comparison.',ru:'Удалено из сравнения.',tr:'Karşılaştırmadan çıkarıldı.',ka:'შედარებიდან წაიშალა.'},
    'Bu brauzerdə səsli axtarış dəstəklənmir':{en:'Voice search is not supported in this browser.',ru:'Голосовой поиск не поддерживается в этом браузере.',tr:'Bu tarayıcı sesli aramayı desteklemiyor.',ka:'ამ ბრაუზერში ხმოვანი ძებნა არ არის მხარდაჭერილი.'},
    'Səs tanınmadı. Yenidən cəhd edin.':{en:'Voice was not recognized. Try again.',ru:'Речь не распознана. Попробуйте снова.',tr:'Ses algılanamadı. Tekrar deneyin.',ka:'ხმა ვერ ამოიცნო. სცადეთ თავიდან.'},
    'Elan tapılmadı.':{en:'Ad not found.',ru:'Объявление не найдено.',tr:'İlan bulunamadı.',ka:'განცხადება ვერ მოიძებნა.'},
    'Satıcı':{en:'Seller',ru:'Продавец',tr:'Satıcı',ka:'გამყიდველი'},
    'Şəxsi satıcı':{en:'Private seller',ru:'Частный продавец',tr:'Bireysel satıcı',ka:'კერძო გამყიდველი'},
    'Açıqlama əlavə edilməyib.':{en:'No description added.',ru:'Описание не добавлено.',tr:'Açıklama eklenmemiş.',ka:'აღწერა არ არის დამატებული.'},
    'Mesaj yaz':{en:'Message',ru:'Написать',tr:'Mesaj yaz',ka:'მიწერა'},
    'Təhlükəsiz alış':{en:'Safe purchase',ru:'Безопасная покупка',tr:'Güvenli alışveriş',ka:'უსაფრთხო შეძენა'},
    'Link kopyalandı.':{en:'Link copied.',ru:'Ссылка скопирована.',tr:'Bağlantı kopyalandı.',ka:'ბმული დაკოპირდა.'},
    'Şəkillər yüklənir...':{en:'Uploading photos...',ru:'Загрузка фотографий...',tr:'Fotoğraflar yükleniyor...',ka:'ფოტოები იტვირთება...'},
    'Minimum 3 avtomobil şəkli əlavə edin.':{en:'Add at least 3 vehicle photos.',ru:'Добавьте минимум 3 фотографии автомобиля.',tr:'En az 3 araç fotoğrafı ekleyin.',ka:'დაამატეთ ავტომობილის მინიმუმ 3 ფოტო.'},
    'Vacib sahələri doldurun.':{en:'Fill in the required fields.',ru:'Заполните обязательные поля.',tr:'Zorunlu alanları doldurun.',ka:'შეავსეთ სავალდებულო ველები.'},
    'Bu ölkə/valyuta bazarda aktiv deyil.':{en:'This country/currency is not available in the marketplace.',ru:'Эта страна/валюта недоступна на площадке.',tr:'Bu ülke/para birimi pazarda kullanılamıyor.',ka:'ეს ქვეყანა/ვალუტა ბაზარზე ხელმისაწვდომი არ არის.'},
    'Elan moderasiyaya göndərildi.':{en:'Ad sent for review.',ru:'Объявление отправлено на модерацию.',tr:'İlan moderasyona gönderildi.',ka:'განცხადება გაიგზავნა მოდერაციაზე.'},
    'Elan yaradıldı və admin yoxlamasına göndərildi.':{en:'Ad created and sent for admin review.',ru:'Объявление создано и отправлено администратору на проверку.',tr:'İlan oluşturuldu ve yönetici incelemesine gönderildi.',ka:'განცხადება შეიქმნა და ადმინისტრატორის შემოწმებაზე გაიგზავნა.'},
    'Şəkil və ya video seçin.':{en:'Select a photo or video.',ru:'Выберите фото или видео.',tr:'Fotoğraf veya video seçin.',ka:'აირჩიეთ ფოტო ან ვიდეო.'},
    'Video maksimum 30 MB ola bilər.':{en:'Video can be up to 30 MB.',ru:'Размер видео — не более 30 МБ.',tr:'Video en fazla 30 MB olabilir.',ka:'ვიდეო მაქსიმუმ 30 მბ შეიძლება იყოს.'},
    'Hekayə yaradıldı. Ödəniş sorğusu admin təsdiqini gözləyir.':{en:'Story created. The payment request is awaiting admin approval.',ru:'История создана. Заявка на оплату ожидает подтверждения администратора.',tr:'Hikaye oluşturuldu. Ödeme talebi yönetici onayını bekliyor.',ka:'ისტორია შეიქმნა. გადახდის მოთხოვნა ადმინისტრატორის დადასტურებას ელოდება.'},
    'Admin ödənişi təsdiqlədikdən sonra hekayə 24 saatlıq aktiv olacaq.':{en:'The story will be active for 24 hours after admin approves the payment.',ru:'История будет активна 24 часа после подтверждения оплаты администратором.',tr:'Yönetici ödemeyi onayladıktan sonra hikaye 24 saat aktif olacaktır.',ka:'ადმინისტრატორის მიერ გადახდის დადასტურების შემდეგ ისტორია 24 საათით გააქტიურდება.'},
    'Profil yeniləndi.':{en:'Profile updated.',ru:'Профиль обновлён.',tr:'Profil güncellendi.',ka:'პროფილი განახლდა.'},
    'Profil şəkli yeniləndi.':{en:'Profile photo updated.',ru:'Фото профиля обновлено.',tr:'Profil fotoğrafı güncellendi.',ka:'პროფილის ფოტო განახლდა.'},
    'Hələ elan yerləşdirməmisiniz.':{en:'You have not posted any ads yet.',ru:'У вас пока нет объявлений.',tr:'Henüz ilan vermediniz.',ka:'ჯერ განცხადება არ დაგიმატებიათ.'},
    'Giriş edilir...':{en:'Signing in...',ru:'Выполняется вход...',tr:'Giriş yapılıyor...',ka:'მიმდინარეობს შესვლა...'},
    'Şifrələr eyni deyil.':{en:'Passwords do not match.',ru:'Пароли не совпадают.',tr:'Şifreler eşleşmiyor.',ka:'პაროლები არ ემთხვევა.'},
    'Qeydiyyat tamamlandı.':{en:'Registration completed.',ru:'Регистрация завершена.',tr:'Kayıt tamamlandı.',ka:'რეგისტრაცია დასრულდა.'},
    'Email ünvanınıza təsdiq linki göndərildi.':{en:'A confirmation link was sent to your email.',ru:'Ссылка для подтверждения отправлена на ваш email.',tr:'E-posta adresinize doğrulama bağlantısı gönderildi.',ka:'დადასტურების ბმული გაიგზავნა თქვენს ელფოსტაზე.'},
    'Bəli':{en:'Yes',ru:'Да',tr:'Evet',ka:'დიახ'},'Xeyr':{en:'No',ru:'Нет',tr:'Hayır',ka:'არა'},
    'Gözlənilməz xəta baş verdi.':{en:'An unexpected error occurred.',ru:'Произошла непредвиденная ошибка.',tr:'Beklenmeyen bir hata oluştu.',ka:'მოხდა მოულოდნელი შეცდომა.'},
    'Axtarış':{en:'Search',ru:'Поиск',tr:'Arama',ka:'ძებნა'},
    'Axtar':{en:'Search',ru:'Найти',tr:'Ara',ka:'ძებნა'},
    'Ətraflı filtr':{en:'Advanced filters',ru:'Расширенные фильтры',tr:'Gelişmiş filtreler',ka:'გაფართოებული ფილტრები'},
    'Filtri aç':{en:'Open filters',ru:'Открыть фильтры',tr:'Filtreleri aç',ka:'ფილტრების გახსნა'},
    'Filtri bağla':{en:'Close filters',ru:'Закрыть фильтры',tr:'Filtreleri kapat',ka:'ფილტრების დახურვა'}
  });


  Object.assign(FULL_TEXT, {
    'Avtomobilləri müqayisə et':{en:'Compare vehicles',ru:'Сравнить автомобили',tr:'Araçları karşılaştır',ka:'ავტომობილების შედარება'},
    'Maksimum 4 elanı yan-yana müqayisə edin.':{en:'Compare up to 4 ads side by side.',ru:'Сравнивайте до 4 объявлений рядом.',tr:'En fazla 4 ilanı yan yana karşılaştırın.',ka:'შეადარეთ მაქსიმუმ 4 განცხადება გვერდიგვერდ.'},
    'Elan seç':{en:'Choose ad',ru:'Выберите объявление',tr:'İlan seç',ka:'აირჩიეთ განცხადება'},
    'Müqayisə üçün elan kartlarında “Müqayisə” düyməsinə toxunun.':{en:'Tap “Compare” on listing cards to add vehicles.',ru:'Нажмите «Сравнить» на карточках объявлений.',tr:'Araç eklemek için ilan kartındaki “Karşılaştır” düğmesine dokunun.',ka:'ავტომობილის დასამატებლად განცხადების ბარათზე დააჭირეთ „შედარებას“.'},
    'Mesaj yoxdur.':{en:'No messages.',ru:'Сообщений нет.',tr:'Mesaj yok.',ka:'შეტყობინებები არ არის.'},
    'Mesaj yazın...':{en:'Write a message...',ru:'Напишите сообщение...',tr:'Mesaj yazın...',ka:'დაწერეთ შეტყობინება...'},
    'Söhbət':{en:'Conversation',ru:'Диалог',tr:'Sohbet',ka:'საუბარი'},
    'AvtoVİP mesajlaşma':{en:'AutoVIP messaging',ru:'Чат AutoVIP',tr:'OtoVIP mesajlaşma',ka:'ავტოVIP მიმოწერა'},
    'Şəhər':{en:'City',ru:'Город',tr:'Şehir',ka:'ქალაქი'},'Ünvan':{en:'Address',ru:'Адрес',tr:'Adres',ka:'მისამართი'},
    'Haqqında':{en:'About',ru:'О себе',tr:'Hakkında',ka:'შესახებ'},'Etibar':{en:'Trust',ru:'Доверие',tr:'Güven',ka:'ნდობა'},
    'Profil məlumatları':{en:'Profile information',ru:'Данные профиля',tr:'Profil bilgileri',ka:'პროფილის ინფორმაცია'},
    'Mənim elanlarım':{en:'My listings',ru:'Мои объявления',tr:'İlanlarım',ka:'ჩემი განცხადებები'},
    'Yeni elan':{en:'New ad',ru:'Новое объявление',tr:'Yeni ilan',ka:'ახალი განცხადება'},
    'Ödəniş sorğuları':{en:'Payment requests',ru:'Запросы на оплату',tr:'Ödeme talepleri',ka:'გადახდის მოთხოვნები'},
    'Bildirişlər':{en:'Notifications',ru:'Уведомления',tr:'Bildirimler',ka:'შეტყობინებები'},
    'Ödəniş sorğusu yoxdur.':{en:'No payment requests.',ru:'Нет запросов на оплату.',tr:'Ödeme talebi yok.',ka:'გადახდის მოთხოვნა არ არის.'},
    'Yeni bildiriş yoxdur.':{en:'No new notifications.',ru:'Новых уведомлений нет.',tr:'Yeni bildirim yok.',ka:'ახალი შეტყობინება არ არის.'},
    'Telefon':{en:'Phone',ru:'Телефон',tr:'Telefon',ka:'ტელეფონი'},'Soyad':{en:'Surname',ru:'Фамилия',tr:'Soyad',ka:'გვარი'},'Ad':{en:'Name',ru:'Имя',tr:'Ad',ka:'სახელი'},
    'Avtomobil elanı yerləşdir':{en:'Post a vehicle ad',ru:'Подать объявление об автомобиле',tr:'Araç ilanı ver',ka:'ავტომობილის განცხადების დამატება'},
    'Məlumatları dəqiq doldurun. Yeni elan əvvəlcə moderasiyaya göndərilir.':{en:'Fill in the details accurately. New ads are reviewed before publication.',ru:'Заполните данные точно. Новое объявление сначала отправляется на модерацию.',tr:'Bilgileri doğru doldurun. Yeni ilan önce moderasyona gönderilir.',ka:'შეავსეთ ინფორმაცია ზუსტად. ახალი განცხადება ჯერ მოდერაციაზე იგზავნება.'},
    'Əsas məlumatlar':{en:'Main information',ru:'Основная информация',tr:'Temel bilgiler',ka:'ძირითადი ინფორმაცია'},
    'Texniki məlumatlar':{en:'Technical information',ru:'Технические данные',tr:'Teknik bilgiler',ka:'ტექნიკური ინფორმაცია'},
    'Təchizat':{en:'Equipment',ru:'Оснащение',tr:'Donanım',ka:'აღჭურვილობა'},'Şəkillər':{en:'Photos',ru:'Фотографии',tr:'Fotoğraflar',ka:'ფოტოები'},
    'Satıcı və açıqlama':{en:'Seller and description',ru:'Продавец и описание',tr:'Satıcı ve açıklama',ka:'გამყიდველი და აღწერა'},
    'Açıqlama':{en:'Description',ru:'Описание',tr:'Açıklama',ka:'აღწერა'},'Moderasiyaya göndər':{en:'Send for review',ru:'Отправить на модерацию',tr:'Moderasyona gönder',ka:'მოდერაციაზე გაგზავნა'},
    'Ban növü':{en:'Body type',ru:'Тип кузова',tr:'Kasa tipi',ka:'ძარის ტიპი'},'Rəng':{en:'Color',ru:'Цвет',tr:'Renk',ka:'ფერი'},
    'Yanacaq':{en:'Fuel',ru:'Топливо',tr:'Yakıt',ka:'საწვავი'},'Sürətlər qutusu':{en:'Transmission',ru:'Коробка передач',tr:'Şanzıman',ka:'გადაცემათა კოლოფი'},
    'Ötürücü':{en:'Drivetrain',ru:'Привод',tr:'Çekiş',ka:'ამძრავი'},'Mühərrik, L':{en:'Engine, L',ru:'Двигатель, л',tr:'Motor, L',ka:'ძრავა, ლ'},
    'Güc, a.g.':{en:'Power, hp',ru:'Мощность, л.с.',tr:'Güç, hp',ka:'სიმძლავრე, ცხ.ძ.'},'Yürüş, km *':{en:'Mileage, km *',ru:'Пробег, км *',tr:'Kilometre, km *',ka:'გარბენი, კმ *'},
    'Oturacaq sayı':{en:'Seats',ru:'Количество мест',tr:'Koltuk sayısı',ka:'ადგილების რაოდენობა'},'Sahib sayı':{en:'Owners',ru:'Количество владельцев',tr:'Sahip sayısı',ka:'მფლობელების რაოდენობა'},
    'Yeni avtomobil':{en:'New vehicle',ru:'Новый автомобиль',tr:'Yeni araç',ka:'ახალი ავტომობილი'},'Kredit mümkündür':{en:'Credit available',ru:'Возможен кредит',tr:'Kredi mümkün',ka:'კრედიტი შესაძლებელია'},
    'Barter mümkündür':{en:'Trade-in available',ru:'Возможен обмен',tr:'Takas mümkün',ka:'გაცვლა შესაძლებელია'},'Vuruğu var':{en:'Has accident damage',ru:'Есть повреждения',tr:'Hasar kaydı var',ka:'აქვს დაზიანება'},
    'Rənglənib':{en:'Repainted',ru:'Красился',tr:'Boyalı',ka:'შეღებილია'},'Nəsil':{en:'Generation',ru:'Поколение',tr:'Nesil',ka:'თაობა'},'Komplektasiya':{en:'Trim',ru:'Комплектация',tr:'Donanım paketi',ka:'კომპლექტაცია'},
    'Bazar mənşəyi':{en:'Market origin',ru:'Рынок происхождения',tr:'Pazar menşei',ka:'ბაზრის წარმოშობა'},
    'Qiymət min':{en:'Min price',ru:'Цена от',tr:'Min fiyat',ka:'მინ. ფასი'},'Qiymət max':{en:'Max price',ru:'Цена до',tr:'Maks fiyat',ka:'მაქს. ფასი'},
    'İl min':{en:'Min year',ru:'Год от',tr:'Min yıl',ka:'მინ. წელი'},'İl max':{en:'Max year',ru:'Год до',tr:'Maks yıl',ka:'მაქს. წელი'},
    'Yürüş max':{en:'Max mileage',ru:'Пробег до',tr:'Maks kilometre',ka:'მაქს. გარბენი'},'Sırala':{en:'Sort',ru:'Сортировка',tr:'Sırala',ka:'დალაგება'},
    'Ən yeni':{en:'Newest',ru:'Сначала новые',tr:'En yeni',ka:'უახლესი'},'Qiymət ↑':{en:'Price ↑',ru:'Цена ↑',tr:'Fiyat ↑',ka:'ფასი ↑'},'Qiymət ↓':{en:'Price ↓',ru:'Цена ↓',tr:'Fiyat ↓',ka:'ფასი ↓'},'İl ↓':{en:'Year ↓',ru:'Год ↓',tr:'Yıl ↓',ka:'წელი ↓'},'Sıfırla':{en:'Reset',ru:'Сбросить',tr:'Sıfırla',ka:'გასუფთავება'},
    'Hekayə yerləşdir':{en:'Post story',ru:'Добавить историю',tr:'Hikaye ekle',ka:'ისტორიის დამატება'},'Avto Hekayələr':{en:'Auto Stories',ru:'Авто Истории',tr:'Oto Hikayeler',ka:'ავტო ისტორიები'},
    '24 saatlıq premium vitrin':{en:'24-hour premium showcase',ru:'Премиум-витрина на 24 часа',tr:'24 saatlik premium vitrin',ka:'24 საათიანი პრემიუმ ვიტრინა'},
    'Model':{en:'Model',ru:'Модель',tr:'Model',ka:'მოდელი'},'Marka':{en:'Make',ru:'Марка',tr:'Marka',ka:'ბრენდი'},
    'Məs: 25 minə qədər ailə üçün avtomat SUV...':{en:'E.g. automatic family SUV under 25k...',ru:'Напр.: семейный SUV автомат до 25 тыс....',tr:'Örn: 25 bin altı aile için otomatik SUV...',ka:'მაგ.: ოჯახისთვის ავტომატური SUV 25 ათასამდე...'},
    'Rayon, county, district...':{en:'District, county, area...',ru:'Район, округ, область...',tr:'İlçe, bölge...',ka:'რაიონი, ოლქი...'},
    'Rəsmi diler / ABŞ / Koreya...':{en:'Official dealer / USA / Korea...',ru:'Официальный дилер / США / Корея...',tr:'Yetkili bayi / ABD / Kore...',ka:'ოფიციალური დილერი / აშშ / კორეა...'},
    'Müqayisə üçün elan kartlarında “Müqayisə” düyməsinə toxunun.':{en:'Tap “Compare” on listing cards to add cars here.',ru:'Нажмите «Сравнить» на карточке объявления, чтобы добавить авто.',tr:'Araç eklemek için ilan kartındaki “Karşılaştır” düğmesine dokunun.',ka:'ავტომობილის დასამატებლად განცხადების ბარათზე დააჭირეთ „შედარებას“.'},
    'Mesaj yoxdur.':{en:'No messages yet.',ru:'Сообщений пока нет.',tr:'Henüz mesaj yok.',ka:'შეტყობინებები ჯერ არ არის.'},
    'Mesaj yazın...':{en:'Write a message...',ru:'Напишите сообщение...',tr:'Mesaj yazın...',ka:'დაწერეთ შეტყობინება...'},
    'Hələ elan yerləşdirməmisiniz.':{en:'You have not posted any listings yet.',ru:'Вы ещё не разместили объявлений.',tr:'Henüz ilan vermediniz.',ka:'თქვენ ჯერ განცხადება არ დაგიმატებიათ.'},
    'Ödəniş sorğusu yoxdur.':{en:'No payment requests.',ru:'Запросов на оплату нет.',tr:'Ödeme talebi yok.',ka:'გადახდის მოთხოვნები არ არის.'},
    'Yeni bildiriş yoxdur.':{en:'No new notifications.',ru:'Новых уведомлений нет.',tr:'Yeni bildirim yok.',ka:'ახალი შეტყობინებები არ არის.'},
    'Şəhər':{en:'City',ru:'Город',tr:'Şehir',ka:'ქალაქი'},
    'Şəxsi satıcı':{en:'Private seller',ru:'Частный продавец',tr:'Bireysel satıcı',ka:'კერძო გამყიდველი'},
    'Diler':{en:'Dealer',ru:'Дилер',tr:'Bayi',ka:'დილერი'},
    'Etibar':{en:'Trust',ru:'Доверие',tr:'Güven',ka:'ნდობა'},
    'Mesaj yaz':{en:'Message',ru:'Написать',tr:'Mesaj yaz',ka:'მიწერა'},
    'Təhlükəsiz alış':{en:'Safe purchase',ru:'Безопасная покупка',tr:'Güvenli alışveriş',ka:'უსაფრთხო ყიდვა'},
    'Ödəniş etməzdən əvvəl avtomobili və sənədləri yerində yoxlayın. Şübhəli elanları bizə bildirin.':{en:'Inspect the vehicle and documents in person before paying. Report suspicious listings to us.',ru:'Перед оплатой лично проверьте автомобиль и документы. Сообщайте нам о подозрительных объявлениях.',tr:'Ödeme yapmadan önce aracı ve belgeleri yerinde kontrol edin. Şüpheli ilanları bize bildirin.',ka:'გადახდამდე ადგილზე შეამოწმეთ ავტომობილი და დოკუმენტები. საეჭვო განცხადებები შეგვატყობინეთ.'},
    'Elana bax':{en:'View listing',ru:'Открыть объявление',tr:'İlanı gör',ka:'განცხადების ნახვა'},
    'Median':{en:'Median',ru:'Медиана',tr:'Medyan',ka:'მედიანა'},
    'İl':{en:'Year',ru:'Год',tr:'Yıl',ka:'წელი'},
    'Ban':{en:'Body',ru:'Кузов',tr:'Kasa',ka:'ძარა'},
    'Mühərrik':{en:'Engine',ru:'Двигатель',tr:'Motor',ka:'ძრავი'},
    'Güc':{en:'Power',ru:'Мощность',tr:'Güç',ka:'სიმძლავრე'},
    'Yürüş':{en:'Mileage',ru:'Пробег',tr:'Kilometre',ka:'გარბენი'},
    'Bazar':{en:'Market',ru:'Рынок',tr:'Pazar',ka:'ბაზარი'},
    'Vəziyyət':{en:'Condition',ru:'Состояние',tr:'Durum',ka:'მდგომარეობა'},
    'Bu brauzerdə səsli axtarış dəstəklənmir':{en:'Voice search is not supported in this browser.',ru:'Этот браузер не поддерживает голосовой поиск.',tr:'Bu tarayıcı sesli aramayı desteklemiyor.',ka:'ამ ბრაუზერში ხმოვანი ძიება არ არის მხარდაჭერილი.'},
    'Səs tanınmadı. Yenidən cəhd edin.':{en:'Voice was not recognized. Please try again.',ru:'Речь не распознана. Попробуйте ещё раз.',tr:'Ses algılanamadı. Tekrar deneyin.',ka:'ხმა ვერ ამოიცნო. სცადეთ კიდევ ერთხელ.'},
    'iPhone/iPad: Safari → Paylaş → Add to Home Screen.':{en:'iPhone/iPad: Safari → Share → Add to Home Screen.',ru:'iPhone/iPad: Safari → Поделиться → На экран «Домой».',tr:'iPhone/iPad: Safari → Paylaş → Ana Ekrana Ekle.',ka:'iPhone/iPad: Safari → გაზიარება → მთავარ ეკრანზე დამატება.'},
    'Gözlənilməz xəta baş verdi.':{en:'An unexpected error occurred.',ru:'Произошла непредвиденная ошибка.',tr:'Beklenmeyen bir hata oluştu.',ka:'მოულოდნელი შეცდომა მოხდა.'},
    'Ödəniş sorğusu göndərildi.':{en:'Payment request sent.',ru:'Запрос на оплату отправлен.',tr:'Ödeme talebi gönderildi.',ka:'გადახდის მოთხოვნა გაიგზავნა.'},
    'Şikayət admin yoxlamasına göndərildi.':{en:'Report sent for admin review.',ru:'Жалоба отправлена на проверку администратору.',tr:'Şikayet yönetici incelemesine gönderildi.',ka:'საჩივარი ადმინისტრატორის შემოწმებაზე გაიგზავნა.'},
    'Elanı “Satılıb” statusuna keçirək?':{en:'Mark this listing as sold?',ru:'Отметить объявление как проданное?',tr:'Bu ilan satıldı olarak işaretlensin mi?',ka:'მოვნიშნოთ განცხადება გაყიდულად?'},
    'Bu elanı silmək istəyirsiniz?':{en:'Do you want to delete this listing?',ru:'Удалить это объявление?',tr:'Bu ilanı silmek istiyor musunuz?',ka:'გსურთ ამ განცხადების წაშლა?'},
    'Şifrə yeniləmə linki emailə göndərildi.':{en:'Password reset link was sent by email.',ru:'Ссылка для сброса пароля отправлена на email.',tr:'Şifre yenileme bağlantısı e-postaya gönderildi.',ka:'პაროლის აღდგენის ბმული ელფოსტაზე გაიგზავნა.'},
    'Şifrə yeniləndi. Giriş edə bilərsiniz.':{en:'Password updated. You can sign in now.',ru:'Пароль обновлён. Теперь можно войти.',tr:'Şifre güncellendi. Şimdi giriş yapabilirsiniz.',ka:'პაროლი განახლდა. ახლა შეგიძლიათ შესვლა.'},
    'Balans və ödənişlər':{en:'Balance & payments',ru:'Баланс и платежи',tr:'Bakiye ve ödemeler',ka:'ბალანსი და გადახდები'},
    'Xidmətlər, balans artırmaları və ödəniş tarixçəsi.':{en:'Services, top-ups and payment history.',ru:'Услуги, пополнения и история платежей.',tr:'Hizmetler, bakiye yüklemeleri ve ödeme geçmişi.',ka:'სერვისები, ბალანსის შევსება და გადახდების ისტორია.'},
    'Balans':{en:'Balance',ru:'Баланс',tr:'Bakiye',ka:'ბალანსი'},'Balansı artır':{en:'Top up',ru:'Пополнить',tr:'Bakiye yükle',ka:'ბალანსის შევსება'},
    'Ödənişlər':{en:'Payments',ru:'Платежи',tr:'Ödemeler',ka:'გადახდები'},'Balans əməliyyatları':{en:'Balance activity',ru:'Операции по балансу',tr:'Bakiye hareketleri',ka:'ბალანსის ოპერაციები'},
    'Balans əməliyyatı yoxdur.':{en:'No balance activity.',ru:'Операций по балансу нет.',tr:'Bakiye hareketi yok.',ka:'ბალანსის ოპერაციები არ არის.'},
    'Balans əməliyyatı':{en:'Balance transaction',ru:'Операция по балансу',tr:'Bakiye işlemi',ka:'ბალანსის ოპერაცია'},
    'Balansı artır':{en:'Top up balance',ru:'Пополнить баланс',tr:'Bakiye yükle',ka:'ბალანსის შევსება'},
    'Balansa əlavə etmək istədiyiniz məbləği yazın':{en:'Enter the amount you want to add',ru:'Введите сумму пополнения',tr:'Eklemek istediğiniz tutarı girin',ka:'შეიყვანეთ დასამატებელი თანხა'},
    'Sorğu yarat':{en:'Create request',ru:'Создать заявку',tr:'Talep oluştur',ka:'მოთხოვნის შექმნა'},
    'Balans artırma sorğusu yaradıldı.':{en:'Top-up request created.',ru:'Заявка на пополнение создана.',tr:'Bakiye yükleme talebi oluşturuldu.',ka:'ბალანსის შევსების მოთხოვნა შეიქმნა.'},
    'Bu istifadəçini blokdan çıxarmadan mesaj yaza bilməzsiniz.':{en:'Unblock this user before sending a message.',ru:'Сначала разблокируйте пользователя, чтобы отправить сообщение.',tr:'Mesaj göndermek için önce bu kullanıcının engelini kaldırın.',ka:'შეტყობინების გასაგზავნად ჯერ მომხმარებელი განბლოკეთ.'},
    'Bu istifadəçi sizi bloklayıb. Mesaj göndərmək mümkün deyil.':{en:'This user has blocked you. Messaging is unavailable.',ru:'Этот пользователь заблокировал вас. Отправка сообщений недоступна.',tr:'Bu kullanıcı sizi engelledi. Mesaj gönderilemez.',ka:'ამ მომხმარებელმა დაგბლოკათ. შეტყობინების გაგზავნა შეუძლებელია.'},
    'Kəşfet':{en:'Explore',ru:'Обзор',tr:'Keşfet',ka:'აღმოაჩინე'},'Sizin üçün seçilən elanlar və profillər.':{en:'Listings and profiles selected for you.',ru:'Подобранные для вас объявления и профили.',tr:'Sizin için seçilen ilanlar ve profiller.',ka:'თქვენთვის შერჩეული განცხადებები და პროფილები.'},
    'Marka, model, insan adı...':{en:'Make, model, person name...',ru:'Марка, модель, имя пользователя...',tr:'Marka, model, kişi adı...',ka:'ბრენდი, მოდელი, მომხმარებლის სახელი...'}
  });


  Object.assign(FULL_TEXT, {
    'Baxış':{en:'views',ru:'просм.',tr:'görüntüleme',ka:'ნახვა'},
    'Satıldı':{en:'Sold',ru:'Продано',tr:'Satıldı',ka:'გაყიდულია'},
    'Sil':{en:'Delete',ru:'Удалить',tr:'Sil',ka:'წაშლა'},
    '0 elan':{en:'0 ads',ru:'0 объявл.',tr:'0 ilan',ka:'0 განცხადება'},
    'Pulsuz ağıllı axtarış':{en:'Free smart search',ru:'Бесплатный умный поиск',tr:'Ücretsiz akıllı arama',ka:'უფასო ჭკვიანი ძებნა'},
    'Markalar':{en:'Makes',ru:'Марки',tr:'Markalar',ka:'ბრენდები'},
    'Bir toxunuşla filtr':{en:'One-tap filter',ru:'Фильтр в одно касание',tr:'Tek dokunuşla filtre',ka:'ფილტრი ერთი შეხებით'},
    'Məkan':{en:'Location',ru:'Местоположение',tr:'Konum',ka:'მდებარეობა'},
    'Qiymət və il':{en:'Price & year',ru:'Цена и год',tr:'Fiyat ve yıl',ka:'ფასი და წელი'},
    'Texniki göstəricilər':{en:'Technical specifications',ru:'Технические характеристики',tr:'Teknik özellikler',ka:'ტექნიკური მახასიათებლები'},
    'Əlavə şərtlər':{en:'Additional conditions',ru:'Дополнительные условия',tr:'Ek koşullar',ka:'დამატებითი პირობები'},
    'Avtomobilin təchizatı':{en:'Vehicle equipment',ru:'Оснащение автомобиля',tr:'Araç donanımı',ka:'ავტომობილის აღჭურვილობა'},
    'Sırala':{en:'Sort',ru:'Сортировка',tr:'Sırala',ka:'დალაგება'},
    'Ölkə':{en:'Country',ru:'Страна',tr:'Ülke',ka:'ქვეყანა'},
    'Region / Ştat':{en:'Region / State',ru:'Регион / Штат',tr:'Bölge / Eyalet',ka:'რეგიონი / შტატი'},
    'Rayon / Bölgə':{en:'District / Area',ru:'Район / Область',tr:'İlçe / Bölge',ka:'რაიონი / რეგიონი'},
    'Qiymət min':{en:'Min price',ru:'Цена от',tr:'Min fiyat',ka:'მინ. ფასი'},
    'Qiymət max':{en:'Max price',ru:'Цена до',tr:'Maks fiyat',ka:'მაქს. ფასი'},
    'Valyuta':{en:'Currency',ru:'Валюта',tr:'Para birimi',ka:'ვალუტა'},
    'İl min':{en:'Min year',ru:'Год от',tr:'Min yıl',ka:'მინ. წელი'},
    'İl max':{en:'Max year',ru:'Год до',tr:'Maks yıl',ka:'მაქს. წელი'},
    'Kredit':{en:'Credit',ru:'Кредит',tr:'Kredi',ka:'კრედიტი'},
    'Barter':{en:'Trade-in',ru:'Обмен',tr:'Takas',ka:'ბარტერი'},
    'Vuruğu var':{en:'Damaged',ru:'Есть повреждения',tr:'Hasarlı',ka:'დაზიანებულია'},
    'Rənglənib':{en:'Repainted',ru:'Красился',tr:'Boyalı',ka:'შეღებილია'}
  });

  Object.assign(FULL_TEXT, {
    'Məs: Camry':{en:'e.g. Camry',ru:'Напр.: Camry',tr:'Örn: Camry',ka:'მაგ: Camry'},
    'Məs: XSE':{en:'e.g. XSE',ru:'Напр.: XSE',tr:'Örn: XSE',ka:'მაგ: XSE'},
    'Məs: XV70':{en:'e.g. XV70',ru:'Напр.: XV70',tr:'Örn: XV70',ka:'მაგ: XV70'},
    'Şəhər *':{en:'City *',ru:'Город *',tr:'Şehir *',ka:'ქალაქი *'},
    'Avtomobil haqqında qısa premium təqdimat':{en:'Short premium description of the vehicle',ru:'Краткое премиум-описание автомобиля',tr:'Araç için kısa premium tanıtım',ka:'ავტომობილის მოკლე პრემიუმ აღწერა'},
    'Əməliyyat/telefon qeydi':{en:'Payment/phone note',ru:'Примечание к оплате/телефону',tr:'Ödeme/telefon notu',ka:'გადახდის/ტელეფონის შენიშვნა'},
    'Təhlükəsiz ödəniş və balans dəstəyi':{en:'Secure payment and balance support',ru:'Безопасная оплата и поддержка баланса',tr:'Güvenli ödeme ve bakiye desteği',ka:'უსაფრთხო გადახდა და ბალანსის მხარდაჭერა'},
    'Ödəniş sorğusu':{en:'Payment request',ru:'Запрос на оплату',tr:'Ödeme talebi',ka:'გადახდის მოთხოვნა'},
    'Ödəniş üsulu ölkədən asılı olmayaraq universal göstərilir. Onlayn merchant inteqrasiyası aktiv edilənədək sorğular təhlükəsiz şəkildə yoxlanılır.':{en:'The payment method is shown universally. Requests are securely reviewed until online merchant processing is enabled.',ru:'Способ оплаты отображается универсально. До подключения онлайн-эквайринга заявки безопасно проверяются.',tr:'Ödeme yöntemi evrensel gösterilir. Online merchant entegrasyonu açılana kadar talepler güvenli biçimde kontrol edilir.',ka:'გადახდის მეთოდი უნივერსალურად ჩანს. ონლაინ merchant ინტეგრაციამდე მოთხოვნები უსაფრთხოდ მოწმდება.'},
    'ABŞ / Koreya / Rəsmi diler...':{en:'USA / Korea / Official dealer...',ru:'США / Корея / Официальный дилер...',tr:'ABD / Kore / Yetkili bayi...',ka:'აშშ / კორეა / ოფიციალური დილერი...'},
    'Məs: G30 / XV70':{en:'e.g. G30 / XV70',ru:'Напр.: G30 / XV70',tr:'Örn: G30 / XV70',ka:'მაგ: G30 / XV70'},
    'Məs: XSE / AMG':{en:'e.g. XSE / AMG',ru:'Напр.: XSE / AMG',tr:'Örn: XSE / AMG',ka:'მაგ: XSE / AMG'},
    'Səslə axtar':{en:'Voice search',ru:'Голосовой поиск',tr:'Sesli ara',ka:'ხმოვანი ძებნა'},
    'Təmizlə':{en:'Clear',ru:'Очистить',tr:'Temizle',ka:'გასუფთავება'}
  });

  let lang = ['az','en','ru','tr','ka'].includes(localStorage.getItem('avtovip-lang')) ? localStorage.getItem('avtovip-lang') : 'az';
  let catalogLang = null;
  let currentUser = null;
  let currentProfile = null;
  let deferredInstallPrompt = null;
  let activeRealtimeChannel = null;

  const t = key => I18N[lang]?.[key] || I18N.az[key] || key;
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const locale = () => intl?.locale?.(lang) || ({az:'az-AZ',ru:'ru-RU',tr:'tr-TR',ka:'ka-GE'})[lang] || 'en-US';
  const money = (v,c='AZN') => intl?.formatMoney?.(v,c,lang) || `${Number(v || 0).toLocaleString(locale(),{maximumFractionDigits:0})} ${c}`;
  const dateText = v => v ? new Intl.DateTimeFormat(locale(),{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v)) : '-';
  const timeText = v => v ? new Intl.DateTimeFormat(locale(),{hour:'2-digit',minute:'2-digit'}).format(new Date(v)) : '';
  const digits = v => String(v || '').replace(/\D/g,'');
  const qsParam = k => params.get(k) || '';
  const compareIds = () => JSON.parse(localStorage.getItem('avtovip-compare') || '[]');
  const setCompareIds = ids => localStorage.setItem('avtovip-compare',JSON.stringify([...new Set(ids)].slice(0,4)));

  function runtimeText(message=''){
    const raw=String(message||'');
    if(lang==='az') return raw;
    if(FULL_TEXT[raw]?.[lang]) return FULL_TEXT[raw][lang];
    const fileTooLarge=raw.match(/^(.+) 10 MB-dan böyükdür\.$/); if(fileTooLarge){const m={en:`${fileTooLarge[1]} is larger than 10 MB.`,ru:`${fileTooLarge[1]} больше 10 МБ.`,tr:`${fileTooLarge[1]} 10 MB'dan büyük.`,ka:`${fileTooLarge[1]} 10 მბ-ზე დიდია.`};return m[lang]||m.en}
    const known=[
      ['Invalid login credentials',{en:'Incorrect email or password.',ru:'Неверный email или пароль.',tr:'E-posta veya şifre yanlış.',ka:'ელფოსტა ან პაროლი არასწორია.'}],
      ['Email not confirmed',{en:'Please confirm your email first.',ru:'Сначала подтвердите email.',tr:'Önce e-postanızı doğrulayın.',ka:'ჯერ დაადასტურეთ ელფოსტა.'}],
      ['User already registered',{en:'This email is already registered.',ru:'Этот email уже зарегистрирован.',tr:'Bu e-posta zaten kayıtlı.',ka:'ეს ელფოსტა უკვე რეგისტრირებულია.'}],
      ['Password should be at least 6 characters',{en:'Password is too short.',ru:'Пароль слишком короткий.',tr:'Şifre çok kısa.',ka:'პაროლი ძალიან მოკლეა.'}]
    ];
    const hit=known.find(([needle])=>raw.includes(needle)); if(hit)return hit[1][lang]||hit[1].en;
    return lang==='en'?raw:(FULL_TEXT[raw]?.en||raw);
  }
  function toast(message,type='info',title=''){
    let stack=$('#toastStack'); if(!stack){stack=document.createElement('div');stack.id='toastStack';stack.className='toast-stack';document.body.append(stack)}
    const titles={error:{az:'Xəta',en:'Error',ru:'Ошибка',tr:'Hata',ka:'შეცდომა'},success:{az:'Uğurlu',en:'Success',ru:'Готово',tr:'Başarılı',ka:'წარმატება'},info:{az:'Məlumat',en:'Info',ru:'Информация',tr:'Bilgi',ka:'ინფორმაცია'}};
    const el=document.createElement('div'); el.className=`toast ${type}`;
    el.innerHTML=`<i class="fa-solid ${type==='success'?'fa-circle-check':type==='error'?'fa-circle-xmark':'fa-circle-info'}"></i><div><strong>${esc(title?runtimeText(title):(titles[type]?.[lang]||titles.info[lang]))}</strong><span>${esc(runtimeText(message))}</span></div>`;
    stack.append(el); setTimeout(()=>el.remove(),3600);
  }
  function setStatus(el,msg,type=''){ if(typeof el==='string') el=$(el); if(!el)return; el.textContent=runtimeText(msg||''); el.className=`form-status ${type}`; }
  function uiDialog({title='',message='',input=false,inputValue='',confirmText='',cancelText='',danger=false}={}){
    return new Promise(resolve=>{
      document.querySelector('.av-dialog-backdrop')?.remove();document.documentElement.classList.add('modal-open');
      const back=document.createElement('div');back.className='av-dialog-backdrop';
      back.innerHTML=`<div class="av-dialog" role="dialog" aria-modal="true"><div class="av-dialog-head"><strong>${esc(runtimeText(title||'Təsdiq'))}</strong></div><div class="av-dialog-body"><p>${esc(runtimeText(message||''))}</p>${input?`<textarea class="av-dialog-input" rows="3">${esc(inputValue)}</textarea>`:''}</div><div class="av-dialog-actions"><button type="button" class="btn btn-outline" data-cancel>${esc(runtimeText(cancelText||'Ləğv et'))}</button><button type="button" class="btn ${danger?'btn-danger':''}" data-confirm>${esc(runtimeText(confirmText||'Təsdiq et'))}</button></div></div>`;
      document.body.append(back);const inp=back.querySelector('.av-dialog-input');
      const done=v=>{back.remove();document.documentElement.classList.remove('modal-open');resolve(v)};
      back.querySelector('[data-cancel]').onclick=()=>done(null);back.querySelector('[data-confirm]').onclick=()=>done(input?(inp?.value||''):true);back.onclick=e=>{if(e.target===back)done(null)};setTimeout(()=>inp?.focus(),20);
    });
  }
  function fillSelect(el,items,placeholder=t('all')){ if(!el)return; const sorted=[...items].sort((a,b)=>byLocale(staticText(a),staticText(b))); el.innerHTML=`<option value="">${esc(staticText(placeholder))}</option>`+sorted.map(x=>`<option value="${esc(x)}">${esc(staticText(x))}</option>`).join(''); }
  function relative(v){
    if(!v)return '';
    const s=Math.floor((Date.now()-new Date(v))/1000);
    const now={az:'indi',en:'just now',ru:'только что',tr:'az önce',ka:'ახლახან'}[lang]||'just now';
    const min={az:'dəq',en:'min',ru:'мин',tr:'dk',ka:'წთ'}[lang]||'min';
    const hour={az:'saat',en:'h',ru:'ч',tr:'sa',ka:'სთ'}[lang]||'h';
    if(s<60)return now;
    if(s<3600)return `${Math.floor(s/60)} ${min}`;
    if(s<86400)return `${Math.floor(s/3600)} ${hour}`;
    return dateText(v);
  }

  async function loadCurrent(){
    const cur=await db.current(); currentUser=cur.user; currentProfile=cur.profile;
    renderAccountButton(); updateMessageBadge();
  }
  function renderAccountButton(){
    const a=$('#accountBtn'); if(!a)return;
    if(!currentUser){a.href=pathFor('login.html');a.innerHTML=`<i class="fa-regular fa-user"></i><span class="label">${t('login')}</span>`;return}
    const name=(currentProfile?.name||currentUser.email?.split('@')[0]||t('profile')).split(' ')[0];
    a.href=currentProfile?.role==='admin'?pathFor('admin/index.html'):pathFor('profile.html');
    a.innerHTML=`<i class="fa-${currentProfile?.role==='admin'?'solid fa-shield-halved':'regular fa-user'}"></i><span class="label">${esc(name)}</span>`;
  }
  function pathFor(file){ return page==='admin' ? `../${file}` : file; }
  function staticText(v){
    if(lang==='az') return v;
    if(FULL_TEXT[v]?.[lang]) return FULL_TEXT[v][lang];
    if(DOMAIN_TEXT[v]?.[lang]) return DOMAIN_TEXT[v][lang];
    const pair=STATIC_I18N[v];
    if(pair){if(lang==='ru')return pair[1];return pair[0]}
    /* Never leak Azerbaijani static UI into another selected language. */
    return FULL_TEXT[v]?.en || v;
  }
  function optionLabel(item){ return item?.[lang] || item?.en || item?.value || ''; }
  function colorLabel(item){ return optionLabel(item); }
  function byLocale(a,b){const c=intl?.collator?.(lang)||new Intl.Collator(locale(),{numeric:true,sensitivity:'base'});return c.compare(String(a||''),String(b||''))}
  function equipmentLabel(value){const item=EQUIPMENT_OPTIONS.find(x=>x.value===value);return item?optionLabel(item):staticText(value)}
  function localizeBranding(){
    const brand=BRAND_BY_LANG[lang]||BRAND_BY_LANG.en;
    $$('.brand-copy strong').forEach(el=>el.textContent=brand.name);
    $$('.brand-copy span').forEach(el=>el.textContent=brand.tagline);
    $$('img[alt="AvtoVİP"]').forEach(el=>el.alt=brand.name);
    if(document.title){const suffix=document.title.split('—')[0].trim();const titleMap={'Giriş':{en:'Sign in',ru:'Вход',tr:'Giriş',ka:'შესვლა'},'Profil':{en:'Profile',ru:'Профиль',tr:'Profil',ka:'პროფილი'},'Mesajlar':{en:'Messages',ru:'Сообщения',tr:'Mesajlar',ka:'შეტყობინებები'},'Sevimlilər':{en:'Favorites',ru:'Избранное',tr:'Favoriler',ka:'რჩეულები'},'Müqayisə':{en:'Compare',ru:'Сравнение',tr:'Karşılaştır',ka:'შედარება'},'Elan yerləşdir':{en:'Post ad',ru:'Подать объявление',tr:'İlan ver',ka:'განცხადების დამატება'},'Hekayə yerləşdir':{en:'Post story',ru:'Добавить историю',tr:'Hikaye ekle',ka:'ისტორიის დამატება'},'Şifrə yenilə':{en:'Reset password',ru:'Сброс пароля',tr:'Şifre yenile',ka:'პაროლის აღდგენა'}};const first=titleMap[suffix]?.[lang]||titleMap[suffix]?.en||suffix;document.title=page==='home'?`${brand.name} — ${staticText('Avtomobil bazarının ağıllı tərəfi.')}`:`${first} — ${brand.name}`}
  }
  function translateStaticDom(){
    if(!document.body)return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); const nodes=[]; let n; while((n=walker.nextNode()))nodes.push(n);
    nodes.forEach(node=>{const parent=node.parentElement;if(!parent||['SCRIPT','STYLE','TEXTAREA'].includes(parent.tagName)||parent.closest('[data-no-static-i18n]'))return;const raw=(node.__azText??node.nodeValue).trim();if(!raw)return;if(node.__azText===undefined)node.__azText=node.nodeValue;const translated=staticText(raw);if(translated!==raw){const lead=node.__azText.match(/^\s*/)?.[0]||'';const tail=node.__azText.match(/\s*$/)?.[0]||'';node.nodeValue=lead+translated+tail;}else if(lang==='az')node.nodeValue=node.__azText;});
    $$('input[placeholder],textarea[placeholder]').forEach(el=>{if(!el.dataset.azPlaceholder)el.dataset.azPlaceholder=el.placeholder;el.placeholder=lang==='az'?el.dataset.azPlaceholder:staticText(el.dataset.azPlaceholder)});
    $$('[title]').forEach(el=>{if(!el.dataset.azTitle)el.dataset.azTitle=el.title;el.title=lang==='az'?el.dataset.azTitle:staticText(el.dataset.azTitle)});
    $$('[aria-label]').forEach(el=>{if(!el.dataset.azAria)el.dataset.azAria=el.getAttribute('aria-label')||'';const base=el.dataset.azAria;if(base)el.setAttribute('aria-label',lang==='az'?base:staticText(base))});
    $$('select option').forEach(o=>{if(!o.dataset.azLabel)o.dataset.azLabel=o.textContent;o.textContent=lang==='az'?o.dataset.azLabel:staticText(o.dataset.azLabel)});
  }
  let i18nMutationTimer = 0;
  function observeDynamicI18n(){
    if(!document.body || document.body.dataset.i18nObserved==='1') return;
    document.body.dataset.i18nObserved='1';
    const observer=new MutationObserver(()=>{
      clearTimeout(i18nMutationTimer);
      i18nMutationTimer=setTimeout(()=>{translateStaticDom();localizeBranding();},40);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  function applyTranslations(){
    document.documentElement.lang=lang; $$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I18N[lang]?.[k])el.textContent=t(k)});
    $$('[data-i18n-placeholder]').forEach(el=>{const k=el.dataset.i18nPlaceholder;if(I18N[lang]?.[k])el.placeholder=t(k)}); translateStaticDom(); localizeBranding();
  }
  function initThemeLang(){
    const saved=localStorage.getItem('avtovip-theme'); const theme=saved || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'); document.documentElement.dataset.theme=theme;
    let langSel=$('#langSelect');
    if(!langSel && ['auth','reset'].includes(page)){const box=document.createElement('div');box.className='standalone-controls';box.innerHTML=`<div class="header-control"><select id="langSelect" aria-label="Language"><option value="az">🇦🇿</option><option value="en">🇬🇧</option><option value="ru">🇷🇺</option><option value="tr">🇹🇷</option><option value="ka">🇬🇪</option></select></div><button class="icon-btn" id="themeBtn" aria-label="Theme"></button>`;document.body.append(box);langSel=$('#langSelect')}
    $('#themeBtn')?.addEventListener('click',()=>{const n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem('avtovip-theme',n);renderThemeIcon()}); renderThemeIcon();
    if(langSel){const labels={az:'🇦🇿',en:'🇬🇧',ru:'🇷🇺',tr:'🇹🇷',ka:'🇬🇪'};langSel.innerHTML=Object.entries(labels).map(([v,l])=>`<option value="${v}">${l}</option>`).join('');langSel.value=lang;langSel.addEventListener('change',()=>{lang=langSel.value;catalogLang=null;countryCatalog=[];localStorage.setItem('avtovip-lang',lang);document.documentElement.lang=lang;document.documentElement.dataset.lang=lang;applyTranslations();renderAccountButton();window.dispatchEvent(new CustomEvent('avtovip:language',{detail:{lang}}))})}
    applyTranslations();
  }
  function renderThemeIcon(){const b=$('#themeBtn');if(b)b.innerHTML=`<i class="fa-solid ${document.documentElement.dataset.theme==='dark'?'fa-sun':'fa-moon'}"></i>`}
  function initBottomNav(){ const map={home:'home',explore:'explore',favorites:'explore',messages:'messages',profile:'profile','create-listing':'create','create-story':'create',detail:'home',compare:'explore'}; $$('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===map[page])); }
  async function updateMessageBadge(){
    if(!currentUser)return; const badge=$('#messageBadge'); if(!badge)return;
    const {count}=await sb.from('messages').select('*',{count:'exact',head:true}).eq('receiver_id',currentUser.id).eq('is_read',false);
    badge.textContent=count||''; badge.hidden=!count;
  }

  const LOCAL_BRAND_LOGOS = Object.fromEntries(BRANDS.map(([name,file])=>[name.toLowerCase(),`assets/img/brands/${file}`]));
  function brandLogoCandidates(make){
    const name=String(make?.name||'');
    const local=LOCAL_BRAND_LOGOS[name.toLowerCase()]||'';
    const snapshot=typeof make?.logo==='string'?make.logo:(make?.logo?.local_url||'');
    /* Brand artwork is snapshot-local. Never depend on a remote logo CDN at runtime. */
    return [...new Set([local,snapshot].filter(Boolean))];
  }
  async function brandRail(container){
    if(!container)return; await ensureCatalogs();
    const makes=vehicleMakes.length?vehicleMakes:BRANDS.map(([name,file])=>({name,logo:`assets/img/brands/${file}`}));
    container.innerHTML=''; const track=document.createElement('div');track.className='brands-track';container.append(track);
    for(const make of makes){const b=document.createElement('button');b.className='brand-chip';b.type='button';b.dataset.brand=make.name;const logos=brandLogoCandidates(make);const fallback=(make.name||'?').split(/\s+/).map(x=>x[0]).join('').slice(0,3).toUpperCase();b.innerHTML=`<span class="brand-logo-box">${logos.length?`<img loading="lazy" decoding="async" src="${esc(logos[0])}" alt="${esc(make.name)}">`:''}<b>${esc(fallback)}</b></span><span>${esc(make.name)}</span>`;const img=b.querySelector('img');if(img){let i=0;img.addEventListener('error',()=>{i++;if(i<logos.length){img.src=logos[i]}else{img.remove();b.querySelector('.brand-logo-box')?.classList.add('fallback')}})}else b.querySelector('.brand-logo-box')?.classList.add('fallback');track.append(b)}
    container.classList.add('brands-scroll');let paused=false,autoTimer=null;
    const startAuto=()=>{if(autoTimer)return;autoTimer=setInterval(()=>{if(paused||document.hidden||!container.isConnected||container.scrollWidth<=container.clientWidth+4)return;container.scrollLeft+=1;if(container.scrollLeft>=container.scrollWidth-container.clientWidth-2)container.scrollLeft=0},42)};
    startAuto();['pointerdown','touchstart','wheel'].forEach(ev=>container.addEventListener(ev,()=>paused=true,{passive:true}));['pointerup','touchend','pointercancel','mouseleave'].forEach(ev=>container.addEventListener(ev,()=>setTimeout(()=>paused=false,900),{passive:true}));
  }
  function fillSelectPairs(el,items,placeholder=t('all')){
    if(!el)return; const sorted=[...items].sort((a,b)=>byLocale(a.label,b.label)); el.innerHTML=`<option value="">${esc(staticText(placeholder))}</option>`+sorted.map(x=>`<option value="${esc(x.value)}">${esc(x.label)}</option>`).join('');
  }
  function fillDatalist(el,items){if(!el)return;const sorted=[...new Set(items)].sort(byLocale);el.innerHTML=sorted.map(x=>`<option value="${esc(x)}"></option>`).join('')}
  async function ensureCatalogs(){
    if(catalogLang!==lang){countryCatalog=[];catalogLang=lang;}
    if(!countryCatalog.length) countryCatalog=intl?await intl.countries(lang):[];
    if(!vehicleMakes.length) vehicleMakes=intl?await intl.makes(lang):BRANDS.map(([name])=>({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name}));
  }
  async function populateCountries(...selects){
    await ensureCatalogs(); const items=countryCatalog.filter(c=>c.iso2!=='AM').map(c=>({value:c.iso2,label:`${c.emoji?c.emoji+' ':''}${c.displayName||intl?.countryName?.(c.iso2,lang,c.native||c.name)||c.native||c.name}`})).sort((a,b)=>byLocale(a.label,b.label));
    selects.filter(Boolean).forEach(el=>fillSelectPairs(el,items,'Hamısı'));
  }
  async function populateCurrencies(el,preferred='AZN'){
    await ensureCatalogs(); const blocked=new Set(['AMD']); const codes=[...new Set(countryCatalog.map(c=>c.currency).filter(Boolean).concat(['AZN','USD','EUR','RUB','TRY','GEL','CNY','KRW','AED','GBP','CAD','JPY','CHF','SEK','NOK','PLN','KZT','UZS']))].filter(x=>!blocked.has(x)).sort(byLocale); fillSelect(el,codes,'Hamısı'); if(preferred&&[...el.options].some(o=>o.value===preferred))el.value=preferred;
  }
  async function populateMakes(select){
    await ensureCatalogs(); fillSelectPairs(select,vehicleMakes.map(m=>({value:m.name,label:m.name})),'Hamısı');
  }
  function makeIdByName(name){return vehicleMakes.find(m=>m.name===name)?.id||String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
  async function bindModelAutocomplete(makeSelect,input,list){
    if(!makeSelect||!input||!list)return; const load=async()=>{const make=makeSelect.value;if(!make){list.innerHTML='';return}const models=intl?await intl.models(makeIdByName(make),lang):[];fillDatalist(list,models.map(m=>m.name))}; makeSelect.addEventListener('change',()=>{input.value='';load()}); if(makeSelect.value)load();
  }
  async function bindLocation(countryEl,stateEl,cityInput,cityList,{mirror=null,currencyEl=null}={}){
    if(!countryEl)return; await populateCountries(countryEl); const preferred=localStorage.getItem('avtovip-country')||'AZ'; if([...countryEl.options].some(o=>o.value===preferred))countryEl.value=preferred;
    let cityNames=[]; let hierarchy=null;
    const renderCities=(arr)=>{cityNames=(arr||[]).map(x=>typeof x==='string'?x:x.name).filter(Boolean);fillDatalist(cityList,cityNames)};
    const onCountry=async()=>{const iso=countryEl.value; if(iso)localStorage.setItem('avtovip-country',iso); if(mirror&&mirror.value!==iso)mirror.value=iso; hierarchy=iso&&intl?await intl.countryHierarchy(iso,lang):null; activeLocationData=hierarchy; const states=hierarchy?.states||[]; if(stateEl)fillSelectPairs(stateEl,states.map(st=>({value:st.name,label:`${st.native&&st.native!==st.name?st.native+' / ':''}${st.name}`})),'Hamısı'); const flat=iso&&intl?await intl.cities(iso,lang):CITIES; renderCities(flat); if(currencyEl&&iso){await ensureCatalogs();const cur=intl?.currencyForCountry?.(countryCatalog,iso);if(cur&&[...currencyEl.options].some(o=>o.value===cur))currencyEl.value=cur}}
    const onState=()=>{if(!stateEl)return;const st=(hierarchy?.states||[]).find(x=>x.name===stateEl.value);if(st?.cities?.length)renderCities(st.cities);};
    countryEl.addEventListener('change',onCountry); stateEl?.addEventListener('change',()=>{if(cityInput)cityInput.value='';onState()}); cityInput?.addEventListener('input',()=>{const q=cityInput.value.trim().toLocaleLowerCase();if(q.length<2)return;fillDatalist(cityList,cityNames.filter(x=>x.toLocaleLowerCase().includes(q)).slice(0,80))}); await onCountry();
  }
  function fillColorSelect(el,placeholder='Seçin'){
    if(!el)return;
    el.innerHTML=`<option value="">${esc(staticText(placeholder))}</option>`+COLOR_OPTIONS.map(item=>`<option value="${esc(item.value)}">${esc(optionLabel(item))}</option>`).join('');
    if(el.dataset.colorReady==='1')return; el.dataset.colorReady='1'; el.classList.add('native-color-select');
    const wrap=document.createElement('div');wrap.className='color-picker';el.parentNode.insertBefore(wrap,el);wrap.append(el);
    const btn=document.createElement('button');btn.type='button';btn.className='color-picker-btn';wrap.append(btn);
    const menu=document.createElement('div');menu.className='color-picker-menu';menu.hidden=true;wrap.append(menu);
    const renderButton=()=>{const item=COLOR_OPTIONS.find(x=>x.value===el.value);btn.innerHTML=`<span class="color-swatch ${item?.value==='Ağ'||item?.value==='Mirvari ağ'?'light':''}" style="--sw:${item?.hex||'transparent'}"></span><span>${esc(item?optionLabel(item):staticText(placeholder))}</span><i class="fa-solid fa-chevron-down"></i>`};
    const renderMenu=()=>{menu.innerHTML=COLOR_OPTIONS.map(item=>`<button type="button" class="color-option ${el.value===item.value?'active':''}" data-value="${esc(item.value)}"><span class="color-swatch ${['Ağ','Mirvari ağ','Fil sümüyü'].includes(item.value)?'light':''}" style="--sw:${item.hex}"></span><span>${esc(optionLabel(item))}</span></button>`).join('')};
    btn.onclick=e=>{e.stopPropagation();renderMenu();menu.hidden=!menu.hidden};
    menu.onclick=e=>{const opt=e.target.closest('.color-option');if(!opt)return;el.value=opt.dataset.value;el.dispatchEvent(new Event('change',{bubbles:true}));menu.hidden=true};
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))menu.hidden=true});
    el.addEventListener('change',renderButton);renderButton();
  }
  function renderEquipment(root,name='equipment'){
    if(!root)return;const items=[...EQUIPMENT_OPTIONS].sort((a,b)=>byLocale(optionLabel(a),optionLabel(b)));
    root.innerHTML=items.map(x=>`<label class="check-chip"><input type="checkbox" ${name?`name="${name}"`:''} value="${esc(x.value)}"><span>${esc(optionLabel(x))}</span></label>`).join('');
  }

  async function commonFormOptions(root=document){
    await populateMakes($('#brand',root)); await populateCurrencies($('#currency',root),'AZN'); fillSelect($('#bodyType',root),BODY_TYPES,'Seçin'); fillSelect($('#fuel',root),FUELS,'Seçin'); fillSelect($('#transmission',root),TRANSMISSIONS,'Seçin'); fillSelect($('#drivetrain',root),DRIVETRAINS,'Seçin'); fillColorSelect($('#color',root),'Seçin');
    await bindModelAutocomplete($('#brand',root),$('#model',root),$('#modelList',root)); await bindLocation($('#country',root),$('#state',root),$('#city',root),$('#cityList',root),{currencyEl:$('#currency',root)});
    const eq=$('#equipmentGrid',root); renderEquipment(eq,'equipment');
  }

  function listingBadges(x){
    let out=''; if(x.is_premium)out+='<span class="badge premium"><i class="fa-solid fa-gem"></i> PREMIUM</span>'; else if(x.is_vip)out+='<span class="badge vip"><i class="fa-solid fa-crown"></i> VIP</span>'; if(x.is_verified)out+='<span class="badge verified"><i class="fa-solid fa-circle-check"></i> VERIFIED</span>'; if(x.is_credit)out+='<span class="badge">KREDİT</span>'; return out;
  }
  function listingCard(x,favoriteSet=new Set()){
    const img=x.image_urls?.[0]||'assets/img/brand/icon-512.png'; const fav=favoriteSet.has(x.id); const cids=compareIds();
    return `<article class="listing-card" data-listing="${x.id}">
      <a class="listing-photo" href="elan.html?id=${x.id}"><img loading="lazy" src="${esc(img)}" alt="${esc(x.title||`${x.brand} ${x.model}`)}"><div class="card-badges">${listingBadges(x)}</div></a>
      <button class="fav-btn ${fav?'active':''}" data-fav="${x.id}" title="${t('favorites')}"><i class="fa-${fav?'solid':'regular'} fa-heart"></i></button>
      <div class="listing-body"><div class="listing-price">${money(x.price,x.currency)}</div><div class="listing-title">${esc(x.brand)} ${esc(x.model)}</div>
      <div class="listing-meta">${x.year} • ${Number(x.mileage||0).toLocaleString()} km${x.engine_volume?` • ${x.engine_volume} L`:''}</div>
      <div class="listing-footer"><span><i class="fa-solid fa-location-dot"></i> ${esc([x.city,x.state_name,x.country_code].filter(Boolean).join(', '))}</span><span>${relative(x.published_at||x.created_at)}</span></div>
      <div class="row" style="margin-top:7px"><button class="btn btn-outline btn-sm grow" data-compare="${x.id}"><i class="fa-solid fa-code-compare"></i>${cids.includes(x.id)?'✓':t('compare')}</button></div></div></article>`;
  }
  async function favoriteSet(){ if(!currentUser)return new Set(); const {data}=await sb.from('favorites').select('listing_id').eq('user_id',currentUser.id); return new Set((data||[]).map(x=>x.listing_id)); }
  async function toggleFavorite(id,btn){
    if(!currentUser){location.href=`login.html?next=${encodeURIComponent(location.pathname.split('/').pop()+location.search)}`;return}
    const active=btn?.classList.contains('active');
    const q=active?sb.from('favorites').delete().eq('user_id',currentUser.id).eq('listing_id',id):sb.from('favorites').insert({user_id:currentUser.id,listing_id:id}); const {error}=await q; if(error){toast(error.message,'error');return}
    btn?.classList.toggle('active',!active); if(btn)btn.innerHTML=`<i class="fa-${active?'regular':'solid'} fa-heart"></i>`; toast(active?'Sevimlilərdən çıxarıldı':'Sevimlilərə əlavə edildi','success');
  }
  function toggleCompare(id){let ids=compareIds(); if(ids.includes(id))ids=ids.filter(x=>x!==id);else if(ids.length<4)ids.push(id);else{toast('Maksimum 4 avtomobil müqayisə oluna bilər.','info');return} setCompareIds(ids); toast(ids.includes(id)?'Müqayisəyə əlavə edildi':'Müqayisədən çıxarıldı','success');}
  function bindCardActions(root=document){
    root.addEventListener('click',e=>{const f=e.target.closest('[data-fav]');if(f){e.preventDefault();toggleFavorite(f.dataset.fav,f);return} const c=e.target.closest('[data-compare]');if(c){e.preventDefault();toggleCompare(c.dataset.compare);c.innerHTML=`<i class="fa-solid fa-code-compare"></i>${compareIds().includes(c.dataset.compare)?'✓':t('compare')}`}});
  }

  function parseSmart(text){
    const s=text.toLocaleLowerCase('az'); const f={};
    const brand=(vehicleMakes.length?vehicleMakes.map(x=>x.name):BRANDS.map(x=>x[0])).find(b=>s.includes(String(b).toLocaleLowerCase('az').replace('mercedes-benz','mercedes'))); if(brand)f.brand=brand;
    let m=s.match(/(?:maks(?:imum)?|qədər|altı|under|до)\s*([0-9]+)[\s,.]*(min|k)?/i) || s.match(/([0-9]+)\s*(min|k)\s*(?:manat|azn|₼)?\s*(?:qədər|altı|under|до)/i); if(m){let n=Number(m[1]);if(m[2]||n<1000)n*=1000;f.priceMax=n}
    m=s.match(/(19\d{2}|20\d{2})\s*(?:-?dən|-?dan|sonra|yuxarı|\+|after|от)/i); if(m)f.yearMin=Number(m[1]);
    if(/avtomat|automatic|автомат/i.test(s))f.transmission='Avtomat'; if(/mexanik|manual|механик/i.test(s))f.transmission='Mexaniki';
    if(/ağ|white|бел/i.test(s))f.color='Ağ'; if(/qara|black|черн/i.test(s))f.color='Qara'; if(/boz|gray|grey|сер/i.test(s))f.color='Boz';
    if(/suv|cip|jeep|offroad|кроссов|внедорож/i.test(s))f.body='SUV'; if(/sedan|седан/i.test(s))f.body='Sedan';
    if(/kredit|credit|кредит/i.test(s))f.credit=true; if(/barter|обмен|trade/i.test(s))f.barter=true;
    if(/elektr|electric|электр/i.test(s))f.fuel='Elektro'; else if(/hibrid|hybrid|гибрид/i.test(s))f.fuel='Hibrid'; else if(/dizel|diesel|дизел/i.test(s))f.fuel='Dizel';
    return f;
  }

  async function initHome(){
    await brandRail($('#brandsRail')); await ensureCatalogs(); await populateMakes($('#filterBrand')); await populateCurrencies($('#filterCurrency'),''); fillSelect($('#filterFuel'),FUELS); fillSelect($('#filterTransmission'),TRANSMISSIONS); fillSelect($('#filterDrivetrain'),DRIVETRAINS); fillColorSelect($('#filterColor'),'Hamısı'); fillSelect($('#filterBody'),BODY_TYPES);
    const eq=$('#filterEquipmentGrid'); renderEquipment(eq,'');
    await populateCountries($('#filterCountry'),$('#filterCountryAdvanced'));
    const pref=localStorage.getItem('avtovip-country')||''; if(pref){if($('#filterCountry'))$('#filterCountry').value=pref;if($('#filterCountryAdvanced'))$('#filterCountryAdvanced').value=pref}
    await bindLocation($('#filterCountryAdvanced'),$('#filterState'),$('#filterCityAdvanced'),$('#filterCityAdvancedList'),{mirror:$('#filterCountry')});
    if($('#filterCountry'))$('#filterCountry').addEventListener('change',async()=>{const iso=$('#filterCountry').value;if($('#filterCountryAdvanced')){$('#filterCountryAdvanced').value=iso;$('#filterCountryAdvanced').dispatchEvent(new Event('change'))}const cities=iso&&intl?await intl.cities(iso,lang):CITIES;fillDatalist($('#filterCityList'),cities)});
    $('#filterCity')?.addEventListener('input',async()=>{const iso=$('#filterCountry')?.value;if(!iso)return;const cities=await intl.cities(iso,lang);const q=$('#filterCity').value.toLocaleLowerCase();fillDatalist($('#filterCityList'),cities.filter(x=>x.toLocaleLowerCase().includes(q)).slice(0,80))});
    await bindModelAutocomplete($('#filterBrand'),$('#filterModel'),$('#filterModelList'));
    $('#brandsRail')?.addEventListener('click',e=>{const b=e.target.closest('[data-brand]');if(!b)return;if([...$('#filterBrand').options].some(o=>o.value===b.dataset.brand))$('#filterBrand').value=b.dataset.brand;$$('.brand-chip').forEach(x=>x.classList.toggle('active',x===b));$('#filterBrand').dispatchEvent(new Event('change'));loadHomeListings()});
    const adv=$('#advancedFilters'),toggle=$('#toggleAdvanced');
    const savedOpen=localStorage.getItem('avtovip-filter-open')==='1'; if(adv)adv.classList.toggle('open',savedOpen); if(toggle)toggle.setAttribute('aria-expanded',String(savedOpen));
    toggle?.addEventListener('click',()=>{const open=!adv?.classList.contains('open');adv?.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));localStorage.setItem('avtovip-filter-open',open?'1':'0')});
    $('#applyFilters')?.addEventListener('click',loadHomeListings); $('#resetFilters')?.addEventListener('click',()=>{ $$('#filterPanel input,#filterPanel select').forEach(x=>{if(x.type==='checkbox')x.checked=false;else x.value=''}); $('#vipOnly').dataset.on='0';$('#vipOnly').classList.remove('btn-gold');loadHomeListings() });
    $('#vipOnly')?.addEventListener('click',e=>{e.currentTarget.classList.toggle('btn-gold');e.currentTarget.dataset.on=e.currentTarget.dataset.on==='1'?'0':'1';loadHomeListings()});
    let filterTimer=0;const scheduleFilter=()=>{clearTimeout(filterTimer);filterTimer=setTimeout(loadHomeListings,260)};$('#filterPanel')?.addEventListener('change',e=>{if(e.target.closest('#toggleAdvanced,#applyFilters,#resetFilters,#vipOnly'))return;scheduleFilter()});$('#filterPanel')?.addEventListener('input',e=>{if(['INPUT'].includes(e.target.tagName)&&['search','number','text'].includes(e.target.type))scheduleFilter()});
    $('#sortListings')?.addEventListener('change',loadHomeListings);
    $('#smartSearchBtn')?.addEventListener('click',()=>applySmartSearch($('#smartSearchInput')?.value||'')); $('#smartSearchInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')applySmartSearch(e.target.value)}); initVoice();
    bindCardActions($('#listingsGrid')||document); await loadStories(); await loadHomeListings();
  }
  function applySmartSearch(text){
    if(!text.trim())return; const f=parseSmart(text); if(f.brand)$('#filterBrand').value=f.brand;if(f.priceMax)$('#filterPriceMax').value=f.priceMax;if(f.yearMin)$('#filterYearMin').value=f.yearMin;if(f.color)$('#filterColor').value=f.color;if(f.fuel)$('#filterFuel').value=f.fuel;if(f.credit)$('#filterCredit').checked=true;if(f.barter)$('#filterBarter').checked=true;
    if(f.transmission){const opts=[...$('#filterTransmission').options];const found=opts.find(o=>o.value.startsWith(f.transmission));if(found)$('#filterTransmission').value=found.value} if(f.body){const opts=[...$('#filterBody').options];const found=opts.find(o=>o.value.includes(f.body));if(found)$('#filterBody').value=found.value}
    const smartMsgs={az:`${Object.keys(f).length} parametr tanındı. Filtrlər tətbiq edildi.`,en:`${Object.keys(f).length} parameters recognized. Filters applied.`,ru:`Распознано параметров: ${Object.keys(f).length}. Фильтры применены.`,tr:`${Object.keys(f).length} parametre tanındı. Filtreler uygulandı.`,ka:`ამოცნობილია ${Object.keys(f).length} პარამეტრი. ფილტრები გამოყენებულია.`}; $('#smartSearchResult').textContent=smartMsgs[lang]||smartMsgs.en; loadHomeListings();
  }
  function initVoice(){
    const btn=$('#voiceBtn'); if(!btn)return; const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){btn.disabled=true;btn.title=runtimeText('Bu brauzerdə səsli axtarış dəstəklənmir');return}
    const rec=new SR();rec.interimResults=false;rec.maxAlternatives=1;rec.lang=({az:'az-AZ',en:'en-US',ru:'ru-RU',tr:'tr-TR',ka:'ka-GE'})[lang]||'en-US'; btn.addEventListener('click',()=>{try{rec.start();btn.classList.add('is-listening')}catch{}}); rec.onresult=e=>{$('#smartSearchInput').value=e.results[0][0].transcript;applySmartSearch(e.results[0][0].transcript)}; rec.onend=()=>btn.classList.remove('is-listening'); rec.onerror=()=>{btn.classList.remove('is-listening');toast('Səs tanınmadı. Yenidən cəhd edin.','error')};
  }
  async function loadHomeStats(){
    const {count}=await sb.from('elanlar').select('*',{count:'exact',head:true}).eq('status','approved'); $('#statListings') && ($('#statListings').textContent=count||0); if(currentUser){const {count:f}=await sb.from('favorites').select('*',{count:'exact',head:true}).eq('user_id',currentUser.id);$('#statFavorites')&&($('#statFavorites').textContent=f||0)}
  }
  async function loadHomeListings(){
    const grid=$('#listingsGrid');if(!grid)return;grid.innerHTML='<div class="skeleton listing-card"></div><div class="skeleton listing-card"></div><div class="skeleton listing-card"></div>';
    let q=sb.from('elanlar').select('*').eq('status','approved'); const v=id=>$(id)?.value?.trim()||'';
    const country=v('#filterCountry')||v('#filterCountryAdvanced'),city=v('#filterCity')||v('#filterCityAdvanced');
    if(v('#filterBrand'))q=q.eq('brand',v('#filterBrand')); if(v('#filterModel'))q=q.ilike('model',`%${v('#filterModel')}%`); if(country)q=q.eq('country_code',country); if(v('#filterState'))q=q.eq('state_name',v('#filterState')); if(city)q=q.ilike('city',city); if(v('#filterDistrict'))q=q.ilike('district',`%${v('#filterDistrict')}%`); if(v('#filterCurrency'))q=q.eq('currency',v('#filterCurrency'));
    if(v('#filterFuel'))q=q.eq('fuel',v('#filterFuel')); if(v('#filterTransmission'))q=q.eq('transmission',v('#filterTransmission')); if(v('#filterDrivetrain'))q=q.eq('drivetrain',v('#filterDrivetrain')); if(v('#filterColor'))q=q.eq('color',v('#filterColor')); if(v('#filterBody'))q=q.eq('body_type',v('#filterBody'));
    if(v('#filterGeneration'))q=q.ilike('generation',`%${v('#filterGeneration')}%`);if(v('#filterTrim'))q=q.ilike('trim',`%${v('#filterTrim')}%`);if(v('#filterMarketOrigin'))q=q.ilike('market_origin',`%${v('#filterMarketOrigin')}%`);if(v('#filterVin'))q=q.ilike('vin',`%${v('#filterVin').toUpperCase()}%`);
    if(v('#filterPriceMin'))q=q.gte('price',Number(v('#filterPriceMin')));if(v('#filterPriceMax'))q=q.lte('price',Number(v('#filterPriceMax')));if(v('#filterYearMin'))q=q.gte('year',Number(v('#filterYearMin')));if(v('#filterYearMax'))q=q.lte('year',Number(v('#filterYearMax')));if(v('#filterMileageMin'))q=q.gte('mileage',Number(v('#filterMileageMin')));if(v('#filterMileageMax'))q=q.lte('mileage',Number(v('#filterMileageMax')));if(v('#filterEngineMin'))q=q.gte('engine_volume',Number(v('#filterEngineMin')));if(v('#filterEngineMax'))q=q.lte('engine_volume',Number(v('#filterEngineMax')));if(v('#filterPowerMin'))q=q.gte('engine_power',Number(v('#filterPowerMin')));if(v('#filterPowerMax'))q=q.lte('engine_power',Number(v('#filterPowerMax')));if(v('#filterSeatsMin'))q=q.gte('seats',Number(v('#filterSeatsMin')));if(v('#filterSeatsMax'))q=q.lte('seats',Number(v('#filterSeatsMax')));if(v('#filterOwnersMax'))q=q.lte('owners_count',Number(v('#filterOwnersMax')));
    if(v('#filterCondition')==='new')q=q.eq('is_new',true);if(v('#filterCondition')==='used')q=q.eq('is_new',false);if($('#filterCredit')?.checked)q=q.eq('is_credit',true);if($('#filterBarter')?.checked)q=q.eq('is_barter',true);if($('#filterDamage')?.checked)q=q.eq('has_accident',true);if($('#filterPainted')?.checked)q=q.eq('is_painted',true);if($('#vipOnly')?.dataset.on==='1')q=q.eq('is_vip',true);
    const selectedEq=$$('#filterEquipmentGrid input:checked').map(x=>x.value);if(selectedEq.length)q=q.contains('equipment',selectedEq);
    const sort=v('#sortListings'); if(sort==='price-asc')q=q.order('price',{ascending:true});else if(sort==='price-desc')q=q.order('price',{ascending:false});else if(sort==='year-desc')q=q.order('year',{ascending:false});else if(sort==='mileage-asc')q=q.order('mileage',{ascending:true});else q=q.order('is_premium',{ascending:false}).order('is_vip',{ascending:false}).order('published_at',{ascending:false}); q=q.limit(100);
    const [{data,error},favs]=await Promise.all([q,favoriteSet()]); if(error){grid.innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;return} $('#resultCount')&&($('#resultCount').textContent=`${(data||[]).length} ${lang==='ru'?'объявл.':lang==='en'?'ads':lang==='tr'?'ilan':lang==='ka'?'განცხადება':'elan'}`); grid.innerHTML=(data||[]).length?(data||[]).map(x=>listingCard(x,favs)).join(''):`<div class="empty-state">${t('empty')}</div>`;
  }
  async function loadStories(){
    const rail=$('#storiesRail');if(!rail)return; const {data,error}=await sb.from('stories').select('*').eq('status','active').gt('expires_at',new Date().toISOString()).order('active_at',{ascending:false}).limit(50); if(error){console.warn(error.message);return}
    const userIds=[...new Set((data||[]).map(x=>x.user_id))]; let profiles={}; if(userIds.length){const {data:p}=await sb.from('users').select('id,name,surname,avatar_url').in('id',userIds);(p||[]).forEach(x=>profiles[x.id]=x)}
    const add=`<a class="story-item story-add" href="hekaye-ver.html"><div class="story-ring"><div class="story-ring-inner"><i class="fa-solid fa-plus"></i></div></div><span>${t('addStory')}</span></a>`;
    rail.innerHTML=add+(data||[]).map(s=>{const p=profiles[s.user_id]||{};return `<button class="story-item" type="button" data-story="${s.id}"><div class="story-ring"><div class="story-ring-inner">${s.media_type==='video'?`<video src="${esc(s.media_url)}" muted></video>`:`<img src="${esc(s.media_url)}" alt="">`}</div></div><span>${esc(p.name||'AvtoVİP')}</span></button>`}).join(''); rail.onclick=e=>{const b=e.target.closest('[data-story]');if(b){const story=(data||[]).find(x=>x.id===b.dataset.story);if(story)openStory(story,profiles[story.user_id])}};
  }
  async function openStory(s,p={}){
    const modal=document.createElement('div');modal.className='story-viewer';modal.innerHTML=`<div class="story-card"><div class="story-progress"></div>${s.media_type==='video'?`<video src="${esc(s.media_url)}" autoplay muted playsinline controls></video>`:`<img src="${esc(s.media_url)}" alt="story">`}<div class="story-top"><strong>${esc([p?.name,p?.surname].filter(Boolean).join(' ')||'AvtoVİP')}</strong><button class="story-close"><i class="fa-solid fa-xmark"></i></button></div><div class="story-bottom">${esc(s.caption||'')}${s.listing_id?`<div style="margin-top:8px"><a class="btn btn-sm" href="elan.html?id=${s.listing_id}">Elana bax</a></div>`:''}</div></div>`;document.body.append(modal);document.documentElement.classList.add('modal-open');const close=()=>{modal.remove();document.documentElement.classList.remove('modal-open')};modal.querySelector('.story-close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()}); if(s.media_type!=='video')setTimeout(()=>modal.isConnected&&close(),7000);
    let key=localStorage.getItem('avtovip-viewer-key');if(!key){key=crypto.randomUUID?.()||Math.random().toString(36).slice(2);localStorage.setItem('avtovip-viewer-key',key)} await sb.from('story_views').insert({story_id:s.id,viewer_id:currentUser?.id||null,viewer_key:currentUser?'':key});
  }

  async function initListingDetail(){
    await ensureCatalogs(); const id=qsParam('id'); if(!id){$('#detailRoot').innerHTML='<div class="empty-state">Elan tapılmadı.</div>';return}
    const {data:x,error}=await sb.from('elanlar').select('*').eq('id',id).maybeSingle(); if(error||!x||!(x.status==='approved'||x.user_id===currentUser?.id||currentProfile?.role==='admin')){$('#detailRoot').innerHTML='<div class="empty-state">Elan mövcud deyil və ya moderasiya mərhələsindədir.</div>';return}
    sb.rpc('increment_listing_view',{p_listing_id:id}).then(()=>{}); const [{data:seller},{data:hist},favs]=await Promise.all([sb.from('users').select('*').eq('id',x.user_id).maybeSingle(),sb.from('listing_price_history').select('*').eq('listing_id',id).order('created_at',{ascending:false}).limit(12),favoriteSet()]); const insight=await priceInsight(x); renderDetail(x,seller,hist||[],insight,favs.has(id));
  }
  async function priceInsight(x){
    const {data}=await sb.from('elanlar').select('price').eq('status','approved').eq('brand',x.brand).eq('model',x.model).gte('year',x.year-2).lte('year',x.year+2).eq('currency',x.currency).limit(200); const arr=(data||[]).map(y=>Number(y.price)).filter(Boolean).sort((a,b)=>a-b); if(arr.length<3)return null; const median=arr[Math.floor(arr.length/2)]; const delta=(Number(x.price)-median)/median*100; return {median,delta,count:arr.length};
  }
  function renderDetail(x,seller,hist,insight,isFav){
    const root=$('#detailRoot'); const photos=x.image_urls?.length?x.image_urls:['assets/img/brand/icon-512.png']; const name=[seller?.name,seller?.surname].filter(Boolean).join(' ')||'Satıcı'; const wa=digits(x.whatsapp_phone||x.phone); const phone=String(x.phone||''); let priceClass='',priceLabel=''; if(insight){if(insight.delta<=-4){priceClass='good';priceLabel=t('goodPrice')}else if(insight.delta>=8){priceLabel=t('highPrice')}else priceLabel=t('marketPrice')}
    root.innerHTML=`<div class="detail-layout"><div class="stack"><section class="panel gallery"><div class="gallery-main"><img id="mainPhoto" src="${esc(photos[0])}" alt="${esc(x.title)}"></div><div class="gallery-thumbs">${photos.map((p,i)=>`<button class="gallery-thumb ${i===0?'active':''}" data-photo="${esc(p)}"><img src="${esc(p)}" alt=""></button>`).join('')}</div></section>
      <section class="panel detail-main"><div class="detail-title"><div><h1>${esc(x.brand)} ${esc(x.model)}</h1><div class="muted small">${x.year} • ${Number(x.mileage).toLocaleString(locale())} km • ${esc([x.city,x.state_name,x.country_code].filter(Boolean).join(', '))}</div></div><div class="card-badges" style="position:static;max-width:none">${listingBadges(x)}</div></div><div class="detail-price">${money(x.price,x.currency)}</div>${insight?`<div class="price-insight"><span class="badge ${priceClass}">${esc(priceLabel)}</span><span>Median: <strong>${money(insight.median,x.currency)}</strong> • ${insight.count} elan</span></div>`:''}<div class="divider"></div><div class="detail-actions"><button class="btn btn-outline ${isFav?'active':''}" id="detailFav"><i class="fa-${isFav?'solid':'regular'} fa-heart"></i>${t('favorites')}</button><button class="btn btn-outline" id="detailCompare"><i class="fa-solid fa-code-compare"></i>${t('compare')}</button><button class="btn btn-outline" id="detailShare"><i class="fa-solid fa-share-nodes"></i>${t('share')}</button></div><div class="divider"></div><div class="spec-grid">${[['İl',x.year],['Ban',x.body_type],['Mühərrik',x.engine_volume?`${x.engine_volume} L`:'-'],['Güc',x.engine_power?`${x.engine_power} a.g.`:'-'],['Yanacaq',x.fuel],['Sürətlər qutusu',x.transmission],['Ötürücü',x.drivetrain],['Rəng',COLOR_OPTIONS.find(c=>c.value===x.color)?optionLabel(COLOR_OPTIONS.find(c=>c.value===x.color)):x.color],['Yürüş',`${Number(x.mileage).toLocaleString()} km`],['Bazar',x.market_origin||'-'],['VIN',x.vin||'-'],['Vəziyyət',x.is_new?'Yeni':'Sürülmüş']].map(([a,b])=>`<div class="spec"><span>${esc(staticText(a))}</span><strong>${esc(staticText(b??'-'))}</strong></div>`).join('')}</div><div class="divider"></div><h3>Açıqlama</h3><p style="white-space:pre-wrap">${esc(x.description||'Açıqlama əlavə edilməyib.')}</p>${x.equipment?.length?`<div class="divider"></div><h3>Təchizat</h3><div class="equipment-list">${x.equipment.map(y=>`<span class="equipment-tag"><i class="fa-solid fa-check"></i> ${esc(equipmentLabel(y))}</span>`).join('')}</div>`:''}</section>
      ${hist.length?`<section class="panel panel-pad"><div class="section-head"><h3>Qiymət tarixçəsi</h3></div><div class="price-history">${hist.map(h=>`<div class="price-row"><span>${dateText(h.created_at)}</span><strong>${money(h.new_price,h.currency)}</strong></div>`).join('')}</div></section>`:''}
      </div><aside class="detail-sidebar stack"><section class="panel seller-card"><div class="row"><img class="seller-avatar" src="${esc(seller?.avatar_url||'assets/img/brand/icon-192.png')}" alt=""><div class="grow"><strong>${esc(name)}</strong><div class="muted small">${seller?.role==='dealer'?'Diler':'Şəxsi satıcı'} ${seller?.is_verified?'<i class="fa-solid fa-circle-check" style="color:var(--info)"></i>':''}</div><div class="trust"><span>Etibar ${seller?.trust_score||50}/100</span><span class="trust-bar"><i style="width:${seller?.trust_score||50}%"></i></span></div></div></div><div class="contact-grid"><a class="btn" href="tel:${esc(phone)}"><i class="fa-solid fa-phone"></i>${t('call')}</a>${wa?`<a class="btn btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(`Salam. AvtoVİP-da ${x.brand} ${x.model} (${x.year}) elanınızla maraqlanıram: ${location.href}`)}"><i class="fa-brands fa-whatsapp"></i>${t('whatsapp')}</a>`:'<button class="btn btn-outline" disabled>WhatsApp</button>'}</div>${currentUser&&currentUser.id!==x.user_id?`<a class="btn btn-outline btn-block" style="margin-top:7px" href="mesajlar.html?with=${x.user_id}&listing=${x.id}"><i class="fa-regular fa-comment"></i> Mesaj yaz</a>`:''}</section><section class="panel panel-pad"><div class="section-head"><h3>Təhlükəsiz alış</h3></div><p class="muted small">Ödəniş etməzdən əvvəl avtomobili və sənədləri yerində yoxlayın. Şübhəli elanları bizə bildirin.</p><button class="btn btn-outline btn-block" id="reportBtn"><i class="fa-regular fa-flag"></i>${t('report')}</button></section></aside></div>`;
    $$('.gallery-thumb').forEach(b=>b.onclick=()=>{$('#mainPhoto').src=b.dataset.photo;$$('.gallery-thumb').forEach(z=>z.classList.toggle('active',z===b))}); $('#detailFav').onclick=e=>toggleFavorite(x.id,e.currentTarget); $('#detailCompare').onclick=()=>toggleCompare(x.id); $('#detailShare').onclick=async()=>{try{if(navigator.share)await navigator.share({title:`${x.brand} ${x.model}`,url:location.href});else{await navigator.clipboard.writeText(location.href);toast('Link kopyalandı.','success')}}catch{}}; $('#reportBtn').onclick=()=>reportListing(x.id);
  }
  async function reportListing(id){
    const reason=await uiDialog({title:'Şikayət',message:'Şikayətin səbəbini qısa yazın:',input:true,confirmText:'Göndər'}); if(!reason?.trim())return; const {error}=await sb.from('listing_reports').insert({listing_id:id,reporter_id:currentUser?.id||null,reason:reason.trim()}); if(error)toast(error.message,'error');else toast('Şikayət admin yoxlamasına göndərildi.','success');
  }

  function setupFriendlyFileInput(input,{kind='images'}={}){
    if(!input||input.dataset.friendly==='1')return;input.dataset.friendly='1';input.classList.add('native-file-hidden');
    const wrap=document.createElement('div');wrap.className='friendly-file';
    const labelMap={
      images:{az:'Şəkilləri seç',en:'Choose photos',ru:'Выбрать фото',tr:'Fotoğraf seç',ka:'ფოტოების არჩევა'},
      media:{az:'Şəkil/video seç',en:'Choose photo/video',ru:'Выбрать фото/видео',tr:'Fotoğraf/video seç',ka:'ფოტო/ვიდეოს არჩევა'}
    };
    const none={az:'Fayl seçilməyib',en:'No file selected',ru:'Файл не выбран',tr:'Dosya seçilmedi',ka:'ფაილი არ არის არჩეული'};
    wrap.innerHTML=`<button type="button" class="btn btn-outline btn-sm friendly-file-btn"><i class="fa-solid fa-upload"></i>${labelMap[kind]?.[lang]||labelMap[kind]?.en}</button><span class="friendly-file-name">${none[lang]||none.en}</span>`;
    input.insertAdjacentElement('afterend',wrap);wrap.querySelector('button').onclick=()=>input.click();
    input.addEventListener('change',()=>{const n=input.files?.length||0;wrap.querySelector('.friendly-file-name').textContent=n?(n===1?input.files[0].name:`${n} ${lang==='ru'?'файлов':lang==='tr'?'dosya':lang==='ka'?'ფაილი':lang==='az'?'fayl':'files'}`):(none[lang]||none.en)});
  }

  async function initCreateListing(){
    const user=await db.requireAuth();if(!user)return;
    await commonFormOptions();
    const form=$('#listingForm'),files=$('#listingImages'),preview=$('#imagePreview');
    setupFriendlyFileInput(files,{kind:'images'});
    let selectedListingFiles=[];
    const syncListingFiles=()=>{const dt=new DataTransfer();selectedListingFiles.slice(0,15).forEach(f=>dt.items.add(f));files.files=dt.files;renderPreview(files.files,preview,index=>{selectedListingFiles.splice(index,1);syncListingFiles()})};
    files?.addEventListener('change',()=>{for(const f of [...files.files]){if(!selectedListingFiles.some(x=>x.name===f.name&&x.size===f.size&&x.lastModified===f.lastModified))selectedListingFiles.push(f)}selectedListingFiles=selectedListingFiles.slice(0,15);syncListingFiles()});
    form?.addEventListener('submit',async e=>{
      e.preventDefault();const btn=$('#submitListing');btn.disabled=true;setStatus('#listingStatus','Şəkillər yüklənir...');
      const uploadedPaths=[];
      try{
        const imageFiles=[...files.files].slice(0,15);
        if(imageFiles.length<3)throw new Error('Minimum 3 avtomobil şəkli əlavə edin.');
        const urls=[];
        for(const original of imageFiles){
          if(original.size>10*1024*1024)throw new Error(`${original.name} 10 MB-dan böyükdür.`);
          const file=await db.prepareImage(original,{maxWidth:1800,maxHeight:1800,quality:.82,maxBytes:2_500_000});
          const up=await db.upload('elan-images',user.id,file,'listings');uploadedPaths.push(up.path);urls.push(up.url);
        }
        const fd=new FormData(form);
        const payload={user_id:user.id,brand:fd.get('brand'),model:fd.get('model')?.trim(),generation:fd.get('generation')?.trim(),trim:fd.get('trim')?.trim(),year:Number(fd.get('year')),price:Number(fd.get('price')),currency:fd.get('currency'),country_code:fd.get('country_code')||'AZ',state_name:fd.get('state_name')||null,city:fd.get('city'),district:fd.get('district')?.trim()||null,body_type:fd.get('body_type'),color:fd.get('color'),fuel:fd.get('fuel'),transmission:fd.get('transmission'),drivetrain:fd.get('drivetrain'),engine_volume:fd.get('engine_volume')?Number(fd.get('engine_volume')):null,engine_power:fd.get('engine_power')?Number(fd.get('engine_power')):null,mileage:Number(fd.get('mileage')||0),seats:fd.get('seats')?Number(fd.get('seats')):null,owners_count:fd.get('owners_count')?Number(fd.get('owners_count')):null,market_origin:fd.get('market_origin')?.trim(),vin:fd.get('vin')?.trim().toUpperCase(),description:fd.get('description')?.trim(),phone:fd.get('phone')?.trim(),whatsapp_phone:fd.get('whatsapp_phone')?.trim(),is_new:fd.get('is_new')==='on',is_credit:fd.get('is_credit')==='on',is_barter:fd.get('is_barter')==='on',has_accident:fd.get('has_accident')==='on',is_painted:fd.get('is_painted')==='on',equipment:fd.getAll('equipment'),image_urls:urls,status:'approved',published_at:new Date().toISOString()};
        if(!payload.brand||!payload.model||!payload.year||!payload.price||!payload.phone)throw new Error('Vacib sahələri doldurun.');
        if(payload.country_code==='AM'||payload.currency==='AMD')throw new Error('Bu ölkə/valyuta bazarda aktiv deyil.');
        const {data,error}=await sb.from('elanlar').insert(payload).select('id').single();if(error)throw error;
        localStorage.removeItem('avtovip-listing-draft-v2');setStatus('#listingStatus','Elan uğurla yerləşdirildi.','success');toast('Elan yayımlandı.','success');setTimeout(()=>location.href=`profile.html?created=${data.id}`,900)
      }catch(err){
        if(uploadedPaths.length)await db.removePaths('elan-images',uploadedPaths).catch(()=>{});
        setStatus('#listingStatus',err.message,'error');toast(err.message,'error')
      }finally{btn.disabled=false}
    });
  }
  function renderPreview(files,root,onRemove){if(!root)return;root.innerHTML=[...files].slice(0,15).map((f,i)=>`<div class="upload-tile"><img src="${URL.createObjectURL(f)}" alt="">${onRemove?`<button type="button" class="upload-remove" data-remove-upload="${i}" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>`:''}</div>`).join('');if(onRemove)root.onclick=e=>{const b=e.target.closest('[data-remove-upload]');if(b)onRemove(Number(b.dataset.removeUpload))}}

  async function initCreateStory(){
    const user=await db.requireAuth();if(!user)return;
    const form=$('#storyForm'),media=$('#storyMedia');setupFriendlyFileInput(media,{kind:'media'});
    media?.addEventListener('change',()=>{const f=media.files[0],box=$('#storyPreview');if(!f||!box)return;const u=URL.createObjectURL(f);box.innerHTML=f.type.startsWith('video/')?`<video src="${u}" controls></video>`:`<img src="${u}" alt="">`});
    form?.addEventListener('submit',async e=>{
      e.preventDefault();const btn=$('#storySubmit');btn.disabled=true;let uploaded=null,storyId=null;
      try{
        const original=media.files[0];if(!original)throw new Error('Şəkil və ya video seçin.');
        if(original.type.startsWith('video/')&&original.size>30*1024*1024)throw new Error('Video maksimum 30 MB ola bilər.');
        const file=original.type.startsWith('image/')?await db.prepareImage(original,{maxWidth:1440,maxHeight:1920,quality:.82,maxBytes:2_000_000}):original;
        uploaded=await db.upload('story-media',user.id,file,'stories');
        const {data:story,error}=await sb.from('stories').insert({user_id:user.id,listing_id:$('#storyListing')?.value||null,media_url:uploaded.url,media_type:file.type.startsWith('video/')?'video':'image',caption:$('#storyCaption').value.trim(),status:'pending_payment'}).select().single();if(error)throw error;storyId=story.id;
        const amount=Number($('#storyAmount')?.dataset.amount||5);const {error:pe}=await sb.from('payment_requests').insert({user_id:user.id,target_type:'story',target_id:story.id,plan_code:'24h',amount,payment_method:$('#storyPaymentMethod').value,payer_note:$('#storyPaymentNote').value.trim()});if(pe)throw pe;
        toast('Hekayə yaradıldı. Ödəniş sorğusu admin təsdiqini gözləyir.','success');setStatus('#storyStatus','Admin ödənişi təsdiqlədikdən sonra hekayə 24 saatlıq aktiv olacaq.','success');form.reset();$('#storyPreview').innerHTML='';
      }catch(err){if(storyId)await sb.from('stories').delete().eq('id',storyId);if(uploaded?.path)await db.removePaths('story-media',[uploaded.path]).catch(()=>{});toast(err.message,'error');setStatus('#storyStatus',err.message,'error')}finally{btn.disabled=false}
    });
    const {data:list}=await sb.from('elanlar').select('id,brand,model,year').eq('user_id',user.id).eq('status','approved').order('created_at',{ascending:false});const sel=$('#storyListing');if(sel)sel.innerHTML=`<option value="">${esc(staticText('Elana bağlama'))}</option>`+(list||[]).map(x=>`<option value="${x.id}">${esc(x.brand)} ${esc(x.model)} ${x.year}</option>`).join('');
  }

  async function initFavorites(){
    const user=await db.requireAuth();if(!user)return;const root=$('#favoritesGrid');bindCardActions(root);const {data,error}=await sb.from('favorites').select('listing_id,notify_price_drop,elanlar(*)').eq('user_id',user.id).order('created_at',{ascending:false});if(error){root.innerHTML=`<div class="empty-state">${esc(error.message)}</div>`;return}const listings=(data||[]).map(x=>x.elanlar).filter(Boolean);root.innerHTML=listings.length?listings.map(x=>listingCard(x,new Set(listings.map(z=>z.id)))).join(''):`<div class="empty-state">${esc(runtimeText('Sevimli elanınız yoxdur.'))}</div>`;
  }

  async function initCompare(){
    const ids=compareIds();const root=$('#compareRoot');if(!ids.length){root.innerHTML='<div class="empty-state">Müqayisə üçün elan kartlarında “Müqayisə” düyməsinə toxunun.</div>';return}const {data,error}=await sb.from('elanlar').select('*').in('id',ids);if(error){root.innerHTML=esc(error.message);return}const arr=ids.map(id=>(data||[]).find(x=>x.id===id)).filter(Boolean);const rows=[['Qiymət',x=>money(x.price,x.currency)],['İl',x=>x.year],['Yürüş',x=>`${Number(x.mileage).toLocaleString()} km`],['Mühərrik',x=>x.engine_volume?`${x.engine_volume} L`:'-'],['Güc',x=>x.engine_power?`${x.engine_power} a.g.`:'-'],['Yanacaq',x=>x.fuel],['Sürətlər qutusu',x=>x.transmission],['Ötürücü',x=>x.drivetrain],['Ban',x=>x.body_type],['Rəng',x=>x.color],['Kredit',x=>x.is_credit?'Bəli':'Xeyr'],['Barter',x=>x.is_barter?'Bəli':'Xeyr'],['VIN',x=>x.vin||'-']];root.innerHTML=`<div class="compare-wrap panel"><table class="compare-table"><thead><tr><th>Parametr</th>${arr.map(x=>`<th><img class="compare-photo" src="${esc(x.image_urls?.[0]||'assets/img/brand/icon-512.png')}" alt=""><div style="margin-top:6px"><a href="elan.html?id=${x.id}"><strong>${esc(x.brand)} ${esc(x.model)}</strong></a></div><button class="btn btn-outline btn-sm" style="margin-top:6px" data-remove-compare="${x.id}">${esc(staticText('Sil'))}</button></th>`).join('')}</tr></thead><tbody>${rows.map(([n,f])=>`<tr><td>${esc(n)}</td>${arr.map(x=>`<td>${esc(f(x)??'-')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;root.onclick=e=>{const b=e.target.closest('[data-remove-compare]');if(b){setCompareIds(compareIds().filter(x=>x!==b.dataset.removeCompare));initCompare()}};
  }


  const COUNTRY_CURRENCY={AZ:'AZN',RU:'RUB',TR:'TRY',GE:'GEL',US:'USD',GB:'GBP',EU:'EUR',DE:'EUR',FR:'EUR',IT:'EUR',ES:'EUR',NL:'EUR',BE:'EUR',AT:'EUR',IE:'EUR',PT:'EUR',FI:'EUR',GR:'EUR',CA:'CAD',AU:'AUD',JP:'JPY',CN:'CNY',KR:'KRW',KZ:'KZT',UZ:'UZS',AE:'AED',CH:'CHF',SE:'SEK',NO:'NOK',PL:'PLN'};
  function currencyForProfile(p){return p?.wallet_currency||p?.preferred_currency||COUNTRY_CURRENCY[String(p?.country_code||'AZ').toUpperCase()]||'USD'}
  function localizeFinanceCurrencyHint(currency){const b=$('#walletTopupBtn');if(b)b.dataset.currency=currency}

  async function initProfile(){
    const user=await db.requireAuth();if(!user)return;const profile=await db.getProfile(user.id);currentProfile=profile;
    $('#profileAvatar').src=profile?.avatar_url||'assets/img/brand/icon-192.png';
    const country=profile?.country_code||'AZ';
    const profileCountries=intl?.countries?await intl.countries(lang):[];
    const countryMeta=profileCountries.find(x=>x.iso2===country);const flag=countryMeta?.emoji||'';
    $('#profileName').innerHTML=`${flag?`<span class="profile-country-flag" data-country="${esc(country)}" aria-label="${esc(country)}">${esc(flag)}</span> `:''}${esc([profile?.name,profile?.surname].filter(Boolean).join(' ')||user.email)}`;
    $('#profileEmail').textContent=user.email||'';$('#trustScore').textContent=profile?.trust_score||50;
    const avatar=$('#profileAvatar');avatar?.classList.toggle('vip-avatar',profile?.membership_tier==='vip');avatar?.classList.toggle('premium-avatar',profile?.membership_tier==='premium');
    const profileHead=$('.profile-head');profileHead?.classList.toggle('tier-vip',profile?.membership_tier==='vip');profileHead?.classList.toggle('tier-premium',profile?.membership_tier==='premium');
    const nameBox=$('#profileName'); if(profile?.is_verified&&nameBox&&!nameBox.querySelector('.verified-mark'))nameBox.insertAdjacentHTML('beforeend',' <span class="verified-mark verified-rosette" title="Verified"><i class="fa-solid fa-check"></i></span>');
    const countrySel=$('#profileCountry');if(countrySel&&intl){const countries=profileCountries;countrySel.innerHTML=countries.map(c=>`<option value="${c.iso2}">${c.emoji||''} ${esc(c.displayName||c.name)}</option>`).join('');countrySel.value=country}
    ['name','surname','phone','whatsapp_phone','city','address','bio'].forEach(k=>{const el=$(`[name="${k}"]`);if(el)el.value=profile?.[k]||''});
    const walletCurrency=currencyForProfile(profile);if($('#walletBalance'))$('#walletBalance').textContent=money(profile?.wallet_balance||0,walletCurrency);localizeFinanceCurrencyHint(walletCurrency);
    $('#profileForm')?.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const payload={name:fd.get('name')?.trim(),surname:fd.get('surname')?.trim(),phone:fd.get('phone')?.trim(),whatsapp_phone:fd.get('whatsapp_phone')?.trim(),country_code:fd.get('country_code')||'AZ',preferred_currency:COUNTRY_CURRENCY[String(fd.get('country_code')||'AZ').toUpperCase()]||'USD',city:fd.get('city')?.trim(),address:fd.get('address')?.trim(),bio:fd.get('bio')?.trim()};const {error}=await sb.from('users').update(payload).eq('id',user.id);if(error)toast(error.message,'error');else{toast('Profil yeniləndi.','success');loadCurrent()}});
    $('#walletTopupBtn')?.addEventListener('click',async()=>{const currency=currencyForProfile(currentProfile||profile);const value=await uiDialog({title:runtimeText('Balansı artır'),message:`${runtimeText('Balansa əlavə etmək istədiyiniz məbləği yazın')} (${currency}):`,input:true,confirmText:runtimeText('Sorğu yarat')});const amount=Number(String(value||'').replace(',','.'));if(!Number.isFinite(amount)||amount<=0)return;const {error}=await sb.from('payment_requests').insert({user_id:user.id,target_type:'wallet_topup',plan_code:'wallet_topup',amount,currency,payment_method:'payment_request',payer_note:''});if(error)toast(error.message,'error');else{toast(runtimeText('Balans artırma sorğusu yaradıldı.'),'success');loadOwnPayments(user.id)}});
    $('#avatarInput')?.addEventListener('change',async e=>{const original=e.target.files[0];if(!original)return;let up=null;try{const oldUrl=profile?.avatar_url||null;const f=await db.prepareImage(original,{maxWidth:640,maxHeight:640,quality:.84,maxBytes:700_000});up=await db.upload('avatars',user.id,f,'profile');const {error}=await sb.from('users').update({avatar_url:up.url}).eq('id',user.id);if(error)throw error;$('#profileAvatar').src=up.url;if(oldUrl&&oldUrl!==up.url)await db.removeUrls('avatars',[oldUrl]).catch(()=>{});toast('Profil şəkli yeniləndi.','success')}catch(err){if(up?.path)await db.removePaths('avatars',[up.path]).catch(()=>{});toast(err.message,'error')}});
    $('#logoutBtn')?.addEventListener('click',async()=>{await sb.auth.signOut();location.href='index.html'});
    await Promise.all([loadOwnListings(user.id),loadOwnPayments(user.id),loadWalletTransactions(user.id)]);
  }
  async function loadOwnListings(uid){
    const {data,error}=await sb.from('elanlar').select('*').eq('user_id',uid).order('created_at',{ascending:false});const root=$('#myListings');if(error){root.textContent=error.message;return}$('#myListingCount').textContent=(data||[]).length;const unit=$('#myListingUnit');if(unit)unit.textContent=({az:'elan',en:'ads',ru:'объявл.',tr:'ilan',ka:'განცხ.'})[lang]||'ads';root.innerHTML=(data||[]).length?(data||[]).map(x=>`<div class="profile-listing"><img src="${esc(x.image_urls?.[0]||'assets/img/brand/icon-192.png')}" alt=""><div class="grow"><div class="space-between"><a href="elan.html?id=${x.id}"><strong>${esc(x.brand)} ${esc(x.model)}</strong></a><span class="status-pill ${x.status}">${esc(t(x.status)||x.status)}</span></div><div class="muted small">${money(x.price,x.currency)} • ${x.year} • ${x.view_count||0} ${esc(staticText('Baxış'))}</div>${x.rejection_reason?`<div class="small" style="color:var(--danger)">${esc(x.rejection_reason)}</div>`:''}<div class="row-wrap" style="margin-top:5px">${x.status==='approved'?`<button class="btn btn-outline btn-sm" data-promote="${x.id}" data-kind="listing_vip"><i class="fa-solid fa-crown"></i> VIP</button><button class="btn btn-outline btn-sm" data-promote="${x.id}" data-kind="listing_premium"><i class="fa-solid fa-gem"></i> Premium</button><button class="btn btn-outline btn-sm" data-sold="${x.id}">${esc(staticText('Satıldı'))}</button>`:''}<button class="btn btn-outline btn-sm" data-delete-listing="${x.id}">${esc(staticText('Sil'))}</button></div></div></div>`).join(''):`<div class="empty-state">${esc(staticText('Hələ elan yerləşdirməmisiniz.'))}</div>`;
    root.onclick=async e=>{const p=e.target.closest('[data-promote]');if(p){openPromotion(p.dataset.promote,p.dataset.kind);return}const s=e.target.closest('[data-sold]');if(s&&await uiDialog({title:'Təsdiq',message:'Elanı “Satılıb” statusuna keçirək?',confirmText:'Təsdiq et'})){const {error}=await sb.from('elanlar').update({status:'sold'}).eq('id',s.dataset.sold);if(error)toast(error.message,'error');else loadOwnListings(uid);return}const d=e.target.closest('[data-delete-listing]');if(d&&await uiDialog({title:'Təsdiq',message:'Bu elanı silmək istəyirsiniz?',confirmText:'Sil',danger:true})){const row=(data||[]).find(x=>x.id===d.dataset.deleteListing);const {error}=await sb.from('elanlar').delete().eq('id',d.dataset.deleteListing);if(error)toast(error.message,'error');else{if(row?.image_urls?.length)await db.removeUrls('elan-images',row.image_urls).catch(()=>{});loadOwnListings(uid)}}};
  }
  function openPromotion(id,kind){
    const premium=kind==='listing_premium'; const modal=document.createElement('div');modal.className='modal';modal.innerHTML=`<div class="modal-card"><div class="modal-head"><h3>${premium?'Premium':'VIP'} irəli çəkmə</h3><button class="modal-close"><i class="fa-solid fa-xmark"></i></button></div><div class="modal-body stack"><p class="muted small">Ödəniş üsulu bütün ölkələr üçün universal göstərilir. Mövcud mərhələdə sorğu təhlükəsiz yoxlamaya göndərilir.</p><div class="field"><label>Paket</label><select id="promoPlan"><option value="1d" data-price="${premium?4:3}">1 gün — ${premium?4:3} AZN</option><option value="7d" data-price="${premium?15:10}">7 gün — ${premium?15:10} AZN</option><option value="30d" data-price="${premium?35:25}">30 gün — ${premium?35:25} AZN</option></select></div><div class="field"><label>Ödəniş üsulu</label><select id="promoMethod"><option value="payment_request">Ödəniş sorğusu</option></select></div><div class="field"><label>Qeyd / əməliyyat məlumatı</label><textarea id="promoNote" placeholder="Ödəniş etdikdən sonra qeyd yaza bilərsiniz"></textarea></div><button class="btn btn-block" id="promoSend">Sorğu göndər</button></div></div>`;document.body.append(modal);document.documentElement.classList.add('modal-open');const close=()=>{modal.remove();document.documentElement.classList.remove('modal-open')};modal.querySelector('.modal-close').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};modal.querySelector('#promoSend').onclick=async()=>{const plan=modal.querySelector('#promoPlan');const price=Number(plan.selectedOptions[0].dataset.price);const {error}=await sb.from('payment_requests').insert({user_id:currentUser.id,target_type:kind,target_id:id,plan_code:plan.value,amount:price,payment_method:modal.querySelector('#promoMethod').value,payer_note:modal.querySelector('#promoNote').value.trim()});if(error)toast(error.message,'error');else{toast('Ödəniş sorğusu göndərildi.','success');close();loadOwnPayments(currentUser.id)}};
  }
  async function loadOwnPayments(uid){
    const root=$('#paymentRequests');if(!root)return;const {data}=await sb.from('payment_requests').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(30);
    const labels={story:{az:'Hekayə',en:'Story',ru:'История',tr:'Hikâye',ka:'ისტორია'},listing_vip:{az:'VIP elan',en:'VIP listing',ru:'VIP-объявление',tr:'VIP ilan',ka:'VIP განცხადება'},listing_premium:{az:'Premium elan',en:'Premium listing',ru:'Premium-объявление',tr:'Premium ilan',ka:'Premium განცხადება'},wallet_topup:{az:'Balans artırma',en:'Balance top-up',ru:'Пополнение баланса',tr:'Bakiye yükleme',ka:'ბალანსის შევსება'},account_verified:{az:'Mavi tik',en:'Verified badge',ru:'Верификация',tr:'Doğrulama',ka:'ვერიფიკაცია'},account_vip:{az:'VIP üzvlük',en:'VIP membership',ru:'VIP-подписка',tr:'VIP üyelik',ka:'VIP წევრობა'},account_premium:{az:'Premium üzvlük',en:'Premium membership',ru:'Premium-подписка',tr:'Premium üyelik',ka:'Premium წევრობა'}};
    root.innerHTML=(data||[]).length?(data||[]).map(x=>`<div class="payment-history-row"><div><strong>${esc(labels[x.target_type]?.[lang]||labels[x.target_type]?.en||x.target_type.replaceAll('_',' '))}</strong><div class="muted tiny">${dateText(x.created_at)}</div></div><div class="text-right"><strong>${money(x.amount,x.currency)}</strong><div><span class="status-pill ${x.status}">${esc(({pending:{az:'Gözləyir',en:'Pending',ru:'Ожидает',tr:'Bekliyor',ka:'მოლოდინში'},approved:{az:'Təsdiqlənib',en:'Approved',ru:'Подтверждено',tr:'Onaylandı',ka:'დადასტურებულია'},rejected:{az:'Rədd edilib',en:'Rejected',ru:'Отклонено',tr:'Reddedildi',ka:'უარყოფილია'}}[x.status]?.[lang]||x.status))}</span></div></div></div>`).join(''):`<div class="muted small">${esc(runtimeText('Ödəniş sorğusu yoxdur.'))}</div>`;
  }
  async function loadWalletTransactions(uid){
    const root=$('#walletTransactions');if(!root)return;const {data,error}=await sb.from('wallet_transactions').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(30);if(error){root.innerHTML=`<div class="muted small">${esc(runtimeText('Balans əməliyyatı yoxdur.'))}</div>`;return}root.innerHTML=(data||[]).length?(data||[]).map(x=>`<div class="payment-history-row"><div><strong>${esc(x.description||runtimeText('Balans əməliyyatı'))}</strong><div class="muted tiny">${dateText(x.created_at)}</div></div><strong class="wallet-amount ${x.kind}">${x.kind==='credit'?'+':'-'}${money(x.amount,x.currency||'AZN')}</strong></div>`).join(''):`<div class="muted small">${esc(runtimeText('Balans əməliyyatı yoxdur.'))}</div>`;
  }

  async function loadNotifications(uid){const root=$('#notifications');if(!root)return;const {data}=await sb.from('notifications').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(20);root.innerHTML=(data||[]).length?(data||[]).map(x=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)"><strong>${esc(x.title)}</strong><div class="muted small">${esc(x.body)}</div><div class="tiny muted">${relative(x.created_at)}</div></div>`).join(''):'<div class="muted small">Yeni bildiriş yoxdur.</div>'}

  async function initMessages(){
    const user=await db.requireAuth();if(!user)return;
    await renderConversations(user.id);
    const withId=qsParam('with'),listingId=qsParam('listing');if(withId)await openConversation(withId,listingId);
    const refresh=()=>{renderConversations(user.id);const pane=$('#chatPane');if(pane?.dataset.peer)renderThread(pane.dataset.peer,pane.dataset.listing||'')};
    if(activeRealtimeChannel)await sb.removeChannel(activeRealtimeChannel).catch(()=>{});
    activeRealtimeChannel=sb.channel(`messages-live-${user.id}`,{config:{broadcast:{self:false}}})
      .on('postgres_changes',{event:'*',schema:'public',table:'messages'},payload=>{const m=payload.new?.id?payload.new:payload.old;if(!m)return;if(m.sender_id===user.id||m.receiver_id===user.id)refresh()})
      .subscribe(status=>{if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){console.warn('[AvtoVIP realtime] messages',status)}else if(status==='SUBSCRIBED'){document.body.dataset.realtime='on'}});
    const cleanup=()=>{if(activeRealtimeChannel){sb.removeChannel(activeRealtimeChannel).catch(()=>{});activeRealtimeChannel=null}};
    window.addEventListener('pagehide',cleanup,{once:true});window.addEventListener('beforeunload',cleanup,{once:true});
  }
  async function renderConversations(uid){
    const root=$('#conversationList');const {data,error}=await sb.from('messages').select('*').or(`sender_id.eq.${uid},receiver_id.eq.${uid}`).is('deleted_at',null).order('created_at',{ascending:false}).limit(500);if(error){root.innerHTML=esc(error.message);return}const groups=new Map();for(const m of data||[]){const peer=m.sender_id===uid?m.receiver_id:m.sender_id;const key=`${peer}|${m.listing_id||''}`;if(!groups.has(key))groups.set(key,{peer,listing:m.listing_id,last:m,unread:0});if(m.receiver_id===uid&&!m.is_read)groups.get(key).unread++}const peers=[...new Set([...groups.values()].map(g=>g.peer))];let pmap={};if(peers.length){const {data:p}=await sb.from('users').select('id,name,surname,avatar_url,membership_tier,is_verified').in('id',peers);(p||[]).forEach(x=>pmap[x.id]=x)}root.innerHTML=groups.size?[...groups.values()].map(g=>{const p=pmap[g.peer]||{};return `<button class="conversation-item" type="button" data-peer="${g.peer}" data-listing="${g.listing||''}"><span class="avatar-shell ${p.membership_tier||'free'}"><img class="conversation-avatar" src="${esc(p.avatar_url||'assets/img/brand/icon-192.png')}" alt="">${p.membership_tier==='vip'?'<i class="fa-solid fa-crown avatar-crown"></i>':p.membership_tier==='premium'?'<i class="fa-solid fa-gem avatar-gem"></i>':''}</span><div class="conversation-copy"><strong>${esc([p.name,p.surname].filter(Boolean).join(' ')||staticText('İstifadəçi'))}</strong><span>${esc(g.last.body)}</span></div><time class="tiny muted">${timeText(g.last.created_at)}</time>${g.unread?'<i class="unread-dot"></i>':''}</button>`}).join(''):`<div class="empty-state" style="margin:10px">${esc(staticText('Mesaj yoxdur.'))}</div>`;root.onclick=e=>{const b=e.target.closest('[data-peer]');if(b)openConversation(b.dataset.peer,b.dataset.listing)};
  }
  async function blockedRelationship(peer){
    if(!currentUser||!peer)return {blocked:false,byMe:false,byPeer:false};
    const {data,error}=await sb.from('user_blocks').select('blocker_id,blocked_id').or(`and(blocker_id.eq.${currentUser.id},blocked_id.eq.${peer}),and(blocker_id.eq.${peer},blocked_id.eq.${currentUser.id})`).limit(2);
    if(error){console.warn('[AvtoVIP blocks]',error);return {blocked:false,byMe:false,byPeer:false};}
    const rows=data||[];return {blocked:rows.length>0,byMe:rows.some(x=>x.blocker_id===currentUser.id),byPeer:rows.some(x=>x.blocker_id===peer)};
  }
  async function openConversation(peer,listing=''){
    $('#messagesShell').classList.add('chat-selected');const pane=$('#chatPane');pane.classList.add('open');pane.dataset.peer=peer;pane.dataset.listing=listing||'';
    const {data:p}=await sb.from('users').select('id,name,surname,avatar_url,membership_tier,is_verified').eq('id',peer).maybeSingle();$('#chatPeerName').textContent=[p?.name,p?.surname].filter(Boolean).join(' ')||staticText('İstifadəçi');$('#chatPeerAvatar').src=p?.avatar_url||'assets/img/brand/icon-192.png';const peerLink=$('#chatPeerLink');if(peerLink)peerLink.href=`user.html?id=${encodeURIComponent(peer)}`;
    const avatar=$('#chatPeerAvatar');avatar?.classList.toggle('vip-avatar',p?.membership_tier==='vip');avatar?.classList.toggle('premium-avatar',p?.membership_tier==='premium');
    $('#chatBack')?.addEventListener('click',()=>$('#messagesShell').classList.remove('chat-selected'),{once:true});
    const form=$('#chatForm'),rel=await blockedRelationship(peer),notice=$('#chatBlockedNotice');if(form)form.hidden=rel.blocked;if(notice){notice.hidden=!rel.blocked;notice.textContent=rel.byMe?runtimeText('Bu istifadəçini blokdan çıxarmadan mesaj yaza bilməzsiniz.'):rel.byPeer?runtimeText('Bu istifadəçi sizi bloklayıb. Mesaj göndərmək mümkün deyil.'):''}
    await renderThread(peer,listing);
    if(form)form.onsubmit=async e=>{e.preventDefault();const current=await blockedRelationship(peer);if(current.blocked){form.hidden=true;if(notice){notice.hidden=false;notice.textContent=current.byMe?runtimeText('Bu istifadəçini blokdan çıxarmadan mesaj yaza bilməzsiniz.'):runtimeText('Bu istifadəçi sizi bloklayıb. Mesaj göndərmək mümkün deyil.')}return}const input=$('#chatInput');const body=input.value.trim();const media=form.dataset.mediaUrl||null;if(!body&&!media)return;const {error}=await sb.from('messages').insert({listing_id:listing||null,sender_id:currentUser.id,receiver_id:peer,body:body||'',media_url:media,media_type:media?(form.dataset.mediaType||'image'):null});if(error){toast(error.message==='AVTOVIP_BLOCKED_MESSAGE'?runtimeText('Bu istifadəçi ilə mesajlaşma mümkün deyil.'):error.message,'error');return}input.value='';delete form.dataset.mediaUrl;delete form.dataset.mediaType;$('#chatMediaPreview')?.replaceChildren();await renderThread(peer,listing)};
    initChatMedia(peer,listing);
  }
  function initChatMedia(peer,listing){
    const form=$('#chatForm');if(!form||form.dataset.mediaReady==='1')return;form.dataset.mediaReady='1';
    const file=$('#chatMediaInput'),camera=$('#chatCameraInput'),preview=$('#chatMediaPreview');
    $('#chatMediaBtn')?.addEventListener('click',()=>file?.click());$('#chatCameraBtn')?.addEventListener('click',()=>camera?.click());
    const handleMedia=async inputEl=>{const original=inputEl.files?.[0];if(!original)return;try{if(!original.type.startsWith('image/'))throw new Error('Yalnız şəkil göndərilə bilər.');if(original.size>10*1024*1024)throw new Error('Şəkil 10 MB-dan böyük ola bilməz.');const img=await db.prepareImage(original,{maxWidth:1800,maxHeight:1800,quality:.84,maxBytes:2_500_000});const up=await db.upload('chat-media',currentUser.id,img,'messages');form.dataset.mediaUrl=up.url;form.dataset.mediaType='image';if(preview)preview.innerHTML=`<span><img src="${esc(up.url)}" alt=""><button type="button" id="chatMediaRemove" aria-label="Sil">×</button></span>`;$('#chatMediaRemove')?.addEventListener('click',()=>{delete form.dataset.mediaUrl;delete form.dataset.mediaType;preview.replaceChildren();file.value=''})}catch(e){toast(e.message,'error')}};file?.addEventListener('change',()=>handleMedia(file));camera?.addEventListener('change',()=>handleMedia(camera));
    $('#chatEmojiBtn')?.addEventListener('click',()=>{const box=$('#chatEmojiPicker');box.hidden=!box.hidden});
    $('#chatEmojiPicker')?.addEventListener('click',e=>{const b=e.target.closest('[data-emoji]');if(!b)return;const input=$('#chatInput');input.value+=b.dataset.emoji;input.focus();e.currentTarget.hidden=true});
  }
  function messageActionDialog(mode,value=''){
    const texts={az:{edit:'Mesajı redaktə et',del:'Mesaj silinsin?',desc:'Bu əməliyyatı geri qaytarmaq mümkün deyil.',cancel:'Ləğv et',save:'Yadda saxla',remove:'Sil'},en:{edit:'Edit message',del:'Delete message?',desc:'This action cannot be undone.',cancel:'Cancel',save:'Save',remove:'Delete'},ru:{edit:'Редактировать сообщение',del:'Удалить сообщение?',desc:'Это действие нельзя отменить.',cancel:'Отмена',save:'Сохранить',remove:'Удалить'},tr:{edit:'Mesajı düzenle',del:'Mesaj silinsin mi?',desc:'Bu işlem geri alınamaz.',cancel:'İptal',save:'Kaydet',remove:'Sil'},ka:{edit:'შეტყობინების რედაქტირება',del:'წაიშალოს შეტყობინება?',desc:'ამ მოქმედების გაუქმება შეუძლებელია.',cancel:'გაუქმება',save:'შენახვა',remove:'წაშლა'}};const x=texts[localStorage.getItem('avtovip-lang')||'az']||texts.az;
    return new Promise(resolve=>{let modal=document.querySelector('.av-message-modal');if(modal)modal.remove();modal=document.createElement('div');modal.className='av-message-modal';modal.innerHTML=`<div class="av-message-dialog" role="dialog" aria-modal="true"><h3>${esc(mode==='edit'?x.edit:x.del)}</h3>${mode==='edit'?`<textarea maxlength="2000"></textarea>`:`<p>${esc(x.desc)}</p>`}<div class="av-message-dialog-actions"><button type="button" class="btn btn-outline" data-cancel>${esc(x.cancel)}</button><button type="button" class="btn ${mode==='delete'?'danger':''}" data-ok>${esc(mode==='edit'?x.save:x.remove)}</button></div></div>`;document.body.append(modal);const input=modal.querySelector('textarea');if(input){input.value=value;setTimeout(()=>{input.focus();input.setSelectionRange(input.value.length,input.value.length)},0)}const done=v=>{modal.remove();resolve(v)};modal.querySelector('[data-cancel]').onclick=()=>done(mode==='edit'?null:false);modal.querySelector('[data-ok]').onclick=()=>done(mode==='edit'?input.value:true);modal.addEventListener('click',e=>{if(e.target===modal)done(mode==='edit'?null:false)});modal.addEventListener('keydown',e=>{if(e.key==='Escape')done(mode==='edit'?null:false);if(mode==='edit'&&e.key==='Enter'&&(e.ctrlKey||e.metaKey))done(input.value)})});
  }
  async function renderThread(peer,listing=''){
    let q=sb.from('messages').select('*').or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${peer}),and(sender_id.eq.${peer},receiver_id.eq.${currentUser.id})`).is('deleted_at',null).order('created_at',{ascending:true}).limit(500); if(listing)q=q.eq('listing_id',listing);const {data,error}=await q;const root=$('#chatMessages');if(error){root.innerHTML=esc(error.message);return}root.innerHTML=(data||[]).map(m=>`<div class="bubble ${m.sender_id===currentUser.id?'mine':''}" data-message-id="${m.id}">${m.media_url?`<img class="chat-media" src="${esc(m.media_url)}" alt="">`:''}${m.body?`<p>${esc(m.body)}</p>`:''}<time>${timeText(m.created_at)}${m.edited_at?' · ✎':''}${m.sender_id===currentUser.id&&m.is_read?' ✓✓':''}</time>${m.sender_id===currentUser.id?`<div class="message-actions"><button type="button" data-edit-message="${m.id}" title="Redaktə"><i class="fa-solid fa-pen"></i></button><button type="button" data-delete-message="${m.id}" title="Sil"><i class="fa-regular fa-trash-can"></i></button></div>`:''}</div>`).join('');root.scrollTop=root.scrollHeight;
    root.onclick=async e=>{const del=e.target.closest('[data-delete-message]'),edit=e.target.closest('[data-edit-message]');if(del){const ok=await messageActionDialog('delete');if(!ok)return;const {error}=await sb.from('messages').update({deleted_at:new Date().toISOString(),body:'',media_url:null,media_type:null}).eq('id',del.dataset.deleteMessage).eq('sender_id',currentUser.id);if(error)toast(error.message,'error');else{del.closest('.bubble')?.remove();await renderConversations(currentUser.id)}}if(edit){const id=edit.dataset.editMessage,b=edit.closest('.bubble'),old=b.querySelector('p')?.textContent||'';const text=await messageActionDialog('edit',old);if(text===null)return;const clean=text.trim();if(!clean)return toast(runtimeText('Mesaj boş ola bilməz.'),'error');const {error}=await sb.from('messages').update({body:clean,edited_at:new Date().toISOString()}).eq('id',id).eq('sender_id',currentUser.id);if(error)toast(error.message,'error');else{const p=b.querySelector('p');if(p)p.textContent=clean;const time=b.querySelector('time');if(time&&!time.textContent.includes('✎'))time.textContent=time.textContent.replace(/( ✓✓)?$/, ' · ✎$1');await renderConversations(currentUser.id)}}};
    const unread=(data||[]).filter(m=>m.receiver_id===currentUser.id&&!m.is_read).map(m=>m.id);if(unread.length)await sb.from('messages').update({is_read:true}).in('id',unread);updateMessageBadge()}


  async function initAuth(){
    if(currentUser){const next=qsParam('next');location.href=next||'profile.html';return}const tabs=$$('.auth-tab');tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.classList.toggle('active',x===b));$('#loginForm').hidden=b.dataset.tab!=='login';$('#registerForm').hidden=b.dataset.tab!=='register'});$('#loginForm')?.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);setStatus('#authStatus','Giriş edilir...');const {error}=await sb.auth.signInWithPassword({email:fd.get('email').trim(),password:fd.get('password')});if(error)setStatus('#authStatus',error.message,'error');else location.href=qsParam('next')||'profile.html'});$('#registerForm')?.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(fd.get('password')!==fd.get('password2')){setStatus('#authStatus','Şifrələr eyni deyil.','error');return}const {data,error}=await sb.auth.signUp({email:fd.get('email').trim(),password:fd.get('password'),options:{data:{name:fd.get('name').trim(),surname:fd.get('surname').trim()},emailRedirectTo:new URL('login.html',location.href).href}});if(error)setStatus('#authStatus',error.message,'error');else{setStatus('#authStatus',data.session?'Qeydiyyat tamamlandı.':'Email ünvanınıza təsdiq linki göndərildi.','success');if(data.session)setTimeout(()=>location.href='profile.html',500)}});
  }
  async function initReset(){
    const form=$('#resetForm');if(!form)return;const hash=new URLSearchParams(location.hash.slice(1));const hasRecovery=hash.get('type')==='recovery'||params.get('code');$('#requestReset').hidden=hasRecovery;$('#setPassword').hidden=!hasRecovery;$('#requestReset').onsubmit=async e=>{e.preventDefault();const email=new FormData(e.currentTarget).get('email').trim();const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:new URL('reset-password.html',location.href).href});setStatus('#resetStatus',error?error.message:'Şifrə yeniləmə linki emailə göndərildi.',error?'error':'success')};$('#setPassword').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(fd.get('password')!==fd.get('password2'))return setStatus('#resetStatus','Şifrələr eyni deyil.','error');const {error}=await sb.auth.updateUser({password:fd.get('password')});setStatus('#resetStatus',error?error.message:'Şifrə yeniləndi. Giriş edə bilərsiniz.',error?'error':'success')};
  }

  function initPWA(){
    if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(console.warn)); window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;$('#installBanner')?.removeAttribute('hidden')});$('#installBtn')?.addEventListener('click',async()=>{if(!deferredInstallPrompt){toast('iPhone/iPad: Safari → Paylaş → Add to Home Screen.','info');return}deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$('#installBanner')?.setAttribute('hidden','')});
  }

  async function boot(){
    initThemeLang();observeDynamicI18n();initBottomNav();initPWA();
    /* Theme/language are now stable; reveal immediately and load data progressively. */
    document.documentElement.classList.remove('av-preboot');
    await loadCurrent();
    window.AvtoVIPUI=Object.assign(window.AvtoVIPUI||{},{updateMessageBadge,renderConversations,renderThread,openConversation,loadOwnListings,loadOwnPayments,loadWalletTransactions});
  const handlers={home:initHome,detail:initListingDetail,'create-listing':initCreateListing,'create-story':initCreateStory,favorites:initFavorites,compare:initCompare,profile:initProfile,messages:initMessages,auth:initAuth,reset:initReset};
    try{await handlers[page]?.()}catch(err){console.error(err);toast(err.message||'Gözlənilməz xəta baş verdi.','error')}
    requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent('avtovip:language',{detail:{lang,initial:true}})));
  }
  document.addEventListener('DOMContentLoaded',boot);
})();
