import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const [demoScript,index,core,live,dossier]=await Promise.all([
  readFile(new URL('demo/demo-api.js',root),'utf8'),
  readFile(new URL('index.html',root),'utf8'),
  readFile(new URL('assets/app-01.js',root),'utf8'),
  readFile(new URL('assets/app-09.js',root),'utf8'),
  readFile(new URL('demo/xray-dossier.json',root),'utf8').then(JSON.parse)
]);

assert.ok(index.indexOf('demo/demo-api.js')<index.indexOf('assets/app.js'),'demo API deve carregar antes do frontend');
assert.match(index,/id="demoNotice"/,'aviso global da demo precisa existir');
assert.match(core,/ADV_DEMO_API/,'api() precisa rotear chamadas para a demo no Pages');
assert.match(live,/DEMO SINTÉTICA/,'interface precisa identificar explicitamente dados sintéticos');

const document={
  head:{appendChild(){}},
  createElement(){return {textContent:''}},
  getElementById(){return {hidden:true}}
};
const context={
  window:{},
  location:{hostname:'3scud3r0.github.io',search:''},
  URL,
  URLSearchParams,
  document,
  addEventListener(){},
  fetch:async input=>{
    assert.equal(String(input),'demo/xray-dossier.json');
    return {ok:true,json:async()=>dossier};
  }
};
vm.createContext(context);
vm.runInContext(demoScript,context);

assert.equal(context.window.ADV_PUBLIC_DEMO,true);
assert.equal(typeof context.window.ADV_DEMO_API,'function');

const election=await context.window.ADV_DEMO_API('/api/elections/2026/president');
assert.equal(election.synthetic,true);
assert.equal(election.mode,'simulator');
assert.ok(election.snapshot.candidates.length>=3);
assert.ok(election.snapshot.candidates.every(x=>/Demonstrativa/.test(x.name)));

const overview=await context.window.ADV_DEMO_API('/api/congress/overview');
assert.equal(overview.synthetic,true);
assert.ok(overview.deputies.dados.every(x=>/Demonstrativa/.test(x.nome)));
assert.ok(overview.votes.dados.every(x=>/^DEMO-/.test(x.id)));

const audit=await context.window.ADV_DEMO_API('/api/audit/camara/deputy/demo-a?ano=2026');
assert.equal(audit.synthetic,true);
assert.equal(audit.signals.length,dossier.signals.length);
assert.ok(audit.signals.every(x=>x.reason&&x.limitations));

const health=await context.window.ADV_DEMO_API('/api/health');
assert.equal(health.demo,true);
assert.match(health.archive,/sintéticos/);

console.log('pages demo contract ok — GitHub Pages usa somente fixtures sintéticos');
