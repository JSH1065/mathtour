(function(root){
 'use strict';
 const initial=[10,16,11,15],legs=[{seconds:10,answer:6,options:[9,6,12]},{seconds:15,answer:9,options:[9,18,6]},{seconds:30,answer:18,options:[12,6,18]}];
 const int=n=>Number.isInteger(n)&&Number.isFinite(n);
 const observations=[{start:4,end:14},{start:2,end:18},{start:6,end:17},{start:3,end:18}];
 function freshZoo(){return {version:1,records:[],watched:[],elapsed:0,average:null,bridgeDone:false,bridgeLine:0,briefed:false,bars:[0,0],graphsChecked:false,comparison:null};}
 function zooSolved(z){return z?.version===1&&Array.isArray(z.records)&&z.records.length===4&&z.records.every((n,i)=>n===initial[i])&&Array.isArray(z.watched)&&z.watched.length===4&&z.watched.every(n=>n===true)&&z.average===13&&(z.bridgeDone===true||z.bridgeDone===undefined)&&z.briefed===true&&Array.isArray(z.bars)&&z.bars.length===2&&z.bars[0]===65&&z.bars[1]===60&&z.graphsChecked===true&&z.comparison==='A';}
 function restoreZoo(raw){const z=freshZoo();if(raw?.version!==1)return z;
  for(let i=0;i<4;i++){if(raw.watched?.[i]!==true)break;z.watched.push(true);if(raw.records?.[i]!==initial[i])break;z.records.push(initial[i]);}
  z.elapsed=Number.isFinite(raw.elapsed)?Math.max(0,Math.min(20,raw.elapsed)):0;
  if(z.watched.length>z.records.length)z.elapsed=20;
  if(z.records.length===4&&raw.average===13){z.average=13;z.bridgeDone=raw.bridgeDone===true||(raw.bridgeDone===undefined&&raw.graphsChecked===true);z.bridgeLine=int(raw.bridgeLine)?Math.max(0,Math.min(5,raw.bridgeLine)):0;z.briefed=raw.briefed===true;
   if(z.briefed){z.bars=[0,1].map(i=>int(raw.bars?.[i])?Math.max(0,Math.min(100,raw.bars[i])):0);z.graphsChecked=raw.graphsChecked===true&&z.bars[0]===65&&z.bars[1]===60;if(z.graphsChecked&&raw.comparison==='A')z.comparison='A';}}
  return z;
 }
 function freshPacking(){return {version:2,dims:[30,30,10],phase:'design',boxAnswer:'',boxes:null,crabs:0,proof:null};}
 function fresh(){return {version:1,step:0,line:0,departed:false,marketStoryVersion:2,zoo:freshZoo(),average:{heights:[...initial],moves:0,proof:null},packing:freshPacking(),boat:{version:2,scale:null,gates:[],leg:0,progress:0,x:0,proof:null}};}
 const volume=d=>d.reduce((a,n)=>a*n,1),area=d=>2*(d[0]*d[1]+d[1]*d[2]+d[0]*d[2]);
 function dimensions(d){return Array.isArray(d)&&d.length===3&&d.every(n=>int(n)&&n>=5&&n<=60&&n%5===0);}
 function balanced(h){return Array.isArray(h)&&h.length===4&&h.every(n=>n===13);}
 function transfer(h,from,to){if(!Array.isArray(h)||h.length!==4||!h.every(n=>int(n)&&n>=0&&n<=26)||h.reduce((a,n)=>a+n,0)!==52||!int(from)||!int(to)||from<0||from>3||to<0||to>3||from===to||h[from]===0||h[to]===26)return h;const next=[...h];next[from]--;next[to]++;return next;}
 function design(d){return dimensions(d)&&volume(d)===9000&&area(d)<=2800;}
 function legacyPacking(p){return !!p&&Array.isArray(p.dims)&&p.dims.length===3&&p.dims.every(n=>int(n)&&n>=1&&n<=12)&&volume(p.dims)===120&&area(p.dims)<=160&&p.area===area(p.dims)&&Array.isArray(p.faces)&&new Set(p.faces).size===6&&p.faces.every(n=>int(n)&&n>=0&&n<6);}
 function packingSolved(s){const p=s?.proof;return legacyPacking(p)||!!p&&p.version===2&&design(p.dims)&&p.area===area(p.dims)&&p.boxes===6&&p.crabs===3;}
 function restorePacking(raw){
  if(legacyPacking(raw?.proof))return {...raw,dims:[...(Array.isArray(raw.dims)?raw.dims:raw.proof.dims)]};
  const s=freshPacking();if(raw?.version!==2)return s;
  if(dimensions(raw.dims))s.dims=[...raw.dims];
  s.boxAnswer=typeof raw.boxAnswer==='string'?raw.boxAnswer.slice(0,12):'';
  if(design(s.dims)&&['boxes','crabs','complete'].includes(raw.phase)){
   s.phase='boxes';
   if(raw.boxes===6){s.boxes=6;s.phase='crabs';s.crabs=int(raw.crabs)?Math.max(0,Math.min(6,raw.crabs)):0;
    if(raw.phase==='complete'&&s.crabs===3&&packingSolved(raw)&&raw.proof.dims.every((n,i)=>n===s.dims[i])){s.phase='complete';s.proof={version:2,dims:[...s.dims],area:area(s.dims),boxes:6,crabs:3};}}
  }
  return s;
 }
 function exact(raw,n){return typeof raw==='string'&&raw.trim()!==''&&Number.isFinite(Number(raw))&&Number(raw)===n;}
 function solved(id,s){if(s?.version!==1)return false;if(id==='park')return s.zoo?zooSolved(s.zoo):balanced(s.average?.heights)&&balanced(s.average?.proof?.heights)&&int(s.average?.proof?.moves)&&s.average.proof.moves>=5;
  if(id==='market')return packingSolved(s.packing);
  if(id==='central'){const p=s.boat?.proof;return !!p&&Array.isArray(p.gates)&&p.gates.length===3&&((p.version===2&&p.scale===450&&p.gates.every((n,i)=>n===legs[i].answer))||(p.version!==2&&p.scale===600&&p.gates.every((n,i)=>n===[60,90,180][i])));}
  return false;
 }
 const valid=(id,s)=>s?.departed===true&&solved(id,s);
 function restore(raw){const s=fresh();if(raw?.version!==1)return s;s.step=int(raw.step)&&raw.step>=0?raw.step:0;s.line=int(raw.line)&&raw.line>=0?raw.line:0;s.departed=raw.departed===true;
  if(raw.zoo)s.zoo=restoreZoo(raw.zoo);else if(solved('park',raw))delete s.zoo;
  if(Array.isArray(raw.average?.heights)&&raw.average.heights.length===4&&raw.average.heights.every(n=>int(n)&&n>=0&&n<=26)&&raw.average.heights.reduce((a,n)=>a+n,0)===52)s.average={...s.average,heights:[...raw.average.heights],moves:int(raw.average.moves)?Math.max(0,raw.average.moves):0,proof:raw.average.proof};
  s.packing=restorePacking(raw.packing);s.marketStoryVersion=raw.marketStoryVersion===2?2:1;
  const b=raw.boat;if(solved('central',raw)&&b.proof.version!==2){s.boat={...b,gates:[...b.proof.gates],leg:3,progress:0};}else if(b?.version===2){s.boat.scale=b.scale===450?450:null;if(s.boat.scale){for(let i=0;i<3;i++){if(b.gates?.[i]===legs[i].answer)s.boat.gates.push(b.gates[i]);else break;}s.boat.leg=s.boat.gates.length;s.boat.progress=Number.isFinite(b.progress)?Math.max(0,Math.min(148,b.progress)):0;s.boat.x=Number.isFinite(b.x)?Math.max(-4.8,Math.min(4.8,b.x)):0;s.boat.proof=b.proof;}}else if(solved('central',raw)){s.boat={...b,gates:[...b.proof.gates],leg:3,progress:0};}
  for(const [id,key]of [['park','average'],['market','packing'],['central','boat']])if(!solved(id,s))s[key].proof=null;
  if(s.boat.leg===3&&!s.boat.proof){s.boat.gates.pop();s.boat.leg=2;s.boat.progress=0;}
  return s;
 }
 const api={initial,legs,observations,freshZoo,restoreZoo,zooSolved,freshPacking,restorePacking,packingSolved,legacyPacking,fresh,restore,volume,area,dimensions,balanced,transfer,design,exact,solved,valid};if(typeof module==='object')module.exports=api;root.NamdongMath=api;
})(typeof window==='undefined'?globalThis:window);
