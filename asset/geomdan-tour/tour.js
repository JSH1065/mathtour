(() => {
  'use strict';
  const $=id=>document.getElementById(id),D=GeomdanTourData,P=GeomdanProgress;
  // file: frames have opaque message origins. Keep source and session checks below.
  const fileMode=location.protocol==='file:',messageTarget=fileMode?'*':location.origin;
  const matchingOrigin=origin=>fileMode?origin==='null':origin===location.origin;
  const fresh=()=>({version:1,step:0,line:0,seen:[],game:null,departed:false});
  function normalize(raw){
    const s=fresh();if(raw?.version!==1)return s;
    s.step=Number.isInteger(raw.step)?Math.max(0,Math.min(D.recapStep,raw.step)):0;
    s.line=Number.isInteger(raw.line)?Math.max(0,Math.min(4,raw.line)):0;
    s.seen=Array.isArray(raw.seen)?raw.seen.filter(k=>Object.hasOwn(D.photos,k)):[];
    s.game=raw.game?.version===1?raw.game:null;s.departed=raw.departed===true&&P.validGame(s.game);
    if(s.step>D.gameStep&&!P.validGame(s.game)){s.step=D.gameStep;s.line=0;}
    if(s.step===D.recapStep&&!s.departed)s.step=D.departureStep;
    return s;
  }
  let state=normalize(P.load()),run=P.status().run,screen='arrival',sound=false,audio=null;
  let frameSession='',frameReady=false,frameInitialized=false,departTimer=0,loadTimer=0,blocked=false;
  const frame=$('potteryFrame'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function checkRun(){
    if(blocked)return false;
    if(P.status().run!==run){blocked=true;clearTimeout(departTimer);clearTimeout(loadTimer);sendFrame('pause',{paused:true});$('main').inert=true;
      document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('resetNotice').showModal();return false;}
    return true;
  }
  function persist(finish=false){if(checkRun())$('saveNotice').hidden=P.save('museum',state,run,finish);}
  function sendFrame(type,data={}){if(frameSession)frame.contentWindow?.postMessage({channel:'geomdan-tour',token:frameSession,type,...data},messageTarget);}
  function syncPause(){sendFrame('pause',{paused:blocked||screen!=='game'||document.hidden||!!document.querySelector('dialog[open]')});}
  function show(id){screen=id;document.querySelectorAll('main>.screen').forEach(e=>e.hidden=e.id!==id);syncPause();}
  function cue(){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();[523.25,659.25,783.99].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.09;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.045,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.32);});}catch{}}
  function enter(step,line=0){if(!checkRun())return;clearTimeout(departTimer);state.step=step;state.line=line;persist();render();}
  function next(){enter(Math.min(D.recapStep,state.step+1));}
  function sceneImage(scene){const img=$('story').querySelector('.backdrop');if(img.getAttribute('src')!==scene.art)img.src=scene.art;img.alt=D.photos[scene.photo].title+' 일러스트';}
  function render(){
    if(!checkRun())return;
    const s=D.steps[state.step];show(s.type);
    if(s.type==='arrival'){arrival();return;}
    if(s.type==='story'){
      const scene=D.scenes[s.scene];sceneImage(scene);$('story').classList.toggle('lit',!!s.lit);$('story').querySelector('.scene-tag').textContent=s.tag;
      state.line=Math.min(state.line,s.lines.length-1);const [who,text]=s.lines[state.line];
      $('speaker').textContent=who;$('lineText').textContent=text;$('lineCount').textContent=`${state.line+1} / ${s.lines.length}`;
      $('storyPrev').disabled=state.line===0;$('storyNext').textContent=state.line===s.lines.length-1?s.button:'다음 →';
      document.querySelectorAll('#story .person').forEach(e=>e.classList.toggle('speaking',e.alt===who));
      if(s.lit&&state.line===0)cue();
    }else if(s.type==='photos'){
      const p=D.photos[s.photo];if(!state.seen.includes(s.photo)){state.seen.push(s.photo);persist();}
      $('photoImage').src=p.src;$('photoImage').alt=p.title;$('photoTitle').textContent=p.title;$('photoText').textContent=p.text;$('photoLook').textContent=p.look;$('photoCredit').textContent=p.credit;$('photoSource').href=p.source;
      const photoSteps=D.steps.filter(t=>t.type==='photos');$('photoCount').textContent=`${photoSteps.indexOf(s)+1} / ${photoSteps.length}`;
      document.querySelectorAll('[data-stop]').forEach(e=>e.classList.toggle('active',Number(e.dataset.stop)===s.stop));
      $('photoNext').textContent=state.step===7?'관람 마치기 →':D.steps[state.step+1].type==='story'?'이야기 나누기 →':'다음 전시로 →';
    }else if(s.type==='game'){
      if(P.validGame(state.game)){enter(D.endingStep);return;}
      if(!frameSession)loadGame();else syncPause();
    }else if(s.type==='departure'){
      const bus=$('departBus');bus.classList.remove('depart-bus');void bus.offsetWidth;bus.classList.add('depart-bus');
      departTimer=setTimeout(finishDeparture,reduced?700:4300);
    }
  }
  function arrival(){
    show('arrival');$('resume').hidden=state.step===0;
    $('leaveBus').disabled=true;$('leaveBus').textContent='버스가 도착하고 있어요…';
    const bus=$('bus');bus.classList.remove('arriving');void bus.offsetWidth;bus.classList.add('arriving');
    setTimeout(()=>{if(!checkRun())return;$('leaveBus').disabled=false;$('leaveBus').textContent='버스에서 내리기 →';},reduced?30:1650);
  }
  function loadGame(){
    frameSession=crypto.randomUUID();frameReady=false;frameInitialized=false;$('frameLoading').hidden=false;$('retryGame').hidden=true;
    const url=new URL('asset/activities/geomdan-pottery.html',location.href);url.searchParams.set('embed','geomdan');url.searchParams.set('session',frameSession);frame.src=url.href;
    clearTimeout(loadTimer);loadTimer=setTimeout(()=>{if(!frameReady)$('retryGame').hidden=false;},12000);
  }
  window.addEventListener('message',e=>{
    const m=e.data;if(!matchingOrigin(e.origin)||e.source!==frame.contentWindow||m?.channel!=='geomdan-pottery'||m.token!==frameSession||!checkRun())return;
    if(m.type==='ready'&&!frameInitialized){frameInitialized=true;sendFrame('init',{snapshot:state.game,sound});}
    if(m.type==='initialized'){frameReady=true;clearTimeout(loadTimer);$('frameLoading').hidden=true;syncPause();}
    if(m.type==='snapshot'&&screen==='game'&&m.snapshot?.version===1){state.game=m.snapshot;persist();}
    if(m.type==='complete'&&screen==='game'&&P.validGame(m.snapshot)){
      state.game=m.snapshot;persist();cue();enter(D.endingStep);
    }
  });
  function finishDeparture(){if(!checkRun()||state.step!==D.departureStep||!P.validGame(state.game))return;clearTimeout(departTimer);state.departed=true;state.step=D.recapStep;state.line=0;persist(true);render();}
  function openDialog(id){$(id).showModal();syncPause();}
  function actual(key){const p=D.photos[key];$('realTitle').textContent=p.title;$('realImage').src=p.src;$('realImage').alt=p.title;$('realCaption').textContent=p.credit;$('realSource').href=p.source;openDialog('photoDialog');}
  function note(){
    const completed=P.validGame(state.game);
    $('noteBody').innerHTML='<p>옛사람의 생활을 발견하고, 작은 무늬에서 수학의 빛을 찾아요.</p><div class="note-stops">'+[['gallery','제1전시실'],['knife','반달돌칼'],['houses','집터'],['storage','보이는 수장고']].map(([key,title])=>`<span class="${state.seen.includes(key)?'seen':''}">${state.seen.includes(key)?'✓':'○'} ${title}</span>`).join('')+`</div><p>${completed?'✦ 토기 공방의 빛을 찾았어요.':'토기 공방의 빛은 아직 기다리고 있어요.'}</p>`+(completed?'<div class="note-math">288 ÷ 18 = 16</div><p>전체 길이 ÷ 같은 간격 = 간격의 수.<br>한 바퀴는 시작과 끝이 같아서 구멍의 수와 간격의 수가 같아요.</p>':'<p>관찰 → 둘레 재기 → 같은 간격으로 나누기 → 직접 돌리기</p>')+'<p>학생 원안 · 황용하<br>나눗셈으로 개수를 구하는 아이디어를 토기 만들기 체험으로 연결했어요.</p>';
    openDialog('note');
  }
  function restart(){
    clearTimeout(departTimer);clearTimeout(loadTimer);sendFrame('pause',{paused:true});frame.removeAttribute('src');frameSession='';frameReady=false;frameInitialized=false;state=fresh();state.step=1;persist();document.querySelectorAll('dialog[open]').forEach(d=>d.close());render();
  }
  $('leaveBus').onclick=()=>{if(state.step>0){openDialog('restartDialog');return;}cue();enter(1);};
  $('resume').onclick=()=>{cue();render();};
  $('storyNext').onclick=()=>{const s=D.steps[state.step];if(state.line<s.lines.length-1){state.line++;persist();render();}else next();};
  $('storyPrev').onclick=()=>{if(state.line>0){state.line--;persist();render();}};
  $('photoNext').onclick=next;$('photoPrev').onclick=()=>enter(state.step-1);
  $('messageNext').onclick=next;$('finishDeparture').onclick=finishDeparture;
  $('enlarge').onclick=()=>actual(D.steps[state.step].photo);
  document.querySelector('.real-open').onclick=()=>actual(D.scenes[D.steps[state.step].scene].photo);
  $('journal').onclick=note;$('restartOpen').onclick=()=>openDialog('restartDialog');$('restart').onclick=restart;
  $('reviewTour').onclick=()=>enter(1);$('retryGame').onclick=loadGame;
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'소리 끄기':'소리 켜기';$('sound').setAttribute('aria-pressed',String(sound));sendFrame('sound',{sound});cue();};
  $('sourcesOpen').onclick=()=>{
    $('sourcesList').innerHTML=Object.values(D.photos).map(p=>`<p><a href="${p.source}" target="_blank" rel="noopener">${p.title} ↗</a><br>${p.credit}</p>`).join('')+'<p><a target="_blank" rel="noopener" href="https://www.incheon.go.kr/museum/MU030601/3006926">불로동 출토 구멍무늬토기 ↗</a><br>검단선사박물관 · 공공누리 제2유형(출처표시·상업적 이용금지)</p><p>외관·전시실 배경: 실제 사진을 참고한 AI 창작 일러스트.</p>';
    openDialog('sources');
  };
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',syncPause));
  window.addEventListener('mathtour:geomdan-progress',checkRun);window.addEventListener('focus',()=>{checkRun();syncPause();});document.addEventListener('visibilitychange',()=>{checkRun();syncPause();});
  for(const scene of Object.values(D.scenes)){const img=new Image();img.src=scene.art;}
  arrival();
})();
