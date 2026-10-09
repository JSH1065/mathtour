(function(){
'use strict';
const P=window.BadukPuzzle,$=id=>document.getElementById(id),bridge=window.CheongnaEmbed,STORE='mathtour-cheongna-baduk-prototype-v1',SOUND=STORE+'-sound';
const read=key=>{try{return localStorage.getItem(key);}catch(_){return null;}},write=(key,value)=>{try{localStorage.setItem(key,value);}catch(_){}};
let recovered=null;try{recovered=P.restore(bridge?bridge.initial:JSON.parse(read(STORE)));}catch(_){}
let mode=recovered?.mode||'photo',state=recovered?.state||P.initial(mode),history=recovered?.history||[P.copy(state)],moves=recovered?.moves||[];
let busy=false,finishing=false,epoch=0,selected=null,hintLevel=0,helpIndex=0,helpIntro=false,helpRAF=0,endTimer=0;
let sound=bridge?bridge.sound:read(SOUND)==='on',audioContext=null;
function soundUI(){$('soundBtn').textContent=sound?'소리 켜짐':'소리 켜기';$('soundBtn').setAttribute('aria-pressed',sound);}
function audio(){if(!sound)return null;try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();return audioContext;}catch(_){return null;}}
function tone(freq,start,duration,volume=.08,type='sine',endFreq=null){const c=audio();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,c.currentTime+start);if(endFreq)o.frequency.exponentialRampToValueAtTime(endFreq,c.currentTime+start+duration);g.gain.setValueAtTime(.0001,c.currentTime+start);g.gain.exponentialRampToValueAtTime(volume,c.currentTime+start+.018);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+start+duration);o.connect(g).connect(c.destination);o.start(c.currentTime+start);o.stop(c.currentTime+start+duration+.05);}
function clickSound(){tone(620,0,.11,.035);}
function jumpSound(){tone(240,0,.42,.055,'sine',780);tone(110,.68,.17,.085,'triangle');tone(880,.72,.5,.025);}
function successSound(){[392,494,587,784,988,1175].forEach((f,i)=>tone(f,.3+i*.34,1.8,.045));tone(196,0,3.7,.035);tone(294,.3,3.5,.025);}
function say(text){$('message').textContent=text;}
function save(){const record={version:1,mode,moves};if(bridge)bridge.save(record);else write(STORE,JSON.stringify(record));}
let world;
try{world=window.BadukScene.create($('canvasHost'),pick);$('loading').hidden=true;}catch(error){
  $('loading').classList.add('error');$('loading').replaceChildren();const p=document.createElement('p');p.textContent='3D 광장을 열지 못했어요. 브라우저의 그래픽 가속을 확인해 주세요.';const small=document.createElement('small');small.textContent=error.message;const b=document.createElement('button');b.textContent='다시 열기';b.onclick=()=>location.reload();$('loading').append(p,small,b);document.querySelectorAll('.controls button').forEach(b=>b.disabled=true);return;
}
function update(){
  $('remaining').textContent=state.length;
  $('modeLabel').textContent=mode==='practice'?'조작 연습 · 3개 돌':'사진 속 배치 · 7개 돌';
  $('phaseLabel').textContent=state.length===1?(mode==='photo'?'우리가 밝힌 바둑판 광장':'돌 하나에 빛이 모였어요'):'불빛을 기다리는 광장';
  $('lightPips').replaceChildren(...Array.from({length:mode==='practice'?3:7},(_,i)=>{const el=document.createElement('i');el.className=state.length===1||i<moves.length?'on':'';return el;}));
  $('undoBtn').disabled=busy||finishing||!moves.length;
  $('hintBtn').disabled=busy||finishing||state.length===1;
  $('resetBtn').disabled=busy||finishing;
  $('helpBtn').disabled=busy;
  $('photoBtn').disabled=busy;
  $('viewBtn').disabled=busy||finishing;$('overviewBtn').disabled=busy||finishing;
  const stone=state.find(p=>p.id===selected);
  $('selectionLabel').textContent=stone?`${stone.color==='white'?'흰':'검은'} 돌 선택 · 빛나는 빈자리를 눌러요.`:'돌을 누르면 갈 수 있는 곳이 나타나요.';
  $('stageNote').hidden=state.length===1;
}
function clearEnding(){clearTimeout(endTimer);epoch++;finishing=false;$('ending').hidden=true;$('viewing').hidden=true;world.resetLight();$('viewBtn').textContent='위에서 보기';$('overviewBtn').textContent='전체 풍경';}
function reset(newMode=mode){clearEnding();mode=newMode;state=P.initial(mode);moves=[];history=[P.copy(state)];busy=false;selected=null;hintLevel=0;world.sync(state);save();update();say(mode==='practice'?'세 개의 돌로 연습해 보자. 가운데 흰 돌을 누르면 갈 수 있는 곳이 보여.':'사진 속 돌들이 제자리에 돌아왔어. 어떤 순서로 빛을 모을까?');$('stageNote').textContent='돌을 누르면 이동할 수 있는 빈자리가 빛나요.';}
function pick(action){
  if(busy||finishing||state.length===1||document.querySelector('dialog[open]'))return;
  audio();
  if(action.type==='stone'){
    if(selected===action.id){selected=null;world.select(null,[]);update();return;}
    selected=action.id;const available=P.moves(state).filter(m=>m.id===selected);world.select(selected,available);hintLevel=0;clickSound();update();
    if(available.length){say(`갈 수 있는 빈자리 ${available.length}곳이 빛나고 있어. 한 곳을 누르면 그 사이의 돌을 뛰어넘어!`);$('stageNote').textContent='청록색 고리에 착지할 수 있어요.';}
    else{say('이 돌은 지금 뛰어넘을 곳이 없어. 같은 줄에 돌이 있고, 그 바로 뒤가 비어 있는 다른 돌을 찾아보자.');$('stageNote').textContent='다른 돌을 골라 보세요.';}
    return;
  }
  if(!selected){say('먼저 움직일 바둑돌을 골라 줘.');return;}
  const move=P.moves(state).find(m=>m.id===selected&&m.to.x===action.x&&m.to.y===action.y);
  if(!move){say('청록색 고리가 있는 빈자리로 갈 수 있어. 대각선이나 두 돌을 한꺼번에 넘는 이동은 할 수 없어.');return;}
  perform(move);
}
async function perform(move){
  if(busy)return;const token=epoch;busy=true;hintLevel=0;update();$('stageNote').textContent='돌 하나를 넘어, 빛을 모으고 있어요.';jumpSound();
  await world.jump(move);if(token!==epoch)return;
  state=P.apply(state,move);moves.push(move);history.push(P.copy(state));selected=null;world.sync(state);busy=false;save();update();
  if(state.length===1){finish(false);return;}
  $('stageNote').textContent='다음 돌을 골라 빛을 이어 모아 주세요.';
  if(!P.moves(state).length)say('더 움직일 수 있는 돌이 없네. 괜찮아! 「한 수 되돌리기」를 눌러 다른 순서를 찾아보자.');
  else say(`${state.length}개가 남았어. 지금 움직인 뒤에도 다음 돌을 뛰어넘을 수 있을지 생각해 보자.`);
}
function showEnd(){
  finishing=false;update();$('endingTitle').textContent=mode==='photo'?'우리가 광장을 밝혔어요!':'이제 움직이는 방법을 알았어요!';
  $('endingText').textContent=mode==='photo'?'마지막 돌에 모인 빛이 바닥을 따라 퍼졌어요. 호숫가의 야경을 함께 바라봐요.':'이번에는 사진 속 검은 돌 3개와 흰 돌 4개로 광장 전체를 밝혀 보세요.';
  $('admireBtn').hidden=mode!=='photo';$('replayLightBtn').hidden=mode!=='photo';$('nextPhotoBtn').hidden=mode!=='practice';$('ending').hidden=false;$('viewing').hidden=true;
  if(mode==='photo')bridge?.complete({version:1,mode,moves});
}
function finish(instant){
  selected=null;world.select(null,[]);hintLevel=0;
  if(mode==='photo'){
    world.illuminate(state[0],instant);if(!instant)successSound();say('우와, 바둑판 전체가 빛나! 우리가 돌 하나에 모은 빛이 광장으로 퍼지고 있어.');
    if(instant){showEnd();return;}finishing=true;update();const token=epoch;endTimer=setTimeout(()=>{if(token===epoch)showEnd();},5100);
  }else{tone(784,0,.8,.06);tone(988,.15,1,.045);showEnd();}
}
$('undoBtn').onclick=()=>{
  if(busy||finishing||!moves.length)return;
  clearEnding();moves.pop();history.pop();state=P.copy(history[history.length-1]);selected=null;hintLevel=0;world.sync(state);save();update();say('한 수 전으로 돌아왔어. 이번에는 다른 방향도 살펴보자.');$('stageNote').textContent='다른 순서로 다시 도전할 수 있어요.';clickSound();
};
$('hintBtn').onclick=()=>{
  if(busy||finishing||state.length===1)return;
  const solution=P.solve(state);
  if(solution===null){
    let back=1;while(back<history.length&&P.solve(history[history.length-1-back])===null)back++;
    say(`지금 배치에서는 돌 하나로 모을 수 없어. 「한 수 되돌리기」로 ${back}수 전까지 돌아가 다른 순서를 시도해 보자.`);return;
  }
  hintLevel++;
  if(hintLevel===1){say('돌이 멀리 떨어져 있어도 같은 줄이면 넘을 수 있어. 먼저 움직이고 나면 다음 돌은 어느 줄에 남게 될까? 힌트를 한 번 더 누르면 돌을 알려 줄게.');return;}
  const move=solution[0];
  if(hintLevel===2){world.hint(move,false);say('금빛 테두리의 돌부터 생각해 보자. 한 번 더 누르면 도착할 자리도 알려 줄게.');}
  else{selected=move.id;world.select(selected,P.moves(state).filter(m=>m.id===selected));world.hint(move,true);update();say('금빛 화살표가 가리키는 빈자리로 옮겨 보자. 그 사이에서 처음 만나는 돌 하나가 사라져.');}
};
$('resetBtn').onclick=()=>{if(!busy&&!finishing)$('resetDialog').showModal();};
$('confirmReset').onclick=()=>{$('resetDialog').close();reset();};
$('viewBtn').onclick=()=>{$('viewBtn').textContent=world.toggleView()==='top'?'광장에서 보기':'위에서 보기';$('overviewBtn').textContent='전체 풍경';};
$('overviewBtn').onclick=()=>{$('overviewBtn').textContent=world.overview()==='overview'?'원래 시점':'전체 풍경';$('viewBtn').textContent='위에서 보기';};
$('soundBtn').onclick=()=>{sound=!sound;if(bridge)bridge.setSound(sound);else write(SOUND,sound?'on':'off');soundUI();if(sound){audio();clickSound();}else if(audioContext)audioContext.suspend();};soundUI();
$('admireBtn').onclick=()=>{$('ending').hidden=true;$('viewing').hidden=false;};
$('showResultBtn').onclick=showEnd;
$('replayLightBtn').onclick=()=>{if(mode!=='photo'||state.length!==1)return;$('ending').hidden=true;$('viewing').hidden=true;clearTimeout(endTimer);finish(false);};
$('nextPhotoBtn').onclick=()=>{reset('photo');say('이제 사진 속 배치 그대로 도전해 보자. 앞쪽에 떨어진 흰 돌도 같은 줄을 이용해서 연결할 수 있어.');};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('photoBtn').onclick=()=>{$('photoDialog').showModal();};
function photo(kind){
  const options={day:['dayPhotoBtn','검은 돌 3개와 흰 돌 4개가 놓인 실제 광장'],night:['nightPhotoBtn','바닥 격자를 따라 금빛 조명이 켜진 실제 광장의 야경'],plaza:['plazaPhotoBtn','청라루 옆에 낮은 단으로 놓인 바둑판 광장'],aerial:['aerialPhotoBtn','호숫가 청라루와 양옆 광장, 뒤쪽 산책로를 함께 본 항공사진']};
  $('referencePhoto').src=`asset/cheongna-baduk/reference-${kind}.webp`;$('referencePhoto').alt=options[kind][1];
  Object.entries(options).forEach(([key,[button]])=>$(button).setAttribute('aria-pressed',key===kind));
}
$('dayPhotoBtn').onclick=()=>photo('day');$('nightPhotoBtn').onclick=()=>photo('night');$('plazaPhotoBtn').onclick=()=>photo('plaza');$('aerialPhotoBtn').onclick=()=>photo('aerial');
function demo(){
  const canvas=$('ruleDemo');if(!canvas)return;const ctx=canvas.getContext('2d'),begin=performance.now();canvas.width=640;canvas.height=190;
  function draw(now){if(!canvas.isConnected)return;const t=((now-begin)/1000)%5.6;ctx.clearRect(0,0,640,190);ctx.fillStyle='#e9dfc9';ctx.fillRect(0,0,640,190);
    const xs=[78,238,398,558],y=101;ctx.strokeStyle='#9c8e70';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(596,y);ctx.stroke();for(const x of xs){ctx.beginPath();ctx.moveTo(x,63);ctx.lineTo(x,133);ctx.stroke();}
    const u=Math.max(0,Math.min(1,(t-1.5)/1.35)),e=u*u*(3-2*u),movingX=xs[0]+(xs[3]-xs[0])*e,movingY=y-Math.sin(Math.PI*u)*52;
    function stone(x,yy,white,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#24373c28';ctx.beginPath();ctx.ellipse(x+4,yy+13,29,12,0,0,Math.PI*2);ctx.fill();const g=ctx.createRadialGradient(x-12,yy-14,1,x,yy,30);g.addColorStop(0,white?'#fffef7':'#798188');g.addColorStop(1,white?'#bbbeb6':'#17242c');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,yy,30,24,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    if(u<.94)stone(xs[2],y,true,1-Math.max(0,(u-.5)/.44));stone(movingX,movingY,false);
    ctx.strokeStyle='#299b8c';ctx.lineWidth=3;if(u<1){ctx.beginPath();ctx.ellipse(xs[3],y,36,27,0,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#234c56';ctx.font='bold 18px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.fillText(u<1?'중간에 빈자리가 있어도 괜찮아요.':'넘은 돌은 사라지고, 움직인 돌은 남아요.',320,29);
    ctx.font='14px "Malgun Gothic",sans-serif';ctx.fillText(u<1?'같은 줄의 첫 돌을 넘어 → 바로 뒤 빈자리로':'검은 돌과 흰 돌 모두 같은 방법으로 움직여요.',320,170);helpRAF=requestAnimationFrame(draw);
  }helpRAF=requestAnimationFrame(draw);
}
function renderHelp(){
  cancelAnimationFrame(helpRAF);const content=$('helpContent');
  if(helpIndex===0)content.innerHTML='<h2 id="helpTitle">청라루 옆, 커다란 바둑판 광장</h2><img class="help-picture" src="asset/cheongna-baduk/reference-day.webp" alt="실제 바둑판 광장의 돌 배치"><p>검은 돌 <strong>3개</strong>, 흰 돌 <strong>4개</strong>가 놓여 있어요. 사진 속 위치를 참고해 바둑돌 퍼즐을 만들었어요.</p><p class="help-callout">서연: “마지막 돌 하나에 빛을 모으면, 이 광장의 금빛 조명이 켜진대!”</p>';
  if(helpIndex===1){content.innerHTML='<h2 id="helpTitle">같은 줄의 돌 하나를 뛰어넘어요.</h2><canvas id="ruleDemo" aria-label="빈자리 너머 같은 줄의 돌 하나를 뛰어넘어 바로 뒤 빈자리에 놓는 움직임 시범"></canvas><p><strong>움직일 돌 → 빛나는 빈자리</strong>를 차례로 눌러요. 가로·세로로 처음 만나는 돌 하나를 넘어, 그 <strong>바로 뒤</strong>에 내려놓아요.</p><p class="help-callout">중간에 빈자리가 있어도 괜찮아요. 대각선으로 움직이거나 두 돌을 한꺼번에 뛰어넘을 수는 없어요.</p>';demo();}
  if(helpIndex===2){content.innerHTML='<h2 id="helpTitle">마지막 돌이 광장을 밝혀요.</h2><img class="help-picture" src="asset/cheongna-baduk/reference-night.webp" alt="완성하면 만나게 될 실제 광장 야경"><p>돌 하나만 남기면 성공! 막히면 <strong>한 수 되돌리기</strong>와 <strong>서연이 힌트</strong>를 써 보세요. 시간 제한은 없어요.</p><p class="help-callout">이 창을 다시 열어도 지금까지 움직인 돌은 그대로 남아 있어요.</p>';
    if(helpIntro){const actions=document.createElement('div');actions.className='help-actions';const b=document.createElement('button');b.id='practiceStart';b.textContent='돌 3개로 먼저 연습';b.onclick=()=>{$('helpDialog').close();reset('practice');};actions.append(b);content.append(actions);}
  }
  $('helpPrev').disabled=helpIndex===0;$('helpPage').textContent=`${helpIndex+1} / 3`;$('helpNext').textContent=helpIndex===2?(helpIntro?'사진 속 배치로 시작':'하던 곳으로 돌아가기'):'다음 →';
}
function openHelp(intro=false){helpIntro=intro;helpIndex=0;renderHelp();$('helpDialog').showModal();$('helpNext').focus();}
function nextHelp(){if(helpIndex<2){helpIndex++;renderHelp();}else{$('helpDialog').close();if(helpIntro)say('먼저 돌을 눌러 보자. 청록색 고리가 나타나면 그 빈자리로 갈 수 있어.');}}
$('helpBtn').onclick=()=>openHelp(false);$('helpPrev').onclick=()=>{helpIndex=Math.max(0,helpIndex-1);renderHelp();};$('helpNext').onclick=nextHelp;
$('helpContent').onclick=e=>{if(!e.target.closest('button,a'))nextHelp();};
$('helpDialog').addEventListener('close',()=>cancelAnimationFrame(helpRAF));
document.addEventListener('keydown',e=>{
  if(e.repeat)return;
  if($('helpDialog').open){if(e.key==='ArrowLeft'){e.preventDefault();helpIndex=Math.max(0,helpIndex-1);renderHelp();return;}if(['Enter',' '].includes(e.key)&&!e.target.closest('button,a,input')){e.preventDefault();nextHelp();}return;}
  if(document.querySelector('dialog[open]'))return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$('undoBtn').click();}
});
window.addEventListener('baduk-context-lost',()=>{busy=true;update();$('loading').hidden=false;$('loading').textContent='그래픽 연결이 끊어졌어요. 새로고침하면 마지막 이동부터 이어집니다.';});
document.addEventListener('visibilitychange',()=>{if(audioContext){if(document.hidden)audioContext.suspend();else if(sound)audioContext.resume();}});
world.sync(state);update();if(state.length===1)finish(true);else if(!recovered)openHelp(true);else say('하던 배치가 그대로 남아 있어. 이어서 빛을 모아 보자.');
// Read-only diagnostics for the isolated browser checks; no progress or win bypass.
window.CheongnaBaduk=Object.freeze({inspect:()=>({mode,state:P.copy(state),moves:JSON.parse(JSON.stringify(moves)),busy,finishing,selected,legal:P.moves(state),camera:world.info(),projections:state.map(p=>({id:p.id,...world.project(p)})),targets:P.moves(state).filter(m=>m.id===selected).map(m=>({gx:m.to.x,gy:m.to.y,...world.project(m.to)}))})});
if(bridge){bridge.onPause=()=>audioContext?.suspend();bridge.onResume=()=>{if(sound)audioContext?.resume();};bridge.ready();}
})();
