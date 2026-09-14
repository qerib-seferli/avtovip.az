/* AvtoVIP Patch 11 — realtime/UI/i18n hardening. Loaded after app.js + social.js. */
(() => {
  'use strict';
  const db = window.avtoDb;
  if (!db?.client) return;
  const sb = db.client;
  const $ = (s,p=document)=>p.querySelector(s);
  const $$ = (s,p=document)=>[...p.querySelectorAll(s)];
  const lang = ()=>localStorage.getItem('avtovip-lang') || 'az';
  const T = {
    profileInfo:{az:'Profil məlumatları',en:'Profile information',ru:'Данные профиля',tr:'Profil bilgileri',ka:'პროფილის ინფორმაცია'},
    myListings:{az:'Mənim elanlarım',en:'My listings',ru:'Мои объявления',tr:'İlanlarım',ka:'ჩემი განცხადებები'},
    noOwnListings:{az:'Hələ elan yerləşdirməmisiniz.',en:'You have not posted any listings yet.',ru:'Вы пока не разместили объявлений.',tr:'Henüz ilan vermediniz.',ka:'განცხადება ჯერ არ დაგიმატებიათ.'},
    balancePayments:{az:'Balans və ödənişlər',en:'Balance & payments',ru:'Баланс и платежи',tr:'Bakiye ve ödemeler',ka:'ბალანსი და გადახდები'},
    financeSub:{az:'Xidmətlər, balans artırmaları və ödəniş tarixçəsi.',en:'Services, balance top-ups and payment history.',ru:'Услуги, пополнения баланса и история платежей.',tr:'Hizmetler, bakiye yüklemeleri ve ödeme geçmişi.',ka:'სერვისები, ბალანსის შევსება და გადახდების ისტორია.'},
    balance:{az:'Balans',en:'Balance',ru:'Баланс',tr:'Bakiye',ka:'ბალანსი'},
    topup:{az:'Balansı artır',en:'Add funds',ru:'Пополнить',tr:'Bakiye yükle',ka:'ბალანსის შევსება'},
    payments:{az:'Ödənişlər',en:'Payments',ru:'Платежи',tr:'Ödemeler',ka:'გადახდები'},
    walletTx:{az:'Balans əməliyyatları',en:'Balance activity',ru:'Операции по балансу',tr:'Bakiye hareketleri',ka:'ბალანსის ოპერაციები'},
    noPayment:{az:'Ödəniş sorğusu yoxdur.',en:'No payment requests.',ru:'Нет запросов на оплату.',tr:'Ödeme talebi yok.',ka:'გადახდის მოთხოვნა არ არის.'},
    noWallet:{az:'Balans əməliyyatı yoxdur.',en:'No balance activity.',ru:'Операций по балансу нет.',tr:'Bakiye hareketi yok.',ka:'ბალანსის ოპერაცია არ არის.'},
    listings:{az:'Elanlar',en:'Listings',ru:'Объявления',tr:'İlanlar',ka:'განცხადებები'},
    listingUnit:{az:'elan',en:'listing',ru:'объявление',tr:'ilan',ka:'განცხადება'},
    messages:{az:'Mesajlar',en:'Messages',ru:'Сообщения',tr:'Mesajlar',ka:'შეტყობინებები'},
    msgSub:{az:'Satıcı və alıcı arasında real-time yazışma.',en:'Real-time chat between buyer and seller.',ru:'Чат в реальном времени между покупателем и продавцом.',tr:'Alıcı ve satıcı arasında gerçek zamanlı mesajlaşma.',ka:'რეალურ დროში მიმოწერა მყიდველსა და გამყიდველს შორის.'},
    writeMessage:{az:'Mesaj yazın...',en:'Write a message...',ru:'Напишите сообщение...',tr:'Mesaj yazın...',ka:'დაწერეთ შეტყობინება...'},
    chooseChat:{az:'Mesajlaşmaq üçün istifadəçi seçin.',en:'Select a conversation to start messaging.',ru:'Выберите диалог, чтобы начать переписку.',tr:'Mesajlaşmak için bir konuşma seçin.',ka:'მიმოწერისთვის აირჩიეთ საუბარი.'},
    blocked:{az:'Bu istifadəçi ilə mesajlaşma mümkün deyil.',en:'Messaging with this user is unavailable.',ru:'Переписка с этим пользователем недоступна.',tr:'Bu kullanıcıyla mesajlaşma kullanılamıyor.',ka:'ამ მომხმარებელთან მიმოწერა მიუწვდომელია.'},
    verified:{az:'Təsdiqlənmiş hesab',en:'Verified account',ru:'Подтверждённый аккаунт',tr:'Doğrulanmış hesap',ka:'ვერიფიცირებული ანგარიში'},
    followers:{az:'Takipçilər',en:'Followers',ru:'Подписчики',tr:'Takipçiler',ka:'გამომწერები'},
    following:{az:'Takip etdikləri',en:'Following',ru:'Подписки',tr:'Takip edilenler',ka:'გამოწერები'},
    blockedUsers:{az:'Bloklananlar',en:'Blocked',ru:'Заблокированные',tr:'Engellenenler',ka:'დაბლოკილები'},
    explore:{az:'Kəşfet',en:'Explore',ru:'Обзор',tr:'Keşfet',ka:'აღმოაჩინე'},
    noExplore:{az:'Hazırda göstəriləcək elan yoxdur.',en:'No listings to show right now.',ru:'Сейчас нет объявлений для показа.',tr:'Şu anda gösterilecek ilan yok.',ka:'ამჟამად საჩვენებელი განცხადება არ არის.'},
    searchExplore:{az:'Marka, model, insan adı...',en:'Make, model, person name...',ru:'Марка, модель, имя пользователя...',tr:'Marka, model, kişi adı...',ka:'ბრენდი, მოდელი, მომხმარებლის სახელი...'},
    country:{az:'Ölkə',en:'Country',ru:'Страна',tr:'Ülke',ka:'ქვეყანა'},
    city:{az:'Şəhər',en:'City',ru:'Город',tr:'Şehir',ka:'ქალაქი'},
    address:{az:'Ünvan',en:'Address',ru:'Адрес',tr:'Adres',ka:'მისამართი'},
    about:{az:'Haqqında',en:'About',ru:'О себе',tr:'Hakkında',ka:'შესახებ'},
    name:{az:'Ad',en:'Name',ru:'Имя',tr:'Ad',ka:'სახელი'},
    surname:{az:'Soyad',en:'Surname',ru:'Фамилия',tr:'Soyad',ka:'გვარი'},
    phone:{az:'Telefon',en:'Phone',ru:'Телефон',tr:'Telefon',ka:'ტელეფონი'},
    save:{az:'Yadda saxla',en:'Save',ru:'Сохранить',tr:'Kaydet',ka:'შენახვა'},
    logout:{az:'Çıxış',en:'Sign out',ru:'Выйти',tr:'Çıkış',ka:'გასვლა'},
    follow:{az:'Takip et',en:'Follow',ru:'Подписаться',tr:'Takip et',ka:'გამოწერა'},
    followingBtn:{az:'Takip edilir',en:'Following',ru:'Вы подписаны',tr:'Takip ediliyor',ka:'გამოწერილი'},
    block:{az:'Blokla',en:'Block',ru:'Заблокировать',tr:'Engelle',ka:'დაბლოკვა'},
    unblock:{az:'Blokdan çıxar',en:'Unblock',ru:'Разблокировать',tr:'Engeli kaldır',ka:'განბლოკვა'},
    message:{az:'Mesaj',en:'Message',ru:'Сообщение',tr:'Mesaj',ka:'შეტყობინება'},
    notifications:{az:'Bildirişlər',en:'Notifications',ru:'Уведомления',tr:'Bildirimler',ka:'შეტყობინებები'},
    trust:{az:'Etibar',en:'Trust',ru:'Доверие',tr:'Güven',ka:'ნდობა'},
    chatService:{az:'AvtoVIP mesajlaşma',en:'AvtoVIP messaging',ru:'Чат AvtoVIP',tr:'AvtoVIP mesajlaşma',ka:'AvtoVIP მიმოწერა'},
    markRead:{az:'Hamısını oxunmuş et',en:'Mark all read',ru:'Отметить всё прочитанным',tr:'Tümünü okundu yap',ka:'ყველას წაკითხულად მონიშვნა'},
    home:{az:'Əsas',en:'Home',ru:'Главная',tr:'Ana Sayfa',ka:'მთავარი'},
    create:{az:'Elan ver',en:'Post ad',ru:'Подать объявление',tr:'İlan Ver',ka:'განცხადების დამატება'},
    profile:{az:'Profil',en:'Profile',ru:'Профиль',tr:'Profil',ka:'პროფილი'},
  };
  const tr = key => T[key]?.[lang()] || T[key]?.en || key;
  const reverse = new Map();
  Object.entries(T).forEach(([k,o])=>Object.values(o).forEach(v=>reverse.set(String(v).trim(),k)));

  function localizeKnownText(root=document){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); const nodes=[]; let n;
    while((n=walker.nextNode())) nodes.push(n);
    for(const node of nodes){
      const p=node.parentElement; if(!p || p.closest('.bubble p,.profile-name h1,.chat-peer-link strong,.conversation-copy strong,.notification-row strong,.payment-history-row strong,[data-no-p11-i18n]')) continue;
      const raw=node.nodeValue.trim(); if(!raw) continue; const key=reverse.get(raw); if(!key) continue;
      const lead=node.nodeValue.match(/^\s*/)?.[0]||'', tail=node.nodeValue.match(/\s*$/)?.[0]||''; node.nodeValue=lead+tr(key)+tail;
    }
    $$('input[placeholder],textarea[placeholder]',root).forEach(el=>{
      const key=reverse.get(el.placeholder.trim()); if(key) el.placeholder=tr(key);
    });
    $$('[id$="ListingCount"],#resultCount').forEach(el=>{const parent=el.parentElement;if(!parent)return;const n=(parent.textContent.match(/\d+/)||[])[0];if(n!==undefined){for(const node of [...parent.childNodes]){if(node.nodeType===3&&node.nodeValue.trim()){node.nodeValue=` ${tr('listingUnit')}`}}}});
    const unit=$('#myListingUnit');if(unit)unit.textContent=tr('listingUnit');
    const mapping=[
      ['#exploreSearch','searchExplore'],['#chatInput','writeMessage']
    ]; mapping.forEach(([s,k])=>{const e=$(s);if(e)e.placeholder=tr(k)});
    const navKeys={home:'home',explore:'explore',create:'create',messages:'messages',profile:'profile'};
    Object.entries(navKeys).forEach(([nav,key])=>{const e=$(`.bottom-nav [data-nav="${nav}"] span`,root);if(e)e.textContent=tr(key)});
  }


  function isoFlag(code){
    code=String(code||'').trim().toUpperCase();
    if(!/^[A-Z]{2}$/.test(code))return '';
    try{return String.fromCodePoint(...[...code].map(c=>127397+c.charCodeAt(0)))}catch{return ''}
  }
  function syncCountrySelectFlags(root=document){
    const ids=['filterCountry','filterCountryAdvanced','profileCountry','countryCode'];
    ids.forEach(id=>{
      const sel=root.getElementById?root.getElementById(id):document.getElementById(id); if(!sel)return;
      const wrap=sel.closest('.av-select'); const btn=wrap?.querySelector('.av-select-btn span'); if(!btn)return;
      const opt=sel.selectedOptions?.[0], code=sel.value, label=opt?.textContent?.trim()||'';
      if(code){const flag=isoFlag(code); const clean=label.replace(/^\p{Regional_Indicator}{2}\s*/u,'').replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u,'');btn.textContent=`${flag?flag+' ':''}${clean}`}
      else btn.textContent=label;
    });
  }

  const flagAssets={AZ:'assets/img/flags/az.svg',GB:'assets/img/flags/en.svg',RU:'assets/img/flags/ru.svg',TR:'assets/img/flags/tr.svg',GE:'assets/img/flags/ka.svg',US:'assets/img/flags/us.svg'};
  function flagImg(code, cls='profile-country-flag-img'){
    const src=flagAssets[String(code||'').toUpperCase()];
    return src?`<img class="${cls}" src="${src}" alt="${String(code||'').toUpperCase()}">`:'';
  }
  async function relocalizeProfileCountry(){
    const sel=$('#profileCountry'); if(!sel||!window.AvtoVIPInternational?.countries)return;
    const selected=sel.value; try{const countries=await window.AvtoVIPInternational.countries(lang());sel.innerHTML=countries.filter(c=>c.iso2!=='AM').map(c=>`<option value="${c.iso2}">${c.emoji||''} ${String(c.displayName||c.name||c.iso2).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</option>`).join('');sel.value=selected;if(sel.dataset.avSelect==='1')sel.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){console.warn('[Patch11 country i18n]',e)}
  }
  function fixCountryFlags(){
    $$('.profile-country-flag').forEach(el=>{const code=(el.getAttribute('aria-label')||el.dataset.country||'').toUpperCase();const html=flagImg(code);if(html)el.innerHTML=html;});
    // Public profile stores country code before the name. Replace plain ISO code with a real local flag where possible.
    $$('.public-profile-head .profile-country-flag-img').forEach(img=>{img.style.objectFit='cover'});
  }

  const verifiedSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.7l2.2 1.7 2.8-.3 1.2 2.5 2.6 1 .1 2.8 1.9 2-1.4 2.4.7 2.7-2.4 1.5-.5 2.8-2.8.1-1.7 2.2-2.7-.9-2.7.9-1.7-2.2-2.8-.1-.5-2.8-2.4-1.5.7-2.7-1.4-2.4 1.9-2 .1-2.8 2.6-1 1.2-2.5 2.8.3L12 1.7z"/><path fill="#fff" d="M10.55 15.95L6.8 12.2l1.45-1.45 2.3 2.3 5.15-5.15 1.45 1.45-6.6 6.6z"/></svg>';
  function fixVerified(){
    $$('.verified-rosette,.verified-mark').forEach(el=>{el.classList.add('verified-badge-pro');el.innerHTML=verifiedSvg;el.title=tr('verified');el.setAttribute('aria-label',tr('verified'))});
  }

  function decorateTierCards(){
    const own=$('.profile-head');
    if(own){own.classList.remove('tier-vip','tier-premium');const avatar=$('#profileAvatar');if(avatar?.classList.contains('premium-avatar'))own.classList.add('tier-premium');else if(avatar?.classList.contains('vip-avatar'))own.classList.add('tier-vip');}
    $$('.public-profile-head').forEach(card=>{card.classList.toggle('tier-vip',card.classList.contains('vip'));card.classList.toggle('tier-premium',card.classList.contains('premium'))});
  }

  function fixMessagesUI(){
    const shell=$('#messagesShell'), pane=$('#chatPane'), form=$('#chatForm'), input=$('#chatInput');
    if(!shell||!pane) return;
    const selected=!!pane.dataset.peer;
    shell.classList.toggle('p11-no-chat',!selected);
    if(!selected){ if(form) form.hidden=true; $('#chatMessages')?.replaceChildren(); const peer=$('#chatPeerName'); if(peer) peer.textContent=tr('chooseChat'); }
    if(input)input.placeholder=tr('writeMessage');
    $$('.conversation-item').forEach(card=>{card.classList.add('p11-conversation')});
    syncCountrySelectFlags();
  }

  async function refreshProfileLive(userId){
    if(document.body.dataset.page!=='profile'||!userId)return;
    try{
      const [{data:p},{count:followers},{count:following},{count:blocked},{data:payments},{data:walletTx}]=await Promise.all([
        sb.from('users').select('wallet_balance,wallet_currency,preferred_currency,country_code,membership_tier,is_verified').eq('id',userId).maybeSingle(),
        sb.from('user_follows').select('*',{count:'exact',head:true}).eq('following_id',userId),
        sb.from('user_follows').select('*',{count:'exact',head:true}).eq('follower_id',userId),
        sb.from('user_blocks').select('*',{count:'exact',head:true}).eq('blocker_id',userId),
        sb.from('payment_requests').select('id').eq('user_id',userId).order('created_at',{ascending:false}).limit(1),
        sb.from('wallet_transactions').select('id').eq('user_id',userId).order('created_at',{ascending:false}).limit(1)
      ]);
      const links=$$('#ownSocialStats [data-show-social]'); if(links[0])links[0].querySelector('b').textContent=followers||0;if(links[1])links[1].querySelector('b').textContent=following||0;if(links[2])links[2].querySelector('b').textContent=blocked||0;
      const currency=p?.wallet_currency||p?.preferred_currency||({AZ:'AZN',RU:'RUB',TR:'TRY',GE:'GEL',US:'USD',GB:'GBP'}[String(p?.country_code||'').toUpperCase()])||'USD';
      const wb=$('#walletBalance');if(wb)try{wb.textContent=new Intl.NumberFormat(undefined,{style:'currency',currency,maximumFractionDigits:2}).format(Number(p?.wallet_balance||0))}catch{wb.textContent=`${Number(p?.wallet_balance||0)} ${currency}`}
      if(window.AvtoVIPUI?.loadOwnPayments&&payments)window.AvtoVIPUI.loadOwnPayments(userId); if(window.AvtoVIPUI?.loadWalletTransactions&&walletTx)window.AvtoVIPUI.loadWalletTransactions(userId);
    }catch(e){console.warn('[Patch11 profile realtime]',e)}
  }

  let rtChannels=[],rtRetry=null, rtUser=null;
  async function teardownRealtime(){for(const c of rtChannels){try{await sb.removeChannel(c)}catch{}}rtChannels=[];}
  async function setupRealtime(){
    const {data:{session}}=await sb.auth.getSession();const uid=session?.user?.id;if(!uid)return;if(rtUser===uid&&rtChannels.length)return;rtUser=uid;await teardownRealtime();
    const refreshMsg=()=>{window.AvtoVIPUI?.updateMessageBadge?.(); if(document.body.dataset.page==='messages'){window.AvtoVIPUI?.renderConversations?.(uid);const pane=$('#chatPane');if(pane?.dataset.peer)window.AvtoVIPUI?.renderThread?.(pane.dataset.peer,pane.dataset.listing||'')}};
    const refreshNotif=()=>document.dispatchEvent(new CustomEvent('avtovip:p11-notifications'));
    const refreshProfile=()=>refreshProfileLive(uid);const refreshBlocks=()=>{refreshProfileLive(uid);refreshMsg();syncBlockedComposer(uid)};
    const status=(name)=>s=>{if(s==='SUBSCRIBED')document.documentElement.dataset.realtime='on'; if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED'){console.warn(`[AvtoVIP realtime:${name}]`,s);document.documentElement.dataset.realtime='retry';clearTimeout(rtRetry);rtRetry=setTimeout(()=>{rtUser=null;setupRealtime()},2500)}};
    const msg=sb.channel(`p11-msg-${uid}-${Date.now()}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'messages',filter:`receiver_id=eq.${uid}`},refreshMsg)
      .on('postgres_changes',{event:'*',schema:'public',table:'messages',filter:`sender_id=eq.${uid}`},refreshMsg).subscribe(status('messages'));
    const note=sb.channel(`p11-note-${uid}-${Date.now()}`).on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`user_id=eq.${uid}`},refreshNotif).subscribe(status('notifications'));
    const social=sb.channel(`p11-social-${uid}-${Date.now()}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'user_follows',filter:`follower_id=eq.${uid}`},refreshProfile)
      .on('postgres_changes',{event:'*',schema:'public',table:'user_follows',filter:`following_id=eq.${uid}`},refreshProfile)
      .on('postgres_changes',{event:'*',schema:'public',table:'user_blocks',filter:`blocker_id=eq.${uid}`},refreshBlocks)
      .on('postgres_changes',{event:'*',schema:'public',table:'user_blocks',filter:`blocked_id=eq.${uid}`},refreshBlocks).subscribe(status('social'));
    const finance=sb.channel(`p11-fin-${uid}-${Date.now()}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'payment_requests',filter:`user_id=eq.${uid}`},refreshProfile)
      .on('postgres_changes',{event:'*',schema:'public',table:'wallet_transactions',filter:`user_id=eq.${uid}`},refreshProfile)
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'users',filter:`id=eq.${uid}`},refreshProfile).subscribe(status('finance'));
    rtChannels=[msg,note,social,finance];
  }

  async function syncBlockedComposer(uid){
    const pane=$('#chatPane'),peer=pane?.dataset.peer,form=$('#chatForm'),notice=$('#chatBlockedNotice');if(!uid||!peer||!form)return;
    const {data,error}=await sb.from('user_blocks').select('blocker_id,blocked_id').or(`and(blocker_id.eq.${uid},blocked_id.eq.${peer}),and(blocker_id.eq.${peer},blocked_id.eq.${uid})`).limit(2);if(error){console.warn('[Patch11 block sync]',error);form.hidden=false;if(notice)notice.hidden=true;return}const rows=data||[],blocked=rows.length>0;form.hidden=blocked; if(notice){notice.hidden=!blocked;if(blocked)notice.textContent=tr('blocked')}
  }
  async function refreshLanguageBoundData(){
    patchAll();relocalizeProfileCountry();const {data:{session}}=await sb.auth.getSession();const uid=session?.user?.id;if(!uid)return;
    if(document.body.dataset.page==='profile'){window.AvtoVIPUI?.loadOwnListings?.(uid);window.AvtoVIPUI?.loadOwnPayments?.(uid);window.AvtoVIPUI?.loadWalletTransactions?.(uid)}
    if(document.body.dataset.page==='messages'){window.AvtoVIPUI?.renderConversations?.(uid);const pane=$('#chatPane');if(pane?.dataset.peer)window.AvtoVIPUI?.renderThread?.(pane.dataset.peer,pane.dataset.listing||'')}
  }
  async function refreshNotificationBadge(){
    const badge=$('#notificationBadge'); if(!badge)return; const {data:{session}}=await sb.auth.getSession();if(!session?.user)return;const {count}=await sb.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',session.user.id).eq('is_read',false);badge.textContent=count>99?'99+':String(count||0);badge.hidden=!count;
  }

  function fixFinanceLanguage(){
    const panel=$('.account-finance-panel');if(!panel)return;
    const h=panel.querySelector('.finance-head h3');if(h)h.textContent=tr('balancePayments');const sub=panel.querySelector('.finance-head p');if(sub)sub.textContent=tr('financeSub');
    const wlabel=panel.querySelector('.wallet-box>span');if(wlabel)wlabel.textContent=tr('balance');const top=$('#walletTopupBtn');if(top)top.innerHTML=`<i class="fa-solid fa-plus"></i> ${tr('topup')}`;
    const hs=panel.querySelectorAll('.finance-grid h4');if(hs[0])hs[0].textContent=tr('payments');if(hs[1])hs[1].textContent=tr('walletTx');
  }

  function patchAll(){
    localizeKnownText();fixCountryFlags();fixVerified();decorateTierCards();fixMessagesUI();fixFinanceLanguage();syncCountrySelectFlags();
    const trust=$('.status-pill.approved');if(trust&&/Etibar|Trust|Доверие|Güven|ნდობა/.test(trust.textContent))trust.childNodes.forEach(n=>{if(n.nodeType===3&&n.nodeValue.trim())n.nodeValue=' '+tr('trust')+' '});
    const chatSub=$('#chatPeerLink .muted.tiny');if(chatSub)chatSub.textContent=tr('chatService');
  }
  let moTimer=0; const mo=new MutationObserver(()=>{clearTimeout(moTimer);moTimer=setTimeout(patchAll,60)});
  function boot(){
    patchAll(); mo.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('avtovip:language',()=>setTimeout(refreshLanguageBoundData,0));
    document.addEventListener('avtovip:p11-notifications',()=>{refreshNotificationBadge();const pop=$('#notificationPopover');if(pop){pop.remove();document.documentElement.classList.remove('popover-open')}});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){rtUser=null;setupRealtime();refreshNotificationBadge()}});window.addEventListener('online',()=>{rtUser=null;setupRealtime()});
    setupRealtime();refreshNotificationBadge();setTimeout(refreshLanguageBoundData,120);setTimeout(()=>{patchAll();decorateTierCards();syncCountrySelectFlags();},450);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,80),{once:true});else setTimeout(boot,80);
})();
