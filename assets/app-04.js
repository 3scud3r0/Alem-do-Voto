function elections(){return `<section class="page fade">${pageHead('ELEIÇÕES 2026','Presidente','Resultado oficial quando publicado; arquivo temporal desde o primeiro snapshot.','<b>1º TURNO</b><span>4 OUT 2026</span>')}
  <div class="container election-status"><div><span class="live waiting" id="liveBadge">AGUARDANDO TSE</span><p id="dataMode">Nenhum resultado eleitoral é fabricado.</p></div><div class="election-progress"><small>SEÇÕES TOTALIZADAS</small><div><strong id="ePct">—</strong><div class="progress"><i id="eBar"></i></div></div><span id="eCap">Aguardando primeiro snapshot</span></div><div class="status-time"><small>ÚLTIMA CAPTURA</small><b id="updatedAt">—</b></div></div>
  <div class="subnav"><div class="container"><a class="active">BRASIL</a><a>POR ESTADO</a><a>POR MUNICÍPIO</a><a href="#/replay">REPLAY</a></div></div>
  <div class="container election-layout"><div class="election-results"><div class="section-heading"><div><span class="eyebrow">RESULTADO</span><h2>Votos válidos</h2></div>${provenanceBadge('L1','TSE')}</div><div id="candidateList">${candidateRows()}</div></div><div class="election-map-panel"><div class="map-frame">${mapLight}<div class="map-selection" id="mapSelection"><div class="selected-state-mark">BR</div><div><small>MAPA TERRITORIAL</small><strong>Selecione um estado</strong><p>SP, RJ e todas as demais UFs possuem uma camada de clique ampliada, independente da espessura do desenho.</p></div></div></div><aside class="map-aside"><span class="eyebrow">LEITURA DO MAPA</span><h3>Território e resultado são camadas distintas.</h3><p>Dourado = UF selecionada. Outras cores só aparecem quando houver um snapshot eleitoral oficial carregado.</p><div class="source-stack"><span>Malha: IBGE</span><span>Resultado: TSE</span><span>Arquivo: R2 + SHA-256</span></div><a href="#/replay" class="text-link">ABRIR REPLAY →</a></aside></div></div>
</section>`}

function congress(){return `<section class="page fade">${pageHead('CONGRESSO','O Legislativo, em camadas.','Identidade oficial, comportamento legislativo, tramitação, votações nominais, presença, gastos e comparações reproduzíveis.',trustLegend())}
  <div class="container">${liveBannerShell('Conectando Câmara e Senado…')}
  <div class="congress-mast"><div><span class="eyebrow">PERFIL 360</span><h2>Da cadeira ao voto.</h2><p>O perfil separa o que veio diretamente da fonte oficial do que foi agregado e do que foi calculado.</p></div><div class="congress-kpis">${metric('FONTE ATIVA','Câmara','Dados Abertos')}${metric('CAMADAS','L1–L3','confiança explícita')}${metric('ATUALIZAÇÃO','contínua','cron + fontes')}</div></div>
  <div class="feature-grid three">
    <a class="feature-panel" href="#/politicos"><span class="panel-index">A</span><small>PARLAMENTARES</small><h3>Perfil 360</h3><p>Mandato, partido, UF, votos, alinhamento, afinidade, presença, gastos, proposições e histórico.</p><b>ABRIR PERFIL →</b></a>
    <a class="feature-panel" href="#/proposicoes"><span class="panel-index">B</span><small>PROPOSIÇÕES</small><h3>Tramitação legível</h3><p>Apresentação, comissões, relatoria, plenário, casa revisora e sanção numa linha do tempo.</p><b>EXPLORAR PROJETOS →</b></a>
    <a class="feature-panel" href="#/votacoes"><span class="panel-index">C</span><small>VOTAÇÕES</small><h3>Quem votou como</h3><p>Resultado, votos individuais quando nominais, orientações formais e divergências factuais.</p><b>VER VOTAÇÕES →</b></a>
  </div>
  <div class="congress-two"><section class="paper-panel">${liveLoading('Carregando votações oficiais')}</section>
  <section class="ink-panel">${liveLoading('Carregando parlamentares em exercício')}</section></div>
  </div></section>`}

function politicians(){return `<section class="page fade">${breadcrumb(['Congresso','Perfil parlamentar'])}<div class="container profile-premium">${liveBannerShell('Consultando perfil oficial…')}
  <div class="profile-identity">${liveLoading('Carregando identidade oficial')}</div>
  <div class="profile-nav"><a class="active">VISÃO GERAL</a><a href="#/votacoes">VOTAÇÕES</a><a href="#/proposicoes">PROPOSIÇÕES</a><a href="#/auditoria">GASTOS</a><a href="#/raio-x">RAIO-X</a></div>
  <div class="profile-dashboard">${liveLoading('Carregando registros do período')}</div>
  </div></section>`}
