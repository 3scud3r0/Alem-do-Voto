const LOCAL='https://servicodados.ibge.gov.br/api/v1/localidades';
const MESH='https://servicodados.ibge.gov.br/api/v4/malhas';
async function j(url){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(url,{headers:{accept:'application/json'},signal:controller.signal});if(!r.ok)throw new Error(`IBGE ${r.status}: ${url}`);return r.json()}finally{clearTimeout(timeout)}}
export const IBGE={
  estados:()=>j(`${LOCAL}/estados?orderBy=nome`),
  municipios:uf=>j(`${LOCAL}/estados/${encodeURIComponent(uf)}/municipios?orderBy=nome`),
  municipio:id=>j(`${LOCAL}/municipios/${encodeURIComponent(id)}`),
  malhaBrasilUF:async()=>{const r=await fetch(`${MESH}/paises/BR?intrarregiao=UF&qualidade=maxima&formato=application/vnd.geo+json`,{headers:{accept:'application/vnd.geo+json'}});if(!r.ok)throw new Error(`IBGE malha ${r.status}`);return r.json();},
};
