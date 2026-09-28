(function(root){
 'use strict';
 const KEY='mathtour.yeongjong-ganghwa.v1';
 const chapters=[{id:'dolmen',number:1,title:'강화고인돌',file:'Y01.html'},{id:'bomunsa',number:2,title:'보문사',file:'Y02.html'},{id:'seokmodo',number:3,title:'석모도 미네랄 온천',file:'Y03.html'},{id:'airport',number:4,title:'인천국제공항',file:'Y04.html'}];
 function createStore(storage,M,DM=root.DolmenMath,AM=root.AirportMath){
  if(!DM&&typeof module==='object')DM=require('../dolmen-tour/model.js');
  if(!AM&&typeof module==='object')AM=require('../airport-tour/model.js');
  let memory=null;
  const valid=(id,s)=>id==='dolmen'?!!DM?.valid(id,s):id==='airport'?!!AM?.valid(id,s):M.valid(id,s);
  const fresh=()=>({version:1,order:2,run:Date.now()+'-'+Math.random(),saves:{},done:{},proofs:{},legacyAccess:[]});
  function read(){let s;try{s=JSON.parse(storage?.getItem(KEY));}catch{}if(s?.version!==1||typeof s.run!=='string')s=memory||fresh();
   // Retain previously available chapters during the one-time order migration.
   if(s.order!==2){const access=[];for(const id of ['bomunsa','seokmodo'])if(s.saves?.[id]?.step>0||(s.done?.[id]&&valid(id,s.proofs?.[id]||s.saves?.[id])))access.push(id);if(s.done?.bomunsa&&valid('bomunsa',s.proofs?.bomunsa||s.saves?.bomunsa))access.push('seokmodo');s={...s,order:2,legacyAccess:[...new Set(access)]};}
   return s;
  }
  function write(s){memory=s;try{storage?.setItem(KEY,JSON.stringify(s));return !!storage;}catch{return false;}}
  write(read());
  function status(){const s=read();let prev=true,allPrevious=true;return {run:s.run,items:chapters.map(c=>{const completed=s.done?.[c.id]===true&&valid(c.id,s.proofs?.[c.id]||s.saves?.[c.id]),unlocked=c.id==='airport'?(allPrevious||completed):(prev||completed||s.legacyAccess?.includes(c.id));prev=completed;allPrevious=allPrevious&&completed;return {...c,unlocked:!!unlocked,completed};})};}
  function save(id,value,run,finish=false){const s=read(),item=status().items.find(c=>c.id===id);if(run!==s.run||!item?.unlocked)return false;s.saves={...s.saves,[id]:JSON.parse(JSON.stringify(value))};if(finish&&valid(id,value)){s.done={...s.done,[id]:true};s.proofs={...s.proofs,[id]:JSON.parse(JSON.stringify(value))};}return write(s);}
  function reset(){write(fresh());}
  return {status,save,reset,load:id=>read().saves?.[id]||null};
 }
 const api={KEY,chapters,createStore};if(typeof module==='object')module.exports=api;
 if(!root.document)return;let storage;try{storage=root.localStorage;}catch{}const store=createStore(storage,root.IslandMath),base=new URL('../../',document.currentScript.src);
 const url=id=>new URL(chapters.find(c=>c.id===id).file,base).href+'?region='+encodeURIComponent('영종/강화');
 const announce=()=>root.dispatchEvent(new CustomEvent('mathtour:island-progress'));
 root.IslandProgress={...store,url,mapURL:new URL('index.html?region=yeongjong-ganghwa',base).href,save(...a){const before=store.status().items.filter(c=>c.completed).length;const ok=store.save(...a);if(before!==store.status().items.filter(c=>c.completed).length)announce();return ok;},reset(){store.reset();announce();},render(host,travel){host.hidden=false;host.innerHTML='<div class="island-chapter-row">'+store.status().items.map(c=>'<button data-island="'+c.id+'" '+(!c.unlocked?'disabled':'')+'><small>CHAPTER '+c.number+'</small><strong>'+c.title+'</strong><span>'+(c.completed?'빛 발견 · 다시 여행':c.unlocked?'여행 시작 →':'앞선 챕터 완료 후 해금')+'</span></button>').join('')+'</div><button class="island-reset">지역 초기화</button>';host.querySelectorAll('[data-island]').forEach(b=>b.onclick=()=>travel(b.dataset.island));host.querySelector('.island-reset').onclick=()=>{const d=document.createElement('dialog');d.className='island-reset-dialog';d.innerHTML='<h2>영종·강화 여행을 처음부터 시작할까요?</h2><p>강화고인돌·보문사·석모도 온천·인천국제공항의 진행과 빛의 기록을 지웁니다.</p><button data-cancel>취소</button><button data-reset>지역 초기화</button>';d.querySelector('[data-cancel]').onclick=()=>d.close();d.querySelector('[data-reset]').onclick=()=>{d.close();root.IslandProgress.reset();};d.onclose=()=>d.remove();document.body.append(d);d.showModal();};}};
 root.addEventListener('storage',e=>{if(!e.key||e.key===KEY)announce();});
})(typeof window==='undefined'?globalThis:window);

