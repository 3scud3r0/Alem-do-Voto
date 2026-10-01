const num=v=>Number(String(v??0).replace(/\./g,'').replace(',','.'))||0;
const median=a=>{const x=[...a].sort((p,q)=>p-q),n=x.length;if(!n)return 0;return n%2?x[(n-1)/2]:(x[n/2-1]+x[n/2])/2};
const keySupplier=r=>String(r.cnpjCpfFornecedor||r.nomeFornecedor||'sem-fornecedor').trim();
const recordId=r=>String(r.idDocumento||r.codDocumento||r.numDocumento||r.urlDocumento||'registro-sem-id');
export function auditExpenses(rows=[]){
  const clean=rows.map(r=>({...r,_value:num(r.valorLiquido??r.valorDocumento??r.valorGlosa??0),_supplier:keySupplier(r),_id:recordId(r)})).filter(r=>r._value>0);
  if(!clean.length)return [];
  const signals=[];
  const total=clean.reduce((s,r)=>s+r._value,0), by=new Map();
  for(const r of clean)by.set(r._supplier,(by.get(r._supplier)||0)+r._value);
  const tops=[...by.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3), share=total?tops.reduce((s,x)=>s+x[1],0)/total:0;
  if(clean.length>=5)signals.push({rule:'supplier_concentration_top3',version:'1.3.0',observed:share,observedLabel:(share*100).toFixed(1)+'%',reason:'Participação dos três maiores fornecedores no total do conjunto retornado.',evidence:tops.map(([supplier,value])=>({supplier,value})) ,limitations:'Concentração não demonstra irregularidade e pode refletir natureza da atividade, contrato recorrente ou período curto.'});
  const groups=new Map(); for(const r of clean){const k=[r.dataDocumento||'',r._supplier,r._value.toFixed(2),r.tipoDocumento||''].join('|');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r)}
  for(const [k,g] of groups)if(g.length>1)signals.push({rule:'duplicate_document_fields',version:'1.3.0',observed:g.length,observedLabel:`${g.length} registros`,reason:'Data, fornecedor, valor e tipo de documento coincidem no conjunto retornado.',evidence:g.map(r=>({recordId:r._id,date:r.dataDocumento,supplier:r._supplier,value:r._value,url:r.urlDocumento||null})),limitations:'Campos coincidentes não provam duplicidade indevida; podem existir parcelas, reemissões ou documentos distintos com mesmos valores.'});
  const byType=new Map(); for(const r of clean){const k=String(r.tipoDespesa||'sem-categoria');if(!byType.has(k))byType.set(k,[]);byType.get(k).push(r)}
  for(const [category,g] of byType)if(g.length>=7){const vals=g.map(r=>r._value),med=median(vals),dev=vals.map(v=>Math.abs(v-med)),mad=median(dev);if(mad>0)for(const r of g){const z=.6745*(r._value-med)/mad;if(z>5)signals.push({rule:'robust_expense_outlier',version:'1.3.0',observed:z,observedLabel:`zᵣ ${z.toFixed(2)}`,reason:`Despesa distante da mediana da categoria ${category} usando desvio absoluto mediano (MAD).`,evidence:[{recordId:r._id,category,value:r._value,median:med,mad,url:r.urlDocumento||null}],limitations:'Outlier estatístico não significa gasto indevido. A qualidade do sinal depende da comparabilidade dos registros e da categoria.'})}}
  return signals;
}
