/* AvtoVİP.az — international data layer
   Lazy country/city/vehicle data, localized country labels, deterministic sorting.
   Marketplace availability is intentionally configurable per country. */
(() => {
  'use strict';

  const GEO_BASE = 'https://cdn.jsdelivr.net/gh/srestre/world-countries-cities-db@main';
  const VEHICLE_BASE = 'https://cdn.jsdelivr.net/gh/milpa-cloud/open-vehicle-db@main/data';
  const BLOCKED_COUNTRIES = new Set(['AM']);
  const BLOCKED_CURRENCIES = new Set(['AMD']);
  const cache = new Map();

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

  const FALLBACK_MAKES = ['Audi','BMW','BYD','Changan','Chery','Chevrolet','Ford','Honda','Hyundai','Infiniti','Jeep','Kia','Lada/VAZ','Land Rover','Lexus','Mazda','Mercedes-Benz','Mitsubishi','Nissan','Opel','Porsche','Renault','Tesla','Toyota','Volkswagen','Volvo'];

  /* Azerbaijan override: the external generic geo dataset does not model the country's
     administrative hierarchy consistently enough for marketplace filters. This list is
     maintained explicitly and includes rayons/cities users actually select. */
  const AZ_ADMIN = [
    'Abşeron rayonu','Ağcabədi rayonu','Ağdam rayonu','Ağdaş rayonu','Ağstafa rayonu','Ağsu rayonu','Astara rayonu','Babək rayonu','Balakən rayonu','Bərdə rayonu','Beyləqan rayonu','Biləsuvar rayonu','Cəbrayıl rayonu','Cəlilabad rayonu','Daşkəsən rayonu','Füzuli rayonu','Gədəbəy rayonu','Goranboy rayonu','Göyçay rayonu','Göygöl rayonu','Hacıqabul rayonu','Xaçmaz rayonu','Xızı rayonu','Xocalı rayonu','Xocavənd rayonu','İmişli rayonu','İsmayıllı rayonu','Kəlbəcər rayonu','Kəngərli rayonu','Kürdəmir rayonu','Qax rayonu','Qazax rayonu','Qəbələ rayonu','Qobustan rayonu','Quba rayonu','Qubadlı rayonu','Qusar rayonu','Laçın rayonu','Lənkəran rayonu','Lerik rayonu','Masallı rayonu','Neftçala rayonu','Oğuz rayonu','Ordubad rayonu','Saatlı rayonu','Sabirabad rayonu','Sədərək rayonu','Salyan rayonu','Samux rayonu','Siyəzən rayonu','Şabran rayonu','Şahbuz rayonu','Şamaxı rayonu','Şəmkir rayonu','Şərur rayonu','Şuşa rayonu','Tərtər rayonu','Tovuz rayonu','Ucar rayonu','Yardımlı rayonu','Yevlax rayonu','Zaqatala rayonu','Zəngilan rayonu','Zərdab rayonu',
    'Bakı şəhəri','Gəncə şəhəri','Lənkəran şəhəri','Mingəçevir şəhəri','Naftalan şəhəri','Naxçıvan şəhəri','Şəki şəhəri','Şirvan şəhəri','Sumqayıt şəhəri','Yevlax şəhəri'
  ];

  const AZ_MAIN_CITY = Object.fromEntries(AZ_ADMIN.map(name => {
    const city = name.replace(/\s+(rayonu|şəhəri)$/u, '');
    return [name, [city]];
  }));
  AZ_MAIN_CITY['Bakı şəhəri'] = ['Bakı'];
  AZ_MAIN_CITY['Abşeron rayonu'] = ['Xırdalan'];
  AZ_MAIN_CITY['Naxçıvan şəhəri'] = ['Naxçıvan'];

  async function json(url, key) {
    if (cache.has(key)) return cache.get(key);
    try {
      const r = await fetch(url, {cache:'force-cache'});
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      cache.set(key, data);
      return data;
    } catch (err) {
      console.warn('[AvtoVIP data]', key, err);
      return null;
    }
  }

  function locale(lang='en') {
    return ({az:'az-AZ',en:'en-US',ru:'ru-RU',tr:'tr-TR',ka:'ka-GE'})[lang] || 'en-US';
  }

  function collator(lang='en') {
    return new Intl.Collator(locale(lang), {numeric:true, sensitivity:'base', usage:'sort'});
  }

  function sortByName(items, lang='en', getter=x=>x?.name||'') {
    const c = collator(lang);
    return [...items].sort((a,b)=>c.compare(getter(a), getter(b)));
  }

  function countryName(iso2, lang='en', fallback='') {
    try {
      const dn = new Intl.DisplayNames([locale(lang)], {type:'region'});
      return dn.of(String(iso2||'').toUpperCase()) || fallback;
    } catch { return fallback; }
  }

  async function countries(lang='en') {
    const data = await json(`${GEO_BASE}/metadata/countries.json`, 'countries');
    const arr = Array.isArray(data) ? data : (data?.countries || []);
    const out = (arr.length ? arr : FALLBACK_COUNTRIES).map(c => {
      const iso2 = String(c.iso2 || c.iso_2 || '').toUpperCase();
      return {
        iso2,
        iso3:c.iso3 || '',
        name:c.name || '',
        native:c.native || c.name || '',
        displayName:countryName(iso2, lang, c.native || c.name || iso2),
        currency:c.currency || 'USD',
        currencyName:c.currency_name || '',
        currencySymbol:c.currency_symbol || '',
        emoji:c.emoji || ''
      };
    }).filter(c => c.iso2 && c.name && !BLOCKED_COUNTRIES.has(c.iso2) && !BLOCKED_CURRENCIES.has(c.currency));
    return sortByName(out, lang, x=>x.displayName);
  }

  function azHierarchy() {
    return {
      country:{iso2:'AZ', name:'Azərbaycan'},
      states: AZ_ADMIN.map(name => ({name, native:name, cities:(AZ_MAIN_CITY[name]||[]).map(city=>({name:city}))}))
    };
  }

  async function countryHierarchy(iso2, lang='en') {
    iso2 = String(iso2||'').toUpperCase();
    if (!iso2 || BLOCKED_COUNTRIES.has(iso2)) return null;
    if (iso2 === 'AZ') {
      const h = azHierarchy();
      h.states = sortByName(h.states, lang);
      return h;
    }
    const data = await json(`${GEO_BASE}/countries/${iso2}.json`, `country:${iso2}`);
    const c = Array.isArray(data) ? data[0] : data;
    if (!c) return null;
    const states = (Array.isArray(c.states) ? c.states : []).map(st => ({
      ...st,
      name:String(st.name || st.native || '').trim(),
      native:String(st.native || st.name || '').trim(),
      cities:sortByName((Array.isArray(st.cities)?st.cities:[]).map(city=>typeof city==='string'?{name:city}:city).filter(x=>x?.name), lang)
    })).filter(st=>st.name);
    return {country:c, states:sortByName(states, lang)};
  }

  async function cities(iso2, lang='en') {
    iso2 = String(iso2||'').toUpperCase();
    if (!iso2 || BLOCKED_COUNTRIES.has(iso2)) return [];
    if (iso2 === 'AZ') {
      const names = [...new Set(Object.values(AZ_MAIN_CITY).flat())].map(name=>({name}));
      return sortByName(names, lang).map(x=>x.name);
    }
    const data = await json(`${GEO_BASE}/flat-cities/${iso2}.json`, `cities:${iso2}`);
    const arr = Array.isArray(data) ? data : [];
    const names = arr.map(x=>typeof x==='string'?x:x?.name).filter(Boolean);
    return sortByName([...new Set(names)].map(name=>({name})), lang).map(x=>x.name);
  }

  async function makes(lang='en') {
    const data = await json(`${VEHICLE_BASE}/makes.json`, 'vehicle:makes');
    const arr = Array.isArray(data) && data.length
      ? data.map(m=>({id:m.id||m.slug||String(m.name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-'),name:m.name})).filter(x=>x.name)
      : FALLBACK_MAKES.map(name=>({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name}));
    return sortByName(arr, lang);
  }

  async function models(makeId, lang='en') {
    if (!makeId) return [];
    const data = await json(`${VEHICLE_BASE}/models/${encodeURIComponent(makeId)}.json`, `vehicle:models:${makeId}`);
    const arr = Array.isArray(data) ? data : (data?.models || []);
    const out = arr.map(m=>({id:m.id||m.slug||m.name,name:m.name,from:m.production?.from||m.year_start||null,to:m.production?.to||m.year_end||null,type:m.type||''})).filter(x=>x.name);
    return sortByName(out, lang);
  }

  function formatMoney(value, currency='USD', lang='en') {
    if (BLOCKED_CURRENCIES.has(currency)) currency='USD';
    try {
      return new Intl.NumberFormat(locale(lang), {style:'currency',currency,maximumFractionDigits:0}).format(Number(value||0));
    } catch {
      return `${Number(value||0).toLocaleString(locale(lang))} ${currency}`;
    }
  }

  function currencyForCountry(list, iso2) {
    if (BLOCKED_COUNTRIES.has(String(iso2||'').toUpperCase())) return 'USD';
    const cur = list.find(c=>c.iso2===iso2)?.currency || 'USD';
    return BLOCKED_CURRENCIES.has(cur) ? 'USD' : cur;
  }

  window.AvtoVIPInternational = {
    GEO_BASE, VEHICLE_BASE, BLOCKED_COUNTRIES, BLOCKED_CURRENCIES,
    countries, countryHierarchy, cities, makes, models,
    locale, collator, sortByName, countryName, formatMoney, currencyForCountry
  };
})();
