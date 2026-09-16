/* AvtoVİP Professional UI v20 — progressive UX layer; preserves marketplace contracts. */
(()=>{'use strict';
 const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
 const sb=window.avtoDb?.client; const page=document.body?.dataset.page||'';
 const lang=()=>localStorage.getItem('avtovip-lang')||'az';
 const T={
  az:{all:'Hamısı',unread:'Oxunmamış',buyers:'Alıcılar',sellers:'Satıcılar',searchMsg:'Mesajlarda axtar...',popular:'Populyar markalar',recent:'Son axtarışlar',categories:'Kateqoriyalar',settings:'Tənzimləmələr',saved:'Saxlanılanlar',history:'Tarixçə',payments:'Ödənişlər',services:'Xidmətlər',profileInfo:'Profil məlumatları',ads:'Elan',likes:'Bəyənilən',google:'Google ilə davam et',or:'və ya'},
  en:{all:'All',unread:'Unread',buyers:'Buyers',sellers:'Sellers',searchMsg:'Search messages...',popular:'Popular makes',recent:'Recent searches',categories:'Categories',settings:'Settings',saved:'Saved',history:'History',payments:'Payments',services:'Services',profileInfo:'Profile information',ads:'Listings',likes:'Liked',google:'Continue with Google',or:'or'},
  ru:{all:'Все',unread:'Непрочитанные',buyers:'Покупатели',sellers:'Продавцы',searchMsg:'Поиск сообщений...',popular:'Популярные марки',recent:'Недавние запросы',categories:'Категории',settings:'Настройки',saved:'Сохранённые',history:'История',payments:'Платежи',services:'Услуги',profileInfo:'Данные профиля',ads:'Объявления',likes:'Понравившиеся',google:'Продолжить с Google',or:'или'},
  tr:{all:'Tümü',unread:'Okunmamış',buyers:'Alıcılar',sellers:'Satıcılar',searchMsg:'Mesajlarda ara...',popular:'Popüler markalar',recent:'Son aramalar',categories:'Kategoriler',settings:'Ayarlar',saved:'Kaydedilenler',history:'Geçmiş',payments:'Ödemeler',services:'Hizmetler',profileInfo:'Profil bilgileri',ads:'İlan',likes:'Beğenilenler',google:'Google ile devam et',or:'veya'},
  ka:{all:'ყველა',unread:'წაუკითხავი',buyers:'მყიდველები',sellers:'გამყიდველები',searchMsg:'შეტყობინებებში ძებნა...',popular:'პოპულარული ბრენდები',recent:'ბოლო ძიებები',categories:'კატეგორიები',settings:'პარამეტრები',saved:'შენახული',history:'ისტორია',payments:'გადახდები',services:'სერვისები',profileInfo:'პროფილის ინფორმაცია',ads:'განცხადებები',likes:'მოწონებული',google:'Google-ით გაგრძელება',or:'ან'}
 }; const t=k=>(T[lang()]||T.az)[k]||k;
 function sound(kind='notification'){try{if(localStorage.getItem('avtovip-sounds')==='off')return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A(),g=c.createGain(),o=c.createOscillator();o.connect(g);g.connect(c.destination);const now=c.currentTime;o.type='sine';o.frequency.setValueAtTime(kind==='message'?620:880,now);o.frequency.exponentialRampToValueAtTime(kind==='message'?820:660,now+.13);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.055,now+.015);g.gain.exponentialRampToValueAtTime(.0001,now+.22);o.start(now);o.stop(now+.23);setTimeout(()=>c.close(),350)}catch{}}
 window.AvtoVIPSounds={play:sound};
 function explore(){ /* v24: extra category/popular shortcut block intentionally removed. */ }
 function messages(){const host=$('#avMessageToolsHost'),searchHost=$('#avMessageSearchHost'),list=$('#conversationList');if(!list||!host||host.dataset.ready==='1')return;host.dataset.ready='1';host.className='av-message-tools';host.innerHTML=`<button class="active">${t('all')}</button><button>${t('unread')}</button><button>${t('buyers')}</button><button>${t('sellers')}</button>`;searchHost.className='explore-search av-message-search';searchHost.innerHTML=`<i class="fa-solid fa-magnifying-glass"></i><input id="avMessageSearch" type="search" placeholder="${t('searchMsg')}">`;searchHost.querySelector('input').addEventListener('input',e=>{window.__avMessageSearchQuery=e.target.value||'';window.__avApplyMessageSearch?.()});}
 async function profile(){const head=$('.profile-head');if(!head||$('.av-profile-actions'))return;const stats=document.createElement('div');stats.className='av-profile-stats';stats.innerHTML=`<div><b id="avFollowers">0</b><span>Takipçi</span></div><div><b id="avFollowing">0</b><span>Takip</span></div><div><b id="avListings">0</b><span>${t('ads')}</span></div><div><b id="avLikes">0</b><span>${t('likes')}</span></div>`;head.append(stats);const actions=document.createElement('div');actions.className='av-profile-actions';actions.innerHTML=`<button data-open-profile><i class="fa-regular fa-user"></i><span>${t('profileInfo')}</span></button><a href="ayarlar.html"><i class="fa-solid fa-gear"></i><span>${t('settings')}</span></a><a href="sevimliler.html"><i class="fa-regular fa-heart"></i><span>${t('saved')}</span></a><a href="odenisler.html"><i class="fa-regular fa-clock"></i><span>${t('history')}</span></a>`;head.after(actions);actions.querySelector('[data-open-profile]').onclick=()=>$('#profileInfoToggle')?.click();try{const {data:{session}}=await sb.auth.getSession();const id=session?.user?.id;if(!id)return;const [a,b,c,d]=await Promise.all([sb.from('user_follows').select('*',{count:'exact',head:true}).eq('following_id',id),sb.from('user_follows').select('*',{count:'exact',head:true}).eq('follower_id',id),sb.from('elanlar').select('*',{count:'exact',head:true}).eq('user_id',id),sb.from('listing_likes').select('*',{count:'exact',head:true}).eq('user_id',id)]);$('#avFollowers').textContent=a.count||0;$('#avFollowing').textContent=b.count||0;$('#avListings').textContent=c.count||0;$('#avLikes').textContent=d.count||0}catch{}}
 function createSteps(){const form=$('#listingForm');if(!form||$('.av-stepbar'))return;const bar=document.createElement('div');bar.className='av-stepbar';bar.innerHTML='<span class="active">1 · Növ</span><span>2 · Marka / Model</span><span>3 · Texniki</span><span>4 · Təchizat</span><span>5 · Foto / Video</span><span>6 · Məkan</span><span>7 · Önizləmə</span>';form.before(bar)}
 function oauth(){const card=$('.auth-card');if(!card||$('#googleAuthBtn'))return;const tabs=$('.auth-tabs');const box=document.createElement('div');box.className='av-oauth';box.innerHTML=`<button type="button" id="googleAuthBtn" class="btn btn-outline btn-block av-google"><i class="fa-brands fa-google"></i> ${t('google')}</button><div class="av-or">${t('or')}</div>`;tabs?.after(box);$('#googleAuthBtn').onclick=async()=>{const next=new URLSearchParams(location.search).get('next')||'profile.html';sessionStorage.setItem('avtovip-oauth-next',next);const redirect=new URL('login.html',location.href);redirect.searchParams.set('oauth','1');const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirect.href,queryParams:{prompt:'select_account'}}});if(error)$('#authStatus').textContent=error.message};if(new URLSearchParams(location.search).get('oauth')==='1')sb.auth.getSession().then(({data})=>{if(data.session)location.replace(sessionStorage.getItem('avtovip-oauth-next')||'profile.html')});}
 function realtimeSounds(){if(!sb)return;sb.auth.getSession().then(({data})=>{const id=data.session?.user?.id;if(!id)return;const c=sb.channel(`av-sound-${id}-${Date.now()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`receiver_id=eq.${id}`},()=>sound('message')).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${id}`},()=>sound('notification')).subscribe();addEventListener('pagehide',()=>sb.removeChannel(c).catch(()=>{}),{once:true})})}
 function socialShortcut(){const a=$('.header-actions');if(!a||$('#avSocialShortcut')||['auth','reset'].includes(page))return;const x=document.createElement('a');x.id='avSocialShortcut';x.className='icon-btn';x.href='lent.html';x.setAttribute('aria-label','Avto Lent');x.innerHTML='<i class="fa-solid fa-bolt"></i>';a.insertBefore(x,a.firstChild)}
 function boot(){socialShortcut();if(page==='explore')explore();if(page==='messages')messages();if(page==='profile')profile();if(page==='create-listing')createSteps();if(page==='auth')oauth();realtimeSounds()}
 addEventListener('avtovip:language',()=>{ /* app.js + social.js own the full dynamic translation cycle */ });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* AvtoVIP UI hotfix v23 — removes the recursive DOM observer that could freeze browser/PWA. */
(()=>{'use strict';
 const $=(s,p=document)=>p.querySelector(s);
 const lang=()=>localStorage.getItem('avtovip-lang')||'az';
 const TX={
  az:{settings:'Tənzimləmələr',theme:'Tema',language:'Dil',followers:'Takipçi',following:'Takip',ads:'Elanlar',likes:'Bəyənilən',pull:'Yeniləmək üçün burax'},
  en:{settings:'Settings',theme:'Theme',language:'Language',followers:'Followers',following:'Following',ads:'Listings',likes:'Liked',pull:'Release to refresh'},
  ru:{settings:'Настройки',theme:'Тема',language:'Язык',followers:'Подписчики',following:'Подписки',ads:'Объявления',likes:'Понравившиеся',pull:'Отпустите для обновления'},
  tr:{settings:'Ayarlar',theme:'Tema',language:'Dil',followers:'Takipçiler',following:'Takip',ads:'İlanlar',likes:'Beğenilenler',pull:'Yenilemek için bırak'},
  ka:{settings:'პარამეტრები',theme:'თემა',language:'ენა',followers:'გამომწერები',following:'გამოწერები',ads:'განცხადებები',likes:'მოწონებული',pull:'გასაახლებლად გაუშვით'}
 };
 const t=k=>(TX[lang()]||TX.az)[k]||k;
 const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value};
 function localizeInjected(){
   const railFlag=$('[data-av-rail-flag]'); if(railFlag){railFlag.src=`assets/img/flags/${lang()}.svg`;railFlag.alt=lang().toUpperCase();}
   const spans=document.querySelectorAll('.av-profile-stats span');
   ['followers','following','ads','likes'].forEach((k,i)=>setText(spans[i],t(k)));
   document.querySelectorAll('[data-av-rail-label]').forEach(x=>setText(x,t(x.dataset.avRailLabel)));
   setText($('.av-pull-indicator'),t('pull'));
 }
 function rail(){
   if(!matchMedia('(min-width:901px)').matches)return;
   const nav=$('.bottom-nav'); if(!nav||$('.av-desktop-rail-tools'))return;
   const tools=document.createElement('div'); tools.className='av-desktop-rail-tools';
   tools.innerHTML=`<a class="av-rail-action" href="ayarlar.html"><i class="fa-solid fa-gear"></i><span data-av-rail-label="settings">${t('settings')}</span></a><button class="av-rail-action" type="button" data-av-lang><img class="av-rail-flag" data-av-rail-flag src="assets/img/flags/${lang()}.svg" alt=""><span data-av-rail-label="language">${t('language')}</span></button><button class="av-rail-action" type="button" data-av-theme><i class="fa-solid fa-circle-half-stroke"></i><span data-av-rail-label="theme">${t('theme')}</span></button>`;
   nav.append(tools);
   tools.querySelector('[data-av-theme]').addEventListener('click',()=>$('#themeBtn')?.click());
   tools.querySelector('[data-av-lang]').addEventListener('click',()=>{const sel=$('#langSelect');if(!sel)return;const order=['az','en','ru','tr','ka'];const i=Math.max(0,order.indexOf(sel.value));sel.value=order[(i+1)%order.length];sel.dispatchEvent(new Event('change',{bubbles:true}))});
 }
 function pullRefresh(){
   if(document.body.dataset.page==='messages')return;
   if(!matchMedia('(max-width:900px)').matches||$('.av-pull-indicator'))return;
   const el=document.createElement('div');el.className='av-pull-indicator';el.textContent=t('pull');document.body.append(el);
   let startY=null,armed=false;
   document.addEventListener('touchstart',e=>{startY=(window.scrollY<=0&&e.touches.length===1)?e.touches[0].clientY:null;armed=false},{passive:true});
   document.addEventListener('touchmove',e=>{if(startY===null)return;const d=e.touches[0].clientY-startY;armed=d>90;el.classList.toggle('show',d>50)},{passive:true});
   document.addEventListener('touchend',()=>{el.classList.remove('show');const refresh=armed;startY=null;armed=false;if(refresh)setTimeout(()=>location.reload(),0)},{passive:true});
   document.addEventListener('touchcancel',()=>{el.classList.remove('show');startY=null;armed=false},{passive:true});
 }
 function boot(){rail();pullRefresh();localizeInjected();setTimeout(localizeInjected,250);addEventListener('avtovip:language',()=>requestAnimationFrame(localizeInjected));}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
