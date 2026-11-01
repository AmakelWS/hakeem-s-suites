import {Readable} from 'node:stream';
import {handler} from './api/index.js';

function secure(response){
  const headers=new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','same-origin');
  headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; form-action 'self' https://accounts.google.com");
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

// Adapt the same tested API to Workers without changing the booking store or rules.
export function createWorker({apiFactory=handler}={}){
  return {async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/auth/')){
      const req=request.body?Readable.fromWeb(request.body):Readable.from([]);
      req.url=url.href;req.method=request.method;req.headers=Object.fromEntries(request.headers);
      const headers=new Headers();let status=200,body='';
      const res={
        set statusCode(value){status=value;},get statusCode(){return status;},
        setHeader(name,value){headers.delete(name);for(const item of Array.isArray(value)?value:[value])headers.append(name,String(item));},
        writeHead(value,values={}){status=value;for(const [name,item] of Object.entries(values))this.setHeader(name,item);},
        end(value=''){body=value;}
      };
      await apiFactory({env})(req,res);
      return secure(new Response(request.method==='HEAD'?null:body,{status,headers}));
    }
    if(!['GET','HEAD'].includes(request.method))return secure(new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}}));
    if(!env.ASSETS)return secure(new Response('Website assets are not configured',{status:503}));
    return secure(await env.ASSETS.fetch(request));
  }};
}

export default createWorker();
