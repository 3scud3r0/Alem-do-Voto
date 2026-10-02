import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../worker/worker.mjs';

const originalFetch=globalThis.fetch;
const calls=[];
let failVotes=false;
globalThis.fetch=async input=>{
  const url=String(input);calls.push(url);
  if(url.includes('/deputados?'))return Response.json({dados:[{id:1,nome:'Pessoa Real',siglaUf:'SP',siglaPartido:'ABC'}]});
  if(url.includes('/votacoes?')){if(failVotes)throw new Error('upstream timeout');return Response.json({dados:[{id:'v1',descricao:'Votação oficial',dataHoraRegistro:'2026-01-01T12:00:00'}]})}
  if(url.includes('/proposicoes?'))return Response.json({dados:[{id:2,siglaTipo:'PL',numero:1,ano:2026,ementa:'Ementa oficial'}]});
  throw new Error(`unexpected fetch ${url}`);
};
try{
  const response=await worker.fetch(new Request('http://local/api/congress/overview'),{});
  assert.equal(response.status,200);
  const payload=await response.json();
  assert.equal(payload.source,'Câmara dos Deputados · Dados Abertos');
  assert.equal(payload.deputies.dados[0].nome,'Pessoa Real');
  assert.equal(payload.votes.dados[0].id,'v1');
  assert.equal(payload.propositions.dados[0].id,2);
  assert.equal(calls.length,3);
  assert.match(response.headers.get('cache-control'),/stale-while-revalidate/);
  const bounded=await worker.fetch(new Request('http://local/api/congress/deputies?itens=9999&pagina=-2'),{});
  assert.equal(bounded.status,200);
  assert.match(calls.at(-1),/itens=100/);
  assert.match(calls.at(-1),/pagina=1/);
  failVotes=true;
  const partialResponse=await worker.fetch(new Request('http://local/api/congress/overview'),{});
  const partial=await partialResponse.json();
  assert.equal(partialResponse.status,200);
  assert.equal(partial.partial,true);
  assert.deepEqual(partial.votes.dados,[]);
  assert.equal(partial.deputies.dados[0].nome,'Pessoa Real');
} finally { globalThis.fetch=originalFetch; }

const loader=await readFile(new URL('../assets/app.js',import.meta.url),'utf8');
const live=await readFile(new URL('../assets/app-09.js',import.meta.url),'utf8');
const hydration=await readFile(new URL('../assets/app-07.js',import.meta.url),'utf8');
const publicPages=await Promise.all(['app-04.js','app-05.js','app-06.js'].map(name=>readFile(new URL(`../assets/${name}`,import.meta.url),'utf8')));
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
assert.match(loader,/app-09\.js/);
assert.match(live,/api\/congress\/overview/);
assert.match(live,/DADO REAL · SEM FALLBACK/);
assert.doesNotMatch(hydration,/renderGazettes\(DEMO\.gazettes\)/);
assert.doesNotMatch(publicPages[0],/DEMO\./);
assert.doesNotMatch(publicPages[1],/DEMO\./);
assert.doesNotMatch(publicPages[2],/DEMO\.gazettes/);
assert.doesNotMatch(index,/demo\/xray-dossier\.js/);
assert.match(live,/hydrateXray/);
console.log('live data contract ok — overview, cache and no synthetic fallback');
