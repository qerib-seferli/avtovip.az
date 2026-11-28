/* AvtoVIP — international data layer v4
   Multi-source vehicle catalog + resilient caching + localized geo data.
   Remote sources are additive. A local core catalog always remains available. */
(() => {
  'use strict';

  const GEO_BASE = 'https://cdn.jsdelivr.net/gh/srestre/world-countries-cities-db@main';
  const VEHICLE_BASE = ''; // vehicle katalogu local snapshot-first işləyir
  const VEHICLE_INDEX_URL = ''; // legacy API field retained for compatibility
  const UNIFIED_CATALOG_URL = 'assets/data/avtovip-unified-catalog.json';
  const LOCAL_VEHICLE_MAKES = 'assets/data/vehicle-makes.json?v=20261114b';
  const LOCAL_VEHICLE_MODELS = UNIFIED_CATALOG_URL; // legacy API field retained for compatibility
  const BLOCKED_COUNTRIES = new Set();
  const BLOCKED_CURRENCIES = new Set();
  const memory = new Map();
  const STORE_PREFIX = 'avtovip:data:v4:';

  const FALLBACK_COUNTRIES = [
    {iso2:'AZ',name:'Azerbaijan',currency:'AZN',currency_symbol:'₼',emoji:'🇦🇿'},
    {iso2:'GE',name:'Georgia',currency:'GEL',currency_symbol:'₾',emoji:'🇬🇪'},
    {iso2:'TR',name:'Türkiye',currency:'TRY',currency_symbol:'₺',emoji:'🇹🇷'},
    {iso2:'RU',name:'Russia',currency:'RUB',currency_symbol:'₽',emoji:'🇷🇺'},
    {iso2:'US',name:'United States',currency:'USD',currency_symbol:'$',emoji:'🇺🇸'},
    {iso2:'DE',name:'Germany',currency:'EUR',currency_symbol:'€',emoji:'🇩🇪'},
    {iso2:'CN',name:'China',currency:'CNY',currency_symbol:'¥',emoji:'🇨🇳'},
    {iso2:'KR',name:'South Korea',currency:'KRW',currency_symbol:'₩',emoji:'🇰🇷'},
    {iso2:'AE',name:'United Arab Emirates',currency:'AED',currency_symbol:'د.إ',emoji:'🇦🇪'}
  ];

  // Models are maintained exclusively in avtovip-unified-catalog.json.
  const FALLBACK_MAKES = [];
  const AZ_ADMIN = ['Abşeron rayonu','Ağcabədi rayonu','Ağdam rayonu','Ağdaş rayonu','Ağstafa rayonu','Ağsu rayonu','Astara rayonu','Babək rayonu','Balakən rayonu','Bərdə rayonu','Beyləqan rayonu','Biləsuvar rayonu','Cəbrayıl rayonu','Cəlilabad rayonu','Daşkəsən rayonu','Füzuli rayonu','Gədəbəy rayonu','Goranboy rayonu','Göyçay rayonu','Göygöl rayonu','Hacıqabul rayonu','Xaçmaz rayonu','Xızı rayonu','Xocalı rayonu','Xocavənd rayonu','İmişli rayonu','İsmayıllı rayonu','Kəlbəcər rayonu','Kəngərli rayonu','Kürdəmir rayonu','Qax rayonu','Qazax rayonu','Qəbələ rayonu','Qobustan rayonu','Quba rayonu','Qubadlı rayonu','Qusar rayonu','Laçın rayonu','Lənkəran rayonu','Lerik rayonu','Masallı rayonu','Neftçala rayonu','Oğuz rayonu','Ordubad rayonu','Saatlı rayonu','Sabirabad rayonu','Sədərək rayonu','Salyan rayonu','Samux rayonu','Siyəzən rayonu','Şabran rayonu','Şahbuz rayonu','Şamaxı rayonu','Şəmkir rayonu','Şərur rayonu','Şuşa rayonu','Tərtər rayonu','Tovuz rayonu','Ucar rayonu','Yardımlı rayonu','Yevlax rayonu','Zaqatala rayonu','Zəngilan rayonu','Zərdab rayonu','Bakı şəhəri','Gəncə şəhəri','Lənkəran şəhəri','Mingəçevir şəhəri','Naftalan şəhəri','Naxçıvan şəhəri','Şəki şəhəri','Şirvan şəhəri','Sumqayıt şəhəri','Yevlax şəhəri'];
  const AZ_MAIN_CITY = Object.fromEntries(AZ_ADMIN.map(name => [name,[name.replace(/\s+(rayonu|şəhəri)$/u,'')]]));
  AZ_MAIN_CITY['Bakı şəhəri']=['Bakı']; AZ_MAIN_CITY['Abşeron rayonu']=['Xırdalan']; AZ_MAIN_CITY['Naxçıvan şəhəri']=['Naxçıvan'];

  const safeGet = key => { try { const v=localStorage.getItem(STORE_PREFIX+key); return v?JSON.parse(v):null; } catch { return null; } };
  const safeSet = (key,val) => { try { const s=JSON.stringify(val); if(s.length<900000)localStorage.setItem(STORE_PREFIX+key,s); } catch {} };
  async function json(url,key,{persist=false}={}) {
    if(memory.has(key)) return memory.get(key);
    const saved=persist?safeGet(key):null;
    try { const ctl=new AbortController();const tm=setTimeout(()=>ctl.abort(),4500);const r=await fetch(url,{cache:'force-cache',signal:ctl.signal});clearTimeout(tm); if(!r.ok)throw new Error(String(r.status)); const data=await r.json(); memory.set(key,data); if(persist)safeSet(key,data); return data; }
    catch(err){ console.warn('[AvtoVIP data]',key,err); if(saved){memory.set(key,saved);return saved} return null; }
  }
  async function text(url,key,{persist=false}={}) {
    if(memory.has(key)) return memory.get(key);
    const saved=persist?safeGet(key):null;
    try { const ctl=new AbortController();const tm=setTimeout(()=>ctl.abort(),4500);const r=await fetch(url,{cache:'force-cache',signal:ctl.signal});clearTimeout(tm); if(!r.ok)throw new Error(String(r.status)); const data=await r.text(); memory.set(key,data); if(persist)safeSet(key,data); return data; }
    catch(err){ console.warn('[AvtoVIP data]',key,err); if(saved){memory.set(key,saved);return saved} return null; }
  }
  function locale(lang='en'){return ({az:'az-AZ',en:'en-US',ru:'ru-RU',tr:'tr-TR',ka:'ka-GE'})[lang]||'en-US'}
  function collator(lang='en'){return new Intl.Collator(locale(lang),{numeric:true,sensitivity:'base',usage:'sort'})}
  function sortByName(items,lang='en',getter=x=>x?.name||''){const c=collator(lang);return [...items].sort((a,b)=>c.compare(getter(a),getter(b)))}
  function countryName(iso2,lang='en',fallback=''){try{return new Intl.DisplayNames([locale(lang)],{type:'region'}).of(String(iso2||'').toUpperCase())||fallback}catch{return fallback}}
  function slug(v=''){return String(v).toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function indexSlug(v=''){return slug(v).replace(/-/g,'_')}

  async function countries(lang='en'){
    const data=await json(`${GEO_BASE}/metadata/countries.json`,'countries',{persist:true}); const arr=Array.isArray(data)?data:(data?.countries||[]);
    const source=arr.length?arr:FALLBACK_COUNTRIES;
    return sortByName(source.map(c=>{const iso2=String(c.iso2||c.iso_2||'').toUpperCase();return {iso2,iso3:c.iso3||'',name:c.name||'',native:c.native||c.name||'',displayName:countryName(iso2,lang,c.native||c.name||iso2),currency:c.currency||'USD',currencyName:c.currency_name||'',currencySymbol:c.currency_symbol||'',emoji:c.emoji||''}}).filter(c=>c.iso2&&c.name&&!BLOCKED_COUNTRIES.has(c.iso2)&&!BLOCKED_CURRENCIES.has(c.currency)),lang,x=>x.displayName)
  }
  function azHierarchy(){return {country:{iso2:'AZ',name:'Azərbaycan'},states:AZ_ADMIN.map(name=>({name,native:name,cities:(AZ_MAIN_CITY[name]||[]).map(city=>({name:city}))}))}}
  async function countryHierarchy(iso2,lang='en'){
    iso2=String(iso2||'').toUpperCase(); if(!iso2||BLOCKED_COUNTRIES.has(iso2))return null;
    if(iso2==='AZ'){const h=azHierarchy();h.states=sortByName(h.states,lang);return h}
    const data=await json(`${GEO_BASE}/countries/${iso2}.json`,`country:${iso2}`); const c=Array.isArray(data)?data[0]:data; if(!c)return null;
    const states=(Array.isArray(c.states)?c.states:[]).map(st=>({...st,name:String(st.name||st.native||'').trim(),native:String(st.native||st.name||'').trim(),cities:sortByName((Array.isArray(st.cities)?st.cities:[]).map(city=>typeof city==='string'?{name:city}:city).filter(x=>x?.name),lang)})).filter(st=>st.name);
    return {country:c,states:sortByName(states,lang)}
  }
  async function cities(iso2,lang='en'){
    iso2=String(iso2||'').toUpperCase(); if(!iso2||BLOCKED_COUNTRIES.has(iso2))return [];
    if(iso2==='AZ')return sortByName([...new Set(Object.values(AZ_MAIN_CITY).flat())].map(name=>({name})),lang).map(x=>x.name);
    const data=await json(`${GEO_BASE}/flat-cities/${iso2}.json`,`cities:${iso2}`); const arr=Array.isArray(data)?data:[]; const names=arr.map(x=>typeof x==='string'?x:x?.name).filter(Boolean);return sortByName([...new Set(names)].map(name=>({name})),lang).map(x=>x.name)
  }

  async function localFirstJson(localUrl,remoteUrl,key){
    try{const r=await fetch(localUrl,{cache:'no-cache'});if(r.ok){const d=await r.json();memory.set(key,d);return d}}catch{}
    return json(remoteUrl,key,{persist:true});
  }
  async function localFirstText(localUrl,remoteUrl,key){
    try{const r=await fetch(localUrl,{cache:'no-cache'});if(r.ok){const d=await r.text();memory.set(key,d);return d}}catch{}
    return remoteUrl ? text(remoteUrl,key,{persist:true}) : null;
  }
const AVTOVIP_CIVIL_AIRCRAFT_POLICY= {"blocked":["Airbus Defence and Space","Eurofighter","General Dynamics","Lockheed Martin","Northrop","Northrop Grumman"],"removed":{"Aermacchi":["MB-326"],"Airbus":["A400M","A400M Atlas"],"Airbus Defence and Space":["A310-304 MRTT","A330-200 MRTT","A330-202 MRTT","A330-203 MRTT","A330-243 MRTT","A400M Atlas","A400M-180","C212","C212-100","C212-100M","C212-200","C212-300","C212-400","C212-400MP","C212-CC","C212-CD","C212-DF","C295","C295M","C295MPA","C295W","CN235","CN235-10","CN235-100","CN235-100M","CN235-100MPA","CN235-10M","CN235-110MPA","CN235-200","CN235-200M","CN235-220M","CN235-220MPA","CN235-300","CN235-300M","CN235-300MPA","HC-144A Ocean Sentry","HC-144B Minotaur"],"Airbus Helicopters":["H145M","Tigre"],"Bell":["204/UH-1 Iroquois","47/H-13 Sioux","AH-1 HueyCobra","P-39 Airacobra","P-63 Kingcobra","UH-1Y Venom","YAH-63 SuperCobra"],"Boeing":["AH-64 Apache","AH-64D Apache","AH-64DN Apache","B-52 Stratofortress","CH-47 Chinook","CH-47D Chinook","CH-47F Chinook","E-3 Sentry (CFM56 engines)","E-3 Sentry (TF33 engines)","E-3A Sentry","E-3B Sentry","E-3C Sentry","E-3F Sentry","E-3G Sentry","E-4B NOAC","F/A-18E/F Super Hornet","F/A-18F Super Hornet","P-8 Poseidon","P-8A Poseidon","P-8I Neptune"],"Dassault":["Mirage","Mirage 2000","Mirage F1","Rafale","Super Mystère B2"],"Embraer":["A-29 Super Tucano","A-29B Super Tucano","B1 Super Tucano","C-95C","C-97","C-99A","E-99","EMB-314 Super Tucano"],"Eurofighter":["EF2000","EF2000 T","Typhoon","Typhoon FGR4","Typhoon T1","Typhoon T3"],"General Dynamics":["F-16 Fighting Falcon","F-16AM Fighting Falcon","F-16BM Fighting Falcon","F-16C Fighting Falcon","F-16CJ Fighting Falcon","F-16CM Fighting Falcon","F-16D Fighting Falcon","F-16DG Fighting Falcon","F-16DJ Fighting Falcon","F-16XL Fighting Falcon"],"Grumman":["A-6 Intruder","C-2 Greyhound","C-2A Greyhound","E-2 Hawkeye","E-2C Hawkeye","EA-6B Prowler","EF-111A Raven","F-14 Tomcat","F3F","F3F-2","F4F Wildcat","F4F-3 Wildcat","F6F Hellcat","F6F-3 Hellcat","F6F-5 Hellcat","F7F Tigercat","F7F-3 Tigercat","F7F-3N Tigercat","F8F Bearcat","F8F-1 Bearcat","F8F-1B Bearcat","F8F-1D Bearcat","F8F-2 Bearcat","F8F-2P Bearcat","F9F Panther","FM-2 Wildcat"],"Lockheed":["C-130 Hercules","C-141 Starlifter","C-5 Galaxy","C-5M Super Galaxy","F-104 Starfighter","F-117 Nighthawk","Martin C-130J Hercules","P-2 Neptune","P-3 Orion","P-38 Lightning","S-3 Viking","SR-71 Blackbird","T-33 Silver Star","U-2","Ventura"],"Lockheed Martin":["C-130J Super Hercules","F-22 Raptor","F-35A Lightning II","F-35B Lightning II","X-55 ACCA"],"McDonnell Douglas":["AV-8B Harrier II","C-17 Globemaster III","F-15 Eagle","F-4 Phantom II","F/A-18 Hornet","T-45 Goshawk","YC-15"],"Northrop":["C-125 Raider","F-5","F-5A Freedom Fighter","F-5B Freedom Fighter","F-5E Tiger II","F-5F Tiger II","P-61 Black Widow","T-38 Talon","T-38A Talon","T-38C Talon","T-38N Talon"],"Northrop Grumman":["B-2 Spirit","RQ-4 Global Hawk","X-47B"],"Tupolev":["Tu-16","Tu-160","Tu-22","Tu-22M","Tu-4","Tu-95"],"Yakovlev":["Yak-11","Yak-130","Yak-141","Yak-28","Yak-3","Yak-30","Yak-38","Yak-3M","Yak-3U","Yak-3UA","Yak-3UTI","Yak-9","Yak-9UM"]}};
const AVTOVIP_HISTORICAL_AIRCRAFT_BLOCKED=["AASI","AMX International","Aces High","Beoing","Bücker","ERCO","General Motors","Heliopolis","Morane Saulnier","Nanchang","Padc","Piasecki","SSH","Sadler","Stinson","Tatra","Textron AirLand","Uetz","Wassmer"];
const AVTOVIP_BLOCKED_AIRCRAFT=new Set(AVTOVIP_CIVIL_AIRCRAFT_POLICY.blocked);
for(const brand of AVTOVIP_HISTORICAL_AIRCRAFT_BLOCKED)AVTOVIP_BLOCKED_AIRCRAFT.add(brand);
const AVTOVIP_REMOVED_AIRCRAFT=Object.fromEntries(Object.entries(AVTOVIP_CIVIL_AIRCRAFT_POLICY.removed).map(([brand,models])=>[brand,new Set(models)]));
function avtovipCivilAircraftAllowed(brand,model){return !AVTOVIP_BLOCKED_AIRCRAFT.has(brand)&&!(AVTOVIP_REMOVED_AIRCRAFT[brand]?.has(model));}
// Canonical manufacturer names: preserve all unique models while avoiding duplicate brand cards.
const AVTOVIP_CANONICAL_BRANDS={caravan:{"Grand Design RV":"Grand Design","Gulf Stream Coach":"Gulf Stream","Heartland RV":"Heartland","Highland Ridge RV":"Highland Ridge","Keystone RV":"Keystone","Northwood Manufacturing":"Northwood","NuCamp RV":"nuCamp"},motorcycle:{"Quadro Vehicles":"Quadro","BMW":"BMW Motorrad"},aircraft:{"ATR":"ATR Aircraft"},commercial:{"Edward Davies Commercials":"Edward Davies"}};

  function normalizeVehicleCatalog(data) {
    return Object.fromEntries(Object.entries(data).map(([category, entries]) => {
      const makes = new Map();
      for (const [original, models] of Object.entries(entries || {})) {
        if (!Array.isArray(models) || (category === 'aircraft' && AVTOVIP_BLOCKED_AIRCRAFT.has(original))) continue;
        const name = AVTOVIP_CANONICAL_BRANDS[category]?.[original] || original;
        const combined = makes.get(name) || new Set();
        for (const model of models) {
          if (typeof model === 'string' && model.trim() && (category !== 'aircraft' || avtovipCivilAircraftAllowed(original, model))) combined.add(model);
        }
        makes.set(name, combined);
      }
      return [category, Object.fromEntries([...makes].map(([name, models]) => [name, [...models]]))];
    }));
  }
  let unifiedCatalogPromise=null;
  function loadUnifiedCatalog(){
    if(!unifiedCatalogPromise){
      unifiedCatalogPromise=fetch(UNIFIED_CATALOG_URL,{cache:'no-cache'})
        .then(r=>{if(!r.ok)throw new Error('Unified catalog HTTP '+r.status);return r.json()})
        .then(normalizeVehicleCatalog)
        .catch(err=>{console.warn('AvtoVIP unified catalog fallback:',err.message);return null});
    }
    return unifiedCatalogPromise;
  }
  let modelIndex=null;
  async function loadModelIndex(){
    const unified=await loadUnifiedCatalog();
    if(unified&&unified.car&&typeof unified.car==='object'){
      if(modelIndex)return modelIndex;
      const map=new Map();
      for(const [brand,models] of Object.entries(unified.car)){
        if(!Array.isArray(models))continue;
        const key=indexSlug(brand);
        map.set(key,[...new Map(models.filter(x=>typeof x==='string'&&x.trim()).map(x=>[x.normalize('NFKC').toLocaleLowerCase(),x])).values()]);
      }
      modelIndex=map;return map;
    }

    if(modelIndex)return modelIndex;
    // No separate CSV source: the unified JSON is the sole model catalog.
    modelIndex=new Map();return modelIndex;
  }
  async function makes(lang='en'){
    let data=null; try{const r=await fetch(LOCAL_VEHICLE_MAKES,{cache:'no-cache'});if(r.ok)data=await r.json()}catch{} const arr=Array.isArray(data)?data:[];
    const merged=new Map();
    for(const m of FALLBACK_MAKES)merged.set(slug(m.id),{id:slug(m.id),name:m.name,logo:null});
    for(const m of arr){if(!m?.name)continue;merged.set(slug(m.id||m.name),{id:slug(m.id||m.name),name:m.name,country:m.country||'',logo:(m.logo?.local_url||m.logo?.url||m.logo||null),aliases:m.aliases||[]})}
    const catalog = await loadUnifiedCatalog();
    const logos = await loadBrandLogos();
    if (!catalog?.car) return sortByName([...merged.values()],lang);
    const rows = [...new Map(Object.keys(catalog.car).map(name => {
      const id = slug(name);
      const current = merged.get(slug(name)) || {};
      return [id, {...current, id, name, logo: logos.car?.[name] || current.logo || null}];
    })).values()];
    return sortByName(rows,lang)
  }
  async function models(makeId,lang='en'){
    if(!makeId)return[];
    const id=slug(makeId);
    const names=new Map();
    const add=name=>{
      const value=String(name||'').trim();
      if(!value)return;
      const key=value.normalize('NFKC').toLocaleLowerCase();
      if(!names.has(key))names.set(key,value);
    };
    const idx=await loadModelIndex();
    const keys=[indexSlug(id),indexSlug(id.replace('mercedes-benz','mercedes_benz')),indexSlug(id.replace('lada-vaz','lada'))];
    for(const key of new Set(keys))(idx.get(key)||[]).forEach(add);
    return sortByName([...names.values()].map(name=>({id:slug(name),name})),lang);
  }
  function formatMoney(value,currency='USD',lang='en'){if(BLOCKED_CURRENCIES.has(currency))currency='USD';try{return new Intl.NumberFormat(locale(lang),{style:'currency',currency,maximumFractionDigits:0}).format(Number(value||0))}catch{return `${Number(value||0).toLocaleString(locale(lang))} ${currency}`}}
  function currencyForCountry(list,iso2){if(BLOCKED_COUNTRIES.has(String(iso2||'').toUpperCase()))return'USD';const cur=list.find(c=>c.iso2===iso2)?.currency||'USD';return BLOCKED_CURRENCIES.has(cur)?'USD':cur}

const FEATURE_LABELS={en:{Kredit:'Credit',Barter:'Trade',Lizinq:'Leasing','Qeydiyyat sənədi':'Registration documents',Naviqasiya:'Navigation',Avtopilot:'Autopilot','Xilasetmə avadanlığı':'Safety equipment','Uçuşa yararlılıq sertifikatı':'Airworthiness certificate','Texniki baxış':'Inspection','Servis tarixçəsi':'Service history',Zəmanət:'Warranty','Sənədləri qaydasında':'Documents in order','Elektrik start':'Electric start',Kabin:'Cabin',Kondisioner:'Air conditioning','Gömrük sənədi':'Customs documents',Soyuducu:'Refrigeration',Taxoqraf:'Tachograph',Duş:'Shower',Mətbəx:'Kitchen','Günəş paneli':'Solar panel'},ru:{Kredit:'Кредит',Barter:'Обмен',Lizinq:'Лизинг','Qeydiyyat sənədi':'Регистрационные документы',Naviqasiya:'Навигация',Avtopilot:'Автопилот','Xilasetmə avadanlığı':'Спасательное оборудование','Uçuşa yararlılıq sertifikatı':'Сертификат лётной годности','Texniki baxış':'Техосмотр','Servis tarixçəsi':'История обслуживания',Zəmanət:'Гарантия','Sənədləri qaydasında':'Документы в порядке','Elektrik start':'Электростартер',Kabin:'Кабина',Kondisioner:'Кондиционер','Gömrük sənədi':'Таможенные документы',Soyuducu:'Рефрижератор',Taxoqraf:'Тахограф',Duş:'Душ',Mətbəx:'Кухня','Günəş paneli':'Солнечная панель'},tr:{Kredit:'Kredi',Barter:'Takas',Lizinq:'Leasing','Qeydiyyat sənədi':'Tescil belgesi',Naviqasiya:'Navigasyon',Avtopilot:'Otopilot','Xilasetmə avadanlığı':'Kurtarma ekipmanı','Uçuşa yararlılıq sertifikatı':'Uçuşa elverişlilik sertifikası','Texniki baxış':'Muayene','Servis tarixçəsi':'Servis geçmişi',Zəmanət:'Garanti','Sənədləri qaydasında':'Belgeler tam','Elektrik start':'Elektrikli marş',Kabin:'Kabin',Kondisioner:'Klima','Gömrük sənədi':'Gümrük belgesi',Soyuducu:'Soğutucu',Taxoqraf:'Takograf',Duş:'Duş',Mətbəx:'Mutfak','Günəş paneli':'Güneş paneli'},ka:{Kredit:'კრედიტი',Barter:'ბარტერი',Lizinq:'ლიზინგი','Qeydiyyat sənədi':'რეგისტრაციის დოკუმენტი',Naviqasiya:'ნავიგაცია',Avtopilot:'ავტოპილოტ','Xilasetmə avadanlığı':'სამაშველო აღჭურვილობა','Uçuşa yararlılıq sertifikatı':'ფრენის ვარგისიანობის სერტიფიკატი','Texniki baxış':'ტექდათვალიერება','Servis tarixçəsi':'სერვისის ისტორია',Zəmanət:'გარანტია','Sənədləri qaydasında':'დოკუმენტები წესრიგშია','Elektrik start':'ელექტროსტარტერი',Kabin:'კაბინა',Kondisioner:'კონდიციონერი','Gömrük sənədi':'საბაჟო დოკუმენტი',Soyuducu:'მაცივარი',Taxoqraf:'ტაქოგრაფი',Duş:'შხაპი',Mətbəx:'სამზარეულო','Günəş paneli':'მზის პანელი'}};
const CATEGORY_TYPES={motorcycle:['Sport','Naked','Touring','Cruiser','Scooter','Enduro','Cross','Elektrik','Moped','Trisikl'],watercraft:['Yaxta','Qayıq','Katamaran','Jet ski','Yelkənli','Gəmi'],aircraft:['Helikopter','Təyyarə','Biznes jet','Ultralight'],agriculture:['Traktor','Kombayn','Səpin texnikası','Qoşqu','Püskürdücü'],construction:['Ekskavator','Buldozer','Kran','Yükləyici','Beton texnikası','Avtokran'],commercial:['Yük maşını','Furqon','Avtobus','Mikroavtobus','Dartıcı','Qoşqu'],caravan:['Karavan','Avtodom','Kemper','ATV','UTV','Qolfkar','Fayton','Digər']};
const extraTypeLabels = {
  Moped: {en:'Moped',ru:'Мопед',tr:'Moped',ka:'მოპედი'},
  Trisikl: {en:'Trike',ru:'Трицикл',tr:'Üç tekerlekli motosiklet',ka:'სამბორბლიანი მოტოციკლი'},
  Avtokran: {en:'Mobile crane',ru:'Автокран',tr:'Mobil vinç',ka:'ავტოამწე'},
  Qolfkar: {en:'Golf cart',ru:'Гольф-кар',tr:'Golf arabası',ka:'გოლფის ურიკა'},
  Fayton: {en:'Horse-drawn carriage',ru:'Экипаж',tr:'Fayton',ka:'ეტლი'}
};
const CATEGORY_TYPE_LABELS={"en":{"Yaxta":"Yacht","Qayıq":"Boat","Katamaran":"Catamaran","Yelkənli":"Sailboat","Gəmi":"Ship","Helikopter":"Helicopter","Təyyarə":"Airplane","Biznes jet":"Business jet","Traktor":"Tractor","Kombayn":"Combine harvester","Səpin texnikası":"Seeding equipment","Qoşqu":"Trailer","Püskürdücü":"Sprayer","Ekskavator":"Excavator","Buldozer":"Bulldozer","Kran":"Crane","Yükləyici":"Loader","Beton texnikası":"Concrete equipment","Yük maşını":"Truck","Furqon":"Van","Avtobus":"Bus","Mikroavtobus":"Minibus","Dartıcı":"Tractor unit","Karavan":"Caravan","Avtodom":"Motorhome","Kem per":"Camper","Digər":"Other","Elektrik":"Electric"},"ru":{"Yaxta":"Яхта","Qayıq":"Лодка","Katamaran":"Катамаран","Yelkənli":"Парусная лодка","Gəmi":"Судно","Helikopter":"Вертолёт","Təyyarə":"Самолёт","Biznes jet":"Бизнес-джет","Traktor":"Трактор","Kombayn":"Комбайн","Səpin texnikası":"Посевная техника","Qoşqu":"Прицеп","Püskürdücü":"Опрыскиватель","Ekskavator":"Экскаватор","Buldozer":"Бульдозер","Kran":"Кран","Yükləyici":"Погрузчик","Beton texnikası":"Бетонная техника","Yük maşını":"Грузовик","Furqon":"Фургон","Avtobus":"Автобус","Mikroavtobus":"Микроавтобус","Dartıcı":"Тягач","Karavan":"Караван","Avtodom":"Автодом","Kem per":"Кемпер","Digər":"Другое","Elektrik":"Электрический","Sport":"Спорт","Naked":"Нейкед","Touring":"Туринг","Cruiser":"Круизер","Scooter":"Скутер","Enduro":"Эндуро","Cross":"Кросс","Ultralight":"Сверхлёгкий","Jet ski":"Гидроцикл"},"tr":{"Yaxta":"Yat","Qayıq":"Tekne","Katamaran":"Katamaran","Yelkənli":"Yelkenli","Gəmi":"Gemi","Helikopter":"Helikopter","Təyyarə":"Uçak","Biznes jet":"İş jeti","Traktor":"Traktör","Kombayn":"Biçerdöver","Səpin texnikası":"Ekim makinesi","Qoşqu":"Römork","Püskürdücü":"Pülverizatör","Ekskavator":"Ekskavatör","Buldozer":"Buldozer","Kran":"Vinç","Yükləyici":"Yükleyici","Beton texnikası":"Beton ekipmanı","Yük maşını":"Kamyon","Furqon":"Panelvan","Avtobus":"Otobüs","Mikroavtobus":"Minibüs","Dartıcı":"Çekici","Karavan":"Karavan","Avtodom":"Motokaravan","Kem per":"Kamp aracı","Digər":"Diğer","Elektrik":"Elektrikli","Ultralight":"Ultra hafif","Jet ski":"Jet ski"},"ka":{"Yaxta":"იახტა","Qayıq":"ნავი","Katamaran":"კატამარანი","Yelkənli":"იალქნიანი ნავი","Gəmi":"გემი","Helikopter":"ვერტმფრენი","Təyyarə":"თვითმფრინავი","Biznes jet":"ბიზნესჯეტი","Traktor":"ტრაქტორი","Kombayn":"კომბაინი","Səpin texnikası":"სათესი ტექნიკა","Qoşqu":"მისაბმელი","Püskürdücü":"შემასხურებელი","Ekskavator":"ექსკავატორი","Buldozer":"ბულდოზერი","Kran":"ამწე","Yükləyici":"დამტვირთველი","Beton texnikası":"ბეტონის ტექნიკა","Yük maşını":"სატვირთო","Furqon":"ფურგონი","Avtobus":"ავტობუსი","Mikroavtobus":"მიკროავტობუსი","Dartıcı":"საწევარი","Karavan":"ქარავანი","Avtodom":"ავტოსახლი","Kem per":"კემპერი","Digər":"სხვა","Elektrik":"ელექტრო","Sport":"სპორტული","Naked":"ნეიკედი","Touring":"ტურინგი","Cruiser":"კრუიზერი","Scooter":"სკუტერი","Enduro":"ენდურო","Cross":"კროსი","Ultralight":"ულტრამსუბუქი","Jet ski":"ჰიდროციკლი"}};
const CATEGORY_EXTRAS={motorcycle:['Kredit','Barter','Sənədləri qaydasında','ABS','TCS','Elektrik start'],watercraft:['Kredit','Barter','Qeydiyyat sənədi','Naviqasiya','Avtopilot','Xilasetmə avadanlığı'],aircraft:['Kredit','Barter','Uçuşa yararlılıq sertifikatı','Texniki baxış','Avtopilot'],agriculture:['Kredit','Barter','Lizinq','4x4','Kabin','Kondisioner'],construction:['Kredit','Barter','Lizinq','Servis tarixçəsi','Zəmanət'],commercial:['Kredit','Barter','Lizinq','Gömrük sənədi','Soyuducu','Taxoqraf'],caravan:['Kredit','Barter','Lizinq','Duş','Mətbəx','Kondisioner','Günəş paneli']};
const SPEC_FIELDS = {"motorcycle": ["engine_cc", "engine_power_kw", "mileage_km"], "watercraft": ["length_m", "beam_m", "operating_hours", "engine_power_kw", "cabin_count", "passenger_capacity"], "aircraft": ["flight_hours", "operating_hours", "seat_capacity", "flight_range_km", "engine_power_kw", "max_takeoff_weight_kg"], "agriculture": ["operating_hours", "engine_power_kw", "working_width_m", "load_capacity_kg"], "construction": ["operating_hours", "engine_power_kw", "operating_weight_kg", "lifting_capacity_kg", "bucket_capacity_m3"], "commercial": ["mileage_km", "axle_count", "load_capacity_kg", "gross_weight_kg", "cargo_volume_m3"], "caravan": ["sleeping_capacity", "length_m", "gross_weight_kg", "mileage_km"]};
const SPEC_LABELS = {"engine_cc": ["Mühərrik həcmi (sm³)", "Engine displacement (cc)", "Объём двигателя (см³)", "Motor hacmi (cm³)", "ძრავის მოცულობა (სმ³)"], "engine_power_kw": ["Güc (kW)", "Power (kW)", "Мощность (кВт)", "Güç (kW)", "სიმძლავრე (კვტ)"], "mileage_km": ["Yürüş (km)", "Mileage (km)", "Пробег (км)", "Kilometre (km)", "გარბენი (კმ)"], "operating_hours": ["İş saatı", "Operating hours", "Моточасы", "Çalışma saati", "მუშაობის საათები"], "length_m": ["Uzunluq (m)", "Length (m)", "Длина (м)", "Uzunluk (m)", "სიგრძე (მ)"], "beam_m": ["En (m)", "Beam (m)", "Ширина (м)", "Genişlik (m)", "სიგანე (მ)"], "cabin_count": ["Kabin sayı", "Cabins", "Число кают", "Kabin sayısı", "კაიუტების რაოდენობა"], "passenger_capacity": ["Sərnişin tutumu", "Passenger capacity", "Вместимость пассажиров", "Yolcu kapasitesi", "მგზავრთა ტევადობა"], "flight_hours": ["Uçuş saatı", "Flight hours", "Лётные часы", "Uçuş saati", "ფრენის საათები"], "seat_capacity": ["Oturacaq sayı", "Seats", "Число мест", "Koltuk sayısı", "ადგილების რაოდენობა"], "flight_range_km": ["Uçuş məsafəsi (km)", "Flight range (km)", "Дальность полёта (км)", "Uçuş menzili (km)", "ფრენის მანძილი (კმ)"], "max_takeoff_weight_kg": ["Maksimal qalxma çəkisi (kq)", "Max takeoff weight (kg)", "Макс. взлётная масса (кг)", "Azami kalkış ağırlığı (kg)", "აფრენის მაქსიმალური წონა (კგ)"], "working_width_m": ["İş eni (m)", "Working width (m)", "Рабочая ширина (м)", "Çalışma genişliği (m)", "სამუშაო სიგანე (მ)"], "load_capacity_kg": ["Yük tutumu (kq)", "Payload (kg)", "Грузоподъёмность (кг)", "Yük kapasitesi (kg)", "ტვირთამწეობა (კგ)"], "operating_weight_kg": ["İş çəkisi (kq)", "Operating weight (kg)", "Эксплуатационная масса (кг)", "Çalışma ağırlığı (kg)", "სამუშაო წონა (კგ)"], "lifting_capacity_kg": ["Qaldırma qabiliyyəti (kq)", "Lifting capacity (kg)", "Подъёмная способность (кг)", "Kaldırma kapasitesi (kg)", "აწევის ტევადობა (კგ)"], "bucket_capacity_m3": ["Çömçə həcmi (m³)", "Bucket capacity (m³)", "Объём ковша (м³)", "Kova hacmi (m³)", "ციცხვის მოცულობა (მ³)"], "axle_count": ["Ox sayı", "Axles", "Число осей", "Aks sayısı", "ღერძების რაოდენობა"], "gross_weight_kg": ["Ümumi çəki (kq)", "Gross weight (kg)", "Полная масса (кг)", "Toplam ağırlık (kg)", "სრული წონა (კგ)"], "cargo_volume_m3": ["Yük həcmi (m³)", "Cargo volume (m³)", "Объём груза (м³)", "Yük hacmi (m³)", "ტვირთის მოცულობა (მ³)"], "sleeping_capacity": ["Yataq sayı", "Berths", "Спальные места", "Yatak sayısı", "საძილე ადგილები"]};

const vehicleLanguageIndex = lang => Math.max(0, ['az', 'en', 'ru', 'tr', 'ka'].indexOf(lang));
const engineHours = ['Mühərrik saatı', 'Engine hours', 'Часы двигателя', 'Motor saati', 'ძრავის საათები'];
const specLabel = (key, category, lang) => (key === 'operating_hours' && ['watercraft', 'aircraft'].includes(category)
  ? engineHours : SPEC_LABELS[key])[vehicleLanguageIndex(lang)];
const specApplicable = (category, type, key) => {
  if (!type) return true;
  if (key === 'mileage_km' && category === 'caravan') return type !== 'Karavan';
  if (key === 'mileage_km' && category === 'commercial') return type !== 'Qoşqu';
  if (key === 'bucket_capacity_m3' && category === 'construction') return ['Ekskavator','Yükləyici'].includes(type);
  if (key === 'lifting_capacity_kg' && category === 'construction') return ['Kran','Avtokran','Yükləyici'].includes(type);
  return true;
};
let brandLogoPromise;
function loadBrandLogos() {
  return brandLogoPromise ||= fetch('assets/data/brand-logo-manifest.json')
    .then(response => response.ok ? response.json() : null)
    .then(data => Object.fromEntries(Object.entries(data?.categories || {}).map(([category, logos]) => {
      const mapped = {...logos};
      for (const [alias, name] of Object.entries(AVTOVIP_CANONICAL_BRANDS[category] || {})) {
        if (!mapped[name] && logos[alias]) mapped[name] = logos[alias];
      }
      return [category,mapped];
    }))).catch(() => ({}));
}

  window.AvtoVIPInternational={loadUnifiedCatalog,loadBrandLogos,SPEC_FIELDS,specLabel,specApplicable,CATEGORY_TYPES,CATEGORY_EXTRAS,featureLabel:(value,lang)=>FEATURE_LABELS[lang]?.[value]||value,typeLabel:(value,lang)=>extraTypeLabels[value]?.[lang]||CATEGORY_TYPE_LABELS[lang]?.[value]||value,GEO_BASE,VEHICLE_BASE,VEHICLE_INDEX_URL,LOCAL_VEHICLE_MAKES,LOCAL_VEHICLE_MODELS,BLOCKED_COUNTRIES,BLOCKED_CURRENCIES,countries,countryHierarchy,cities,makes,models,locale,collator,sortByName,countryName,formatMoney,currencyForCountry,slug};
})();
