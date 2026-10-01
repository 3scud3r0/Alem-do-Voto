const BASE='https://api-publica.datajud.cnj.jus.br';
export function DataJud(apiKey){
  if(!apiKey)throw new Error('DataJud exige a chave pública vigente do CNJ; mantenha-a configurável porque pode ser alterada.');
  async function search(alias,body){const clean=String(alias).replace(/^api_publica_/,'').replace(/[^a-z0-9-]/gi,'');const u=`${BASE}/api_publica_${clean}/_search`;const r=await fetch(u,{method:'POST',headers:{accept:'application/json','content-type':'application/json',authorization:`APIKey ${apiKey}`},body:JSON.stringify(body)});if(!r.ok)throw new Error(`DataJud ${r.status}: ${u}`);return r.json();}
  return {base:BASE,search,byProcessNumber:(alias,numeroProcesso)=>search(alias,{query:{match:{numeroProcesso:String(numeroProcesso).replace(/\D/g,'')}}})};
}
