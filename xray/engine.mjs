/** Contrato de publicação do Raio-X: nenhum número sem proveniência. */
export function validateDocument(doc){
  const missing=['id','sourceId','sourceUrl','capturedAt','sha256'].filter(k=>!doc?.[k]);
  return {ok:missing.length===0,missing};
}
export function validateEvidenceItem(item,documentsById){
  const missing=['sourceRecordId','documentId','role'].filter(k=>!item?.[k]);
  const doc=documentsById.get(item?.documentId);
  const docCheck=validateDocument(doc);
  if(!doc)missing.push('document');
  else if(!docCheck.ok)missing.push(...docCheck.missing.map(x=>'document.'+x));
  return {ok:missing.length===0,missing};
}
export function publishableSignal(signal,documents,evidenceItems){
  const docs=new Map(documents.map(d=>[d.id,d]));
  const items=evidenceItems.filter(e=>e.signalId===signal.id);
  const errors=[];
  if(!signal?.id)errors.push('signal.id');
  if(!signal?.ruleId)errors.push('signal.ruleId');
  if(!signal?.ruleVersion)errors.push('signal.ruleVersion');
  if(!signal?.reproducibility?.formula)errors.push('signal.reproducibility.formula');
  if(!items.length)errors.push('evidenceItems');
  for(const e of items){const v=validateEvidenceItem(e,docs);if(!v.ok)errors.push(...v.missing.map(x=>`${e.sourceRecordId||'item'}:${x}`));}
  return {ok:errors.length===0,errors,evidenceCount:items.length,documentCount:new Set(items.map(i=>i.documentId)).size};
}
export function assertPublishable(signal,documents,evidenceItems){const r=publishableSignal(signal,documents,evidenceItems);if(!r.ok)throw new Error(`xray_provenance_incomplete: ${r.errors.join(', ')}`);return r;}
