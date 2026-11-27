(()=>{'use strict';
const sb=window.avtoDb?.client;if(!sb)return;
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>{try{return new Intl.DateTimeFormat(document.documentElement.lang||'az',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(d))}catch{return''}};
const fmtPostDate=d=>{try{return new Intl.DateTimeFormat(document.documentElement.lang||'az',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d))}catch{return''}};
const identity=window.AvtoVIPIdentity||{}; const verified=(size=16)=>identity.verifiedBadge?identity.verifiedBadge(size):`<span class="av-user-verified" title="Təsdiqlənmiş hesab" aria-label="Təsdiqlənmiş hesab"><img src="assets/img/identity/mavi-tik-16x16.svg" alt="" aria-hidden="true"></span>`; const avatarVerifiedClass=u=>identity.avatarVerifiedClass?identity.avatarVerifiedClass(!!u):((u)?' is-verified':'');
const tierMark=t=>t==='vip'?'<i class="fa-solid fa-crown avatar-crown" aria-label="VIP"></i>':t==='premium'?'<i class="fa-solid fa-gem avatar-gem" aria-label="Premium"></i>':'';
const fullName=u=>[u?.name,u?.surname].filter(Boolean).join(' ')||'AvtoVIP istifadəçisi';
const isVideo=(url='',type='')=>String(type).startsWith('video/')||/\.(mp4|webm|mov|m4v)(\?|$)/i.test(String(url));
const POST_FEED_FIELDS='id,user_id,caption,media_urls,media_types,created_at,is_reel';
const EMOJIS=['😀','😃','😄','😁','😂','😍','🥰','😎','🤩','😊','😉','❤️','🔥','👍','👏','🚗','✨','💯'];
let me=null,posts=[],users={},likes=new Map(),commentsCount=new Map(),sharesCount=new Map(),savesCount=new Map(),viewsCount=new Map(),myLikes=new Set(),following=new Set(),saved=new Set(),activeModalIndex=-1;
let soundEnabled=localStorage.getItem('avtovip-social-sound')==='1',viewerHistoryPushed=false,commentsHistoryPushed=false,commentsOpenedFromViewer=false;
let socialCountTablesReady=true,viewCounterReady=true;
let composerFiles=[];let ffmpegInstance=null;

async function auth(){me=await window.avtoDb.getUser();return me}
function mediaFor(p){return (p.media_urls||[]).map((url,i)=>({url,type:p.media_types?.[i]||'',video:isVideo(url,p.media_types?.[i]||'')})).filter(x=>x.url)}
function normalizeTag(v=''){return String(v).trim().replace(/^#+/,'').normalize('NFKC').replace(/[^\p{L}\p{N}_-]+/gu,'').slice(0,48)}
function postText(p){const raw=String(p?.caption||'').trim(),tags=[];const seen=new Set();const re=/(^|\s)#([\p{L}\p{N}_-]{2,48})(?=\s|$|[.,!?;:])/gu;let m;while((m=re.exec(raw))){const t=normalizeTag(m[2]);if(t&&!seen.has(t.toLocaleLowerCase())){seen.add(t.toLocaleLowerCase());tags.push(t)}}const text=raw.replace(re,(all,lead)=>lead).replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();return {text,tags}}
function hashtagHtml(tags=[]){return tags.length?`<div class="av-post-hashtags">${tags.map(t=>`<button type="button" data-hashtag="${esc(t)}">#${esc(t)}</button>`).join('')}</div>`:''}
function hashtagHref(tag){const page=document.body.dataset.page==='reels'?'reels.html':'lent.html';return `${page}?tag=${encodeURIComponent(tag)}`}

function author(u,userId){const t=String(u?.membership_tier||'free').toLowerCase();return `<a class="av-social-author" href="user.html?id=${encodeURIComponent(userId||'')}"><span class="feed-avatar-shell avatar-shell ${t}${avatarVerifiedClass(u?.is_verified)}"><img src="${esc(u?.avatar_url||'assets/img/brand/icon-192.png')}" alt="">${tierMark(t)}</span><span class="av-social-author-copy"><strong>${u?.is_verified?verified():''}<span>${esc(fullName(u))}</span></strong></span></a>`}
function bump(map,id,delta){map.set(id,Math.max(0,(map.get(id)||0)+delta))}

const FEED_PAGE = 24;
let loadNextReels = null;
const moreLabel = () => ({az:'Daha çox göstər',en:'Show more',ru:'Показать ещё',tr:'Daha fazla göster',ka:'მეტის ჩვენება'})[document.documentElement.lang] || 'Daha çox göstər';

async function load(){
 const root = $('#socialFeed');
 if (!root) return;
 const reels = document.body.dataset.page === 'reels';
 const tag = normalizeTag(new URL(location.href).searchParams.get('tag') || '');
 const hash = new URLSearchParams(location.hash.slice(1));
 const requestedId = hash.get('post');
 const fromProfile = hash.get('from') === 'profile';
 const openComments = hash.get('comments') === '1';
 const eligible = row => (reels ? row.is_reel === true && mediaFor(row).some(m => m.video) : row.is_reel !== true);
 const matchesTag = row => !tag || postText(row).tags.some(t => t.toLowerCase() === tag.toLowerCase());
 const seen = new Set();
 const more = document.createElement(reels?'div':'button');
 if(!reels)more.type = 'button';
 more.className = reels?'av-reel-page-sentinel':'btn btn-outline';
 if(reels)more.setAttribute('aria-hidden','true');
 else more.textContent = moreLabel();
 more.hidden = true;
 root.after(more);
 root.className = reels ? 'av-reels-grid' : 'av-feed-list';
 let cursor = null, exhausted = false, hasViewCount = true;
 const query = fields => {
  let q = sb.from('posts').select(fields).eq('status','active')
   .order('created_at',{ascending:false}).order('id',{ascending:false}).limit(FEED_PAGE);
  if (reels) q = q.eq('is_reel',true);
  else if (!cursor) q = q.or('is_reel.eq.false,is_reel.is.null');
  if (tag) q = q.ilike('caption',`%#${tag}%`);
  if (cursor) {
   const newerPage = `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`;
   q = q.or(reels ? newerPage : `and(or(is_reel.eq.false,is_reel.is.null),or(${newerPage}))`);
  }
  return q;
 };
 const appendPage = async (first = false) => {
  more.disabled = true;
  const next = [];
  const previousCursor = cursor, previousExhausted = exhausted;
  try {
   if (!exhausted) {
    // Hashtag prefix matches can contain other tags. Advance through bounded
    // pages even when all rows in a page are discarded by exact matching.
    for (let page = 0; page < 3 && !exhausted && !next.length; page++) {
     let result = await query(POST_FEED_FIELDS + (hasViewCount ? ',view_count' : ''));
     if (hasViewCount && result.error?.code === '42703') {
      hasViewCount = false;
      result = await query(POST_FEED_FIELDS);
     }
     if (result.error) throw result.error;
     const rows = result.data || [];
     exhausted = rows.length < FEED_PAGE;
     if (rows.length) cursor = rows.at(-1);
     next.push(...rows.filter(row => !seen.has(row.id) && eligible(row) && matchesTag(row)));
    }
   }
   if (first && requestedId && !next.some(row => row.id === requestedId)) {
    const exact = await sb.from('posts').select('*').eq('id',requestedId).eq('status','active').maybeSingle();
    if (exact.data && eligible(exact.data)) next.unshift(exact.data);
   }
   if(reels){
    for(let index=next.length-1;index>0;index--){
     const swap=Math.floor(Math.random()*(index+1));
     [next[index],next[swap]]=[next[swap],next[index]];
    }
   }
   if (next.length) {
    await loadPostDetails(next);
    const offset = posts.length;
    next.forEach(row => seen.add(row.id));
    posts.push(...next);
    root.querySelector('.empty-state')?.remove();
    if (tag && !root.querySelector('.av-hashtag-filter')) {
     root.insertAdjacentHTML('afterbegin',`<div class="av-hashtag-filter"><span>#${esc(tag)}</span><a href="${reels?'reels.html':'lent.html'}" aria-label="Filtri təmizlə">×</a></div>`);
    }
    const batch = document.createElement('template');
    batch.innerHTML = reels ? reelMarkup(next,offset) : feedMarkup(next,offset);
    const cards = [...batch.content.children];
    root.append(batch.content);
    if (reels) {
     setupGridPlayback(root,cards);
    } else {
     setupCarousels(cards);
     setupFeedPlayback(root,cards);
    }
    setupPostViews(root,cards);
   }
   if (!posts.length && exhausted) {
    root.innerHTML = tag ? `<div class="av-hashtag-filter"><span>#${esc(tag)}</span><a href="${reels?'reels.html':'lent.html'}">Filtri təmizlə</a></div><div class="empty-state">Bu heşteqlə paylaşım tapılmadı.</div>` : '<div class="empty-state">Hələ paylaşım yoxdur.</div>';
   }
   more.hidden = exhausted;
  } catch (error) {
   cursor=previousCursor;
   exhausted=previousExhausted;
   if (!posts.length) root.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`;
   else postNotice(error.message,'error');
   more.hidden = reels;
   if(reels)window.addEventListener('online',()=>{more.hidden=false},{once:true});
  } finally {
   more.disabled = false;
  }
 };
 let paging;
 const loadNext = () => paging ||= appendPage().finally(() => { paging=null; });
 if(reels){
  loadNextReels=()=>exhausted?null:loadNext();
  let observer;
  observer=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting)||exhausted)return;
   observer.unobserve(more);
   loadNext().finally(()=>{if(!exhausted)observer.observe(more)});
  },{rootMargin:'560px 0px'});
  observer.observe(more);
 }else{
  more.onclick=loadNext;
  window.addEventListener('avtovip:language',()=>{more.textContent=moreLabel()});
 }
 if (reels) root.addEventListener('click',event => {
  const tile = event.target.closest('[data-reel-index]');
  if (!tile) return;
  const index = Number(tile.dataset.reelIndex);
  registerPostView(posts[index]?.id);
  openViewer(index);
 });
 else bindActions(root);
 await appendPage(true);
 const index = posts.findIndex(row => row.id === requestedId);
 if (index < 0) return;
 if (reels) {
  openViewer(index);
  if (openComments) requestAnimationFrame(() => openPostComments(requestedId));
 } else {
  const card = root.querySelector(`[data-post="${CSS.escape(requestedId)}"]`);
  requestAnimationFrame(() => {
   if (fromProfile && card) centerProfilePost(card);
   else card?.scrollIntoView({block:'center',inline:'nearest'});
   if (openComments) openPostComments(requestedId);
  });
 }
}

function centerProfilePost(card) {
 const media = card.querySelector('.av-feed-media');
 const viewport = window.visualViewport;
 const header = document.querySelector('.site-header');
 const nav = document.querySelector('.bottom-nav');
 const viewportTop = viewport?.offsetTop || 0;
 const viewportBottom = viewportTop + (viewport?.height || innerHeight);
 const top = Math.max(viewportTop, header?.getBoundingClientRect().bottom || 0);
 const navRect = nav?.getBoundingClientRect();
 const bottom = navRect?.height && navRect.top > top ? Math.min(viewportBottom, navRect.top) : viewportBottom;
 if (media) {
  media.style.setProperty('min-height', '0', 'important');
  media.style.setProperty('max-height', `${Math.max(1, bottom - top - 16)}px`, 'important');
 }
 const bounds = (media || card).getBoundingClientRect();
 const scroll = document.scrollingElement;
 let delta = (bounds.top + bounds.bottom - top - bottom) / 2;
 const missingTop = Math.max(0, -scroll.scrollTop - delta);
 const missingBottom = Math.max(0, scroll.scrollTop + delta - (scroll.scrollHeight - scroll.clientHeight));
 if (missingTop || missingBottom) {
  const list = card.parentElement;
  if (missingTop) list.style.paddingTop = `${Math.ceil(missingTop)}px`;
  if (missingBottom) list.style.paddingBottom = `${Math.ceil(missingBottom)}px`;
  delta += missingTop;
 }
 window.scrollBy({top: delta, behavior: 'instant'});
}

async function loadPostDetails(batch){
 for (const row of batch) viewsCount.set(row.id, Number(row.view_count || 0));
 const uids=[...new Set(batch.map(p=>p.user_id).filter(id=>id&&!Object.hasOwn(users,id)))];
 if(uids.length){const r=await sb.from('users').select('id,name,surname,avatar_url,membership_tier,is_verified').in('id',uids);if(!r.error)Object.assign(users,Object.fromEntries((r.data||[]).map(u=>[u.id,u])));}
 const ids=batch.map(p=>p.id);
 const metrics=await sb.rpc('av_feed_metrics',{p_ids:ids});
 if(!metrics.error){
  for(const row of metrics.data||[]){
   likes.set(row.post_id,Number(row.like_count));
   commentsCount.set(row.post_id,Number(row.comment_count));
   savesCount.set(row.post_id,Number(row.save_count));
   sharesCount.set(row.post_id,Number(row.share_count));
   if(row.liked)myLikes.add(row.post_id);
   if(row.saved)saved.add(row.post_id);
  }
 }else{
  if(!['PGRST202','42883','42P01','42501'].includes(metrics.error.code))throw metrics.error;
   const [lr,cr,sr,shr]=await Promise.all([
     sb.from('post_likes').select('post_id,user_id').in('post_id',ids),
     sb.from('post_comments').select('post_id').in('post_id',ids),
     sb.from('post_saves').select('post_id,user_id').in('post_id',ids),
     sb.from('post_shares').select('post_id').in('post_id',ids)
   ]);
   for(const x of lr.data||[]){bump(likes,x.post_id,1);if(x.user_id===me?.id)myLikes.add(x.post_id)}
   for(const x of cr.data||[])bump(commentsCount,x.post_id,1);
   if(sr.error||shr.error){socialCountTablesReady=false;console.warn('[AvtoVIP] post_saves/post_shares migration is not active yet.');}
   else{
     for(const x of sr.data||[]){bump(savesCount,x.post_id,1);if(x.user_id===me?.id)saved.add(x.post_id)}
     for(const x of shr.data||[])bump(sharesCount,x.post_id,1);
   }
 }
 if(me&&uids.length){const fr=await sb.from('user_follows').select('following_id').eq('follower_id',me.id).in('following_id',uids);(fr.data||[]).forEach(row=>following.add(row.following_id))}
}

function feedMedia(p){
 const media=mediaFor(p).slice(0,5);if(!media.length)return '';
 const slides=media.map((m,i)=>`<div class="av-feed-slide${i===0?' active':''}" data-media-slide="${i}">${m.video?`<video class="av-media-backdrop av-video-backdrop" src="${esc(m.url)}" muted playsinline preload="metadata" aria-hidden="true"></video><video class="av-feed-video" src="${esc(m.url)}" muted playsinline webkit-playsinline preload="metadata" loop disableRemotePlayback controlsList="noremoteplayback nodownload noplaybackrate" x-webkit-airplay="deny"></video><button class="av-media-sound" type="button" aria-label="Səs"><i class="fa-solid ${soundEnabled?'fa-volume-high':'fa-volume-xmark'}"></i></button><button class="av-media-fullscreen" type="button" aria-label="Videonu böyüt" title="Tam ekran"><i class="fa-solid fa-expand"></i></button><span class="av-media-progress"><i></i></span>`:`<img class="av-media-backdrop" src="${esc(m.url)}" loading="lazy" decoding="async" alt="" aria-hidden="true"><img class="av-media-main" src="${esc(m.url)}" loading="${i<2?'eager':'lazy'}" decoding="async" alt="">`}</div>`).join('');
 const nav=media.length>1?`<div class="av-carousel-count" aria-live="polite"><span data-carousel-current>1</span><span>/</span><span>${media.length}</span></div>`:'';
 return `<div class="av-feed-media" data-carousel-index="0">${slides}${nav}</div>`;
}
function captionHtml(p,u){const parsed=postText(p),cap=parsed.text,long=cap.length>110,hasTags=parsed.tags.length>0,expandable=long||hasTags;if(!cap&&!hasTags)return'';return `<div class="av-feed-caption${expandable?' is-collapsible':''}">${cap?`<div class="av-feed-caption-text${long?' is-long':''}"><span>${esc(cap)}</span>${expandable?'<button type="button" data-feed-caption-more>davamını oxu</button>':''}</div>`:`<div class="av-feed-caption-text"><button type="button" data-feed-caption-more>davamını oxu</button></div>`}${hashtagHtml(parsed.tags)}</div>`}
function feedMarkup(batch,offset){
 return batch.map((p,index)=>{const i=offset+index;const u=users[p.user_id]||{},liked=myLikes.has(p.id),cc=commentsCount.get(p.id)||0;return `<article class="av-feed-card" data-post="${p.id}" data-index="${i}"><header>${author(u,p.user_id)}<time>${esc(fmtPostDate(p.created_at))}</time></header>${feedMedia(p)}<div class="av-feed-actions"><button data-post-like class="${liked?'active':''}" aria-label="Bəyən"><i class="fa-${liked?'solid':'regular'} fa-heart"></i><b>${likes.get(p.id)||0}</b></button><button data-post-comments aria-label="Şərh"><i class="fa-regular fa-comment"></i><b>${cc}</b></button><button data-post-share aria-label="Paylaş"><i class="fa-solid fa-share-nodes"></i><b class="av-share-count">${sharesCount.get(p.id)||0}</b></button><button data-post-save class="${saved.has(p.id)?'active':''}" aria-label="Yadda saxla"><i class="fa-${saved.has(p.id)?'solid':'regular'} fa-bookmark"></i><b>${savesCount.get(p.id)||0}</b></button><button data-post-download aria-label="Medianı yüklə" title="Yüklə"><i class="fa-solid fa-download"></i></button>${p.user_id!==me?.id?`<button data-post-follow="${p.user_id}" class="av-post-follow ${following.has(p.user_id)?'active':''}" aria-label="Takip"><i class="fa-solid ${following.has(p.user_id)?'fa-user-check':'fa-user-plus'}"></i><span>${following.has(p.user_id)?'Takip edilir':'Takip et'}</span></button>`:''}</div>${captionHtml(p,u)}</article>`}).join('');
}
function compactViews(n){n=Number(n)||0;if(n>=1e9)return `${(n/1e9).toFixed(n>=1e10?0:1).replace('.0','')} T`;if(n>=1e6)return `${(n/1e6).toFixed(n>=1e7?0:1).replace('.0','')} M`;if(n>=1e3)return `${(n/1e3).toFixed(n>=1e4?0:1).replace('.0','')} B`;return String(n)}
function viewerKey(){let id=localStorage.getItem('avtovip-viewer-key');if(!id){id=(crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`);localStorage.setItem('avtovip-viewer-key',id)}const day=new Date().toISOString().slice(0,10);return `${me?.id?'u:'+me.id:'a:'+id}:${day}`}
async function registerPostView(postId){if(!viewCounterReady||!postId)return;const key=`avtovip-viewed:${postId}:${new Date().toISOString().slice(0,10)}`;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');try{const r=await sb.rpc('register_post_view',{p_post_id:postId,p_viewer_key:viewerKey()});if(r.error){viewCounterReady=false;return}const n=Number(r.data);if(Number.isFinite(n)){viewsCount.set(postId,n);$$(`[data-view-count="${CSS.escape(String(postId))}"]`).forEach(x=>x.textContent=compactViews(n))}}catch{viewCounterReady=false}}
function setupPostViews(root,cards){
 if(!root._avPostViewObserver){
  const timers=new WeakMap();
  root._avPostViewObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
    const card=entry.target;
    const post=posts[Number(card.dataset.reelIndex??card.dataset.index)];
    if(!post)continue;
    if(entry.isIntersecting&&entry.intersectionRatio>=.55){
     if(!timers.has(card))timers.set(card,setTimeout(()=>registerPostView(post.id),850));
    }else if(timers.has(card)){
     clearTimeout(timers.get(card));
     timers.delete(card);
    }
   }
  },{threshold:[0,.55,1]});
 }
 cards.forEach(card=>root._avPostViewObserver.observe(card));
}
function reelMarkup(batch,offset){
 return batch.map((p,index)=>{const i=offset+index;const m=mediaFor(p).find(x=>x.video);return `<button class="av-reel-tile" type="button" data-reel-index="${i}" aria-label="Videonu aç">${m?`<video src="${esc(m.url)}" muted playsinline webkit-playsinline loop preload="${i<6?'metadata':'none'}" disableRemotePlayback controlsList="noremoteplayback nodownload noplaybackrate" x-webkit-airplay="deny"></video>`:'<span class="av-reel-empty"><i class="fa-solid fa-video-slash"></i></span>'}<span class="av-reel-view-count"><i class="fa-regular fa-eye"></i><b data-view-count="${p.id}">${compactViews(viewsCount.get(p.id)||0)}</b></span></button>`}).join('');
}
function fitFeedMedia(media,slide){if(!media||!slide)return;const el=slide.querySelector('.av-media-main,.av-feed-video');if(!el)return;const apply=()=>{const w=Number(el.naturalWidth||el.videoWidth||0),h=Number(el.naturalHeight||el.videoHeight||0),box=Math.max(280,media.clientWidth||innerWidth);if(!w||!h)return;const ideal=box*(h/w),mobile=matchMedia('(max-width:800px)').matches,min=mobile?240:300,max=mobile?Math.min(innerHeight*.64,680):Math.min(innerHeight*.72,720),target=Math.max(min,Math.min(max,ideal));media.style.setProperty('--av-feed-media-h',`${Math.round(target)}px`)};if(el.tagName==='IMG'){el.complete?apply():el.addEventListener('load',apply,{once:true})}else{el.readyState>=1?apply():el.addEventListener('loadedmetadata',apply,{once:true})}}
function syncVideoBackdrop(video){const bg=video?.closest('.av-feed-slide')?.querySelector('.av-video-backdrop');if(!bg)return;const sync=()=>{try{if(Math.abs((bg.currentTime||0)-(video.currentTime||0))>.3)bg.currentTime=video.currentTime||0}catch{}};video.addEventListener('play',()=>{sync();bg.play().catch(()=>{})});video.addEventListener('pause',()=>{sync();bg.pause()});video.addEventListener('seeking',sync);video.addEventListener('timeupdate',()=>{if(Math.abs((bg.currentTime||0)-(video.currentTime||0))>.6)sync()});bg.muted=true;bg.loop=true}
async function ensureSlideReady(slide){if(!slide)return;const img=slide.querySelector('.av-media-main');if(img&&!img.complete){await new Promise(r=>{const done=()=>r();img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});setTimeout(done,1800)})}const v=slide.querySelector('.av-feed-video');if(v&&v.readyState<1){await new Promise(r=>{const done=()=>r();v.addEventListener('loadedmetadata',done,{once:true});v.addEventListener('error',done,{once:true});setTimeout(done,1800)})}}
async function setCarousel(card,index){const media=$('.av-feed-media',card),slides=$$('.av-feed-slide',media);if(!media||!slides.length||media.dataset.switching==='1')return;index=(index+slides.length)%slides.length;const old=Number(media.dataset.carouselIndex||0);if(old===index)return;media.dataset.switching='1';const oldSlide=slides[old],next=slides[index],dir=index>old?'next':'prev';await ensureSlideReady(next);fitFeedMedia(media,next);media.classList.add('is-changing',`to-${dir}`);next?.classList.add('active','incoming');oldSlide?.classList.add('outgoing');requestAnimationFrame(()=>requestAnimationFrame(()=>{next?.classList.remove('incoming');oldSlide?.classList.add('leave')}));setTimeout(()=>{oldSlide?.classList.remove('active','outgoing','leave');next?.classList.remove('incoming');media.classList.remove('is-changing','to-next','to-prev');media.dataset.switching='0'},230);media.dataset.carouselIndex=String(index);const counter=media.querySelector('[data-carousel-current]');if(counter)counter.textContent=String(index+1);const ov=oldSlide?.querySelector('.av-feed-video');if(ov){ov.pause();ov.dataset.manualPaused=''}const nv=next?.querySelector('.av-feed-video');if(nv&&card.getBoundingClientRect().top<innerHeight&&card.getBoundingClientRect().bottom>0){nv.muted=!soundEnabled;nv.play().catch(()=>{})}}
function setupCarousels(cards){
 cards.forEach(card=>{const media=$('.av-feed-media',card);if(!media)return;fitFeedMedia(media,$('.av-feed-slide.active',media));if($$('.av-feed-slide',media).length<2)return;media.addEventListener('click',e=>{if(e.target.closest('.av-carousel-prev')){e.preventDefault();setCarousel(card,Number(media.dataset.carouselIndex||0)-1)}else if(e.target.closest('.av-carousel-next')){e.preventDefault();setCarousel(card,Number(media.dataset.carouselIndex||0)+1)}});let sx=0,sy=0,ignoreSwipe=false;media.addEventListener('touchstart',e=>{ignoreSwipe=!!e.target.closest('.av-media-progress,.av-media-sound,.av-media-fullscreen');sx=e.touches[0]?.clientX||0;sy=e.touches[0]?.clientY||0},{passive:true});media.addEventListener('touchend',e=>{if(ignoreSwipe)return;const dx=(e.changedTouches[0]?.clientX||0)-sx,dy=(e.changedTouches[0]?.clientY||0)-sy;if(Math.abs(dx)>62&&Math.abs(dx)>Math.abs(dy)*1.5)setCarousel(card,Number(media.dataset.carouselIndex||0)+(dx<0?1:-1))},{passive:true})})
}
function hardenVideo(v){if(!v)return;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');try{v.disableRemotePlayback=true}catch{}try{v.mozAllowCasting=false}catch{}try{v.setAttribute('disableRemotePlayback','')}catch{}try{v.setAttribute('controlsList','noremoteplayback nodownload noplaybackrate')}catch{}try{v.setAttribute('x-webkit-airplay','deny')}catch{}try{v.setAttribute('mozallowcasting','false')}catch{}}
function pauseAll(except=null){$$('video').forEach(v=>{hardenVideo(v);if(v!==except){try{v.pause()}catch{}}})}
function syncSoundIcons(){$$('.av-media-sound i').forEach(i=>i.className=`fa-solid ${soundEnabled?'fa-volume-high':'fa-volume-xmark'}`);const i=$('#avReelViewer .av-reel-sound i');if(i)i.className=`fa-solid ${soundEnabled?'fa-volume-high':'fa-volume-xmark'}`}
function setSound(on){soundEnabled=!!on;localStorage.setItem('avtovip-social-sound',soundEnabled?'1':'0');syncSoundIcons();$$('.av-feed-video').forEach(v=>{if(!v.paused)v.muted=!soundEnabled});const vv=$('#avReelViewer .av-reel-stage:not(.av-reel-outgoing):not(.av-reel-pending):not(.av-reel-neighbor) video');if(vv)vv.muted=!soundEnabled}
function bindSeek(video,bar){if(!video||!bar)return;const seek=e=>{const r=bar.getBoundingClientRect();if(!r.width||!Number.isFinite(video.duration))return;const x=Math.max(0,Math.min(r.width,e.clientX-r.left));video.currentTime=(x/r.width)*video.duration};bar.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();bar.setPointerCapture?.(e.pointerId);seek(e)});bar.addEventListener('pointermove',e=>{if(e.buttons||bar.hasPointerCapture?.(e.pointerId)){e.preventDefault();e.stopPropagation();seek(e)}});bar.addEventListener('pointerup',e=>{e.stopPropagation();bar.releasePointerCapture?.(e.pointerId)});bar.addEventListener('keydown',e=>{if(!Number.isFinite(video.duration))return;if(e.key==='ArrowLeft'){video.currentTime=Math.max(0,video.currentTime-5);e.preventDefault()}if(e.key==='ArrowRight'){video.currentTime=Math.min(video.duration,video.currentTime+5);e.preventDefault()}});bar.tabIndex=0;bar.setAttribute('role','slider')}
function bindSmoothProgress(video,progress){if(!video||!progress)return;const fill=progress.querySelector('i');if(!fill)return;let raf=0;const paint=()=>{if(Number.isFinite(video.duration)&&video.duration>0)fill.style.transform=`scaleX(${Math.max(0,Math.min(1,video.currentTime/video.duration))})`;if(!video.paused&&!video.ended)raf=requestAnimationFrame(paint)};const start=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(paint)};const stop=()=>{cancelAnimationFrame(raf);paint()};video.addEventListener('play',start);video.addEventListener('pause',stop);video.addEventListener('ended',stop);video.addEventListener('seeking',paint);video.addEventListener('loadedmetadata',paint);paint()}
function setupFeedPlayback(root,cards){
 const incoming=cards.flatMap(card=>$$('.av-feed-video',card));
 if(!incoming.length)return;
 if(root._avVideoRegistry){root._avVideoRegistry(incoming);return}
 const videos=[];
 // Feed always starts muted; reflect that state in the sound button too.
 soundEnabled=false;syncSoundIcons();
 const visible=new Map();
 let feedAudioActivated=false;
 const choose=()=>{let best=null,bestR=.55;for(const [v,r] of visible){const activeSlide=v.closest('.av-feed-slide')?.classList.contains('active');if(activeSlide&&r>bestR){best=v;bestR=r}}videos.forEach(v=>{if(v!==best){if(!v.paused)v.pause();v.classList.remove('is-active');if((visible.get(v)||0)<.15)v.dataset.manualPaused=''}});if(best){best.classList.add('is-active');best.muted=!(soundEnabled&&feedAudioActivated);if(best.dataset.manualPaused!=='1'&&best.paused)best.play().catch(()=>{if(!best.muted){best.muted=true;best.play().catch(()=>{})}})}};
 const io=new IntersectionObserver(es=>{for(const e of es)visible.set(e.target,e.intersectionRatio);choose()},{threshold:[0,.15,.35,.55,.75,1]});
 root._avVideoRegistry=elements=>{
  videos.push(...elements);
  elements.forEach(v=>{hardenVideo(v);syncVideoBackdrop(v);io.observe(v);let dragged=false,sx=0,sy=0;v.addEventListener('pointerdown',e=>{dragged=false;sx=e.clientX;sy=e.clientY});v.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-sx,e.clientY-sy)>10)dragged=true});v.addEventListener('click',e=>{if(dragged)return;e.preventDefault();if(v.paused){v.dataset.manualPaused='';v.muted=!soundEnabled;pauseAll(v);v.play().catch(()=>{})}else{v.dataset.manualPaused='1';v.pause()}});const progress=v.closest('.av-feed-slide')?.querySelector('.av-media-progress');bindSeek(v,progress);bindSmoothProgress(v,progress)});
 };
 root._avVideoRegistry(incoming);
 root.addEventListener('click',async e=>{
  const fs=e.target.closest('.av-media-fullscreen');
  if(fs){e.preventDefault();e.stopPropagation();const slide=fs.closest('.av-feed-slide'),v=slide?.querySelector('.av-feed-video');if(!slide||!v)return;try{if(!document.fullscreenElement&&typeof v.webkitEnterFullscreen==='function'&&!slide.requestFullscreen&&!slide.webkitRequestFullscreen){v.webkitEnterFullscreen();return}if(!document.fullscreenElement){await (slide.requestFullscreen?.()||slide.webkitRequestFullscreen?.());try{if(screen.orientation?.lock){const mode=(v.videoWidth||0)>=(v.videoHeight||0)?'landscape':'portrait';await screen.orientation.lock(mode)}}catch{}}else{await (document.exitFullscreen?.()||document.webkitExitFullscreen?.())}}catch{try{v.webkitEnterFullscreen?.()}catch{}}return}
  const b=e.target.closest('.av-media-sound');if(!b)return;e.preventDefault();e.stopPropagation();feedAudioActivated=true;setSound(!soundEnabled)
 });
 const syncFs=()=>{$$('.av-media-fullscreen i',root).forEach(i=>i.className=`fa-solid ${document.fullscreenElement?'fa-compress':'fa-expand'}`);if(!document.fullscreenElement){try{screen.orientation?.unlock?.()}catch{}}};
 document.addEventListener('fullscreenchange',syncFs);
 document.addEventListener('webkitfullscreenchange',syncFs);
}
function setupGridPlayback(root,cards){
 const incoming=cards.flatMap(card=>$$('video',card));
 if(!incoming.length)return;
 if(root._avVideoRegistry){root._avVideoRegistry(incoming);return}
 const videos=[];
 // Desktop-only hover preview. Preserve existing mobile/PWA intersection playback.
 const desktop=window.matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)');
 const pause=v=>{if(!v.paused)v.pause()};
 const pauseAllTiles=()=>videos.forEach(pause);
 const io=new IntersectionObserver(es=>{if(desktop.matches){for(const e of es)if(!e.isIntersecting)pause(e.target);return}for(const e of es){const v=e.target;if(e.isIntersecting&&e.intersectionRatio>.35){v.muted=true;v.play().catch(()=>{})}else pause(v)}},{threshold:[0,.35,.75]});
 // Fetch only metadata for visible tiles so a first frame appears without downloading every video.
 const thumbObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const v=entry.target;if(v.preload==='none'){v.preload='metadata';v.addEventListener('loadeddata',()=>{try{if(v.paused&&v.readyState>=2)v.currentTime=Math.min(.08,Number.isFinite(v.duration)?Math.max(0,v.duration-.01):.08)}catch{}},{once:true})}thumbObserver.unobserve(v)}},{rootMargin:'650px 0px',threshold:0});
 root._avVideoRegistry=elements=>{
  videos.push(...elements);
  elements.forEach(v=>{hardenVideo(v);thumbObserver.observe(v);io.observe(v);v.addEventListener('mouseenter',()=>{if(!desktop.matches||document.hidden)return;pauseAllTiles();v.muted=true;v.play().catch(()=>{})});v.addEventListener('mouseleave',()=>{if(desktop.matches)pause(v)})});
 };
 root._avVideoRegistry(incoming);
 const stopIfDesktop=()=>{if(desktop.matches)pauseAllTiles()};
 desktop.addEventListener?.('change',stopIfDesktop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAllTiles()});
 window.addEventListener('blur',()=>{if(desktop.matches)pauseAllTiles()});
 if(desktop.matches)pauseAllTiles();
}

async function toggleLike(postId,btn){if(!me){location.href='login.html';return}const active=myLikes.has(postId);btn.disabled=true;const {error}=active?await sb.from('post_likes').delete().eq('post_id',postId).eq('user_id',me.id):await sb.from('post_likes').upsert({post_id:postId,user_id:me.id});if(!error){if(active){myLikes.delete(postId);bump(likes,postId,-1)}else{myLikes.add(postId);bump(likes,postId,1)}$$(`[data-post="${CSS.escape(postId)}"] [data-post-like]`).forEach(b=>{b.classList.toggle('active',!active);b.querySelector('i').className=`fa-${active?'regular':'solid'} fa-heart`;const n=b.querySelector('b');if(n)n.textContent=likes.get(postId)||0});const vb=$('#avReelViewer [data-post-like]');if(vb&&posts[activeModalIndex]?.id===postId){vb.classList.toggle('active',!active);vb.querySelector('i').className=`fa-${active?'regular':'solid'} fa-heart`;vb.querySelector('b').textContent=likes.get(postId)||0}}btn.disabled=false}
async function toggleFollow(uid){if(!me){location.href='login.html';return}if(!uid||uid===me.id)return;const active=following.has(uid);const {error}=active?await sb.from('user_follows').delete().eq('follower_id',me.id).eq('following_id',uid):await sb.from('user_follows').insert({follower_id:me.id,following_id:uid});if(!error){active?following.delete(uid):following.add(uid);$$(`[data-post-follow="${CSS.escape(uid)}"]`).forEach(b=>{b.classList.toggle('active',!active);const i=b.querySelector('i'),s=b.querySelector('span');if(i)i.className=`fa-solid ${active?'fa-user-plus':'fa-user-check'}`;if(s)s.textContent=active?'Takip et':'Takip edilir'})}}
async function toggleSave(postId,btn){if(!me){location.href='login.html';return}if(!socialCountTablesReady)return;const active=saved.has(postId);btn.disabled=true;const r=active?await sb.from('post_saves').delete().eq('post_id',postId).eq('user_id',me.id):await sb.from('post_saves').insert({post_id:postId,user_id:me.id});if(!r.error){active?saved.delete(postId):saved.add(postId);bump(savesCount,postId,active?-1:1);updateSaveButtons(postId)}btn.disabled=false}
function updateSaveButtons(postId){$$(`[data-post="${CSS.escape(postId)}"] [data-post-save]`).forEach(b=>{b.classList.toggle('active',saved.has(postId));b.querySelector('i').className=`fa-${saved.has(postId)?'solid':'regular'} fa-bookmark`;const n=b.querySelector('b');if(n)n.textContent=savesCount.get(postId)||0});if(posts[activeModalIndex]?.id===postId){const b=$('#avReelViewer [data-post-save]');if(b){b.classList.toggle('active',saved.has(postId));b.querySelector('i').className=`fa-${saved.has(postId)?'solid':'regular'} fa-bookmark`;b.querySelector('b').textContent=savesCount.get(postId)||0}}}
async function sharePost(post){const page=post.is_reel?'reels.html':'lent.html',url=new URL(`${page}#post=${encodeURIComponent(post.id)}`,location.href).href;let shared=false;try{if(navigator.share){await navigator.share({title:'AvtoVIP',text:postText(post).text.slice(0,120),url});shared=true}else{await navigator.clipboard.writeText(url);shared=true}}catch(e){if(e?.name!=='AbortError')console.warn('[AvtoVIP share]',e)}if(shared&&me&&socialCountTablesReady){const r=await sb.from('post_shares').insert({post_id:post.id,user_id:me.id});if(!r.error){bump(sharesCount,post.id,1);$$(`[data-post="${CSS.escape(post.id)}"] .av-share-count`).forEach(n=>n.textContent=sharesCount.get(post.id)||0);if(posts[activeModalIndex]?.id===post.id){const n=$('#avReelViewer [data-post-share] b');if(n)n.textContent=sharesCount.get(post.id)||0}}}return shared}
async function downloadMedia(post,scope=''){const media=mediaFor(post),card=$(`[data-post="${CSS.escape(String(post.id))}"]`),idx=Math.max(0,Number(card?.querySelector('.av-feed-media')?.dataset.carouselIndex||0)),item=media[idx]||media[0];if(!item?.url)return;postNotice('Media yüklənir...','info',scope==='reel'?'reel-download-notice':'');try{const r=await fetch(item.url,{mode:'cors'});if(!r.ok)throw new Error('Media yüklənə bilmədi.');const blob=await r.blob(),ext=(blob.type.split('/')[1]||new URL(item.url).pathname.split('.').pop()||'bin').replace('jpeg','jpg'),a=document.createElement('a'),obj=URL.createObjectURL(blob);a.href=obj;a.download=`avtovip-${post.id}-${idx+1}.${ext}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(obj),3000);postNotice('Media yükləndi.','success',scope==='reel'?'reel-download-notice':'')}catch(e){try{const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener';a.download='';document.body.append(a);a.click();a.remove()}catch{}postNotice('Media yeni pəncərədə açıldı.','info',scope==='reel'?'reel-download-notice':'')}}

function bindActions(root){root.addEventListener('click',async e=>{const card=e.target.closest('[data-post]');if(!card)return;const id=card.dataset.post,p=posts.find(x=>String(x.id)===String(id));if(!p)return;if(e.target.closest('.av-carousel-prev,.av-carousel-next,.av-media-sound,.av-media-progress'))return;const hash=e.target.closest('[data-hashtag]');if(hash){location.href=hashtagHref(hash.dataset.hashtag);return}const more=e.target.closest('[data-feed-caption-more]');if(more){const box=more.closest('.av-feed-caption-text'),caption=more.closest('.av-feed-caption');box.classList.toggle('expanded');caption?.classList.toggle('expanded',box.classList.contains('expanded'));more.textContent=box.classList.contains('expanded')?'gizlət':'davamını oxu';return}const like=e.target.closest('[data-post-like]');if(like){await toggleLike(id,like);return}const follow=e.target.closest('[data-post-follow]');if(follow){await toggleFollow(follow.dataset.postFollow);return}const save=e.target.closest('[data-post-save]');if(save){await toggleSave(id,save);return}if(e.target.closest('[data-post-download]')){await downloadMedia(p);return}if(e.target.closest('[data-post-share]')){await sharePost(p);return}if(e.target.closest('[data-post-comments]')){openPostComments(id);return}})}

async function openPostComments(postId){
 let old=$('#avPostComments');old?.remove();const viewer=$('#avReelViewer'),vv=viewer?.querySelector('video');commentsOpenedFromViewer=!!viewer?.classList.contains('open');if(vv&&!vv.paused)vv.dataset.resumeAfterComments='1',vv.pause();
 const modal=document.createElement('div');modal.id='avPostComments';modal.className='av-post-comments-modal';modal.innerHTML=`<div class="av-post-comments-card"><header><strong>Şərhlər</strong><button type="button" data-close>×</button></header><div class="av-post-comments-list"><div class="empty-state">Yüklənir...</div></div><div class="av-comment-emoji-picker" hidden>${EMOJIS.map(x=>`<button type="button" data-comment-emoji="${x}">${x}</button>`).join('')}</div><form class="av-post-comments-form"><button class="av-comment-emoji" type="button" aria-label="İfadələr"><i class="fa-regular fa-face-smile"></i></button><input maxlength="500" placeholder="Şərh yaz..."><button type="submit"><i class="fa-solid fa-paper-plane"></i></button></form></div>`;document.body.append(modal);document.documentElement.classList.add('modal-open','av-comments-open');
 modal.addEventListener('wheel',e=>{if(e.target.closest('.av-post-comments-card'))e.stopPropagation()},{passive:true});
 modal.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
 if(!commentsHistoryPushed){history.pushState({avPostComments:true},'');commentsHistoryPushed=true}
 const finishClose=()=>{modal.remove();document.documentElement.classList.remove('av-comments-open');if(!$('#avReelViewer')?.classList.contains('open'))document.documentElement.classList.remove('modal-open');commentsHistoryPushed=false;const v=$('#avReelViewer .av-reel-stage:not(.av-reel-outgoing):not(.av-reel-pending):not(.av-reel-neighbor) video');if(commentsOpenedFromViewer&&v?.dataset.resumeAfterComments==='1'){delete v.dataset.resumeAfterComments;v.muted=!soundEnabled;v.play().catch(()=>{})}commentsOpenedFromViewer=false};
 const requestClose=()=>{if(commentsHistoryPushed)history.back();else finishClose()};
 modal.querySelector('[data-close]').onclick=requestClose;modal.onclick=e=>{if(e.target===modal)requestClose()};
 const ep=modal.querySelector('.av-comment-emoji-picker'),eb=modal.querySelector('.av-comment-emoji'),input=modal.querySelector('input');let selStart=0,selEnd=0;const remember=()=>{selStart=input.selectionStart??input.value.length;selEnd=input.selectionEnd??selStart};input.addEventListener('keyup',remember);input.addEventListener('click',remember);input.addEventListener('select',remember);eb.onclick=e=>{e.preventDefault();e.stopPropagation();remember();ep.hidden=!ep.hidden};ep.addEventListener('pointerdown',e=>{if(e.target.closest('[data-comment-emoji]'))e.preventDefault()},{passive:false});ep.onclick=e=>{const b=e.target.closest('[data-comment-emoji]');if(!b)return;const a=Math.min(selStart,input.value.length),z=Math.min(selEnd,input.value.length),em=b.dataset.commentEmoji;input.value=input.value.slice(0,a)+em+input.value.slice(z);const pos=a+em.length;selStart=selEnd=pos;input.focus({preventScroll:true});try{input.setSelectionRange(pos,pos)}catch{}ep.hidden=false};
 const list=modal.querySelector('.av-post-comments-list'),form=modal.querySelector('form');let available=true;
 const ask=({title,message,value='',inputMode=false,confirm='Yadda saxla'})=>new Promise(resolve=>{const d=document.createElement('div');d.className='av-comment-dialog';d.innerHTML=`<div class="av-comment-dialog-card"><strong>${esc(title)}</strong><p>${esc(message)}</p>${inputMode?`<textarea maxlength="500">${esc(value)}</textarea>`:''}<div><button type="button" data-cancel>Ləğv et</button><button type="button" class="primary" data-ok>${esc(confirm)}</button></div></div>`;modal.append(d);const ta=d.querySelector('textarea');if(ta){setTimeout(()=>{ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)},0)}d.querySelector('[data-cancel]').onclick=()=>{d.remove();resolve(null)};d.querySelector('[data-ok]').onclick=()=>{const v=ta?ta.value.trim():true;d.remove();resolve(v)};d.addEventListener('click',e=>{if(e.target===d){d.remove();resolve(null)}})});
 async function refresh(){const r=await sb.from('post_comments').select('id,user_id,body,created_at').eq('post_id',postId).order('created_at',{ascending:true}).limit(100);if(r.error){available=false;list.innerHTML='<div class="empty-state">Hələ şərh yoxdur.</div>';form.hidden=true;return}const rows=r.data||[],uids=[...new Set(rows.map(x=>x.user_id))],map={};if(uids.length){const ur=await sb.from('users').select('id,name,surname,avatar_url,membership_tier,is_verified').in('id',uids);for(const u of ur.data||[])map[u.id]=u}list.innerHTML=rows.length?rows.map(c=>{const u=map[c.user_id]||{},t=String(u.membership_tier||'free').toLowerCase(),own=c.user_id===me?.id;return `<div class="av-post-comment" data-comment-id="${c.id}"><span class="feed-avatar-shell avatar-shell ${t}${avatarVerifiedClass(u?.is_verified)}"><img src="${esc(u.avatar_url||'assets/img/brand/icon-192.png')}" alt="">${tierMark(t)}</span><div><strong>${u.is_verified?verified():''}<span>${esc(fullName(u))}</span><time>${esc(fmt(c.created_at))}</time></strong><p>${esc(c.body)}</p>${own?`<div class="av-post-comment-actions"><button type="button" data-edit-comment="${c.id}">Redaktə et</button><button type="button" data-delete-comment="${c.id}">Sil</button></div>`:''}</div></div>`}).join(''):'<div class="empty-state">Hələ şərh yoxdur.</div>'}
 await refresh();
 list.onclick=async e=>{const edit=e.target.closest('[data-edit-comment]'),del=e.target.closest('[data-delete-comment]');if(edit){const row=edit.closest('.av-post-comment'),old=row?.querySelector('p')?.textContent||'';const body=await ask({title:'Şərhi redaktə et',message:'Şərhi dəyişin:',value:old,inputMode:true});if(body===null||!body)return;const r=await sb.from('post_comments').update({body}).eq('id',edit.dataset.editComment).eq('user_id',me.id);if(!r.error)await refresh()}else if(del){const ok=await ask({title:'Şərhi sil',message:'Bu şərh silinsin?',confirm:'Sil'});if(!ok)return;const r=await sb.from('post_comments').delete().eq('id',del.dataset.deleteComment).eq('user_id',me.id);if(!r.error){bump(commentsCount,postId,-1);$$(`[data-post="${CSS.escape(postId)}"] [data-post-comments] b`).forEach(n=>n.textContent=commentsCount.get(postId)||0);if(posts[activeModalIndex]?.id===postId){const n=$('#avReelViewer [data-post-comments] b');if(n)n.textContent=commentsCount.get(postId)||0}await refresh()}}};
 form.onsubmit=async e=>{e.preventDefault();if(!available)return;if(!me){location.href='login.html';return}const body=input.value.trim();if(!body)return;const r=await sb.from('post_comments').insert({post_id:postId,user_id:me.id,body});if(!r.error){input.value='';selStart=selEnd=0;ep.hidden=true;bump(commentsCount,postId,1);$$(`[data-post="${CSS.escape(postId)}"] [data-post-comments] b`).forEach(n=>n.textContent=commentsCount.get(postId));if(posts[activeModalIndex]?.id===postId){const n=$('#avReelViewer [data-post-comments] b');if(n)n.textContent=commentsCount.get(postId)||0}await refresh()}};
 const fitKeyboard=()=>{const vv=window.visualViewport;if(!vv)return;const mobile=window.matchMedia('(max-width:800px)').matches;if(!mobile){modal.style.removeProperty('top');modal.style.removeProperty('height');modal.style.removeProperty('bottom');return}modal.style.top=`${Math.round(vv.offsetTop)}px`;modal.style.height=`${Math.round(vv.height)}px`;modal.style.bottom='auto';modal.style.setProperty('--av-kb','0px')};window.visualViewport?.addEventListener('resize',fitKeyboard);window.visualViewport?.addEventListener('scroll',fitKeyboard);input.addEventListener('focus',()=>{fitKeyboard();requestAnimationFrame(fitKeyboard)});input.addEventListener('blur',()=>requestAnimationFrame(()=>{modal.style.removeProperty('top');modal.style.removeProperty('height');modal.style.removeProperty('bottom')}));const oldFinish=finishClose;modal.__finishClose=()=>{window.visualViewport?.removeEventListener('resize',fitKeyboard);window.visualViewport?.removeEventListener('scroll',fitKeyboard);oldFinish()};
}

function openViewer(index){activeModalIndex=Math.max(0,Math.min(posts.length-1,index));pauseAll();let modal=$('#avReelViewer');if(!modal){modal=document.createElement('div');modal.id='avReelViewer';modal.className='av-reel-viewer';document.body.append(modal);modal.addEventListener('click',viewerClick);bindReelSwipe(modal);modal.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>30){e.preventDefault();showViewer(activeModalIndex+(e.deltaY>0?1:-1),e.deltaY>0?'next':'prev')}},{passive:false})}if(!viewerHistoryPushed){history.pushState({avReelViewer:true},'');viewerHistoryPushed=true}showViewer(activeModalIndex)}
function buildReelStage(index){
 if(index<0||index>=posts.length)return null;const p=posts[index],u=users[p.user_id]||{},m=mediaFor(p).find(x=>x.video);if(!m)return null;const liked=myLikes.has(p.id),isFollow=following.has(p.user_id),cc=commentsCount.get(p.id)||0,parsed=postText(p),cap=parsed.text,hasTags=parsed.tags.length>0,expandable=cap.length>90||hasTags;const template=document.createElement('template');template.innerHTML=`<div class="av-reel-stage"><button class="av-reel-close" data-view-close aria-label="Bağla">×</button><button class="av-reel-download" data-view-download aria-label="Videonu yüklə" title="Yüklə"><i class="fa-solid fa-download"></i></button><div class="av-reel-media"><video src="${esc(m.url)}" playsinline webkit-playsinline preload="metadata" loop disableRemotePlayback controlsList="noremoteplayback nodownload noplaybackrate" x-webkit-airplay="deny"></video><span class="av-reel-progress"><i></i></span><button class="av-reel-sound" type="button" aria-label="Səs"><i class="fa-solid ${soundEnabled?'fa-volume-high':'fa-volume-xmark'}"></i></button><span class="av-reel-play-state" aria-hidden="true"><i class="fa-solid fa-play"></i></span></div><div class="av-reel-overlay"><div class="av-reel-user">${author(u,p.user_id)}${p.user_id!==me?.id?`<button data-post-follow="${p.user_id}" class="av-reel-follow ${isFollow?'active':''}"><i class="fa-solid ${isFollow?'fa-user-check':'fa-user-plus'}"></i><span>${isFollow?'Takip edilir':'Takip et'}</span></button>`:''}</div>${(cap||hasTags)?`<div class="av-reel-caption${expandable?' is-collapsible':''}">${cap?`<span>${esc(cap)}</span>`:''}${expandable?'<button data-caption-more type="button">davamını oxu</button>':''}</div>`:''}${hashtagHtml(parsed.tags)}</div><div class="av-reel-actions"><button data-post-like class="${liked?'active':''}"><i class="fa-${liked?'solid':'regular'} fa-heart"></i><b>${likes.get(p.id)||0}</b></button><button data-post-comments><i class="fa-regular fa-comment"></i><b>${cc}</b></button><button data-post-share><i class="fa-solid fa-share-nodes"></i><b>${sharesCount.get(p.id)||0}</b></button><button data-post-save class="${saved.has(p.id)?'active':''}"><i class="fa-${saved.has(p.id)?'solid':'regular'} fa-bookmark"></i><b>${savesCount.get(p.id)||0}</b></button></div></div>`;const stage=template.content.firstElementChild;
 stage.dataset.reelIndex=index;
 return stage;
}

const activeReelStage = modal => modal.querySelector('.av-reel-stage:not(.av-reel-neighbor):not(.av-reel-outgoing):not(.av-reel-pending)');
function paintReelPreview(stage,video){
 if(!video||video.readyState<2||!video.videoWidth||!video.videoHeight)return false;
 const media=stage.querySelector('.av-reel-media');
 const canvas=media.querySelector('.av-reel-preview-frame')||document.createElement('canvas');
 const scale=Math.min(1,640/Math.max(video.videoWidth,video.videoHeight));
 try{
  canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
  canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
  canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
 }catch{return false}
 stage.classList.toggle('av-reel-landscape',video.videoWidth>video.videoHeight);
 canvas.className='av-reel-preview-frame';
 canvas.setAttribute('aria-hidden','true');
 if(!canvas.parentNode)media.prepend(canvas);
 return true;
}
function revealReelPlayback(stage,video){
 const frame=stage.querySelector('.av-reel-preview-frame');
 if(!frame)return;
 const reveal=()=>frame.remove();
 const present=()=>{
  if(typeof video.requestVideoFrameCallback==='function')video.requestVideoFrameCallback(reveal);
  else requestAnimationFrame(()=>requestAnimationFrame(reveal));
 };
 if(video.paused)video.addEventListener('playing',present,{once:true});
 else present();
}
function preloadAdjacentReels(modal,index){
 for(const node of modal.querySelectorAll('.av-reel-neighbor')){
  if(Math.abs(Number(node.dataset.reelIndex)-index)!==1)node.remove();
 }
 for(const next of [index+1,index-1]){
  if(modal.querySelector(`.av-reel-neighbor[data-reel-index="${next}"]`))continue;
  const stage=buildReelStage(next);
  if(!stage)continue;
  stage.classList.add('av-reel-neighbor');
  stage.inert=true;
  const video=stage.querySelector('video');
  video.muted=true;
  video.preload='auto';
  hardenVideo(video);
  const gridVideo=$('#socialFeed')?.querySelector(`[data-reel-index="${next}"] video`);
  paintReelPreview(stage,gridVideo);
  const capture=()=>{if(stage.classList.contains('av-reel-neighbor')&&!stage.querySelector('.av-reel-preview-frame'))paintReelPreview(stage,video)};
  video.addEventListener('loadeddata',capture,{once:true});
  video.addEventListener('canplay',capture,{once:true});
  modal.append(stage);
  if(!stage.querySelector('.av-reel-preview-frame'))paintReelPreview(stage,video);
 }
}
function clearReelDrag(modal){
 for(const stage of modal.querySelectorAll('.av-reel-dragging')){
  stage.classList.remove('av-reel-dragging');
  stage.style.removeProperty('transform');
 }
}
function bindReelSwipe(modal){
 let start=null;
 modal.addEventListener('touchstart',event=>{
  if(modal.dataset.reelTransition||event.touches.length!==1||event.target.closest('button,a,.av-reel-progress'))return;
  const touch=event.touches[0];
  start={x:touch.clientX,y:touch.clientY,dy:0};
 },{passive:true});
 modal.addEventListener('touchmove',event=>{
  if(!start||event.touches.length!==1)return;
  const touch=event.touches[0],dy=touch.clientY-start.y;
  if(!start.vertical&&Math.abs(dy)<Math.max(7,Math.abs(touch.clientX-start.x)))return;
  start.vertical=true;
  start.dy=dy;
  event.preventDefault();
  const active=activeReelStage(modal);
  const neighbor=modal.querySelector(`.av-reel-neighbor[data-reel-index="${activeModalIndex+(dy<0?1:-1)}"]`);
  if(!active||!neighbor){clearReelDrag(modal);return}
  if(!neighbor.querySelector('.av-reel-preview-frame')&&!paintReelPreview(neighbor,neighbor.querySelector('video'))){clearReelDrag(modal);return}
  const height=active.getBoundingClientRect().height;
  const offset=Math.max(-height,Math.min(height,dy));
  if(start.neighbor!==neighbor)clearReelDrag(modal);
  start.neighbor=neighbor;
  for(const [node,y] of [[active,offset],[neighbor,offset+(dy<0?height:-height)]]){
   node.classList.add('av-reel-dragging');
   node.style.transform=`translateY(${y}px)`;
  }
 },{passive:false});
 modal.addEventListener('touchend',event=>{
  const gesture=start;
  start=null;
  if(!gesture)return;
  if(Math.abs(gesture.dy)>42){
   showViewer(activeModalIndex+(gesture.dy<0?1:-1),gesture.dy<0?'next':'prev');
  }else{
   clearReelDrag(modal);
   if(!gesture.vertical&&event.target.closest('video'))toggleViewerPlayback();
  }
 },{passive:true});
 modal.addEventListener('touchcancel',()=>{start=null;clearReelDrag(modal)});
}

async function showViewer(index,direction='next'){
 const modal=$('#avReelViewer');
 if(!modal||modal.dataset.reelTransition)return;
 if(index===posts.length&&direction==='next'){
  clearReelDrag(modal);
  const current=activeModalIndex;
  loadNextReels?.()?.then(()=>{
   if(posts[index]&&activeModalIndex===current&&$('#avReelViewer')?.classList.contains('open'))showViewer(index);
  });
  return;
 }
 const stage=modal.querySelector(`.av-reel-neighbor[data-reel-index="${index}"]`)||buildReelStage(index);
 if(!stage){clearReelDrag(modal);return}
 const previous=activeReelStage(modal);
 const v=stage.querySelector('video');
 hardenVideo(v);
 if(previous){
  const token=String(performance.now());
  modal.dataset.reelTransition=token;
  const fromIncoming=stage.style.transform;
  const fromOutgoing=previous.style.transform;
  stage.classList.remove('av-reel-neighbor');
  stage.classList.add('av-reel-pending');
  if(!stage.isConnected)modal.append(stage);
  if(v.readyState<2&&!stage.querySelector('.av-reel-preview-frame'))clearReelDrag(modal);
  v.preload='auto';
  const ready=stage.querySelector('.av-reel-preview-frame')||await new Promise(resolve=>{
   if(v.readyState>=2){resolve(true);return}
   const timer=setTimeout(()=>finish(false),8000);
   const finish=ok=>{clearTimeout(timer);v.onloadeddata=v.onerror=null;resolve(ok)};
   v.onloadeddata=()=>finish(true);
   v.onerror=()=>finish(false);
  });
  if(modal.dataset.reelTransition!==token)return;
  delete modal.dataset.reelTransition;
  if(!ready){clearReelDrag(modal);stage.remove();return}
  if(!stage.querySelector('.av-reel-preview-frame'))paintReelPreview(stage,v);
  previous.querySelector('video')?.pause();
  previous.inert=true;
  previous.classList.add('av-reel-outgoing');
  clearReelDrag(modal);
  stage.inert=false;
  stage.classList.remove('av-reel-pending');
  const directionSign=direction==='prev'?-1:1;
  const duration=typeof stage.animate==='function'&&!matchMedia('(prefers-reduced-motion: reduce)').matches?185:0;
  if(duration){
   stage.animate([{transform:fromIncoming||`translateY(${directionSign*100}%)`},{transform:'translateY(0)'}],{duration,easing:'ease-out'});
   const outgoing=previous.animate([{transform:fromOutgoing||'translateY(0)'},{transform:`translateY(${directionSign*-100}%)`}],{duration,easing:'ease-out',fill:'forwards'});
   outgoing.finished.catch(()=>{}).finally(()=>previous.remove());

  }else previous.remove();
 }else modal.append(stage);
 activeModalIndex=index;
 preloadAdjacentReels(modal,index);
 if(index>=posts.length-4)loadNextReels?.()?.then(()=>{
  if(activeModalIndex===index&&!modal.dataset.reelTransition&&modal.classList.contains('open'))preloadAdjacentReels(modal,index);
 });
 modal.classList.add('open');
 document.documentElement.classList.add('modal-open');
 pauseAll(v);revealReelPlayback(stage,v);v.muted=!soundEnabled;const reelStage=stage;const syncReelAspect=()=>{const w=Number(v?.videoWidth||0),h=Number(v?.videoHeight||0);if(reelStage&&w&&h)reelStage.classList.toggle('av-reel-landscape',w>h)};if(v?.readyState>=1)syncReelAspect();else v?.addEventListener('loadedmetadata',syncReelAspect,{once:true});const viewerProgress=stage.querySelector('.av-reel-progress');bindSeek(v,viewerProgress);bindSmoothProgress(v,viewerProgress);v.addEventListener('play',()=>{delete v.dataset.manualPaused;stage.querySelector('.av-reel-play-state')?.classList.remove('show')});v.addEventListener('pause',()=>{const state=stage.querySelector('.av-reel-play-state');if(v.dataset.manualPaused==='1')state?.classList.add('show');else state?.classList.remove('show')});v.addEventListener('ended',()=>{v.currentTime=0;v.play().catch(()=>{})});// iOS can reject an audible play() after a swipe. Retry muted and once media is ready.
 const isIOSReel=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 if(isIOSReel){
   let pending=false;
   const attempt=()=>{
     if(!v.isConnected||modal.querySelector('.av-reel-stage:not(.av-reel-outgoing):not(.av-reel-pending):not(.av-reel-neighbor) video')!==v||v.dataset.manualPaused==='1'||document.hidden)return;
     if(!v.paused)return;
     const result=v.play();
     if(result&&typeof result.catch==='function')result.catch(()=>{
       if(!v.isConnected||modal.querySelector('.av-reel-stage:not(.av-reel-outgoing):not(.av-reel-pending):not(.av-reel-neighbor) video')!==v||v.dataset.manualPaused==='1')return;
       if(!v.muted){v.muted=true;const icon=stage.querySelector('.av-reel-sound i');if(icon)icon.className='fa-solid fa-volume-xmark';v.play().catch(()=>{})}
     });
   };
   const whenReady=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;attempt()})};
   v.addEventListener('loadeddata',whenReady,{once:true});
   v.addEventListener('canplay',whenReady,{once:true});
   attempt();
 }else v.play().catch(()=>{stage.querySelector('.av-reel-play-state')?.classList.remove('show')})}
function toggleViewerPlayback(){const v=$('#avReelViewer .av-reel-stage:not(.av-reel-outgoing):not(.av-reel-pending):not(.av-reel-neighbor) video'),state=$('#avReelViewer .av-reel-play-state');if(!v)return;if(v.paused){delete v.dataset.manualPaused;state?.classList.remove('show');v.muted=!soundEnabled;v.play().catch(()=>{})}else{v.dataset.manualPaused='1';v.pause();state?.classList.add('show')}}
function closeViewer(fromHistory=false){const modal=$('#avReelViewer');if(!modal?.classList.contains('open'))return;pauseAll();delete modal.dataset.reelTransition;modal.classList.remove('open');modal.innerHTML='';document.documentElement.classList.remove('modal-open');if(!fromHistory&&viewerHistoryPushed){viewerHistoryPushed=false;history.back()}else viewerHistoryPushed=false}
async function viewerClick(e){const p=posts[activeModalIndex];if(!p)return;if(e.target.closest('[data-view-close]')){closeViewer();return}if(e.target.closest('[data-view-download]')){e.preventDefault();e.stopPropagation();await downloadMedia(p,'reel');return}if(e.target.closest('.av-reel-sound')){setSound(!soundEnabled);return}const hash=e.target.closest('[data-hashtag]');if(hash){location.href=hashtagHref(hash.dataset.hashtag);return}const more=e.target.closest('[data-caption-more]');if(more){const cap=more.closest('.av-reel-caption');cap.classList.toggle('expanded');more.textContent=cap.classList.contains('expanded')?'gizlət':'davamını oxu';return}const like=e.target.closest('[data-post-like]');if(like){await toggleLike(p.id,like);return}const follow=e.target.closest('[data-post-follow]');if(follow){await toggleFollow(follow.dataset.postFollow);return}const save=e.target.closest('[data-post-save]');if(save){await toggleSave(p.id,save);return}if(e.target.closest('[data-post-share]')){await sharePost(p);const n=e.target.closest('[data-post-share]').querySelector('b');if(n)n.textContent=sharesCount.get(p.id)||0;return}if(e.target.closest('[data-post-comments]'))return openPostComments(p.id)}

function postNotice(message,type='info',scope=''){
 let box=$('#avPostNotice');if(!box){box=document.createElement('div');box.id='avPostNotice';box.className='av-post-notice';document.body.append(box)}
 box.className=`av-post-notice ${type}${scope?' '+scope:''}`;box.innerHTML=`<i class="fa-solid ${type==='error'?'fa-circle-exclamation':type==='success'?'fa-circle-check':'fa-circle-info'}"></i><span>${esc(message)}</span>`;box.classList.add('show');clearTimeout(box.__t);box.__t=setTimeout(()=>box.classList.remove('show'),3200)
}
async function prepareCompatibleImage(file){
 return window.avtoDb.prepareImage(file,{maxWidth:1920,maxHeight:1920,quality:.90,maxBytes:4000000,progressTitle:'Şəkil hazırlanır...'});
}
async function transcodeVideo(file,status){
 return window.avtoDb.transcodeVideo(file,{maxWidth:1280,maxHeight:1280,progressTitle:'Video hazırlanır...',onProgress:p=>{if(status)status.textContent=`Video çevrilir... ${Math.round(p)}%`}});
}

// Keep object URLs alive while a file is selected; release them on removal,
// switching composer type or leaving the page (including long video previews).
const composerPreviewUrls=new Map();
function pruneComposerPreviewUrls(){
 for(const [file,url] of composerPreviewUrls){
  if(!composerFiles.includes(file)){URL.revokeObjectURL(url);composerPreviewUrls.delete(file)}
 }
}
window.addEventListener('pagehide',()=>{for(const url of composerPreviewUrls.values())URL.revokeObjectURL(url);composerPreviewUrls.clear()});
function renderComposerPreview(){
 const box=$('#postMediaPreview');if(!box)return;
 pruneComposerPreviewUrls();
 box.innerHTML=composerFiles.map((f,i)=>{
  let url=composerPreviewUrls.get(f);
  if(!url){url=URL.createObjectURL(f);composerPreviewUrls.set(f,url)}
  const video=f.type.startsWith('video/');
  return `<div class="av-post-preview-item" data-preview-index="${i}">${video?`<video src="${url}" muted playsinline preload="metadata"></video>`:`<img src="${url}" alt="">`}<button type="button" data-remove-media="${i}" aria-label="Sil"><i class="fa-solid fa-xmark"></i></button><small>${esc(f.name||'media')}</small></div>`
 }).join('');
 box.querySelectorAll('[data-remove-media]').forEach(b=>b.onclick=()=>{
  composerFiles.splice(Number(b.dataset.removeMedia),1);
  syncComposerInput();renderComposerPreview()
 })
}
function syncComposerInput(){const input=$('#postMedia');if(!input)return;try{const dt=new DataTransfer();composerFiles.forEach(f=>dt.items.add(f));input.files=dt.files}catch{}}
let hashtagStatsCache=null,hashtagTimer=0;
function composerTags(){const input=$('#postHashtags');if(!input)return[];const vals=String(input.value||'').split(/[\s,]+/).filter(v=>v.startsWith('#')).map(normalizeTag).filter(Boolean),seen=new Set();return vals.filter(t=>{const k=t.toLocaleLowerCase();if(seen.has(k))return false;seen.add(k);return true}).slice(0,12)}
function renderHashtagChips(){const box=$('#postHashtagChips');if(!box)return;box.innerHTML=composerTags().map(t=>`<button type="button" data-remove-tag="${esc(t)}">#${esc(t)} <i class="fa-solid fa-xmark"></i></button>`).join('');box.querySelectorAll('[data-remove-tag]').forEach(b=>b.onclick=()=>{const input=$('#postHashtags');const rm=b.dataset.removeTag.toLocaleLowerCase();input.value=composerTags().filter(t=>t.toLocaleLowerCase()!==rm).map(t=>'#'+t).join(' ');renderHashtagChips();refreshHashtagSuggestions()})}
async function loadHashtagStats(){if(hashtagStatsCache)return hashtagStatsCache;const r=await sb.from('posts').select('caption').eq('status','active').order('created_at',{ascending:false}).limit(300);const map=new Map();for(const p of r.data||[]){for(const t of postText(p).tags){const k=t.toLocaleLowerCase(),x=map.get(k)||{tag:t,count:0};x.count++;map.set(k,x)}}hashtagStatsCache=[...map.values()].sort((a,b)=>b.count-a.count);return hashtagStatsCache}
async function refreshHashtagSuggestions(){const input=$('#postHashtags'),box=$('#postHashtagSuggest');if(!input||!box)return;const raw=String(input.value||''),token=raw.split(/[\s,]+/).pop()||'';if(!token.startsWith('#')||token.length<2){box.hidden=true;box.innerHTML='';return}const last=normalizeTag(token),selected=new Set(composerTags().map(t=>t.toLocaleLowerCase()));const stats=await loadHashtagStats();let items=stats.filter(x=>!selected.has(x.tag.toLocaleLowerCase())&&x.tag.toLocaleLowerCase().includes(last.toLocaleLowerCase())).slice(0,6);if(last&&!stats.some(x=>x.tag.toLocaleLowerCase()===last.toLocaleLowerCase()))items=[{tag:last,count:0,newTag:true},...items].slice(0,6);box.innerHTML=items.length?items.map(x=>`<button type="button" data-suggest-tag="${esc(x.tag)}"><span>#${esc(x.tag)}</span><small>${x.count?x.count+' paylaşım':'Yeni heşteq'}</small></button>`).join(''):'';box.hidden=!items.length;box.querySelectorAll('[data-suggest-tag]').forEach(b=>b.onclick=()=>{const t=b.dataset.suggestTag,raw=String(input.value||''),parts=raw.split(/([\s,]+)/),lastIndex=[...parts].map((v,i)=>({v,i})).reverse().find(x=>x.v.trim().startsWith('#'))?.i;if(lastIndex==null)return;parts[lastIndex]='#'+t;input.value=parts.join('').replace(/\s*$/,'')+' ';const tags=composerTags();if(tags.length>12){postNotice('Maksimum 12 heşteq əlavə edə bilərsiniz.','info');return}renderHashtagChips();box.hidden=true;input.focus()})}
function configureHashtags(){const input=$('#postHashtags');if(!input)return;input.addEventListener('input',()=>{renderHashtagChips();clearTimeout(hashtagTimer);hashtagTimer=setTimeout(refreshHashtagSuggestions,180)});input.addEventListener('focus',()=>{const token=String(input.value||'').split(/[\s,]+/).pop()||'';if(token.startsWith('#')&&token.length>1)refreshHashtagSuggestions()});input.addEventListener('blur',()=>setTimeout(()=>{const b=$('#postHashtagSuggest');if(b)b.hidden=true},180));renderHashtagChips()}
function configureComposer(){
 let selectionVersion=0;
 const form=$('#postForm'),input=$('#postMedia');if(!form||!input)return;configureHashtags();const radios=$$('input[name="post_kind"]',form),label=$('#postMediaLabel'),note=$('#postMediaNote'),picker=$('.av-file-picker span',form);
 const sync=()=>{selectionVersion++;const reel=form.querySelector('input[name="post_kind"]:checked')?.value==='reel';input.accept=reel?'video/*':'image/*,video/*';input.multiple=!reel;if(label)label.textContent=reel?'Video (1 fayl)':'Foto / video (maksimum 5 fayl)';if(picker)picker.textContent=reel?'Video əlavə et':'Foto / video əlavə et';if(note)note.textContent=reel?'Reels yalnız video qəbul edir. MOV/HEVC videolar uyğun MP4 formatına avtomatik çevrilir. Video limiti 50 MB-dır.':'Lentdə maksimum 5 foto/video paylaşa bilərsiniz. HEIC/HEIF şəkillər avtomatik WebP formatına çevrilir.';composerFiles=[];syncComposerInput();renderComposerPreview()};
 radios.forEach(r=>r.addEventListener('change',sync));input.addEventListener('change',async()=>{const reel=form.querySelector('input[name="post_kind"]:checked')?.value==='reel',incoming=[...(input.files||[])],selection=++selectionVersion;if(!incoming.length)return;const status=$('#postStatus');try{if(reel){if(!window.avtoDb.isVideoFile(incoming[0])){postNotice('Reels üçün video faylı seçin.','error');input.value='';return}if(incoming[0].size>50*1024*1024)throw new Error('Video maksimum 50 MB ola bilər.');{const f=await transcodeVideo(incoming[0],status);if(f.size>50*1024*1024)throw new Error('Hazırlanmış video 50 MB limitini keçir.');if(selection!==selectionVersion)return;Object.defineProperty(f,'__avNormalized',{value:true,enumerable:false});composerFiles=[f]}}else{const before=composerFiles.length;for(let f of incoming){if(selection!==selectionVersion)return;if(composerFiles.length>=5)break;if(window.avtoDb.isVideoFile(f)){if(f.size>50*1024*1024)throw new Error('Video maksimum 50 MB ola bilər.');if(status)status.textContent='Video hazırlanır...';f=await transcodeVideo(f,status);if(f.size>50*1024*1024)throw new Error('Hazırlanmış video 50 MB limitini keçir.');Object.defineProperty(f,'__avNormalized',{value:true,enumerable:false})}else{if(status)status.textContent='Şəkil hazırlanır...';f=await prepareCompatibleImage(f);Object.defineProperty(f,'__avNormalized',{value:true,enumerable:false})}if(selection!==selectionVersion)return;composerFiles.push(f)}if(before+incoming.length>5)postNotice('Lent üçün maksimum 5 media seçilə bilər.','info')}if(selection!==selectionVersion)return;syncComposerInput();renderComposerPreview();if(status)status.textContent=''}catch(err){window.avtoDb.mediaProgressHide();postNotice(err.message,'error');if(status){status.textContent=err.message;status.className='form-status error'}}});sync()
}
async function create(){
 const form=$('#postForm');if(!form)return;configureComposer();const authUser=await window.avtoDb.requireAuth();if(!authUser)return;form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),files=[...composerFiles],kind=String(fd.get('post_kind')||'feed'),reel=kind==='reel',caption=String(fd.get('caption')||'').trim(),tags=composerTags();if(!caption){postNotice('Mətn sahəsini boş saxlamaq olmaz.','error');form.querySelector('[name="caption"]')?.focus();return}if(!tags.length){postNotice('Ən azı 1 heşteq əlavə edin.','error');$('#postHashtags')?.focus();return}if(reel&&files.length!==1){postNotice('Reels üçün 1 video seçin.','error');return}if(!reel&&files.length>5){postNotice('Lent üçün maksimum 5 media seçilə bilər.','error');return}if(reel&&files.some(f=>!f.type.startsWith('video/'))){postNotice('Reels yalnız video qəbul edir.','error');return}if(!files.length){postNotice('Ən azı bir foto və ya video seçin.','error');return}const urls=[],types=[],paths=[],status=$('#postStatus');if(window.avtoDb.mediaBusy())return;const finish=window.avtoDb.beginMediaOperation();let savedToDb=false;status.textContent='Media hazırlanır...';status.className='form-status';try{for(let f of files){if(f.type.startsWith('image/')){if(!f.__avNormalized)f=await prepareCompatibleImage(f)}else if(window.avtoDb.isVideoFile(f)){if(f.size>50*1024*1024)throw new Error('Video maksimum 50 MB ola bilər.');if(!f.__avNormalized)f=await transcodeVideo(f,status);if(f.size>50*1024*1024)throw new Error('Çevrilmiş video 50 MB limitini keçir.')}window.avtoDb.mediaProgress('Yüklənir...',97,'Media AvtoVİP-ə əlavə olunur...');const up=await window.avtoDb.upload('social-media',authUser.id,f,reel?'reels':'posts');urls.push(up.url);types.push(f.type);paths.push(up.path)}window.avtoDb.mediaProgressHide();const plainCaption=caption.replace(/(^|\s)#[\p{L}\p{N}_-]{2,48}(?=\s|$|[.,!?;:])/gu,'$1').replace(/\s{3,}/g,' ').trim(),storedCaption=[plainCaption,tags.map(t=>'#'+t).join(' ')].filter(Boolean).join('\n\n');const {data:created,error}=await sb.from('posts').insert({user_id:authUser.id,caption:storedCaption,media_urls:urls,media_types:types,is_reel:reel}).select('id').single();if(error)throw error;savedToDb=true;for(const mediaUrl of urls){try{await window.avtoDb.linkR2Media(mediaUrl,reel?'reel':'post',created.id)}catch(linkError){console.warn('[AvtoVIP media link] post persisted, reconciliation needed',linkError)}}postNotice('Paylaşım uğurla yaradıldı.','success');setTimeout(()=>location.replace(reel?'reels.html':'lent.html'),450)}catch(err){window.avtoDb.mediaProgressHide();if(!savedToDb&&paths.length)await window.avtoDb.removePaths?.('social-media',paths).catch(()=>{});status.textContent=err.message;status.className='form-status error';postNotice(err.message,'error')}finally{finish()}}
}

addEventListener('popstate',()=>{const cm=$('#avPostComments');if(cm){cm.__finishClose?.();return}if($('#avReelViewer')?.classList.contains('open')){viewerHistoryPushed=false;closeViewer(true)}});
document.addEventListener('DOMContentLoaded',async()=>{await auth();await load();create();const close=$('#postClose');if(close)close.addEventListener('click',e=>{e.preventDefault();try{const r=new URL(document.referrer);if(r.origin===location.origin)history.back();else location.href='lent.html'}catch{location.href='lent.html'}})});
})();
