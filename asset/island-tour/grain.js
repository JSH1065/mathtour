(function(root){
 'use strict';
 const M=root.IslandMath;
 function jug(cap,amount,selected){
  const top=248-cap*29,level=248-amount*29;let rice='';
  for(let k=0;k<80;k++){const x=69+(k*37)%100,y=level+9+(k*19)%Math.max(12,amount*28-10);if(y<242)rice+='<ellipse cx="'+x+'" cy="'+y+'" rx="3.6" ry="1.8" fill="'+(k%3?'#f7deb0':'#fff5d9')+'" transform="rotate('+k*31+' '+x+' '+y+')"/>';}
  return '<svg viewBox="0 0 240 280" aria-hidden="true"><defs><linearGradient id="wood'+cap+'"><stop stop-color="#65452c"/><stop offset=".45" stop-color="#b17c45"/><stop offset="1" stop-color="#67462d"/></linearGradient><linearGradient id="grain'+cap+'" x2="0" y2="1"><stop stop-color="#ffebbb"/><stop offset="1" stop-color="#bf934d"/></linearGradient><clipPath id="clip'+cap+'"><path d="M60 '+top+'H180L167 241Q120 261 73 241Z"/></clipPath></defs><ellipse cx="120" cy="256" rx="78" ry="13" fill="#34271d" opacity=".3"/><path d="M57 '+top+'Q120 '+(top+22)+' 183 '+top+'L170 245Q120 269 70 245Z" fill="url(#wood'+cap+')" stroke="#482f24" stroke-width="3"/><g clip-path="url(#clip'+cap+')"><rect x="62" y="'+top+'" width="117" height="'+(248-top)+'" fill="#604b37"/><rect x="61" y="'+level+'" width="119" height="'+(amount*29+13)+'" fill="url(#grain'+cap+')"/>'+(amount?rice:'')+'<path d="M79 '+top+'L87 255M162 '+top+'L155 255" stroke="#fee3b3" opacity=".28" stroke-width="3"/></g><ellipse cx="120" cy="'+top+'" rx="64" ry="13" fill="none" stroke="#ddb273" stroke-width="9"/><path d="M70 225Q120 243 172 225" fill="none" stroke="#695444" stroke-width="7"/>'+(selected?'<ellipse cx="120" cy="259" rx="78" ry="15" fill="none" stroke="#ffe398" stroke-width="4"/>':'')+'</svg>';
 }
 root.IslandGrain={render({g,selected,board,controls,choose,act,undo,hint}){
  const amounts=M.grainReplay(g.actions)||[0,0];
  board.className='board grain-scene';board.style.backgroundImage="url('asset/island-tour/granary-v2.webp')";
  board.innerHTML='<div class="grain-scene-title">오늘의 준비 · 곡식 <b>4칸</b></div><div class="grain-vessels">'+amounts.map((a,i)=>'<button class="jug '+(i===selected?'selected':'')+'" data-jug="'+i+'" aria-label="'+M.grainCapacity[i]+'칸 통 선택, 현재 '+a+'칸" aria-pressed="'+(selected===i)+'">'+jug(M.grainCapacity[i],a,selected===i)+'<span class="jug-name">'+M.grainCapacity[i]+'칸 통</span><strong>'+a+'<small> / '+M.grainCapacity[i]+'칸</small></strong></button>').join('')+'</div><div class="grain-move-badge">'+g.actions.length+'번 옮김</div><div class="scene-caption">통의 안쪽을 비춰 보여주는 체험용 그림</div>';
  controls.innerHTML='<div class="task-kicker">첫 번째 준비 · 곡식 나누기</div><h2>한 통에 4칸 남기기</h2><p>선택한 통: <b>'+M.grainCapacity[selected]+'칸 통</b></p><div class="grain-actions"><button data-grain="fill" '+(amounts[selected]===M.grainCapacity[selected]?'disabled':'')+'>자루에서 가득 채우기</button><button data-grain="pour" '+(!amounts[selected]||amounts[1-selected]===M.grainCapacity[1-selected]?'disabled':'')+'>다른 통에 옮겨 붓기</button><button data-grain="return" '+(!amounts[selected]?'disabled':'')+'>자루에 돌려놓기</button></div><div class="micro-actions"><button id="grainUndo" '+(!g.actions.length?'disabled':'')+'>한 수 되돌리기</button><button id="grainHint">다음 행동 힌트</button></div><p class="small">넘치지 않을 만큼 끝까지 부어요.<br>정확히 4칸을 만든 뒤 맷돌에 넣어요.</p>';
  board.querySelectorAll('[data-jug]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.jug)));
  controls.querySelectorAll('[data-grain]').forEach(b=>b.onclick=()=>act(b.dataset.grain));
  controls.querySelector('#grainUndo').onclick=undo;controls.querySelector('#grainHint').onclick=hint;
 }};
})(window);
