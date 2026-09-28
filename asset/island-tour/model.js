(function(root){
 'use strict';
 const mill=[60,90,120,90];
 const stairs=[{b:1,x:4,y:5,a:1},{b:2,x:3,y:8,a:2},{b:1,x:8,y:5,a:.5}];
 const coordinates=[{name:'분홍 구름',x:2,y:6},{name:'갈매기',x:6,y:8},{name:'노을빛',x:8,y:4}];
 const source={x:2,y:-10}, valves=[{x:6,y:-8},{x:4,y:-4},{x:8,y:0}];
 const obstacles=[{x:2.7,y:-7.5,w:1.8,h:1.5},{x:6.3,y:-5,w:2.5,h:1.7}];
 const eq=(a,b)=>Math.abs(a-b)<1e-7;
 const same=(a,b)=>!!a&&!!b&&eq(a.x,b.x)&&eq(a.y,b.y);
 function slope(p,q){return eq(p.x,q.x)?null:(q.y-p.y)/(q.x-p.x);}
 function hits(p,q,r){let lo=0,hi=1;for(const [d,s,min,max] of [[q.x-p.x,p.x,r.x,r.x+r.w],[q.y-p.y,p.y,r.y,r.y+r.h]]){if(eq(d,0)){if(s<min||s>max)return false;}else{const a=(min-s)/d,b=(max-s)/d;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return false;}}return true;}
 function inspectPipe(p,q,a){
  if(!p||!q||![p.x,p.y,q.x,q.y,a].every(Number.isFinite))return '먼저 격자점을 누르고 기울기를 골라요.';
  if(q.x<0||q.x>10||q.y< -10||q.y>0)return '격자 안의 지점을 골라요.';
  if(eq(p.x,q.x))return '이번에는 일차함수로 나타낼 수 있게 옆 칸으로도 이동해요.';
  if(!eq(slope(p,q),a))return '가로와 세로의 좌표 변화를 비교해 기울기를 다시 골라요.';
  if(obstacles.some(r=>hits(p,q,r)))return '바위에 닿았어요. 바위를 돌아가는 지점을 골라요.';
  return '';
 }
 function pipeProgress(points){let reached=0,p=source;for(const q of points||[]){if(inspectPipe(p,q,slope(p,q)))return -1;if(same(q,valves[reached]))reached++;p=q;if(reached===3)break;}return reached;}
 function fresh(){return {version:2,step:0,line:0,grain:{rules:3,actions:[],manual:false,loaded:false,turns:[],briefing:0},supply:{mode:'drill',legs:[]},spa:{rules:2,rounds:[],events:[],clock:0},departed:false};}
 function solved(s,id){
  if(s?.version===2)return playSolved(s,id);
  if(!s||s.version!==1)return false;
  if(id==='mill')return Array.isArray(s.mill)&&s.mill.length===4&&s.mill.every((n,i)=>n===mill[i]);
  if(id==='stairs')return Array.isArray(s.stairs)&&s.stairs.length===3&&s.stairs.every((n,i)=>n===stairs[i].a);
  if(id==='halo')return s.halo?.width===9&&s.halo?.height===12;
  if(id==='coords')return Array.isArray(s.coords)&&s.coords.length===3&&s.coords.every((q,i)=>same(q,coordinates[i]));
  if(id==='pipes')return Array.isArray(s.pipes)&&s.pipes.length<=6&&pipeProgress(s.pipes)===3&&same(s.pipes.at(-1),valves[2]);
  return false;
 }
 function valid(id,s){const keys=s?.version===2?(id==='bomunsa'?['grain']:id==='seokmodo'?['supply','spa']:[]):(id==='bomunsa'?['mill','stairs','halo']:id==='seokmodo'?['coords','pipes']:[]);return s?.departed===true&&keys.length>0&&keys.every(k=>solved(s,k));}
 function restore(s){const n=fresh();if(s?.version!==2)return n;n.grain=[2,3].includes(s.grain?.rules)?{rules:s.grain.rules,...(s.grain.rules===3?{actions:Array.isArray(s.grain.actions)?s.grain.actions.slice(0,500):[],briefing:Number.isInteger(s.grain.briefing)?Math.max(0,Math.min(6,s.grain.briefing)):s.grain.manual?6:0}:{}),manual:s.grain.manual===true,loaded:s.grain.loaded===true,turns:Array.isArray(s.grain.turns)?s.grain.turns.slice(0,5):[]}:{actions:Array.isArray(s.grain?.actions)?s.grain.actions.slice(0,500):[],rotation:s.grain?.rotation,delivered:s.grain?.delivered===true};n.supply=s.supply;n.spa={rules:s.spa?.rules===2?2:1,rounds:Array.isArray(s.spa?.rounds)?s.spa.rounds.slice(0,3):[],events:Array.isArray(s.spa?.events)?s.spa.events.slice(0,600):[],clock:Number.isFinite(s.spa?.clock)&&s.spa.clock>=0?s.spa.clock:0};n.departed=s.departed===true;n.step=Number.isInteger(s.step)&&s.step>=0?s.step:0;n.line=Number.isInteger(s.line)&&s.line>=0?s.line:0;return n;}
 function format(n){if(eq(n,Math.round(n)))return String(Math.round(n));for(let d=2;d<=10;d++)if(eq(n*d,Math.round(n*d)))return String(Math.round(n*d))+'/'+d;return Number(n.toFixed(2)).toString();}
 const drillStages=[{name:'C',x:4,y:-6},{name:'B',x:8,y:-4},{name:'A',x:6,y:-2}];
 function drillPlan(index,a,dir){
  if(!Number.isInteger(index)||index<0||index>=drillStages.length||![.5,1,2].includes(Math.abs(a))||![1,-1].includes(dir))return null;
  const from=index?drillStages[index-1]:source,target=drillStages[index],dx=Math.abs(target.x-from.x)*dir;
  const raw={x:from.x+dx,y:from.y+a*dx};let limit=1;
  for(const [v,d,lo,hi] of [[from.x,dx,0,10],[from.y,a*dx,-10,0]]){if(d>0)limit=Math.min(limit,(hi-v)/d);else if(d<0)limit=Math.min(limit,(lo-v)/d);}
  const to={x:from.x+dx*limit,y:from.y+a*dx*limit};
  return {from:{x:from.x,y:from.y},target,raw,to,correct:limit===1&&same(to,target),length:Math.hypot(to.x-from.x,to.y-from.y)};
 }
 function drillProgress(supply){if(supply?.mode!=='drill'||!Array.isArray(supply.legs)||supply.legs.length>3)return -1;for(let i=0;i<supply.legs.length;i++){const e=supply.legs[i];if(!drillPlan(i,e?.a,e?.dir)?.correct)return -1;}return supply.legs.length;}
 const grainCapacity=[3,5];
 // Each answer is one rotation, preserving Jang Eun-seong's original four problems.
 const millProblems=[
  {math:'3<i>x</i> = 180',speech:'3 곱하기 x는 180',answer:60,hint:'x가 3개 모여 180이에요. 양변을 3으로 나눠요.',working:'3<i>x</i> ÷ 3 = 180 ÷ 3 → <i>x</i> = 60'},
  {math:'2<i>x</i> + 30 = 210',speech:'2 곱하기 x 더하기 30은 210',answer:90,hint:'먼저 양변에서 30을 빼고, 남은 양변을 2로 나눠요.',working:'2<i>x</i> = 180 → <i>x</i> = 90'},
  {math:'<span class="mill-fraction"><span><i>x</i></span><span>2</span></span> = 60',speech:'x 나누기 2는 60',answer:120,hint:'x를 반으로 나누어 60이 됐어요. 양변에 2를 곱해요.',working:'<i>x</i> = 60 × 2 = 120'},
  {math:'360°의 <span class="mill-fraction"><span>1</span><span>4</span></span>',speech:'360도의 4분의 1',answer:90,hint:'한 바퀴 360°를 똑같이 4부분으로 나눠요.',working:'360° ÷ 4 = 90°'}
 ];
 function millProgress(g){if(!g||!Array.isArray(g.turns)||g.turns.length>millProblems.length)return -1;for(let i=0;i<g.turns.length;i++)if(g.turns[i]!==millProblems[i].answer)return -1;return g.turns.length;}
 function millTurn(g,angle){const i=millProgress(g);if(![2,3].includes(g?.rules)||(g.rules===3&&!grainReady(g))||g.manual!==true||g.loaded!==true||i<0||i>=millProblems.length||!Number.isFinite(angle)||angle!==millProblems[i].answer)return false;g.turns.push(angle);return true;}
 function grainMove(amounts,action){
  if(!Array.isArray(amounts)||amounts.length!==2||!amounts.every((v,i)=>Number.isInteger(v)&&v>=0&&v<=grainCapacity[i]))return null;
  const i=action?.i,j=1-i;if(i!==0&&i!==1)return null;const next=[...amounts];let moved=0;
  if(action.op==='fill'){moved=grainCapacity[i]-next[i];next[i]=grainCapacity[i];}
  else if(action.op==='return'){moved=next[i];next[i]=0;}
  else if(action.op==='pour'){moved=Math.min(next[i],grainCapacity[j]-next[j]);next[i]-=moved;next[j]+=moved;}
  else return null;
  return moved?{amounts:next,moved}:null;
 }
 function grainReplay(actions){if(!Array.isArray(actions)||actions.length>500)return null;let amounts=[0,0];for(const a of actions){const r=grainMove(amounts,a);if(!r)return null;amounts=r.amounts;}return amounts;}
 function grainReady(g){const amounts=grainReplay(g?.actions);return !!amounts&&amounts.includes(4);}
 function grainLoad(g){if(g?.rules!==3||g.loaded||!grainReady(g))return false;g.loaded=true;return true;}
 function grainHint(amounts){if(!amounts||amounts.includes(4))return [];const queue=[{amounts,path:[]}],seen=new Set([amounts.join(',')]);for(let at=0;at<queue.length;at++){const n=queue[at];for(const i of [0,1])for(const op of ['fill','pour','return']){const action={i,op},r=grainMove(n.amounts,action);if(!r)continue;const path=[...n.path,action];if(r.amounts.includes(4))return path;const key=r.amounts.join(',');if(!seen.has(key)){seen.add(key);queue.push({amounts:r.amounts,path});}}}return [];}
 const spaRounds=[
  {title:'첫 탕을 준비해요',lead:'한 탕에서 물높이와 밸브를 익혀요.',areas:[2],deadlines:[18],flow:1,budget:8},
  {title:'작은 탕, 넓은 탕',lead:'작은 탕 손님이 먼저 도착해요. 물을 나누면 어떻게 될까요?',areas:[2,4],deadlines:[7,20],flow:1.5,budget:21},
  {title:'노을이 지기 전에',lead:'세 탕의 도착 순서와 크기를 보고 물을 나눠요.',areas:[2,3,4],deadlines:[9,18,29],flow:1.5,budget:31}
 ];
 const poolNames=['솔바람탕','바다탕','노을탕'],SPA_LOW=2.8,SPA_HIGH=3.3,SPA_TARGET=3,SPA_MAX=4;
 function spaCreate(round){const c=spaRounds[round];if(!c)return null;return {round,time:0,volumes:c.areas.map(()=>0),open:c.areas.map(()=>false),done:c.areas.map(()=>false),readyAt:c.areas.map(()=>null),used:0,wasted:0,status:'playing',reason:''};}
 function spaAdvance(s,dt){if(!s||s.status!=='playing'||!Number.isFinite(dt)||dt<0)return s;const c=spaRounds[s.round];let d=dt;for(let i=0;i<c.areas.length;i++)if(!s.done[i])d=Math.min(d,Math.max(0,c.deadlines[i]-s.time));const active=s.open.filter(Boolean).length;if(active)d=Math.min(d,Math.max(0,(c.budget-s.used)/c.flow));
  if(active){const each=c.flow*d/active;for(let i=0;i<c.areas.length;i++)if(s.open[i]){const after=s.volumes[i]+each,max=c.areas[i]*SPA_MAX;s.wasted+=Math.max(0,after-max);s.volumes[i]=Math.min(max,after);}s.used+=c.flow*d;}
  s.time+=d;
  const late=c.deadlines.findIndex((deadline,i)=>!s.done[i]&&s.time>=deadline-1e-8);
  if(late!==-1){s.status='failed';s.reason=poolNames[late]+' 손님이 도착했어요. 이 탕을 먼저 준비해 볼까요?';s.open.fill(false);}
  else if(active&&s.used>=c.budget-1e-8){s.status='failed';s.reason='준비한 물을 모두 썼어요. 초록 구간에서 밸브를 잠그면 물을 아낄 수 있어요.';s.open.fill(false);}
  return s;
 }
 function spaOperate(s,op,i){if(!s||s.status!=='playing'||!Number.isInteger(i)||i<0||i>=s.volumes.length||s.done[i])return false;const c=spaRounds[s.round];
  if(op==='toggle'){s.open[i]=!s.open[i];}
  else if(op==='drain'){if(s.open[i]||s.volumes[i]<=0)return false;const amount=Math.min(s.volumes[i],c.areas[i]*.5);s.volumes[i]-=amount;s.wasted+=amount;}
  else return false;
  const height=s.volumes[i]/c.areas[i];if(!s.open[i]&&height>=SPA_LOW-1e-8&&height<=SPA_HIGH+1e-8){s.done[i]=true;s.readyAt[i]=s.time;}
  if(s.done.every(Boolean))s.status='won';return true;
 }
 function spaReplay(round,events){const s=spaCreate(round);if(!s||!Array.isArray(events)||events.length>600)return null;for(const e of events){if(!e||!Number.isFinite(e.t)||e.t<s.time-1e-8||s.status!=='playing')return null;spaAdvance(s,Math.max(0,e.t-s.time));if(!spaOperate(s,e.op,e.i))return null;}return s;}
 // Current bath model uses L, m² and cm. One cm over one m² is 10 L.
 // Keep the original replay above so existing chapter completion stays valid.
 const bathRounds=[
  {title:'600 L로 첫 연습',lead:'목표 물의 양을 공급 속도로 나누면 필요한 시간을 알 수 있어요.',areas:[2],deadlines:[15],flow:100,caps:[100],budget:760},
  {title:'큰 탕도 미리 준비해요',lead:'큰 탕의 배관은 최대 40 L/초예요. 작은 탕을 끝내고 시작해도 될까요?',areas:[2,4],deadlines:[9,32],flow:120,caps:[100,40],budget:2000},
  {title:'어느 두 탕부터 열까요?',lead:'모두 열면 첫 손님을 놓쳐요. 오래 걸리는 탕과 먼저 준비할 탕을 함께 생각해요.',areas:[2,3,4],deadlines:[8,17,32],flow:150,caps:[100,100,40],budget:3000}
 ];
 const BATH_LOW=28,BATH_HIGH=33,BATH_TARGET=30,BATH_MAX=40;
 function bathHeight(s,i){return s.volumes[i]/(bathRounds[s.round].areas[i]*10);}
 function bathCreate(round){const c=bathRounds[round];return c?{round,time:0,volumes:c.areas.map(()=>0),open:c.areas.map(()=>false),done:c.areas.map(()=>false),readyAt:c.areas.map(()=>null),used:0,wasted:0,status:'playing',reason:''}:null;}
 function bathRates(s){const c=bathRounds[s.round],rates=c.areas.map(()=>0);let available=c.flow,open=s.open.map((v,i)=>v&&!s.done[i]?i:-1).filter(i=>i>=0);while(open.length){const share=available/open.length,limited=open.filter(i=>c.caps[i]<=share);if(!limited.length){open.forEach(i=>rates[i]=share);break;}limited.forEach(i=>{rates[i]=c.caps[i];available-=rates[i];});open=open.filter(i=>!limited.includes(i));}return rates;}
 function bathAdvance(s,dt){if(!s||s.status!=='playing'||!Number.isFinite(dt)||dt<0)return s;const c=bathRounds[s.round],rates=bathRates(s),total=rates.reduce((v,r)=>v+r,0);let d=dt;for(let i=0;i<c.areas.length;i++)if(!s.done[i])d=Math.min(d,Math.max(0,c.deadlines[i]-s.time));if(total)d=Math.min(d,Math.max(0,(c.budget-s.used)/total));
  rates.forEach((rate,i)=>{const after=s.volumes[i]+rate*d,max=c.areas[i]*10*BATH_MAX;s.wasted+=Math.max(0,after-max);s.volumes[i]=Math.min(max,after);});s.used+=total*d;s.time+=d;
  const late=c.deadlines.findIndex((deadline,i)=>!s.done[i]&&s.time>=deadline-1e-8);
  if(late!==-1){s.status='failed';s.reason=poolNames[late]+' 손님이 도착했어요. 물의 양 ÷ 공급 속도로 걸리는 시간을 비교해 봐요.';s.open.fill(false);}
  else if(total&&s.used>=c.budget-1e-8){s.status='failed';s.reason='준비한 물을 모두 썼어요. 초록 구간에서 잠그고 넘치는 물을 줄여 봐요.';s.open.fill(false);}return s;
 }
 function bathOperate(s,op,i){if(!s||s.status!=='playing'||!Number.isInteger(i)||i<0||i>=s.volumes.length||s.done[i])return false;const c=bathRounds[s.round];if(op==='toggle')s.open[i]=!s.open[i];else if(op==='drain'){if(s.open[i]||s.volumes[i]<=0)return false;const amount=Math.min(s.volumes[i],c.areas[i]*10*5);s.volumes[i]-=amount;s.wasted+=amount;}else return false;
  const h=bathHeight(s,i);if(!s.open[i]&&h>=BATH_LOW-1e-8&&h<=BATH_HIGH+1e-8){s.done[i]=true;s.readyAt[i]=s.time;}if(s.done.every(Boolean))s.status='won';return true;
 }
 function bathReplay(round,events){const s=bathCreate(round);if(!s||!Array.isArray(events)||events.length>600)return null;for(const e of events){if(!e||!Number.isFinite(e.t)||e.t<s.time-1e-8||s.status!=='playing')return null;bathAdvance(s,Math.max(0,e.t-s.time));if(!bathOperate(s,e.op,e.i))return null;}return s;}
 function playSolved(s,id){
  if(id==='grain'){if([2,3].includes(s.grain?.rules))return (s.grain.rules===2||grainReady(s.grain))&&s.grain.manual===true&&s.grain.loaded===true&&millProgress(s.grain)===millProblems.length;const a=grainReplay(s.grain?.actions);return !!a&&a.includes(4)&&s.grain.delivered===true&&s.grain.rotation===60;}
  if(id==='supply')return s.supply?.mode==='drill'?drillProgress(s.supply)===3:s.supply?.x===6&&s.supply?.y===-2&&s.supply?.a===2;
  if(id==='spa')return Array.isArray(s.spa?.rounds)&&s.spa.rounds.length===3&&s.spa.rounds.every((events,i)=>(s.spa.rules===2?bathReplay:spaReplay)(i,events)?.status==='won');
  return false;
 }
 const api={mill,stairs,coordinates,source,valves,obstacles,eq,same,slope,hits,inspectPipe,pipeProgress,drillStages,drillPlan,drillProgress,fresh,solved,valid,restore,format,millProblems,millProgress,millTurn,grainCapacity,grainMove,grainReplay,grainReady,grainLoad,grainHint,spaRounds,poolNames,SPA_LOW,SPA_HIGH,SPA_TARGET,SPA_MAX,spaCreate,spaAdvance,spaOperate,spaReplay,bathRounds,BATH_LOW,BATH_HIGH,BATH_TARGET,BATH_MAX,bathHeight,bathCreate,bathRates,bathAdvance,bathOperate,bathReplay};
 if(typeof module==='object')module.exports=api;root.IslandMath=api;
})(typeof window==='undefined'?globalThis:window);
