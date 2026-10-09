(function(root){
  'use strict';
  const KEY='mathtour.seohae-geomdan.v1';
  const chapters=[
    {id:'museum',number:1,title:'검단선사박물관',available:true,file:'S01.html'},
    {id:'coast',number:2,title:'세어도 · 정서진',available:true,file:'S02.html'},
    {id:'lake',number:3,title:'청라호수공원',available:true,file:'S03.html'}
  ];
  function validGame(g){return g?.version===1&&g.found===true&&g.phase==='complete'&&g.guess===16&&Number.isFinite(g.turn)&&Math.abs(g.turn-Math.PI*2)<1e-7&&g.holes===16;}
  function valid(s){return s?.departed===true&&validGame(s.game);}
  const coastMath=typeof module==='object'?require('../coast-tour/model.js'):root.CoastMath;
  const validCoast=s=>coastMath?.validCoast(s)===true;
  const lakeMath=typeof module==='object'?require('../cheongna-tour/model.js'):root.CheongnaLakeModel;
  const validLake=s=>lakeMath?.valid(s)===true;
  function createStore(storage){
    let memory,unsaved=false;
    const fresh=()=>({version:1,run:Date.now()+'-'+Math.random(),saves:{},done:{}});
    function read(){let s;try{if(!unsaved)s=JSON.parse(storage?.getItem(KEY));}catch{}return s?.version===1&&typeof s.run==='string'?s:memory||fresh();}
    function write(s){memory=s;try{if(!storage)throw Error();storage.setItem(KEY,JSON.stringify(s));unsaved=false;return true;}catch{unsaved=true;return false;}}
    write(read());
    function status(){const s=read(),museum=valid(s.done?.museum),coast=museum&&validCoast(s.done?.coast),lake=coast&&validLake(s.done?.lake);return {run:s.run,completed:Number(museum)+Number(coast)+Number(lake),allComplete:lake,endingSeen:s.ending?.run===s.run&&s.ending?.watched===true,items:chapters.map((c,i)=>({...c,unlocked:i===0||(i===1?museum:coast),completed:i===0?museum:i===1?coast:lake}))};}
    function save(id,value,run,finish=false){const s=read();if(!['museum','coast','lake'].includes(id)||run!==s.run||(id!=='museum'&&!valid(s.done?.museum))||(id==='lake'&&!validCoast(s.done?.coast)))return false;s.saves={...s.saves,[id]:structuredClone(value)};if(finish&&(id==='museum'?valid(value):id==='coast'?validCoast(value):validLake(value)))s.done={...s.done,[id]:structuredClone(value)};return write(s);}
    function acknowledgeEnding(run){const s=read();if(run!==s.run||!status().allComplete)return false;return write({...s,ending:{run,watched:true,at:Date.now()}});}
    return {status,save,acknowledgeEnding,load:(id='museum')=>read().saves?.[id]||null,reset:()=>write(fresh())};
  }
  if(typeof module==='object')module.exports={KEY,chapters,validGame,valid,validCoast,validLake,createStore};
  if(!root.document)return;
  let storage;try{storage=root.localStorage;}catch{}
  const store=createStore(storage),base=new URL('../../',document.currentScript.src),announce=()=>root.dispatchEvent(new CustomEvent('mathtour:geomdan-progress'));
  root.GeomdanProgress={...store,KEY,chapters,validGame,valid,validLake,mapURL:new URL('index.html?region=seohae-geomdan',base).href,
    save(...args){const before=store.status().completed,ok=store.save(...args);if(before!==store.status().completed)announce();return ok;},
    reset(){const ok=store.reset();announce();return ok;},
    render(host,travel){host.hidden=false;host.innerHTML='<div class="island-chapter-row">'+store.status().items.map(c=>`<button data-geomdan="${c.id}" ${c.available&&c.unlocked?'':'disabled'}><small>CHAPTER ${c.number}</small><strong>${c.title}</strong><span>${c.completed?'✦ 빛 발견 · 다시 여행':!c.available?(c.unlocked?'제작 준비 중':'이전 챕터 완료 후 · 제작 예정'):c.unlocked?'여행 시작 →':'이전 챕터 완료 후 해금'}</span></button>`).join('')+'</div><button class="island-reset">지역 초기화</button>';
      host.querySelectorAll('[data-geomdan]').forEach(b=>b.onclick=()=>travel(b.dataset.geomdan));
      host.querySelector('.island-reset').onclick=()=>{const d=document.createElement('dialog');d.className='island-reset-dialog';d.innerHTML='<h2>서해·검단 여행을 처음부터 시작할까요?</h2><p>이 지역의 관람·체험·완료 기록을 초기화해요. 다른 지역의 기록은 유지돼요.</p><button data-cancel>취소</button><button data-reset>초기화하기</button>';d.querySelector('[data-cancel]').onclick=()=>d.close();d.querySelector('[data-reset]').onclick=()=>{root.GeomdanProgress.reset();d.close();};d.onclose=()=>d.remove();document.body.append(d);d.showModal();};
    }
  };
  root.addEventListener('storage',e=>{if(!e.key||e.key===KEY)announce();});
})(typeof window==='undefined'?globalThis:window);
