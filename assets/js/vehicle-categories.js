/* Category-only frontend; live non-car listings require Supabase migration. */
(()=>{'use strict';
const rail=document.getElementById('vehicleCategoryRail');if(!rail)return;
const DATA=[{"id": "car", "name": "Avtomobil", "image": "car.png", "brands": []}, {"id": "motorcycle", "name": "Motosiklet", "image": "motorcycle.png", "brands": []}, {"id": "watercraft", "name": "Su nəqliyyatı", "image": "watercraft.png", "brands": []}, {"id": "aircraft", "name": "Hava nəqliyyatı", "image": "aircraft.png", "brands": []}, {"id": "agriculture", "name": "Kənd təsərrüfatı", "image": "agriculture.png", "brands": []}, {"id": "construction", "name": "İnşaat texnikası", "image": "construction.png", "brands": []}, {"id": "commercial", "name": "Kommersiya", "image": "commercial.png", "brands": []}, {"id": "caravan", "name": "Karavan və digər", "image": "caravan-other.png", "brands": []}];
const LANG={
az:{categories:'Kateqoriyalar',brands:'Markalar',search:'Axtarış',advanced:'Ətraflı',type:'Növ',make:'Marka',model:'Model',country:'Ölkə',city:'Şəhər',priceMin:'Qiymət min',priceMax:'Qiymət max',yearMin:'İl min',yearMax:'İl max',condition:'Vəziyyət',all:'Hamısı',reset:'Sıfırla',noResults:'Elanlar yüklənir...',last:'Son elanlar',vip:'VIP',select:'Seçin',new:'Yeni',used:'İşlənmiş',fields:{motorcycle:['Motosiklet növü','Mühərrik (cc)','Yürüş (km)','ABS'],watercraft:['Gəmi növü','Uzunluq (m)','Mühərrik saatı','Kabin sayı'],aircraft:['Uçuş aparatı növü','Uçuş saatı','Sərnişin sayı','Uçuş məsafəsi (km)'],agriculture:['Texnika növü','İş saatı','Mühərrik gücü (hp)','İş eni (m)'],construction:['Texnika növü','İş saatı','İş çəkisi (t)','Qaldırma gücü (t)'],commercial:['Nəqliyyat növü','Yük tutumu (t)','Ox sayı','Yürüş (km)'],caravan:['Nəqliyyat növü','Yataq sayı','Uzunluq (m)','Yürüş (km)']}},
en:{categories:'Categories',brands:'Brands',search:'Search',advanced:'Advanced',type:'Type',make:'Make',model:'Model',country:'Country',city:'City',priceMin:'Min price',priceMax:'Max price',yearMin:'Min year',yearMax:'Max year',condition:'Condition',all:'All',reset:'Reset',noResults:'Loading listings...',last:'Latest listings',vip:'VIP',select:'Select',new:'New',used:'Used',fields:{motorcycle:['Motorcycle type','Engine (cc)','Mileage (km)','ABS'],watercraft:['Vessel type','Length (m)','Engine hours','Cabins'],aircraft:['Aircraft type','Flight hours','Passenger capacity','Range (km)'],agriculture:['Equipment type','Operating hours','Power (hp)','Working width (m)'],construction:['Equipment type','Operating hours','Weight (t)','Lifting capacity (t)'],commercial:['Vehicle type','Payload (t)','Axles','Mileage (km)'],caravan:['Vehicle type','Beds','Length (m)','Mileage (km)']}},
ru:{categories:'Категории',brands:'Марки',search:'Поиск',advanced:'Подробно',type:'Тип',make:'Марка',model:'Модель',country:'Страна',city:'Город',priceMin:'Цена от',priceMax:'Цена до',yearMin:'Год от',yearMax:'Год до',condition:'Состояние',all:'Все',reset:'Сброс',noResults:'Загрузка объявлений...',last:'Новые объявления',vip:'VIP',select:'Выберите',new:'Новый',used:'Б/у',fields:{motorcycle:['Тип мотоцикла','Двигатель (cc)','Пробег (км)','ABS'],watercraft:['Тип судна','Длина (м)','Моточасы','Каюты'],aircraft:['Тип воздушного судна','Лётные часы','Пассажиры','Дальность (км)'],agriculture:['Тип техники','Моточасы','Мощность (л.с.)','Ширина захвата (м)'],construction:['Тип техники','Моточасы','Масса (т)','Грузоподъёмность (т)'],commercial:['Тип транспорта','Грузоподъёмность (т)','Оси','Пробег (км)'],caravan:['Тип транспорта','Спальные места','Длина (м)','Пробег (км)']}},
tr:{categories:'Kategoriler',brands:'Markalar',search:'Ara',advanced:'Detaylı',type:'Tür',make:'Marka',model:'Model',country:'Ülke',city:'Şehir',priceMin:'Min fiyat',priceMax:'Maks fiyat',yearMin:'Min yıl',yearMax:'Maks yıl',condition:'Durum',all:'Tümü',reset:'Sıfırla',noResults:'İlanlar yükleniyor...',last:'Son ilanlar',vip:'VIP',select:'Seçin',new:'Yeni',used:'İkinci el',fields:{motorcycle:['Motosiklet türü','Motor (cc)','Kilometre','ABS'],watercraft:['Tekne türü','Uzunluk (m)','Motor saati','Kabin sayısı'],aircraft:['Hava aracı türü','Uçuş saati','Yolcu sayısı','Menzil (km)'],agriculture:['Makine türü','Çalışma saati','Güç (hp)','Çalışma genişliği'],construction:['Makine türü','Çalışma saati','Ağırlık (t)','Kaldırma kapasitesi'],commercial:['Araç türü','Yük kapasitesi','Aks sayısı','Kilometre'],caravan:['Araç türü','Yatak sayısı','Uzunluk (m)','Kilometre']}},
ka:{categories:'კატეგორიები',brands:'ბრენდები',search:'ძებნა',advanced:'დეტალურად',type:'ტიპი',make:'ბრენდი',model:'მოდელი',country:'ქვეყანა',city:'ქალაქი',priceMin:'მინ. ფასი',priceMax:'მაქს. ფასი',yearMin:'წელი დან',yearMax:'წელი მდე',condition:'მდგომარეობა',all:'ყველა',reset:'გასუფთავება',noResults:'განცხადებები იტვირთება...',last:'ბოლო განცხადებები',vip:'VIP',select:'აირჩიეთ',new:'ახალი',used:'მეორადი',fields:{motorcycle:['მოტოციკლის ტიპი','ძრავა (cc)','გარბენი (კმ)','ABS'],watercraft:['გემის ტიპი','სიგრძე (მ)','ძრავის საათები','კაიუტები'],aircraft:['საფრენი აპარატის ტიპი','ფრენის საათები','მგზავრები','მანძილი (კმ)'],agriculture:['ტექნიკის ტიპი','სამუშაო საათები','სიმძლავრე (hp)','სამუშაო სიგანე'],construction:['ტექნიკის ტიპი','სამუშაო საათები','წონა (ტ)','ამწეობა (ტ)'],commercial:['ტრანსპორტის ტიპი','ტვირთამწეობა (ტ)','ღერძები','გარბენი (კმ)'],caravan:['ტრანსპორტის ტიპი','საწოლები','სიგრძე (მ)','გარბენი (კმ)']}}
};
const names={car:['Avtomobil','Car','Автомобиль','Otomobil','ავტომობილი'],motorcycle:['Motosiklet','Motorcycle','Мотоцикл','Motosiklet','მოტოციკლი'],watercraft:['Su nəqliyyatı','Watercraft','Водный транспорт','Deniz taşıtları','წყლის ტრანსპორტი'],aircraft:['Hava nəqliyyatı','Aircraft','Авиация','Hava taşıtları','საჰაერო ტრანსპორტი'],agriculture:['Kənd təsərrüfatı','Agriculture','Сельхозтехника','Tarım makineleri','სასოფლო ტექნიკა'],construction:['İnşaat texnikası','Construction','Строительная техника','İş makineleri','სამშენებლო ტექნიკა'],commercial:['Kommersiya','Commercial','Коммерческий транспорт','Ticari araçlar','კომერციული ტრანსპორტი'],caravan:['Karavan və digər','Caravans & other','Караваны и другое','Karavan ve diğer','ქარავანი და სხვა']};
const languages=['az','en','ru','tr','ka'];let selected='car',holdUntil=0,prev=0,carHTML=null,carAdvanced=null,carCount=null;
const $=id=>document.getElementById(id),t=()=>LANG[document.documentElement.lang]||LANG.az,li=()=>Math.max(0,languages.indexOf(document.documentElement.lang));
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const track=document.createElement('div');track.className='vehicle-category-track';rail.append(track);
DATA.forEach(item=>{const b=document.createElement('button');b.type='button';b.className='vehicle-category-item';b.dataset.category=item.id;b.innerHTML='<img src="assets/img/vehicle-categories/'+item.image+'" alt=""><span></span>';track.append(b)});
const brandsRail=$('brandsRail'),brandHeading=$('vehicleBrandHeading'),panel=$('filterPanel'),quick=panel?.querySelector('.quick-filters'),advanced=$('advancedFilters'),toggle=$('toggleAdvanced'),apply=$('applyFilters'),vip=$('vipOnly'),grid=$('listingsGrid'),extra=$('vehicleExtraFilters');
const custom=document.createElement('div');custom.id='vehicleCustomBrands';custom.className='vehicle-custom-brands';brandsRail?.after(custom);
const brandPanel=brandsRail?.closest('section');
// Duplicate category items only on narrow viewports; the second set follows seamlessly.
const categoryOriginals=[...track.children];categoryOriginals.forEach(node=>{const clone=node.cloneNode(true);clone.dataset.loopClone='1';clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;track.append(clone)});
let categoryCycleWidth=0;const updateCategoryCycle=()=>{categoryCycleWidth=track.children[categoryOriginals.length]?.offsetLeft-track.children[0]?.offsetLeft||0};
window.addEventListener('resize',updateCategoryCycle,{passive:true});requestAnimationFrame(updateCategoryCycle);
const carOriginal=brandsRail?.innerHTML||'';const carStyle=brandsRail?.getAttribute('style')||'';
const carFilterHTML=quick?.innerHTML||'';const carAdvancedHTML=advanced?.innerHTML||'';
const intl = window.AvtoVIPInternational;
let categoryLogos = {};
const brandLogo = brand => categoryLogos[selected]?.[brand] || null;
const localFeature = value => intl.featureLabel(value, document.documentElement.lang);
const localCategoryType = value => intl.typeLabel(value, document.documentElement.lang);
const showPending=()=>{if(selected==='car'||!grid)return;grid.dataset.categoryPending=selected;grid.innerHTML='<div class="empty-state">'+escapeHTML(t().noResults)+'</div>'};
const formState=()=>{const o={};panel?.querySelectorAll('#vehicleExtraFilters input,#vehicleExtraFilters select').forEach(x=>{if(!x.disabled&&x.name)o[x.name]=x.type==='checkbox'?x.checked:x.value});return o};
let brandPause=0,brandPrev=0,brandCycleWidth=0;
const normalizeBrandScroll=()=>{if(brandCycleWidth&&custom.scrollLeft>=brandCycleWidth)custom.scrollLeft-=brandCycleWidth;};
const renderBrands=()=>{if(selected==='car'){custom.hidden=true;return}custom.hidden=false;custom.innerHTML='';const trk=document.createElement('div');trk.className='vehicle-brand-track';for(const b of DATA.find(x=>x.id===selected).brands){const btn=document.createElement('button');btn.type='button';btn.className='brand-chip vehicle-brand-chip';btn.dataset.brand=b;const logo=brandLogo(b);if(logo){const img=document.createElement('img');img.src=logo;img.alt='';img.loading='lazy';img.onerror=()=>{img.remove();btn.classList.add('no-logo');const monogram=document.createElement('strong');monogram.className='vehicle-brand-monogram';monogram.textContent=b.trim().slice(0,2).toLocaleUpperCase();monogram.setAttribute('aria-hidden','true');btn.prepend(monogram)};btn.append(img)}else {btn.classList.add('no-logo');const monogram=document.createElement('strong');monogram.className='vehicle-brand-monogram';monogram.textContent=b.trim().slice(0,2).toLocaleUpperCase();monogram.setAttribute('aria-hidden','true');btn.append(monogram)}const sp=document.createElement('span');sp.textContent=b;btn.append(sp);trk.append(btn)}custom.append(trk);const originalWidth=trk.scrollWidth;brandCycleWidth=originalWidth;const originals=[...trk.children];originals.forEach(btn=>{const clone=btn.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;trk.append(clone)});brandCycleWidth=trk.children[originals.length]?.offsetLeft-trk.children[0]?.offsetLeft||originalWidth;custom.scrollLeft=0;brandPause=performance.now()+1400};
const makeField=(name,label,type='text',options=null)=>{const wrap=document.createElement('label');wrap.className='vehicle-field';const span=document.createElement('span');span.textContent=label;wrap.append(span);let input;if(options){input=document.createElement('select');for(const [value,text] of options){const opt=document.createElement('option');opt.value=value;opt.textContent=text;input.append(opt)}}else{input=document.createElement('input');input.type=type;if(type==='number')input.min='0';input.placeholder='—'}input.name=name;wrap.append(input);return wrap};
const MODEL_CATALOG={}; // The unified JSON is the only model source.

function mergeExtendedCatalog(data) {
  if (!data) return;
  for (const category of DATA) {
    if (category.id === 'car') continue;
    const entries = data[category.id] || {};
    MODEL_CATALOG[category.id] = entries;
    category.brands = Object.keys(entries).sort((a,b) => intl.collator(document.documentElement.lang).compare(a,b));
  }
  if (selected !== 'car') {
    renderBrands();
    renderFilters(formState());
    const section = $('vehicleAdvancedSection');
    if (section) section.hidden = toggle?.getAttribute('aria-expanded') !== 'true';
  }
}
const fillOptions=(select,values,placeholder)=>{select.replaceChildren(new Option(placeholder||'—',''));values.forEach(x=>select.add(new Option(x.label||x.name||x,x.value??x.iso2??x.name??x)))};
const defaultCountry = () => panel.dataset.profileCountry || $('filterCountry')?.value || localStorage.getItem('avtovip-country') || 'AZ';
const geoLabels = {
  az:['Məkan','Region / Ştat','Rayon / Bölgə'],
  en:['Location','Region / State','District / Area'],
  ru:['Местоположение','Регион / Штат','Район'],
  tr:['Konum','Bölge / Eyalet','İlçe / Bölge'],
  ka:['მდებარეობა','რეგიონი / შტატი','რაიონი']
};
const narrowFilters = matchMedia('(max-width:900px)');
async function setupGeo(state = {}) {
  const country = extra.querySelector('[name="country"]');
  const region = extra.querySelector('[name="region"]');
  const city = extra.querySelector('[name="city"]');
  const language = document.documentElement.lang || 'az';
  const preferred = state.country ?? defaultCountry();
  country.dataset.default = preferred;
  fillOptions(country,preferred?[{value:preferred,label:intl.countryName(preferred,language,preferred)}]:[],t().all);
  country.value = preferred;
  const countries = await intl.countries(language);
  if (!country.isConnected) return;
  fillOptions(country,countries.map(row=>({label:(row.emoji?row.emoji+' ':'')+row.displayName,value:row.iso2})),t().all);
  if (preferred && !Array.from(country.options).some(option=>option.value===preferred)) country.add(new Option(intl.countryName(preferred,language,preferred),preferred));
  country.value = preferred;
  delete country.dataset.default;
  let request = 0, hierarchy = null;
  const updateCities = async (savedCity = '') => {
    const sequence = ++request;
    const iso = country.value;
    const regionCities = hierarchy?.states?.find(item=>item.name===region.value)?.cities;
    const rows = regionCities?.length ? regionCities.map(item=>typeof item==='string'?item:item.name).filter(Boolean) : iso ? await intl.cities(iso,language) : [];
    if (!city.isConnected || sequence !== request || iso !== country.value) return;
    fillOptions(city,rows,t().city);
    city.value = savedCity;
  };
  let regionRequest = 0;
  const updateRegions = async (savedRegion='', savedCity='') => {
    const sequence = ++regionRequest;
    const iso = country.value;
    hierarchy = null;
    fillOptions(region,[],t().all);
    fillOptions(city,[],t().city);
    const data = iso ? await intl.countryHierarchy(iso,language) : null;
    if (!country.isConnected || sequence !== regionRequest) return;
    hierarchy = data;
    fillOptions(region,(data?.states||[]).map(item=>({value:item.name,label:item.native||item.name})),t().all);
    region.value = savedRegion;
    await updateCities(savedCity);
  };
  country.addEventListener('change',()=>updateRegions());
  region.addEventListener('change',()=>updateCities());
  await updateRegions(state.region,state.city);
}
const renderFilters=(state={})=>{if(selected==='car')return;const L=t(),fields=L.fields[selected]||[];extra.innerHTML='';const primary=document.createElement('div');primary.className='vehicle-extra-grid vehicle-primary-grid';const make=makeField('make',L.make,'text', [['',L.all],...DATA.find(x=>x.id===selected).brands.map(b=>[b,b])]);const model=makeField('model',L.model,'text', [['',L.select]]);
const modelSelect=model.querySelector('select');
// A single model control is used for all seven non-car categories.
// When a make has no catalog models, allow a manual model name without losing the filter.
const manualModel=document.createElement('input');manualModel.type='search';manualModel.className='vehicle-model-manual';manualModel.placeholder=L.model;manualModel.setAttribute('aria-label',L.model);manualModel.hidden=true;model.append(manualModel);
const otherModelValue='__avtovip_other_model__';
const updateModels=()=>{const brand=make.querySelector('select').value;const models=MODEL_CATALOG[selected]?.[brand]||[];modelSelect.replaceChildren(new Option(L.select,''));for(const name of models)modelSelect.add(new Option(name,name));modelSelect.add(new Option(L.other||'Digər',otherModelValue));modelSelect.value='';manualModel.value='';manualModel.hidden=true;modelSelect.name='model';manualModel.removeAttribute('name');};
modelSelect.addEventListener('change',()=>{const isOther=modelSelect.value===otherModelValue;manualModel.hidden=!isOther;if(isOther){modelSelect.removeAttribute('name');manualModel.name='model';manualModel.focus();}else{manualModel.removeAttribute('name');modelSelect.name='model';manualModel.value='';}});
make.querySelector('select').addEventListener('change',()=>{updateModels();custom.querySelectorAll('[data-brand]').forEach(x=>x.classList.toggle('active',x.dataset.brand===make.querySelector('select').value))});
const labels = geoLabels[document.documentElement.lang] || geoLabels.en;
const countryField = makeField('country',L.country,'text',[['',L.all]]);
const cityField = makeField('city',L.city,'text',[['',L.all]]);
const regionField = makeField('region',labels[1],'text',[['',L.all]]);
const districtField = makeField('district',labels[2]);
districtField.querySelector('input').value = state.district || '';
const search = document.createElement('button');
search.type = 'button';
search.className = 'btn btn-primary vehicle-category-search';
search.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
search.append(document.createTextNode(' '+L.search));
search.addEventListener('click',runCategorySearch);
primary.append(make,model,countryField,cityField,search);
extra.append(primary);
const section=document.createElement('div');section.className='vehicle-advanced-section';section.hidden=true;section.id='vehicleAdvancedSection';
const geoHeading=document.createElement('h4');geoHeading.textContent=labels[0];
const geoGrid=document.createElement('div');geoGrid.className='vehicle-extra-grid vehicle-location-grid';
geoGrid.append(regionField,districtField);
section.append(geoHeading,geoGrid);
const arrangeLocation = () => {
  if (narrowFilters.matches) geoGrid.replaceChildren(countryField,regionField,cityField,districtField);
  else search.before(countryField,cityField);
};
arrangeLocation();
const fieldsGrid=document.createElement('div');fieldsGrid.className='vehicle-extra-grid';
const typeField = makeField('vehicle_type', fields[0] || L.type, 'text', [['',L.all],...(intl.CATEGORY_TYPES[selected]||[]).map(x=>[x,localCategoryType(x)])]);
fieldsGrid.append(typeField);
const bounds = {az:['min','max'],en:['min','max'],ru:['от','до'],tr:['min','maks'],ka:['მინ.','მაქს.']}[document.documentElement.lang] || ['min','max'];
const rangeFields = [];
for (const key of intl.SPEC_FIELDS[selected] || []) {
  const label = intl.specLabel(key, selected, document.documentElement.lang);
  const controls = ['min','max'].map((bound,index) => makeField(bound+'_'+key,label+' '+bounds[index],'number'));
  for (const control of controls) {
    control.querySelector('input').min = '0';
    control.querySelector('input').step = 'any';
  }
  fieldsGrid.append(...controls);
  rangeFields.push([key,controls]);
}
typeField.addEventListener('change', () => {
  const type = typeField.querySelector('select').value;
  for (const [key,controls] of rangeFields) for (const control of controls) {
    control.hidden = !intl.specApplicable(selected,type,key);
    control.querySelector('input').disabled = control.hidden;
  }
});
[['priceMin',L.priceMin],['priceMax',L.priceMax],['yearMin',L.yearMin],['yearMax',L.yearMax]].forEach(([key,label])=>fieldsGrid.append(makeField(key,label,'number')));fieldsGrid.append(makeField('condition',L.condition,'text',[['',L.all],['new',L.new],['used',L.used]]));section.append(fieldsGrid);const features=document.createElement('div');features.className='vehicle-features';for(const feature of intl.CATEGORY_EXTRAS[selected]||[]){const label=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.name='feature_'+feature;check.value='1';label.append(check,document.createTextNode(' '+localFeature(feature)));features.append(label)}section.append(features);const actions=document.createElement('div');actions.className='filter-actions vehicle-reset-actions';const spacer=document.createElement('span');spacer.className='vehicle-reset-spacer';const reset=document.createElement('button');reset.type='button';reset.className='btn btn-outline btn-sm vehicle-reset-button';reset.innerHTML='<i class="fa-solid fa-rotate-left" aria-hidden="true"></i> <span></span>';reset.querySelector('span').textContent=L.reset;reset.addEventListener('click',()=>{extra.querySelectorAll('input,select').forEach(x=>{if(x.type==='checkbox')x.checked=false;else x.value=''});const mk=extra.querySelector('[name="make"]');if(mk)mk.dispatchEvent(new Event('change',{bubbles:true}));const country=extra.querySelector('[name="country"]');if(country){country.value=defaultCountry();country.dispatchEvent(new Event('change',{bubbles:true}))}extra.querySelector('[name="vehicle_type"]')?.dispatchEvent(new Event('change'));custom.querySelectorAll('.vehicle-brand-chip').forEach(x=>x.classList.remove('active'));if(vip){vip.dataset.on='0';vip.classList.remove('active');vip.setAttribute('aria-pressed','false')}runCategorySearch()});actions.append(spacer,reset);section.append(actions);extra.append(section);setupGeo(state)};
const runCategorySearch=()=>{
  if(selected==='car')return;
  const filters=formState();
  const country=extra.querySelector('[name="country"]');
  if(country?.dataset.default && !filters.country)filters.country=country.dataset.default;
  showPending();
  document.dispatchEvent(new CustomEvent('avtovip:category-search',{detail:{category:selected,filters,vipOnly:vip?.dataset.on==='1'}}));
};
const originalListings=()=>{delete grid.dataset.categoryPending;document.dispatchEvent(new CustomEvent('avtovip:category-car'))};
function select(id){if(!DATA.some(x=>x.id===id))return;const was=selected;selected=id;const car=id==='car';if(brandsRail){brandsRail.classList.toggle('vehicle-hidden',!car);brandsRail.setAttribute('aria-hidden',String(!car))}custom.hidden=car;if(quick)quick.classList.toggle('vehicle-hidden',!car);if(advanced){advanced.classList.toggle('vehicle-hidden',!car);if(!car)advanced.classList.remove('open')}if(extra)extra.hidden=car;if(panel)panel.classList.toggle('vehicle-noncar',!car);if(brandPanel)brandPanel.classList.toggle('vehicle-noncar-brands',!car);
if(toggle){toggle.hidden=false;toggle.setAttribute('aria-expanded','false')}if(apply)apply.disabled=false;
if(car){if(was!=='car')originalListings()}else{renderBrands();renderFilters({country:defaultCountry()});showPending()}
translate(false);document.dispatchEvent(new CustomEvent('avtovip:category-changed',{detail:{category:id,country:car?undefined:defaultCountry(),backendReady:car}}))}
function translate(rebuild=true){const L=t();$('vehicleCategoriesTitle').textContent=L.categories;if(brandHeading)brandHeading.textContent=L.brands;const searchHead=panel?.querySelector('.section-head h3');if(searchHead)searchHead.innerHTML='<i class="fa-solid fa-sliders"></i> '+escapeHTML(L.search);rail.querySelectorAll('[data-category]').forEach(b=>{const id=b.dataset.category;b.querySelector('span').textContent=names[id][li()];b.classList.toggle('selected',id===selected);b.setAttribute('aria-pressed',String(id===selected))});if(selected!=='car'&&rebuild){const state=formState();const expanded=!$('vehicleAdvancedSection')?.hidden;renderFilters(state);$('vehicleAdvancedSection').hidden=!expanded;if(toggle)toggle.setAttribute('aria-expanded',String(expanded));Object.entries(state).forEach(([key,value])=>{const el=extra.querySelector('[name="'+CSS.escape(key)+'"]');if(el){if(el.type==='checkbox')el.checked=value;else el.value=value}});extra.querySelector('[name="vehicle_type"]')?.dispatchEvent(new Event('change'));const mk=extra.querySelector('[name="make"]');if(mk){const oldModel=state.model;mk.dispatchEvent(new Event('change'));const modelField=extra.querySelector('[name="model"]');if(modelField)modelField.value=oldModel||'';}}if(toggle)toggle.textContent=L.advanced;if(apply){const span=apply.querySelector('span');if(span)span.textContent=L.search}const last=$('listingsTitle')||document.querySelector('#listingsGrid')?.parentElement?.querySelector('h2');if(last&&selected!=='car')last.textContent=L.last;}
rail.addEventListener('click',e=>{if(rail.dataset.dragged==='1')return;const b=e.target.closest('[data-category]');if(b)select(b.dataset.category)});
custom.addEventListener('wheel',e=>{if(custom.scrollWidth<=custom.clientWidth)return;if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();custom.scrollLeft+=e.deltaY}else custom.scrollLeft+=e.deltaX;normalizeBrandScroll();brandPause=performance.now()+3500},{passive:false});
// Pointer dragging works on desktop without triggering an accidental brand selection.
function enableDrag(el,onPause){let down=false,startX=0,startScroll=0,moved=false;
 el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0)return;down=true;moved=false;startX=e.clientX;startScroll=el.scrollLeft;onPause();});
 el.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-startX;if(Math.abs(dx)>5){moved=true;el.dataset.dragged='1';el.scrollLeft=startScroll-dx;onPause();}});
 const finish=()=>{if(!down)return;down=false;if(moved){setTimeout(()=>{el.dataset.dragged='0'},0)}onPause()};
 el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);window.addEventListener('pointerup',finish);
 el.addEventListener('dragstart',e=>e.preventDefault());
}
enableDrag(custom,()=>brandPause=performance.now()+3000);
if(brandsRail){brandsRail.addEventListener('dragstart',e=>e.preventDefault(),true);brandsRail.querySelectorAll('img').forEach(img=>img.draggable=false);const carObserver=new MutationObserver(()=>brandsRail.querySelectorAll('img').forEach(img=>img.draggable=false));carObserver.observe(brandsRail,{childList:true,subtree:true});}
enableDrag(rail,()=>holdUntil=performance.now()+3000);
custom.addEventListener('click',e=>{if(custom.dataset.dragged==='1')return;const b=e.target.closest('[data-brand]');if(!b)return;const inp=extra.querySelector('[name="make"]');const active=b.classList.contains('active');custom.querySelectorAll('[data-brand]').forEach(x=>x.classList.remove('active'));if(inp){inp.value=active?'':b.dataset.brand;inp.dispatchEvent(new Event('change',{bubbles:true}));inp.focus({preventScroll:true})}if(!active)b.classList.add('active');runCategorySearch()});
const sharedReset=$('resetFilters');if(sharedReset)sharedReset.addEventListener('click',e=>{if(selected==='car')return;e.preventDefault();e.stopImmediatePropagation();extra.querySelectorAll('input,select').forEach(x=>{if(x.type==='checkbox')x.checked=false;else x.value=''});const make=extra.querySelector('[name="make"]');if(make)make.dispatchEvent(new Event('change',{bubbles:true}));const country=extra.querySelector('[name="country"]');if(country){country.value=defaultCountry();country.dispatchEvent(new Event('change',{bubbles:true}))}extra.querySelector('[name="vehicle_type"]')?.dispatchEvent(new Event('change'));custom.querySelectorAll('.vehicle-brand-chip').forEach(x=>x.classList.remove('active'));if(vip){vip.dataset.on='0';vip.classList.remove('active');vip.setAttribute('aria-pressed','false')}runCategorySearch()},true);
if(toggle)toggle.addEventListener('click',e=>{if(selected==='car')return;e.stopImmediatePropagation();e.preventDefault();const section=$('vehicleAdvancedSection');if(section){section.hidden=!section.hidden;toggle.setAttribute('aria-expanded',String(!section.hidden))}},true);
if(apply)apply.addEventListener('click',e=>{if(selected==='car')return;e.stopImmediatePropagation();e.preventDefault();runCategorySearch()},true);
if(vip)vip.addEventListener('click',e=>{if(selected==='car')return;e.stopImmediatePropagation();e.preventDefault();const active=vip.dataset.on!=='1';vip.dataset.on=active?'1':'0';vip.classList.toggle('active',active);vip.setAttribute('aria-pressed',String(active));runCategorySearch()},true);
document.addEventListener('avtovip:category-filters-ready',()=>{
  if(selected==='car')return;
  renderFilters({...formState(),country:defaultCountry(),region:'',city:''});
  $('vehicleAdvancedSection').hidden=toggle?.getAttribute('aria-expanded')!=='true';
  runCategorySearch();
});
narrowFilters.addEventListener('change',()=>{if(selected!=='car')translate()});
const observer=new MutationObserver(()=>{if(document.documentElement.lang!==observer.last){observer.last=document.documentElement.lang;translate()}});observer.last=document.documentElement.lang;observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-lang']});
rail.addEventListener('pointerdown',()=>holdUntil=performance.now()+1800,{passive:true});rail.addEventListener('pointerup',()=>holdUntil=performance.now()+1500,{passive:true});
function tick(ts){if(selected!=='car'&&ts>brandPause&&!document.hidden&&custom.scrollWidth>custom.clientWidth){const dt=brandPrev?Math.min(40,ts-brandPrev):16;custom.scrollLeft+=dt*.025;normalizeBrandScroll()}brandPrev=ts;if(!prev)prev=ts;const dt=Math.min(40,ts-prev);prev=ts;if(selected&&ts>holdUntil&&!document.hidden&&rail.scrollWidth>rail.clientWidth){rail.scrollLeft+=dt*.025;if(categoryCycleWidth&&rail.scrollLeft>=categoryCycleWidth)rail.scrollLeft-=categoryCycleWidth}requestAnimationFrame(tick)}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)requestAnimationFrame(tick);
translate();
Promise.all([intl.loadUnifiedCatalog(), intl.loadBrandLogos()]).then(([catalog, logos]) => {
  categoryLogos = logos;
  mergeExtendedCatalog(catalog);
});
})();
