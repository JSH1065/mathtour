(function(root){
 'use strict';
 const M=root.IslandMath,$=id=>document.getElementById(id);
 const colors=['#e4ad61','#83b8ab','#85a8c8','#c897b2'];
 const point=(r,a)=>[300+r*Math.sin(a*Math.PI/180),260-r*Math.cos(a*Math.PI/180)];
 function arc(start,end,r){const a=point(r,start),b=point(r,end);return 'M'+a.join(' ')+' A'+r+' '+r+' 0 '+(end-start>180?1:0)+' 1 '+b.join(' ');}
 function millArt(total,turns,loaded){
  let marks='',grooves='',traces='';
  for(let a=0;a<360;a+=15){const p=point(199,a),q=point(a%90?205:212,a);marks+='<path d="M'+p.join(' ')+'L'+q.join(' ')+'" stroke="#fae5b2" stroke-width="'+(a%90?2:4)+'"/>';}
  for(let a=0;a<360;a+=30)grooves+='<path d="M313 112q-25 32-13 64q12 28 0 48" transform="rotate('+a+' 300 260)" fill="none" stroke="#343d34" stroke-width="3" opacity=".5"/>';
  let sum=0;turns.forEach((v,i)=>{traces+='<path d="'+arc(sum+1,sum+v-1,219)+'" fill="none" stroke="'+colors[i]+'" stroke-width="11" stroke-linecap="round"/>';sum+=v;});
  return '<svg viewBox="0 0 600 510" role="img" aria-label="위에서 본 맷돌, 지금까지 '+total+'도 회전"><defs><radialGradient id="stone"><stop stop-color="#c3bca4"/><stop offset=".6" stop-color="#909785"/><stop offset="1" stop-color="#576859"/></radialGradient><pattern id="stoneGrain" width="21" height="19" patternUnits="userSpaceOnUse"><circle cx="3" cy="5" r="1.4" fill="#e5dbc0"/><circle cx="14" cy="12" r="1" fill="#253c34"/><path d="M4 14l4 2" stroke="#495b4d"/></pattern><linearGradient id="handleWood"><stop stop-color="#75492d"/><stop offset=".5" stop-color="#e2b277"/><stop offset="1" stop-color="#905c38"/></linearGradient></defs><ellipse cx="300" cy="279" rx="194" ry="191" fill="#2b261ddd"/><circle cx="300" cy="270" r="182" fill="#596657" stroke="#cec4a2" stroke-width="8"/><circle cx="300" cy="260" r="174" fill="url(#stone)" stroke="#d2c4a4" stroke-width="5"/><g id="millRotor" transform="rotate('+total+' 300 260)"><circle cx="300" cy="260" r="168" fill="url(#stoneGrain)" opacity=".65"/>'+grooves+'<path d="M300 130V101" stroke="#e2b98b" stroke-width="17" stroke-linecap="round"/><rect x="285" y="102" width="30" height="66" rx="13" fill="url(#handleWood)" stroke="#543b2e" stroke-width="3"/><ellipse cx="300" cy="103" rx="15" ry="7" fill="#ecd2a3"/><circle cx="300" cy="157" r="6" fill="#ffe099"/></g><circle cx="300" cy="260" r="28" fill="#2e3e32" stroke="#c8b688" stroke-width="6"/>'+(loaded?'<g fill="#eacc86"><ellipse cx="291" cy="255" rx="5" ry="2"/><ellipse cx="308" cy="259" rx="5" ry="2" transform="rotate(45 308 259)"/><ellipse cx="299" cy="270" rx="5" ry="2"/><ellipse cx="300" cy="248" rx="5" ry="2"/></g>':'')+marks+traces+'<path d="M300 26l-9 15h18Z" fill="#ffdfa2"/><text x="300" y="18" text-anchor="middle" font-size="15" fill="#fff5d7">처음 위치 · 0° / 360°</text><path d="M490 93q27 24 30 56m-11-10l11 10 9-12" fill="none" stroke="#ffe8b8" stroke-width="3"/><text x="521" y="181" text-anchor="middle" font-size="13" fill="#fff5d7">시계 방향</text></svg>';
 }
 root.IslandMill={mount({state,persist,feedback,tone,next,checkRun}){
  const board=$('board'),controls=$('controls'),confirm=$('confirm'),layout=board.parentElement,game=$('game');
  if(state.grain.rules!==3||M.millProgress(state.grain)<0||!M.grainReplay(state.grain.actions)){const actions=M.grainReplay(state.grain.actions)?state.grain.actions:[];state.grain={rules:3,actions,manual:false,loaded:false,turns:[],briefing:0};persist();}
  if(state.grain.loaded&&!M.grainReady(state.grain)){state.grain.loaded=false;state.grain.manual=false;state.grain.turns=[];persist();}
  const g=state.grain;let selected=1,digits='',busy=false,disposed=false,frame=0,animation=null,paused=false,story=null;
  game.classList.add('mill-mode');layout.dataset.play='mill';
  const total=()=>g.turns.reduce((a,b)=>a+b,0);
  const bind=(id,fn)=>{$(id).onclick=()=>{if(!disposed&&!busy&&checkRun())fn();};};
  function primary(text,fn,disabled=false){confirm.textContent=text;confirm.disabled=disabled;confirm.onclick=()=>{if(!disposed&&!busy&&checkRun())fn();};}
  function render(){
   story?.destroy();story=null;
   if(!g.loaded){renderGrain();return;}
   if(!g.manual){story=root.IslandMillStory.mount({game,grain:g,persist,checkRun,done:render});return;}
   game.classList.add('mill-mode');layout.dataset.play='mill';$('gameTitle').textContent='사용법을 따라, 맷돌 한 바퀴';
   const index=g.turns.length,won=M.solved(state,'grain');
   board.className='board mill-scene';board.style.backgroundImage="url('asset/island-tour/granary-v2.webp')";
   board.innerHTML='<div class="mill-scene-shade"></div><div class="mill-caption"><span>'+(g.manual?'✓ 사용법 획득':'보문사 맷돌 사용법')+'</span><strong id="millTotal">'+total()+'° / 360°</strong></div><div class="mill-drawing">'+millArt(total(),g.turns,g.loaded)+'</div><div class="mill-turn-log">'+[0,1,2,3].map(i=>'<span style="--turn-color:'+colors[i]+'" class="'+(i<index?'done':'')+'">'+(i<index?g.turns[i]+'°':(i+1)+'번째')+'</span>').join('')+'</div><div class="scene-caption">실제 맷돌에서 착안한 체험 · 네 번의 회전으로 수학의 빛 찾기</div>';
   if(won){board.classList.add('mill-restored');controls.innerHTML='<div class="play-win"><span class="win-symbol">✦</span><h2>한 바퀴, 피어나는 빛</h2><p>60° + 90° + 120° + 90°<br><b>= 360°</b></p><p>방정식의 해를 회전각으로 바꾸어 처음 위치로 돌아왔어요.</p><small>장은성 학생 원안 · 네 번의 회전</small></div>';primary('다음 이야기 →',next);feedback('맷돌이 한 바퀴 돌았어요. 공양간에서 수학의 빛을 찾았습니다.','good');return;}
   const p=M.millProblems[index];
   controls.innerHTML='<div class="mill-question-heading"><small>사용법 '+(index+1)+' / 4</small><button id="millHint">풀이 힌트</button></div><div class="mill-equation mill-math" role="math" aria-label="'+p.speech+'">'+p.math+'</div><div class="mill-question-text">'+(index<3?'<i>x</i>를 구하면 이번 회전각이에요.':'한 바퀴의 4분의 1만큼 돌려요.')+'</div><div class="mill-answer"><span>이번 회전각</span><output id="millInput" aria-label="입력한 회전각">?</output><b>°</b></div><div class="mill-keypad">'+['1','2','3','4','5','6','7','8','9','지우기','0','⌫'].map(k=>'<button data-digit="'+k+'"'+(k==='⌫'?' aria-label="마지막 숫자 지우기"':'')+'>'+k+'</button>').join('')+'</div><p class="mill-single-turn">구한 각도만큼 <b>한 번</b> 돌려요.</p>';
   controls.querySelectorAll('[data-digit]').forEach(b=>b.onclick=()=>{if(!busy&&checkRun())input(b.dataset.digit);});
   bind('millHint',()=>feedback(p.hint));primary('입력한 각도로 돌리기',submit,true);
  }
  function renderGrain(){
   game.classList.remove('mill-mode');layout.dataset.play='grain';$('gameTitle').textContent='맷돌에 넣을 곡식, 정확히 4칸!';
   const again=()=>{persist();render();},safe=fn=>(...args)=>{if(!disposed&&checkRun())fn(...args);};
   root.IslandGrain.render({g,selected,board,controls,
    choose:safe(i=>{selected=i;render();feedback(M.grainCapacity[i]+'칸 통을 골랐어요. 할 행동을 눌러요.');}),
    act:safe(op=>{const a={i:selected,op},before=M.grainReplay(g.actions),r=M.grainMove(before,a);if(!r)return;g.actions.push(a);again();tone();board.classList.remove('grain-pouring');void board.offsetWidth;board.classList.add('grain-pouring');feedback(M.grainReady(g)?'정확히 4칸이 남았어요! 맷돌에 넣고 사용법을 살펴봐요.':op==='pour'?r.moved+'칸을 옮겼어요. 두 통에 각각 '+r.amounts[0]+'칸, '+r.amounts[1]+'칸이 있어요.':op==='fill'?M.grainCapacity[selected]+'칸을 가득 채웠어요.':'곡식을 자루에 돌려놓았어요.',M.grainReady(g)?'good':'');}),
    undo:safe(()=>{g.actions.pop();again();feedback('한 행동을 되돌렸어요. 다른 방법도 생각해 봐요.');}),
    hint:safe(()=>{const a=M.grainHint(M.grainReplay(g.actions))[0];feedback(a?M.grainCapacity[a.i]+'칸 통을 '+(a.op==='fill'?'가득 채워 보세요.':a.op==='return'?'비워 자루에 돌려놓아 보세요.':'골라 다른 통에 끝까지 부어 보세요.'):'4칸이 준비됐어요. 맷돌에 넣어 주세요.');})
   });
   primary(M.grainReady(g)?'4칸을 맷돌에 넣기':'한 통에 4칸을 만들어 주세요',()=>{if(!M.grainLoad(g))return;persist();tone();render();},!M.grainReady(g));
   feedback('3칸 통과 5칸 통으로 한 통에 정확히 4칸을 남겨요. 그다음 맷돌 사용법을 얻을 수 있어요.');
  }
  function input(k){if(k==='지우기')digits='';else if(k==='⌫')digits=digits.slice(0,-1);else if(digits.length<3)digits=(digits==='0'?'':digits)+k;$('millInput').textContent=digits||'?';confirm.disabled=!digits;}
  function submit(){
   if(!digits)return;const index=g.turns.length,p=M.millProblems[index],answer=Number(digits),from=total();
   if(!M.millTurn(g,answer)){tone(false);const check=index===0?'3 × '+answer+' = '+(3*answer):index===1?'2 × '+answer+' + 30 = '+(2*answer+30):index===2?answer+' ÷ 2 = '+answer/2:answer+' × 4 = '+answer*4;feedback(check+'. '+(index===3?'360°가 되도록':('오른쪽 '+[180,210,60][index]+'과 같도록'))+' 다시 생각해 봐요.','bad');return;}
   busy=true;persist();tone();controls.querySelectorAll('button').forEach(b=>b.disabled=true);confirm.disabled=true;confirm.textContent=answer+'° 회전 중…';
   feedback('정답! 이번에는 '+answer+'°만 한 번 돌려요. '+from+'° + '+answer+'° = '+total()+'°','good');
   animation={from,to:total(),elapsed:0,last:0,duration:1100+answer*3,index};paused=false;frame=requestAnimationFrame(tick);
  }
  function tick(ts){
   if(disposed||!animation)return;if(paused||document.querySelector('dialog[open]')){animation.last=0;frame=requestAnimationFrame(tick);return;}
   if(animation.last)animation.elapsed+=Math.min(ts-animation.last,80);animation.last=ts;
   const p=Math.min(1,animation.elapsed/animation.duration),ease=1-(1-p)**3,value=animation.from+(animation.to-animation.from)*ease;
   $('millRotor').setAttribute('transform','rotate('+value+' 300 260)');$('millTotal').textContent=Math.round(value)+'° / 360°';
   if(p<1){frame=requestAnimationFrame(tick);return;}
   const index=animation.index;animation=null;busy=false;digits='';render();
   const worked=document.createElement('span');worked.className='mill-math';worked.innerHTML=M.millProblems[index].working;
   feedback(worked.textContent+' → '+g.turns[index]+'° 회전 완료. '+(g.turns.length===4?'한 바퀴 360°를 완성했어요!':'다음 식의 회전각을 찾아요.'),'good');
  }
  function key(e){if(disposed||busy||!g.loaded||!g.manual||M.solved(state,'grain')||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||!checkRun())return;if(/^\d$/.test(e.key)){e.preventDefault();input(e.key);}else if(e.key==='Backspace'){e.preventDefault();input('⌫');}else if(e.key==='Delete'){e.preventDefault();input('지우기');}else if(e.key==='Enter'&&digits){e.preventDefault();submit();}}
  function pause(){paused=true;}
  const resume=()=>{if(!document.hidden&&!document.querySelector('dialog[open]'))paused=false;};
  const observer=new MutationObserver(resume);observer.observe(document.body,{attributes:true,attributeFilter:['open'],subtree:true});
  document.addEventListener('keydown',key);document.addEventListener('visibilitychange',resume);window.addEventListener('focus',resume);
  render();if(g.loaded&&g.manual&&!M.solved(state,'grain'))feedback('수첩의 식을 풀어 이번 회전각을 입력해요. 앞에서 멈춘 위치부터 이어서 돌아갑니다.');
  return {pause,destroy(){disposed=true;story?.destroy();story=null;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',resume);window.removeEventListener('focus',resume);confirm.onclick=null;game.classList.remove('mill-mode');layout.removeAttribute('data-play');board.style.backgroundImage='';}};
 }};
})(window);
