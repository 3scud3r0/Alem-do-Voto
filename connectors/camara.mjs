const BASE='https://dadosabertos.camara.leg.br/api/v2';
async function get(path,params={}){const u=new URL(BASE+path);Object.entries(params).forEach(([k,v])=>v!=null&&v!==''&&u.searchParams.set(k,v));const r=await fetch(u,{headers:{accept:'application/json'}});if(!r.ok)throw new Error(`Câmara ${r.status}: ${u}`);return r.json();}
export const Camara={
  base:BASE,
  deputados:(params={})=>get('/deputados',params),
  deputado:id=>get(`/deputados/${encodeURIComponent(id)}`),
  despesas:(id,params={})=>get(`/deputados/${encodeURIComponent(id)}/despesas`,params),
  eventosDeputado:(id,params={})=>get(`/deputados/${encodeURIComponent(id)}/eventos`,params),
  orgaosDeputado:(id,params={})=>get(`/deputados/${encodeURIComponent(id)}/orgaos`,params),
  frentesDeputado:id=>get(`/deputados/${encodeURIComponent(id)}/frentes`),
  votacoes:(params={})=>get('/votacoes',params),
  votacao:id=>get(`/votacoes/${encodeURIComponent(id)}`),
  votos:id=>get(`/votacoes/${encodeURIComponent(id)}/votos`),
  orientacoes:id=>get(`/votacoes/${encodeURIComponent(id)}/orientacoes`),
  proposicoes:(params={})=>get('/proposicoes',params),
  proposicao:id=>get(`/proposicoes/${encodeURIComponent(id)}`),
  tramitacoes:(id,params={})=>get(`/proposicoes/${encodeURIComponent(id)}/tramitacoes`,params),
  temas:id=>get(`/proposicoes/${encodeURIComponent(id)}/temas`),
  autores:id=>get(`/proposicoes/${encodeURIComponent(id)}/autores`),
  partidos:(params={})=>get('/partidos',params),
  partido:id=>get(`/partidos/${encodeURIComponent(id)}`),
  raw:(path,params={})=>get(path,params),
};
