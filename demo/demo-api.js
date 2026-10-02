/* Além do Voto — API estática da demonstração pública.
 * Todos os registros abaixo são sintéticos e fictícios.
 */
(()=>{
  const enabled=location.hostname.endsWith('.github.io')||new URLSearchParams(location.search).has('demo');
  window.ADV_PUBLIC_DEMO=enabled;
  if(!enabled)return;

  const style=document.createElement('style');
  style.textContent=`
    .demo-global-notice{position:relative;z-index:1000;padding:10px 18px;background:#efe4bd;color:#171713;border-bottom:1px solid #b79b50;font:700 12px/1.45 system-ui,sans-serif;letter-spacing:.03em;text-align:center}
    .demo-global-notice strong{font-weight:900}.demo-global-notice span{font-weight:600}
  `;
  document.head.appendChild(style);
  addEventListener('DOMContentLoaded',()=>{const n=document.getElementById('demoNotice');if(n)n.hidden=false});

  const deputies=[
    {id:'demo-a',nome:'Pessoa Demonstrativa A',siglaUf:'SP',siglaPartido:'FIC-A',urlFoto:''},
    {id:'demo-b',nome:'Pessoa Demonstrativa B',siglaUf:'RJ',siglaPartido:'FIC-B',urlFoto:''},
    {id:'demo-c',nome:'Pessoa Demonstrativa C',siglaUf:'MG',siglaPartido:'FIC-C',urlFoto:''}
  ];
  const profiles={
    'demo-a':{dados:{nomeCivil:'Pessoa Demonstrativa A',ultimoStatus:{nome:'Pessoa Demonstrativa A',siglaUf:'SP',siglaPartido:'FIC-A',urlFoto:'',uri:null}}},
    'demo-b':{dados:{nomeCivil:'Pessoa Demonstrativa B',ultimoStatus:{nome:'Pessoa Demonstrativa B',siglaUf:'RJ',siglaPartido:'FIC-B',urlFoto:'',uri:null}}},
    'demo-c':{dados:{nomeCivil:'Pessoa Demonstrativa C',ultimoStatus:{nome:'Pessoa Demonstrativa C',siglaUf:'MG',siglaPartido:'FIC-C',urlFoto:'',uri:null}}}
  };
  const expenses={
    'demo-a':[
      ['DEMO-CEAP-A01','Divulgação demonstrativa',48600,'2026-08-14','Fornecedor Sintético Alfa'],
      ['DEMO-CEAP-A02','Passagens demonstrativas',12800,'2026-08-02','Fornecedor Sintético Beta'],
      ['DEMO-CEAP-A03','Serviços demonstrativos',11600,'2026-07-20','Fornecedor Sintético Gama'],
      ['DEMO-CEAP-A04','Divulgação demonstrativa',9800,'2026-07-11','Fornecedor Sintético Delta'],
      ['DEMO-CEAP-A05','Combustível demonstrativo',7100,'2026-06-28','Fornecedor Sintético Épsilon'],
      ['DEMO-CEAP-A06','Serviços demonstrativos',6400,'2026-06-09','Fornecedor Sintético Beta'],
      ['DEMO-CEAP-A07','Passagens demonstrativas',5900,'2026-05-23','Fornecedor Sintético Zeta'],
      ['DEMO-CEAP-A08','Divulgação demonstrativa',4800,'2026-05-02','Fornecedor Sintético Alfa']
    ],
    'demo-b':[
      ['DEMO-CEAP-B01','Divulgação demonstrativa',28400,'2026-08-12','Fornecedor Sintético Norte'],
      ['DEMO-CEAP-B02','Passagens demonstrativas',16200,'2026-08-01','Fornecedor Sintético Sul'],
      ['DEMO-CEAP-B03','Serviços demonstrativos',9900,'2026-07-17','Fornecedor Sintético Leste'],
      ['DEMO-CEAP-B04','Combustível demonstrativo',7800,'2026-07-03','Fornecedor Sintético Oeste'],
      ['DEMO-CEAP-B05','Divulgação demonstrativa',6200,'2026-06-14','Fornecedor Sintético Norte']
    ],
    'demo-c':[
      ['DEMO-CEAP-C01','Serviços demonstrativos',21900,'2026-08-03','Fornecedor Sintético Um'],
      ['DEMO-CEAP-C02','Passagens demonstrativas',13300,'2026-07-22','Fornecedor Sintético Dois'],
      ['DEMO-CEAP-C03','Divulgação demonstrativa',8700,'2026-06-30','Fornecedor Sintético Três']
    ]
  };
  const expenseRows=id=>(expenses[id]||expenses['demo-a']).map(([idDocumento,tipoDespesa,valorLiquido,dataDocumento,nomeFornecedor])=>({idDocumento,tipoDespesa,valorLiquido,dataDocumento,nomeFornecedor,urlDocumento:null}));

  const votes=[
    {id:'DEMO-VOT-003',descricao:'Votação demonstrativa sobre transparência de dados',dataHoraRegistro:'2026-08-21T18:30:00-03:00',siglaOrgao:'Plenário demonstrativo',uri:null},
    {id:'DEMO-VOT-002',descricao:'Votação demonstrativa sobre arquivos públicos',dataHoraRegistro:'2026-08-13T16:10:00-03:00',siglaOrgao:'Plenário demonstrativo',uri:null},
    {id:'DEMO-VOT-001',descricao:'Votação demonstrativa sobre dados abertos',dataHoraRegistro:'2026-08-05T15:00:00-03:00',siglaOrgao:'Plenário demonstrativo',uri:null}
  ];
  const propositions=[
    {id:'DEMO-PL-003',siglaTipo:'PL-DEMO',numero:103,ano:2026,ementa:'Proposição inteiramente fictícia para demonstrar tramitação e rastreabilidade.',uri:null},
    {id:'DEMO-PL-002',siglaTipo:'PL-DEMO',numero:102,ano:2026,ementa:'Proposição sintética sobre preservação de documentos digitais.',uri:null},
    {id:'DEMO-PL-001',siglaTipo:'PL-DEMO',numero:101,ano:2026,ementa:'Proposição sintética sobre transparência de dados públicos.',uri:null}
  ];
  const individualVotes={
    'DEMO-VOT-003':[
      {nome:'Pessoa Demonstrativa A',tipoVoto:'SIM'},
      {nome:'Pessoa Demonstrativa B',tipoVoto:'NÃO'},
      {nome:'Pessoa Demonstrativa C',tipoVoto:'SIM'}
    ],
    'DEMO-VOT-002':[
      {nome:'Pessoa Demonstrativa A',tipoVoto:'NÃO'},
      {nome:'Pessoa Demonstrativa B',tipoVoto:'SIM'},
      {nome:'Pessoa Demonstrativa C',tipoVoto:'ABSTENÇÃO'}
    ],
    'DEMO-VOT-001':[
      {nome:'Pessoa Demonstrativa A',tipoVoto:'SIM'},
      {nome:'Pessoa Demonstrativa B',tipoVoto:'SIM'},
      {nome:'Pessoa Demonstrativa C',tipoVoto:'SIM'}
    ]
  };
  const candidates=[
    {id:'cand-a',name:'Candidatura Demonstrativa A',party:'FIC-A',percent:41.8,votes:418000},
    {id:'cand-b',name:'Candidatura Demonstrativa B',party:'FIC-B',percent:36.4,votes:364000},
    {id:'cand-c',name:'Candidatura Demonstrativa C',party:'FIC-C',percent:21.8,votes:218000}
  ];
  const snapshot={
    candidates,
    states:{
      SP:{id:'cand-a',name:'Candidatura Demonstrativa A',percent:43.2},
      RJ:{id:'cand-b',name:'Candidatura Demonstrativa B',percent:40.1},
      MG:{id:'cand-a',name:'Candidatura Demonstrativa A',percent:42.5},
      BA:{id:'cand-c',name:'Candidatura Demonstrativa C',percent:38.9},
      RS:{id:'cand-b',name:'Candidatura Demonstrativa B',percent:39.4}
    },
    processedPercent:63.4,
    sections:{processed:6340,total:10000},
    capturedAt:'2026-10-01T13:00:00Z'
  };
  const replay=[
    {captured_at:'2026-10-01T12:00:00Z',processed_percent:18.2,normalized:{...snapshot,processedPercent:18.2,sections:{processed:1820,total:10000}}},
    {captured_at:'2026-10-01T12:30:00Z',processed_percent:39.7,normalized:{...snapshot,processedPercent:39.7,sections:{processed:3970,total:10000}}},
    {captured_at:'2026-10-01T13:00:00Z',processed_percent:63.4,normalized:snapshot}
  ];
  const gazettes=[
    {date:'2026-08-20',edition:'Edição demonstrativa 42',city:'Município Demonstrativo Alfa',excerpt:'Extrato inteiramente fictício para demonstrar busca textual, contexto e cadeia documental.',terms:['extrato','contrato','demo']},
    {date:'2026-08-11',edition:'Edição demonstrativa 41',city:'Município Demonstrativo Alfa',excerpt:'Ato sintético de nomeação criado exclusivamente para validar a experiência da interface.',terms:['nomeação','demo']},
    {date:'2026-07-29',edition:'Edição demonstrativa 40',city:'Município Demonstrativo Beta',excerpt:'Aviso fictício de contratação utilizado como fixture metodológica da demonstração.',terms:['contratação','demo']}
  ];
  const sources=['TSE','Câmara','Senado','IBGE','Siconfi','PNCP','Transparência','CNPJ','DataJud','Querido Diário'].map(name=>({name,mode:'demo',synthetic:true}));
  const municipality={
    id:'3300704',
    nome:'Município Demonstrativo',
    'regiao-imediata':{
      nome:'Região Imediata Demonstrativa',
      'regiao-intermediaria':{
        nome:'Região Intermediária Demonstrativa',
        UF:{sigla:'DM',nome:'Unidade Federativa Demonstrativa',regiao:{sigla:'D',nome:'Região Demonstrativa'}}
      }
    }
  };

  const clone=v=>JSON.parse(JSON.stringify(v));
  const dossier=async()=>{const r=await fetch('demo/xray-dossier.json',{cache:'no-store'});if(!r.ok)throw new Error('fixture dossier unavailable');return r.json()};
  const audit=async()=>{
    const d=await dossier();
    return {
      demo:true,
      synthetic:true,
      records:d.summary?.records||0,
      signals:(d.signals||[]).map(s=>({
        rule:s.rule_id,
        version:s.rule_version,
        observedLabel:s.observed,
        reason:s.headline,
        limitations:s.limitations,
        evidence:(s.inputs||[]).map(i=>({supplier:i.label,recordId:i.record,date:'fixture sintético'}))
      }))
    };
  };

  window.ADV_DEMO_API=async path=>{
    const u=new URL(path,'https://demo.invalid');
    const p=u.pathname;
    if(p==='/api/health')return {ok:true,database:'demo estática',archive:'fixtures sintéticos',demo:true};
    if(p==='/api/sources')return {items:clone(sources),demo:true};
    if(p==='/api/elections/2026/president')return {mode:'simulator',snapshot:clone(snapshot),demo:true,synthetic:true};
    if(p==='/api/elections/2026/replay')return {items:clone(replay),demo:true,synthetic:true};
    if(p==='/api/congress/overview')return {deputies:{dados:clone(deputies)},votes:{dados:clone(votes)},propositions:{dados:clone(propositions)},demo:true,synthetic:true};
    if(p==='/api/congress/deputies'){
      const q=(u.searchParams.get('nome')||'').toLowerCase();
      const items=q?deputies.filter(d=>d.nome.toLowerCase().includes(q)):deputies;
      return {dados:clone(items),demo:true,synthetic:true};
    }
    if(p==='/api/congress/propositions'){
      const q=(u.searchParams.get('keywords')||'').toLowerCase();
      const items=q?propositions.filter(x=>`${x.siglaTipo} ${x.numero} ${x.ementa}`.toLowerCase().includes(q)):propositions;
      return {dados:clone(items),demo:true,synthetic:true};
    }
    if(p==='/api/congress/votes')return {dados:clone(votes),demo:true,synthetic:true};
    let m=p.match(/^\/api\/congress\/votes\/([^/]+)\/individual$/);
    if(m)return {dados:clone(individualVotes[decodeURIComponent(m[1])]||[]),demo:true,synthetic:true};
    m=p.match(/^\/api\/congress\/votes\/([^/]+)\/orientations$/);
    if(m)return {dados:[{nome:'Orientação Demonstrativa',orientacaoVoto:'LIBERADO'}],demo:true,synthetic:true};
    m=p.match(/^\/api\/congress\/deputies\/([^/]+)\/expenses$/);
    if(m)return {dados:clone(expenseRows(decodeURIComponent(m[1]))),demo:true,synthetic:true};
    m=p.match(/^\/api\/congress\/deputies\/([^/]+)$/);
    if(m)return clone(profiles[decodeURIComponent(m[1])]||profiles['demo-a']);
    if(/^\/api\/audit\/camara\/deputy\//.test(p))return audit();
    if(/^\/api\/municipalities\//.test(p))return {data:clone(municipality),capturedAt:'2026-10-01T13:00:00Z',demo:true,synthetic:true};
    if(p==='/api/gazettes'){
      const q=(u.searchParams.get('q')||'').toLowerCase();
      const items=q?gazettes.filter(g=>`${g.excerpt} ${g.terms.join(' ')}`.toLowerCase().includes(q)):gazettes;
      return {items:clone(items),total:items.length,demo:true,synthetic:true};
    }
    throw new Error(`Rota não disponível na demo estática: ${p}`);
  };
})();