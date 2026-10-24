import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Content-Type':'application/json'};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers});
 try{
  const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const token=req.headers.get('Authorization')?.replace(/^Bearer\s+/i,'');if(!token)return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers});
  const auth=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}});const {data:{user},error:authError}=await auth.auth.getUser();if(authError||!user)return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers});
  const {peer_id}=await req.json();if(typeof peer_id!=='string'||!/^[0-9a-f-]{36}$/i.test(peer_id)||peer_id===user.id)return new Response(JSON.stringify({error:'Invalid peer'}),{status:400,headers});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:clears,error:clearError}=await admin.from('conversation_clears').select('user_id,peer_id,cleared_at').in('user_id',[user.id,peer_id]).in('peer_id',[user.id,peer_id]);if(clearError)throw clearError;
  const own=clears?.find(x=>x.user_id===user.id&&x.peer_id===peer_id),other=clears?.find(x=>x.user_id===peer_id&&x.peer_id===user.id);
  if(!own||!other)return new Response(JSON.stringify({cleaned:0,reason:'one-sided'}),{headers});
  const cutoff=new Date(Math.min(Date.parse(own.cleared_at),Date.parse(other.cleared_at))).toISOString();
  // Process in batches, and only messages already hidden from both parties.
  let cleaned=0;
  for(let batch=0;batch<20;batch++){
   const {data:messages,error:readError}=await admin.from('messages').select('id,media_url').or(`and(sender_id.eq.${user.id},receiver_id.eq.${peer_id}),and(sender_id.eq.${peer_id},receiver_id.eq.${user.id})`).lte('created_at',cutoff).order('created_at',{ascending:true}).limit(100);
   if(readError)throw readError;if(!messages?.length)break;
   const paths:string[]=[];
   for(const m of messages){if(!m.media_url)continue;try{const u=new URL(m.media_url);const marker='/storage/v1/object/public/chat-media/';if(u.origin===new URL(url).origin&&u.pathname.includes(marker)){paths.push(decodeURIComponent(u.pathname.split(marker)[1]));}}catch{/* Ignore invalid/foreign URLs */}}
   if(paths.length){const {error:storageError}=await admin.storage.from('chat-media').remove([...new Set(paths)]);if(storageError)throw storageError;}
   const {error:deleteError}=await admin.from('messages').delete().in('id',messages.map(m=>m.id));if(deleteError)throw deleteError;
   cleaned+=messages.length;
  }
  return new Response(JSON.stringify({cleaned}),{headers});
 }catch(err){console.error('chat-cleanup',err);return new Response(JSON.stringify({error:'Cleanup failed'}),{status:500,headers});}
});
