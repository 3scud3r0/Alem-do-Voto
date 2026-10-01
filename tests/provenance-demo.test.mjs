import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dossier=JSON.parse(await readFile(resolve(root,'demo/xray-dossier.json'),'utf8'));
const docs=new Map(dossier.documents.map(d=>[d.id,d]));
const recordIndex=new Map();
for(const doc of dossier.documents){
  const buf=await readFile(resolve(root,doc.preserved_path));
  const sha=createHash('sha256').update(buf).digest('hex');
  assert.equal(sha,doc.sha256,`${doc.id}: SHA diverge`);
  const j=JSON.parse(buf);
  for(const r of j.records||[]) if(r.record_id) recordIndex.set(r.record_id,doc.id);
  if(j.record_id) recordIndex.set(j.record_id,doc.id);
}
for(const sig of dossier.signals){
  assert.ok(sig.formula,`${sig.id}: fórmula ausente`);
  assert.ok(sig.document_ids?.length,`${sig.id}: documento ausente`);
  for(const id of sig.document_ids) assert.ok(docs.has(id),`${sig.id}: doc inexistente ${id}`);
  for(const input of sig.inputs||[]){
    assert.ok(input.doc,`${sig.id}: input sem doc`);
    assert.ok(docs.has(input.doc),`${sig.id}: input doc inválido`);
    if(/^[A-Z].*-/.test(input.record) && !input.record.includes('registros') && !input.record.includes('pares') && !input.record.includes('calculado')){
      assert.equal(recordIndex.get(input.record),input.doc,`${sig.id}: registro ${input.record} não pertence ao doc ${input.doc}`);
    }
  }
}
console.log(`provenance demo ok: ${dossier.signals.length} sinais, ${dossier.documents.length} documentos`);
