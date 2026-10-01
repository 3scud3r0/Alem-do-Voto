'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const view=$('#view'), searchDialog=$('#searchDialog'), searchInput=$('#searchInput'), results=$('#results'), toast=$('#toast'), documentDialog=$('#documentDialog'), documentViewer=$('#documentViewer');
const XRAY=window.ADV_XRAY_DEMO||{signals:[],documents:[],summary:{}};
const FALLBACK=window.ADV_BRAZIL_PATHS||{v:'0 0 900 850',s:[]};
const IBGE_STATES={11:['RO','Rondônia'],12:['AC','Acre'],13:['AM','Amazonas'],14:['RR','Roraima'],15:['PA','Pará'],16:['AP','Amapá'],17:['TO','Tocantins'],21:['MA','Maranhão'],22:['PI','Piauí'],23:['CE','Ceará'],24:['RN','Rio Grande do Norte'],25:['PB','Paraíba'],26:['PE','Pernambuco'],27:['AL','Alagoas'],28:['SE','Sergipe'],29:['BA','Bahia'],31:['MG','Minas Gerais'],32:['ES','Espírito Santo'],33:['RJ','Rio de Janeiro'],35:['SP','São Paulo'],41:['PR','Paraná'],42:['SC','Santa Catarina'],43:['RS','Rio Grande do Sul'],50:['MS','Mato Grosso do Sul'],51:['MT','Mato Grosso'],52:['GO','Goiás'],53:['DF','Distrito Federal']};
const IBGE_MAP_URL='https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?intrarregiao=UF&qualidade=maxima&formato=application/vnd.geo+json';
const PALETTE=['#a77849','#597078','#8f554b','#70795c','#695f82','#8a7b67','#536d61','#9a745d'];
let selectedUF=null, brazilGeoPromise=null, candidates=[], electionStateLeaders={}, mapTip=null;
try{selectedUF=sessionStorage.getItem('adv-selected-uf')||null}catch{}

const DEMO={
  congress:{
    parliamentarians:[
      {name:'Parlamentar A',house:'Câmara',uf:'SP',party:'AAA',presence:'96,4%',alignment:'88,7%',expenses:'R$ 184 mil',proposals:34},
      {name:'Parlamentar B',house:'Senado',uf:'RJ',party:'BBB',presence:'93,1%',alignment:'76,2%',expenses:'—',proposals:21},
      {name:'Parlamentar C',house:'Câmara',uf:'MG',party:'CCC',presence:'90,8%',alignment:'81,0%',expenses:'R$ 142 mil',proposals:27}
    ],
    votes:[
      {date:'30 SET',title:'Votação nominal demonstrativa',result:'APROVADA',yes:318,no:101,abst:4,theme:'Finanças públicas'},
      {date:'29 SET',title:'Requerimento demonstrativo de urgência',result:'REJEITADA',yes:172,no:249,abst:2,theme:'Administração pública'},
      {date:'24 SET',title:'Emenda demonstrativa ao texto-base',result:'APROVADA',yes:287,no:132,abst:7,theme:'Educação'}
    ],
    bills:[
      {id:'PL 0001/2026',title:'Proposição demonstrativa sobre transparência de dados',stage:'Comissão',age:'41 dias',theme:'Administração Pública'},
      {id:'PLP 0002/2026',title:'Proposição demonstrativa sobre finanças subnacionais',stage:'Plenário',age:'83 dias',theme:'Finanças Públicas'},
      {id:'PEC 0003/2026',title:'Proposição demonstrativa para validar a linha de tramitação',stage:'CCJ',age:'126 dias',theme:'Direito Constitucional'}
    ]
  },
  audit:[
    {id:'AUD-001',kind:'Concentração',title:'Concentração de fornecedor acima do grupo comparável',observed:'72,4%',why:'Os três maiores fornecedores respondem por 72,4% do conjunto demonstrativo.',sources:['Câmara · CEAP','CNPJ'],docs:4,priority:'alta'},
    {id:'AUD-002',kind:'Duplicidade',title:'Documentos com campos idênticos no mesmo período',observed:'2 pares',why:'Data, fornecedor e valor coincidem; a regra exige revisão do documento fiscal antes de qualquer conclusão.',sources:['Câmara · CEAP'],docs:2,priority:'média'},
    {id:'AUD-003',kind:'Outlier robusto',title:'Despesa distante da mediana do grupo',observed:'zᵣ 8,31',why:'O valor está distante da mediana usando MAD, método menos sensível aos próprios extremos.',sources:['Câmara · CEAP'],docs:1,priority:'média'},
    {id:'AUD-004',kind:'Temporalidade',title:'Fornecedor e vínculo societário coexistem no período',observed:'1 relação',why:'O cruzamento temporal encontrou sobreposição documental; isso não equivale a irregularidade.',sources:['CNPJ','PNCP'],docs:3,priority:'contexto'}
  ],
  gazettes:[
    {date:'29/09/2026',city:'Município demonstrativo · RJ',edition:'Edição 1.842',excerpt:'... fica autorizada a abertura do processo administrativo para contratação ... publicação integral disponível no documento de origem ...',terms:['contratação','processo administrativo']},
    {date:'26/09/2026',city:'Município demonstrativo · RJ',edition:'Edição 1.839',excerpt:'... decreto demonstrativo para validar a interface de busca por atos, datas e trechos de diário oficial ...',terms:['decreto']},
    {date:'21/09/2026',city:'Município demonstrativo · RJ',edition:'Edição 1.834',excerpt:'... extrato demonstrativo de contrato, com identificação do processo, contratada, prazo e valor ...',terms:['contrato','extrato']}
  ]
};

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function npt(v,d=2){return Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})}
function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),3200)}
async function api(path,opts={}){const c=new AbortController(),t=setTimeout(()=>c.abort(),7000);try{const r=await fetch(path,{...opts,signal:c.signal,headers:{accept:'application/json',...(opts.headers||{})}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}finally{clearTimeout(t)}}
function provenanceBadge(level='L1',label='fonte oficial'){return `<span class="trust-badge ${level.toLowerCase()}"><b>${level}</b>${esc(label)}</span>`}
function demoBanner(text='INTERFACE DE DEMONSTRAÇÃO — dados sintéticos; nenhuma conclusão se refere a pessoa real.') {return `<div class="demo-banner"><b>DEMO</b><span>${text}</span></div>`}

