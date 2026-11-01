import {createHmac,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import {OAuth2Client} from 'google-auth-library';

export class HttpError extends Error {
  constructor(status,message,code='ERROR'){super(message);this.status=status;this.code=code;}
}
export function equal(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb);}
export function seal(value,secret){const payload=Buffer.from(JSON.stringify(value)).toString('base64url');return payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');}
export function unseal(value,secret,now=Date.now()){
  if(typeof value!=='string'||value.length>12000)return null;const [payload,signature,...extra]=value.split('.');
  if(extra.length||!signature||!equal(signature,createHmac('sha256',secret).update(payload).digest('base64url')))return null;
  try{const decoded=JSON.parse(Buffer.from(payload,'base64url'));return Number.isFinite(decoded.exp)&&decoded.exp>now/1000?decoded:null;}catch{return null;}
}
export function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(item=>item.trim().split(/=(.*)/s)).filter(x=>x.length>=2).map(([k,v])=>[k,v]));}
export function cookie(name,value,cfg,age){return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${cfg.origin.startsWith('https:')?'; Secure':''}`;}
export function config(env=process.env){
  const required=['APP_URL','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','SESSION_SECRET','GOOGLE_SCRIPT_URL','GOOGLE_SCRIPT_SECRET','GOOGLE_SPREADSHEET_ID','APP_CURRENCY','PROPERTY_TIMEZONE'];
  if(required.some(key=>!env[key])||env.SESSION_SECRET.length<32||env.GOOGLE_SCRIPT_SECRET.length<32)throw new HttpError(503,'Google sign-in and the booking sheet have not been configured.','SETUP_REQUIRED');
  let origin,script;
  try{origin=new URL(env.APP_URL);script=new URL(env.GOOGLE_SCRIPT_URL);new Intl.DateTimeFormat('en',{timeZone:env.PROPERTY_TIMEZONE}).format();}catch{throw new HttpError(503,'Invalid deployment configuration.','SETUP_REQUIRED');}
  const local=['localhost','127.0.0.1'].includes(origin.hostname);
  if((origin.protocol!=='https:'&&!(local&&origin.protocol==='http:'))||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password||script.origin!=='https://script.google.com'||!/^\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(script.pathname)||script.search||script.hash||script.username||script.password)throw new HttpError(503,'Use an exact website origin and a Google Apps Script deployment endpoint.','SETUP_REQUIRED');
  if(!/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/.test(env.GOOGLE_CLIENT_ID)||!/^[a-zA-Z0-9_-]{20,100}$/.test(env.GOOGLE_SPREADSHEET_ID)||! /^[A-Z]{3}$/.test(env.APP_CURRENCY))throw new HttpError(503,'Google application, spreadsheet or currency configuration is invalid.','SETUP_REQUIRED');
  const emails=s=>new Set((s||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
  const owners=emails(env.OWNER_EMAILS),staff=emails(env.STAFF_EMAILS);if(!owners.size)throw new HttpError(503,'Configure at least one owner account.','SETUP_REQUIRED');
  return {origin:origin.origin,clientId:env.GOOGLE_CLIENT_ID,clientSecret:env.GOOGLE_CLIENT_SECRET,secret:env.SESSION_SECRET,scriptUrl:script.href,scriptSecret:env.GOOGLE_SCRIPT_SECRET,spreadsheetId:env.GOOGLE_SPREADSHEET_ID,writes:env.BOOKING_WRITES_ENABLED==='true',currency:env.APP_CURRENCY,timeZone:env.PROPERTY_TIMEZONE,owners,staff};
}
export function role(email,cfg){email=String(email||'').toLowerCase();if(cfg.owners.has(email))return 'OWNER';if(cfg.staff.has(email))return 'STAFF';throw new HttpError(403,'This Google account has not been added to the staff list.','NOT_STAFF');}
export function session(req,cfg){
  const data=unseal(cookies(req).hkg_session,cfg.secret);
  const denied=()=>{throw new HttpError(401,'Sign in to the staff booking desk.','SIGN_IN_REQUIRED');};
  if(!data||typeof data.csrf!=='string'||!data.csrf||typeof data.subject!=='string'||!data.subject)return denied();
  if(data.provider==='shared-staff'){
    if(data.audience!==cfg.origin||data.subject!=='shared-staff'||data.email!=='shared-staff'||data.role!=='STAFF'||typeof data.credentialVersion!=='string'||!/^[a-f0-9-]{36}$/.test(data.credentialVersion))return denied();
    // The gateway checks this version on every data request and session check.
    return data;
  }
  if(data.provider!=='google'||data.audience!==cfg.clientId)return denied();
  if(['shared-staff','staff-login-service'].includes(data.email))return denied();
  data.role=role(data.email,cfg);return data;
}
export function csrf(req,user,cfg){if(!equal(req.headers['x-csrf-token'],user.csrf)||req.headers.origin!==cfg.origin)throw new HttpError(403,'Reload the page before submitting this change.','CSRF');}
export function oauthClient(cfg){return new OAuth2Client({clientId:cfg.clientId,clientSecret:cfg.clientSecret,redirectUri:cfg.origin+'/auth/callback',transporterOptions:{timeout:10000}});}
export function beginLogin(cfg,now=Date.now()){
  const pending={state:randomBytes(24).toString('base64url'),nonce:randomBytes(24).toString('base64url'),verifier:randomBytes(32).toString('base64url'),exp:Math.floor(now/1000)+600};
  const url=oauthClient(cfg).generateAuthUrl({scope:['openid','profile','email'],state:pending.state,nonce:pending.nonce,code_challenge:createHash('sha256').update(pending.verifier).digest('base64url'),code_challenge_method:'S256',prompt:'select_account'});
  return {pending,url};
}
export async function verifyIdentity(token,cfg,nonce,client=oauthClient(cfg),now=Date.now()){
  let claims;try{claims=(await client.verifyIdToken({idToken:token,audience:cfg.clientId})).getPayload();}catch{throw new HttpError(401,'Google sign-in could not be verified.');}
  if(!claims||!['accounts.google.com','https://accounts.google.com'].includes(claims.iss)||claims.aud!==cfg.clientId||!Number.isFinite(claims.exp)||claims.exp<=now/1000||!equal(claims.nonce,nonce)||claims.email_verified!==true||typeof claims.sub!=='string'||!claims.sub||typeof claims.email!=='string')throw new HttpError(401,'Google sign-in details are invalid or expired.');
  const email=claims.email.toLowerCase();
  return {email,name:String(claims.name||email).slice(0,120),subject:claims.sub,provider:'google',audience:cfg.clientId,role:role(email,cfg),csrf:randomBytes(24).toString('base64url'),exp:Math.min(claims.exp,Math.floor(now/1000)+3600)};
}
