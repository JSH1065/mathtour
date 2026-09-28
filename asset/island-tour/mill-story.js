(function(root){
 'use strict';
 const lines=[
  ['민우','정확히 네 칸을 만들어 맷돌에 넣었어! 이제 어떻게 돌리면 될까?'],
  ['서연','민우야, 수첩이 빛나고 있어. 여기 맷돌 사용법이 나왔어!'],
  null,
  ['민우','사용법대로 맷돌을 돌려 보자! 식을 풀면 이번에 돌릴 각도를 알 수 있겠네.'],
  ['서연','일차방정식을 사용하면 쉽게 풀 수 있을 거야. 양변에 같은 계산을 해서 x의 값을 구하면 돼.'],
  ['민우','구한 각도만큼 한 번 돌리고, 다음 각도를 이어서 돌리는 거지? 좋아, 내가 첫 번째 식을 풀어 볼게!']
 ];
 root.IslandMillStory={mount({game,grain,persist,checkRun,done}){
  let disposed=false;
  const scene=document.createElement('section');scene.id='millStory';scene.className='mill-interlude scenic';scene.setAttribute('aria-label','곡식을 넣은 뒤, 수첩의 맷돌 사용법');
  scene.innerHTML='<img class="backdrop" src="asset/island-tour/granary-v2.webp" alt="보문사 맷돌에서 착안한 공양간 일러스트"><div class="mill-story-shade"></div><div class="scene-tag">공양간 · 수첩에 나타난 사용법</div><small class="art-credit">관광 자료에서 착안한 창작 체험 일러스트</small><img class="person minwoo" src="asset/민우.svg" alt="민우"><img class="person seoyeon" src="asset/서연.svg" alt="서연"><article class="dialogue mill-story-dialogue"><span class="mill-story-speaker"></span><span class="mill-story-count"></span><p id="millStoryText" aria-live="polite"></p><footer><button id="millStoryPrev">← 이전 대사</button><button id="millStoryNext" class="primary">다음 →</button></footer></article><article id="millNotebook" class="mill-notebook" aria-labelledby="millNotebookTitle" hidden><header><span class="mill-notebook-symbol">✦</span><small>빛의 수첩에 나타난 메시지</small><h2 id="millNotebookTitle">맷돌 사용법</h2></header><p class="mill-notebook-lead">곡식 네 칸이 준비되었구나.<br>아래 식에서 회전각을 찾아 맷돌을 돌려 보렴.</p><div class="mill-notebook-equations">'+root.IslandMath.millProblems.map((p,i)=>'<div><small>'+ (i+1) +'번째 회전</small><b class="mill-math" role="math" aria-label="'+p.speech+'">'+p.math+'</b></div>').join('')+'</div><p class="mill-notebook-rule"><b>식의 해가 이번에 돌릴 각도!</b><br>시계 방향으로 그 각도만큼 한 번씩,<br>앞에서 멈춘 위치부터 이어서 돌리렴.</p><footer><button id="millNotebookRead" class="primary">메시지를 읽었어 →</button></footer></article>';
  game.append(scene);game.classList.add('mill-story-mode');
  const $=selector=>scene.querySelector(selector);
  function index(){return Number.isInteger(grain.briefing)?Math.max(0,Math.min(5,grain.briefing)):0;}
  function show(){
   const step=index(),reading=step===2;grain.briefing=step;
   scene.classList.toggle('notebook-reading',reading);$('#millNotebook').hidden=!reading;$('.mill-story-dialogue').hidden=reading;
   if(reading)return;
   const [who,text]=lines[step];$('.mill-story-speaker').textContent=who;$('#millStoryText').textContent=text;
   $('.mill-story-count').textContent=(step<2?step+1:step)+' / 5';
   $('.minwoo').classList.toggle('speaking',who==='민우');$('.seoyeon').classList.toggle('speaking',who==='서연');
   $('#millStoryPrev').disabled=step===0;$('#millStoryPrev').textContent=step===3?'← 사용법 다시 보기':'← 이전 대사';
   $('#millStoryNext').textContent=step===1?'수첩 메시지 보기 →':step===5?'맷돌 돌리기 시작 →':'다음 →';
  }
  function advance(){
   if(disposed||!checkRun())return;
   if(index()===5){grain.manual=true;grain.briefing=6;persist();done();return;}
   grain.briefing=index()+1;persist();show();
  }
  $('#millStoryNext').onclick=advance;$('#millNotebookRead').onclick=advance;
  $('#millStoryPrev').onclick=()=>{if(disposed||!checkRun()||index()===0)return;grain.briefing=index()-1;persist();show();};
  show();
  return {destroy(){disposed=true;scene.remove();game.classList.remove('mill-story-mode');}};
 }};
})(window);
