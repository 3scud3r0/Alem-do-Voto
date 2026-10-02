/* ---------- MAPA ---------- */
const mapLight=`<div class="real-map-host map-light" data-brazil-map="default"><span class="map-loading">Preparando malha do Brasil…</span></div>`;
const mapDark=`<div class="real-map-host map-dark" data-brazil-map="hero"><span class="map-loading">Preparando malha do Brasil…</span></div>`;
function walkCoords(a,fn){if(Array.isArray(a)&&a.length>=2&&typeof a[0]==='number'&&typeof a[1]==='number')fn(a);else if(Array.isArray(a))a.forEach(x=>walkCoords(x,fn))}
function geoCode(f){const p=f.properties||{};return String(p.codarea||p.CD_UF||p.cd_geocuf||p.id||'').slice(0,2)}
function stateMeta(f){const code=geoCode(f),known=IBGE_STATES[+code],p=f.properties||{};return {code,uf:p.sigla||p.SIGLA||known?.[0]||code,name:p.nome||p.NM_UF||known?.[1]||code}}
function projectFactory(geo,w=900,h=850,pad=18){const pts=[];geo.features.forEach(f=>walkCoords(f.geometry.coordinates,p=>pts.push(p)));const c=Math.cos(-14.5*Math.PI/180);let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;pts.forEach(([lon,lat])=>{const x=lon*c,y=-lat;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)});const k=Math.min((w-pad*2)/(maxX-minX),(h-pad*2)/(maxY-minY));return {w,h,p:([lon,lat])=>[(lon*c-minX)*k+pad,(-lat-minY)*k+pad]}}
function geomPath(g,p){const rings=g.type==='Polygon'?g.coordinates:g.type==='MultiPolygon'?g.coordinates.flat():[];return rings.map(r=>r.map((pt,i)=>{const [x,y]=p(pt);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`}).join('')+'Z').join('')}
async function getBrazilGeo(){
  if(brazilGeoPromise)return brazilGeoPromise;
  brazilGeoPromise=(async()=>{
    if(!DEMO_MODE&&location.protocol!=='file:'){
      const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),4200);
      try{const r=await fetch(IBGE_MAP_URL,{headers:{accept:'application/vnd.geo+json, application/json'},signal:ctl.signal});if(r.ok){const j=await r.json();if(j?.type==='FeatureCollection'&&j.features?.length>=27)return {geo:j,source:'IBGE · API v4 · qualidade máxima',official:true}}}catch(e){console.warn('IBGE map',e)}finally{clearTimeout(timer)}
    }
    if(FALLBACK?.s?.length===27)return {paths:FALLBACK,source:DEMO_MODE?'Vetor local da demo · sem consulta externa':'IBGE · vetor local de contingência',official:false};
    throw new Error('map_unavailable');
  })();
  return brazilGeoPromise;
}
function mapFill(uf,context){if(context==='hero')return '';return electionStateLeaders[uf]?.color||''}
function stateMarkup(m,context){const fill=mapFill(m.uf,context);return `<g class="state-node${selectedUF===m.uf?' selected':''}" data-state-node data-uf="${esc(m.uf)}" data-name="${esc(m.name)}" tabindex="0" role="button" aria-pressed="${selectedUF===m.uf}" aria-label="${esc(m.name)}, ${esc(m.uf)}"${fill?` style="--state-fill:${fill}"`:''}><path class="uf-visual" d="${m.d}"></path><path class="uf-hit" d="${m.d}"></path></g>`}
async function hydrateMaps(){
  const hosts=$$('[data-brazil-map]'); if(!hosts.length)return;
  try{
    const md=await getBrazilGeo(); let defs,vb;
    if(md.geo){const pf=projectFactory(md.geo);defs=md.geo.features.map(f=>({...stateMeta(f),d:geomPath(f.geometry,pf.p)}));vb=`0 0 ${pf.w} ${pf.h}`}
    else {defs=md.paths.s.map(x=>({uf:x.u,name:x.n,code:x.u,d:x.d}));vb=md.paths.v}
    for(const host of hosts){
      const context=host.dataset.brazilMap||'default';
      host.innerHTML=`<svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa do Brasil dividido pelas 27 unidades da Federação"><defs><filter id="stateGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="map-grid-lines"><path d="M120 210H810M95 420H835M160 630H770"/><path d="M270 80V780M500 55V805M700 110V740"/></g><g class="states-layer">${defs.map(m=>stateMarkup(m,context)).join('')}</g><g class="labels-layer"></g></svg><div class="map-caption"><span>${esc(md.source)}</span><b>27 UFs · clique, Enter ou Espaço</b></div>`;
      const svg=$('svg',host), labels=$('.labels-layer',host);
      $$('.state-node',host).forEach(g=>{
        try{
          const b=g.querySelector('.uf-visual').getBBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;
          const tiny=['RJ','ES','DF','SE','AL'].includes(g.dataset.uf), r=tiny?13:Math.max(7,Math.min(12,Math.min(b.width,b.height)*.22));
          const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('cx',cx);circle.setAttribute('cy',cy);circle.setAttribute('r',r);circle.setAttribute('class','state-anchor-hit');circle.dataset.stateNode='';circle.dataset.uf=g.dataset.uf;circle.dataset.name=g.dataset.name;labels.appendChild(circle);
          if(!['PB','RN','AL','SE','ES','DF'].includes(g.dataset.uf)||tiny){const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',cx);t.setAttribute('y',cy);t.setAttribute('class','uf-label');t.dataset.stateNode='';t.dataset.uf=g.dataset.uf;t.dataset.name=g.dataset.name;t.textContent=g.dataset.uf;labels.appendChild(t)}
        }catch{}
      });
      const findNode=target=>target.closest?.('[data-state-node]')||null;
      host.addEventListener('click',ev=>{const n=findNode(ev.target);if(n)selectState(n.dataset.uf,n.dataset.name)});
      host.addEventListener('keydown',ev=>{const n=findNode(ev.target);if(n&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();selectState(n.dataset.uf,n.dataset.name)}});
      host.addEventListener('pointermove',ev=>{const n=findNode(ev.target);if(n)showMapTip(ev,n.dataset.name,n.dataset.uf);else hideMapTip()});
      host.addEventListener('pointerleave',hideMapTip);
      host.dataset.ready='true';
    }
    syncMapSelection();
  }catch(e){hosts.forEach(h=>h.innerHTML='<span class="map-loading">Malha indisponível. O vetor local não pôde ser carregado.</span>')}
}
function showMapTip(ev,name,uf){if(!mapTip){mapTip=document.createElement('div');mapTip.className='map-tooltip';document.body.appendChild(mapTip)}const l=electionStateLeaders[uf];mapTip.innerHTML=`<small>${esc(uf)}</small><strong>${esc(name)}</strong><span>${l?`${esc(l.name)} · ${npt(l.percent)}% neste snapshot`:'Clique para selecionar a UF'}</span>`;mapTip.style.left=`${Math.min(innerWidth-220,ev.clientX+14)}px`;mapTip.style.top=`${Math.min(innerHeight-100,ev.clientY+14)}px`;mapTip.classList.add('show')}
function hideMapTip(){mapTip?.classList.remove('show')}
function syncMapSelection(){$$('.state-node').forEach(g=>{const on=!!selectedUF&&g.dataset.uf===selectedUF;g.classList.toggle('selected',on);g.setAttribute('aria-pressed',String(on))});$$('.state-anchor-hit,.uf-label').forEach(x=>x.classList.toggle('selected',!!selectedUF&&x.dataset.uf===selectedUF))}
function selectState(uf,name){selectedUF=uf;try{sessionStorage.setItem('adv-selected-uf',uf)}catch{}syncMapSelection();const l=electionStateLeaders[uf];const box=$('#mapSelection');if(box)box.innerHTML=`<div class="selected-state-mark">${esc(uf)}</div><div><small>UF SELECIONADA</small><strong>${esc(name)}</strong><p>${l?`${esc(l.name)} aparece à frente no snapshot carregado, com ${npt(l.percent)}%.`:'A seleção territorial é independente da camada eleitoral. O dourado indica apenas a UF escolhida.'}</p></div>`;const hc=$('#heroStateCard');if(hc){hc.classList.add('show');hc.innerHTML=`<small>UF SELECIONADA</small><strong>${esc(name)} · ${esc(uf)}</strong><span>${l?`${esc(l.name)} · ${npt(l.percent)}%`:'Abra o painel estadual'}</span><a href="#/eleicoes">ABRIR ELEIÇÕES →</a>`}showToast(`${name} · ${uf} selecionado`) }

/* ---------- COMPONENTES ---------- */
