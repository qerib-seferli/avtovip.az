#!/usr/bin/env python3
"""Conservative, opt-in catalog import. Python 3.10+; standard library only.
Sources: NHTSA vPIC public API, Wikidata Query Service (CC0).
Only exact manufacturer matches and explicit category classes are eligible.
"""
import argparse,csv,io,json,re,time,urllib.parse,urllib.request,urllib.error,unicodedata,collections,pathlib,sys,os,datetime
ROOT=pathlib.Path(__file__).resolve().parents[2]
DATA=ROOT/'assets/data'; OUT=ROOT/'assets/data/catalog-import-review.csv'
CLASSES={
 'motorcycle':['Q23866334'],
 'agriculture':['Q39495'],
 'aircraft':['Q15056993'],
 'watercraft':['Q559026'],
 'construction':['Q1127126'],
}
# These are candidate classes only: P31/P279 relations are checked, and
# manufacturer P176 must match an existing brand. No inferred makes.
SUFFIXES={'motorcycle':[' motorcycles',' motorcycle',' moto'], 'commercial':[' trucks',' truck',' motors',' commercial',' bus',' corporation',' vehicles']}
def norm(s):
 s=unicodedata.normalize('NFKD',str(s)).casefold()
 return ''.join(c for c in s if c.isalnum() and not unicodedata.combining(c))
def get_json(url, retries=2, is_wikidata=False):
 """Bounded retries; respect Retry-After, never hammer an overloaded endpoint."""
 for attempt in range(retries):
  try:
   req=urllib.request.Request(url,headers={
    'User-Agent':'AvtoVIP-CatalogAudit/1.1 (GitHub qerib-seferli/avtovip.az; public research)',
    'Accept':'application/sparql-results+json' if is_wikidata else 'application/json'})
   with urllib.request.urlopen(req,timeout=65) as resp:return json.load(resp)
  except urllib.error.HTTPError as e:
   if e.code in (429,503):
    wait=e.headers.get('Retry-After','')
    try: delay=max(0,min(120,int(wait)))
    except (ValueError,TypeError):delay=70 if is_wikidata else 10
    if attempt+1<retries:time.sleep(delay);continue
    raise RuntimeError(f'HTTP {e.code}; source temporarily rate-limited (retry later)') from e
   if 500<=e.code<600 and attempt+1<retries:time.sleep(5*(attempt+1));continue
   raise RuntimeError(f'HTTP {e.code}') from e
  except (TimeoutError,urllib.error.URLError) as e:
   if attempt+1<retries:time.sleep(5*(attempt+1));continue
   raise RuntimeError(f'network/timeout: {e}') from e

def wikidata(cat, qclass, limit=2500):
 # Query direct and indirect subclasses, but only P176 direct manufacturer.
 query=f'''SELECT DISTINCT ?item ?itemLabel ?makerLabel WHERE {{
 ?item wdt:P31/wdt:P279* wd:{qclass}; wdt:P176 ?maker.
 SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
 }} LIMIT {int(limit)}'''
 url='https://query.wikidata.org/sparql?'+urllib.parse.urlencode({'query':query,'format':'json'})
 for r in get_json(url,is_wikidata=True).get('results',{}).get('bindings',[]):
  item=r.get('item',{}).get('value',''); name=r.get('itemLabel',{}).get('value',''); maker=r.get('makerLabel',{}).get('value','')
  if item.startswith('http') and name and maker and not re.fullmatch(r'Q\d+',name):yield (maker,name,item)
def nhtsa_makes():
 url='https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json'
 return get_json(url).get('Results',[])
def nhtsa_models(makeid):
 url=f'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/{int(makeid)}?format=json'
 return get_json(url).get('Results',[])
def main():
 p=argparse.ArgumentParser();p.add_argument('--max-add',type=int,default=500);p.add_argument('--apply',action='store_true');p.add_argument('--skip-wikidata',action='store_true');p.add_argument('--strict-sources',action='store_true',help='Fail workflow if any public source is unavailable');p.add_argument('--skip-nhtsa',action='store_true');p.add_argument('--only-empty',action='store_true',default=True);args=p.parse_args()
 catalog_path=DATA/'avtovip-extended-catalog.json';catalog=json.loads(catalog_path.read_text('utf-8'))
 pending=[]; failures=[]; fetched=collections.Counter(); seen=set()
 # Fetch NHTSA makes once, not once per vehicle category.
 makes_cache=None
 for cat,brands in catalog.items():
  # Restrict to exactly empty brands, avoiding rewriting existing data.
  targets={norm(b):b for b,v in brands.items() if not v}
  if not targets:continue
  if cat in CLASSES and not args.skip_wikidata:
   for cls in CLASSES[cat]:
    # WDQS is currently throttled to about one request per minute.
    if 'wdqs_last' in locals():time.sleep(70)
    wdqs_last=time.monotonic()
    try:
     for maker,model,qid in wikidata(cat,cls):
      brand=targets.get(norm(maker))
      if not brand:continue
      # Reject generic model labels and maker-only items.
      if norm(model)==norm(maker) or len(model.strip())<2:continue
      key=(cat,brand,norm(model))
      if key not in seen:pending.append((cat,brand,model,'wikidata',qid));seen.add(key);fetched[cat]+=1
    except Exception as e:failures.append(f'wikidata {cat}/{cls}: {e}')
  if cat in ('motorcycle','commercial') and not args.skip_nhtsa:
   try:
    if makes_cache is None:makes_cache=nhtsa_makes()
    for make in makes_cache:
     raw=make.get('Make_Name','');mid=make.get('Make_ID')
     # Exact match only; brand suffix matching is deliberately disabled.
     brand=targets.get(norm(raw))
     if not brand or not mid:continue
     try:
      for m in nhtsa_models(mid):
       model=str(m.get('Model_Name','')).strip()
       if not model or norm(model)==norm(raw):continue
       key=(cat,brand,norm(model))
       if key not in seen:pending.append((cat,brand,model,'nhtsa-vpic',str(m.get('Model_ID',''))));seen.add(key);fetched[cat]+=1
     except Exception as e:failures.append(f'nhtsa {cat}/{raw}: {e}')
   except Exception as e:failures.append(f'nhtsa makes {cat}: {e}')
 # Candidate review is always written. Automated apply is conservative and opt-in.
 pending.sort(key=lambda x:(x[0],x[1].casefold(),x[2].casefold()))
 OUT.parent.mkdir(parents=True,exist_ok=True)
 with OUT.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.writer(f);w.writerow(['category','brand','model','source','source_id','status']);w.writerows([*r,'candidate_needs_review'] for r in pending)
 if args.apply:
  print('Safety stop: Wikidata class membership alone cannot establish a vehicle model; manual review is required. No catalog changes made.',file=sys.stderr)
  return 2
 print(json.dumps({'candidate_count':len(pending),'by_category':dict(fetched),'errors':failures,'review_file':str(OUT),'partial_sources':bool(failures),'catalog_modified':False},ensure_ascii=False,indent=2))
 return 1 if (failures and args.strict_sources) else 0
if __name__=='__main__':sys.exit(main())
