import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import api from './api/index.js';
const root=path.resolve(import.meta.dirname,'public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const port=Number(process.env.PORT||8091);
const server=http.createServer(async(req,res)=>{
 if(req.url.startsWith('/api/')||req.url.startsWith('/auth/'))return api(req,res);
 try{const url=new URL(req.url,'http://local'),file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep))throw new Error();const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/?preview=1`));
