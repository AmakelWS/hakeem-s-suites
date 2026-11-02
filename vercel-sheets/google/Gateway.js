/* Apps Script entry points. Only this script project may write booking records. */
function reply_(result,spreadsheetId){
  return ContentService.createTextOutput(JSON.stringify({...result,spreadsheetId})).setMimeType(ContentService.MimeType.JSON);
}
function failure_(code,message){return {contract:'hakeems.sheets.v1',ok:false,code,message};}
function secureEqual_(a,b){
  if(typeof a!=='string'||typeof b!=='string')return false;
  let difference=a.length^b.length;for(let i=0;i<b.length;i++)difference|=(a.charCodeAt(i)||0)^b.charCodeAt(i);return difference===0;
}
function sheetSettings_(){
  const properties=PropertiesService.getScriptProperties();
  const spreadsheetId=properties.getProperty('SPREADSHEET_ID'),secret=properties.getProperty('GATEWAY_SECRET');
  if(!/^[a-zA-Z0-9_-]{20,100}$/.test(spreadsheetId||'')||!secret||secret.length<32)throw new Error('Configure script properties first.');
  const list=key=>String(properties.getProperty(key)||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  return {properties,spreadsheetId,secret,owners:list('OWNER_EMAILS'),staff:list('STAFF_EMAILS'),writes:properties.getProperty('WRITES_ENABLED')==='true'};
}
function doGet(){return reply_(failure_('UNAUTHORIZED','Use the authenticated staff website.'),'');}
function sharedCredential_(settings){
  const raw=settings.properties.getProperty('SHARED_STAFF_CREDENTIAL');
  if(!raw)return null;
  const value=JSON.parse(raw);
  if(!value||!/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(value.hash||'')||!/^[a-f0-9-]{36}$/.test(value.version||''))throw new Error('Invalid staff credential configuration.');
  return value;
}
function staffAccess_(settings,command,credential){
  const answer=extra=>({contract:'hakeems.sheets.v1',ok:true,...extra});
  if(command.op==='staffAuth'){
    if(!credential)return failure_('STAFF_LOGIN_UNAVAILABLE','The owner has not enabled the shared staff login yet.');
    const now=Date.now(),raw=settings.properties.getProperty('SHARED_STAFF_ATTEMPTS');
    let attempts=raw?JSON.parse(raw):{start:now,count:0};
    if(!Number.isFinite(attempts.start)||!Number.isInteger(attempts.count)||attempts.count<0)throw new Error('Invalid login counter.');
    if(now-attempts.start>=600000)attempts={start:now,count:0};
    if(attempts.count>=30)return failure_('RATE_LIMITED','Too many staff sign-in attempts. Wait up to 10 minutes and try again.');
    attempts.count++;
    settings.properties.setProperty('SHARED_STAFF_ATTEMPTS',JSON.stringify(attempts));
    // Only the signed website server can call this operation; never send its result to a browser.
    return answer({hash:credential.hash,version:credential.version});
  }
  if(command.op==='staffSettings')return answer({enabled:!!credential});
  if(command.op==='staffSession')return answer({enabled:true});
  if(typeof command.enabled!=='boolean')return failure_('INVALID','Choose whether to enable staff access.');
  if(command.enabled){
    const next=command.credential;
    if(!next||!/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(next.hash||'')||!/^[a-f0-9-]{36}$/.test(next.version||''))return failure_('INVALID','Invalid staff password configuration.');
    settings.properties.setProperty('SHARED_STAFF_CREDENTIAL',JSON.stringify({hash:next.hash,version:next.version}));
  }else settings.properties.deleteProperty('SHARED_STAFF_CREDENTIAL');
  settings.properties.deleteProperty('SHARED_STAFF_ATTEMPTS');
  return answer({enabled:command.enabled});
}
function doPost(event){
  let settings,lock,held=false;
  try{
    settings=sheetSettings_();
    const raw=event&&event.postData&&event.postData.contents;
    if(typeof raw!=='string'||raw.length>40000)return reply_(failure_('UNAUTHORIZED','Invalid booking request.'),settings.spreadsheetId);
    const signed=JSON.parse(raw);
    if(typeof signed.timestamp!=='string'||!/^\d{13}$/.test(signed.timestamp)||Math.abs(Date.now()-Number(signed.timestamp))>300000||typeof signed.payload!=='string'||signed.payload.length>20000||typeof signed.signature!=='string'||!/^[a-f0-9]{64}$/.test(signed.signature))return reply_(failure_('UNAUTHORIZED','Invalid or expired booking request.'),settings.spreadsheetId);
    const signature=Utilities.computeHmacSha256Signature(signed.timestamp+'\n'+signed.payload,settings.secret,Utilities.Charset.UTF_8).map(n=>(n&255).toString(16).padStart(2,'0')).join('');
    if(!secureEqual_(signed.signature,signature))return reply_(failure_('UNAUTHORIZED','Invalid booking signature.'),settings.spreadsheetId);
    const command=JSON.parse(signed.payload);
    if(command.contract!=='hakeems.sheets.v1'||command.spreadsheetId!==settings.spreadsheetId||typeof command.actor!=='string'||!command.actor||command.actor!==command.actor.toLowerCase()||typeof command.actorId!=='string'||!command.actorId)return reply_(failure_('UNAUTHORIZED','Invalid staff identity or booking sheet.'),settings.spreadsheetId);
    const authOps=['staffAuth','staffSettings','staffSession','staffConfigure'];
    const shared=command.actor==='shared-staff',service=command.actor==='staff-login-service';
    const role=service&&command.actorId==='staff-login-service'&&command.provider==='service'&&command.op==='staffAuth'?'AUTH':shared&&command.actorId==='shared-staff'&&command.provider==='shared-staff'?'STAFF':!shared&&!service&&settings.owners.includes(command.actor)?'OWNER':!shared&&!service&&settings.staff.includes(command.actor)?'STAFF':null;
    if(!role||role!==command.role)return reply_(failure_('UNAUTHORIZED','This staff account is not allowed to use the booking sheet.'),settings.spreadsheetId);
    if(!['read','request','create','edit','status',...authOps].includes(command.op))return reply_(failure_('INVALID','Unsupported booking operation.'),settings.spreadsheetId);
    if((command.op==='staffAuth'&&role!=='AUTH')||(['staffSettings','staffConfigure'].includes(command.op)&&role!=='OWNER')||(command.op==='staffSession'&&!shared))return reply_(failure_('UNAUTHORIZED','This account cannot manage staff access.'),settings.spreadsheetId);
    if(['create','edit','status'].includes(command.op)&&!settings.writes)return reply_(failure_('WRITES_DISABLED','Booking saves are disabled by management.'),settings.spreadsheetId);
    lock=LockService.getScriptLock();held=lock.tryLock(20000);
    if(!held)return reply_(failure_('BUSY','The booking desk is busy. Retry the same request reference.'),settings.spreadsheetId);
    const credential=shared||authOps.includes(command.op)?sharedCredential_(settings):null;
    if(shared&&(!credential||!secureEqual_(command.credentialVersion,credential.version)))return reply_(failure_('UNAUTHORIZED','Staff access changed. Sign in again or ask the owner for access.'),settings.spreadsheetId);
    if(authOps.includes(command.op))return reply_(staffAccess_(settings,command,credential),settings.spreadsheetId);
    // A killed execution or ambiguous write must stop later booking decisions.
    // Management reconciles the marked request before manually clearing this flag.
    if(settings.properties.getProperty('UNRESOLVED_WRITE'))return reply_(failure_('OUTCOME_UNKNOWN','A previous save needs management reconciliation. Keep your request reference; new saves are paused.'),settings.spreadsheetId);
    if(command.op==='create'&&typeof command.requestId==='string'&&settings.properties.getProperty('RETIRED_BOOKING_'+command.requestId))return reply_(failure_('REQUEST_RETIRED','This booking was removed. Reload the page and start a new reservation.'),settings.spreadsheetId);
    const workbook=googleWorkbook_(settings,command);
    const result=JSON.parse(runCommand_(workbook,signed.payload));
    return reply_(result,settings.spreadsheetId);
  }catch(error){
    return reply_(failure_('OUTCOME_UNKNOWN','The booking request could not be acknowledged. Keep the original request reference and contact management.'),settings?settings.spreadsheetId:'');
  }finally{if(held)lock.releaseLock();}
}
function readRows_(spreadsheetId,name,width){
  const last=width===7?'G':width===17?'Q':width===20?'T':null;if(!last)throw new Error('Unsupported table width.');
  const result=Sheets.Spreadsheets.Values.get(spreadsheetId,"'"+name+"'!A:"+last,{valueRenderOption:'UNFORMATTED_VALUE',dateTimeRenderOption:'SERIAL_NUMBER'});
  const rows=result.values||[];
  if(rows.length>10001)throw new Error('Booking sheet exceeds supported size.');
  return rows.map(row=>Array.from({length:width},(_,i)=>row[i]===undefined?'':row[i]));
}
function googleWorkbook_(settings,command){
  const rooms=readRows_(settings.spreadsheetId,'Rooms',7),bookings=readRows_(settings.spreadsheetId,'Bookings',17);
  const table=(name,width,rows)=>({
    getHeaderRowRange:()=>({getValues:()=>[rows[0]||[]]}),
    getRowCount:()=>Math.max(0,rows.length-1),
    getRangeBetweenHeaderAndTotal:()=>({getValues:()=>rows.slice(1),getRow:index=>({setValues:values=>writeRow_(settings,command,name,width,index+2,values[0])})}),
    addRow:(_index,row)=>writeRow_(settings,command,name,width,rows.length+1,row)
  });
  const roomTable=table('Rooms',7,rooms),bookingTable=table('Bookings',17,bookings);
  return {getTable:name=>name==='OnlineRooms'?roomTable:name==='OnlineBookings'?bookingTable:null};
}
function writeRow_(settings,command,name,width,rowNumber,row){
  if(name!=='Bookings'||width!==17||row.length!==17||rowNumber<2||rowNumber>10001)throw new Error('Invalid booking write.');
  const range="'Bookings'!A"+rowNumber+':Q'+rowNumber;
  settings.properties.setProperty('UNRESOLVED_WRITE',JSON.stringify({requestId:command.requestId,bookingId:command.bookingId||command.requestId,range,startedAt:new Date().toISOString()}));
  // RAW preserves +phone numbers, leading apostrophes and =formula-like notes literally.
  Sheets.Spreadsheets.Values.update({values:[row]},settings.spreadsheetId,range,{valueInputOption:'RAW'});
  const readback=Sheets.Spreadsheets.Values.get(settings.spreadsheetId,range,{valueRenderOption:'UNFORMATTED_VALUE'}).values||[];
  const actual=readback[0]||[];
  if(JSON.stringify(Array.from({length:17},(_,i)=>actual[i]===undefined?'':actual[i]))!==JSON.stringify(row))throw new Error('Booking write could not be verified.');
  settings.properties.deleteProperty('UNRESOLVED_WRITE');
}
function initializeBookings(){
  const settings=sheetSettings_(),lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    if(settings.writes||settings.properties.getProperty('UNRESOLVED_WRITE'))throw new Error('Disable writes and reconcile outstanding requests before setup.');
    const metadata=Sheets.Spreadsheets.get(settings.spreadsheetId,{fields:'sheets(properties(sheetId,title))'});
    if(metadata.sheets.some(sheet=>['Rooms','Bookings'].includes(sheet.properties.title)))throw new Error('Rooms or Bookings already exists. Setup will not overwrite them.');
    const ids=new Set(metadata.sheets.map(sheet=>sheet.properties.sheetId));let roomId=100,bookingId=101;while(ids.has(roomId))roomId++;while(ids.has(bookingId)||bookingId===roomId)bookingId++;
    const units=['1A','2A','2B','2C','2D','3A','3B','3C','3D','4A','4B','4C','4D','5A','5D'];
    const rows=[ROOM_HEADERS,...units.map(id=>[id,id,id.endsWith('C')?'Studio':'Apartment','',true,false,id.endsWith('C')?50000:80000])];
    const cells=records=>records.map(record=>({values:record.map(value=>({userEnteredValue:typeof value==='number'?{numberValue:value}:typeof value==='boolean'?{boolValue:value}:{stringValue:value}}))}));
    Sheets.Spreadsheets.batchUpdate({requests:[
      {addSheet:{properties:{sheetId:roomId,title:'Rooms',gridProperties:{rowCount:100,columnCount:7,frozenRowCount:1}}}},
      {addSheet:{properties:{sheetId:bookingId,title:'Bookings',gridProperties:{rowCount:10001,columnCount:17,frozenRowCount:1}}}},
      {updateCells:{start:{sheetId:roomId,rowIndex:0,columnIndex:0},rows:cells(rows),fields:'userEnteredValue'}},
      {updateCells:{start:{sheetId:bookingId,rowIndex:0,columnIndex:0},rows:cells([BOOKING_HEADERS]),fields:'userEnteredValue'}},
      {updateSpreadsheetProperties:{properties:{timeZone:'Africa/Douala'},fields:'timeZone'}}
    ]},settings.spreadsheetId);
    return 'Prepared 15 units and an empty booking ledger. Original sheets preserved; writes remain disabled.';
  }finally{lock.releaseLock();}
}

// Owner-editor utilities for the explicitly requested ledger cleanup.
// These are NOT exposed by the public HTTP operation allowlist.
function beginBookingCleanup(){
  const settings=sheetSettings_(),lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    if(settings.properties.getProperty('UNRESOLVED_WRITE'))throw new Error('Reconcile the outstanding write before cleanup.');
    if(settings.properties.getProperty('BOOKING_CLEANUP_PREVIOUS_WRITES')===null)settings.properties.setProperty('BOOKING_CLEANUP_PREVIOUS_WRITES',settings.writes?'true':'false');
    settings.properties.setProperty('WRITES_ENABLED','false');
    console.log('Booking saves paused for the owner-requested cleanup. Sign-in remains available.');
  }finally{lock.releaseLock();}
}
function clearBookingsAndSimplifyColumns(){
  const settings=sheetSettings_(),lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    if(settings.writes||settings.properties.getProperty('BOOKING_CLEANUP_PREVIOUS_WRITES')===null||settings.properties.getProperty('UNRESOLVED_WRITE'))throw new Error('Pause booking saves and reconcile outstanding requests before cleanup.');
    const metadata=Sheets.Spreadsheets.get(settings.spreadsheetId,{fields:'sheets(properties(sheetId,title,gridProperties))'});
    const sheet=metadata.sheets.find(item=>item.properties.title==='Bookings');
    if(!sheet)throw new Error('Bookings sheet not found.');
    const properties=sheet.properties,width=properties.gridProperties.columnCount;
    if(![17,20].includes(width))throw new Error('Unexpected booking columns. Review the sheet before cleanup.');
    const rows=readRows_(settings.spreadsheetId,'Bookings',width);
    const legacy=['id','version','roomId','guestName','contact','checkIn','checkOut','status','source','reference','totalDue','amountPaid','notes','createdBy','updatedBy','updatedAt','initialFingerprint','lastRequestId','lastFingerprint','nightlyRate'];
    if(JSON.stringify(rows[0])!==JSON.stringify(width===20?legacy:BOOKING_HEADERS))throw new Error('Unexpected booking headers. Nothing was cleared.');
    const records=rows.slice(1).filter(row=>row.some(value=>value!==''));
    if(records.some(row=>!/^[a-z0-9-]{36}$/i.test(String(row[0]))))throw new Error('Unexpected booking ID. Nothing was cleared.');
    // Retire deleted IDs so delayed browser retries cannot recreate cleared stays.
    for(const row of records)settings.properties.setProperty('RETIRED_BOOKING_'+row[0],'true');
    settings.properties.setProperty('UNRESOLVED_WRITE',JSON.stringify({operation:'owner-booking-cleanup',startedAt:new Date().toISOString()}));
    const requests=[{updateCells:{range:{sheetId:properties.sheetId,startRowIndex:0,endRowIndex:properties.gridProperties.rowCount,startColumnIndex:0,endColumnIndex:width},rows:[{values:BOOKING_HEADERS.map(value=>({userEnteredValue:{stringValue:value}}))}],fields:'userEnteredValue'}}];
    if(width>17)requests.push({deleteDimension:{range:{sheetId:properties.sheetId,dimension:'COLUMNS',startIndex:17,endIndex:width}}});
    Sheets.Spreadsheets.batchUpdate({requests},settings.spreadsheetId);
    const verified=readRows_(settings.spreadsheetId,'Bookings',17);
    if(JSON.stringify(verified[0])!==JSON.stringify(BOOKING_HEADERS)||verified.slice(1).some(row=>row.some(value=>value!=='')))throw new Error('Cleanup needs reconciliation before re-enabling saves.');
    settings.properties.deleteProperty('UNRESOLVED_WRITE');
    console.log('Cleared '+records.length+' bookings. Bookings now has 17 columns, without reference or fingerprints. Rooms and other sheets preserved. Saves remain paused.');
  }finally{lock.releaseLock();}
}
function finishBookingCleanup(){
  const settings=sheetSettings_(),lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const previous=settings.properties.getProperty('BOOKING_CLEANUP_PREVIOUS_WRITES');
    if(previous===null||settings.properties.getProperty('UNRESOLVED_WRITE'))throw new Error('Cleanup must be verified before resuming saves.');
    const rows=readRows_(settings.spreadsheetId,'Bookings',17);
    if(JSON.stringify(rows[0])!==JSON.stringify(BOOKING_HEADERS)||rows.slice(1).some(row=>row.some(value=>value!=='')))throw new Error('Expected a verified empty booking ledger.');
    verifyEmptyBookingLedger_(settings);
    settings.properties.setProperty('WRITES_ENABLED',previous);
    settings.properties.deleteProperty('BOOKING_CLEANUP_PREVIOUS_WRITES');
    console.log('Owner-requested cleanup complete. Booking saves restored to '+previous+'.');
  }finally{lock.releaseLock();}
}
function verifyEmptyBookingLedger_(settings){
  const id='77777777-7777-4777-8777-777777777717';
  const command={contract:'hakeems.sheets.v1',op:'create',actor:settings.owners[0],actorId:'owner-cleanup-verification',role:'OWNER',requestId:id};
  const rooms=readRooms(googleWorkbook_(settings,command).getTable('OnlineRooms'));
  const room=rooms.find(item=>item.active&&!item.sample&&item.nightlyRate!==null);
  if(!room)throw new Error('No configured unit available for the cleanup verification.');
  command.booking={roomId:room.id,guestName:'TEMPORARY CLEANUP CHECK',contact:'test@example.invalid',checkIn:'2099-01-10',checkOut:'2099-01-12',status:'CONFIRMED',source:'OTHER',totalDue:room.nightlyRate*2,amountPaid:0,notes:'Owner-requested technical check; removed immediately.'};
  const run=cmd=>JSON.parse(runCommand_(googleWorkbook_(settings,cmd),JSON.stringify(cmd)));
  const saved=run(command),replay=run(command);
  if(!saved.ok||!replay.ok||!replay.replayed)throw new Error('Live save/retry verification failed. Saves remain paused.');
  const conflict=run({...command,requestId:'77777777-7777-4777-8777-777777777718'});
  if(conflict.code!=='CONFLICT')throw new Error('Live overlap verification failed. Saves remain paused.');
  const cancelled=run({...command,op:'status',requestId:'77777777-7777-4777-8777-777777777719',bookingId:id,version:1,status:'CANCELLED'});
  if(!cancelled.ok||cancelled.booking.status!=='CANCELLED')throw new Error('Live cancellation verification failed. Saves remain paused.');
  const records=readRows_(settings.spreadsheetId,'Bookings',17).slice(1).filter(row=>row.some(value=>value!==''));
  if(records.length!==1||records[0][0]!==id)throw new Error('Unexpected rows during verification. Saves remain paused.');
  settings.properties.setProperty('RETIRED_BOOKING_'+id,'true');
  writeRow_(settings,{requestId:id},'Bookings',17,2,Array(17).fill(''));
  if(readRows_(settings.spreadsheetId,'Bookings',17).slice(1).some(row=>row.some(value=>value!=='')))throw new Error('Verification cleanup did not finish. Saves remain paused.');
  console.log('Verified live save, retry, overlap rejection and cancellation with the 17-column schema. Temporary check removed; ledger empty.');
}
