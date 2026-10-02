'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const view=$('#view'), searchDialog=$('#searchDialog'), searchInput=$('#searchInput'), results=$('#results'), toast=$('#toast'), documentDialog=$('#documentDialog'), documentViewer=$('#documentViewer');
const DEMO_MODE=Boolean(window.ADV_PUBLIC_DEMO);\nconst FALLBACK=window.ADV_BRAZIL_PATHS||{v:'0 0 900 850',s:[]};
const IBGE_STATES={11:['RO','Rondônia'],12:['AC','Acre'],13:['AM','Amazonas'],14:['RR','Roraima'],15:['PA','Pará'],16:['AP','Amapá'],17:['TO','Tocantins'],21:['MA','Maranhão'],22:['PI','Piauí'],23:['CE','Ceará'],24:['RN','Rio Grande do Norte'],25:['PB','Paraíba'],26:['PE','Pernambuco'],27:['AL','Alagoas'],28:['SE','Sergipe'],29:['BA','Bahia'],31:['MG','Minas Gerais'],32:['ES','Espírito Santo'],33:['RJ','Rio de Janeiro'],35:['SP','São Paulo'],41:['PR','Paraná'],42:['SC','Santa Catarina'],43:['RS','Rio Grande do Sul'],50:['MS','Mato Grosso do Sul'],51:['MT','Mato Grosso'],52:['GO','Goiás'],53:['DF','Distrito Federal']};
const IBGE_MAP_URL='https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?intrarregiao=UF&qualidade=maxima&formato=application/vnd.geo+json';
const PALETTE=['#a77849','#597078','#8f554b','#70795c','#695f82','#8a7b67','#536d61','#9a745d'];
let selectedUF=null, brazilGeoPromise=null, candidates=[], electionStateLeaders={}, mapTip=null;
try{selectedUF=sessionStorage.getItem('adv-selected-uf')||null}catch{}

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function npt(v,d=2){return Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})}
function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),3200)}
async function api(path,opts={}){
  if(DEMO_MODE&&typeof window.ADV_DEMO_API==='function')return window.ADV_DEMO_API(path,opts);
  const c=new AbortController(),t=setTimeout(()=>c.abort(),18000);
  try{const r=await fetch(path,{...opts,signal:c.signal,headers:{accept:'application/json',...(opts.headers||{})}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
  finally{clearTimeout(t)}
}
function provenanceBadge(level='L1',label='fonte oficial'){return `<span class="trust-badge ${level.toLowerCase()}"><b>${level}</b>${esc(label)}</span>`}
