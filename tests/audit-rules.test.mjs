import assert from 'node:assert/strict';
import {auditExpenses} from '../xray/audit-rules.mjs';
const rows=[
 {idDocumento:'a1',dataDocumento:'2026-01-01',cnpjCpfFornecedor:'1',nomeFornecedor:'A',tipoDespesa:'COMBUSTÍVEL',tipoDocumento:'NF',valorLiquido:500},
 {idDocumento:'a2',dataDocumento:'2026-01-02',cnpjCpfFornecedor:'1',nomeFornecedor:'A',tipoDespesa:'COMBUSTÍVEL',tipoDocumento:'NF',valorLiquido:400},
 {idDocumento:'b1',dataDocumento:'2026-01-03',cnpjCpfFornecedor:'2',nomeFornecedor:'B',tipoDespesa:'COMBUSTÍVEL',tipoDocumento:'NF',valorLiquido:300},
 {idDocumento:'c1',dataDocumento:'2026-01-04',cnpjCpfFornecedor:'3',nomeFornecedor:'C',tipoDespesa:'COMBUSTÍVEL',tipoDocumento:'NF',valorLiquido:200},
 {idDocumento:'d1',dataDocumento:'2026-01-05',cnpjCpfFornecedor:'4',nomeFornecedor:'D',tipoDespesa:'COMBUSTÍVEL',tipoDocumento:'NF',valorLiquido:100},
 {idDocumento:'e1',dataDocumento:'2026-01-06',cnpjCpfFornecedor:'5',nomeFornecedor:'E',tipoDespesa:'COMBUSTÍVEL',tipoDocumento:'NF',valorLiquido:105},
 {idDocumento:'f1',dataDocumento:'2026-01-07',cnpjCpfFornecedor:'6',nomeFornecedor:'F',tipoDespesa:'COMBUSTÍVEL',tipoDocumento:'NF',valorLiquido:110},
 {idDocumento:'g1',dataDocumento:'2026-01-08',cnpjCpfFornecedor:'7',nomeFornecedor:'G',tipoDespesa:'COMBUSTÍVEL',tipoDocumento:'NF',valorLiquido:5000},
 {idDocumento:'dup1',dataDocumento:'2026-02-01',cnpjCpfFornecedor:'8',nomeFornecedor:'H',tipoDespesa:'ALIMENTAÇÃO',tipoDocumento:'NF',valorLiquido:123.45},
 {idDocumento:'dup2',dataDocumento:'2026-02-01',cnpjCpfFornecedor:'8',nomeFornecedor:'H',tipoDespesa:'ALIMENTAÇÃO',tipoDocumento:'NF',valorLiquido:123.45},
];
const s=auditExpenses(rows);
assert.ok(s.find(x=>x.rule==='supplier_concentration_top3'));
assert.ok(s.find(x=>x.rule==='duplicate_document_fields'));
assert.ok(s.find(x=>x.rule==='robust_expense_outlier'));
for(const x of s){assert.ok(x.reason);assert.ok(x.limitations);assert.ok(Array.isArray(x.evidence))}
console.log('audit rules ok');
