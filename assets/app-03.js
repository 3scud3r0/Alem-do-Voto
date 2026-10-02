function breadcrumb(parts){return `<div class="crumb"><div class="container">⌂ ${parts.map(x=>`<span>›</span>${esc(x)}`).join('')}</div></div>`}
function pageHead(kicker,title,deck='',meta=''){return `${breadcrumb([kicker])}<div class="page-head"><div class="container page-head-grid"><div><span class="eyebrow">${esc(kicker)}</span><h1 class="page-title">${title}</h1>${deck?`<p class="page-deck">${deck}</p>`:''}</div>${meta?`<div class="page-meta">${meta}</div>`:''}</div></div>`}
function metric(label,value,sub=''){return `<div class="metric"><small>${label}</small><strong>${value}</strong>${sub?`<span>${sub}</span>`:''}</div>`}
function trustLegend(){return `<div class="trust-legend">${provenanceBadge('L1','registro oficial')}${provenanceBadge('L2','agregação verificável')}${provenanceBadge('L3','cálculo derivado')}</div>`}
function candidateRows(){if(!candidates.length)return `<div class="empty-state premium"><span class="eyebrow">TSE 2026</span><h3>Aguardando o primeiro snapshot oficial.</h3><p>O sistema não preenche placares fictícios. Quando a divulgação começar, cada número será ligado ao arquivo bruto preservado, hash, horário e identificador do TSE.</p></div>`;return candidates.slice(0,8).map((c,i)=>`<div class="candidate-row"><span class="candidate-rank">${String(i+1).padStart(2,'0')}</span><div><b>${esc(c.name)}</b><small>${esc(c.party||'')}</small><div class="candidate-track"><i style="width:${Math.max(1,Number(c.percent||0))}%;background:${c.color}"></i></div></div><strong>${npt(c.percent)}%</strong><span>${Number(c.votes||0).toLocaleString('pt-BR')} votos</span></div>`).join('')}
function capabilityCard(num,kicker,title,body,href,accent){return `<a class="cap-card" href="${href}" style="--cap-accent:${accent}"><span class="cap-num">${num}</span><div><small>${kicker}</small><h3>${title}</h3><p>${body}</p><b>EXPLORAR →</b></div></a>`}

/* ---------- PÁGINAS ---------- */
function home(){return `<section class="home fade">
  <div class="home-hero">
    <div class="hero-aura"></div><div class="hero-ruler"></div><div class="hero-coordinate" aria-hidden="true">15°47′S · 47°52′W</div>
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="hero-edition"><i></i> INTELIGÊNCIA CÍVICA · BRASIL</span>
        <h1 class="hero-title">O poder,<br><em>sem atalhos.</em></h1>
        <p class="hero-deck">Eleições, Congresso, municípios, gastos, contratos, empresas e documentos oficiais — conectados sem transformar dado em opinião.</p>
        <div class="hero-search"><span>⌕</span><input id="heroSearch" placeholder="Pessoa, município, empresa, lei, votação..."><button id="heroGo" aria-label="Buscar">→</button></div>
        <div class="hero-proof"><i></i><span>Todo número abre até o registro que o originou.</span><a href="#/raio-x">CONHEÇA O MÉTODO →</a></div>
      </div>
      <div class="hero-art">
        <div class="hero-map">${mapDark}</div>
        <div class="hero-state-card" id="heroStateCard"></div>
        <div class="hero-note"><small>BRASIL</small><b>27</b><span>unidades federativas<br>em vetor interativo</span></div>
        <div class="hero-seal"><span>ALÉM</span><b>DO</b><span>ESTADO</span></div>
      </div>
    </div>
    <div class="hero-scroll" aria-hidden="true"><span>EXPLORAR</span><i></i></div>
  </div>
  <div class="home-index"><div class="container index-grid">
    ${capabilityCard('01','ELEIÇÕES','Acompanhe e volte no tempo','Apuração oficial, mapa por UF, histórico e replay documental de cada snapshot.','#/eleicoes','#c6a45f')}
    ${capabilityCard('02','LEGISLATIVO','Entenda o Congresso','Perfis, proposições, tramitação, votos nominais, alinhamentos factuais, presença e gastos.','#/congresso','#829097')}
    ${capabilityCard('03','AUDITORIA','Interrogue os gastos','Regras reproduzíveis para encontrar padrões que merecem revisão, sempre com razões e documentos.','#/auditoria','#b66550')}
    ${capabilityCard('04','MUNICÍPIOS','Leia o que foi publicado','Finanças, contratos, eleições e busca textual em diários oficiais.','#/municipios','#7b8068')}
  </div></div>
  <div class="home-editorial"><div class="container editorial-grid">
    <div><span class="eyebrow light">PRINCÍPIO EDITORIAL</span><h2>Não diga em quem votar.<br>Mostre o que há para saber.</h2></div>
    <div class="editorial-copy"><p>O Além do Voto combina transparência legislativa, auditoria de gastos e documentos municipais em uma única arquitetura temporal. O produto não dá nota moral a políticos nem converte correlação em acusação.</p><div class="editorial-rules"><span><b>01</b>Fonte antes de interpretação</span><span><b>02</b>Tempo antes de correlação</span><span><b>03</b>Documento antes de número</span><span><b>04</b>Limitação junto do achado</span></div></div>
  </div></div>
</section>`}
