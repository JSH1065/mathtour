(function(root){
 'use strict';
 const specs={bags:{a:15,b:35,total:8,result:160,max:8},belt:{a:2,b:1,total:10,result:16,max:10}};
 const integer=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max;
 function inspect(id,x,y){const t=specs[id];if(!t||!integer(x,t.max)||!integer(y,t.max))return {valid:false,ok:false};const total=x+y,result=t.a*x+t.b*y;return {valid:true,total,result,countOK:total===t.total,valueOK:result===t.result,ok:total===t.total&&result===t.result};}
 function fresh(){return {version:'airport-1',step:0,line:0,bags:{x:0,y:0,proof:null},belt:{x:0,y:0,proof:null},departed:false};}
 function solved(s,id){if(s?.version!=='airport-1'||!specs[id])return false;const p=s[id]?.proof;return !!p&&inspect(id,p.x,p.y).ok&&(id!=='belt'||solved(s,'bags'));}
 function valid(id,s){return id==='airport'&&s?.departed===true&&solved(s,'bags')&&solved(s,'belt');}
 function restore(s){const n=fresh();if(s?.version!==n.version)return n;n.step=integer(s.step,200)?s.step:0;n.line=integer(s.line,200)?s.line:0;for(const id of ['bags','belt']){if(inspect(id,s[id]?.x,s[id]?.y).valid){n[id].x=s[id].x;n[id].y=s[id].y;}if(solved(s,id))n[id].proof={x:s[id].proof.x,y:s[id].proof.y};}n.departed=s.departed===true&&solved(n,'belt');return n;}
 const api={specs,inspect,fresh,solved,valid,restore};if(typeof module==='object')module.exports=api;root.AirportMath=api;
})(typeof window==='undefined'?globalThis:window);
