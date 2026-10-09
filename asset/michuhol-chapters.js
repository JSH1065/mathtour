/* Ordered, evidence-based progress for the Michuhol–Jemulpo journey. */
(function(root){
 'use strict';
 const PREFIX='mathtour.michuhol-jemulpo.',KEY=PREFIX+'chapters-v1';
 const chapters=[
  {id:'sports',number:1,title:'SSG랜더스필드 · 문학박태환수영장',file:'M01.html'},
  {id:'munhak',number:2,title:'문학산',file:'M02.html'},
  {id:'subong',number:3,title:'수봉공원',file:'M03.html'}
 ];
 const saveKey=id=>PREFIX+id+'-v1';
 function validCompletion(id,s){
  if(s?.version!==1||s.finished!==true)return false;
  if(id==='sports')return s.baseLight===true&&s.swimLight===true;
  const a=s.activity;if(s.departed!==true)return false;
  if(id==='munhak')return a?.version===2&&a.finished===true&&a.locked===true&&a.calculated===true&&a.operation==='multiply'&&typeof a.distance==='number'&&Math.abs(a.distance-52.7)<.049&&a.climb?.done===true&&a.climb.time===36&&Array.isArray(a.climb.cleared)&&[0,1,2,3,4,5,6,7].every(i=>a.climb.cleared.includes(i));
  return id==='subong'&&a?.version===1&&a.solved===true&&a.opening===30&&Array.isArray(a.found)&&a.found.includes('A')&&a.found.includes('B');
 }
 function createStore(storage){
  const memory=new Map(),unsaved=new Set();
  function read(key){if(!storage||unsaved.has(key))return memory.get(key);try{const raw=storage.getItem(key);return raw?JSON.parse(raw):undefined;}catch{return memory.get(key);}}
  function write(key,value){memory.set(key,value);unsaved.add(key);try{if(!storage)return false;storage.setItem(key,JSON.stringify(value));unsaved.delete(key);return true;}catch{return false;}}
  function forget(key){memory.delete(key);unsaved.delete(key);try{storage?.removeItem(key);}catch{}}
  const token=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  function ledger(){
   let l=read(KEY);
   if(l?.version===1&&Array.isArray(l.completed)&&l.completed.length===3&&Array.isArray(l.runs)&&l.runs.length===3)return l;
   l={version:1,completed:[false,false,false],runs:chapters.map(token)};
   // Import an existing journey once, stopping at the first unfinished chapter.
   // Later chapters saved out of order cannot silently complete a future unlock.
   let unlocked=true;
   chapters.forEach((c,i)=>{const s=read(saveKey(c.id));if(!unlocked)return;if(s)write(saveKey(c.id),{...s,_chapterRun:l.runs[i]});l.completed[i]=validCompletion(c.id,s);unlocked=l.completed[i];});
   write(KEY,l);return l;
  }
  function status(){const l=ledger();let previous=true;const items=chapters.map((c,i)=>{const unlocked=previous,completed=unlocked&&l.completed[i]===true;previous=completed;return {...c,unlocked,completed,run:l.runs[i]};});return {items,count:items.filter(c=>c.completed).length,allComplete:previous};}
  function load(id){const item=status().items.find(c=>c.id===id),s=read(saveKey(id));return item?.unlocked&&s?._chapterRun===item.run?s:null;}
  function accepts(id,run){const item=status().items.find(c=>c.id===id);return !!item?.unlocked&&item.run===run;}
  function save(id,value,run){
   if(!accepts(id,run))return false;
   const i=chapters.findIndex(c=>c.id===id),l=ledger();
   if(l.completed[i]&&!validCompletion(id,value)){
    for(let j=i;j<3;j++){l.completed[j]=false;if(j>i)l.runs[j]=token();}
    write(KEY,l);forget(PREFIX+'ending-v1');
   }
   return write(saveKey(id),{...value,_chapterRun:run});
  }
  function complete(id,value,run){
   if(!accepts(id,run)||!validCompletion(id,value))return false;
   const l=ledger(),i=chapters.findIndex(c=>c.id===id);if(!l.completed[i]){l.completed[i]=true;write(KEY,l);}return true;
  }
  function reset(){
   const ok=write(KEY,{version:1,completed:[false,false,false],runs:chapters.map(token)});
   chapters.forEach(c=>forget(saveKey(c.id)));forget(PREFIX+'ending-v1');
   try{storage?.removeItem('hongyemun-record');}catch{}
   return ok;
  }
  ledger();return {status,load,save,complete,accepts,reset};
 }
 if(typeof module==='object'&&module.exports)module.exports={PREFIX,KEY,chapters,saveKey,validCompletion,createStore};
 if(!root.document)return;
 const document=root.document,base=new URL('../',document.currentScript.src),mapURL=new URL('index.html?region=michuhol-jemulpo',base).href;
 let storage;try{storage=root.localStorage;}catch{}
 const store=createStore(storage);let binding=null;
 const announce=()=>root.dispatchEvent(new CustomEvent('mathtour:michuhol-progress'));
 function block(id,stale=false){
  if(document.getElementById('mjChapterLock'))return;
  const c=chapters.find(c=>c.id===id),gate=document.createElement('dialog');gate.id='mjChapterLock';gate.className='mj-chapter-lock';gate.setAttribute('aria-label','아직 잠긴 챕터');
  gate.innerHTML='<small>미추홀 · 제물포 MATH TOUR</small><h2>'+ (stale?'새 여행의 순서를 확인해 주세요':'앞선 챕터의 빛을 먼저 찾아요')+'</h2><p>챕터 '+c.number+' · '+c.title+' 여행은<br>챕터 '+(c.number-1)+'을 완료하면 열립니다.</p><a href="'+mapURL+'">지역 월드맵으로 →</a>';
  gate.addEventListener('cancel',e=>e.preventDefault());document.body.append(gate);document.querySelector('main').inert=true;gate.showModal();
 }
 function enterCourse(id){const c=store.status().items.find(c=>c.id===id);if(!c?.unlocked){block(id);return false;}binding={id,run:c.run};return true;}
 function current(){return !binding||store.accepts(binding.id,binding.run);}
 function save(id,s){if(binding?.id!==id||!current())return false;const before=store.status().count,result=store.save(id,s,binding.run);if(store.status().count!==before)announce();return result;}
 function finishCourse(id,s){if(binding?.id!==id)return false;const result=store.complete(id,s,binding.run);if(result)announce();return result;}
 function courseURL(id){const c=chapters.find(c=>c.id===id);return new URL(c.file+'?region='+encodeURIComponent('미추홀/제물포')+'&site='+encodeURIComponent(c.title),base).href;}
 function refresh(){if(!current())block(binding.id,true);announce();}
 root.addEventListener('storage',e=>{if(!e.key||e.key===KEY||chapters.some(c=>e.key===saveKey(c.id)))refresh();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 root.MathTourMichuholChapters={status:store.status,load:store.load,reset(){const ok=store.reset();try{root.sessionStorage.removeItem(PREFIX+'ending-v1.dismissed');}catch{}announce();return ok;},save,finishCourse,enterCourse,courseURL,mapURL};
})(typeof window==='object'?window:globalThis);
