/** Booking rules, invoked only inside the Apps Script gateway's script lock.
 * Build with npm run build:gateway. Do not deploy this TypeScript file directly.
 */
type Value = string | number | boolean;
type Row = Value[];
interface TableStore {
  getHeaderRowRange(): { getValues(): Row[] };
  getRowCount(): number;
  getRangeBetweenHeaderAndTotal(): { getValues(): Row[]; getRow(index: number): { setValues(values: Row[]): void } };
  addRow(index: number, row: Row): void;
}
interface BookingStore { getTable(name: string): TableStore | undefined; }
interface InputBooking { roomId?: string; guestName?: string; contact?: string; checkIn?: string; checkOut?: string; status?: string; source?: string; reference?: string; totalDue?: string | number | null; amountPaid?: string | number; notes?: string; nightlyRate?: number | null; }
interface Command { contract: string; op: string; actor: string; actorId: string; role: string; requestId?: string; bookingId?: string; version?: number; status?: string; booking?: InputBooking; }
interface Room { id: string; name: string; type: string; capacity: number | null; active: boolean; sample: boolean; nightlyRate: number | null; }
interface Booking { id: string; version: number; roomId: string; guestName: string; contact: string; checkIn: string; checkOut: string; status: string; source: string; reference: string; totalDue: number | null; amountPaid: number; notes: string; createdBy: string; updatedBy: string; updatedAt: string; initialFingerprint: string; lastRequestId: string; lastFingerprint: string; nightlyRate: number | null; }
const ROOM_HEADERS = ['id','name','type','capacity','active','sample','nightlyRate'];
const BOOKING_HEADERS = ['id','version','roomId','guestName','contact','checkIn','checkOut','status','source','reference','totalDue','amountPaid','notes','createdBy','updatedBy','updatedAt','initialFingerprint','lastRequestId','lastFingerprint','nightlyRate'];
const CONTRACT='hakeems.sheets.v1';
class Rejection extends Error { declare code: string; constructor(code:string,message:string){super(message);this.code=code;} }
function reject(code:string,message:string):never{throw new Rejection(code,message);}
function text(value: unknown,label:string,max:number,required:boolean):string{
  if(value===undefined||value===null)value='';if(typeof value!=='string')return reject('INVALID',label+' must be text.');
  const clean=value.trim();if((required&&!clean)||clean.length>max)return reject('INVALID',label+' is required and must be at most '+max+' characters.');return clean;
}
function date(value: unknown):string{
  const s=text(value,'Stay date',10,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return reject('INVALID','Dates must use YYYY-MM-DD.');
  const parsed=new Date(s+'T00:00:00Z');if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==s||s<'1900-01-01')return reject('INVALID','Invalid stay date.');return s;
}
function money(value:unknown,blank:boolean):number|null{
  if((value===null||value===undefined||value==='')&&blank)return null;
  if(value===undefined||value==='')value=0;const s=String(value);
  if(!/^\d{1,10}(\.\d{1,2})?$/.test(s))return reject('INVALID','Amounts must be nonnegative with at most two decimals.');
  const parts=s.split('.');return Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
}
function headers(table:TableStore,expected:string[]):void{
  const actual=table.getHeaderRowRange().getValues()[0];if(JSON.stringify(actual)!==JSON.stringify(expected))reject('CORRUPT_WORKBOOK','Workbook columns do not match the configured online schema.');
}
function values(table:TableStore):Row[]{
  const rows:Row[]=table.getRowCount()===0?[]:table.getRangeBetweenHeaderAndTotal().getValues();
  // Trim only blank trailing rows,
  // preserving physical row indexes so an edit cannot overwrite a different stay.
  while(rows.length&&rows[rows.length-1].every(value=>value===''))rows.pop();
  return rows;
}
function storedBoolean(value:Value):boolean{
  if(value===true||String(value).toLowerCase()==='true')return true;
  if(value===false||String(value).toLowerCase()==='false')return false;
  return reject('CORRUPT_WORKBOOK','Room active/sample flags must be TRUE or FALSE.');
}
function readRooms(table:TableStore):Room[]{
  headers(table,ROOM_HEADERS);const ids:string[]=[];
  return values(table).map(row=>{
    const id=String(row[0]),capacity=row[3]===''?null:Number(row[3]);if(!id||ids.includes(id)||capacity!==null&&(!Number.isInteger(capacity)||capacity<1||capacity>100))reject('CORRUPT_WORKBOOK','Invalid or duplicate room record.');ids.push(id);
    if(!String(row[1]).trim()||id.length>80)reject('CORRUPT_WORKBOOK','Room IDs and names are required.');
    let rate:number|null;try{rate=money(row[6],true);}catch{return reject('CORRUPT_WORKBOOK','Unit nightly rate is invalid.');}if(rate!==null&&rate<=0)reject('CORRUPT_WORKBOOK','Unit nightly rate must be positive.');
    return {id,name:String(row[1]),type:String(row[2]),capacity,active:storedBoolean(row[4]),sample:storedBoolean(row[5]),nightlyRate:rate===null?null:rate/100};
  });
}
function readBookings(table:TableStore):Booking[]{
  headers(table,BOOKING_HEADERS);const ids:string[]=[];
  return values(table).map(row=>{
    const id=String(row[0]),version=Number(row[1]);if(!id||ids.includes(id)||!Number.isInteger(version)||version<1)reject('CORRUPT_WORKBOOK','Invalid or duplicate booking ID/version.');ids.push(id);
    let total:number|null,paid:number,checkIn:string,checkOut:string,nightly:number|null;
    try{total=money(row[10],true);paid=money(row[11],false) as number;checkIn=date(row[5]);checkOut=date(row[6]);nightly=money(row[19],true);}catch{return reject('CORRUPT_WORKBOOK','An existing reservation has invalid dates or amounts.');}
    const b:Booking={id,version,roomId:String(row[2]),guestName:String(row[3]),contact:String(row[4]),checkIn,checkOut,status:String(row[7]),source:String(row[8]),reference:String(row[9]),totalDue:total===null?null:total/100,amountPaid:paid/100,notes:String(row[12]),createdBy:String(row[13]),updatedBy:String(row[14]),updatedAt:String(row[15]),initialFingerprint:String(row[16]),lastRequestId:String(row[17]),lastFingerprint:String(row[18]),nightlyRate:nightly===null?null:nightly/100};
    if(nightly!==null&&(nightly<=0||total!==nightly*stayNights(b.checkIn,b.checkOut)))reject('CORRUPT_WORKBOOK','Existing stay total does not match its stored nightly rate.');
    if(!b.guestName.trim()||!b.contact.trim()||!['WALK_IN','DIRECT_CALL','AIRBNB','BOOKING_COM','SOCIAL_MEDIA','OTHER'].includes(b.source)||b.checkOut<=b.checkIn||!['PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED'].includes(b.status)||total!==null&&paid>total)reject('CORRUPT_WORKBOOK','Invalid existing stay or financial record.');return b;
  });
}
function toRow(b:Booking):Row{return [b.id,b.version,b.roomId,b.guestName,b.contact,b.checkIn,b.checkOut,b.status,b.source,b.reference,b.totalDue===null?'':b.totalDue,b.amountPaid,b.notes,b.createdBy,b.updatedBy,b.updatedAt,b.initialFingerprint,b.lastRequestId,b.lastFingerprint,b.nightlyRate===null?'':b.nightlyRate];}
function publicBooking(b:Booking):object{
  const {initialFingerprint,lastFingerprint,...visible}=b;return {...visible,balance:b.totalDue===null?null:Math.round((b.totalDue-b.amountPaid)*100)/100,payment:b.totalDue!==null&&b.amountPaid===b.totalDue?'PAID':b.amountPaid>0?'PARTIAL':'UNPAID'};
}
function stayNights(checkIn:string,checkOut:string):number{return (Date.parse(checkOut+'T00:00:00Z')-Date.parse(checkIn+'T00:00:00Z'))/86400000;}
function normalize(input:InputBooking,rooms:Room[],current?:Booking):InputBooking{
  if(!input||typeof input!=='object')return reject('INVALID','Provide booking details.');
  const roomId=text(input.roomId,'Room',80,true);const selected=rooms.find(room=>room.id===roomId&&room.active);if(!selected)return reject('INVALID','Choose an active room.');if(selected.sample)return reject('INVALID','Management must replace sample inventory with actual rooms before saving bookings.');
  const checkIn=date(input.checkIn),checkOut=date(input.checkOut);if(checkOut<=checkIn)return reject('INVALID','Checkout must be later than check-in.');
  const source=text(input.source,'Source',30,true);if(!['WALK_IN','DIRECT_CALL','AIRBNB','BOOKING_COM','SOCIAL_MEDIA','OTHER'].includes(source))return reject('INVALID','Choose a valid booking source.');
  const nightlyRate=current&&current.roomId===roomId?current.nightlyRate:selected.nightlyRate;
  const submitted=money(input.totalDue,true),due=nightlyRate===null?submitted:(money(nightlyRate,false) as number)*stayNights(checkIn,checkOut),paid=money(input.amountPaid,false) as number;
  if(due!==null&&due>999999999999)reject('INVALID','Stay amount exceeds the supported limit.');
  if(nightlyRate!==null&&submitted!==null&&submitted!==due)reject('PRICING_CHANGED','The total does not match the unit rate and nights. Refresh and review the price.');
  if(due!==null&&paid>due)return reject('INVALID','Paid amount cannot exceed the total due.');
  return {roomId,guestName:text(input.guestName,'Guest name',120,true),contact:text(input.contact,'Contact',200,true),checkIn,checkOut,status:text(input.status,'Status',20,true),source,reference:text(input.reference,'Reference',100,false),totalDue:due===null?null:due/100,amountPaid:paid/100,notes:text(input.notes,'Notes',1000,false),nightlyRate};
}
function blocking(status:string):boolean{return ['CONFIRMED','CHECKED_IN','CHECKED_OUT'].includes(status);}
function free(all:Booking[],next:Booking):void{
  if(blocking(next.status)&&all.some(b=>b.id!==next.id&&b.roomId===next.roomId&&blocking(b.status)&&b.checkIn<next.checkOut&&b.checkOut>next.checkIn))reject('CONFLICT','That room already has a confirmed stay for these dates.');
}
function runCommand_(workbook:BookingStore,payloadJson:string):string{
  let writeAttempted=false;
  try{
    const cmd=JSON.parse(payloadJson) as Command;if(cmd.contract!==CONTRACT)reject('INVALID','Unsupported website contract.');
    const actor=text(cmd.actor,'Staff account',254,true);text(cmd.actorId,'Staff identity',255,true);if(!['OWNER','STAFF'].includes(cmd.role))reject('INVALID','Staff access is required.');
    const roomTable=workbook.getTable('OnlineRooms'),table=workbook.getTable('OnlineBookings');if(!roomTable||!table)reject('CORRUPT_WORKBOOK','Run the workbook setup script first.');
    const rooms=readRooms(roomTable),all=readBookings(table);
    if(all.some(b=>!rooms.some(room=>room.id===b.roomId)))reject('CORRUPT_WORKBOOK','A reservation refers to a missing room.');
    if(all.some((a,index)=>blocking(a.status)&&all.slice(index+1).some(b=>blocking(b.status)&&a.roomId===b.roomId&&a.checkIn<b.checkOut&&a.checkOut>b.checkIn)))reject('CORRUPT_WORKBOOK','Existing confirmed stays overlap. Management must reconcile the workbook before taking bookings.');
    const answer=(extra:object):string=>JSON.stringify({contract:CONTRACT,ok:true,...extra,syncedAt:new Date().toISOString()});
    if(cmd.op==='read')return answer({rooms:rooms.filter(r=>r.active),bookings:all.map(publicBooking)});
    if(cmd.op==='request'){
      const found=all.find(b=>b.id===cmd.requestId||b.lastRequestId===cmd.requestId);
      return answer({found:!!found,booking:found?publicBooking(found):null});
    }
    const requestId=text(cmd.requestId,'Request reference',36,true);if(!/^[a-z0-9-]{36}$/i.test(requestId))reject('INVALID','Use the original request reference.');
    if(!['create','edit','status'].includes(cmd.op))reject('INVALID','Unsupported booking operation.');
    // RAW writes preserve strings without interpreting them as formulas.
    const fingerprint=JSON.stringify([cmd.op,cmd.bookingId||'',cmd.version??'',cmd.status||'',cmd.booking||null,actor]);
    if(cmd.op==='create'){
      const old=all.find(b=>b.id===requestId);
      if(old){if(old.initialFingerprint!==fingerprint)reject('REQUEST_REUSED','This reference already belongs to another request. Reconcile the existing booking.');return answer({booking:publicBooking(old),replayed:true});}
      const input=normalize(cmd.booking as InputBooking,rooms);if(!['PENDING','CONFIRMED','CANCELLED'].includes(input.status as string))reject('INVALID','New bookings must be pending, confirmed or cancelled.');
      const next:Booking={id:requestId,version:1,roomId:input.roomId as string,guestName:input.guestName as string,contact:input.contact as string,checkIn:input.checkIn as string,checkOut:input.checkOut as string,status:input.status as string,source:input.source as string,reference:input.reference as string,totalDue:input.totalDue as number|null,amountPaid:input.amountPaid as number,notes:input.notes as string,createdBy:actor,updatedBy:actor,updatedAt:new Date().toISOString(),initialFingerprint:fingerprint,lastRequestId:requestId,lastFingerprint:fingerprint,nightlyRate:input.nightlyRate as number|null};
      free(all,next);writeAttempted=true;if(table.getRowCount()>all.length)table.getRangeBetweenHeaderAndTotal().getRow(all.length).setValues([toRow(next)]);else table.addRow(-1,toRow(next));return answer({booking:publicBooking(next),replayed:false});
    }
    const index=all.findIndex(b=>b.id===cmd.bookingId);if(index<0)reject('NOT_FOUND','Booking not found.');const current=all[index];
    if(current.lastRequestId===requestId){if(current.lastFingerprint!==fingerprint)reject('REQUEST_REUSED','This request reference has already been used.');return answer({booking:publicBooking(current),replayed:true});}
    if(!Number.isInteger(cmd.version)||cmd.version!==current.version)reject('STALE','Someone else changed this booking. Refresh and review the latest record.');
    let next:Booking={...current};
    if(cmd.op==='status'){
      const allowed:{[key:string]:string[]}={PENDING:['CONFIRMED','CANCELLED'],CONFIRMED:['CHECKED_IN','CANCELLED'],CHECKED_IN:['CHECKED_OUT'],CHECKED_OUT:[],CANCELLED:[]};
      if(!allowed[current.status].includes(cmd.status||''))reject('INVALID','That status transition is not allowed.');
      next.status=cmd.status as string;if(next.status==='CONFIRMED'&&!rooms.some(r=>r.id===next.roomId&&r.active&&!r.sample))reject('INVALID','Choose an active, actual room before confirming.');
    }else{
      if(['CHECKED_OUT','CANCELLED'].includes(current.status))reject('INVALID','Completed or cancelled stays cannot be amended here.');
      const input=normalize({...cmd.booking,status:current.status},rooms,current);
      next={...next,roomId:input.roomId as string,guestName:input.guestName as string,contact:input.contact as string,checkIn:input.checkIn as string,checkOut:input.checkOut as string,source:input.source as string,reference:input.reference as string,totalDue:input.totalDue as number|null,amountPaid:input.amountPaid as number,notes:input.notes as string,nightlyRate:input.nightlyRate as number|null};
    }
    free(all,next);next.version++;next.updatedBy=actor;next.updatedAt=new Date().toISOString();next.lastRequestId=requestId;next.lastFingerprint=fingerprint;
    // One row replacement includes data, version and replay metadata. No separate append log can partially succeed.
    writeAttempted=true;table.getRangeBetweenHeaderAndTotal().getRow(index).setValues([toRow(next)]);
    return answer({booking:publicBooking(next),replayed:false});
  }catch(error){if(error instanceof Rejection)return JSON.stringify({contract:CONTRACT,ok:false,code:error.code,message:error.message});
    return JSON.stringify({contract:CONTRACT,ok:false,code:writeAttempted?'OUTCOME_UNKNOWN':'CORRUPT_WORKBOOK',message:writeAttempted?'Google Sheets may have saved this request. Check the same request reference before trying again.':'The booking sheet could not be safely read. Management must inspect it.'});}
}
