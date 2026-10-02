const BASE='https://api.queridodiario.ok.org.br';
async function get(path,params={}){const u=new URL(BASE+path);Object.entries(params).forEach(([k,v])=>v!=null&&v!==''&&u.searchParams.set(k,v));const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(u,{headers:{accept:'application/json'},signal:controller.signal});if(!r.ok)throw new Error(`Querido Diário ${r.status}: ${u}`);return r.json()}finally{clearTimeout(timeout)}}
export const QueridoDiario={
  base:BASE,
  gazettes:({ibgeCode,query,size=10,excerptSize=500,numberOfExcerpts=1,from,to}={})=>get('/gazettes',{territory_ids:ibgeCode,querystring:query,size,excerpt_size:excerptSize,number_of_excerpts:numberOfExcerpts,published_since:from,published_until:to}),
  raw:(path,params)=>get(path,params),
};
