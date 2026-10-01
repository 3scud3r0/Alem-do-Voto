const BASE='https://legis.senado.leg.br/dadosabertos';
async function get(path,accept='application/json'){const u=BASE+path;const r=await fetch(u,{headers:{accept}});if(!r.ok)throw new Error(`Senado ${r.status}: ${u}`);const type=r.headers.get('content-type')||'';return type.includes('json')?r.json():r.text();}
// O Senado publica serviços legislativos em dadosabertos; alguns retornam XML dependendo do recurso.
export const Senado={
  base:BASE,
  senadoresAtuais:()=>get('/senador/lista/atual'),
  votacoesDoSenador:codigo=>get(`/senador/${encodeURIComponent(codigo)}/votacoes`),
  raw:path=>get(path),
};
