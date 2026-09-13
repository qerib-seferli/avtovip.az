/* AvtoVİP.az — international data layer (lazy, cacheable, no paid API) */
(() => {
  'use strict';
  const GEO_BASE = 'https://cdn.jsdelivr.net/gh/srestre/world-countries-cities-db@main';
  const VEHICLE_BASE = 'https://cdn.jsdelivr.net/gh/milpa-cloud/open-vehicle-db@main/data';
  const FALLBACK_COUNTRIES = [
    {iso2:'AZ',name:'Azerbaijan',native:'Azərbaycan',currency:'AZN',currency_symbol:'₼',emoji:'🇦🇿'},
    {iso2:'GE',name:'Georgia',native:'საქართველო',currency:'GEL',currency_symbol:'₾',emoji:'🇬🇪'},
    {iso2:'TR',name:'Türkiye',native:'Türkiye',currency:'TRY',currency_symbol:'₺',emoji:'🇹🇷'},
    {iso2:'RU',name:'Russia',native:'Россия',currency:'RUB',currency_symbol:'₽',emoji:'🇷🇺'},
    {iso2:'US',name:'United States',native:'United States',currency:'USD',currency_symbol:'$',emoji:'🇺🇸'},
    {iso2:'DE',name:'Germany',native:'Deutschland',currency:'EUR',currency_symbol:'€',emoji:'🇩🇪'},
    {iso2:'CN',name:'China',native:'中国',currency:'CNY',currency_symbol:'¥',emoji:'🇨🇳'},
    {iso2:'KR',name:'South Korea',native:'대한민국',currency:'KRW',currency_symbol:'₩',emoji:'🇰🇷'},
    {iso2:'AE',name:'United Arab Emirates',native:'الإمارات العربية المتحدة',currency:'AED',currency_symbol:'د.إ',emoji:'🇦🇪'}
  ];
  const FALLBACK_MAKES = ['Audi','BMW','BYD','Changan','Chery','Chevrolet','Ford','Honda','Hyundai','Infiniti','Jeep','Kia','Lada/VAZ','Land Rover','Lexus','Mazda','Mercedes-Benz','Mitsubishi','Nissan','Opel','Porsche','Renault','Tesla','Toyota','Volkswagen','Volvo'];
  const cache = new Map();
  async function json(url,key){
    if(cache.has(key)) return cache.get(key);
    try{
      const r=await fetch(url,{cache:'force-cache'}); if(!r.ok) throw new Error(String(r.status));
      const data=await r.json(); cache.set(key,data); return data;
    }catch(err){ console.warn('[AvtoVIP data]',key,err); return null; }
  }
  async function countries(){
    const data=await json(`${GEO_BASE}/metadata/countries.json`,'countries');
    const arr=Array.isArray(data)?data:(data?.countries||[]);
    return (arr.length?arr:FALLBACK_COUNTRIES).map(c=>({
      iso2:String(c.iso2||c.iso_2||'').toUpperCase(), iso3:c.iso3||'', name:c.name||'', native:c.native||c.name||'',
      currency:c.currency||'USD', currencyName:c.currency_name||'', currencySymbol:c.currency_symbol||'', emoji:c.emoji||''
    })).filter(c=>c.iso2&&c.name).sort((a,b)=>a.name.localeCompare(b.name,'en'));
  }
  async function countryHierarchy(iso2){
    if(!iso2) return null; const data=await json(`${GEO_BASE}/countries/${iso2.toUpperCase()}.json`,`country:${iso2}`);
    const c=Array.isArray(data)?data[0]:data; if(!c) return null;
    return {country:c,states:Array.isArray(c.states)?c.states:[]};
  }
  async function cities(iso2){
    if(!iso2) return []; const data=await json(`${GEO_BASE}/flat-cities/${iso2.toUpperCase()}.json`,`cities:${iso2}`);
    return Array.isArray(data)?data:[];
  }
  async function makes(){
    const data=await json(`${VEHICLE_BASE}/makes.json`,'vehicle:makes');
    if(Array.isArray(data)&&data.length) return data.map(m=>({id:m.id||m.slug||String(m.name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-'),name:m.name})).filter(x=>x.name).sort((a,b)=>a.name.localeCompare(b.name));
    return FALLBACK_MAKES.map(name=>({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name}));
  }
  async function models(makeId){
    if(!makeId) return []; const data=await json(`${VEHICLE_BASE}/models/${encodeURIComponent(makeId)}.json`,`vehicle:models:${makeId}`);
    const arr=Array.isArray(data)?data:(data?.models||[]); return arr.map(m=>({id:m.id||m.slug||m.name,name:m.name,from:m.production?.from||m.year_start||null,to:m.production?.to||m.year_end||null,type:m.type||''})).filter(x=>x.name).sort((a,b)=>a.name.localeCompare(b.name));
  }
  function locale(lang){return ({az:'az-AZ',en:'en-US',ru:'ru-RU',tr:'tr-TR',ka:'ka-GE'})[lang]||'en-US'}
  function formatMoney(value,currency='USD',lang='en'){
    try{return new Intl.NumberFormat(locale(lang),{style:'currency',currency,maximumFractionDigits:0}).format(Number(value||0))}catch{return `${Number(value||0).toLocaleString(locale(lang))} ${currency}`}
  }
  function currencyForCountry(list,iso2){return list.find(c=>c.iso2===iso2)?.currency||'USD'}
  window.AvtoVIPInternational={GEO_BASE,VEHICLE_BASE,countries,countryHierarchy,cities,makes,models,locale,formatMoney,currencyForCountry};
})();
