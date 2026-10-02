import {Camara} from '../connectors/camara.mjs';
import {Senado} from '../connectors/senado.mjs';
import {QueridoDiario} from '../connectors/querido-diario.mjs';
import {IBGE} from '../connectors/ibge.mjs';
import {auditExpenses} from '../xray/audit-rules.mjs';

const UF = ['ac','al','ap','am','ba','ce','df','es','go','ma','mt','ms','mg','pa','pb','pr','pe','pi','rj','rn','rs','ro','rr','sc','sp','se','to'];
const PALETTE = ['#a57443','#586c74','#8c5149','#6d7655','#6b5b83','#887c69','#546a61','#9a745d'];
const JSON_HEADERS = {'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=60, stale-while-revalidate=300','x-content-type-options':'nosniff'};

function cfg(env) {
  const mode = (env.TSE_MODE || 'official').toLowerCase();
  const simulator = mode === 'simulator';
  return {
    mode,
    base: simulator ? 'https://resultados-sim.tse.jus.br/simulado' : 'https://resultados.tse.jus.br',
    environment: env.TSE_ENV || (simulator ? 'simulado2026' : 'oficial'),
    cycle: env.TSE_CYCLE || 'ele2026',
    election: String(env.TSE_ELECTION_CODE || (simulator ? '21270' : '6257')),
    office: String(env.TSE_OFFICE_CODE || '1').padStart(4, '0'),
    electionDate: env.TSE_ELECTION_DATE || '2026-10-04',
  };
}

function padElection(code) { return String(code).padStart(6, '0'); }
function json(data, status=200, extra={}) { return new Response(JSON.stringify(data), {status, headers:{...JSON_HEADERS,...extra}}); }
function cors(req, env) {
  const origin = req.headers.get('origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || 'https://alemdovoto.com.br,http://localhost:8787,http://127.0.0.1:8787').split(',').map(s=>s.trim());
  return allowed.includes(origin) ? {'access-control-allow-origin':origin,'vary':'Origin'} : {};
}
function ptNumber(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const s=String(v).trim();
  if (/^-?\d+[,.]\d+$/.test(s)) return Number(s.replace('.','').replace(',','.')) || 0;
  return Number(s.replace(/\./g,'').replace(',','.')) || 0;
}
function cleanText(v){ return String(v ?? '').trim(); }
function boundedParams(searchParams,allowed,{defaultItems=20,maxItems=100}={}){const out={};for(const key of allowed){const value=searchParams.get(key);if(value!=null&&value!=='')out[key]=value}out.itens=Math.min(maxItems,Math.max(1,Number(out.itens)||defaultItems));if(out.pagina)out.pagina=Math.max(1,Number(out.pagina)||1);return out}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function sha256(text){ const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
function safeTs(iso){ return iso.replace(/[:.]/g,'-'); }

function tseUrls(c) {
  const e = padElection(c.election);
  const root = `${c.base}/${c.environment}/${c.cycle}/${c.election}/dados`;
  return {
    config: `${c.base}/${c.environment}/comum/config/ele-c.json`,
    national: `${root}/br/br-c${c.office}-e${e}-u.json`,
    totalization: `${root}/br/br-e${e}-ab.json`,
    state: uf => `${root}/${uf}/${uf}-c${c.office}-e${e}-u.json`,
  };
}

async function fetchText(url, timeout=12000) {
  const controller = new AbortController();
  const t=setTimeout(()=>controller.abort(),timeout);
  try {
    const r=await fetch(url,{headers:{accept:'application/json'},signal:controller.signal,cf:{cacheTtl:0,cacheEverything:false}});
    const text=await r.text();
    if(!r.ok) throw new Error(`${r.status} ${url}: ${text.slice(0,180)}`);
    return {text,json:JSON.parse(text),url,etag:r.headers.get('etag')||''};
  } finally { clearTimeout(t); }
}

function candidateArray(payload) {
  const list = Array.isArray(payload?.cand) ? payload.cand : Array.isArray(payload?.candidatos) ? payload.candidatos : [];
  return list.map((c,i)=>(
    {
      id: cleanText(c.sqcand ?? c.seq ?? c.id ?? i+1),
      number: cleanText(c.n ?? c.nr ?? c.numero),
      name: cleanText(c.nm ?? c.nome ?? c.nmu ?? 'Candidato'),
      party: cleanText(c.cc ?? c.par ?? c.sg ?? c.partido),
      votes: ptNumber(c.vap ?? c.v ?? c.votos),
      percent: ptNumber(c.pvap ?? c.pv ?? c.percentual),
      status: cleanText(c.st ?? c.sit ?? c.status),
    }
  )).sort((a,b)=>b.votes-a.votes);
}

function normalizeScope(payload, capturedAt, scopeCode) {
  return {
    scopeCode: scopeCode.toUpperCase(),
    capturedAt,
    sourceGeneratedAt: [payload?.dt, payload?.ht].filter(Boolean).join(' ') || null,
    sourceIdg: cleanText(payload?.idg ?? payload?.dg ?? ''),
    processedPercent: ptNumber(payload?.pst ?? payload?.psi ?? payload?.percentualSecoesTotalizadas),
    sections: {
      total: ptNumber(payload?.s ?? payload?.secoes ?? payload?.totalSecoes),
      processed: ptNumber(payload?.st ?? payload?.secoesTotalizadas ?? payload?.totalSecoesTotalizadas),
    },
    candidates: candidateArray(payload),
  };
}

function leader(scope) {
  const c=scope?.candidates?.[0];
  return c ? {id:c.id,number:c.number,name:c.name,party:c.party,votes:c.votes,percent:c.percent} : null;
}

function isCollectionWindow(c, now=new Date()) {
  if(c.mode==='simulator') return true;
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const o=Object.fromEntries(p.map(x=>[x.type,x.value]));
  const date=`${o.year}-${o.month}-${o.day}`, hour=Number(o.hour);
  if(date===c.electionDate && hour>=16) return true;
  const dayAfter=new Date(`${c.electionDate}T12:00:00-03:00`); dayAfter.setDate(dayAfter.getDate()+1);
  const after=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(dayAfter);
  return date===after && hour<4;
}

async function archive(env, kind, scope, capturedAt, source) {
  const hash=await sha256(source.text);
  const key=`tse/2026/${cfg(env).mode}/${cfg(env).election}/${scope}/${capturedAt.slice(0,10)}/${safeTs(capturedAt)}-${hash.slice(0,16)}.json`;
  if(env.RAW_ARCHIVE) await env.RAW_ARCHIVE.put(key,source.text,{httpMetadata:{contentType:'application/json; charset=utf-8'},customMetadata:{source:source.url,capturedAt,sha256:hash,kind}});
  return {key,hash,url:source.url};
}

function snapshotSvg(s) {
  const rows=(s.candidates||[]).slice(0,5).map((c,i)=>{
    const y=340+i*78,w=Math.max(2,Math.min(640,(c.percent||0)*12));
    return `<text x="92" y="${y}" font-family="Arial" font-size="21" font-weight="700" fill="#161512">${xml(c.name)}</text><text x="1040" y="${y}" text-anchor="end" font-family="Georgia" font-size="26" fill="#161512">${Number(c.percent||0).toFixed(2).replace('.',',')}%</text><rect x="92" y="${y+18}" width="640" height="7" rx="3" fill="#ded8cc"/><rect x="92" y="${y+18}" width="${w}" height="7" rx="3" fill="${PALETTE[i%PALETTE.length]}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#f3f0e7"/><rect width="1080" height="112" fill="#0a0a09"/><text x="62" y="70" font-family="Georgia" font-size="30" fill="#f7f4eb">ALÉM DO VOTO</text><text x="62" y="190" font-family="Arial" font-size="18" letter-spacing="3" fill="#8c7540">ELEIÇÕES 2026 · SNAPSHOT DOCUMENTAL</text><text x="62" y="267" font-family="Georgia" font-size="58" fill="#11110f">Presidente</text><text x="1018" y="225" text-anchor="end" font-family="Georgia" font-size="43" fill="#11110f">${Number(s.processedPercent||0).toFixed(2).replace('.',',')}%</text><text x="1018" y="257" text-anchor="end" font-family="Arial" font-size="14" fill="#706c64">seções totalizadas</text>${rows}<line x1="62" x2="1018" y1="1180" y2="1180" stroke="#cfc7b8"/><text x="62" y="1228" font-family="Arial" font-size="14" fill="#706c64">Fonte: Tribunal Superior Eleitoral · captura ${xml(s.capturedAt)}</text><text x="62" y="1260" font-family="Arial" font-size="13" fill="#8a867f">Arquivo bruto preservado + hash SHA-256</text></svg>`;
}
function xml(s){return String(s??'').replace(/[<>&'\"]/g,m=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[m]));}

async function dbRequest(env, path, init={}) {
  if(!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) throw new Error('database_not_configured');
  const url=`${env.SUPABASE_URL.replace(/\/$/,'')}/rest/v1/${path}`;
  const headers={apikey:env.SUPABASE_SECRET_KEY,'content-type':'application/json',accept:'application/json',...(init.headers||{})};
  const r=await fetch(url,{...init,headers});
  const text=await r.text();
  if(!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0,300)}`);
  return text ? JSON.parse(text) : null;
}

async function saveSnapshot(env, c, snap, archiveInfo, stateArchives, visualKey) {
  if(!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return false;
  const row={
    source_id:'tse', election_code:c.election, office_code:'1', mode:c.mode, scope_code:'BR',
    captured_at:snap.capturedAt, source_generated_at:snap.sourceGeneratedAt || null, source_idg:snap.sourceIdg || null,
    processed_percent:snap.processedPercent, sections_total:snap.sections?.total||0, sections_processed:snap.sections?.processed||0,
    raw_object_key:archiveInfo?.key||null, visual_object_key:visualKey||null, snapshot_sha256:archiveInfo?.hash||await sha256(JSON.stringify(snap)),
    normalized:snap, state_archive_index:stateArchives||{},
  };
  await dbRequest(env,'election_snapshots?on_conflict=snapshot_sha256',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(row)});
  return true;
}

async function latestSnapshot(env,c) {
  if(!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return null;
  const q=`election_snapshots?select=normalized,captured_at,mode&source_id=eq.tse&election_code=eq.${encodeURIComponent(c.election)}&scope_code=eq.BR&order=captured_at.desc&limit=1`;
  const rows=await dbRequest(env,q,{method:'GET'});
  return rows?.[0]?.normalized ? {mode:rows[0].mode||c.mode,snapshot:rows[0].normalized} : null;
}

async function fetchBundle(env, {archiveRaw=false}={}) {
  const c=cfg(env), u=tseUrls(c), capturedAt=new Date().toISOString();
  const nationalSource=await fetchText(u.national);
  const national=normalizeScope(nationalSource.json,capturedAt,'BR');
  const nationalArchive=archiveRaw ? await archive(env,'result','br',capturedAt,nationalSource) : null;
  const states={}, stateArchives={};
  const chunks=[]; for(let i=0;i<UF.length;i+=7) chunks.push(UF.slice(i,i+7));
  for(const chunk of chunks){
    const values=await Promise.all(chunk.map(async uf=>{
      try{const src=await fetchText(u.state(uf)); const norm=normalizeScope(src.json,capturedAt,uf); const ar=archiveRaw?await archive(env,'result',uf,capturedAt,src):null; return {uf,norm,ar};}
      catch(error){return {uf,error:String(error)}}
    }));
    values.forEach(v=>{if(v.norm){const l=leader(v.norm);if(l)states[v.uf.toUpperCase()]=l;if(v.ar)stateArchives[v.uf.toUpperCase()]=v.ar;}});
    await sleep(40);
  }
  const snap={...national,states,archive:{national:nationalArchive,stateCount:Object.keys(stateArchives).length}};
  let visualKey=null;
  if(archiveRaw && env.VISUAL_ARCHIVE){
    const svg=snapshotSvg(snap), h=await sha256(svg);
    visualKey=`elections/2026/${c.election}/presidente/${capturedAt.slice(0,10)}/${safeTs(capturedAt)}-${h.slice(0,16)}.svg`;
    await env.VISUAL_ARCHIVE.put(visualKey,svg,{httpMetadata:{contentType:'image/svg+xml; charset=utf-8'},customMetadata:{capturedAt,kind:'election-snapshot'}});
  }
  if(archiveRaw) await saveSnapshot(env,c,snap,nationalArchive,stateArchives,visualKey);
  return {mode:c.mode,snapshot:snap};
}

async function collect(env) {
  const c=cfg(env);
  if(!isCollectionWindow(c)) return {skipped:true,reason:'outside_collection_window',mode:c.mode,electionDate:c.electionDate};
  const result=await fetchBundle(env,{archiveRaw:true});
  return {skipped:false,mode:c.mode,capturedAt:result.snapshot.capturedAt,states:Object.keys(result.snapshot.states||{}).length,candidates:result.snapshot.candidates?.length||0};
}

async function publicElection(env) {
  const c=cfg(env);
  try { const latest=await latestSnapshot(env,c); if(latest) return latest; } catch(e) { console.warn('db latest failed',e); }
  if(c.mode==='simulator') return fetchBundle(env,{archiveRaw:false});
  if(!isCollectionWindow(c)) return {status:'scheduled',mode:'official',message:'Aguardando a divulgação oficial do TSE em 4 de outubro de 2026, a partir das 17h (horário de Brasília).'};
  try { return await fetchBundle(env,{archiveRaw:false}); }
  catch(e) { return {status:'waiting',mode:'official',message:'O ambiente oficial ainda não retornou um snapshot utilizável.',detail:String(e)}; }
}

async function replay(env, limit=500) {
  const c=cfg(env); if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY) return [];
  const max=Math.min(2000,Math.max(1,Number(limit)||500));
  return dbRequest(env,`election_snapshots?select=captured_at,processed_percent,normalized,visual_object_key&source_id=eq.tse&election_code=eq.${encodeURIComponent(c.election)}&scope_code=eq.BR&order=captured_at.asc&limit=${max}`,{method:'GET'});
}


async function xrayDossier(env, subjectType, subjectId) {
  if(!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return {status:'not_configured',message:'Banco ainda não configurado.'};
  const st=encodeURIComponent(subjectType), sid=encodeURIComponent(subjectId);
  const signals=await dbRequest(env,`xray_signals?select=id,rule_id,rule_version,subject_type,subject_id,observed_at,period_start,period_end,observed_value,comparison_context,explanation,limitations,reproducibility,engine_version,publication_status,audit&subject_type=eq.${st}&subject_id=eq.${sid}&publication_status=in.(publishable,published)&order=observed_at.desc`,{method:'GET'});
  if(!signals?.length) return {subjectType,subjectId,signals:[],documents:[],evidence:[],provenanceComplete:true};
  const ids=signals.map(x=>x.id).join(',');
  const evidence=await dbRequest(env,`xray_signal_evidence?select=*&signal_id=in.(${ids})&order=signal_id,ordinal`,{method:'GET'});
  const documents=[]; const seen=new Set();
  for(const e of evidence||[]){if(!seen.has(e.source_document_id)){seen.add(e.source_document_id);documents.push({id:e.source_document_id,sourceId:e.source_id,sourceUrl:e.document_url,sourceIdentifier:e.source_identifier,capturedAt:e.captured_at,sha256:e.sha256,objectKey:e.object_key,mediaType:e.media_type});}}
  const bySignal=new Map(); for(const e of evidence||[]){if(!bySignal.has(e.signal_id))bySignal.set(e.signal_id,[]);bySignal.get(e.signal_id).push(e);}
  const enriched=signals.map(sig=>({...sig,evidence:bySignal.get(sig.id)||[]}));
  const provenanceComplete=enriched.every(sig=>sig.evidence.length>0&&sig.evidence.every(e=>e.source_record_id&&e.source_document_id&&e.sha256&&e.document_url));
  return {subjectType,subjectId,generatedAt:new Date().toISOString(),provenanceComplete,signals:enriched,documents};
}

async function congressRoute(path, url) {
  if(path==='/api/congress/overview') {
    const currentYear=new Date().getFullYear();
    const settled=await Promise.allSettled([
      Camara.deputados({itens:8,ordem:'ASC',ordenarPor:'nome'}),
      Camara.votacoes({itens:8,ordem:'DESC',ordenarPor:'dataHoraRegistro'}),
      Camara.proposicoes({ano:currentYear,itens:6,ordem:'DESC',ordenarPor:'id'})
    ]);
    const value=i=>settled[i].status==='fulfilled'?settled[i].value:{dados:[],error:'source_unavailable'};
    return {generatedAt:new Date().toISOString(),source:'Câmara dos Deputados · Dados Abertos',partial:settled.some(x=>x.status==='rejected'),deputies:value(0),votes:value(1),propositions:value(2)};
  }
  if(path==='/api/congress/deputies') return Camara.deputados(boundedParams(url.searchParams,['uf','siglaPartido','nome','idLegislatura','ordem','ordenarPor','pagina','itens']));
  const dep=path.match(/^\/api\/congress\/deputies\/(\d+)$/); if(dep) return Camara.deputado(dep[1]);
  const exp=path.match(/^\/api\/congress\/deputies\/(\d+)\/expenses$/); if(exp) return Camara.despesas(exp[1],boundedParams(url.searchParams,['ano','mes','pagina','itens','ordem','ordenarPor'],{defaultItems:100,maxItems:100}));
  if(path==='/api/congress/votes') return Camara.votacoes(boundedParams(url.searchParams,['dataInicio','dataFim','idOrgao','idProposicao','pagina','itens','ordem','ordenarPor'],{defaultItems:30,maxItems:100}));
  const vote=path.match(/^\/api\/congress\/votes\/([^/]+)$/); if(vote) return Camara.votacao(vote[1]);
  const ori=path.match(/^\/api\/congress\/votes\/([^/]+)\/orientations$/); if(ori) return Camara.orientacoes(ori[1]);
  const vv=path.match(/^\/api\/congress\/votes\/([^/]+)\/individual$/); if(vv) return Camara.votos(vv[1]);
  if(path==='/api/congress/propositions') return Camara.proposicoes(boundedParams(url.searchParams,['siglaTipo','numero','ano','keywords','idDeputadoAutor','pagina','itens','ordem','ordenarPor'],{defaultItems:30,maxItems:100}));
  const prop=path.match(/^\/api\/congress\/propositions\/(\d+)$/); if(prop) return Camara.proposicao(prop[1]);
  const tr=path.match(/^\/api\/congress\/propositions\/(\d+)\/events$/); if(tr) return Camara.tramitacoes(tr[1],Object.fromEntries([...url.searchParams]));
  const th=path.match(/^\/api\/congress\/propositions\/(\d+)\/themes$/); if(th) return Camara.temas(th[1]);
  const au=path.match(/^\/api\/congress\/propositions\/(\d+)\/authors$/); if(au) return Camara.autores(au[1]);
  if(path==='/api/senate/members') return Senado.senadoresAtuais();
  const sv=path.match(/^\/api\/senate\/members\/([^/]+)\/votes$/); if(sv) return Senado.votacoesDoSenador(sv[1]);
  return null;
}

async function gazetteSearch(url){
  const q=url.searchParams.get('q')||url.searchParams.get('query')||'';
  const ibgeCode=url.searchParams.get('territory_id')||url.searchParams.get('ibge')||'';
  const from=url.searchParams.get('from')||undefined, to=url.searchParams.get('to')||undefined;
  if(!q) return {items:[],query:q,territoryId:ibgeCode};
  const raw=await QueridoDiario.gazettes({ibgeCode,query:q,size:Math.min(30,Math.max(1,Number(url.searchParams.get('size')||10))),excerptSize:700,numberOfExcerpts:2,from,to});
  const items=(raw?.gazettes||raw?.data||raw?.results||[]).map(g=>({
    territory_id:g.territory_id||g.territory?.id||ibgeCode,
    territory_name:g.territory_name||g.territory?.name||g.territory||'',
    date:g.date||g.published_at||g.published_since||'',
    edition:g.edition||g.edition_number||g.edition_extra||'',
    excerpt:Array.isArray(g.excerpts)?(g.excerpts[0]||''):(g.excerpt||''),
    excerpts:g.excerpts||[], url:g.url||g.txt_url||g.file_url||g.original_url||'',
    source:g.source||'Querido Diário'
  }));
  return {items,total:raw?.total_gazettes??raw?.total??items.length,query:q,territoryId:ibgeCode,source:'Querido Diário'};
}

async function auditDeputyExpenses(id,url){
  const ano=url.searchParams.get('ano')||new Date().getFullYear();
  const mes=url.searchParams.get('mes')||undefined;
  const payload=await Camara.despesas(id,{ano,mes,pagina:1,itens:100,ordem:'DESC',ordenarPor:'dataDocumento'});
  const rows=payload?.dados||[];
  return {deputyId:id,period:{ano,mes:mes||null},source:'Câmara dos Deputados · API v2',records:rows.length,signals:auditExpenses(rows),rawSample:rows.slice(0,5)};
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url), cHeaders=cors(request,env);
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{...cHeaders,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-collector-token'}});
    try {
      if(url.pathname==='/api/health') return json({ok:true,database:env.SUPABASE_URL&&env.SUPABASE_SECRET_KEY?'configured':'not-configured',archive:env.RAW_ARCHIVE?'configured':'not-configured',visualArchive:env.VISUAL_ARCHIVE?'configured':'not-configured',tseMode:cfg(env).mode},200,{...cHeaders,'cache-control':'no-store'});
      if(url.pathname==='/api/elections/2026/president') return json(await publicElection(env),200,cHeaders);
      if(url.pathname==='/api/elections/2026/replay') return json({items:await replay(env,url.searchParams.get('limit'))},200,cHeaders);
      const xm=url.pathname.match(/^\/api\/xray\/(person|municipality|organization)\/([0-9a-f-]{36})$/i);
      if(xm) return json(await xrayDossier(env,xm[1].toLowerCase(),xm[2]),200,cHeaders);
      const congress=await congressRoute(url.pathname,url); if(congress) return json(congress,200,cHeaders);
      if(url.pathname==='/api/gazettes') return json(await gazetteSearch(url),200,cHeaders);
      const municipality=url.pathname.match(/^\/api\/municipalities\/(\d{7})$/); if(municipality) return json({source:'IBGE · API de Localidades',capturedAt:new Date().toISOString(),data:await IBGE.municipio(municipality[1])},200,cHeaders);
      const auditMatch=url.pathname.match(/^\/api\/audit\/camara\/deputy\/(\d+)$/); if(auditMatch) return json(await auditDeputyExpenses(auditMatch[1],url),200,cHeaders);
      if(url.pathname==='/api/sources') return json({items:[
        {id:'tse',name:'Tribunal Superior Eleitoral',kind:'elections'}, {id:'ibge',name:'IBGE',kind:'territory'}, {id:'camara',name:'Câmara dos Deputados',kind:'legislative'},
        {id:'senado',name:'Senado Federal',kind:'legislative'}, {id:'pncp',name:'PNCP',kind:'procurement'}, {id:'siconfi',name:'Siconfi / Tesouro',kind:'fiscal'}, {id:'transparencia',name:'Portal da Transparência',kind:'transparency'}, {id:'receita',name:'Receita Federal / CNPJ',kind:'companies'}, {id:'datajud',name:'CNJ / DataJud',kind:'judiciary'}, {id:'querido-diario',name:'Querido Diário',kind:'municipal_documents'}]},200,cHeaders);
      if(url.pathname==='/api/admin/collect' && request.method==='POST'){
        if(!env.COLLECTOR_TOKEN || request.headers.get('x-collector-token')!==env.COLLECTOR_TOKEN) return json({error:'unauthorized'},401,cHeaders);
        return json(await collect(env),200,cHeaders);
      }
      return json({error:'not_found'},404,cHeaders);
    } catch(error) { const requestId=crypto.randomUUID();console.error(requestId,error);return json({error:'upstream_unavailable',message:'Não foi possível consultar a fonte pública neste momento.',requestId},502,{...cHeaders,'cache-control':'no-store'}); }
  },
  async scheduled(_event, env, ctx) { ctx.waitUntil(collect(env).catch(e=>console.error('scheduled collection failed',e))); }
};
