(() => {
'use strict';
const $=id=>document.getElementById(id),M=CheongnaLakeModel,D=CheongnaTourData,P=GeomdanProgress;
const preview=new URLSearchParams(location.search).get('preview')==='1';
const messageOrigin=location.protocol==='file:'?'null':location.origin;
let state=preview?M.fresh():M.restore(P.load('lake')),run=P.status().run,screen='',blocked=false,sound=true,audio=null,activity=null,arrivalTimer=0,loadTimer=0,reviewReturn=null;
try{sound=localStorage.getItem('mathtour-cheongna-sound')!=='off';}catch{}
const paused=()=>document.hidden||!!document.querySelector('dialog[open]')||blocked;
function soundLabel(){$('sound').textContent=sound?'소리 켜짐':'소리 켜기';$('sound').setAttribute('aria-pressed',String(sound));}
function soundSave(value){sound=value;soundLabel();try{localStorage.setItem('mathtour-cheongna-sound',sound?'on':'off');}catch{}}
function cue(kind){
 if(!sound||paused())return;
 try{audio ||= new(window.AudioContext||window.webkitAudioContext)();audio.resume();const t=audio.currentTime;
  const notes=kind==='light'?[392,494,587,784,988,1175]:kind==='step'?[110]:[523,659];
  notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),start=t+i*(kind==='light'?.2:.07),duration=kind==='light'?1.6:kind==='step'?.075:.25;o.type=kind==='step'?'triangle':'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(kind==='step'?.012:.035,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g).connect(audio.destination);o.start(start);o.stop(start+duration+.03);});
 }catch{}
}
function checkRun(){if(blocked)return false;if(!preview&&P.status().run!==run){blocked=true;CheongnaWalk.stop();removeActivity();$('main').inert=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('resetNotice').showModal();return false;}return true;}
function persist(finish=false){if(preview||!checkRun())return;$('saveNotice').hidden=P.save('lake',state,run,finish);}
function removeActivity(){clearTimeout(loadTimer);activity=null;$('activityHost').replaceChildren();}
function show(id){window.GeomdanEnding?.setContext(null);if(screen==='walk'&&id!=='walk')CheongnaWalk.stop();if(id!=='activity')removeActivity();screen=id;document.querySelectorAll('#main>.screen').forEach(s=>s.hidden=s.id!==id);$('sound').hidden=id==='activity';}
function enter(index,line=0){if(!checkRun())return;state.step=index;state.line=line;persist();render();}
function next(){if(reviewReturn!==null){const target=reviewReturn;reviewReturn=null;enter(target.step,target.line);return;}enter(Math.min(11,state.step+1));}
let tourPhotoIndex=0,tourPhotoGroup='intro',album=[],albumIndex=0;
function fillPhoto(prefix,key){
 const p=D.photos[key];$(prefix+'Title').textContent=p.title;$(prefix+'Image').src=p.src;$(prefix+'Image').alt=p.title;
 $(prefix+'Text').textContent=p.text;$(prefix+'Credit').textContent=p.credit;$(prefix+'Source').href=p.source;
}
function renderAlbum(){
 fillPhoto('photo',album[albumIndex]);$('albumCount').textContent=`${albumIndex+1} / ${album.length}`;
 $('albumPrev').disabled=albumIndex===0;$('albumNext').disabled=albumIndex===album.length-1;
}
function showPhoto(key,start=0){
 album=D.galleries[key]||[key];if(!album.length||!D.photos[album[0]])return;
 albumIndex=Math.max(0,Math.min(start,album.length-1));renderAlbum();
 if(!$('photoDialog').open)$('photoDialog').showModal();
 pauseActivity();
}
function showActualPhoto(key){
 const p=D.photos[key];if(!p)return;
 $('realTitle').textContent=p.title;$('realImage').src=p.src;$('realImage').alt=p.title;
 $('realCredit').textContent=p.credit;$('realSource').href=p.source;
 $('realDialog').showModal();pauseActivity();
}
function renderPhotoTour(group='intro'){
 if(tourPhotoGroup!==group){tourPhotoIndex=0;tourPhotoGroup=group;}
 show('photoScreen');fillPhoto('tourPhoto',D.galleries[group][tourPhotoIndex]);
 $('tourGalleryTitle').textContent=group==='fountain'?'음악분수, 호수 위의 공연':group==='pavilion'?'청라루와 바둑판 광장':'청라호수공원 둘러보기';
 $('tourPhotoCount').textContent=`${tourPhotoIndex+1} / ${D.galleries[group].length}`;
 $('photoPrev').disabled=tourPhotoIndex===0;
 $('photoNext').textContent=tourPhotoIndex===D.galleries[group].length-1?(group==='fountain'?'악보 이야기로 →':group==='pavilion'?'청라루 이야기로 →':'청라루로 가기 →'):'다음 사진 →';
}
function renderStory(step){
 show('story');$('storyArt').src=step.art;$('sceneTag').textContent=step.tag;state.line=Math.min(state.line,step.lines.length-1);
 const [speaker,text]=step.lines[state.line];$('speaker').textContent=speaker;$('lineText').textContent=text;$('lineCount').textContent=`${state.line+1} / ${step.lines.length}`;
 $('storyPrev').disabled=state.line===0;$('storyNext').textContent=state.line===step.lines.length-1?(reviewReturn!==null?'하던 여행으로 돌아가기 →':step.button):'다음 →';
 document.querySelector('.person.minwoo').classList.toggle('quiet',speaker!=='민우');document.querySelector('.person.seoyeon').classList.toggle('quiet',speaker!=='서연');$('realPhoto').onclick=()=>showActualPhoto(step.photo);
}
function lineNext(){if(screen!=='story'||paused())return;const step=D.steps[state.step];cue('click');if(state.line<step.lines.length-1){state.line++;persist();renderStory(step);}else next();}
function linePrev(){if(screen==='story'&&!paused()&&state.line>0){state.line--;persist();renderStory(D.steps[state.step]);}}
function render(){
 if(!checkRun())return;const step=D.steps[state.step];
 if(step.id==='pavilion'&&!state.seen.includes('pavilionIntro')&&reviewReturn===null){renderPhotoTour('pavilion');return;}
 if(step.id==='fountain'&&!state.seen.includes('fountain')&&reviewReturn===null){renderPhotoTour('fountain');return;}
 if(step.type==='story'){renderStory(step);return;}
 if(step.type==='photo'){renderPhotoTour();return;}
 if(step.type==='activity'){mountActivity(step.game);return;}
 if(step.type==='walk'){
  show('walk');CheongnaWalk.start(state.position,{paused,onSave:p=>{state.position=p;persist();},onStep:()=>cue('step')});$('walkViewport').focus({preventScroll:true});return;
 }
 if(step.type==='capture'){show('capture');cue('light');return;}
 if(step.type==='recap'){show('recap');$('completionText').textContent=preview?'청라호수공원 체험을 마쳤어요. 미리 보기는 지역 기록에 저장하지 않아요.':'서해·검단의 세 가지 빛을 모두 찾았어요. 여행을 완주했어요!';
  const ready=!preview&&P.status().allComplete;$('geomdanEndingReplay').hidden=!ready;
  if(ready)window.GeomdanEnding?.setContext($('recap'),{chapter:'lake'});return;}
 show('arrival');
}
function mountActivity(game){
 show('activity');removeActivity();$('frameLoading').hidden=false;$('retryActivity').hidden=true;
 const frame=document.createElement('iframe'),token=String(Date.now())+'-'+Math.random().toString(36).slice(2);
 frame.id='gameFrame';frame.title=game==='baduk'?'바둑돌의 빛을 모아라':'여섯 마디 음악분수';frame.allow='autoplay';
 activity={game,frame,token,ready:false};
 // Use the original activity scenery; story scenes keep their illustrated backgrounds.
 const config={game,token,parentOrigin:messageOrigin,initial:state[game],sound};
 const base=new URL('./',location.href).href;
 const safeConfig=JSON.stringify(config).replace(/</g,'\\u003c');
 frame.srcdoc=CheongnaActivities[game].replace('<head>',`<head><base href="${base.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"><script>window.CheongnaActivityConfig=${safeConfig};<\/script><script src="asset/cheongna-tour/embed.js?v=place-tour-v9"><\/script>`).replace('</head>','<link rel="stylesheet" href="asset/cheongna-tour/embed.css?v=s03-v1"></head>');
 $('activityHost').append(frame);
 loadTimer=setTimeout(()=>{if(activity?.token===token&&!activity.ready){$('frameLoading').querySelector('p').textContent='체험을 여는 데 시간이 걸리고 있어요.';$('retryActivity').hidden=false;}},14000);
}
function validSnapshot(game,raw){return game==='baduk'?!!BadukPuzzle.restore(raw):!!FountainRhythm.restore(raw);}
window.addEventListener('message',e=>{
 const a=activity,m=e.data;if(!a||e.source!==a.frame.contentWindow||e.origin!==messageOrigin||m?.channel!=='cheongna-tour'||m.token!==a.token||m.game!==a.game||!checkRun())return;
 if(m.type==='ready'){a.ready=true;clearTimeout(loadTimer);$('frameLoading').hidden=true;return;}
 if(m.type==='sound'&&typeof m.sound==='boolean'){soundSave(m.sound);return;}
 if(m.type==='review'){reviewReturn={step:state.step,line:0};enter(a.game==='baduk'?3:7);return;}
 if(!['save','complete','continue'].includes(m.type)||!validSnapshot(a.game,m.snapshot))return;
 state[a.game]=structuredClone(m.snapshot);persist();
 const done=a.game==='baduk'?M.validBaduk(m.snapshot):M.validFountain(m.snapshot);
 if(m.type==='continue'&&done){cue('click');enter(a.game==='baduk'?5:9);}
});
function sendActivity(type){if(activity)activity.frame.contentWindow?.postMessage({channel:'cheongna-parent',token:activity.token,type},messageOrigin==='null'?'*':messageOrigin);}
function pauseActivity(){CheongnaWalk.pause();sendActivity('pause');audio?.suspend();}
$('retryActivity').onclick=()=>{if(activity)mountActivity(activity.game);};
$('leaveBus').onclick=()=>{state=M.fresh();reviewReturn=null;tourPhotoIndex=0;cue('click');enter(1);};
$('resume').onclick=()=>{cue('click');render();};
$('storyNext').onclick=lineNext;$('storyPrev').onclick=linePrev;
document.querySelector('.dialogue').onclick=e=>{if(!e.target.closest('button,a'))lineNext();};
document.addEventListener('keydown',e=>{if(paused())return;if(screen==='story'&&e.repeat&&(e.key==='Enter'||e.code==='Space')){e.preventDefault();return;}if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,a,button'))return;if(screen==='story'&&(e.key==='Enter'||e.code==='Space')){e.preventDefault();lineNext();}else if(screen==='story'&&e.key==='ArrowLeft'){e.preventDefault();linePrev();}});
$('photoNext').onclick=()=>{
 if(tourPhotoIndex<D.galleries[tourPhotoGroup].length-1){tourPhotoIndex++;renderPhotoTour(tourPhotoGroup);return;}
 const key=tourPhotoGroup==='fountain'?'fountain':tourPhotoGroup==='pavilion'?'pavilionIntro':'park';if(!state.seen.includes(key))state.seen.push(key);
 if(tourPhotoGroup==='intro')next();else{persist();render();}
};
$('photoPrev').onclick=()=>{if(tourPhotoIndex>0){tourPhotoIndex--;renderPhotoTour(tourPhotoGroup);}};
$('photoEnlarge').onclick=()=>showPhoto(tourPhotoGroup,tourPhotoIndex);
$('albumPrev').onclick=()=>{if(albumIndex>0){albumIndex--;renderAlbum();}};
$('albumNext').onclick=()=>{if(albumIndex<album.length-1){albumIndex++;renderAlbum();}};
document.addEventListener('keydown',e=>{if(!$('photoDialog').open||e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowLeft'){e.preventDefault();$('albumPrev').click();}else if(e.key==='ArrowRight'){e.preventDefault();$('albumNext').click();}});
$('browsePhotos').onclick=()=>{$('note').close();showPhoto('all');};
$('revisitPhotos').onclick=()=>showPhoto('all');
$('arriveFountain').onclick=()=>{if(screen!=='walk'||!CheongnaWalk.inspect().near||!checkRun())return;state.position=CheongnaWalk.inspect().player;state.walkArrived=true;cue('click');enter(7);};
$('walkHelp').onclick=()=>{CheongnaWalk.pause();$('walkGuide').showModal();};
$('captureLight').onclick=()=>{if(!M.validBaduk(state.baduk)||!M.validFountain(state.fountain)||!state.walkArrived)return;state.captured=true;state.step=11;state.line=0;persist(true);cue('light');render();};
$('geomdanEndingReplay').onclick=()=>window.GeomdanEnding?.show();
window.addEventListener('mathtour:ending-open',pauseActivity);
$('revisitWalk').onclick=()=>enter(6);$('revisitFountain').onclick=()=>enter(8);
$('sound').onclick=()=>{soundSave(!sound);if(sound)cue('click');else audio?.suspend();};soundLabel();
$('journal').onclick=()=>{
 const b=M.validBaduk(state.baduk),f=M.validFountain(state.fountain);pauseActivity();
 $('noteContent').innerHTML=`<p class="note-light">${state.captured?'✦ 청라호수공원의 빛을 수첩에 담았어요.':'작은 빛을 모아 호수의 밤을 밝혀요.'}</p><ul><li>${b?'✓':'○'} 청라루 · 바둑돌의 빛 모으기</li><li>${state.walkArrived?'✓':'○'} 호숫가 길을 걸어 음악분수 만나기</li><li>${f?'✓':'○'} 24박을 나누고, 여섯 마디 공연하기</li></ul><p>청라루의 빛은 돌 하나로, 음악분수의 빛은 여섯 마디의 악보로 모아요.</p>`;$('note').showModal();
};
$('reviewStory').onclick=()=>{$('note').close();if(state.step===0)return;reviewReturn={step:state.step,line:state.line};enter(state.step>=7?7:state.step>=5?5:state.step>=3?3:1);};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]')){sendActivity('resume');if(screen==='walk')$('walkViewport').focus({preventScroll:true});}}));
window.addEventListener('storage',e=>{if(!e.key||e.key===P.KEY)checkRun();});window.addEventListener('mathtour:geomdan-progress',checkRun);
window.addEventListener('pagehide',()=>{CheongnaWalk.stop();persist();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseActivity();});
if(preview){$('previewNotice').hidden=false;document.body.classList.add('preview');}
if(!preview&&!P.status().items.find(c=>c.id==='lake')?.unlocked)show('locked');
else{show('arrival');$('resume').hidden=state.step<1;arrivalTimer=setTimeout(()=>{$('leaveBus').disabled=false;$('leaveBus').textContent=state.step>0?'처음 장면부터 여행하기':'버스에서 내려 여행 시작 →';},matchMedia('(prefers-reduced-motion: reduce)').matches?60:2750);}
window.CheongnaTour={inspect:()=>({preview,screen,blocked,state:structuredClone(state),activity:activity?{game:activity.game,ready:activity.ready}:null})};
})();
