(function(root){
 'use strict';
 const M=root.NamdongMath,A='asset/namdong-tour/';
 const bridge=[
  ['민우','네 번의 기록을 더해 4로 나누니, 오늘은 평균 13초 동안 주변을 살폈어!'],
  ['서연','사육사님, 어제의 관찰 기록을 가져왔어요! 평균 15초라고 되어 있어. 그럼 어제 주변을 더 많이 살핀 거네?'],
  ['사육사','관찰한 전체 시간이 서로 다르단다. 오늘은 한 번에 20초, 어제는 25초씩 관찰했어. 전체 시간 중 얼마나 살폈는지 비교해 볼까?'],
  ['민우','어제는 관찰 시간도 더 길었네요. 평균 시간만 보고 판단하면 안 되겠어요.'],
  ['서연','오늘은 20초 중 평균 13초, 어제는 25초 중 평균 15초! 전체에서 차지하는 비율을 비교하면 되겠네.'],
  ['사육사','맞아. 각 기록을 한 번 관찰할 때를 기준으로 정리했어. 전체를 각각 100%로 놓고, 같은 길이의 띠그래프로 나타내 보자.']
 ];
 const graphLesson={title:'사육사의 한마디 · 비율과 띠그래프',math:'백분율 = 평균 주변 살피기 시간 ÷ 1회 관찰 시간 × 100',text:'오늘은 매번 20초, 어제는 매번 25초씩 관찰했어. 한 번 관찰할 때를 기준으로, 평균 주변 살피기 시간이 차지하는 비율을 비교하자.',how:'두 띠의 길이는 같아. 각 띠의 전체는 1회 관찰 시간, 색칠한 부분은 평균 주변 살피기 시간을 나타내. 손잡이나 ＋ · − 버튼으로 채워 보렴.',note:'계산이 필요하면 옆의 간단 계산기를 펼쳐 사용할 수 있어요.'};
 function mount(c){
  const {state,board,controls,confirm}=c;
  const z=state.zoo=M.restoreZoo(state.zoo),$=id=>document.getElementById(id);
  let running=false,frame=0,last=0,lastSaved=-1,destroyed=false;
  let boostPointer=null,boostKey=null,boundary=-1;
  const calculator={expression:'',result:'',open:false};
  const phase=()=>z.records.length<4?'observe':z.average!==13?'average':!z.bridgeDone?'bridge':!z.briefed?'brief':!z.graphsChecked?'graphs':!z.comparison?'compare':'complete';
  function heading(k,title){$('gameEyebrow').textContent=k;$('gameTitle').textContent=title;}
  function save(){return !destroyed&&c.persist();}
  const boosting=()=>running&&(boostPointer!==null||boostKey!==null);
  function paintSpeed(){
   const fast=boosting(),button=$('observationFast');
   if(!button)return;
   button.disabled=!running;button.setAttribute('aria-pressed',String(fast));
   button.querySelector('small').textContent=fast?'손을 떼면 1배속':'누르는 동안 2배속';
   $('watchSpeed').textContent=fast?'2배속':'1배속';
   board.classList.toggle('zoo-fast',fast);
  }
  function releaseBoost(){
   const pointer=boostPointer,button=$('observationFast');boostPointer=null;boostKey=null;
   if(pointer!==null&&button?.hasPointerCapture(pointer))button.releasePointerCapture(pointer);
   paintSpeed();
  }
  function stop(){running=false;cancelAnimationFrame(frame);last=0;releaseBoost();}
  function pause(){if(running){stop();if($('observationPlay')){$('observationPlay').textContent='이어서 관찰';$('observationPlay').setAttribute('aria-pressed','false');}if($('watchState'))$('watchState').textContent='일시 정지';save();}}
  function releaseKey(e){if(e.key===boostKey){boostKey=null;paintSpeed();}}
  function hidden(){if(document.hidden)pause();}
  root.addEventListener('blur',pause);
  root.addEventListener('keyup',releaseKey);
  document.addEventListener('visibilitychange',hidden);
  function bindFastButton(){
   const button=$('observationFast');
   button.onpointerdown=e=>{
    if(e.button!==0||e.isPrimary===false||boostPointer!==null||!running||!c.checkRun()||document.hidden)return;
    e.preventDefault();button.focus({preventScroll:true});boostPointer=e.pointerId;
    button.setPointerCapture(e.pointerId);paintSpeed();
   };
   const releasePointer=e=>{if(e.pointerId===boostPointer){boostPointer=null;if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);paintSpeed();}};
   button.onpointerup=releasePointer;button.onpointercancel=releasePointer;button.onlostpointercapture=releasePointer;
   button.onkeydown=e=>{
    if(e.key!==' '&&e.key!=='Enter')return;
    e.preventDefault();if(e.repeat||!running||!c.checkRun()||document.hidden)return;
    boostKey=e.key;paintSpeed();
   };
   button.onkeyup=releaseKey;button.onblur=releaseBoost;
   button.onclick=e=>e.preventDefault();button.oncontextmenu=e=>e.preventDefault();
  }
  function table(values,caption){return `<table class="zoo-record"><caption>${caption}</caption><thead><tr><th scope="col">관찰</th><th scope="col">주변을 살핀 시간</th></tr></thead><tbody>${[0,1,2,3].map(i=>`<tr class="${i===values.length?'current':''}"><th scope="row">${i+1}회</th><td>${values[i]!==undefined?`<strong>${values[i]}</strong> 초`:'<span class="empty-record">—</span>'}</td></tr>`).join('')}</tbody></table>`;}
  function keeper(text){return `<div class="zoo-keeper-note"><img src="${A}keeper.svg" alt="사육사"><p><b>사육사</b>${text}</p></div>`;}
  function focusQuestion(){requestAnimationFrame(()=>{if(!destroyed)$('zooAnswer')?.focus({preventScroll:true});});}
  function form(label){return `<form id="zooForm" class="zoo-answer"><label for="zooAnswer">${label}</label><div><input id="zooAnswer" type="text" inputmode="decimal" autocomplete="off" maxlength="6" aria-describedby="feedback"><span>초</span></div></form>`;}
  function bindForm(){if($('zooForm'))$('zooForm').onsubmit=e=>{e.preventDefault();confirm.click();};}
  function draw(){
   stop();board.className='board zoo-board';controls.className='zoo-controls';$('game').dataset.zooPhase=phase();
   confirm.hidden=false;confirm.disabled=false;confirm.onclick=submit;controls.hidden=phase()==='bridge';$('help').hidden=phase()==='bridge';
   if(phase()==='observe')drawObservation();
   else if(phase()==='average')drawAverage();
   else if(phase()==='bridge')drawBridge();
   else if(phase()==='brief')drawBrief();
   else if(phase()==='graphs'||phase()==='compare')drawGraphs();
   else drawComplete();
   if(['average','graphs'].includes(phase()))root.NamdongCalculator.mount(controls,calculator);
  }
  function drawObservation(){
   const trial=z.records.length,finished=z.watched[trial]===true;
   boundary=-1;
   heading('MISSION 01 · 행동 관찰 기록',`${trial+1}회 · 주변을 살핀 시간을 기록해요`);
   board.innerHTML=`<div class="zoo-observation-head"><span><b>${trial+1}</b> / 4회</span><div class="zoo-clock" aria-label="관찰 영상 속 시간"><small>관찰 영상 속 시간</small><output id="watchClock">0</output><span> / 20초</span></div><div class="zoo-watch-status"><span id="watchSpeed" role="status">1배속</span><span id="watchState">관찰 준비</span></div></div><div class="zoo-habitat"><div class="zoo-behavior" id="behaviorLabel">미어캣을 살펴보세요</div><img id="movingMeerkat" src="${A}meerkat-walk.svg" alt="걷는 미어캣"><div class="zoo-start-mark" id="watchMarker" role="status" hidden></div><small>학습용 행동 장면</small></div><div class="zoo-watch-tools"><button id="observationPlay" class="primary" aria-pressed="false">${z.elapsed>0?'이어서 관찰':'관찰 시작 ▶'}</button><button id="observationFast" aria-pressed="false" aria-describedby="watchFastHint" disabled><span>⏩ 빠르게 관찰</span><small>누르는 동안 2배속</small></button><button id="observationReplay">처음부터 다시 보기 ↺</button><small id="watchFastHint">기록은 화면 속 시계로 해요.</small></div>`;
   controls.innerHTML=table(z.records,'나의 관찰 기록지')+form(`${trial+1}회 · 주변을 살핀 시간`);
   $('observationReplay').onclick=()=>{if(!c.checkRun())return;stop();z.elapsed=0;z.watched=z.watched.slice(0,trial);save();drawObservation();confirm.disabled=true;c.feedback('같은 장면을 다시 볼 수 있어요.');};
   $('observationPlay').onclick=()=>{
    if(!c.checkRun()||document.hidden)return;
    if(running){pause();return;}
    if(z.watched[trial])return;
    running=true;last=0;$('observationPlay').textContent='일시 정지 Ⅱ';$('observationPlay').setAttribute('aria-pressed','true');paintSpeed();c.feedback('화면 속 시계로 기록해요. 빠르게 관찰 버튼을 꾹 누르면 2배속, 손을 떼면 1배속이에요.');frame=requestAnimationFrame(tick);
   };
   $('zooAnswer').disabled=!finished;confirm.disabled=!finished;confirm.textContent='기록 확인';
   if(finished){z.elapsed=20;$('observationPlay').disabled=true;$('observationPlay').textContent='관찰 완료';c.feedback('주변을 살핀 시간을 기록지에 적어 보세요.');}
   else c.feedback('관찰은 한 번에 20초예요. 주변을 살피기 시작할 때와 멈출 때의 시각을 보세요.');
   bindFastButton();paintObservation();paintSpeed();bindForm();
  }
  function paintObservation(){
   const trial=z.records.length;if(trial>=4||!$('movingMeerkat'))return;
   const {start,end}=M.observations[trial],t=z.elapsed,looking=t>=start&&t<end,finished=t>=20;
   const animal=$('movingMeerkat');
   const src=A+(looking?'meerkat-look.svg':'meerkat-walk.svg');if(animal.getAttribute('src')!==src)animal.src=src;
   animal.alt=looking?'두 발로 서서 주변을 살피는 미어캣':'네 발로 걷는 미어캣';
   animal.classList.toggle('looking',looking);
   // Activity boundaries and the integer timer share the same simulation clock.
   const direction=t<start?1:t>=end?-1:Math.sin((t-start)*1.1)>=0?1:-1;
   const x=t<start?22+28*(t/start):t>=end?50-25*((t-end)/(20-end)):50;
   animal.style.left=x+'%';animal.style.transform=`translateX(-50%) scaleX(${direction}) rotate(${looking?Math.sin(t*2)*1.5:Math.sin(t*9)*2}deg)`;
   $('watchClock').textContent=Math.min(20,Math.floor(t+1e-7));
   $('watchState').textContent=finished?'관찰 완료':running?'관찰 중':t>0?'일시 정지':'관찰 준비';
   const label=$('behaviorLabel');label.textContent=finished?'20초 관찰 완료':looking?'주변을 살피는 중':'걷는 중';label.classList.toggle('is-looking',looking);
   const marker=$('watchMarker'),markText=t>=end?`${start}초에 시작 → ${end}초에 멈춤`:`${start}초에 주변 살피기 시작`;
   marker.hidden=t<start;if(marker.textContent!==markText)marker.textContent=markText;
   const nextBoundary=t>=end?2:t>=start?1:0;
   if(nextBoundary!==boundary){
    if(boundary>=0&&nextBoundary>boundary){
     const clock=$('watchClock').closest('.zoo-clock');clock.classList.remove('zoo-time-cue');marker.classList.remove('zoo-time-cue');
     void clock.offsetWidth;clock.classList.add('zoo-time-cue');marker.classList.add('zoo-time-cue');
    }
    boundary=nextBoundary;
   }
  }
  function tick(now){
   if(!running||destroyed)return;
   if(!last)last=now;
   z.elapsed=Math.min(20,z.elapsed+Math.min(.1,Math.max(0,(now-last)/1000))*(boosting()?2:1));last=now;
   if(z.elapsed>=20){z.elapsed=20;z.watched[z.records.length]=true;stop();save();drawObservation();c.tone();focusQuestion();return;}
   paintObservation();
   const sec=Math.floor(z.elapsed);if(sec!==lastSaved){lastSaved=sec;save();if(destroyed||!running)return;}
   frame=requestAnimationFrame(tick);
  }
  function drawAverage(){
   heading('MISSION 01 · 기록에서 평균으로','한 번 관찰할 때, 평균 몇 초일까요?');
   board.innerHTML=`<div class="zoo-notebook-large"><div class="zoo-notebook-title"><span>오늘의 관찰 기록</span><small>1회 관찰 시간 · 매번 20초</small></div>${table(z.records,'미어캣이 주변을 살핀 시간')}<div class="zoo-notebook-sum">네 번의 기록을 모았어요 <span>✓ ✓ ✓ ✓</span></div></div>`;
   controls.innerHTML=keeper('기록한 시간을 모두 더한 뒤, 관찰한 횟수로 나누면 평균을 알 수 있단다.')+`<h2 class="zoo-question">한 번 관찰할 때 평균 몇 초 동안 주변을 살폈을까요?</h2>`+form('평균 시간');
   confirm.textContent='평균 확인';c.feedback('네 번의 관찰 기록을 이용해 평균을 구해 보세요.');bindForm();focusQuestion();
  }
  function drawBridge(){
   heading('STORY · 서연이 가져온 관찰 기록','어제는 주변을 더 많이 살폈을까?');
   const line=Math.min(z.bridgeLine||0,bridge.length-1),[who,text]=bridge[line];
   board.innerHTML=`<div class="zoo-bridge"><div class="zoo-other-record"><small>서연이 가져온 어제 기록</small><span>1회 관찰 <b>25초</b></span><span>평균 주변 살피기 <b>15초</b></span></div><img class="bridge-person bridge-minwoo ${who==='민우'?'speaking':''}" src="asset/민우.svg" alt="민우"><img class="bridge-person bridge-keeper ${who==='사육사'?'speaking':''}" src="${A}keeper.svg" alt="사육사"><img class="bridge-person bridge-seoyeon ${who==='서연'?'speaking':''}" src="asset/서연.svg" alt="어제의 관찰 기록을 가져온 서연"><article class="zoo-bridge-dialogue"><header><strong>${who}</strong><small>${line+1} / ${bridge.length}</small></header><p id="zooBridgeText" aria-live="polite">${text}</p><footer><button id="zooStoryPrev" ${line===0?'disabled':''}>← 이전 대사</button><button id="zooStoryNext" class="primary">${line===bridge.length-1?'비율 알아보기 →':'다음 →'}</button></footer></article></div>`;
   controls.replaceChildren();confirm.hidden=true;
   $('zooStoryPrev').onclick=()=>{if(!c.checkRun()||z.bridgeLine===0)return;z.bridgeLine--;save();drawBridge();$('zooStoryPrev').focus({preventScroll:true});};
   $('zooStoryNext').onclick=()=>{if(!c.checkRun())return;if(line===bridge.length-1){z.bridgeDone=true;save();draw();return;}z.bridgeLine++;save();drawBridge();$('zooStoryNext').focus({preventScroll:true});};
  }
  function drawBrief(){
   heading('MISSION 02 · 사육사의 개념 안내','시간이 달라도, 비율로 비교할 수 있어요');
   board.innerHTML=`<div class="zoo-brief-art"><img src="${A}keeper.svg" alt="띠그래프를 설명하는 사육사"><div><span>어린이동물원 관찰 교실</span><h2>전체를<br><strong>100%</strong>로 놓아요</h2><div class="zoo-example-strip"><i></i><span>전체 100%</span></div><p>같은 길이의 띠 = 각 날의 1회 관찰 시간</p></div></div>`;
   controls.innerHTML=`<h2>사육사의 한마디</h2><p>${graphLesson.text}</p><div class="zoo-formula">평균 주변 살피기 시간<br>÷ 1회 관찰 시간 × 100</div><p>색칠한 부분은 <b>주변 살피기</b>,<br>남은 부분은 <b>다른 행동</b>이야.</p>`;
   confirm.textContent='띠그래프 만들기 →';c.feedback('전체를 기준으로 비교하면, 관찰 시간이 서로 달라도 공정하게 비교할 수 있어요.');
  }
  function graphCard(i){
   const name=i?'B':'A',day=i?'어제':'오늘',average=i?15:13,total=i?25:20;
   return `<article class="zoo-graph-card graph-${name}"><header><h2>${day}의 관찰 기록</h2><span>한 번 관찰할 때를 기준으로</span></header><div class="zoo-graph-condition zoo-simple-condition"><span>평균 주변 살피기 <b>${average}<small>초</small></b></span><span>1회 전체 관찰 <b>${total}<small>초</small></b></span></div><div class="zoo-strip-wrap"><div class="zoo-strip" id="strip${name}" style="--fill:${z.bars[i]}%"><span class="strip-fill"></span><span class="strip-grid"></span></div><input id="bar${name}" class="zoo-range" type="range" min="0" max="100" step="1" value="${z.bars[i]}" aria-label="${day} 주변을 살핀 비율" aria-valuetext="${z.bars[i]} 퍼센트" ${z.graphsChecked?'disabled':''}><div class="zoo-strip-scale"><span>0</span><span>50</span><span>100%</span></div></div><div class="zoo-bar-tools"><button data-adjust="${i},-1" aria-label="${day} 1퍼센트 줄이기" ${z.graphsChecked?'disabled':''}>−</button><output id="barOutput${name}" for="bar${name}">${z.bars[i]}<small> / 100 = </small>${z.bars[i]}%</output><button data-adjust="${i},1" aria-label="${day} 1퍼센트 늘리기" ${z.graphsChecked?'disabled':''}>＋</button><span id="remainder${name}">다른 행동 ${100-z.bars[i]}%</span></div></article>`;
  }
  function drawGraphs(){
   const compare=z.graphsChecked;
   heading('MISSION 02 · 비율과 띠그래프',compare?'어느 기록의 비율이 더 클까요?':'주변을 살핀 비율만큼 띠를 채워요');
   board.innerHTML=`<div class="zoo-graphs">${graphCard(0)}${graphCard(1)}</div>`;
   controls.innerHTML=compare?keeper('어제는 평균 15초로 더 길었지. 전체에서 차지하는 비율도 더 클까? 완성한 띠를 비교해 보렴.')+`<h2 class="zoo-question">전체 시간 중 주변을 살핀 비율은 어느 날이 더 큰가요?</h2><div class="zoo-compare-choices"><button data-compare="A">오늘</button><button data-compare="B">어제</button><button data-compare="same">같아요</button></div>`:`<h2 class="zoo-question">각 날의 전체를<br>100%로 놓아요.</h2><div class="zoo-legend"><span><i></i> 주변 살피기</span><span><i></i> 다른 행동</span></div><div class="zoo-formula">평균 주변 살피기 시간<br>÷ 1회 관찰 시간 × 100</div><p class="zoo-how">손잡이나 ＋ · −로 채워요.</p>`;
   confirm.hidden=compare;confirm.textContent='띠그래프 확인';
   c.feedback(compare?'단순한 시간의 크기가 아니라, 전체에서 차지하는 비율을 비교해 보세요.':'색칠할 때마다 전체에 대한 비율이 표시돼요.');
   if(!compare){[0,1].forEach(i=>{const input=$('bar'+(i?'B':'A'));input.oninput=()=>changeBar(i,Number(input.value));});board.querySelectorAll('[data-adjust]').forEach(b=>b.onclick=()=>{const [i,d]=b.dataset.adjust.split(',').map(Number);changeBar(i,z.bars[i]+d);});}
   else controls.querySelectorAll('[data-compare]').forEach(b=>b.onclick=()=>{if(!c.checkRun())return;if(b.dataset.compare!=='A'){c.tone(false);c.feedback(b.dataset.compare==='B'?'어제는 평균 15초로 더 길지만, 관찰 시간도 25초로 더 길어요. 오늘 65%와 어제 60%를 비교해 보세요.':'색칠된 부분의 비율 65%와 60%를 비교해 보세요.','bad');return;}z.comparison='A';save();c.tone();draw();});
  }
  function changeBar(i,value){
   if(!c.checkRun()||z.graphsChecked)return;
   const v=z.bars[i]=Math.max(0,Math.min(100,Math.round(value))),name=i?'B':'A';
   $('bar'+name).value=v;$('bar'+name).setAttribute('aria-valuetext',v+' 퍼센트');$('strip'+name).style.setProperty('--fill',v+'%');
   $('barOutput'+name).innerHTML=`${v}<small> / 100 = </small>${v}%`;$('remainder'+name).textContent='다른 행동 '+(100-v)+'%';save();
   if(document.querySelector('#game .game-footer.bad'))c.feedback('색칠한 비율을 다시 확인해 보세요.');
  }
  function drawComplete(){
   heading('OBSERVATION COMPLETE · 두 미션 성공','미어캣의 하루를 수학으로 읽었어요');
   board.innerHTML=`<div class="zoo-success"><span class="zoo-success-star">✦</span><h2>관찰 기록 완성!</h2><div class="zoo-success-results"><div><small>오늘 한 번 관찰할 때 평균</small><strong>13<span>초</span></strong></div><div><small>전체 중 주변을 살핀 비율</small><strong>오늘 65% <span>〉</span> 어제 60%</strong></div></div><p>시간을 기록하고, 평균과 비율로 비교했어요.</p></div>`;
   controls.innerHTML=keeper('시간은 어제가 더 길지만, 전체 중 주변을 살핀 비율은 오늘이 더 크구나. 전체를 기준으로 비교했으니 잘했어!')+`<div class="zoo-formula">오늘 13 ÷ 20 × 100 = 65%<br>어제 15 ÷ 25 × 100 = 60%</div><p>이 두 기록에서는<br>오늘의 비율이 더 커요.</p>`;
   confirm.textContent='사육사에게 기록 전하기 →';c.feedback('완성한 기록을 사육사에게 전하고, 다음 목적지로 떠날 준비를 해요.','good');
  }
  function submit(){
   if(!c.checkRun())return;
   const p=phase();
   if(p==='observe'){
    const trial=z.records.length;if(!z.watched[trial])return;
    if(!M.exact($('zooAnswer').value,M.initial[trial])){c.tone(false);c.feedback('멈춘 시각에서 시작한 시각을 빼 보세요. 장면을 다시 봐도 좋아요.','bad');$('zooAnswer').setAttribute('aria-invalid','true');focusQuestion();return;}
    z.records.push(M.initial[trial]);z.elapsed=0;save();c.tone();draw();
    if(z.records.length<4)c.feedback(`${trial+1}회 ${M.initial[trial]}초, 기록했어요! 이제 ${trial+2}회를 관찰해요.`,'good');
   }else if(p==='average'){
    if(!M.exact($('zooAnswer').value,13)){c.tone(false);c.feedback('네 시간을 더한 뒤, 관찰 횟수인 4로 나누어 보세요.','bad');$('zooAnswer').setAttribute('aria-invalid','true');focusQuestion();return;}
    z.average=13;calculator.expression='';calculator.result='';calculator.open=false;save();c.tone();draw();
   }else if(p==='brief'){z.briefed=true;save();draw();}
   else if(p==='graphs'){
    if(z.bars[0]!==65||z.bars[1]!==60){c.tone(false);c.feedback((z.bars[0]!==65?'오늘: 13 ÷ 20 × 100':'어제: 15 ÷ 25 × 100')+'을 계산해 색칠한 비율과 비교해 보세요.','bad');return;}
    z.graphsChecked=true;save();c.tone();draw();c.feedback('오늘 65%, 어제 60%. 두 띠그래프를 완성했어요!','good');
   }else if(p==='complete'&&M.solved('park',state))c.next();
  }
  draw();
  return {pause,help:()=>['brief','graphs','compare','complete'].includes(phase())?graphLesson:root.NamdongData.lessons.park,destroy(){destroyed=true;stop();root.removeEventListener('blur',pause);root.removeEventListener('keyup',releaseKey);document.removeEventListener('visibilitychange',hidden);confirm.onclick=null;}};
 }
 root.NamdongZoo={mount};
})(window);
