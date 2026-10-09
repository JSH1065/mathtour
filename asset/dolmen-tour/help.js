(function(root){
 'use strict';
 function create({state,paint}){
  const dialog=document.createElement('dialog');dialog.className='dolmen-help';dialog.id='dolmenHelp';
  dialog.setAttribute('aria-labelledby','dolmenHelpTitle');
  dialog.innerHTML=`<header><div><small>서연의 수첩 · 언제든 다시 볼 수 있어요</small><h2 id="dolmenHelpTitle">다섯 명의 힘을 어떻게 나눌까요?</h2></div><button data-dismiss aria-label="설명 닫기">닫기 ×</button></header>
   <nav class="dolmen-help-tabs" aria-label="설명 선택"><button data-page="concept" aria-pressed="true">반비례 · 문제</button><button data-page="how" aria-pressed="false">조작 방법</button><button data-page="guide" aria-pressed="false">한 단계 힌트</button></nav>
   <section data-panel="concept">
    <h3>1. 거리가 길어지면, 필요한 인원은 줄어요</h3>
    <p>같은 돌을 들 때, 받침점에서 누르는 곳까지의 거리가 <b>2배</b>가 되면 필요한 인원은 <b>절반</b>이 돼요. 이렇게 두 양의 곱이 일정한 관계를 <b>반비례</b>라고 해요.</p>
    <h3>2. 거리 × 필요한 인원은 항상 6이에요</h3>
    <div class="lever-examples">${[[1,6],[2,3],[3,2]].map(([d,n])=>`<figure><canvas data-example="${d}" role="img" aria-label="받침점에서 ${d}미터 떨어진 곳을 ${n}명이 누르는 지렛대"></canvas><figcaption><strong>${d}m <span>→</span> ${n}명</strong><small>${d} × ${n} = 6</small></figcaption></figure>`).join('')}</div>
    <div class="lever-question"><h3>3. 일꾼은 모두 5명! 어떻게 나누면 될까요?</h3><p>왼쪽은 바위 때문에 <b>최대 2m</b>, 오른쪽은 <b>최대 3m</b>예요.<br>거리와 인원을 정해 <b>돌의 양쪽 끝을 같은 힘으로</b> 들어 올려요.</p></div>
    <small class="lever-assumption">한 사람의 힘과 돌 쪽 지렛대 길이가 같은 체험 모형이에요. 거리·인원은 게임 설정이에요.</small>
   </section>
   <section data-panel="how" hidden>
    <h3>버튼은 이 순서로 눌러 보세요</h3>
    <ol class="lever-how"><li><b>① 누르는 거리 선택</b><p>왼쪽과 오른쪽의 <strong>1m · 2m · 3m</strong> 버튼을 눌러요. 그림의 금색 선이 <strong>받침점부터 누르는 자리까지의 거리</strong>예요.</p></li><li><b>② 일꾼 다섯 명 나누기</b><p><strong>＋</strong>로 일꾼을 보내고, <strong>−</strong>로 돌려보내요. 위쪽의 <strong>대기 인원</strong>을 확인해요.</p></li><li><b>③ 함께 들어 올리기</b><p>양쪽의 <strong>거리 × 인원이 각각 6</strong>이 되면 준비 완료! 아래의 <strong>함께 들어 올리기</strong>를 눌러요.</p></li></ol>
    <div class="lever-question"><p>여기서 같은 힘은 <b>돌의 양쪽 끝을 들어 올리는 힘</b>이에요. 거리에 따라 양쪽에 필요한 사람 수는 달라질 수 있어요.</p></div>
   </section>
   <section data-panel="guide" hidden><div class="lever-guide-speaker"><img src="asset/서연.svg" alt="서연"><div><small>서연이와 한 단계씩</small><h3>왼쪽부터 차근차근 생각해 보자!</h3><p id="leverGuideCurrent"></p></div></div><ol id="leverGuideSteps" class="lever-guide-steps" aria-live="polite"></ol><div class="lever-hint-nav"><button id="leverPrevHint">← 이전 단서</button><button id="leverMoreHint">다음 단서 보기 →</button></div></section>
   <footer><span>설명을 닫아도 지금 배치는 그대로예요.</span><button class="primary" data-dismiss>이어서 도전하기 →</button></footer>`;
  document.body.append(dialog);let page='concept',level=0,returnFocus=null;
  const hints=[
   '왼쪽은 최대 2m야. 1m에는 6명이 필요해서, 다섯 명으로는 한쪽도 들 수 없어. 왼쪽 거리를 2m로 바꿔 볼까?',
   '왼쪽은 2 × 인원 = 6이 되어야 해. 6 ÷ 2 = 3이니까 왼쪽에 3명을 보내자. 이제 2명이 남았어.',
   '오른쪽은 남은 2명이 들어야 해. 거리 × 2 = 6이니까 거리는 3m! 오른쪽 3m에 2명을 보내 보자.',
   '왼쪽 2m × 3명 = 6, 오른쪽 3m × 2명 = 6. 다섯 명이 양쪽에서 같은 힘으로 들 수 있어! 이제 함께 들어 올리기를 눌러 보자.'
  ];
  function renderGuide(){
   const s=state.lever;dialog.querySelector('#leverGuideCurrent').textContent=`지금 배치: 왼쪽 ${s.arms[0]}m·${s.crew[0]}명 / 오른쪽 ${s.arms[1]}m·${s.crew[1]}명`;
   const step=dialog.querySelector('#leverGuideSteps');step.dataset.stage=String(level+1);step.innerHTML=`<li><b>단서 ${level+1} / ${hints.length}</b><p>${hints[level]}</p></li>`;
   dialog.querySelector('#leverPrevHint').disabled=level===0;
   const more=dialog.querySelector('#leverMoreHint');more.disabled=level===hints.length-1;more.textContent=more.disabled?'모든 단서를 확인했어요':'다음 단서 보기 →';
  }
  function select(next){page=next;dialog.querySelectorAll('[data-page]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.page===page));dialog.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==page);renderGuide();if(page==='concept')requestAnimationFrame(()=>dialog.querySelectorAll('[data-example]').forEach(c=>paint(c,+c.dataset.example,6/+c.dataset.example)));}
  dialog.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>select(b.dataset.page));
  dialog.querySelectorAll('[data-dismiss]').forEach(b=>b.onclick=()=>dialog.close());
  dialog.querySelector('#leverMoreHint').onclick=()=>{level=Math.min(hints.length-1,level+1);renderGuide();};
  dialog.querySelector('#leverPrevHint').onclick=()=>{level=Math.max(0,level-1);renderGuide();};
  dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
  return {open(initial='concept'){returnFocus=document.activeElement;select(initial);if(!dialog.open)dialog.showModal();select(initial);},destroy(){if(dialog.open)dialog.close();dialog.remove();}};
 }
 root.DolmenHelp={create};
})(window);
