(() => {
  'use strict';
  const $=id=>document.getElementById(id),{Pottery,TAU,LENGTH,SPACING,COUNT}=PotteryMath;
  const model=new Pottery();let view=null,viewAttempted=false,screen='welcome',found=false,measuring=false,measureTime=0;
  let lines=[],lineIndex=0,storyEnd=null,storyNextLabel='',sound=false,audio=null,held=false,keyHeld=false,drag=null,angle=0;
  let completeAt=0,endShown=false,lastTime=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const query=new URLSearchParams(location.search),embedded=query.get('embed')==='geomdan'&&window.parent!==window,session=query.get('session');
  const fileMode=location.protocol==='file:',messageTarget=fileMode?'*':location.origin;
  const matchingOrigin=origin=>fileMode?origin==='null':origin===location.origin;
  let embeddedReady=false,externalPause=false,lastPublish=0,lastSnapshot='';
  function snapshot(){return {version:1,found,stage:screen==='story'?'intro':screen,lineIndex,...model.snapshot()};}
  function publish(type='snapshot'){
    if(!embedded||!embeddedReady)return;
    const s=snapshot(),json=JSON.stringify(s);if(type==='snapshot'&&json===lastSnapshot)return;lastSnapshot=json;
    window.parent.postMessage({channel:'geomdan-pottery',token:session,type,snapshot:s},messageTarget);
  }
  function show(id){release();screen=id;document.querySelectorAll('main>.screen').forEach(el=>el.hidden=el.id!==id);if(id==='workshop'){initView();view?.resize();}}
  function initView(){if(viewAttempted)return;viewAttempted=true;try{view=new PotteryView($('potteryHost'));}catch(e){
    console.warn('토기 모형은 사진과 펼친 둘레로 표시합니다.',e.message);
    const fallback=document.createElement('div');fallback.className='pot-fallback';fallback.innerHTML='<img src="../geomdan-pottery/bullo-pottery-actual.webp" alt="구멍무늬토기 참고 사진"><p>아래 펼친 둘레에 무늬를 만들어 봐요.</p>';$('potteryHost').append(fallback);
  }}
  function message(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
  function tone(success=false){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();(success?[523.25,659.25,783.99]:[380]).forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.095;o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.8,t+.15);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.075,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.21);});}catch(_){}}
  function speak(script,then,lastLabel){lines=script;lineIndex=0;storyEnd=then;storyNextLabel=lastLabel;show('story');renderLine();}
  function renderLine(){const [who,text]=lines[lineIndex];$('speaker').textContent=who;$('storyText').textContent=text;$('storyCount').textContent=`${lineIndex+1} / ${lines.length}`;$('storyPrev').disabled=lineIndex===0;$('storyNext').textContent=lineIndex===lines.length-1?storyNextLabel:'다음 →';document.querySelector('#story .minwoo').classList.toggle('speaking',who==='민우');document.querySelector('#story .seoyeon').classList.toggle('speaking',who==='서연');}
  function reset(){model.reset();found=false;measuring=false;measureTime=0;completeAt=0;endShown=false;angle=0;release();
    $('photoMat').classList.remove('zoomed');$('foundRing').hidden=true;$('zoomPhoto').hidden=true;$('zoomPhoto').textContent='무늬 확대하기 ＋';$('zoomPhoto').setAttribute('aria-pressed','false');$('toStudio').disabled=true;
    document.querySelectorAll('.photo-spot').forEach(el=>el.hidden=false);$('discovery').textContent='서연 · “작은 구멍들이 어디를 따라 이어지는지 찾아볼까?”';$('discovery').className='discovery';
    $('bench').classList.remove('lit');$('sparkMessage').hidden=true;$('story').classList.remove('finish-color');$('storyLabel').textContent='관찰에서 체험으로 · 우리의 작은 공방';
    if(view){view.angle=0;view.glow=0;view.setHoles(0);view.setCarving(false);view.startMarker.visible=false;view.measure(0);}
    renderPhase();show(embedded?'observe':'welcome');
  }
  function observe(part){if(found)return;if(part!=='rim'){$('discovery').textContent=part==='body'?'몸통은 대체로 매끈해요. 입구 쪽도 자세히 살펴볼까요?':'바닥은 평평한 편이에요. 작은 구멍들은 어디에 이어져 있을까요?';return;}
    found=true;tone(true);$('foundRing').hidden=false;$('zoomPhoto').hidden=false;$('toStudio').disabled=false;$('discovery').className='discovery success';$('discovery').textContent='찾았어요! 입구 바로 아래에 작은 구멍들이 이어져 있어요. 이 특징 때문에 구멍무늬토기라고 불러요.';document.querySelectorAll('.photo-spot').forEach(el=>el.hidden=true);
  }
  function renderPhase(){
    const p=model.phase,isPlan=p==='plan',isCarve=p==='carve',done=p==='complete';
    $('planGroup').hidden=!isPlan;$('carveGroup').hidden=!isCarve;$('resultGroup').hidden=!done;$('measureFacts').hidden=done;$('measurementResult').hidden=!isPlan;
    $('hint').hidden=!isPlan;$('hint').textContent='서연의 힌트 보기';$('holdNote').hidden=!isCarve;
    $('mainAction').disabled=false;$('stepMeasure').className=isCarve||done?'done':'active';$('stepCarve').className=done?'done':isCarve?'active':'';
    $('phaseNo').textContent=isCarve?'03.':done?'✦':'02.';
    $('lengthValue').innerHTML=(p==='measure'?'?':LENGTH)+' <span>mm</span>';
    $('missionLabel').textContent=done?'LIGHT RESTORED · 내 손으로 만든 한 바퀴':isCarve?'FIELD NOTE 03 · 내 손으로 새기는 구멍무늬':'FIELD NOTE 02 · 손으로 만드는 토기';
    $('missionTitle').textContent=done?'작은 무늬에 빛이 돌아왔어요.':isCarve?'천천히 돌리면, 무늬가 생겨요.':'한 바퀴에는 몇 개가 들어갈까?';
    $('missionSubtitle').textContent=done?'유물의 특징을 관찰하고, 같은 간격으로 우리의 토기를 완성했어요.':isCarve?'손을 떼면 멈춰요. 시작 구멍으로 돌아오면 완성이에요.':'같은 간격으로 구멍무늬를 새겨, 토기에 빛을 돌려주세요.';
    $('benchTag').textContent=done?'나만의 구멍무늬토기 · 완성':isCarve?'18mm마다 무늬를 새기는 중':'직접 만드는 체험용 토기';
    if(p==='measure'){
      $('panelTitle').textContent='먼저, 둘레를 재요.';$('instruction').innerHTML='줄자를 토기에 한 바퀴 둘러<br>전체 길이를 확인해 봐요.';$('mainAction').textContent='줄자 둘러보기';$('helperText').textContent='“줄자를 감으면, 둥근 둘레도 길이를 잴 수 있어!”';message('실제 유물의 특징을 살려 만드는 우리의 체험용 토기예요.');
      $('rulerLabel').textContent='토기 둘레에 감는 줄자';$('rulerValue').textContent='아직 재기 전';$('rulerCaption').textContent='둥근 둘레를 펼쳐 보면 길이가 한눈에 보여요.';$('rulerFill').style.width='0%';$('rulerTicks').innerHTML='';$('rulerTrack').classList.remove('over');$('rulerEnd').textContent='다시 시작점';$('gestureNote').textContent='손가락으로 옆으로 밀어 둘러보세요 ↔';
    } else if(isPlan){
      $('panelTitle').textContent='몇 개가 딱 맞을까?';$('instruction').innerHTML='288mm 안에 18mm가 몇 번 들어갈까요?<br>개수를 골라 둘레에 대 보세요.';$('mainAction').textContent='둘레에 대 보기';$('helperText').textContent='“전체 길이를 같은 간격으로 나누면, 필요한 개수를 알 수 있어!”';message('한 바퀴는 288mm예요. 0개부터 ＋로 개수를 늘리며 길이를 비교해 보세요.');renderGuess();
    } else if(isCarve){
      $('panelTitle').textContent='이제 직접 돌려요.';$('instruction').innerHTML='18mm마다 도구가 구멍을 새겨요.<br>토기를 오른쪽으로 쭉 밀어 보세요.';$('mainAction').textContent='누르고 돌리기 →';$('helperText').textContent='“시작점과 끝점이 같으니까, 마지막에 구멍을 하나 더 뚫지 않아도 돼!”';message('16개가 딱 맞아요! 토기를 밀거나 아래 버튼을 길게 눌러 한 바퀴를 완성해요.');$('gestureNote').textContent='오른쪽으로 밀기 → · 손을 떼면 멈춰요';$('rulerLabel').textContent='펼쳐서 보는 한 바퀴';$('rulerValue').textContent='전체 288mm · 18mm씩';$('rulerCaption').textContent='시작점에 다시 돌아오면 한 바퀴 완성!';renderCarve();
    } else if(done){
      $('panelTitle').textContent='우리의 토기, 완성!';$('instruction').innerHTML='18mm가 16번 모여<br>288mm의 한 바퀴가 되었어요.';$('mainAction').textContent='새 토기로 다시 해 보기';$('helperText').textContent='“박물관에서 이 토기를 만나면, 입구의 작은 구멍을 꼭 찾아봐!”';message('토기를 자유롭게 돌려 보세요. ‘실제 유물 보기’로 옛사람의 토기와 비교할 수도 있어요.');$('gestureNote').textContent='완성된 토기를 자유롭게 돌려 보세요 ↔';$('bench').classList.add('lit');$('rulerFill').style.width='100%';$('rulerValue').textContent='288mm ÷ 18mm = 16개';$('rulerCaption').textContent='구멍 16개 · 같은 간격 16칸 · 시작과 끝은 같은 자리';
    }
  }
  function renderGuess(){
    $('guess').textContent=model.guess;$('minus').disabled=model.guess===0;$('plus').disabled=model.guess===24;$('equationAnswer').textContent='?';
    $('rulerLabel').textContent='18mm 간격을 한 바퀴에 대 보아요';$('rulerValue').textContent=`${model.guess}개 예상 · ${model.guess*SPACING}mm`;
    $('rulerFill').style.transition=model.guess===0?'none':'';
    $('rulerFill').style.width=Math.min(100,model.guess/COUNT*100)+'%';$('rulerTrack').classList.toggle('over',model.guess>COUNT);
    $('rulerTicks').innerHTML=Array.from({length:Math.min(model.guess,COUNT)+1},(_,i)=>`<i class="tick" style="left:${i/COUNT*100}%"></i>`).join('');$('rulerEnd').textContent='전체 288mm';$('rulerCaption').textContent=model.guess===0?'아직 놓은 간격이 없어요. ＋를 누르면 18mm씩 늘어나요.':'작은 한 칸이 18mm예요. 초록색 길이를 전체와 비교해요.';
  }
  function renderCarve(){
    $('holeCount').textContent=model.holes;const percent=Math.round(model.turn/TAU*100);$('turnFill').style.width=percent+'%';$('turnProgress').setAttribute('aria-valuenow',String(percent));$('turnLabel').textContent=percent===100?'한 바퀴 완성!':`한 바퀴의 ${percent}% · 구멍 ${model.holes}개`;
    $('rulerFill').style.width=percent+'%';$('rulerTrack').classList.remove('over');$('rulerTicks').innerHTML=Array.from({length:COUNT+1},(_,i)=>`<i class="tick" style="left:${i/COUNT*100}%"></i>${i<model.holes?`<i class="mark" style="left:${i/COUNT*100}%"></i>`:''}`).join('');
  }
  function action(){
    if(screen!=='workshop')return;
    if(model.phase==='measure'&&!measuring){release();measuring=true;measureTime=0;angle=0;if(view)view.angle=0;$('mainAction').disabled=true;$('mainAction').textContent='줄자를 감고 있어요…';$('rulerLabel').textContent='줄자로 한 바퀴 재는 중';}
    else if(model.phase==='plan'){
      const result=model.check();if(!result.ok){
        message(result.remaining>0?`${result.count} × 18 = ${result.used}mm. 아직 ${result.remaining}mm가 남아요. 개수를 조금 늘려 볼까요?`:`${result.count} × 18 = ${result.used}mm. 한 바퀴보다 ${-result.remaining}mm 더 길어요. 개수를 줄여 보세요.`,true);
      }else{tone(true);angle=0;if(view){view.measure(0);view.angle=0;view.setHoles(1);view.setCarving(true);view.stamp();}renderPhase();}
    }else if(model.phase==='complete'){reset();show('observe');}
  }
  function rotate(delta){
    if(screen!=='workshop'||document.querySelector('dialog[open]')||measuring)return;
    if(model.phase==='carve'){
      const r=model.rotate(delta);angle=model.turn;if(r.added){view?.setHoles(model.holes);view?.stamp();tone();}renderCarve();
      if(r.done){release();view?.setCarving(false);$('sparkMessage').hidden=false;$('mainAction').disabled=true;$('mainAction').textContent='한 바퀴 완성!';$('bench').classList.add('lit');completeAt=performance.now()+1200;tone(true);}
    }else{angle+=delta;}
    if(view)view.angle=angle;
  }
  function release(){held=false;keyHeld=false;drag=null;$('mainAction').classList.remove('hold-active');}
  function readyToRotate(){return !externalPause&&screen==='workshop'&&model.phase==='carve'&&!document.querySelector('dialog[open]');}
  function openDialog(id){release();$(id).showModal();}
  function endStory(){endShown=true;$('sparkMessage').hidden=true;$('story').classList.add('finish-color');$('storyLabel').textContent='손끝에서 돌아온 수학의 빛';
    if(embedded){release();renderPhase();publish('complete');return;}
    speak([
      ['민우','작은 구멍들이 한 바퀴에 딱 맞았어! 무늬를 따라 빛이 돌아왔네.'],
      ['서연','288을 18로 나누니까 16. 같은 간격을 몇 번 놓을 수 있는지, 나눗셈으로 알 수 있었어.'],
      ['민우','처음 구멍으로 돌아오니 한 바퀴 완성! 다음에 박물관에서 만나면 입구의 작은 구멍부터 찾아봐야지.']
    ],()=>{show('workshop');renderPhase();},'완성한 토기 감상하기 →');
  }
  $('start').onclick=()=>show('observe');document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>observe(b.dataset.part));
  $('zoomPhoto').onclick=()=>{const zoom=$('photoMat').classList.toggle('zoomed');$('zoomPhoto').textContent=zoom?'전체 토기 보기 −':'무늬 확대하기 ＋';$('zoomPhoto').setAttribute('aria-pressed',String(zoom));$('foundRing').hidden=zoom;};
  $('toStudio').onclick=()=>{if(!found)return;speak([
    ['민우','구멍이 토기의 입구를 따라 이어져 있어. 우리도 체험용 토기에 이런 무늬를 만들어 보자!'],
    ['서연','구멍 사이를 18mm씩 띄워 보자. 줄자로 잰 전체 길이를 18로 나누면, 한 바퀴에 필요한 구멍 수를 알 수 있어!']
  ],()=>{show('workshop');renderPhase();},'작업대에서 시작하기 →');};
  $('storyPrev').onclick=()=>{if(lineIndex>0){lineIndex--;renderLine();}};$('storyNext').onclick=()=>{if(lineIndex<lines.length-1){lineIndex++;renderLine();}else{const then=storyEnd;storyEnd=null;then?.();}};
  $('minus').onclick=()=>{model.choose(model.guess-1);renderGuess();};$('plus').onclick=()=>{model.choose(model.guess+1);renderGuess();};
  $('hint').onclick=()=>{message('먼저 10개면 180mm예요. 남은 108mm에는 18mm가 몇 번 들어갈까요?');$('hint').textContent='10개부터 더해 보세요';};
  $('mainAction').addEventListener('click',action);
  $('mainAction').addEventListener('pointerdown',e=>{if(!readyToRotate())return;held=true;$('mainAction').classList.add('hold-active');$('mainAction').setPointerCapture(e.pointerId);e.preventDefault();});
  $('mainAction').addEventListener('pointerup',release);$('mainAction').addEventListener('pointercancel',release);$('mainAction').addEventListener('lostpointercapture',release);
  $('potteryHost').addEventListener('pointerdown',e=>{if(e.target.closest('button')||screen!=='workshop'||measuring||document.querySelector('dialog[open]'))return;drag={x:e.clientX,id:e.pointerId};$('potteryHost').setPointerCapture(e.pointerId);});
  $('potteryHost').addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const delta=e.clientX-drag.x;drag.x=e.clientX;rotate(delta/Math.max(300,$('potteryHost').clientWidth)*TAU*1.15);});
  $('potteryHost').addEventListener('pointerup',release);$('potteryHost').addEventListener('pointercancel',release);$('potteryHost').addEventListener('lostpointercapture',release);
  document.addEventListener('keydown',e=>{if(screen!=='workshop'||document.querySelector('dialog[open]'))return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();if(model.phase==='carve')keyHeld=e.key==='ArrowRight'?1:-1;else rotate(e.key==='ArrowRight'?.12:-.12);}
    if((e.key===' '||e.key==='Enter')&&document.activeElement===$('mainAction')&&readyToRotate()){e.preventDefault();held=true;$('mainAction').classList.add('hold-active');}
  });document.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight',' ','Enter'].includes(e.key))release();});
  window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);
  $('actualPhoto').onclick=()=>openDialog('photoDialog');$('help').onclick=()=>openDialog('helpDialog');$('restart').onclick=()=>openDialog('restartDialog');$('confirmRestart').onclick=()=>{$('restartDialog').close();reset();};
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',release));
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'소리 끄기':'소리 켜기';$('sound').setAttribute('aria-pressed',String(sound));tone();};
  function loop(now){
    const dt=Math.min(.05,(now-(lastTime||now))/1000);lastTime=now;const paused=externalPause||document.hidden||!!document.querySelector('dialog[open]');
    if(screen==='workshop'&&!paused){
      if(measuring){measureTime+=dt;const progress=Math.min(1,measureTime/(reduced?.15:1.65));view?.measure(progress);$('rulerFill').style.width=progress*100+'%';$('rulerValue').textContent=Math.round(progress*LENGTH)+'mm';
        if(progress>=1){measuring=false;model.measure();tone();renderPhase();}}
      if((held||keyHeld)&&model.phase==='carve')rotate(dt*.78*(keyHeld||1));
      if(model.phase==='complete'&&view)view.glow=Math.min(1,view.glow+dt*.7);
      if(completeAt&&now>=completeAt&&!endShown){completeAt=0;endStory();}
      if(view)view.render(dt);
    }
    if(now-lastPublish>250){lastPublish=now;publish();}
    requestAnimationFrame(loop);
  }
  window.addEventListener('message',e=>{
    const m=e.data;if(!embedded||!matchingOrigin(e.origin)||e.source!==window.parent||m?.channel!=='geomdan-tour'||m.token!==session)return;
    if(m.type==='init'&&!embeddedReady){
      const s=m.snapshot;reset();sound=!!m.sound;
      if(s?.version===1&&s.found===true){
        observe('rim');
        if(s.stage==='intro'){$('toStudio').onclick();lineIndex=Math.max(0,Math.min(lines.length-1,Number.isInteger(s.lineIndex)?s.lineIndex:0));renderLine();}
        else if(s.stage==='workshop'){
          model.restore(s);show('workshop');angle=model.turn;
          if(view){view.angle=angle;view.setHoles(model.holes);view.setCarving(model.phase==='carve');view.measure(model.phase==='plan'?1:0);}
          renderPhase();if(model.phase==='complete')completeAt=performance.now()+800;
        }
      }
      embeddedReady=true;document.querySelector('main').inert=false;
      window.parent.postMessage({channel:'geomdan-pottery',token:session,type:'initialized'},messageTarget);publish();
    }else if(m.type==='pause'){externalPause=!!m.paused;if(externalPause){release();publish();}}
    else if(m.type==='sound')sound=!!m.sound;
  });
  window.addEventListener('pagehide',()=>publish());window.addEventListener('blur',()=>publish());
  reset();
  if(embedded){document.body.classList.add('embedded');document.querySelector('main').inert=true;window.parent.postMessage({channel:'geomdan-pottery',token:session,type:'ready'},messageTarget);}
  requestAnimationFrame(loop);
})();
