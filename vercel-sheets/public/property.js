// Confirmed by the property owner. Do not infer unlisted units from the floor pattern.
export const PROPERTY={name:"Hakeem's Suites",city:'Buea, Cameroon',currency:'XAF',timeZone:'Africa/Douala'};
export const UNIT_IDS=['1A','2A','2B','2C','2D','3A','3B','3C','3D','4A','4B','4C','4D','5A','5D'];
export const PROPERTY_UNITS=UNIT_IDS.map(id=>({id,name:id,type:id.endsWith('C')?'Studio':'Apartment',capacity:null,active:true,sample:false,nightlyRate:id.endsWith('C')?50000:80000}));
export function nightsBetween(checkIn,checkOut){
 const valid=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
 if(!valid(checkIn)||!valid(checkOut))return null;
 const nights=(Date.parse(checkOut+'T00:00:00Z')-Date.parse(checkIn+'T00:00:00Z'))/86400000;
 return Number.isInteger(nights)&&nights>0?nights:null;
}
export function stayPrice(room,checkIn,checkOut,existing=null){
 const nights=nightsBetween(checkIn,checkOut),nightlyRate=existing?.roomId===room?.id?existing.nightlyRate:room?.nightlyRate;
 return {nights,nightlyRate:nightlyRate??null,total:nights&&Number.isFinite(nightlyRate)?Math.round(nightlyRate*100)*nights/100:null};
}
