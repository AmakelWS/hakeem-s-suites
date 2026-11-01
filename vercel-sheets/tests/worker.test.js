import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorker} from '../worker.js';
import {handler} from '../api/index.js';
import {config,seal} from '../lib/auth.js';

const env={APP_URL:'https://hakeems.example.invalid',GOOGLE_CLIENT_ID:'test-client.apps.googleusercontent.com',GOOGLE_CLIENT_SECRET:'test-secret',SESSION_SECRET:'a-private-session-secret-longer-than-32-characters',GOOGLE_SCRIPT_URL:'https://script.google.com/macros/s/test-deployment/exec',GOOGLE_SCRIPT_SECRET:'a-private-script-secret-longer-than-32-characters',GOOGLE_SPREADSHEET_ID:'test_spreadsheet_identifier_123456789',OWNER_EMAILS:'owner@example.invalid',STAFF_EMAILS:'staff@example.invalid',BOOKING_WRITES_ENABLED:'true',APP_CURRENCY:'XAF',PROPERTY_TIMEZONE:'Africa/Douala'};
const cfg=config(env),user={provider:'google',audience:cfg.clientId,subject:'staff-id',email:'staff@example.invalid',name:'Staff',csrf:'test-csrf',exp:Math.floor(Date.now()/1000)+600};
const sessionCookie='hkg_session='+seal(user,cfg.secret);

test('Workers adapter preserves configuration and authentication failures',async()=>{
  const worker=createWorker();
  const missing=await worker.fetch(new Request('https://hakeems.example.invalid/api/ledger'),{});
  assert.equal(missing.status,503);assert.equal((await missing.json()).code,'SETUP_REQUIRED');
  const signedOut=await worker.fetch(new Request('https://hakeems.example.invalid/api/ledger'),env);
  assert.equal(signedOut.status,401);assert.equal((await signedOut.json()).code,'SIGN_IN_REQUIRED');
});
test('Workers request stream reaches the same authenticated, signed booking API',async()=>{
  let payload;
  const worker=createWorker({apiFactory:options=>handler({...options,fetcher:async(_url,options)=>{payload=JSON.parse(JSON.parse(options.body).payload);return {ok:true,status:200,json:async()=>({contract:'hakeems.sheets.v1',spreadsheetId:cfg.spreadsheetId,ok:true,booking:{id:payload.requestId}})};}})});
  const command={op:'create',requestId:'33333333-3333-3333-3333-333333333333',actor:'forged',role:'OWNER',booking:{guestName:'Fictional Guest'}};
  const request=new Request(cfg.origin+'/api/bookings',{method:'POST',headers:{cookie:sessionCookie,origin:cfg.origin,'x-csrf-token':user.csrf,'content-type':'application/json'},body:JSON.stringify(command)});
  const response=await worker.fetch(request,env);assert.equal(response.status,200);assert.equal((await response.json()).booking.id,command.requestId);assert.equal(payload.actor,user.email);assert.equal(payload.role,'STAFF');assert.equal(response.headers.get('cache-control'),'no-store');
});
test('Workers callback preserves both OAuth-clear and new session cookies',async()=>{
  const pending={state:'expected-state',nonce:'expected-nonce',verifier:'expected-verifier',exp:Math.floor(Date.now()/1000)+600};
  const claims={iss:'https://accounts.google.com',aud:cfg.clientId,exp:Math.floor(Date.now()/1000)+600,nonce:pending.nonce,sub:user.subject,email:user.email,email_verified:true};
  const worker=createWorker({apiFactory:options=>handler({...options,clientFactory:()=>({getToken:async()=>({tokens:{id_token:'verified-by-test-client'}}),verifyIdToken:async()=>({getPayload:()=>claims})})})});
  const response=await worker.fetch(new Request(cfg.origin+'/auth/callback?code=example&state='+pending.state,{headers:{cookie:'hkg_oauth='+seal(pending,cfg.secret)}}),env);
  assert.equal(response.status,302);assert.equal(response.headers.get('location'),cfg.origin+'/');
  const cookies=response.headers.getSetCookie();assert.equal(cookies.length,2);assert.ok(cookies.some(c=>c.startsWith('hkg_oauth=;')));assert.ok(cookies.some(c=>c.startsWith('hkg_session=')));assert.ok(cookies.every(c=>c.includes('HttpOnly')&&c.includes('Secure')));
});
test('Workers serves only configured public assets with security headers',async()=>{
  let calls=0;const worker=createWorker(),assets={fetch:async()=>{calls++;return new Response('<html>Staff sign-in</html>',{headers:{'Content-Type':'text/html'}});}};
  const page=await worker.fetch(new Request(cfg.origin+'/'),{ASSETS:assets});assert.equal(page.status,200);assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(page.headers.get('x-content-type-options'),'nosniff');
  const post=await worker.fetch(new Request(cfg.origin+'/style.css',{method:'POST'}),{ASSETS:assets});assert.equal(post.status,405);assert.equal(calls,1);
});
