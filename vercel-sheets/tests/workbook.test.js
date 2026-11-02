import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {randomUUID} from 'node:crypto';
const source=(await fs.readFile(new URL('../google/Rules.ts',import.meta.url),'utf8')).replace('function runCommand_(','export function main(');
const {main}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
const headers=['id','version','roomId','guestName','contact','checkIn','checkOut','status','source','totalDue','amountPaid','notes','createdBy','updatedBy','updatedAt','lastRequestId','nightlyRate'];
// The Google adapter writes strings with Sheets API RAW semantics.
const literal=row=>row;
class Table{
 constructor(header,rows=[]){this.header=header;this.rows=rows;this.failAfterWrite=false;}
 getHeaderRowRange(){return {getValues:()=>[this.header]};}
 getRowCount(){return this.rows.length;}
 getRangeBetweenHeaderAndTotal(){return {getValues:()=>structuredClone(this.rows),getRow:index=>({setValues:values=>{this.rows[index]=literal(values[0]);if(this.failAfterWrite)throw new Error('Response interrupted after write');}})};}
 addRow(index,row){this.rows.push(literal(row));if(this.failAfterWrite)throw new Error('Response interrupted after append');}
}
function workbook(){const rooms=new Table(['id','name','type','capacity','active','sample','nightlyRate'],[['r1','Room 1','Queen',2,true,false,''],['r2','Room 2','Twin',2,true,false,'']]);const bookings=new Table([...headers]);return {rooms,bookings,getTable:name=>name==='OnlineRooms'?rooms:name==='OnlineBookings'?bookings:undefined};}
function cmd(op='create',extra={}){return {contract:'hakeems.sheets.v1',op,actor:'staff@example.invalid',actorId:'staff-id',role:'STAFF',requestId:randomUUID(),booking:{roomId:'r1',guestName:'Fictional Guest',contact:'+15551234567',checkIn:'2030-01-10',checkOut:'2030-01-12',status:'CONFIRMED',source:'DIRECT_CALL',totalDue:'300',amountPaid:'100',notes:'Test only'},...extra};}
const run=(w,c)=>JSON.parse(main(w,JSON.stringify(c)));
test('confirmed overlaps fail; adjacent stays and another room succeed',()=>{const w=workbook();assert.equal(run(w,cmd()).ok,true);assert.equal(run(w,cmd()).code,'CONFLICT');const a=cmd();a.booking.checkIn='2030-01-12';a.booking.checkOut='2030-01-14';assert.equal(run(w,a).ok,true);const b=cmd();b.booking.roomId='r2';assert.equal(run(w,b).ok,true);});
test('pending does not hold a room, cannot confirm into conflict, and cancellation releases it',()=>{const w=workbook(),a=cmd(),b=cmd();b.booking.status='PENDING';run(w,a);run(w,b);assert.equal(run(w,cmd('status',{booking:undefined,bookingId:b.requestId,version:1,status:'CONFIRMED'})).code,'CONFLICT');assert.equal(run(w,cmd('status',{booking:undefined,bookingId:a.requestId,version:1,status:'CANCELLED'})).ok,true);assert.equal(run(w,cmd('status',{booking:undefined,bookingId:b.requestId,version:1,status:'CONFIRMED'})).ok,true);});
test('same creation reference replays once; different data with same reference is rejected',()=>{const w=workbook(),c=cmd();assert.equal(run(w,c).replayed,false);assert.equal(run(w,c).replayed,true);assert.equal(w.bookings.rows.length,1);c.booking.guestName='Different';assert.equal(run(w,c).code,'REQUEST_REUSED');});
test('versions protect edits and status changes; transition lifecycle is enforced',()=>{const w=workbook(),c=cmd();run(w,c);const change=cmd('edit',{bookingId:c.requestId,version:1});change.booking.guestName='Updated';assert.equal(run(w,change).booking.version,2);assert.equal(run(w,change).replayed,true);assert.equal(run(w,cmd('status',{booking:undefined,bookingId:c.requestId,version:1,status:'CANCELLED'})).code,'STALE');const checkin=run(w,cmd('status',{booking:undefined,bookingId:c.requestId,version:2,status:'CHECKED_IN'}));assert.equal(checkin.booking.status,'CHECKED_IN');assert.equal(run(w,cmd('status',{booking:undefined,bookingId:c.requestId,version:3,status:'CANCELLED'})).code,'INVALID');});
test('validates dates, amounts, sources and inactive rooms without writing',()=>{for(const mutate of [c=>c.booking.checkOut=c.booking.checkIn,c=>c.booking.checkIn='2030-02-30',c=>c.booking.amountPaid='301',c=>c.booking.amountPaid='-1',c=>c.booking.amountPaid='1.001',c=>c.booking.source='WRONG',c=>c.booking.roomId='missing',c=>c.booking.guestName='']){const w=workbook(),c=cmd();mutate(c);assert.equal(run(w,c).ok,false);assert.equal(w.bookings.rows.length,0);}});
test('balances and unknown totals retain their meanings; formula-like contact stays literal',()=>{const w=workbook(),c=cmd();c.booking.notes='=HYPERLINK("https://example.invalid")';const b=run(w,c).booking;assert.equal(b.balance,200);assert.equal(b.payment,'PARTIAL');assert.equal(b.contact,'+15551234567');assert.equal(b.notes,c.booking.notes);const d=cmd();d.booking.roomId='r2';d.booking.totalDue=null;d.booking.amountPaid='0';assert.equal(run(w,d).booking.balance,null);});
test('missing, duplicate or corrupt schema fails closed',()=>{const w=workbook();w.bookings.header[0]='wrong';assert.equal(run(w,cmd()).code,'CORRUPT_WORKBOOK');assert.equal(w.bookings.rows.length,0);const other=workbook();other.rooms.rows.push([...other.rooms.rows[0]]);assert.equal(run(other,cmd()).code,'CORRUPT_WORKBOOK');});
test('a write followed by transport failure remains unknown and retry does not duplicate',()=>{const w=workbook(),c=cmd();w.bookings.failAfterWrite=true;assert.equal(run(w,c).code,'OUTCOME_UNKNOWN');assert.equal(w.bookings.rows.length,1);w.bookings.failAfterWrite=false;assert.equal(run(w,c).replayed,true);assert.equal(w.bookings.rows.length,1);});
test('read and request lookup return shared workbook values',()=>{const w=workbook(),c=cmd();run(w,c);const read=run(w,cmd('read'));assert.equal(read.bookings.length,1);assert.equal(read.rooms.length,2);assert.equal(run(w,cmd('request',{requestId:c.requestId})).found,true);assert.equal(run(w,cmd('request')).found,false);});
test('serialized single-writer model produces one confirmation from eight competing requests',async()=>{const w=workbook();let queue=Promise.resolve();const requests=Array.from({length:8},()=>{const c=cmd();const task=queue.then(()=>run(w,c));queue=task.then(()=>{});return task;});const results=await Promise.all(requests);assert.equal(results.filter(x=>x.ok).length,1);assert.equal(results.filter(x=>x.code==='CONFLICT').length,7);assert.equal(w.bookings.rows.length,1);});
test('empty table placeholders are ignored while updates retain physical row positions',()=>{
 const w=workbook();w.bookings.rows.push(headers.map(()=>''));assert.equal(run(w,cmd('read')).bookings.length,0);
 const c=cmd();run(w,c);assert.equal(w.bookings.rows.length,1);w.bookings.rows.push(headers.map(()=>''));
 const edit=cmd('edit',{bookingId:c.requestId,version:1});edit.booking.guestName='Updated original row';
 assert.equal(run(w,edit).ok,true);assert.equal(w.bookings.rows[0][3],'Updated original row');assert.ok(w.bookings.rows[1].every(v=>v===''));
 const next=cmd();next.booking.roomId='r2';run(w,next);assert.equal(w.bookings.rows.length,2);w.bookings.rows.splice(1,0,headers.map(()=>''));const snapshot=structuredClone(w.bookings.rows);
 assert.equal(run(w,cmd('edit',{bookingId:c.requestId,version:2})).code,'CORRUPT_WORKBOOK');assert.deepEqual(w.bookings.rows,snapshot);
});
test('sample rooms cannot receive live bookings and invalid room flags fail closed',()=>{
 const w=workbook();w.rooms.rows[0][5]=true;assert.equal(run(w,cmd()).code,'INVALID');assert.equal(w.bookings.rows.length,0);
 w.rooms.rows[0][4]='yes';assert.equal(run(w,cmd('read')).code,'CORRUPT_WORKBOOK');
});
test('manual ledger corruption or existing overlaps prevent further booking changes',()=>{
 for(const mutate of [rows=>rows[0][5]='2030-02-30',rows=>rows[0][10]=-5,rows=>rows[0][8]='invalid',rows=>{const duplicate=[...rows[0]];duplicate[0]=randomUUID();rows.push(duplicate);}]){
  const w=workbook();run(w,cmd());mutate(w.bookings.rows);const before=structuredClone(w.bookings.rows);
  assert.equal(run(w,cmd('read')).code,'CORRUPT_WORKBOOK');const change=cmd();change.booking.roomId='r2';assert.equal(run(w,change).code,'CORRUPT_WORKBOOK');assert.deepEqual(w.bookings.rows,before);
 }
});
test('Sheet rates determine apartment/studio totals and a forged client price is rejected',()=>{
 const w=workbook();w.rooms.rows[0][6]=80000;w.rooms.rows[1][6]=50000;w.rooms.rows[0][3]='';
 const apartment=cmd();apartment.booking.totalDue='160000';apartment.booking.amountPaid='80000';
 const saved=run(w,apartment);assert.equal(saved.booking.totalDue,160000);assert.equal(saved.booking.nightlyRate,80000);assert.equal(saved.booking.balance,80000);
 const forged=cmd();forged.booking.roomId='r2';assert.equal(run(w,forged).code,'PRICING_CHANGED');
 const studio=cmd();studio.booking.roomId='r2';studio.booking.totalDue='';studio.booking.amountPaid='0';
 assert.equal(run(w,studio).booking.totalDue,100000);
});
test('amending dates retains the stored rate and moving units uses the destination rate',()=>{
 const w=workbook();w.rooms.rows[0][6]=80000;w.rooms.rows[1][6]=50000;
 const c=cmd();c.booking.totalDue='160000';run(w,c);w.rooms.rows[0][6]=90000;
 const edit=cmd('edit',{bookingId:c.requestId,version:1});edit.booking.checkOut='2030-01-13';edit.booking.totalDue='240000';
 assert.equal(run(w,edit).booking.nightlyRate,80000);
 const move=cmd('edit',{bookingId:c.requestId,version:2});move.booking.roomId='r2';move.booking.totalDue='100000';
 assert.equal(run(w,move).booking.nightlyRate,50000);
});
test('tampering with the stored nightly rate makes the ledger fail closed',()=>{
 const w=workbook();w.rooms.rows[0][6]=80000;const c=cmd();c.booking.totalDue='160000';run(w,c);
 w.bookings.rows[0][16]=50000;assert.equal(run(w,cmd('read')).code,'CORRUPT_WORKBOOK');
});
test('booking rows and public records contain no reference or payload fingerprints',()=>{
 const w=workbook(),c=cmd();c.booking.reference='Discard this removed field';const saved=run(w,c);
 assert.equal(w.bookings.rows[0].length,17);
 for(const key of ['reference','initialFingerprint','lastFingerprint']){assert.equal(headers.includes(key),false);assert.equal(key in saved.booking,false);}
});
test('creation retry after subsequent edits fails closed and can be reconciled by request lookup',()=>{
 const w=workbook(),c=cmd();run(w,c);const change=cmd('edit',{bookingId:c.requestId,version:1});change.booking.guestName='Amended';run(w,change);
 assert.equal(run(w,c).code,'REQUEST_REUSED');const lookup=run(w,cmd('request',{requestId:c.requestId}));assert.equal(lookup.found,true);assert.equal(lookup.booking.guestName,'Amended');assert.equal(w.bookings.rows.length,1);
});
test('replaying a mutation with changed details, actor or original version is rejected without fingerprints',()=>{
 const w=workbook(),c=cmd();run(w,c);const change=cmd('status',{booking:undefined,bookingId:c.requestId,version:1,status:'CANCELLED'});assert.equal(run(w,change).ok,true);assert.equal(run(w,change).replayed,true);
 for(const extra of [{status:'CHECKED_IN'},{actor:'other@example.invalid'},{version:2}])assert.equal(run(w,{...change,...extra}).code,'REQUEST_REUSED');assert.equal(w.bookings.rows[0][1],2);
});
