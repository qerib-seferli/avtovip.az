/* AvtoVIP — international data layer v4
   Multi-source vehicle catalog + resilient caching + localized geo data.
   Remote sources are additive. A local core catalog always remains available. */
(() => {
  'use strict';

  const GEO_BASE = 'https://cdn.jsdelivr.net/gh/srestre/world-countries-cities-db@main';
  const VEHICLE_BASE = ''; // vehicle katalogu local snapshot-first işləyir
  const VEHICLE_INDEX_URL = ''; // legacy API field retained for compatibility
  const UNIFIED_CATALOG_URL = 'assets/data/avtovip-unified-catalog.json?v=20261115b';
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
  let unifiedCatalogPromise=null;
  function loadUnifiedCatalog(){
    if(!unifiedCatalogPromise){
      unifiedCatalogPromise=fetch(UNIFIED_CATALOG_URL,{cache:'force-cache'})
        .then(r=>{if(!r.ok)throw new Error('Unified catalog HTTP '+r.status);return r.json()})
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
    const idx=await loadModelIndex(); for(const key of idx.keys()){const id=slug(key);if(!merged.has(id)){const name=key.split('_').map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' ');merged.set(id,{id,name,logo:null})}}
    return sortByName([...merged.values()],lang)
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

  window.AvtoVIPInternational={GEO_BASE,VEHICLE_BASE,VEHICLE_INDEX_URL,LOCAL_VEHICLE_MAKES,LOCAL_VEHICLE_MODELS,BLOCKED_COUNTRIES,BLOCKED_CURRENCIES,countries,countryHierarchy,cities,makes,models,locale,collator,sortByName,countryName,formatMoney,currencyForCountry,slug};
})();
