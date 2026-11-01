import {randomBytes,randomUUID,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {HttpError} from './auth.js';

const derive=promisify(scrypt);
const options={N:131072,r:8,p:1,maxmem:256*1024*1024};
export const STAFF_ID='shared-staff';
export const LOGIN_SERVICE={email:'staff-login-service',subject:'staff-login-service',provider:'service',role:'AUTH'};
const hashPattern=/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/;
export async function hashStaffPassword(password){
  if(typeof password!=='string'||password.length<14||password.length>128)throw new HttpError(400,'Choose a staff password of 14 to 128 characters.','INVALID');
  const salt=randomBytes(16).toString('hex');
  const key=await derive(password,salt,64,options);
  return `scrypt-v1$${salt}$${key.toString('hex')}`;
}
export async function checkStaffPassword(password,hash){
  if(typeof password!=='string'||password.length>128||typeof hash!=='string'||!hashPattern.test(hash))return false;
  const [,salt,expected]=hash.split('$');
  const actual=await derive(password,salt,64,options);
  return timingSafeEqual(actual,Buffer.from(expected,'hex'));
}
export function newStaffSession(version,cfg,now=Date.now()){
  if(typeof version!=='string'||!/^[a-f0-9-]{36}$/.test(version))throw new HttpError(503,'Shared staff access has not been configured.','STAFF_LOGIN_UNAVAILABLE');
  return {email:STAFF_ID,name:'Staff',subject:STAFF_ID,provider:'shared-staff',audience:cfg.origin,role:'STAFF',credentialVersion:version,csrf:randomBytes(24).toString('base64url'),exp:Math.floor(now/1000)+8*3600};
}
export function staffCredential(hash){return {hash,version:randomUUID()};}
