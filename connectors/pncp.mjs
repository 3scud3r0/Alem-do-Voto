const BASE='https://pncp.gov.br/api/consulta';
async function get(path,params={}){const u=new URL(BASE+path);Object.entries(params).forEach(([k,v])=>v!=null&&u.searchParams.set(k,v));const r=await fetch(u,{headers:{accept:'application/json'}});if(!r.ok)throw new Error(`PNCP ${r.status}: ${u}`);return r.json();}
export const PNCP={
  tiposContratos:(ativo=true)=>get('/v1/tipos-contratos',{statusAtivo:ativo}),
  contrato:(cnpj,ano,sequencial)=>get(`/v1/orgaos/${cnpj}/contratos/${ano}/${sequencial}`),
  contratosDaContratacao:(cnpj,ano,sequencial)=>get(`/v1/orgaos/${cnpj}/contratos/contratacao/${ano}/${sequencial}`),
  arquivosContrato:(cnpj,ano,sequencial)=>get(`/v1/orgaos/${cnpj}/contratos/${ano}/${sequencial}/arquivos`),
};
