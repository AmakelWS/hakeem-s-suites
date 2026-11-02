import {PROPERTY,PROPERTY_UNITS,stayPrice} from './property.js';
const $=id=>document.getElementById(id);
const preview=new URLSearchParams(location.search).has('preview')&&['localhost','127.0.0.1'].includes(location.hostname);
const state={user:null,csrf:'',currency:PROPERTY.currency,timeZone:PROPERTY.timeZone,writes:false,rooms:[],bookings:[],busy:false,saving:false,command:null,editing:null};
const sourceNames={WALK_IN:'Walk-in',DIRECT_CALL:'Direct call',AIRBNB:'Airbnb',BOOKING_COM:'Booking.com',SOCIAL_MEDIA:'Social media',OTHER:'Other'};
const transitions={PENDING:[['CONFIRMED','Confirm'],['CANCELLED','Cancel']],CONFIRMED:[['CHECKED_IN','Check in'],['CANCELLED','Cancel']],CHECKED_IN:[['CHECKED_OUT','Check out']],CHECKED_OUT:[],CANCELLED:[]};
function el(tag,text,cls){const node=document.createElement(tag);if(text!==undefined)node.textContent=String(text);if(cls)node.className=cls;return node;}
function today(){const p=new Intl.DateTimeFormat('en',{timeZone:state.timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(type=>p.find(x=>x.type===type).value).join('-');}
function addDays(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function amount(n){return n===null||n===undefined?'Unspecified':state.currency?new Intl.NumberFormat(undefined,{style:'currency',currency:state.currency,maximumFractionDigits:2}).format(n):Number(n).toFixed(2);}
function notice(text,success=false){$('notice').textContent=text;$('notice').className='notice'+(success?' success':'');$('notice').hidden=false;}
async function api(path,options={}){
 const response=await fetch(path,{credentials:'same-origin',...options,headers:{...(options.body?{'Content-Type':'application/json','X-CSRF-Token':state.csrf}:{}),...options.headers}});
 let data;try{data=await response.json();}catch{const error=new Error('The server response could not be read. Check the pending request before retrying.');error.code='OUTCOME_UNKNOWN';throw error;}
 if(!response.ok){const error=new Error(data.message||'The request failed.');error.code=data.code;throw error;}return data;
}
const pendingKey=preview?'hkg-demo-pending-request':'hkg-pending-request';
function pendingId(){return sessionStorage.getItem(pendingKey);}
function restorePending(){try{const saved=JSON.parse(sessionStorage.getItem(pendingKey+'-body')||'null');if(saved?.email===state.user.email&&saved.command?.requestId===pendingId())state.command=saved.command;}catch{/* Keep the reference visible for manual reconciliation. */}}
function showPending(){const id=pendingId();$('unresolved').hidden=!id;if(id)$('request-reference').textContent=id;$('retry-request').hidden=!state.command;}
function remember(command){state.command=command;sessionStorage.setItem(pendingKey+'-body',JSON.stringify({email:state.user.email,command}));sessionStorage.setItem(pendingKey,command.requestId);showPending();}
function clearPending(){sessionStorage.removeItem(pendingKey);sessionStorage.removeItem(pendingKey+'-body');state.command=null;$('request-result').textContent='';showPending();}
function upsert(booking){const i=state.bookings.findIndex(b=>b.id===booking.id);if(i<0)state.bookings.push(booking);else state.bookings[i]=booking;}
function render(){
 $('confirmed').textContent=state.bookings.filter(b=>b.status==='CONFIRMED').length;$('pending').textContent=state.bookings.filter(b=>b.status==='PENDING').length;$('in-house').textContent=state.bookings.filter(b=>b.status==='CHECKED_IN').length;
 const search=$('search').value.trim().toLowerCase(),status=$('status-filter').value,room=$('room-filter').value;
 const visible=state.bookings.filter(b=>(!status||b.status===status)&&(!room||b.roomId===room)&&`${b.guestName} ${b.contact}`.toLowerCase().includes(search)).sort((a,b)=>a.checkIn.localeCompare(b.checkIn));
 const body=$('booking-rows');body.replaceChildren();$('empty').hidden=visible.length>0;
 for(const b of visible){const tr=el('tr');const guest=el('td');guest.append(el('b',b.guestName),el('small',b.contact));const stay=el('td');stay.append(el('b',state.rooms.find(r=>r.id===b.roomId)?.name||b.roomId),el('small',`${b.checkIn} → ${b.checkOut}`));
 const source=el('td',sourceNames[b.source]||b.source);
 const statusCell=el('td');statusCell.append(el('span',b.status.replaceAll('_',' '),'badge '+b.status.toLowerCase()));
 const balance=b.totalDue===null?null:Math.round((b.totalDue-b.amountPaid)*100)/100;const money=el('td');money.append(el('b',amount(b.totalDue)),el('small',`Paid ${amount(b.amountPaid)}`),el('small',`Balance ${amount(balance)}`));
 const actions=el('td');if(!['CHECKED_OUT','CANCELLED'].includes(b.status)){const edit=el('button','Edit');edit.disabled=!state.writes||state.saving||!!pendingId();edit.addEventListener('click',()=>openForm(b));actions.append(edit);}
 for(const [next,label] of transitions[b.status]||[]){const action=el('button',label);action.disabled=!state.writes||state.saving||!!pendingId();action.addEventListener('click',()=>changeStatus(b,next));actions.append(action);}tr.append(guest,stay,source,statusCell,money,actions);body.append(tr);}
 $('new-booking').disabled=!state.writes||state.saving||!!pendingId();renderSchedule();
}
function renderSchedule(){
 const view=$('schedule-length').value;let start=$('schedule-start').value||today(),days=Number(view);
 if(view==='month'){start=start.slice(0,7)+'-01';days=new Date(Number(start.slice(0,4)),Number(start.slice(5,7)),0).getDate();}
 const table=$('schedule-table');table.replaceChildren();const thead=el('thead'),header=el('tr');header.append(el('th','Unit'));for(let d=0;d<days;d++)header.append(el('th',addDays(start,d).slice(5)));thead.append(header);table.append(thead);
 const body=el('tbody');for(const room of state.rooms){const tr=el('tr');const unitHeading=el('th',room.name);unitHeading.append(el('small',room.type||'Unit'));tr.append(unitHeading);for(let d=0;d<days;d++){const date=addDays(start,d),td=el('td');for(const b of state.bookings.filter(b=>b.roomId===room.id&&b.status!=='CANCELLED'&&b.checkIn<=date&&b.checkOut>date)){const stay=el('div',b.guestName,'stay '+(b.status==='PENDING'?'pending':''));stay.append(el('small',b.status.replaceAll('_',' ')));td.append(stay);}tr.append(td);}body.append(tr);}table.append(body);
}
function setRooms(){const selected=$('room-filter').value;$('room-filter').replaceChildren(new Option('All units',''));$('form-room').replaceChildren();for(const r of state.rooms){$('room-filter').append(new Option(r.name,r.id));$('form-room').append(new Option(`${r.name} · ${r.type||'Unit'}${r.nightlyRate!=null?' · '+amount(r.nightlyRate)+'/night':''}${r.sample?' (sample)':''}`,r.id));}$('room-filter').value=selected;}
async function refresh(){if(state.busy)return;state.busy=true;$('refresh').disabled=true;try{if(!preview){const result=await api('/api/ledger');state.rooms=result.rooms;state.bookings=result.bookings;setRooms();$('connection').textContent='Google Sheets snapshot updated '+new Date(result.syncedAt).toLocaleString()+'. Refresh to see other staff changes.';}render();if(state.rooms.some(r=>r.sample))notice(preview?'Fictional sample rooms for local testing.':'Sample rooms remain in Google Sheets. Management must configure actual unit inventory before live bookings.');}catch(error){notice(error.message);$('connection').textContent='Google Sheets refresh failed. Displayed records may be out of date.';}finally{state.busy=false;$('refresh').disabled=false;}}
function openForm(booking=null){if(pendingId()){notice('Check the unacknowledged request before starting another booking.');$('unresolved').scrollIntoView({behavior:'smooth'});return;}
 state.editing=booking;$('booking-form').reset();$('form-error').hidden=true;$('form-title').textContent=booking?'Amend this reservation.':'Record a stay.';
 const form=$('booking-form');for(const name of ['guestName','contact','roomId','checkIn','checkOut','status','source','totalDue','amountPaid','notes','version'])if(booking&&form.elements[name])form.elements[name].value=booking[name]??'';
 form.elements.bookingId.value=booking?.id||'';form.elements.status.disabled=!!booking;if(!booking){form.elements.checkIn.value=today();form.elements.checkOut.value=addDays(today(),1);form.elements.amountPaid.value='0';}document.querySelectorAll('.currency').forEach(n=>n.textContent=state.currency?`(${state.currency})`:'');updatePrice();$('booking-dialog').showModal();}
function updatePrice(){const form=$('booking-form'),room=state.rooms.find(r=>r.id===form.elements.roomId.value),price=stayPrice(room,form.elements.checkIn.value,form.elements.checkOut.value,state.editing);form.elements.totalDue.readOnly=price.nightlyRate!==null;if(price.nightlyRate!==null)form.elements.totalDue.value=price.total===null?'':String(price.total);$('price-summary').textContent=price.nightlyRate===null?'No standard rate is configured for this unit.':`${amount(price.nightlyRate)} per night${price.nights?' × '+price.nights+' night'+(price.nights===1?'':'s')+' = '+amount(price.total):'. Choose valid stay dates.'}`;}
function previewApply(command){
 const current=state.bookings.find(b=>b.id===(command.op==='create'?command.requestId:command.bookingId));
 if(command.op==='create'&&current)return {booking:current};
 if(command.op!=='create'&&(!current||command.version!==current.version))throw new Error('Refresh and review the latest record.');
 let next;
 if(command.op==='status'){
  if(!(transitions[current.status]||[]).some(([status])=>status===command.status))throw new Error('That status transition is not allowed.');
  next={...current,status:command.status,version:current.version+1};
 }else{
  const input=command.booking,price=stayPrice(state.rooms.find(r=>r.id===input.roomId),input.checkIn,input.checkOut,current),due=price.nightlyRate===null?(input.totalDue===''||input.totalDue===null?null:Number(input.totalDue)):price.total,paid=Number(input.amountPaid||0);
  if(due!==null&&paid>due)throw new Error('Paid cannot exceed total due.');if(input.checkOut<=input.checkIn)throw new Error('Checkout must be after check-in.');
  next={...current,...input,id:current?.id||command.requestId,version:(current?.version||0)+1,status:command.op==='create'?input.status:current.status,totalDue:due,amountPaid:paid,nightlyRate:price.nightlyRate};
 }
 if(['CONFIRMED','CHECKED_IN','CHECKED_OUT'].includes(next.status)&&state.bookings.some(x=>x.id!==next.id&&x.roomId===next.roomId&&['CONFIRMED','CHECKED_IN','CHECKED_OUT'].includes(x.status)&&x.checkIn<next.checkOut&&x.checkOut>next.checkIn))throw new Error('Demo conflict: the unit already has a confirmed stay.');
 upsert(next);return {booking:next};
}
async function submit(command){if(state.saving)return;state.saving=true;$('save-booking').disabled=true;$('retry-request').disabled=true;$('check-request').disabled=true;try{remember(command);render();
 const result=preview?previewApply(command):await api('/api/bookings',{method:'POST',body:JSON.stringify(command)});upsert(result.booking);clearPending();$('booking-dialog').close();render();notice(`${preview?'Demo only: ':''}Reservation saved as ${result.booking.status.replaceAll('_',' ')}.${result.booking.status==='PENDING'?' The unit is not held.':''}`,true);
 }catch(error){if(preview&&!error.code)error.code='INVALID';const finalRejection=['INVALID','CONFLICT','STALE','PRICING_CHANGED','NOT_FOUND','REQUEST_RETIRED'].includes(error.code);if(finalRejection)clearPending();$('form-error').textContent=error.message;$('form-error').hidden=false;notice(error.message);showPending();}finally{state.saving=false;$('save-booking').disabled=false;$('retry-request').disabled=false;$('check-request').disabled=false;render();}}
async function changeStatus(booking,status){if(pendingId()){notice('Check the pending request first.');return;}if(status==='CANCELLED'&&!confirm(`Cancel ${booking.guestName}'s reservation?`))return;await submit({op:'status',requestId:crypto.randomUUID(),bookingId:booking.id,version:booking.version,status});}
$('booking-form').addEventListener('submit',event=>{event.preventDefault();if(pendingId()){notice('Check or retry the existing request before submitting another one.');return;}const raw=Object.fromEntries(new FormData(event.target));const booking=Object.fromEntries(['roomId','guestName','contact','checkIn','checkOut','source','totalDue','amountPaid','notes'].map(key=>[key,raw[key]]));booking.status=state.editing?.status||raw.status;submit({op:state.editing?'edit':'create',requestId:crypto.randomUUID(),bookingId:state.editing?.id,version:state.editing?.version,booking});});
$('new-booking').addEventListener('click',()=>openForm());$('close-dialog').addEventListener('click',()=>$('booking-dialog').close());$('refresh').addEventListener('click',refresh);for(const id of ['search','status-filter','room-filter'])$(id).addEventListener('input',render);for(const id of ['schedule-start','schedule-length'])$(id).addEventListener('change',renderSchedule);for(const name of ['roomId','checkIn','checkOut'])$('booking-form').elements[name].addEventListener('change',updatePrice);
$('check-request').addEventListener('click',async()=>{try{const result=preview?{found:false}:await api('/api/request?id='+encodeURIComponent(pendingId()));if(result.found){upsert(result.booking);clearPending();render();notice('Google Sheets contains the request. The current booking record is shown.',true);}else $('request-result').textContent='Not found yet. An earlier request may still be running. Retry the same request if available, or ask management to reconcile this reference before starting another booking.';}catch(error){$('request-result').textContent=error.message;}});
$('retry-request').addEventListener('click',()=>state.command&&submit(state.command));
$('logout').addEventListener('click',async()=>{try{await api('/auth/logout',{method:'POST',body:'{}'});location.href='/';}catch(error){notice(error.message);}});
async function start(){
 if(preview){$('preview-banner').hidden=false;state.user={name:'Demo staff',email:'Fictional preview'};state.writes=true;state.rooms=PROPERTY_UNITS.map(unit=>({...unit}));const day=today();state.bookings=[{id:'demo-1',version:1,roomId:'2A',guestName:'Sample Guest One',contact:'sample@example.invalid',checkIn:day,checkOut:addDays(day,2),status:'CONFIRMED',source:'DIRECT_CALL',totalDue:160000,amountPaid:80000,nightlyRate:80000,notes:''},{id:'demo-2',version:1,roomId:'2C',guestName:'Sample Guest Two',contact:'sample2@example.invalid',checkIn:addDays(day,1),checkOut:addDays(day,3),status:'PENDING',source:'WALK_IN',totalDue:100000,amountPaid:0,nightlyRate:50000,notes:''}];$('connection').textContent='Local design preview. Google Sheets and Google sign-in are not connected.';setRooms();}
 else{try{const result=await api('/api/session');Object.assign(state,{user:result.user,csrf:result.csrf,currency:result.currency,timeZone:result.timeZone,writes:result.writesEnabled});}catch(error){$('login').hidden=false;$('connection').textContent=error.code==='SETUP_REQUIRED'?'Google Sheets setup is required.':'Staff sign-in required.';if(error.code==='SETUP_REQUIRED'){$('setup-message').textContent='The site is ready for connection setup. Management must configure Google sign-in and the booking script before bookings can be saved.';$('google-login').hidden=true;$('staff-login-form').hidden=true;}return;}}
 $('workspace').hidden=false;
 if(!preview&&state.user.role==='OWNER'){$('staff-access').hidden=false;loadStaffAccess();}
$('identity').textContent=state.user.name;$('logout').hidden=preview;$('schedule-start').value=today();restorePending();showPending();if(!state.writes)notice('Google Sheets writes are disabled pending deployment verification.');await refresh();
}
let loginCsrf='';
async function loginChallenge(){const result=await api('/auth/staff-challenge');loginCsrf=result.csrf;}
$('staff-login-form').addEventListener('submit',async event=>{
 event.preventDefault();const form=event.target,button=$('staff-sign-in');button.disabled=true;$('login-error').hidden=true;
 try{if(!loginCsrf)await loginChallenge();await api('/auth/staff',{method:'POST',headers:{'X-CSRF-Token':loginCsrf},body:JSON.stringify({username:form.elements.username.value,password:form.elements.password.value})});form.reset();location.assign('/');}
 catch(error){$('login-error').textContent=error.message;$('login-error').hidden=false;if(error.code==='CSRF')loginCsrf='';}
 finally{form.elements.password.value='';button.disabled=false;}
});
async function loadStaffAccess(){try{const result=await api('/api/staff-access');$('staff-access-status').textContent=result.enabled?'Shared staff login is enabled.':'Shared staff login is disabled. Set a password to enable it.';$('disable-staff-access').disabled=!result.enabled;}catch(error){$('staff-access-status').textContent=error.message;}}
async function changeStaffAccess(enabled,password){
 $('save-staff-access').disabled=true;$('disable-staff-access').disabled=true;$('staff-access-result').textContent='Saving staff access…';
 try{await api('/api/staff-access',{method:'POST',body:JSON.stringify({enabled,...(enabled?{password}:{})})});$('staff-access-form').reset();$('staff-access-result').textContent=enabled?'Password saved. Staff can now sign in with username staff and the password you chose.':'Staff login disabled. Existing staff sessions no longer have access.';await loadStaffAccess();}
 catch(error){$('staff-access-result').textContent=error.message+' Reload staff access to check the current setting before retrying.';await loadStaffAccess();}
 finally{$('staff-access-form').elements.password.value='';$('staff-access-form').elements.confirmation.value='';$('save-staff-access').disabled=false;}
}
$('staff-access-form').addEventListener('submit',event=>{event.preventDefault();const form=event.target;if(form.elements.password.value!==form.elements.confirmation.value){$('staff-access-result').textContent='The passwords do not match.';return;}changeStaffAccess(true,form.elements.password.value);});
$('disable-staff-access').addEventListener('click',()=>{if(confirm('Disable shared staff access and sign out all staff sessions?'))changeStaffAccess(false);});
start();
