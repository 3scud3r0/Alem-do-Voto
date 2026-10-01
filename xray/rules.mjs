function finite(v){v=Number(v);return Number.isFinite(v)?v:0}
function median(xs){const n=xs.length,m=Math.floor(n/2);return n%2?xs[m]:(xs[m-1]+xs[m])/2}
function base(ruleId,version,observedValue,comparisonContext,explanation,limitations,formula){
  return {ruleId,ruleVersion:version,observedValue,comparisonContext,explanation,limitations,reproducibility:{formula}};
}
export function supplierConcentration(rows,{topN=3,threshold=.75,ruleVersion='1.2.0'}={}){
  const amounts=rows.map(r=>({id:r.id||r.recordId||r.supplierId||r.name,amount:Math.max(0,finite(r.amount)),sourceRecordId:r.sourceRecordId||null})).sort((a,b)=>b.amount-a.amount);
  const total=amounts.reduce((s,r)=>s+r.amount,0); if(!total)return null;
  const top=amounts.slice(0,topN), ratio=top.reduce((s,r)=>s+r.amount,0)/total;if(ratio<threshold)return null;
  return base(`supplier_concentration_top_${topN}`,ruleVersion,{ratio,total,top,all:amounts},{threshold,topN,recordCount:amounts.length},`Os ${topN} maiores fornecedores concentram ${(ratio*100).toFixed(1)}% do valor observado.`,'Concentração, isoladamente, não demonstra irregularidade. Pode decorrer da natureza do objeto, escala, mercado fornecedor ou período analisado.',`sum(top_${topN}) / total`);
}
export function declaredAssetVariation(previous,current,{threshold=.5,ruleVersion='1.2.0'}={}){
  previous=finite(previous);current=finite(current);if(previous<=0)return null;const ratio=(current-previous)/previous;if(Math.abs(ratio)<threshold)return null;
  return base('declared_asset_variation',ruleVersion,{previous,current,ratio},{threshold},`A variação nominal entre as declarações é de ${(ratio*100).toFixed(1)}%.`,'Declarações eleitorais são fotografias patrimoniais em datas distintas. A variação não implica enriquecimento ilícito e pode refletir compra, venda, valorização, herança, dívida ou mudança de critério declaratório.','(current - previous) / previous');
}
export function robustOutlier(value,peerValues,{absZ=3.5,ruleVersion='1.2.0'}={}){
  const xs=peerValues.map(finite).sort((a,b)=>a-b);if(xs.length<5)return null;const med=median(xs),dev=xs.map(x=>Math.abs(x-med)).sort((a,b)=>a-b),mad=median(dev);if(!mad)return null;const z=.6745*(finite(value)-med)/mad;if(Math.abs(z)<absZ)return null;
  return base('robust_peer_outlier',ruleVersion,{value:finite(value),median:med,mad,robustZ:z,peerValues:xs},{peerCount:xs.length,threshold:absZ},'O valor está distante da mediana do grupo comparável segundo desvio absoluto mediano.','Outlier estatístico não significa gasto indevido. O resultado depende da qualidade do grupo comparável, do período e da classificação correta da despesa.','0.6745 × (x − mediana) / MAD');
}
export function temporalOverlap(aStart,aEnd,bStart,bEnd){const a0=Date.parse(aStart),a1=Date.parse(aEnd||'9999-12-31'),b0=Date.parse(bStart),b1=Date.parse(bEnd||'9999-12-31');if([a0,a1,b0,b1].some(Number.isNaN))return false;return Math.max(a0,b0)<=Math.min(a1,b1)}
