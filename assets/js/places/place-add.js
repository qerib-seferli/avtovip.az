import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl.mjs';
const db=window.avtoDb,sb=db?.client,I=window.AvtoVIPInternational,$=s=>document.querySelector(s);let me,profile,map,center={lng:47.7,lat:40.4},price={amount:1,currency:'USD'},editId=new URLSearchParams(location.search).get('edit'),editRow=null,countryRows=[];
const lang=()=>localStorage.getItem('avtovip-lang')||'az';
function toast(m,t='info'){const s=$('#toastStack'),n=document.createElement('div');n.className=`toast ${t}`;n.textContent=m;s.append(n);setTimeout(()=>n.remove(),3500)}
function fillCategories(){const c=$('#placeCategory');c.innerHTML='<option value="">Seçin</option>'+(window.AV_PLACE_CATEGORIES||[]).map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('');c.onchange=()=>{const x=(window.AV_PLACE_CATEGORIES||[]).find(y=>y[0]===c.value);$('#placeSubcategory').innerHTML='<option value="">Seçin</option>'+(x?.[3]||[]).map(v=>`<option>${v}</option>`).join('')}}
async function fillCountries(){countryRows=await I.countries(lang());const c=$('#placeCountry');c.innerHTML=countryRows.map(x=>`<option value="${x.iso2}">${x.emoji||''} ${x.displayName}</option>`).join('');c.value=profile?.country_code||'AZ';c.onchange=async()=>{await fillRegions();await loadPrice()};await fillRegions()}
let locationRequest=0;
function selectSavedOption(select,value){
  if(!value)return;
  if(![...select.options].some(option=>option.value===value))select.add(new Option(value,value));
  select.value=value;
}
async function fillRegions(savedRegion='',savedCity=''){
  const request=++locationRequest;
  const country=$('#placeCountry').value, region=$('#placeRegion'), city=$('#placeCity');
  region.onchange=null;
  region.replaceChildren(new Option('Region / ştat seçin',''));
  city.replaceChildren(new Option('Şəhər / rayon seçin',''));
  let states=[], countryCities=[];
  try {
    states=(await I.countryHierarchy(country,lang()))?.states||[];
    if(!states.length)countryCities=await I.cities(country,lang());
  } catch(error) {console.warn(error)}
  if(request!==locationRequest)return;
  for(const state of states)if(state.name)region.add(new Option(state.name,state.name));
  const fillCities=selected=>{
    const state=states.find(row=>row.name===region.value);
    const rows=state?.cities||countryCities;
    city.replaceChildren(new Option('Şəhər / rayon seçin',''));
    for(const row of rows){
      const name=typeof row==='string'?row:row?.name;
      if(name)city.add(new Option(name,name));
    }
    selectSavedOption(city,selected);
  };
  const normalizeLocation=value=>String(value||'').normalize('NFKC').trim().toLocaleLowerCase('az');
  if(!String(savedRegion||'').trim()&&savedCity){
    const matching=states.filter(state=>(state.cities||[]).some(row=>
      normalizeLocation(typeof row==='string'?row:row?.name)===normalizeLocation(savedCity)));
    if(matching.length===1)savedRegion=matching[0].name;
  }
  selectSavedOption(region,String(savedRegion||'').trim());
  fillCities(savedCity);
  region.onchange=()=>fillCities('');
}
async function loadPrice(){const cc=$('#placeCountry').value;const local=countryRows.find(x=>x.iso2===cc);price={amount:1,currency:local?.currency||'USD'};if(sb){const {data}=await sb.from('place_country_prices').select('monthly_price,currency').eq('country_code',cc).eq('active',true).maybeSingle();if(data)price={amount:+data.monthly_price,currency:data.currency}}$('#placePrice').textContent=`Aylıq: ${new Intl.NumberFormat(I?.locale?.(lang())||undefined,{style:'currency',currency:price.currency}).format(price.amount)} / məkan`}
function initMap(){map=new maplibregl.Map({container:'placeAddMap',style:'https://tiles.openfreemap.org/styles/liberty',center:[center.lng,center.lat],zoom:6,pitch:0,attributionControl:false});map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');map.on('moveend',()=>{const c=map.getCenter();center={lng:c.lng,lat:c.lat};$('#placeCoordinates').textContent=`${center.lat.toFixed(6)}, ${center.lng.toFixed(6)} — pini obyektin giriş nöqtəsinə gətirin.`})}
function useLocation(){navigator.geolocation?.getCurrentPosition(p=>{center={lng:p.coords.longitude,lat:p.coords.latitude};map.flyTo({center:[center.lng,center.lat],zoom:17,pitch:0})},()=>toast('Konum icazəsi alınmadı.','error'),{enableHighAccuracy:true,timeout:10000})}
async function findAddress(){const fd=new FormData($('#placeForm')),q=[fd.get('address'),fd.get('city'),fd.get('region'),$('#placeCountry').selectedOptions[0]?.text].filter(Boolean).join(', ');if(!q)return;try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`),j=await r.json();if(!j.length)return toast('Ünvan tapılmadı.','error');center={lng:+j[0].lon,lat:+j[0].lat};map.flyTo({center:[center.lng,center.lat],zoom:17,pitch:0})}catch{toast('Ünvan axtarışı alınmadı.','error')}}
const placePreviewUrls = new Set();
let previewGeneration = 0;
function clearPlacePreviewUrls() {
  previewGeneration++;
  for (const url of placePreviewUrls) URL.revokeObjectURL(url);
  placePreviewUrls.clear();
}
async function previews() {
  clearPlacePreviewUrls();
  const generation = previewGeneration;
  const files = [...$('#placePhotos').files].slice(0, 8);
  $('#placePhotosName').textContent = files.length ? `${files.length} şəkil seçildi` : 'Şəkil seçilməyib';
  const target = $('#placeMediaPreview');
  target.replaceChildren();
  for (const file of files) {
    const prepared = await db.prepareImage(file, {
      maxWidth: 480, maxHeight: 480, quality: .85, maxBytes: 220000, reportProgress: false
    }).catch(() => file);
    if (generation !== previewGeneration) return;
    const url = URL.createObjectURL(prepared);
    placePreviewUrls.add(url);
    const img = document.createElement('img');
    img.alt = '';
    img.style.imageOrientation = 'from-image';
    img.src = url;
    target.append(img);
  }
}
window.addEventListener('pagehide', clearPlacePreviewUrls);
window.addEventListener('pageshow', event => { if (event.persisted) previews(); });
function hours(){const hide=$('[name="hours_mode"]').value==='24_7';document.querySelectorAll('.place-hours-field').forEach(x=>x.hidden=hide)}
const progressCopy={
  az:['Şəkillər hazırlanır','Şəkillər yüklənir','Şəkillər yükləndi','Yükləmə tamamlanmadı'],
  en:['Preparing images','Uploading images','Images uploaded','Upload incomplete'],
  ru:['Подготовка изображений','Загрузка изображений','Изображения загружены','Загрузка не завершена'],
  tr:['Görseller hazırlanıyor','Görseller yükleniyor','Görseller yüklendi','Yükleme tamamlanmadı'],
  ka:['სურათები მზადდება','სურათები იტვირთება','სურათები აიტვირთა','ატვირთვა ვერ დასრულდა']
};
function showUploadProgress(stage,done,total,fraction=0){
  const box=$('#placeUploadProgress'), bar=box.querySelector('progress');
  const percentage=Math.floor((done+fraction)/total*100);
  const text=(progressCopy[lang()]||progressCopy.az)[stage];
  box.hidden=false;
  box.querySelector('span').textContent=`${text} · ${done}/${total} · ${percentage}%`;
  bar.value=percentage;
}
async function uploadImage(file,prefix,done,total){
  showUploadProgress(0,done,total);
  const ready=await db.prepareImage(file,{maxWidth:1400,maxHeight:1400,quality:.78,maxBytes:850000,reportProgress:false});
  showUploadProgress(1,done,total);
  const uploaded=await db.upload('place-media',me.id,ready,prefix,fraction=>showUploadProgress(1,done,total,Math.min(.99,fraction)));
  showUploadProgress(done+1===total?2:1,done+1,total);
  return uploaded;
}
async function submit(e){e.preventDefault();const btn=$('#placeSubmit');if(db.mediaBusy())return;const form=e.currentTarget;const finish=db.beginMediaOperation();btn.disabled=true;let uploaded=[],savedToDb=false;
const selectedLogo=$('#placeLogo').files[0], selectedPhotos=[...$('#placePhotos').files].slice(0,8);
const total=Number(Boolean(selectedLogo))+selectedPhotos.length;
const progress=$('#placeUploadProgress');
progress.hidden=!total;
document.body.classList.toggle('av-place-upload-active',Boolean(total));
if(total)showUploadProgress(0,0,total);
try{if(map?.isMoving())await new Promise(resolve=>map.once('moveend',resolve));const exactCenter=map.getCenter();center={lng:exactCenter.lng,lat:exactCenter.lat};const fd=new FormData(form),logo=selectedLogo?await uploadImage(selectedLogo,'logos',0,total):null;if(logo)uploaded.push(logo);const photos=[];for(const f of selectedPhotos){const u=await uploadImage(f,'photos',uploaded.length,total);uploaded.push(u);photos.push(u.url)}db.mediaProgressHide();const payload={name:fd.get('name').trim(),category_key:fd.get('category_key'),subcategory:fd.get('subcategory'),country_code:fd.get('country_code'),region:fd.get('region')||null,city:fd.get('city'),address:fd.get('address').trim(),latitude:center.lat,longitude:center.lng,phone:fd.get('phone').trim()||null,whatsapp:fd.get('whatsapp').trim()||null,website:fd.get('website').trim()||null,description:fd.get('description').trim()||null,hours_mode:fd.get('hours_mode'),open_time:fd.get('hours_mode')==='24_7'?null:fd.get('open_time'),close_time:fd.get('hours_mode')==='24_7'?null:fd.get('close_time'),delivery:fd.get('delivery')==='true',delivery_radius_km:Number(fd.get('delivery_radius_km')||0)||null,logo_url:logo?.url||editRow?.logo_url||null,photo_urls:photos.length?photos:(editRow?.photo_urls||[])};let data,error;if(editId){({data,error}=await sb.from('places').update({...payload,updated_at:new Date().toISOString()}).eq('id',editId).eq('owner_id',me.id).select('id').single());data=data?.id}else({data,error}=await sb.rpc('create_paid_place',{p_place:payload}));if(error)throw error;savedToDb=true;
// The paid-place RPC may return the UUID directly; link only after the
// persisted row exists. A link failure must not undo a successful purchase.
const savedPlaceId=typeof data==='string'?data:data?.id;
if(savedPlaceId){for(const mediaUrl of [logo?.url,...photos].filter(Boolean)){
 try{await db.linkR2Media(mediaUrl,'place',savedPlaceId)}
 catch(linkError){console.warn('[AvtoVIP place media link] reconciliation needed',linkError)}
}}
let cleanupError=null;if(editId&&editRow){const retained=new Set([payload.logo_url,...(payload.photo_urls||[])].filter(Boolean));const stale=[...new Set([editRow.logo_url,...(Array.isArray(editRow.photo_urls)?editRow.photo_urls:[])].filter(u=>u&&!retained.has(u)))];if(stale.length)try{await db.removeUrls('place-media',stale,'place',savedPlaceId)}catch(err){cleanupError=err;console.warn('[AvtoVIP place media cleanup]',err)}}toast(cleanupError?'Məkan yeniləndi, lakin köhnə media fayllarının silinməsi təsdiqlənmədi.':editId?'Məkan məlumatları yeniləndi.':'Məkan ödənişlə aktiv edildi.',cleanupError?'error':'success');setTimeout(()=>location.href=`places.html?place=${encodeURIComponent(savedPlaceId||'')}`,900)}catch(err){if(total&&!savedToDb)showUploadProgress(3,uploaded.length,total);if(!savedToDb)for(const u of uploaded)await db.removePaths('place-media',[u.path]).catch(()=>{});db.mediaProgressHide();toast(err.message||'Məkan əlavə edilmədi.','error')}finally{document.body.classList.remove('av-place-upload-active');btn.disabled=false;finish()}}
async function boot(){if(!db)return;me=await db.requireAuth();if(!me)return;profile=await db.getProfile(me.id);fillCategories();await fillCountries();await loadPrice();initMap();$('[name="hours_mode"]').addEventListener('change',hours);hours();if(editId){const r=await sb.from('places').select('*').eq('id',editId).eq('owner_id',me.id).maybeSingle();if(r.data){editRow=r.data;const f=$('#placeForm');for(const [k,v] of Object.entries(editRow)){const el=f.elements[k];if(el&&v!=null&&!['photo_urls','logo_url','region','city','subcategory'].includes(k))el.value=typeof v==='boolean'?String(v):v}$('#placeCountry').value=editRow.country_code||'AZ';await fillRegions(editRow.region,editRow.city);$('#placeCategory').dispatchEvent(new Event('change'));$('#placeSubcategory').value=editRow.subcategory||'';center={lng:+editRow.longitude,lat:+editRow.latitude};map.jumpTo({center:[center.lng,center.lat],zoom:17,pitch:0});$('#placeSubmit').innerHTML='<i class="fa-solid fa-check"></i> Dəyişiklikləri yadda saxla';$('.places-price-box').style.display='none';hours()}}else setTimeout(useLocation,500);$('#useCurrentLocation').onclick=useLocation;$('#findAddress').onclick=findAddress;$('#placePhotos').onchange=previews;$('#placeLogo').onchange=()=>{$('#placeLogoName').textContent=$('#placeLogo').files[0]?.name||'Şəkil seçilməyib'};$('#placeForm').onsubmit=submit}boot();
