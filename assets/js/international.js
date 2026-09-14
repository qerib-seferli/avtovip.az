/* AvtoVIP — international data layer v4
   Multi-source vehicle catalog + resilient caching + localized geo data.
   Remote sources are additive. A local core catalog always remains available. */
(() => {
  'use strict';

  const GEO_BASE = 'https://cdn.jsdelivr.net/gh/srestre/world-countries-cities-db@main';
  const VEHICLE_BASE = ''; // vehicle katalogu local snapshot-first işləyir
  const VEHICLE_INDEX_URL = ''; // local vehicle-models.csv is the authoritative runtime snapshot
  const LOCAL_VEHICLE_MAKES = 'assets/data/vehicle-makes.json';
  const LOCAL_VEHICLE_MODELS = 'assets/data/vehicle-models.csv';
  const BLOCKED_COUNTRIES = new Set(['AM']);
  const BLOCKED_CURRENCIES = new Set(['AMD']);
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

  const CORE_MODELS = {
    'audi':['A1','A3','A4','A5','A6','A7','A8','Q2','Q3','Q4 e-tron','Q5','Q6 e-tron','Q7','Q8','e-tron GT','TT','R8','RS 3','RS 4','RS 5','RS 6','RS 7','RS Q8','S3','S4','S5','S6','S7','S8','SQ5','SQ7','SQ8'],
    'bmw':['1 Series','2 Series','3 Series','4 Series','5 Series','6 Series','7 Series','8 Series','i3','i4','i5','i7','i8','iX','M2','M3','M4','M5','M8','X1','X2','X3','X4','X5','X6','X7','XM','Z3','Z4'],
    'mercedes-benz':['A-Class','B-Class','C-Class','CLA','CLE','CLS','E-Class','S-Class','G-Class','GLA','GLB','GLC','GLE','GLS','AMG GT','EQA','EQB','EQC','EQE','EQS','V-Class','Vito','Sprinter'],
    'toyota':['4Runner','Alphard','Avalon','Avensis','C-HR','Camry','Corolla','Corolla Cross','Crown','Fortuner','GR86','Hiace','Highlander','Hilux','Land Cruiser','Land Cruiser Prado','Mirai','Prius','RAV4','Sequoia','Sienna','Supra','Tacoma','Tundra','Venza','Yaris','Yaris Cross'],
    'lexus':['CT','ES','GS','GX','IS','LC','LM','LS','LX','NX','RC','RX','RZ','TX','UX'],
    'nissan':['350Z','370Z','Almera','Altima','Ariya','Armada','Frontier','GT-R','Juke','Kicks','Leaf','Maxima','Micra','Murano','Navara','Note','Pathfinder','Patrol','Qashqai','Rogue','Sentra','Skyline','Sunny','Teana','Terrano','Titan','X-Trail','Z'],
    'honda':['Accord','Civic','City','Clarity','CR-V','CR-Z','e','Element','Fit/Jazz','HR-V','Insight','Odyssey','Passport','Pilot','Prelude','Ridgeline','S2000'],
    'hyundai':['Accent','Azera/Grandeur','Bayon','Creta','Elantra','Equus','Genesis','i10','i20','i30','Ioniq','Ioniq 5','Ioniq 6','Kona','Palisade','Santa Fe','Sonata','Staria','Tucson','Veloster','Venue'],
    'kia':['Carnival','Carens','Ceed','Cerato/Forte','EV3','EV5','EV6','EV9','K5','K8','K9','Niro','Optima','Picanto','Rio','Seltos','Sorento','Soul','Sportage','Stinger','Telluride'],
    'volkswagen':['Amarok','Arteon','Atlas','Beetle','Bora','Caddy','Crafter','Golf','ID.3','ID.4','ID.5','ID.7','Jetta','Multivan','Passat','Phaeton','Polo','Scirocco','Taos','T-Cross','T-Roc','Tiguan','Touareg','Touran','Transporter'],
    'ford':['Bronco','Bronco Sport','Edge','Escape','Everest','Expedition','Explorer','F-150','Fiesta','Focus','Fusion','Galaxy','Kuga','Maverick','Mondeo','Mustang','Mustang Mach-E','Puma','Ranger','S-Max','Transit'],
    'chevrolet':['Aveo','Blazer','Bolt','Camaro','Captiva','Colorado','Corvette','Cruze','Equinox','Impala','Malibu','Niva','Onix','Orlando','Silverado','Spark','Suburban','Tahoe','Tracker','Trailblazer','Traverse','Trax'],
    'porsche':['718 Boxster','718 Cayman','911','Cayenne','Macan','Panamera','Taycan'],
    'land-rover':['Defender','Discovery','Discovery Sport','Freelander','Range Rover','Range Rover Evoque','Range Rover Sport','Range Rover Velar'],
    'mazda':['2','3','5','6','CX-3','CX-30','CX-5','CX-50','CX-60','CX-70','CX-80','CX-90','MX-5','MX-30','RX-7','RX-8'],
    'mitsubishi':['ASX','Colt','Eclipse','Eclipse Cross','Galant','L200','Lancer','Mirage','Montero','Outlander','Pajero','Pajero Sport','Xpander'],
    'renault':['Arkana','Austral','Captur','Clio','Duster','Espace','Fluence','Kadjar','Kangoo','Koleos','Laguna','Megane','Rafale','Scenic','Symbol','Talisman','Trafic','Zoe'],
    'opel':['Adam','Astra','Corsa','Crossland','Frontera','Grandland','Insignia','Mokka','Omega','Signum','Vectra','Vivaro','Zafira'],
    'volvo':['C30','C40','EX30','EX40','EX90','S40','S60','S80','S90','V40','V50','V60','V70','V90','XC40','XC60','XC70','XC90'],
    'tesla':['Cybertruck','Model 3','Model S','Model X','Model Y','Roadster'],
    'byd':['Atto 3','Dolphin','Han','Qin Plus','Seal','Seal U','Seagull','Song Plus','Tang','Yuan Plus'],
    'changan':['Alsvin','CS15','CS35 Plus','CS55 Plus','CS75 Plus','CS85 Coupe','CS95','Deepal S07','Eado','Hunter','UNI-K','UNI-T','UNI-V'],
    'chery':['Arrizo 5','Arrizo 8','eQ1','Exeed TXL','Omoda 5','Tiggo 2','Tiggo 4','Tiggo 7','Tiggo 8','Tiggo 9'],
    'geely':['Atlas','Coolray','Emgrand','Galaxy E5','Monjaro','Okavango','Preface','Tugella'],
    'infiniti':['EX','FX','G','JX','M','Q30','Q50','Q60','Q70','QX30','QX50','QX55','QX60','QX70','QX80'],
    'jeep':['Avenger','Cherokee','Commander','Compass','Gladiator','Grand Cherokee','Renegade','Wagoneer','Wrangler'],
    'lada-vaz':['2101','2104','2105','2106','2107','2108','2109','21099','2110','2111','2112','2113','2114','2115','Granta','Kalina','Largus','Niva','Priora','Vesta','XRAY'],
    'skoda':['Enyaq','Fabia','Kamiq','Karoq','Kodiaq','Octavia','Rapid','Scala','Superb','Yeti'],
    'peugeot':['2008','208','3008','308','408','5008','508','Partner','Rifter','Traveller'],
    'citroen':['Berlingo','C3','C3 Aircross','C4','C4 X','C5 Aircross','C5 X','Jumpy','SpaceTourer'],
    'fiat':['500','500X','600','Doblo','Ducato','Panda','Punto','Tipo'],
    'subaru':['Ascent','BRZ','Crosstrek','Forester','Impreza','Legacy','Outback','Solterra','WRX','XV'],
    'suzuki':['Across','Alto','Baleno','Grand Vitara','Ignis','Jimny','S-Cross','Swift','Vitara'],
    'isuzu':['D-Max','MU-X'],
    'gmc':['Acadia','Canyon','Hummer EV','Sierra','Terrain','Yukon'],
    'cadillac':['CT4','CT5','CT6','Escalade','Lyriq','Optiq','XT4','XT5','XT6'],
    'lincoln':['Aviator','Corsair','MKC','MKX','MKZ','Nautilus','Navigator'],
    'jaguar':['E-Pace','F-Pace','F-Type','I-Pace','XE','XF','XJ','XK'],
    'mini':['Clubman','Cooper','Countryman','Paceman'],
    'alfa-romeo':['4C','Giulia','Giulietta','Stelvio','Tonale'],
    'maserati':['Ghibli','GranCabrio','GranTurismo','Grecale','Levante','MC20','Quattroporte'],
    'bentley':['Bentayga','Continental GT','Flying Spur','Mulsanne'],
    'aston-martin':['DB11','DB12','DBS','DBX','Rapide','Vanquish','Vantage'],
    'ferrari':['296 GTB','488','812','F8 Tributo','Purosangue','Roma','SF90'],
    'lamborghini':['Aventador','Gallardo','Huracan','Revuelto','Urus'],
    'rolls-royce':['Cullinan','Dawn','Ghost','Phantom','Spectre','Wraith']
  };

  const FALLBACK_MAKES = Object.keys(CORE_MODELS).map(id => ({
    id,
    name: ({
      'mercedes-benz':'Mercedes-Benz','lada-vaz':'Lada/VAZ','land-rover':'Land Rover',
      'alfa-romeo':'Alfa Romeo','rolls-royce':'Rolls-Royce','aston-martin':'Aston Martin',
      'great-wall':'Great Wall','gac-motor':'GAC','hongqi':'Hongqi'
    }[id]) || id.split('-').map(x=>x==='bmw'||x==='byd'||x==='gmc'?x.toUpperCase():x.charAt(0).toUpperCase()+x.slice(1)).join(' ')
  }));
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
  let modelIndex=null;
  async function loadModelIndex(){
    if(modelIndex)return modelIndex;
    const csv=await localFirstText(LOCAL_VEHICLE_MODELS,VEHICLE_INDEX_URL,'vehicle:model-index'); const map=new Map();
    if(csv){
      const lines=csv.split(/\r?\n/).slice(1);
      for(const line of lines){if(!line)continue;const m=line.match(/^([^,]+),([^,]+),(?:"([^"]*(?:""[^"]*)*)"|([^,]*)),/);if(!m)continue;const make=indexSlug(m[1]);const name=(m[3]||m[4]||'').replace(/""/g,'"').trim();if(!name)continue;if(!map.has(make))map.set(make,[]);map.get(make).push(name)}
    }
    modelIndex=map; return map;
  }
  async function makes(lang='en'){
    let data=null; try{const r=await fetch(LOCAL_VEHICLE_MAKES,{cache:'no-cache'});if(r.ok)data=await r.json()}catch{} const arr=Array.isArray(data)?data:[];
    const merged=new Map();
    for(const m of FALLBACK_MAKES)merged.set(slug(m.id),{id:slug(m.id),name:m.name,logo:null});
    for(const m of arr){if(!m?.name)continue;merged.set(slug(m.id||m.name),{id:slug(m.id||m.name),name:m.name,country:m.country||'',logo:(m.logo?.local_url||m.logo?.url||m.logo||null),aliases:m.aliases||[]})}
    const idx=await loadModelIndex(); for(const key of idx.keys()){const id=slug(key);if(!merged.has(id)){const name=key.split('_').map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' ');merged.set(id,{id,name,logo:null})}}
    return sortByName([...merged.values()],lang)
  }
  async function models(makeId,lang='en'){
    if(!makeId)return[]; const id=slug(makeId); const names=new Set();
    const local=CORE_MODELS[id]||CORE_MODELS[id.replace(/-benz$/,'-benz')]||[];local.forEach(x=>names.add(x));
    const idx=await loadModelIndex(); const keys=[indexSlug(id),indexSlug(id.replace('mercedes-benz','mercedes_benz')),indexSlug(id.replace('lada-vaz','lada'))];
    for(const k of keys)(idx.get(k)||[]).forEach(x=>names.add(x));
    return sortByName([...names].map(name=>({id:slug(name),name})),lang)
  }
  function formatMoney(value,currency='USD',lang='en'){if(BLOCKED_CURRENCIES.has(currency))currency='USD';try{return new Intl.NumberFormat(locale(lang),{style:'currency',currency,maximumFractionDigits:0}).format(Number(value||0))}catch{return `${Number(value||0).toLocaleString(locale(lang))} ${currency}`}}
  function currencyForCountry(list,iso2){if(BLOCKED_COUNTRIES.has(String(iso2||'').toUpperCase()))return'USD';const cur=list.find(c=>c.iso2===iso2)?.currency||'USD';return BLOCKED_CURRENCIES.has(cur)?'USD':cur}

  window.AvtoVIPInternational={GEO_BASE,VEHICLE_BASE,VEHICLE_INDEX_URL,LOCAL_VEHICLE_MAKES,LOCAL_VEHICLE_MODELS,BLOCKED_COUNTRIES,BLOCKED_CURRENCIES,countries,countryHierarchy,cities,makes,models,locale,collator,sortByName,countryName,formatMoney,currencyForCountry,slug};
})();
