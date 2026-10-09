(function(root){
 'use strict';
 const M=root.IslandMath,$=id=>document.getElementById(id),n=v=>Number(v.toFixed(1)).toLocaleString('ko-KR'),litres=v=>Math.round(v).toLocaleString('ko-KR')+' L';
 root.IslandBath={mount({state,persist,feedback,tone,next,checkRun,poolIllustration}){
  const board=$('board'),controls=$('controls'),confirm=$('confirm'),game=$('game'),layout=board.parentElement,header=game.querySelector('.section-title'),footer=game.querySelector('.game-footer'),help=$('help'),oldHelp=help.textContent;
  layout.insertBefore(controls,board);game.classList.add('bath-mode');layout.dataset.play='bath';help.textContent='💡 설명·힌트 다시 보기';
  let round=0,spa=null,running=false,slow=false,disposed=false,frame=0,last=0,lastDraw=0,previousRates=[];
  const toolsDialog=document.createElement('dialog');toolsDialog.id='bathToolsDialog';toolsDialog.className='bath-dialog bath-adjust-dialog';toolsDialog.setAttribute('aria-labelledby','bathToolsTitle');document.body.append(toolsDialog);
  if(state.spa.rules!==2){state.spa={rules:2,rounds:[],events:[],clock:0};persist();}
  const helper=root.IslandBathHelp.create({read:()=>({round,spa}),pause});
  const blocked=()=>!!document.querySelector('dialog[open]')||document.hidden;
  function bind(id,fn){$(id).onclick=()=>{if(!disposed&&checkRun())fn();};}
  function primary(label,fn,disabled=false){confirm.textContent=label;confirm.disabled=disabled;confirm.onclick=()=>{if(!disposed&&!blocked()&&checkRun())fn();};}
  function restore(){round=state.spa.rounds.length;if(round>=3)return;spa=M.bathReplay(round,state.spa.events);if(!spa||spa.status!=='playing'){state.spa.events=[];state.spa.clock=0;spa=M.bathCreate(round);}if(state.spa.clock>spa.time)M.bathAdvance(spa,state.spa.clock-spa.time);running=false;last=0;}
  function reset(){running=false;state.spa.events=[];state.spa.clock=0;spa=M.bathCreate(round);persist();render();feedback('이번 단계만 다시 준비했어요. 앞서 마친 단계는 그대로예요.');}
  // Derive tutorial steps from the real valves and water, including restored games.
  function instruction(){
   if(!spa||round>=3)return {text:'모든 탕을 준비했어요!',target:null};
   if(spa.status==='failed')return {text:spa.reason+' 설명·힌트에서 이번 단계를 다시 살펴봐요.',target:'help'};
   if(spa.status==='won')return {text:round<2?'잘했어요! 같은 자리의 다음 단계 버튼으로 이어가요.':'모든 탕 준비 완료! 온천의 빛을 받아요.',target:'confirm'};
   const c=M.bathRounds[round],atTarget=c.areas.findIndex((a,i)=>spa.open[i]&&!spa.done[i]&&spa.volumes[i]>=a*300-1e-6);
   if(round<2&&atTarget!==-1)return {text:`${M.poolNames[atTarget]}이 목표 ${litres(c.areas[atTarget]*300)}에 도착했어요! 시계를 멈췄으니 왼쪽의 물 잠그기를 직접 눌러 주세요.`,target:'bathValve'+atTarget,close:atTarget};
   if(round===0){
    if(!spa.open[0])return {text:'① 솔바람탕은 물 600 L가 필요해요. 먼저 왼쪽의 솔바람탕 물 켜기를 눌러 보세요.',target:'bathValve0'};
    if(!running)return {text:spa.time?`② 남은 ${litres(Math.max(0,600-spa.volumes[0]))} ÷ 100 = ${n(Math.max(0,600-spa.volumes[0])/100)}초! 왼쪽 맨 위에서 운영을 계속해요.`:'② 초당 100 L씩 넣으면 600 ÷ 100 = 6초! 왼쪽 맨 위에서 운영 시작하기를 눌러요.',target:'confirm'};
    return {text:'③ 1초마다 100 L씩 들어가요. 목표 600 L에 닿으면 자동으로 멈춰요. 그때 직접 잠가 주세요.',target:null};
   }
   if(round===1){
    if(!spa.done[1]&&!spa.open[1])return {text:'① 바다탕은 1,200 ÷ 40 = 최소 30초가 필요해요. 손님은 32초 뒤! 먼저 바다탕 물 켜기를 눌러요.',target:'bathValve1'};
    if(!spa.done[0]&&!spa.open[0])return {text:'② 솔바람탕도 함께 켜 보세요. 손님이 먼저 오는 작은 탕과 오래 걸리는 큰 탕을 함께 준비해요.',target:'bathValve0'};
    if(!spa.done[0])return {text:running?'③ 솔바람탕 80 L/초, 바다탕 40 L/초! 빈 솔바람탕은 600 ÷ 80 = 7.5초가 필요해요. 목표에 닿으면 직접 잠가요.':'③ 물 120 L가 솔바람탕 80 L/초, 바다탕 40 L/초로 나뉘어요. 공급량을 확인하고 운영을 시작해요.',target:running?null:'confirm'};
    const left=Math.max(0,1200-spa.volumes[1]);
    return {text:running?'④ 바다탕은 배관 한도 때문에 계속 40 L/초로 채워져요. 목표 1,200 L에 닿으면 직접 잠가 마무리해요.':`④ 바다탕은 최대 40 L/초예요. 남은 ${litres(left)} ÷ 40 ≈ ${n(left/40)}초! 운영 계속하기를 눌러요.`,target:running?null:'confirm'};
   }
   return {text:'손님이 먼저 오는 탕과 채우는 데 오래 걸리는 탕을 함께 생각해요. 이번에는 초록 구간에서 직접 잠가 주세요.',target:null};
  }
  function render(){
   header.append(help);footer.append(confirm);previousRates=[];
   board.className='board spa-scene';board.style.backgroundImage="url('asset/island-tour/spa-deck-v2.webp')";
   if(M.solved(state,'spa')){
    board.innerHTML='<div class="spa-final"><span>✦</span><h2>노을 온천, 준비 완료!</h2><p>물의 양과 공급 속도를 생각해 모두 준비했어요.</p><div class="happy-guests">'+[2,3,4].map((a,i)=>poolIllustration(a,3,true,false,i)).join('')+'</div></div>';
    controls.innerHTML='<div class="bath-main-buttons"></div><div class="play-win"><span class="win-symbol">✦</span><h2>함께 즐기는 노을</h2><p>오래 걸리는 탕을 미리 준비하고, 먼저 채운 탕을 잠가 물을 나눴어요.</p></div>';controls.querySelector('.bath-main-buttons').append(confirm,help);primary('다음 이야기 →',next);feedback('필요한 물 ÷ 공급 속도! 걸리는 시간을 비교해 온천의 빛을 찾았어요.','good');return;
   }
   const c=M.bathRounds[round];
   controls.innerHTML=`<div class="bath-main-buttons"></div><div class="bath-source"><strong>전체 공급 최대 ${c.flow} <small>L/초</small></strong><span id="bathTotal"></span><span id="bathReserve"></span></div><div class="bath-valves">${M.poolNames.map((name,i)=>`<article class="bath-control" data-pool="${i}"><header><strong>${name}</strong><small id="bathControlRate${i}"></small></header>${i<c.areas.length?`<button id="bathValve${i}" class="valve"></button>`:`<div class="bath-locked">${i+1}단계에서 함께 준비해요</div>`}</article>`).join('')}</div><div class="bath-tools"><button id="bathSlow" aria-pressed="${slow}">${slow?'½ 천천히 켜짐':'½ 천천히'}</button><button id="bathTools">물 조절·다시</button></div>`;
   controls.querySelector('.bath-main-buttons').append(confirm,help);
   board.innerHTML=`<div class="spa-topline"><span>${round+1} / 3 · ${round<2?'함께 연습':'직접 운영'}</span><b>${c.title}</b><span id="bathTime"></span></div><aside class="bath-coach" aria-label="서연의 진행 안내"><img src="asset/서연.svg" alt="서연"><div><small>서연 ${round<2?'· 따라 해 보세요':'· 이제 직접 해 보세요'}</small><p id="bathCoachText" role="status"></p></div></aside><div class="pool-row" data-count="${c.areas.length}">${c.areas.map((area,i)=>`<article class="pool-card" data-pool="${i}"><header><strong>${M.poolNames[i]}</strong><span id="bathDeadline${i}"></span></header><div class="bath-flow-display"><small id="bathFlowLabel${i}"></small><strong id="bathRate${i}"></strong><span class="bath-max">배관 최대 <b>${c.caps[i]} L/초</b></span></div><div id="bathArt${i}" class="pool-art"></div><div class="pool-measure"><strong id="bathVolume${i}"></strong><div class="pool-gauge"><span class="target-zone"></span><span id="bathGauge${i}" class="pool-gauge-fill"></span><b class="target-mark"></b></div><span id="bathHeight${i}"></span></div></article>`).join('')}</div><div class="spa-board-note">목표 높이 30 cm · 초록 구간 28~33 cm에서 잠그기</div>`;
   c.areas.forEach((_,i)=>bind('bathValve'+i,()=>operate('toggle',i)));
   bind('bathSlow',()=>{slow=!slow;$('bathSlow').textContent=slow?'½ 천천히 켜짐':'½ 천천히';$('bathSlow').setAttribute('aria-pressed',slow);});bind('bathTools',openTools);update();
  }
  function update(){
   if(disposed||!spa||!$('bathTime'))return;
   const c=M.bathRounds[round],rates=M.bathRates(spa),total=rates.reduce((a,b)=>a+b,0),guide=instruction();
   $('bathTime').textContent=(running?'운영 중 ':'멈춤 ')+n(spa.time)+'초';$('bathTotal').textContent=(running?'현재 공급 ':'운영 시 공급 ')+n(total)+' L/초';$('bathReserve').textContent='남은 물 '+litres(Math.max(0,c.budget-spa.used));
   if($('bathCoachText').textContent!==guide.text)$('bathCoachText').textContent=guide.text;
   controls.querySelectorAll('.bath-focus').forEach(el=>{if(el.id!==guide.target)el.classList.remove('bath-focus');});if(guide.target)$(guide.target)?.classList.add('bath-focus');
   c.areas.forEach((area,i)=>{
    const h=M.bathHeight(spa,i),good=h>=M.BATH_LOW-1e-8&&h<=M.BATH_HIGH+1e-8,ready=spa.done[i],rate=$('bathRate'+i);
    rate.textContent=n(rates[i])+' L/초';$('bathFlowLabel'+i).textContent=ready?'준비 완료':running?'지금 들어오는 물':'운영하면 들어오는 물';$('bathControlRate'+i).textContent=ready?'✓ 완료':n(rates[i])+' L/초';
    if(previousRates[i]!==undefined&&previousRates[i]!==rates[i]){rate.classList.remove('rate-changed');void rate.offsetWidth;rate.classList.add('rate-changed');}previousRates[i]=rates[i];
    $('bathVolume'+i).textContent=litres(spa.volumes[i])+' / 목표 '+litres(area*300);$('bathArt'+i).innerHTML=poolIllustration(area,h/10,ready,spa.open[i]&&running,i).replace('0 0 300 280','0 105 300 175');$('bathGauge'+i).style.width=(h/M.BATH_MAX*100)+'%';$('bathGauge'+i).classList.toggle('good',good);$('bathHeight'+i).textContent=(ready?'준비 완료 · ':'물높이 ')+n(h)+' cm';$('bathDeadline'+i).textContent=ready?'손님 맞을 준비 완료':'손님 도착 '+n(Math.max(0,c.deadlines[i]-spa.time))+'초 뒤';$('bathDeadline'+i).classList.toggle('urgent',!ready&&c.deadlines[i]-spa.time<4);
    const v=$('bathValve'+i);v.textContent=ready?'✓ 준비 완료':spa.open[i]?(good?'지금 잠그기 ✓':'물 잠그기'):'물 켜기';v.setAttribute('aria-pressed',spa.open[i]);v.classList.toggle('in-zone',good&&spa.open[i]);v.disabled=ready||spa.status!=='playing';
   });
   $('bathSlow').disabled=spa.status!=='playing';
   if(spa.status==='failed'){running=false;primary('이번 단계 다시 하기',reset);feedback(spa.reason,'bad');}
   else if(spa.status==='won'){running=false;primary(round<2?'다음 단계로 →':'온천의 빛 받기 →',()=>{round=state.spa.rounds.length;state.spa.events=[];state.spa.clock=0;if(round<3)spa=M.bathCreate(round);render();if(round<3)feedback(round<2?'서연이와 두 탕을 함께 준비해요.':'이제 직접 세 탕을 운영해요. 설명·힌트는 언제든 다시 볼 수 있어요.');});feedback('모든 탕 준비 완료! 사용한 물 '+litres(spa.used)+' · '+n(spa.time)+'초','good');}
   else {
    const mustOpen=round<2&&c.areas.some((_,i)=>!spa.done[i]&&!spa.open[i]);
    const stopForClose=round<2&&guide.close!==undefined;
    primary(stopForClose?'← 목표에 닿은 탕 잠그기':running?'Ⅱ 운영 멈추기':spa.time?'▶ 운영 계속하기':'▶ 운영 시작하기',()=>{running=!running;last=0;state.spa.clock=spa.time;persist();update();feedback(running?'초록 구간을 보며 준비된 탕을 잠가요.':'시간과 물 공급을 멈췄어요. 밸브를 조절하거나 설명을 다시 볼 수 있어요.');},!running&&(mustOpen||stopForClose));
   }
  }
  function operate(op,i){
   if(!spa||spa.status!=='playing')return;
   const event={t:spa.time,op,i};if(!M.bathOperate(spa,op,i))return;
   state.spa.events.push(event);state.spa.clock=spa.time;
   if(round<2){running=false;last=0;}
   if(spa.status==='won'){running=false;state.spa.rounds[round]=state.spa.events.map(e=>({...e}));state.spa.events=[];state.spa.clock=0;tone();}
   persist();update();
  }
  function openTools(){
   pause();const c=M.bathRounds[round];
   toolsDialog.innerHTML=`<header><h2 id="bathToolsTitle">물 조절 · 이번 단계 다시 준비</h2><button id="bathToolsClose">닫기 ×</button></header><p>먼저 밸브를 잠근 뒤 물높이를 낮춰요. 빼낸 물은 다시 사용할 수 없어요.</p><div class="bath-drain-list">${c.areas.map((a,i)=>`<article><strong>${M.poolNames[i]}</strong><span>${n(M.bathHeight(spa,i))} cm</span><button id="bathDrain${i}" ${spa.done[i]||spa.open[i]||spa.volumes[i]<=0||spa.status!=='playing'?'disabled':''}>5 cm 낮추기</button></article>`).join('')}</div><footer><button id="bathRetry">이번 단계 처음부터</button><button id="bathToolsReturn" class="primary">운영 화면으로 →</button></footer>`;
   c.areas.forEach((_,i)=>bind('bathDrain'+i,()=>{operate('drain',i);openTools();}));bind('bathRetry',()=>{toolsDialog.close();reset();});bind('bathToolsClose',()=>toolsDialog.close());bind('bathToolsReturn',()=>toolsDialog.close());if(!toolsDialog.open)toolsDialog.showModal();
  }
  function tick(ts){
   if(disposed)return;
   if(running&&spa?.status==='playing'&&!blocked()){
    if(last){let dt=Math.min((ts-last)/1000,.1)*(slow?.5:1);const c=M.bathRounds[round],rates=M.bathRates(spa);
     if(round<2)c.areas.forEach((a,i)=>{if(spa.open[i]&&!spa.done[i]&&rates[i]>0)dt=Math.min(dt,Math.max(0,(a*300-spa.volumes[i])/rates[i]));});
     M.bathAdvance(spa,dt);
     const reached=round<2&&c.areas.some((a,i)=>spa.open[i]&&!spa.done[i]&&spa.volumes[i]>=a*300-1e-6);
     if(reached||spa.status==='failed'){running=false;last=0;state.spa.clock=spa.time;persist();if(spa.status==='failed')tone(false);update();}
     else if(ts-lastDraw>80){update();lastDraw=ts;}
    }
    last=running?ts:0;
   }else last=0;
   frame=requestAnimationFrame(tick);
  }
  function pause(){if(spa?.status==='playing'){running=false;last=0;state.spa.clock=spa.time;persist();update();}}
  const visibility=()=>{if(document.hidden)pause();};window.addEventListener('blur',pause);document.addEventListener('visibilitychange',visibility);restore();render();if(!M.solved(state,'spa'))feedback(round<2?'서연의 안내를 따라 왼쪽 버튼을 눌러 보세요. 목표에 닿으면 연습 시계가 멈춰요.':'왼쪽에서 모든 밸브를 조작해요. 설명·힌트는 언제든 다시 볼 수 있어요.');frame=requestAnimationFrame(tick);
  return {help:()=>helper.open(),pause,destroy(){disposed=true;running=false;cancelAnimationFrame(frame);helper.destroy();toolsDialog.remove();window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',visibility);confirm.onclick=null;footer.append(confirm);header.append(help);help.classList.remove('bath-focus');help.textContent=oldHelp;layout.append(controls);layout.removeAttribute('data-play');game.classList.remove('bath-mode');board.style.backgroundImage='';}};
 }};
})(window);
