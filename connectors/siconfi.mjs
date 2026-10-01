const BASE='https://apidatalake.tesouro.gov.br/ords/siconfi/tt';
async function get(path,params={}){const u=new URL(BASE+path);Object.entries(params).forEach(([k,v])=>v!=null&&u.searchParams.set(k,v));const r=await fetch(u,{headers:{accept:'application/json'}});if(!r.ok)throw new Error(`Siconfi ${r.status}: ${u}`);return r.json();}
export const Siconfi={
  entes:(params={})=>get('/entes',params),
  dca:(params={})=>get('/dca',params),
  rreo:(params={})=>get('/rreo',params),
  rgf:(params={})=>get('/rgf',params),
  msc:(params={})=>get('/msc_orcamentaria',params),
};
