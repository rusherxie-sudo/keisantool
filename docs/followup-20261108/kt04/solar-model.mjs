// Independently transcribed NOAA fractional-year equations, not production's Julian-century equations.
export const locations=[['wakkanai',45.4153,141.6733],['sapporo',43.0642,141.3469],['sendai',38.2682,140.8694],['niigata',37.9161,139.0364],['kanazawa',36.5613,136.6562],['tokyo',35.6762,139.6503],['yokohama',35.4437,139.638],['nagoya',35.1815,136.9066],['kyoto',35.0116,135.7681],['osaka',34.6937,135.5023],['kobe',34.6901,135.1955],['hiroshima',34.3853,132.4553],['fukuoka',33.5904,130.4017],['kagoshima',31.5966,130.5571],['naha',26.2124,127.6809]];
export const minutes=s=>Number(s.slice(0,2))*60+Number(s.slice(3));
export function independentSun(iso,lat,lon){
 const [year,month,day]=iso.split('-').map(Number),rad=Math.PI/180;
 const doy=(Date.UTC(year,month-1,day)-Date.UTC(year,0,0))/86400000;
 const leap=year%4===0&&(year%100!==0||year%400===0);
 const g=2*Math.PI/(leap?366:365)*(doy-1); // NOAA local noon approximation
 const eq=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
 const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
 const ha=Math.acos(Math.cos(90.833*rad)/(Math.cos(lat*rad)*Math.cos(dec))-Math.tan(lat*rad)*Math.tan(dec))/rad;
 return {sunrise:720-4*(lon+ha)-eq+540,sunset:720-4*(lon-ha)-eq+540};
}
