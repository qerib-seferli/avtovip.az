import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
  if (req.method === 'OPTIONS') return new Response('ok',{headers})
  try {
    const url=Deno.env.get('SUPABASE_URL')!
    const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const sb=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})
    const now=new Date().toISOString()
    const {data:expired,error}=await sb.from('stories').select('id,media_url').not('expires_at','is',null).lte('expires_at',now).limit(200)
    if(error) throw error
    if(!expired?.length) return new Response(JSON.stringify({ok:true,deleted:0}),{headers})

    const paths:string[]=[]
    for(const row of expired){
      try{
        const marker='/storage/v1/object/public/story-media/'
        const i=String(row.media_url||'').indexOf(marker)
        if(i>=0) paths.push(decodeURIComponent(String(row.media_url).slice(i+marker.length).split('?')[0]))
      }catch{/* malformed legacy URL: row cleanup still proceeds */}
    }
    if(paths.length){
      const {error:storageError}=await sb.storage.from('story-media').remove([...new Set(paths)])
      if(storageError) throw storageError
    }
    const ids=expired.map(x=>x.id)
    /* Child tables should normally cascade. Explicit deletes also cover older schemas. */
    for(const table of ['story_likes','story_comments','story_views']){
      const {error:e}=await sb.from(table).delete().in('story_id',ids)
      if(e && !/does not exist/i.test(e.message)) throw e
    }
    const {error:deleteError}=await sb.from('stories').delete().in('id',ids)
    if(deleteError) throw deleteError
    return new Response(JSON.stringify({ok:true,deleted:ids.length,media_deleted:paths.length}),{headers})
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ok:false,error:e instanceof Error?e.message:String(e)}),{status:500,headers})
  }
})
