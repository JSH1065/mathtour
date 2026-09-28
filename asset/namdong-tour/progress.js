(function(root){'use strict';
 const KEY='mathtour.namdong-yeonsu.v1';
 const chapters=[{id:'park',number:1,title:'인천대공원',file:'N01.html'},{id:'market',number:2,title:'소래포구 전통어시장',file:'N02.html'},{id:'central',number:3,title:'센트럴파크 · 문보트',file:'N03.html'}];
 function createStore(storage,M){let memory=null,unsaved=false;const fresh=()=>({version:1,run:Date.now()+'-'+Math.random(),saves:{},done:{}});
  function read(){let s;try{if(!unsaved)s=JSON.parse(storage?.getItem(KEY));}catch{}return s?.version===1&&typeof s.run==='string'?s:(memory||fresh());}
  function write(s){memory=s;try{if(!storage)throw Error();storage.setItem(KEY,JSON.stringify(s));unsaved=false;return true;}catch{unsaved=true;return false;}}
  write(read());
  function status(){const s=read();let prev=true;const items=chapters.map(c=>{const unlocked=prev,completed=unlocked&&M.valid(c.id,s.done?.[c.id]);prev=completed;return {...c,unlocked,completed};});return {run:s.run,items,allComplete:prev,completed:items.filter(c=>c.completed).length};}
  function save(id,value,run,finish=false){const s=read();if(run!==s.run||!status().items.find(c=>c.id===id)?.unlocked)return false;s.saves={...s.saves,[id]:structuredClone(value)};if(finish&&M.valid(id,value))s.done={...s.done,[id]:structuredClone(value)};return write(s);}
  return {status,save,reset:()=>write(fresh()),load:id=>read().saves?.[id]||null};
 }
 if(typeof module==='object')module.exports={KEY,chapters,createStore};if(!root.document)return;
 let storage;try{storage=root.localStorage;}catch{}const store=createStore(storage,root.NamdongMath),base=new URL('../../',document.currentScript.src),announce=()=>root.dispatchEvent(new CustomEvent('mathtour:namdong-progress'));
 root.NamdongProgress={...store,KEY,chapters,url:id=>new URL(chapters.find(c=>c.id===id).file,base).href,mapURL:new URL('index.html?region=namdong-yeonsu',base).href,
  save(...a){const old=store.status().completed,ok=store.save(...a);if(old!==store.status().completed)announce();return ok;},reset(){const ok=store.reset();announce();return ok;},
  render(host,travel){host.hidden=false;host.innerHTML='<div class="island-chapter-row">'+store.status().items.map(c=>`<button data-namdong="${c.id}" ${c.unlocked?'':'disabled'}><small>CHAPTER ${c.number}</small><strong>${c.title}</strong><span>${c.completed?'✦ 빛 발견 · 다시 여행':c.unlocked?'여행 시작 →':'앞선 챕터 완료 후 해금'}</span></button>`).join('')+'</div><button class="island-reset">지역 초기화</button>';
   host.querySelectorAll('[data-namdong]').forEach(b=>b.onclick=()=>travel(b.dataset.namdong));host.querySelector('.island-reset').onclick=()=>{const d=document.createElement('dialog');d.className='island-reset-dialog';d.innerHTML='<h2>남동·연수 여행을 처음부터 시작할까요?</h2><p>인천대공원·소래포구·센트럴파크의 진행과 완료 기록을 초기화합니다.</p><button data-cancel>취소</button><button data-reset>초기화하기</button>';d.querySelector('[data-cancel]').onclick=()=>d.close();d.querySelector('[data-reset]').onclick=()=>{root.NamdongProgress.reset();d.close();};d.onclose=()=>d.remove();document.body.append(d);d.showModal();};}
 };
 root.addEventListener('storage',e=>{if(!e.key||e.key===KEY)announce();});
})(typeof window==='undefined'?globalThis:window);
