import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,resolve} from 'node:path';
import worker from './worker/worker.mjs';

const root=resolve(new URL('.',import.meta.url).pathname);
const port=Number(process.env.PORT||8787);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://${req.headers.host||`127.0.0.1:${port}`}`);
    if(url.pathname.startsWith('/api/')){
      const body=['GET','HEAD'].includes(req.method)?undefined:await new Promise((ok,fail)=>{const a=[];req.on('data',c=>a.push(c));req.on('end',()=>ok(Buffer.concat(a)));req.on('error',fail)});
      const request=new Request(url,{method:req.method,headers:req.headers,body});
      const response=await worker.fetch(request,process.env);
      res.writeHead(response.status,Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const rel=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
    const file=resolve(join(root,rel));
    if(!file.startsWith(root))throw new Error('invalid path');
    const data=await readFile(file);
    res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-cache'});res.end(data);
  }catch(e){res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Não encontrado');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Além do Voto: http://127.0.0.1:${port}`));
