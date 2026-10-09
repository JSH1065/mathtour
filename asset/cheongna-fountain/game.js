(function(){
'use strict';
const $=id=>document.getElementById(id),R=window.FountainRhythm,A=window.FountainAudio.create(),bridge=window.CheongnaEmbed,KEY='mathtour-cheongna-fountain-prototype-v2';
const labels={1:'톡! 솟기',2:'살랑 흔들기',4:'활짝 펼치기'},classes={1:'one',2:'two',4:'four'},notes={1:'♩',2:'𝅗𝅥',4:'𝅝'};
let state=R.initial(),selected=0,world=null,sceneAttempted=false,playing=false,starting=false,lastBeat=-1,playRequest=0,helpPage=0,drag=null,pickedBead=null,suppressClickUntil=0,advanceTimer=null,transitioning=false,muted=false;
try{const saved=R.restore(bridge?bridge.initial:JSON.parse(localStorage.getItem(KEY)));if(saved)state=saved;const sound=bridge?(bridge.sound===false?'off':'on'):(localStorage.getItem(KEY+'-sound')??localStorage.getItem('mathtour-cheongna-fountain-prototype-v1-sound'));muted=sound==='off';}catch(e){}
if(state.phase==='share'&&R.equal(state.beads))state.phase='answer';
function save(){const snapshot={version:2,...state};if(bridge){bridge.save(snapshot);return;}try{localStorage.setItem(KEY,JSON.stringify(snapshot));localStorage.setItem(KEY+'-sound',muted?'off':'on');}catch(e){}}
function soundLabel(){$('soundBtn').textContent=muted?'소리 켜기':'소리 켜짐';$('soundBtn').setAttribute('aria-pressed',String(!muted));}
function instructionText(el,text){const phrase='중복되지 않게',at=text.indexOf(phrase);el.replaceChildren();if(at<0){el.textContent=text;return;}const strong=document.createElement('strong');strong.className='rule-emphasis';strong.textContent=phrase;el.append(text.slice(0,at),strong,text.slice(at+phrase.length));}
function feedback(id,text,type=''){const el=$(id);instructionText(el,text);el.className='feedback '+type;if(type==='error')A.cue(false);}
function isComposing(){return state.phase==='compose'||state.phase==='done';}
function cue(){A.cue(true);}
function bead(id){const el=document.createElement('button');el.type='button';el.className='beat-bead';el.dataset.bead=id;el.textContent='♩';el.setAttribute('aria-label',`1박 구슬 ${id+1}, ${state.beads[id]<0?'나눌 박 구슬 칸':(state.beads[id]+1)+'마디'}, 끌어서 옮기기`);if(pickedBead===id)el.classList.add('picked');return el;}
function renderShare(){
 const counts=R.counts(state.beads),remaining=state.beads.filter(n=>n<0).length;$('poolCount').textContent=remaining;$('poolBeads').replaceChildren();
 state.beads.forEach((destination,id)=>{if(destination<0)$('poolBeads').append(bead(id));else{const placeholder=document.createElement('span');placeholder.className='beat-placeholder';placeholder.setAttribute('aria-hidden','true');$('poolBeads').append(placeholder);}});
 $('shareMeasures').replaceChildren();
 for(let i=0;i<R.GROUPS;i++){
  const basket=document.createElement('div');basket.className='measure-basket'+(!remaining&&counts[i]!==4?' unbalanced':'');basket.dataset.destination=i;basket.tabIndex=0;basket.setAttribute('role','group');basket.setAttribute('aria-label',`${i+1}마디, ${counts[i]}박, 구슬 놓을 곳`);
  basket.innerHTML=`<div class="basket-heading"><strong>${i+1}마디</strong><small>${counts[i]}박</small></div><div class="basket-beads"></div>`;
  const container=basket.querySelector('.basket-beads');state.beads.forEach((destination,id)=>{if(destination===i)container.append(bead(id));});
  $('shareMeasures').append(basket);
 }
 $('shareScreen').classList.toggle('locked',transitioning);
}
function renderAnswer(){
 $('answerBeads').innerHTML=R.counts(state.beads).map((n,i)=>`<div class="answer-mini"><small>${i+1}마디</small><div>${'<i aria-hidden="true">♩</i>'.repeat(n)}</div></div>`).join('');
}
function renderScore(){
 const analysis=R.analyze(state.score);$('scoreRows').replaceChildren();
 state.score.forEach((blocks,i)=>{
  const duplicate=analysis.duplicates.find(group=>group.includes(i)),used=blocks.reduce((n,b)=>n+b.beats,0),complete=R.complete(blocks);
  const row=document.createElement('div');row.className='score-row'+(duplicate?' duplicate':complete?' complete':'');row.dataset.measure=i;row.tabIndex=-1;
  const status=duplicate?duplicate.filter(n=>n!==i).map(n=>n+1).join('·')+'마디와 같아요':complete?'✓ 완성':used+' / 4박';
  row.innerHTML=`<div class="measure-name"><strong>${i+1}마디</strong><span class="row-status">${status}</span></div><div class="measure-track" aria-label="${i+1}마디 악보"></div>`;
  const track=row.querySelector('.measure-track');
  for(let cell=0;cell<4;cell++){
   const slot=document.createElement('button');slot.className='beat-slot';slot.dataset.measure=i;slot.dataset.slot=cell;slot.style.gridColumn=cell+1;slot.textContent='＋';slot.disabled=playing||starting;slot.setAttribute('aria-label',`${i+1}마디 ${cell+1}박 칸에 블록 놓기`);
   if(blocks.some(b=>cell>=b.start&&cell<b.start+b.beats)){slot.classList.add('covered');slot.tabIndex=-1;}track.append(slot);
  }
  blocks.forEach(b=>{
   const block=document.createElement('button');block.className='music-block '+classes[b.beats];block.dataset.measure=i;block.dataset.start=b.start;block.dataset.beats=b.beats;block.style.gridColumn=`${b.start+1} / span ${b.beats}`;block.disabled=playing||starting;block.setAttribute('aria-label',`${i+1}마디 ${b.start+1}박부터 ${b.beats}박 블록, 누르면 빼기`);block.innerHTML=`<span aria-hidden="true">${notes[b.beats]}</span><strong>${b.beats}박</strong>`;track.append(block);
  });
  for(let cell=0;cell<4;cell++){const marker=document.createElement('span');marker.className='beat-marker';marker.dataset.beat=cell;marker.style.gridColumn=cell+1;marker.setAttribute('aria-hidden','true');track.append(marker);}
  $('scoreRows').append(row);
 });
 $('progress').innerHTML=`서로 다른 리듬 <b>${analysis.distinct} / 6</b> 완성`;$('playBtn').textContent=state.phase==='done'?'▶ 공연 다시 보기':'▶ 공연해 보기';
}
function ensureScene(){
 if(sceneAttempted)return;sceneAttempted=true;try{world=window.FountainScene.create($('canvasHost'));$('loading').hidden=true;}catch(e){$('loading').textContent='3D 분수를 표시하지 못했어요. 악보와 음악은 계속 체험할 수 있어요.';}
}
function render(){
 $('shareScreen').hidden=state.phase!=='share';$('answerScreen').hidden=state.phase!=='answer';$('composeScreen').hidden=!isComposing();
 instructionText($('taskTitle'),state.phase==='share'?'24박을 6마디에 똑같이 나누세요.':state.phase==='answer'?'한 마디는 몇 박일까요?':playing?'내가 만든 여섯 마디로 공연 중이에요.':state.phase==='done'?'서로 다른 여섯 마디로 공연을 완성했어요.':'중복되지 않게 6마디를 만드세요.');
 if(state.phase==='share')renderShare();if(state.phase==='answer')renderAnswer();
 if(isComposing()){ensureScene();renderScore();}
 document.querySelectorAll('.block-choice').forEach(b=>{b.disabled=playing||starting;b.setAttribute('aria-pressed',String(Number(b.dataset.beats)===selected));});
 document.body.classList.toggle('performing',playing);document.body.classList.toggle('showtime',playing||starting||state.phase==='done');$('playBtn').hidden=playing;$('playBtn').disabled=starting;$('stopBtn').hidden=!playing;$('finishCard').hidden=state.phase!=='done'||playing;$('performanceHud').hidden=!playing;
 $('sceneLabel').textContent=playing?'내가 만든 악보로 공연 중':state.phase==='done'?'우리가 완성한 음악분수':'우리가 만드는 음악분수';save();
}
function moveBead(id,destination){
 if(state.phase!=='share'||transitioning||!Number.isInteger(id)||id<0||id>=24||!Number.isInteger(destination)||destination< -1||destination>=6)return;
 if(state.beads[id]===destination)return;state.beads[id]=destination;pickedBead=null;renderShare();save();cue();
 const remaining=state.beads.filter(n=>n<0).length;
 if(R.equal(state.beads)){
  transitioning=true;$('shareScreen').classList.add('locked');feedback('shareMessage','모두 똑같이 나눴어요!','success');
  advanceTimer=setTimeout(()=>{advanceTimer=null;transitioning=false;if(state.phase==='share'){state.phase='answer';render();}},450);
 }else if(!remaining){feedback('shareMessage','구슬 수가 달라요. 마디 사이로 옮겨 보세요.','error');}
 else{feedback('shareMessage',destination<0?`구슬을 돌려놓았어요.`:`${destination+1}마디에 놓았어요.`);}
}
$('answerForm').addEventListener('submit',e=>{
 e.preventDefault();if(state.phase!=='answer')return;const value=$('answerInput').value.trim();
 if(!/^\d+$/.test(value)||Number(value)!==4){$('answerInput').setAttribute('aria-invalid','true');feedback('answerMessage',value?'아래에서 한 마디에 놓인 구슬을 다시 세어 보세요.':'한 마디에 필요한 박 수를 써 주세요.','error');$('answerInput').focus();return;}
 $('answerInput').removeAttribute('aria-invalid');$('answerInput').blur();state.answer=4;state.phase='compose';render();cue();feedback('scoreMessage','한 마디는 4박이에요.','success');
});
function selectBlock(beats,preview=true){
 if(!isComposing()||playing||starting)return;selected=beats;
 if(state.phase==='done'){state.phase='compose';render();}
 document.querySelectorAll('.block-choice').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.beats)===beats)));
 $('selectionText').textContent=`${beats}박 선택 · 원하는 마디의 시작 칸에 놓아요.`;
 if(preview){A.setEnabled(!muted);A.audition(beats);$('sceneLabel').textContent=`${labels[beats]} · ${beats}박 미리 보기`;}
}
function highlightRows(indices){for(const index of indices){const row=$('scoreRows').children[index];row.classList.remove('attention');void row.offsetWidth;row.classList.add('attention');}}
function describeRow(index){
 const analysis=R.analyze(state.score),dupe=analysis.duplicates.find(group=>group.includes(index));
 if(dupe){const others=dupe.filter(n=>n!==index).map(n=>(n+1)+'마디').join('·');feedback('scoreMessage',`${index+1}마디와 ${others}의 리듬이 같아요. 블록이나 순서를 바꿔 보세요.`,'error');highlightRows(dupe);}
 else if(analysis.ready){feedback('scoreMessage','서로 다른 여섯 마디 완성! 이제 공연해 보세요.','success');cue();}
 else if(R.complete(state.score[index])){feedback('scoreMessage',`${index+1}마디 완성! 서로 다른 리듬을 ${analysis.distinct}가지 만들었어요.`,'success');cue();}
 else feedback('scoreMessage',`${index+1}마디에 4박이 되도록 블록을 채워 주세요.`);
}
function placeBlock(index,start,beats=selected){
 if(!isComposing()||playing||starting)return;if(!beats){feedback('scoreMessage','먼저 왼쪽에서 1박·2박·4박 블록 중 하나를 골라 주세요.','error');return;}
 const next=R.place(state.score[index],start,beats);
 if(!next){feedback('scoreMessage',start+beats>4?`${beats}박 블록은 ${beats}칸이 필요해요. 더 왼쪽 칸부터 놓아 보세요.`:'다른 블록과 겹쳐요. 놓인 블록을 누르면 뺄 수 있어요.','error');return;}
 state.score[index]=next;state.phase='compose';render();describeRow(index);
}
function removeBlock(index,start){if(playing||starting)return;A.stop();state.score[index]=state.score[index].filter(b=>b.start!==start);state.phase='compose';render();describeRow(index);}
$('scoreRows').addEventListener('click',e=>{
 if(performance.now()<suppressClickUntil)return;const filled=e.target.closest('.music-block');if(filled){removeBlock(Number(filled.dataset.measure),Number(filled.dataset.start));return;}
 const slot=e.target.closest('.beat-slot');if(slot)placeBlock(Number(slot.dataset.measure),Number(slot.dataset.slot));
});
document.querySelectorAll('.block-choice').forEach(b=>b.addEventListener('click',e=>{if(e.detail===0)selectBlock(Number(b.dataset.beats));}));
async function play(){
 if(playing||starting)return;const analysis=R.analyze(state.score);
 if(analysis.incomplete.length){feedback('scoreMessage',`${analysis.incomplete.map(n=>n+1).join('·')}마디에 빈칸이 있어요. 각 마디를 4박으로 채워 주세요.`,'error');highlightRows(analysis.incomplete);return;}
 if(analysis.duplicates.length){const pair=analysis.duplicates[0];feedback('scoreMessage',`${pair.map(n=>(n+1)+'마디').join('와 ')}의 리듬이 같아요. 서로 다르게 바꾸면 공연할 수 있어요.`,'error');highlightRows(analysis.duplicates.flat());return;}
 const ticket=++playRequest;starting=true;state.phase='compose';render();A.setEnabled(!muted);const ok=await A.start(state.score,{leadIn:2.4});if(ticket!==playRequest)return;starting=false;if(!ok){render();return;}
 playing=true;lastBeat=-1;render();$('sceneLabel').textContent='저녁에서 깊은 밤으로';$('playingMeasure').textContent='밤이 깊어지는 중';$('playingBeat').textContent='곧 공연이 시작돼요';feedback('scoreMessage','1마디부터 6마디까지, 빛나는 박을 따라 들어 보세요.');
}
function stop(reason='공연을 멈췄어요. 만든 악보는 그대로 있어요.'){playRequest++;A.stop();playing=false;starting=false;lastBeat=-1;if(state.phase==='done')state.phase='compose';render();if(isComposing())feedback('scoreMessage',reason);}
$('playBtn').onclick=play;$('stopBtn').onclick=()=>stop();$('editBtn').onclick=()=>{stop('놓인 블록을 눌러 빼고, 다른 순서로 조합해 보세요.');};
$('soundBtn').onclick=()=>{muted=!muted;A.setEnabled(!muted);soundLabel();save();bridge?.setSound(!muted);if(!muted)cue();};
// A bead keeps its identity while moving between any basket and the source tray.
function clearDrag(){
 if(drag){drag.source.classList.remove('drag-source');try{drag.source.releasePointerCapture?.(drag.id);}catch(e){}}
 drag=null;$('dragGhost').hidden=true;document.body.classList.remove('dragging');document.querySelectorAll('.drop-target,.preview-slot').forEach(el=>el.classList.remove('drop-target','preview-slot'));
}
function hitTarget(x,y,kind){return document.elementFromPoint(x,y)?.closest(kind==='bead'?'[data-destination]':'.beat-slot,.music-block');}
document.addEventListener('pointerdown',e=>{
 if(e.isPrimary===false)return;suppressClickUntil=0;
 A.setEnabled(!muted);if(e.button!==0||playing||starting||transitioning||document.querySelector('dialog[open]'))return;
 const token=e.target.closest('.beat-bead'),choice=e.target.closest('.block-choice');if(!token&&!choice)return;
 if(token&&state.phase!=='share')return;
 drag={id:e.pointerId,x:e.clientX,y:e.clientY,kind:token?'bead':'block',bead:token?Number(token.dataset.bead):null,beats:choice?Number(choice.dataset.beats):0,moved:false,source:token||choice};
 drag.source.setPointerCapture?.(e.pointerId);
});
document.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;drag.source.classList.add('drag-source');document.body.classList.add('dragging');$('dragGhost').hidden=false;$('dragGhost').textContent=drag.kind==='bead'?'♩ 1박':notes[drag.beats]+' '+drag.beats+'박';if(drag.kind==='block')selectBlock(drag.beats,false);}
 if(!drag.moved)return;e.preventDefault();$('dragGhost').style.left=e.clientX+'px';$('dragGhost').style.top=e.clientY+'px';document.querySelectorAll('.drop-target,.preview-slot').forEach(el=>el.classList.remove('drop-target','preview-slot'));
 const target=hitTarget(e.clientX,e.clientY,drag.kind);
 if(drag.kind==='bead')target?.classList.add('drop-target');
 else if(target){const index=Number(target.dataset.measure),start=Number(target.dataset.slot??target.dataset.start);if(R.place(state.score[index],start,drag.beats))for(let n=start;n<start+drag.beats;n++)$('scoreRows').children[index].querySelector(`[data-slot="${n}"]`).classList.add('preview-slot');}
},{passive:false});
document.addEventListener('pointerup',e=>{
 if(!drag||drag.id!==e.pointerId)return;const d=drag,target=d.moved?hitTarget(e.clientX,e.clientY,d.kind):null;
 if(d.moved)suppressClickUntil=performance.now()+350;clearDrag();
 if(!d.moved){if(d.kind==='block')selectBlock(d.beats);return;}
 if(target){if(d.kind==='bead')moveBead(d.bead,Number(target.dataset.destination));else placeBlock(Number(target.dataset.measure),Number(target.dataset.slot??target.dataset.start),d.beats);}
 else feedback(d.kind==='bead'?'shareMessage':'scoreMessage',d.kind==='bead'?'마디나 나눌 박 구슬 칸 위에 놓아 주세요.':'악보의 시작 칸 위에 놓아 주세요.');
});
document.addEventListener('pointercancel',clearDrag);window.addEventListener('blur',clearDrag);
// Keyboard access uses the same move operation without adding on-screen controls.
$('shareScreen').addEventListener('click',e=>{const token=e.target.closest('.beat-bead');if(!token||e.detail!==0||transitioning)return;pickedBead=Number(token.dataset.bead);document.querySelectorAll('.beat-bead').forEach(b=>b.classList.toggle('picked',Number(b.dataset.bead)===pickedBead));feedback('shareMessage','옮길 마디나 나눌 박 구슬 칸에 초점을 옮긴 뒤 Enter를 누르세요.');});
$('shareScreen').addEventListener('keydown',e=>{if(e.target.closest('.beat-bead'))return;const destination=e.target.closest('[data-destination]');if(destination&&pickedBead!==null&&(e.key==='Enter'||e.code==='Space')){e.preventDefault();moveBead(pickedBead,Number(destination.dataset.destination));}});
const help=[
 ['구슬을 여섯 마디에 나눠요','<div class="example">♩ 구슬 하나 = 1박</div><p><strong>마디</strong>는 악보를 일정한 박 수로 나눈 구간이에요. 24개의 구슬을 여섯 마디에 <strong>똑같이</strong> 나눠 주세요.</p><p>구슬을 끌어 마디에 놓아요. 잘못 놓았다면 <strong>다른 마디로 옮기거나, 위의 나눌 박 구슬 칸으로 돌려놓아요.</strong></p>'],
 ['한 마디에는 몇 박이 필요할까요?','<div class="example">24 ÷ 6 = ?</div><p>구슬을 모두 똑같이 나누면 나눗셈 문제가 나와요. <strong>한 마디에 놓인 구슬 수</strong>를 세어 답을 써 주세요.</p>'],
 ['서로 다른 여섯 마디를 만들어요','<div class="example">1박 · 2박 · 4박</div><p>왼쪽 블록을 오른쪽 악보에 놓아요. <strong>1박은 한 칸, 2박은 두 칸, 4박은 네 칸</strong>을 차지해요. 놓인 블록을 누르면 뺄 수 있어요.</p><p>같은 순서의 리듬이 있으면 두 마디가 주황색으로 표시돼요. <strong>1+1+2와 1+2+1은 서로 다른 리듬</strong>이에요.</p><p>각 마디를 4박으로 채우고, 여섯 마디가 모두 다르면 <strong>공연해 보기</strong>를 눌러요.</p>']
];
function renderHelp(){$('helpContent').innerHTML=`<h2 id="helpTitle">${help[helpPage][0]}</h2>${help[helpPage][1]}`;$('helpPage').textContent=(helpPage+1)+' / 3';$('helpPrev').disabled=helpPage===0;$('helpNext').textContent=helpPage===2?'체험으로 돌아가기':'다음 →';}
function nextHelp(){if(helpPage<2){helpPage++;renderHelp();}else $('helpDialog').close();}
$('helpBtn').onclick=()=>{clearDrag();if(playing||starting)stop('설명을 읽는 동안 공연을 멈췄어요.');else A.stop();helpPage=state.phase==='share'?0:state.phase==='answer'?1:2;renderHelp();$('helpDialog').showModal();};
$('helpNext').onclick=nextHelp;$('helpPrev').onclick=()=>{helpPage=Math.max(0,helpPage-1);renderHelp();};$('helpContent').onclick=nextHelp;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){clearDrag();pickedBead=null;document.querySelectorAll('.picked').forEach(el=>el.classList.remove('picked'));}
 if(e.key==='Enter'||e.code==='Space')A.setEnabled(!muted);
 if(!$('helpDialog').open||e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.key==='Enter'||e.code==='Space'){if(e.target.closest('button')&&e.target!==$('helpNext'))return;e.preventDefault();nextHelp();}else if(e.key==='ArrowLeft'){e.preventDefault();helpPage=Math.max(0,helpPage-1);renderHelp();}
});
$('resetBtn').onclick=()=>{clearDrag();if(playing||starting)stop();else A.stop();$('resetDialog').showModal();};
$('confirmReset').onclick=()=>{clearTimeout(advanceTimer);advanceTimer=null;transitioning=false;playRequest++;A.stop();state=R.initial();selected=0;pickedBead=null;playing=false;starting=false;$('answerInput').value='';$('answerInput').removeAttribute('aria-invalid');$('resetDialog').close();render();feedback('shareMessage','구슬을 끌어 마디에 놓아요.');feedback('answerMessage','한 마디에 놓인 구슬을 세어 보세요.');feedback('scoreMessage','중복되지 않게 6마디를 만드세요.');$('selectionText').textContent='블록을 끌어 놓거나, 고른 뒤 악보의 빈칸을 눌러요.';};
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearDrag();if(playing||starting)stop('화면을 잠시 떠나 공연을 멈췄어요. 다시 공연할 수 있어요.');else A.stop();}});
function showResult(){playing=false;state.phase='done';A.finish();render();feedback('scoreMessage','6마디 × 4박 = 24박! 여섯 리듬의 공연을 완성했어요.','success');bridge?.complete({version:2,...state});}
soundLabel();render();
function frame(now){
 let sample=A.sample();if(playing&&sample.kind==='finished'){showResult();sample={kind:'finish'};}if(state.phase==='done'&&!playing)sample={kind:'finish'};
 if(playing&&sample.kind==='show'&&sample.beat!==lastBeat){
  $('sceneLabel').textContent='청라호수공원 · 우리의 음악분수';
  lastBeat=sample.beat;$('playingMeasure').textContent=(sample.group+1)+'마디';$('playingBeat').textContent=(sample.beat+1)+' / 24박';
  [...$('scoreRows').children].forEach((row,i)=>{row.classList.toggle('playing',i===sample.group);row.querySelectorAll('.beat-marker').forEach(el=>el.classList.toggle('current',i===sample.group&&Number(el.dataset.beat)===sample.beat%4));});
 }
 if(!document.hidden&&isComposing())world?.render(sample,now);requestAnimationFrame(frame);
}requestAnimationFrame(frame);
window.CheongnaFountain={inspect:()=>({state:JSON.parse(JSON.stringify(state)),selected,playing,starting,transitioning,counts:R.counts(state.beads),remaining:state.beads.filter(n=>n<0).length,analysis:R.analyze(state.score),audio:A.inspect(),scene:world?.inspect()||null,sample:A.sample()})};
if(bridge){A.setEnabled(!muted);bridge.onPause=()=>{clearDrag();if(playing||starting)stop('잠시 공연을 멈췄어요. 악보는 그대로 있어요.');else A.stop();};bridge.ready();if(state.phase==='done')bridge.complete({version:2,...state});}
})();
