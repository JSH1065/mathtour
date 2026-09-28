(function(root){
  'use strict';
  const GOAL=[0,1,8,2,3,4,5,6,7],LABELS=['인','천','세','어','도','선','착','장',''];
  const START_TIME=18*3600+45*60+20,DURATION=170;
  function neighbors(board){const b=board.indexOf(8);return [b-3,b+3,b-1,b+1].filter(p=>p>=0&&p<9&&Math.abs(p%3-b%3)+Math.abs(Math.floor(p/3)-Math.floor(b/3))===1);}
  function move(board,p){if(!Number.isInteger(p)||!neighbors(board).includes(p))return null;const out=board.slice(),b=out.indexOf(8);[out[b],out[p]]=[out[p],out[b]];return out;}
  let INITIAL=GOAL.slice();for(const p of [1,0,3,4,7,6,3,4,1,2])INITIAL=move(INITIAL,p);
  const equal=(a,b)=>Array.isArray(a)&&a.length===9&&a.every((n,i)=>n===b[i]);
  function boardFrom(history){if(!Array.isArray(history)||history.length>1000)return null;let b=INITIAL.slice();for(const p of history){b=move(b,p);if(!b)return null;}return b;}
  function validPuzzle(p){const b=boardFrom(p?.moves);return !!b&&p.moves.length>0&&equal(b,GOAL);}
  const cache=new Map([[GOAL.join(''),null]]),queue=[GOAL];let head=0;
  function hint(board){
    const key=board.join('');if(key===GOAL.join(''))return null;
    while(!cache.has(key)&&head<queue.length){const current=queue[head++],blank=current.indexOf(8);for(const p of neighbors(current)){const next=move(current,p),k=next.join('');if(!cache.has(k)){cache.set(k,blank);queue.push(next);}}}
    return cache.get(key)??null;
  }
  function elapsed(actions){if(!Array.isArray(actions)||actions.length>60||!actions.every(n=>n===10||n===60))return null;const sum=actions.reduce((a,b)=>a+b,0);return sum<=600?sum:null;}
  const freshSunset=()=>({mode:'clock',hour:18,minute:40,second:0,confirmed:false,hints:0});
  function enteredTime(s){return s?.mode==='clock'&&s.hour===18&&Number.isInteger(s.minute)&&s.minute>=40&&s.minute<=55&&Number.isInteger(s.second)&&s.second>=0&&s.second<=59?18*3600+s.minute*60+s.second:null;}
  function validSunset(s){return s?.confirmed===true&&(s.mode==='clock'?enteredTime(s)===START_TIME+DURATION:!s.mode&&elapsed(s.actions)===DURATION);}
  function restoreSunset(s){
    if(enteredTime(s)!==null)return {...freshSunset(),minute:s.minute,second:s.second,confirmed:validSunset(s),hints:Number.isInteger(s.hints)?Math.max(0,Math.min(3,s.hints)):0};
    // Preserve completed records from the earlier elapsed-time version; new attempts use final-time entry.
    if(validSunset(s))return {...freshSunset(),minute:48,second:10,confirmed:true};
    return freshSunset();
  }
  function atmosphere(seconds){const t=Number.isFinite(seconds)?seconds:18*3600+40*60;const p=(t-START_TIME)/DURATION;const u=Math.max(0,Math.min(1,(t-(18*3600+40*60))/(START_TIME+DURATION-18*3600-40*60)));return {sunProgress:p,night:Math.pow(u,1.7),sunX:.30+.018*Math.max(-2,Math.min(2,p))};}
  function validCoast(s){return s?.version===1&&s.departed===true&&validPuzzle(s.puzzle)&&validSunset(s.sunset);}
  function timeParts(seconds){const t=((seconds%86400)+86400)%86400;return {hour:Math.floor(t/3600),minute:Math.floor(t/60)%60,second:t%60};}
  function clock(seconds){const t=timeParts(seconds);return `${t.hour>=12?'오후':'오전'} ${t.hour%12||12}시 ${String(t.minute).padStart(2,'0')}분 ${String(t.second).padStart(2,'0')}초`;}
  const api={GOAL,INITIAL,LABELS,START_TIME,DURATION,neighbors,move,equal,boardFrom,validPuzzle,hint,elapsed,freshSunset,enteredTime,restoreSunset,atmosphere,validSunset,validCoast,timeParts,clock};
  if(typeof module==='object')module.exports=api;root.CoastMath=api;
})(typeof window==='undefined'?globalThis:window);
