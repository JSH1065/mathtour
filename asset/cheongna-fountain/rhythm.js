(function(root){
'use strict';
const TOTAL=24,GROUPS=6,LENGTH=4;
function initial(){return {phase:'share',beads:Array(TOTAL).fill(-1),answer:null,score:Array.from({length:GROUPS},()=>[])};}
function validBeads(beads){return Array.isArray(beads)&&beads.length===TOTAL&&beads.every(n=>Number.isInteger(n)&&n>=-1&&n<GROUPS);}
function counts(beads){return Array.from({length:GROUPS},(_,i)=>beads.filter(n=>n===i).length);}
function equal(beads){return validBeads(beads)&&counts(beads).every(n=>n===LENGTH);}
function validBlocks(blocks){if(!Array.isArray(blocks))return false;const used=new Set();for(const b of blocks){if(!b||![1,2,4].includes(b.beats)||!Number.isInteger(b.start)||b.start<0||b.start+b.beats>LENGTH)return false;for(let i=b.start;i<b.start+b.beats;i++){if(used.has(i))return false;used.add(i);}}return true;}
function place(blocks,start,beats){const next=[...blocks,{start,beats}].sort((a,b)=>a.start-b.start);return validBlocks(next)?next:null;}
function complete(blocks){return validBlocks(blocks)&&blocks.reduce((n,b)=>n+b.beats,0)===LENGTH;}
function key(blocks){return complete(blocks)?[...blocks].sort((a,b)=>a.start-b.start).map(b=>b.beats).join('-'):null;}
function validScore(score){return Array.isArray(score)&&score.length===GROUPS&&score.every(validBlocks);}
function analyze(score){
 const keys=score.map(key),groups=new Map();keys.forEach((k,i)=>{if(k!==null){if(!groups.has(k))groups.set(k,[]);groups.get(k).push(i);}});
 const duplicates=[...groups.values()].filter(a=>a.length>1),incomplete=keys.flatMap((k,i)=>k===null?[i]:[]);
 return {keys,duplicates,incomplete,distinct:groups.size,ready:validScore(score)&&!incomplete.length&&!duplicates.length};
}
function timeline(score){if(!validScore(score)||!analyze(score).ready)return null;return score.flatMap((row,group)=>[...row].sort((a,b)=>a.start-b.start).map(b=>({...b,group,at:group*LENGTH+b.start})));}
function restore(data){
 if(!data||data.version!==2||!validBeads(data.beads)||!validScore(data.score)||!['share','answer','compose','done'].includes(data.phase))return null;
 if(data.phase!=='share'&&!equal(data.beads))return null;
 if(['compose','done'].includes(data.phase)&&data.answer!==LENGTH)return null;
 if(data.phase==='done'&&!analyze(data.score).ready)return null;
 return {phase:data.phase,beads:[...data.beads],answer:data.answer===LENGTH?LENGTH:null,score:data.score.map(row=>row.map(b=>({start:b.start,beats:b.beats})))};
}
const api={TOTAL,GROUPS,LENGTH,initial,validBeads,counts,equal,validBlocks,place,complete,key,validScore,analyze,timeline,restore};
if(typeof module==='object'&&module.exports)module.exports=api;else root.FountainRhythm=api;
})(typeof window==='object'?window:globalThis);
