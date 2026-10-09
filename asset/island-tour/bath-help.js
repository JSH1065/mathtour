(function(root){
 'use strict';
 const M=root.IslandMath;
 function create({read,pause}){
  const modal=document.createElement('dialog');modal.id='bathHelp';modal.className='bath-dialog';modal.setAttribute('aria-labelledby','bathHelpTitle');
  modal.innerHTML=`<header><div><small>서연의 온천 운영 수첩</small><h2 id="bathHelpTitle">물을 얼마나, 얼마나 빨리 넣을까요?</h2></div><button data-close>닫기 ×</button></header><nav class="bath-help-tabs" aria-label="설명 선택"><button data-page="principle" aria-pressed="true">수학 원리</button><button data-page="how" aria-pressed="false">조작 방법</button><button data-page="guide" aria-pressed="false">단계별 힌트</button></nav>
  <section data-panel="principle"><div class="bath-formula">걸리는 시간 = 필요한 물 ÷ 공급 속도</div><p>물 <b>600 L</b>를 <b>초당 100 L</b>씩 넣으면 <b>6초</b>가 걸려요.</p><div class="bath-examples"><article><small>한 탕 채우기</small><strong>600 ÷ 100 = 6초</strong><p>1초마다 100 L씩!<br>6초가 되면 600 L예요.</p></article><article><small>천천히 차는 큰 탕</small><strong>1,200 ÷ 40 = 30초</strong><p>최대로 넣어도 30초!<br>손님이 늦게 와도 미리 준비해요.</p></article></div><h3>‘현재’와 ‘최대’는 달라요</h3><p><b>배관 최대</b>는 그 탕이 받아들일 수 있는 한도예요. <b>현재 공급량</b>은 열린 배관에 물을 나눈 뒤 실제 들어오는 양이에요. 다른 탕의 밸브를 바꾸면 달라질 수 있어요.</p><div class="bath-help-note">운영 중에는 <b>남은 물 ÷ 현재 공급 속도</b>로 지금부터 걸리는 시간을 생각해요. 현재 속도가 유지될 때의 시간이에요.</div><small class="bath-model-note">탕의 목표 높이는 30 cm예요. 초록 구간 28~33 cm에서 잠그면 준비 완료! 물의 양·속도·도착 시간은 체험용 수치예요.</small></section>
  <section data-panel="how" hidden><h3>조작은 모두 왼쪽에서 해요</h3><ol class="bath-how"><li><b>① 탕 이름을 보고 ‘물 켜기’</b><p>왼쪽 버튼과 오른쪽 탕의 이름·색깔이 같아요. 밸브를 열면 운영할 때 들어갈 양을 먼저 볼 수 있어요.</p></li><li><b>② ‘운영 시작하기’</b><p>시계와 물이 함께 움직여요. 같은 자리에 있는 <b>멈추기</b>를 누르면 시간을 멈추고 생각할 수 있어요.</p></li><li><b>③ 초록 구간에서 ‘물 잠그기’</b><p>목표에 도달한 탕을 잠가요. 다른 탕의 공급량이 달라지는지도 확인해요.</p></li></ol><div class="bath-help-note"><b>1·2단계는 따라 하기:</b> 목표에 닿으면 자동으로 멈춰요. 강조된 잠그기 버튼을 직접 눌러 마무리해요.<br><b>3단계는 직접 운영:</b> 천천히와 멈추기를 활용해 스스로 잠가요.</div><p class="bath-model-note">물이 넘쳤다면 왼쪽 ‘물 조절·다시’를 열어요. 밸브를 잠근 뒤 물높이를 5 cm씩 낮출 수 있어요.</p></section>
  <section data-panel="guide" hidden><div class="bath-guide-speaker"><img src="asset/서연.svg" alt="서연"><div><small id="bathGuideStage"></small><h3>한 단계씩 생각해 보자!</h3><p>현재 물과 밸브는 그대로 두고 함께 살펴봐요.</p></div></div><article id="bathGuideText" class="bath-guide-card" aria-live="polite"></article><div class="bath-hint-nav"><button id="bathHintPrev">← 이전 단서</button><button id="bathHintNext">다음 단서 →</button></div></section>
  <footer><span>설명을 보는 동안 시간과 물 공급은 멈춰요.</span><button class="primary" data-close>운영 화면으로 →</button></footer>`;
  document.body.append(modal);let page='principle',level=0,lastRound=-1,focus=null;
  function hints(round){return [
   ['솔바람탕은 물 600 L가 필요해. 초당 100 L씩 넣으면 600 ÷ 100 = 6초야. 먼저 물 켜기를 눌러 봐.', '이제 왼쪽 맨 위에서 운영 시작하기를 눌러 보자. 시계와 물높이가 함께 올라가!', '6초에 600 L가 되면 연습 시계가 자동으로 멈춰. 강조된 물 잠그기를 누르면 첫 연습 성공이야!'],
   ['바다탕은 물 1,200 L가 필요하지만 배관은 최대 초당 40 L야. 최소 30초가 필요하고 손님은 32초 뒤에 와. 바다탕부터 열어 준비하자.', '솔바람탕도 함께 열어 봐. 두 탕을 열면 총 120 L가 솔바람탕 80 L/초, 바다탕 40 L/초로 나뉘어. 두 탕을 준비한 뒤 시작하자.', '솔바람탕은 600 ÷ 80 = 7.5초에 차. 자동으로 멈추면 솔바람탕을 잠가 줘. 바다탕은 배관 한도 때문에 계속 40 L/초야.', '운영 계속하기를 눌러 바다탕을 채우자. 시작부터 총 30초가 되면 바다탕도 준비돼. 멈춘 뒤 바다탕을 잠그면 성공!'],
   ['노을탕은 1,200 ÷ 40 = 최소 30초가 필요해. 손님은 32초 뒤에 오니까 처음부터 준비해야겠지?', '첫 손님은 솔바람탕에 8초 뒤에 와. 솔바람탕과 노을탕을 함께 열면 각각 100 L/초와 40 L/초로 채울 수 있어.', '솔바람탕은 약 6초에 목표에 닿아. 잠근 뒤 바다탕을 열자. 노을탕은 계속 열어 두면 돼.', '바다탕은 900 ÷ 100 = 9초가 필요해. 약 15초에 잠그고, 노을탕은 약 30초에 잠가 봐. 초록 구간을 보며 직접 잠그는 걸 잊지 마!']
  ][Math.min(round,2)];}
  function select(p){page=p;const {round}=read();if(round!==lastRound){level=0;lastRound=round;}const lines=hints(round);level=Math.min(level,lines.length-1);modal.querySelectorAll('[data-page]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.page===page));modal.querySelectorAll('[data-panel]').forEach(el=>el.hidden=el.dataset.panel!==page);modal.querySelector('#bathGuideStage').textContent=`${Math.min(round+1,3)}단계 · ${round<2?'함께 연습':'직접 운영'}`;modal.querySelector('#bathGuideText').innerHTML=`<small>단서 ${level+1} / ${lines.length}</small><p>${lines[level]}</p>`;modal.querySelector('#bathHintPrev').disabled=level===0;modal.querySelector('#bathHintNext').disabled=level===lines.length-1;}
  modal.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>select(b.dataset.page));modal.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal.close());
  modal.querySelector('#bathHintPrev').onclick=()=>{level=Math.max(0,level-1);select('guide');};modal.querySelector('#bathHintNext').onclick=()=>{level++;select('guide');};
  modal.addEventListener('close',()=>{if(focus?.isConnected)focus.focus({preventScroll:true});});
  return {open(p='principle'){pause();focus=document.activeElement;select(p);if(!modal.open)modal.showModal();},destroy(){if(modal.open)modal.close();modal.remove();}};
 }
 root.IslandBathHelp={create};
})(window);
