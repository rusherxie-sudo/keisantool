import {locations,independentSun,minutes} from './solar-model.mjs';
import {hinodeIri,cityCoordinates} from '../../../src/lib/hinodeiri.js';
import {writeFileSync} from 'node:fs';import assert from 'node:assert/strict';
const cases=[];
for(const [id,lat,lon] of locations){assert.deepEqual(cityCoordinates(id),{lat,lon});for(const iso of ['2026-01-01','2026-07-01','2027-01-01','2028-02-29']){
 const r=hinodeIri(...iso.split('-').map(Number),id),oracle=independentSun(iso,lat,lon);
 const delta={sunrise:Math.abs(minutes(r.sunrise)-oracle.sunrise),sunset:Math.abs(minutes(r.sunset)-oracle.sunset)};
 cases.push({id,iso,coordinates:{lat,lon},actual:r,independentMinutesJST:oracle,deltaMinutes:delta,pass:Math.max(...Object.values(delta))<=5});
}}
writeFileSync(new URL('solar-model-results.json',import.meta.url),JSON.stringify({source:'model-source.json',coordinateScope:'Fixed configured points, not observatory coordinates or surveyed city centers',toleranceMinutes:5,scope:'60 representative model comparisons; no universal precision guarantee; different NOAA approximations share standard solar geometry',cases},null,2)+'\n');console.log({cases:cases.length,failed:cases.filter(x=>!x.pass).length,maxDelta:Math.max(...cases.flatMap(x=>Object.values(x.deltaMinutes)))});assert(cases.every(x=>x.pass));
