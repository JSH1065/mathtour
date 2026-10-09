(() => {
  'use strict';
  const $=id=>document.getElementById(id),M=CoastMath,D=CoastTourData,P=GeomdanProgress;
  const fresh=()=>({version:1,step:0,line:0,seen:[],puzzle:{moves:[]},sunset:M.freshSunset(),departed:false});
  function normalize(raw){
    const s=fresh();if(raw?.version!==1)return s;
    s.step=Number.isInteger(raw.step)?Math.max(0,Math.min(D.index('recap'),raw.step)):0;
    s.line=Number.isInteger(raw.line)?Math.max(0,raw.line):0;
    s.seen=Array.isArray(raw.seen)?raw.seen.filter(k=>Object.hasOwn(D.photos,k)):[];
    if(M.boardFrom(raw.puzzle?.moves))s.puzzle={moves:raw.puzzle.moves.slice()};
    s.sunset=M.restoreSunset(raw.sunset);
    if(!M.validPuzzle(s.puzzle)&&s.step>D.index('puzzle')){s.step=D.index('puzzle');s.sunset=fresh().sunset;}
    if(!M.validSunset(s.sunset)&&s.step>D.index('sunset'))s.step=D.index('sunset');
    s.departed=raw.departed===true&&M.validPuzzle(s.puzzle)&&M.validSunset(s.sunset);
    if(s.step===D.index('recap')&&!s.departed)s.step=D.index('departure');
    return s;
  }
  let state=normalize(P.load('coast')),run=P.status().run,screen='arrival',blocked=false,sound=false,audio;
  let timer=0,autoPending=null,hinted=null,lastDirection='',arrivalTimer=0,boatToken=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paused=()=>document.hidden||!!document.querySelector('dialog[open]')||blocked;

  const boatEffects=new CoastEffects.Boat({paused,phase:()=>{$('boatTitle').textContent='정서진 방면 선착장에 도착합니다.';$('boatStatus').textContent='배가 천천히 선착장으로 들어오고 있어요.';},ready:()=>{if(screen!=='boat'||blocked)return;$('boatNext').disabled=false;$('boatNext').textContent=D.steps[state.step].button;$('boatPassengers').hidden=false;$('boatStatus').textContent='배가 멈췄어요. 이제 선착장으로 내려 볼까요?';cue('success');}});
  const sunsetEffects=new CoastEffects.Sunset({paused,ready:()=>{if(screen!=='sunset'||blocked)return;$('lightCapture').hidden=false;autoNext(D.index('lightTalk'),4700);}});
  function checkRun(){
    if(blocked)return false;
    if(P.status().run!==run){blocked=true;boatEffects.stop();sunsetEffects.stop();clearTimeout(timer);clearTimeout(arrivalTimer);$('main').inert=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('resetNotice').showModal();return false;}
    return true;
  }
  function persist(finish=false){if(checkRun())$('saveNotice').hidden=P.save('coast',state,run,finish);}
  function cue(kind='move'){
    if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();(kind==='success'?[523,659,784]:[390]).forEach((f,i)=>{const t=audio.currentTime+i*.09,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.035,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.22);});}catch{}
  }
  function show(id){if(id!=='boat'){boatEffects.stop();boatToken++;}if(id!=='sunset')sunsetEffects.stop();screen=id;document.querySelectorAll('main>.screen').forEach(e=>e.hidden=e.id!==id);}
  function enter(step,line=0){if(!checkRun())return;clearTimeout(timer);autoPending=null;state.step=step;state.line=line;persist();render();}
  const next=()=>enter(Math.min(D.index('recap'),state.step+1));
  function autoNext(target,delay){clearTimeout(timer);timer=setTimeout(()=>{if(!checkRun())return;if(paused()){autoPending=target;return;}if(target==='finish')finishDeparture();else enter(target);},delay);}
  function unpause(){if(!paused()&&autoPending!==null){const target=autoPending;autoPending=null;autoNext(target,500);}}
  function imageFor(el,scene){if(el.getAttribute('src')!==scene.art)el.src=scene.art;el.alt=scene.title+' 일러스트';}
  function render(){
    if(!checkRun())return;if(!P.status().items.find(c=>c.id==='coast').unlocked){show('locked');return;}
    const step=D.steps[state.step];show(step.type);
    if(step.type==='arrival'){arrival();return;}
    if(step.type==='story'){
      const scene=D.scenes[step.scene];imageFor($('story').querySelector('.backdrop'),scene);
      $('story').querySelector('.scene-tag').textContent=step.tag;$('story').querySelector('.real-open').hidden=!scene.photo;
      $('story').querySelector('.art-credit').textContent=scene.photo?'실제 장소를 참고한 창작 일러스트':'이동 장면 창작 일러스트';
      $('story').classList.toggle('lit',step.id==='lightTalk');state.line=Math.min(state.line,step.lines.length-1);
      const [who,text]=step.lines[state.line];$('speaker').textContent=who;$('lineText').textContent=text;$('lineCount').textContent=`${state.line+1} / ${step.lines.length}`;
      $('storyPrev').disabled=state.line===0;$('storyNext').textContent=state.line===step.lines.length-1?step.button:'다음 →';
      document.querySelectorAll('#story .person').forEach(p=>p.classList.toggle('speaking',p.alt===who));
    }else if(step.type==='boat'){
      renderBoat(step);
    }else if(step.type==='photos'){
      const p=D.photos[step.photo];if(!state.seen.includes(step.photo)){state.seen.push(step.photo);persist();}
      $('photoImage').src=p.src;$('photoImage').alt=p.title;$('photoTitle').textContent=p.title;$('photoText').textContent=p.text;$('photoLook').textContent=p.look;$('photoSource').href=p.source;$('photoCredit').textContent=p.credit;$('photoStop').textContent=step.stop;
      const all=D.steps.filter(s=>s.type==='photos');$('photoCount').textContent=`${all.indexOf(step)+1} / ${all.length}`;$('photoNext').textContent=D.steps[state.step+1]?.type==='photos'?'다음 풍경으로 →':'이야기 나누기 →';
    }else if(step.type==='puzzle'){
      if(M.validPuzzle(state.puzzle)){enter(D.index('signDone'));return;}renderPuzzle();
    }else if(step.type==='sunset'){
      if(M.validSunset(state.sunset)){enter(D.index('lightTalk'));return;}renderSunset();
    }else if(step.type==='departure'){
      const b=$('departBus');b.classList.remove('depart-bus');void b.offsetWidth;b.classList.add('depart-bus');autoNext('finish',reduced?500:4200);
    }
  }
  function arrival(){
    if(!P.status().items.find(c=>c.id==='coast').unlocked){show('locked');return;}
    show('arrival');$('resume').hidden=state.step===0;$('leaveBus').disabled=true;$('leaveBus').textContent='버스가 도착하고 있어요…';
    const b=$('bus');b.classList.remove('arriving');void b.offsetWidth;b.classList.add('arriving');
    clearTimeout(arrivalTimer);arrivalTimer=setTimeout(()=>{if(!checkRun())return;$('leaveBus').disabled=false;$('leaveBus').textContent='버스에서 내리기 →';},reduced?50:1650);
  }
  function direction(from,to){return to===from-3?'위로':to===from+3?'아래로':to<from?'왼쪽으로':'오른쪽으로';}
  const tileButtons=[];
  for(let id=0;id<8;id++){
    const b=document.createElement('button');b.className='sign-tile';b.dataset.tile=id;b.innerHTML=`${M.LABELS[id]}<span class="move-arrow" aria-hidden="true"></span>`;
    const goal=M.GOAL.indexOf(id);b.style.backgroundPosition=`${goal%3*50}% ${Math.floor(goal/3)*50}%`;
    b.onclick=()=>pushTile(id);$('puzzleBoard').append(b);tileButtons.push(b);
  }
  const blank=document.createElement('span');blank.className='blank-tile';blank.textContent='빈칸';$('puzzleBoard').prepend(blank);
  function renderPuzzle(){
    const b=M.boardFrom(state.puzzle.moves),empty=b.indexOf(8),legal=M.neighbors(b),done=M.validPuzzle(state.puzzle);
    blank.style.left=`${empty%3*100/3}%`;blank.style.top=`${Math.floor(empty/3)*100/3}%`;
    tileButtons.forEach((button,id)=>{const pos=b.indexOf(id),canMove=legal.includes(pos)&&!done;
      button.style.left=`${pos%3*100/3}%`;button.style.top=`${Math.floor(pos/3)*100/3}%`;button.classList.toggle('legal',canMove);button.classList.toggle('hinted',pos===hinted);button.setAttribute('aria-disabled',String(!canMove));
      button.setAttribute('aria-label',M.LABELS[id]+(canMove?` 조각 ${direction(pos,empty)} 밀기`:' 조각 · 빈칸과 맞닿지 않음'));
      button.querySelector('span').textContent=canMove?(empty===pos-3?'↑':empty===pos+3?'↓':empty<pos?'←':'→'):'';
    });
    $('moveCount').textContent=`${state.puzzle.moves.length}번 움직였어요`;$('puzzleUndo').disabled=done||!state.puzzle.moves.length;$('puzzleHint').disabled=done;$('puzzleReset').disabled=done;
    $('signSuccess').hidden=!done;if(done){$('puzzleFeedback').textContent='팻말이 완성됐어요! 선착장으로 가는 길이 다시 보입니다.';autoNext(D.index('signDone'),2600);}
  }
  function pushTile(id){
    if(!checkRun()||screen!=='puzzle'||paused()||M.validPuzzle(state.puzzle))return;
    const board=M.boardFrom(state.puzzle.moves),pos=board.indexOf(id),empty=board.indexOf(8);
    if(!M.move(board,pos)){$('puzzleFeedback').textContent='빈칸과 한 변을 맞댄 조각만 밀 수 있어요.';return;}
    if(state.puzzle.moves.length>=1000){$('puzzleFeedback').textContent='한 수 되돌리기나 처음 배열로를 눌러 다시 살펴봐요.';return;}
    state.puzzle.moves.push(pos);hinted=null;lastDirection=direction(pos,empty);persist();renderPuzzle();$('puzzleFeedback').textContent=M.validPuzzle(state.puzzle)?'인천 세어도 선착장! 팻말이 완성됐어요.':`‘${M.LABELS[id]}’ 조각을 ${lastDirection} 한 칸 밀었어요.`;cue(M.validPuzzle(state.puzzle)?'success':'move');
  }
  function renderClock(seconds){
    const c=$('clockFace'),ctx=c.getContext('2d'),t=M.timeParts(seconds);ctx.clearRect(0,0,300,300);ctx.save();ctx.translate(150,150);
    ctx.fillStyle='#fff4d8';ctx.strokeStyle='#bba379';ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,139,0,2*Math.PI);ctx.fill();ctx.stroke();
    for(let i=0;i<60;i++){const a=i*Math.PI/30;ctx.strokeStyle=i%5===0?'#1d4148':'#b3aa90';ctx.lineWidth=i%5===0?4:2;ctx.beginPath();ctx.moveTo(Math.sin(a)*(i%5===0?110:121),-Math.cos(a)*(i%5===0?110:121));ctx.lineTo(Math.sin(a)*129,-Math.cos(a)*129);ctx.stroke();}
    ctx.fillStyle='#223b42';ctx.font='bold 24px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';[[12,0,-87],[3,87,0],[6,0,87],[9,-87,0]].forEach(([v,x,y])=>ctx.fillText(v,x,y));
    const hand=(a,len,w,color)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.moveTo(0,0);ctx.lineTo(Math.sin(a)*len,-Math.cos(a)*len);ctx.stroke();};
    hand((t.hour%12+t.minute/60+t.second/3600)*Math.PI/6,65,9,'#223d44');hand((t.minute+t.second/60)*Math.PI/30,96,6,'#223d44');hand(t.second*Math.PI/30,114,3,'#b25a3a');ctx.fillStyle='#b25a3a';ctx.beginPath();ctx.arc(0,0,7,0,2*Math.PI);ctx.fill();ctx.restore();
    c.setAttribute('aria-label','관측 시계 '+M.clock(seconds));
  }
  const TIME_HINTS=[
    '먼저 초끼리 더해 보세요. 20초에 50초를 더한 값이 60초를 넘나요?',
    '20초 + 50초 = 70초. 70초는 1분 10초로 바꾸어 써요.',
    '분은 45 + 2 + 1 = 48. 초에는 남은 10을 써서 오후 6시 48분 10초가 돼요.'
  ];
  function renderSunset(sync=true){
    const done=M.validSunset(state.sunset),time=M.enteredTime(state.sunset);
    if(sync){$('answerMinute').value=state.sunset.minute;$('answerSecond').value=String(state.sunset.second).padStart(2,'0');}
    $('minuteSlider').value=state.sunset.minute;$('secondSlider').value=state.sunset.second;
    $('clockTime').textContent=M.clock(time);renderClock(time);
    document.querySelectorAll('.time-entry input,.time-entry button').forEach(e=>e.disabled=done);
    $('recordTime').disabled=done;$('timeHint').disabled=done;$('timeReset').disabled=done;
    $('timeHint').textContent=`서연의 힌트 ${state.sunset.hints} / 3`;
    document.querySelectorAll('[data-adjust]').forEach(b=>{const [field,delta]=b.dataset.adjust.split(':');const limits=field==='minute'?[40,55]:[0,59];b.disabled=done||state.sunset[field]+Number(delta)<limits[0]||state.sunset[field]+Number(delta)>limits[1];});
    document.querySelector('.observation-scene').classList.toggle('completed',done);
    if(!sunsetEffects.active)sunsetEffects.begin(time);else sunsetEffects.setTime(time);
    if(!done)$('lightCapture').hidden=true;
  }
  function setAnswer(minute,second,sync=true){
    if(!checkRun()||screen!=='sunset'||paused()||M.validSunset(state.sunset))return;
    const candidate={...state.sunset,minute,second};if(M.enteredTime(candidate)===null)return;
    state.sunset=candidate;persist();renderSunset(sync);
    $('carryNote').textContent='입력한 시각에 맞춰 해와 하늘이 변해요.';
    $('timeFeedback').textContent='계산을 마쳤다면 정답을 제출해요. 60초는 1분으로 바꾸어 쓰는 것을 기억해요.';
  }
  function readAnswer(){
    const m=$('answerMinute').value,s=$('answerSecond').value;
    if(!/^\d{1,2}$/.test(m)||!/^\d{1,2}$/.test(s)||M.enteredTime({...state.sunset,minute:Number(m),second:Number(s)})===null){
      $('recordTime').disabled=true;$('timeFeedback').textContent='분은 40~55, 초는 0~59 사이의 정수로 입력해 주세요.';return false;
    }
    setAnswer(Number(m),Number(s),false);return true;
  }
  function renderBoat(step){
    const token=++boatToken,returning=step.destination==='mainland';
    $('boatTitle').textContent=step.title;$('boatText').textContent=step.text;$('boatStatus').textContent=returning?'세어도 선착장을 떠나고 있어요.':'배가 세어도 선착장으로 들어오고 있어요.';
    $('boatNext').disabled=true;$('boatNext').textContent='배가 이동하고 있어요…';$('boatPassengers').hidden=true;
    $('boatBackdrop').src='asset/coast-tour/island-dock.webp';$('boatDestination').src=`asset/coast-tour/${returning?'mainland':'island'}-dock.webp`;$('boatDestination').style.opacity='0';$('boatRig').style.left='-75%';
    Promise.all([$('boatBackdrop'),$('boatDestination'),$('boatSprite')].map(i=>i.decode())).then(()=>{if(token===boatToken&&screen==='boat'&&!blocked)boatEffects.begin(returning);}).catch(()=>{if(token!==boatToken)return;$('boatStatus').textContent='배 그림을 불러오지 못했어요. 눌러서 다시 불러올 수 있어요.';$('boatNext').disabled=false;$('boatNext').textContent='배 장면 다시 불러오기';});
  }
  function finishDeparture(){if(!checkRun()||state.step!==D.index('departure')||!M.validPuzzle(state.puzzle)||!M.validSunset(state.sunset))return;clearTimeout(timer);autoPending=null;state.departed=true;state.step=D.index('recap');persist(true);render();}
  function open(id){$(id).showModal();}
  function actual(key){const p=D.photos[key];if(!p)return;$('realTitle').textContent=p.title;$('realImage').src=p.src;$('realImage').alt=p.title;$('realCaption').textContent=p.credit;$('realSource').href=p.source;open('photoDialog');}
  function help(type){
    $('helpTitle').textContent=type==='puzzle'?'빈칸을 이용해 팻말 밀기':'시작 시각에 걸린 시간 더하기';
    $('helpBody').innerHTML=type==='puzzle'?'<p>수첩의 완성 모습을 보며 글자 조각의 위치를 맞춰 주세요.</p><div class="help-example">① 빈칸과 한 변을 맞댄 조각을 눌러요.<br>② 조각이 빈칸으로 밀려요. 돌리거나 대각선으로 옮길 수 없어요.<br>③ 막히면 한 수 힌트를 눌러 빛나는 조각을 찾아요.</div><p>조각의 모양·크기·방향을 그대로 두고 위치만 옮겨요. 잘못 옮겼다면 한 수 되돌리기를 눌러요. 시간 제한은 없어요.</p>':'<p>민우 · “시작한 시각에 얼마나 걸렸는지를 더하면 마지막 시각이 되는구나!”</p><div class="help-example">서연 · “60초는 1분이야. 예를 들어 40초에 30초를 더한 70초는 1분 10초로 바꿔 쓰면 돼.”</div><p>먼저 시작 시각에 걸린 시간을 더해 계산해요. 계산한 마지막 시각의 <strong>분과 초</strong>를 슬라이더·＋/− 버튼 또는 숫자 입력으로 맞춘 뒤 정답을 제출해요.</p><p>시각을 바꾸면 해의 높이와 하늘빛도 함께 변해요. 정답을 맞히면 별빛과 노을종 조명이 켜져요.</p><p class="small">실제로 시간을 기다리거나 현재 시계를 맞추는 활동이 아니라, 수첩에 적힌 관측 기록을 완성하는 체험이에요.</p>';
    open('help');
  }
  $('leaveBus').onclick=()=>{if(state.step>0){open('restartDialog');return;}enter(1);};$('resume').onclick=render;
  $('storyNext').onclick=()=>{const s=D.steps[state.step];if(state.line<s.lines.length-1){state.line++;persist();render();}else next();};$('storyPrev').onclick=()=>{if(state.line>0){state.line--;persist();render();}};
  $('photoNext').onclick=next;$('photoPrev').onclick=()=>enter(state.step-1);$('boatNext').onclick=()=>{if(boatEffects.finished)next();else renderBoat(D.steps[state.step]);};$('enlarge').onclick=()=>actual(D.steps[state.step].photo);document.querySelector('.real-open').onclick=()=>actual(D.scenes[D.steps[state.step].scene].photo);
  $('puzzleUndo').onclick=()=>{if(!checkRun()||M.validPuzzle(state.puzzle))return;state.puzzle.moves.pop();hinted=null;persist();renderPuzzle();$('puzzleFeedback').textContent='방금 움직인 조각을 제자리로 되돌렸어요.';};
  $('puzzleReset').onclick=()=>{if(!checkRun()||M.validPuzzle(state.puzzle))return;state.puzzle.moves=[];hinted=null;persist();renderPuzzle();$('puzzleFeedback').textContent='처음 배열로 돌아왔어요. 빈칸과 맞닿은 조각부터 살펴봐요.';};
  $('puzzleHint').onclick=()=>{if(!checkRun()||M.validPuzzle(state.puzzle))return;const b=M.boardFrom(state.puzzle.moves);hinted=M.hint(b);renderPuzzle();$('puzzleFeedback').textContent=`‘${M.LABELS[b[hinted]]}’ 조각을 ${direction(hinted,b.indexOf(8))} 밀어 보세요.`;};
  $('puzzleContinue').onclick=()=>{if(M.validPuzzle(state.puzzle))enter(D.index('signDone'));};
  $('minuteSlider').oninput=e=>setAnswer(Number(e.target.value),state.sunset.second);
  $('secondSlider').oninput=e=>setAnswer(state.sunset.minute,Number(e.target.value));
  for(const id of ['answerMinute','answerSecond']){$(id).oninput=readAnswer;$(id).onfocus=()=>$(id).select();}
  document.querySelectorAll('[data-adjust]').forEach(b=>b.onclick=()=>{const [field,delta]=b.dataset.adjust.split(':');setAnswer(state.sunset.minute+(field==='minute'?Number(delta):0),state.sunset.second+(field==='second'?Number(delta):0));cue();});
  $('timeHint').onclick=()=>{if(!checkRun()||M.validSunset(state.sunset))return;state.sunset.hints=Math.min(3,state.sunset.hints+1);persist();renderSunset();$('timeFeedback').textContent=TIME_HINTS[state.sunset.hints-1];};
  $('timeReset').onclick=()=>{if(!checkRun()||M.validSunset(state.sunset))return;state.sunset=M.freshSunset();persist();renderSunset();$('carryNote').textContent='계산한 최종 시각의 분과 초를 직접 입력해요.';};
  $('recordTime').onclick=()=>{
    if(!checkRun()||M.validSunset(state.sunset)||!readAnswer())return;
    if(M.enteredTime(state.sunset)!==M.START_TIME+M.DURATION){$('timeFeedback').textContent='아직 정확한 시각이 아니에요. 20초 + 50초를 먼저 계산하고, 60초를 1분으로 바꾸어 분에 더해 보세요.';document.querySelector('.time-entry').animate([{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:260});return;}
    state.sunset.confirmed=true;persist();cue('success');renderSunset();$('carryNote').textContent='정답! 20초 + 50초 = 70초 = 1분 10초';$('timeFeedback').textContent='오후 6시 48분 10초! 별빛과 노을종의 빛이 깨어납니다.';sunsetEffects.celebrate();
  };
  $('sunsetContinue').onclick=()=>{if(M.validSunset(state.sunset))enter(D.index('lightTalk'));};$('finishDeparture').onclick=finishDeparture;
  $('reviewTour').onclick=()=>enter(1);
  $('retrySunset').onclick=()=>{state.sunset=M.freshSunset();state.departed=false;enter(D.index('sunset'));};
  $('journal').onclick=()=>{$('noteBody').innerHTML='<div class="note-stops">'+Object.entries(D.photos).map(([k,p])=>`<span class="${state.seen.includes(k)?'seen':''}">${state.seen.includes(k)?'✓':'○'} ${state.seen.includes(k)?p.title:'아직 만나지 않은 풍경'}</span>`).join('')+'</div><p>'+(M.validPuzzle(state.puzzle)?'✦ 세어도의 길을 잇는 빛 · 모양과 방향을 유지하며 위치를 옮겼어요.':'○ 세어도의 길을 잇는 빛을 찾아요.')+'</p><p>'+(M.validSunset(state.sunset)?'✦ 정서진의 노을빛 · 60초를 1분으로 바꾸어 시각을 기록했어요.':'○ 정서진의 노을빛을 기록해요.')+'</p><p class="small">학생 원안 · 유윤호 · 김민건<br>팻말 밀기퍼즐과 노을빛 기록 문제를 이어 만든 여행입니다.</p>';open('note');};
  $('sourcesOpen').onclick=()=>{$('sourcesList').innerHTML=Object.values(D.photos).map(p=>`<p><a href="${p.source}" target="_blank" rel="noopener">${p.title} ↗</a><br>${p.credit}</p>`).join('')+'<p>배경과 나무 팻말: 실제 풍경을 참고해 새로 그린 AI 일러스트. 육지 선착장은 이동을 표현한 창작 장면입니다.</p>';open('sources');};
  $('restartOpen').onclick=()=>open('restartDialog');$('restart').onclick=()=>{clearTimeout(timer);autoPending=null;state=fresh();hinted=null;document.querySelectorAll('dialog[open]').forEach(d=>d.close());persist();arrival();};
  document.querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>help(b.dataset.help));document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',unpause));
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'소리 끄기':'소리 켜기';$('sound').setAttribute('aria-pressed',String(sound));cue('success');};
  document.addEventListener('keydown',e=>{if(screen!=='puzzle'||paused()||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const b=M.boardFrom(state.puzzle.moves),empty=b.indexOf(8),delta={ArrowUp:3,ArrowDown:-3,ArrowLeft:1,ArrowRight:-1}[e.key],pos=empty+delta;if(M.neighbors(b).includes(pos))pushTile(b[pos]);});
  window.addEventListener('mathtour:geomdan-progress',checkRun);window.addEventListener('focus',()=>{checkRun();unpause();});document.addEventListener('visibilitychange',()=>{checkRun();unpause();});
  for(const src of [...Object.values(D.scenes).map(s=>s.art),'asset/coast-tour/puzzle-surface.webp','asset/coast-tour/plaza-dusk.webp','asset/coast-tour/passenger-boat.webp','asset/coast-tour/island-dock.webp','asset/coast-tour/mainland-dock.webp','asset/coast-tour/observation-night.webp','asset/coast-tour/observation-reward.webp']){const i=new Image();i.src=src;}
  arrival();
})();
