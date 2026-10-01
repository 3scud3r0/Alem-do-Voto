const BASE='https://api.portaldatransparencia.gov.br/api-de-dados';
export function Transparencia(apiKey){
  if(!apiKey)throw new Error('A API do Portal da Transparência exige token em chave-api-dados.');
  async function get(path,params={}){const u=new URL(BASE+path);Object.entries(params).forEach(([k,v])=>v!=null&&u.searchParams.set(k,v));const r=await fetch(u,{headers:{accept:'application/json','chave-api-dados':apiKey}});if(!r.ok)throw new Error(`Transparência ${r.status}: ${u}`);return r.json();}
  return {
    contratos:params=>get('/contratos',params),
    licitacoes:params=>get('/licitacoes',params),
    emendas:params=>get('/emendas',params),
    ceis:params=>get('/ceis',params),
    cnep:params=>get('/cnep',params),
    raw:(path,params)=>get(path,params),
  };
}
