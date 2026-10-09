(function(root){
'use strict';
const B=typeof module==='object'?require('../cheongna-baduk/puzzle.js'):root.BadukPuzzle;
const R=typeof module==='object'?require('../cheongna-fountain/rhythm.js'):root.FountainRhythm;
const validBaduk=raw=>{const s=B.restore(raw);return s?.mode==='photo'&&s.state.length===1;};
const validFountain=raw=>{const s=R.restore(raw);return s?.phase==='done'&&R.analyze(s.score).ready;};
const valid=s=>s?.version===1&&s.captured===true&&s.walkArrived===true&&validBaduk(s.baduk)&&validFountain(s.fountain);
// Coordinates correspond to the painted promenade; the distances are shortened for play.
const path=[[280,644],[370,676],[463,688],[570,671],[671,702],[788,731],[916,726],[1030,701],[1135,718],[1246,728],[1260,661]];
const start={x:380,y:680},destination={x:1256,y:658};
function project(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy)));return {x:a[0]+t*dx,y:a[1]+t*dy};}
function onPath(p){if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y))return false;return path.slice(1).some((b,i)=>{const q=project(p,path[i],b);return Math.hypot(p.x-q.x,p.y-q.y)<=26;})||Math.hypot(p.x-destination.x,p.y-destination.y)<62;}
function fresh(){return {version:1,step:0,line:0,baduk:null,fountain:null,position:{...start},walkArrived:false,captured:false,seen:[]};}
function restore(raw){
 const s=fresh();if(raw?.version!==1)return s;
 if(B.restore(raw.baduk))s.baduk=raw.baduk;
 const f=R.restore(raw.fountain);if(f)s.fountain={version:2,...f};
 if(onPath(raw.position))s.position={x:raw.position.x,y:raw.position.y};
 s.walkArrived=validBaduk(s.baduk)&&raw.walkArrived===true;
 s.step=Number.isInteger(raw.step)?Math.max(0,Math.min(11,raw.step)):0;
 s.line=Number.isInteger(raw.line)?Math.max(0,Math.min(4,raw.line)):0;
 s.seen=Array.isArray(raw.seen)?raw.seen.filter(x=>['park','pavilion','pavilionIntro','fountain'].includes(x)):[];
 if(s.step>4&&!validBaduk(s.baduk))s.step=4;
 if(s.step>6&&!s.walkArrived)s.step=6;
 if(s.step>8&&!validFountain(s.fountain))s.step=8;
 s.captured=raw.captured===true&&validBaduk(s.baduk)&&validFountain(s.fountain)&&s.walkArrived;
 if(s.step===11&&!s.captured)s.step=10;
 return s;
}
const api={validBaduk,validFountain,valid,fresh,restore,path,start,destination,onPath,project};
if(typeof module==='object')module.exports=api;else root.CheongnaLakeModel=api;
})(typeof window==='object'?window:globalThis);
