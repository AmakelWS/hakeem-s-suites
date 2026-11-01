import {randomUUID} from 'node:crypto';
import {HttpError,config,seal,unseal,cookies,cookie,equal,beginLogin,verifyIdentity,session,csrf,oauthClient} from '../lib/auth.js';
import {sheets} from '../lib/sheets.js';
function json(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));}
async function body(req){
  if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new HttpError(415,'Use a JSON request body.');
  if(req.body!==undefined){let parsed;try{parsed=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{throw new HttpError(400,'Invalid JSON request.');}if(Buffer.byteLength(JSON.stringify(parsed))>16000)throw new HttpError(413,'Request too large.');return parsed;}
  let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>16000)throw new HttpError(413,'Request too large.');}try{return JSON.parse(text);}catch{throw new HttpError(400,'Invalid JSON request.');}
}
export function handler({env=process.env,fetcher=fetch,clientFactory=oauthClient}={}){return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const url=new URL(req.url,'http://internal');const route=url.searchParams.get('route')||url.pathname.replace(/^\/api\/?/,'').replace(/^\//,'');
  try{
    if(route==='status'&&req.method==='GET'){try{const cfg=config(env);return json(res,200,{configured:true,writesEnabled:cfg.writes});}catch{return json(res,200,{configured:false,writesEnabled:false});}}
    const cfg=config(env);
    if(route==='auth/login'&&req.method==='GET'){const login=beginLogin(cfg);res.setHeader('Set-Cookie',cookie('hkg_oauth',seal(login.pending,cfg.secret),cfg,600));res.writeHead(302,{Location:login.url});return res.end();}
    if(route==='auth/callback'&&req.method==='GET'){
      const pending=unseal(cookies(req).hkg_oauth,cfg.secret);res.setHeader('Set-Cookie',cookie('hkg_oauth','',cfg,0));
      if(!pending||!equal(pending.state,url.searchParams.get('state'))||!url.searchParams.get('code'))throw new HttpError(401,'Sign-in expired or was cancelled. Start again.');
      const client=clientFactory(cfg);let tokens;
      try{({tokens}=await client.getToken({code:url.searchParams.get('code'),codeVerifier:pending.verifier}));}catch{throw new HttpError(401,'Google sign-in could not be completed.');}
      const user=await verifyIdentity(tokens.id_token,cfg,pending.nonce,client);res.setHeader('Set-Cookie',[cookie('hkg_oauth','',cfg,0),cookie('hkg_session',seal(user,cfg.secret),cfg,Math.floor(user.exp-Date.now()/1000))]);res.writeHead(302,{Location:cfg.origin+'/'});return res.end();
    }
    const user=session(req,cfg);
    if(route==='session'&&req.method==='GET')return json(res,200,{user:{email:user.email,name:user.name,role:user.role},csrf:user.csrf,currency:cfg.currency,timeZone:cfg.timeZone,writesEnabled:cfg.writes});
    if(req.method==='POST')csrf(req,user,cfg);
    if(route==='auth/logout'&&req.method==='POST'){res.setHeader('Set-Cookie',cookie('hkg_session','',cfg,0));return json(res,200,{ok:true});}
    if(route==='ledger'&&req.method==='GET')return json(res,200,await sheets({op:'read'},user,cfg,fetcher));
    if(route==='request'&&req.method==='GET'){const id=url.searchParams.get('id');if(!/^[a-z0-9-]{36}$/i.test(id||''))throw new HttpError(400,'Invalid request reference.');return json(res,200,await sheets({op:'request',requestId:id},user,cfg,fetcher));}
    if(route==='bookings'&&req.method==='POST'){
      const command=await body(req);if(!command||!['create','edit','status'].includes(command.op)||!/^[a-z0-9-]{36}$/i.test(command.requestId||''))throw new HttpError(400,'Provide an operation and a stable request reference.');
      return json(res,200,await sheets({op:command.op,requestId:command.requestId,bookingId:command.bookingId,version:command.version,booking:command.booking,status:command.status},user,cfg,fetcher));
    }
    throw new HttpError(404,'Page not found.');
  }catch(error){const known=error instanceof HttpError;json(res,known?error.status:500,{ok:false,code:known?error.code:'ERROR',message:known?error.message:'Request could not be completed. Please contact management.',reference:known?undefined:randomUUID()});}
};}
export default handler();
