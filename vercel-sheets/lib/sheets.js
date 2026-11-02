import {createHmac} from 'node:crypto';
import {HttpError} from './auth.js';
const mutations=new Set(['create','edit','status']);
export function envelope(command,user,cfg,now=Date.now()){
  // An ASCII JSON wire representation avoids Apps Script request-body charset
  // conversion changing signed bytes. JSON.parse restores the original Unicode.
  const payload=JSON.stringify({...command,contract:'hakeems.sheets.v1',spreadsheetId:cfg.spreadsheetId,actor:user.email,actorId:user.subject,role:user.role,provider:user.provider,credentialVersion:user.credentialVersion}).replace(/[\u007f-\uffff]/g,char=>'\\u'+char.charCodeAt(0).toString(16).padStart(4,'0'));
  const timestamp=String(now);
  return {timestamp,payload,signature:createHmac('sha256',cfg.scriptSecret).update(timestamp+'\n'+payload).digest('hex')};
}
export async function sheets(command,user,cfg,fetcher=fetch){
  const write=mutations.has(command.op),unknown=write?'OUTCOME_UNKNOWN':'SHEETS_UNAVAILABLE';
  if(write&&!cfg.writes)throw new HttpError(503,'Booking saves are disabled until the Google connection passes its live checks.','WRITES_DISABLED');
  let response;
  const signal=AbortSignal.timeout(45000);
  try{
    response=await fetcher(cfg.scriptUrl,{method:'POST',redirect:'manual',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(envelope(command,user,cfg)),signal});
    // ContentService redirects its response to a one-time Google-hosted URL.
    // Follow only that GET response; never forward a signed booking body to a redirect.
    if([302,303].includes(response.status)){
      const location=new URL(response.headers.get('location'));
      if(location.origin!=='https://script.googleusercontent.com'||location.pathname!=='/macros/echo'||location.username||location.password)throw new Error('Unexpected script redirect');
      response=await fetcher(location.href,{method:'GET',redirect:'error',signal});
    }
  }catch{throw new HttpError(503,write?'Google Sheets has not acknowledged the save. Check the same request reference before retrying.':'The booking sheet is temporarily unavailable. Refresh again later.',unknown);}
  if(!response.ok)throw new HttpError(503,write?'The booking outcome needs checking. Keep the same request reference.':'The Google Sheets connection is unavailable.',unknown);
  let result;try{result=await response.json();}catch{throw new HttpError(503,'The booking service returned an unreadable response.',unknown);}
  if(result.contract!=='hakeems.sheets.v1'||result.spreadsheetId!==cfg.spreadsheetId||typeof result.ok!=='boolean')throw new HttpError(503,'The booking service does not match the configured Google Sheet.',unknown);
  if(!result.ok){const status=['CONFLICT','STALE','REQUEST_REUSED'].includes(result.code)?409:result.code==='NOT_FOUND'?404:result.code==='RATE_LIMITED'?429:['CORRUPT_WORKBOOK','OUTCOME_UNKNOWN','BUSY','MAINTENANCE','WRITES_DISABLED','SETUP_REQUIRED','STAFF_LOGIN_UNAVAILABLE'].includes(result.code)?503:result.code==='UNAUTHORIZED'?403:400;throw new HttpError(status,result.message||'The booking could not be saved.',result.code);}
  return result;
}
