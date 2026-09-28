(function(root){
 'use strict';
 const targets=[{id:'left',name:'왼쪽 받침돌',x:-3,y:1},{id:'right',name:'오른쪽 받침돌',x:3,y:1},{id:'cap',name:'덮개돌',x:0,y:3}];
 const integer=(v,lo,hi)=>Number.isInteger(v)&&v>=lo&&v<=hi;
 function fresh(){return {version:'dolmen-1',step:0,line:0,lever:{arms:[1,1],crew:[0,0],proof:null},placement:{index:0,x:0,y:0,placed:[]},departed:false};}
 function inspectLever(arms,crew){
  if(!Array.isArray(arms)||!Array.isArray(crew)||arms.length!==2||crew.length!==2||!integer(arms[0],1,2)||!integer(arms[1],1,3)||!crew.every(n=>integer(n,0,5))||crew[0]+crew[1]>5)return {valid:false,ok:false};
  const required=arms.map(d=>6/d),enough=crew.map((n,i)=>n>=required[i]);
  return {valid:true,ok:enough.every(Boolean),required,enough,remaining:5-crew[0]-crew[1]};
 }
 function canPlace(index,p){return integer(index,0,2)&&!!p&&p.x===targets[index].x&&p.y===targets[index].y;}
 function placedCount(placed){if(!Array.isArray(placed)||placed.length>3)return -1;for(let i=0;i<placed.length;i++)if(!canPlace(i,placed[i]))return -1;return placed.length;}
 function solved(s,id){if(s?.version!=='dolmen-1')return false;const proof=s.lever?.proof,lever=!!proof&&inspectLever(proof.arms,proof.crew).ok;if(id==='lever')return lever;if(id==='build')return lever&&placedCount(s.placement?.placed)===3;return false;}
 function valid(id,s){return id==='dolmen'&&s?.departed===true&&solved(s,'lever')&&solved(s,'build');}
 function restore(s){const n=fresh();if(s?.version!==n.version)return n;n.step=integer(s.step,0,200)?s.step:0;n.line=integer(s.line,0,200)?s.line:0;
  if(inspectLever(s.lever?.arms,s.lever?.crew).valid){n.lever.arms=[...s.lever.arms];n.lever.crew=[...s.lever.crew];}
  if(solved(s,'lever'))n.lever.proof={arms:[...s.lever.proof.arms],crew:[...s.lever.proof.crew]};
  if(n.lever.proof&&placedCount(s.placement?.placed)>=0){n.placement.placed=s.placement.placed.map(p=>({x:p.x,y:p.y}));n.placement.index=n.placement.placed.length;n.placement.x=integer(s.placement.x,-4,4)?s.placement.x:0;n.placement.y=integer(s.placement.y,-1,4)?s.placement.y:0;}
  n.departed=s.departed===true&&solved(n,'build');return n;
 }
 const api={targets,fresh,inspectLever,canPlace,placedCount,solved,valid,restore};if(typeof module==='object')module.exports=api;root.DolmenMath=api;
})(typeof window==='undefined'?globalThis:window);
