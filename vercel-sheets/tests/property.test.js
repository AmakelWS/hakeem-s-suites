import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PROPERTY,PROPERTY_UNITS,nightsBetween,stayPrice} from '../public/property.js';
test('property inventory contains only the 15 listed units with C studios and confirmed rates',()=>{
 assert.equal(PROPERTY.currency,'XAF');assert.equal(PROPERTY.timeZone,'Africa/Douala');
 assert.equal(PROPERTY_UNITS.length,15);assert.equal(new Set(PROPERTY_UNITS.map(u=>u.id)).size,15);
 assert.deepEqual(PROPERTY_UNITS.filter(u=>u.type==='Studio').map(u=>u.id),['2C','3C','4C']);
 assert.ok(PROPERTY_UNITS.every(u=>u.nightlyRate===(u.type==='Studio'?50000:80000)&&u.capacity===null&&!u.sample));
 assert.ok(!PROPERTY_UNITS.some(u=>['1B','1C','1D','5B','5C'].includes(u.id)));
});
test('calendar-night pricing covers month/year boundaries, leap days and invalid dates',()=>{
 const studio=PROPERTY_UNITS.find(u=>u.id==='2C'),apartment=PROPERTY_UNITS.find(u=>u.id==='2A');
 assert.equal(stayPrice(studio,'2026-10-31','2026-11-03').total,150000);
 assert.equal(stayPrice(apartment,'2026-12-31','2027-01-02').total,160000);
 assert.equal(nightsBetween('2028-02-28','2028-03-01'),2);
 assert.equal(nightsBetween('2026-02-30','2026-03-02'),null);
 assert.equal(nightsBetween('2026-11-01','2026-11-01'),null);
});
test('editing preserves the agreed nightly rate until the unit changes',()=>{
 const room=PROPERTY_UNITS.find(u=>u.id==='2A');
 assert.equal(stayPrice({...room,nightlyRate:90000},'2026-11-01','2026-11-04',{roomId:'2A',nightlyRate:80000}).total,240000);
 assert.equal(stayPrice(PROPERTY_UNITS.find(u=>u.id==='2C'),'2026-11-01','2026-11-04',{roomId:'2A',nightlyRate:80000}).total,150000);
});
