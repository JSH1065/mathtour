(function(root){'use strict';
 const M=root.NamdongMath,A='asset/namdong-tour/',num=n=>n.toLocaleString('ko-KR');
 // Painterly PNG assets provide all object artwork; numbers remain accessible HTML.
 function boxArt(dims,count=0,open=false,labels=false){
  const [w,d,h]=dims,sx=(w+d*.6)/42,sy=(h+d*.42)/23.4,fit=1/Math.max(1,sx,sy);
  const spots=[[36,28,-9],[53,25,8],[69,35,-10],[44,36,5],[62,29,-7],[56,38,10]];
  return '<div class="crab-box-art illustrated-box" role="img" aria-label="'+[w,d,h].join(' × ')+'cm 꽃게 상자'+(open?', 꽃게 '+count+'마리':'')+'"><div class="box-picture-frame"><div class="box-object" style="--box-sx:'+sx*fit+';--box-sy:'+sy*fit+'"><img class="box-painting" src="'+A+(open?'crab-box-open-illustration.webp':'crab-box-closed-illustration.webp')+'" alt="" draggable="false">'+(open?'<div class="box-crab-layer">'+spots.slice(0,count).map(([x,y,r],i)=>'<img class="packed-crab" src="'+A+'crab-illustration.webp" alt="" draggable="false" style="left:'+x+'%;top:'+y+'%;--crab-angle:'+r+'deg;--crab-order:'+i+'">').join('')+'</div>':'')+'</div>'+(labels?'<div class="box-dimension-labels"><span>가로 <b>'+w+'cm</b></span><span>세로 <b>'+d+'cm</b></span><span>높이 <b>'+h+'cm</b></span></div>':'')+'</div></div>';
 }
 function mount(c){
  const {state,board,controls,confirm}=c,s=state.packing,game=document.getElementById('game');
  const calc={expression:'',result:'',open:false};let alive=true,artFrame=0;function fitArt(){const host=board.querySelector('.illustrated-box'),frame=host?.querySelector('.box-picture-frame');if(!frame)return;const r=host.getBoundingClientRect(),w=Math.max(1,Math.min(690,r.width,r.height*1.5));frame.style.width=w+'px';frame.style.height=(w/1.5)+'px';}const observer=new ResizeObserver(fitArt);observer.observe(board);
  board.className='board crab-board';controls.className='crab-controls';
  const save=()=>c.persist(),warn=t=>{c.feedback(t,'bad');c.tone(false);};
  function calculator(){if(root.NamdongCalculator)root.NamdongCalculator.mount(controls,calc);}
  function heading(n,title){controls.innerHTML=`<small class="crab-stage">MISSION ${n}</small><h2>${title}</h2>`;}
  function order(items){return `<div class="crab-order">${items.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>`;}
  function draw(){
   cancelAnimationFrame(artFrame);artFrame=requestAnimationFrame(fitArt);
   game.dataset.marketPhase=s.phase;
   document.getElementById('gameTitle').textContent={design:'꽃게를 담을 상자를 만들어요',boxes:'주문에 필요한 상자는 몇 개일까요?',crabs:'꽃게를 한 상자에 알맞게 담아요',complete:'꽃게 주문 준비 완료!'}[s.phase];
   if(s.phase==='design'){
    board.innerHTML=order([['상자 부피','9,000cm³'],['겉넓이','2,800cm² 이하']])+`<div class="crab-workbench">${boxArt(s.dims,0,false,true)}</div><div class="crab-board-note">뚜껑을 포함한 여섯 면 · 길이는 5cm씩 조절해요.</div>`;
    heading('01 · 부피와 겉넓이','두 조건에 맞게 설계해요');
    controls.insertAdjacentHTML('beforeend','<div class="crab-dimensions">'+['가로','세로','높이'].map((name,i)=>`<div><label>${name}</label><button data-adjust="${i},-5" aria-label="${name} 5cm 줄이기" ${s.dims[i]<=5?'disabled':''}>−</button><output>${s.dims[i]}<small>cm</small></output><button data-adjust="${i},5" aria-label="${name} 5cm 늘리기" ${s.dims[i]>=60?'disabled':''}>＋</button></div>`).join('')+'</div>'+`<div class="crab-stats"><p class="${M.volume(s.dims)===9000?'met':''}"><span>현재 부피</span><strong>${num(M.volume(s.dims))}<small>cm³</small></strong></p><p class="${M.area(s.dims)<=2800?'met':''}"><span>현재 겉넓이</span><strong>${num(M.area(s.dims))}<small>cm²</small></strong></p></div><p class="crab-tip">‘이하’는 같거나 작다는 뜻이에요.</p>`);
    controls.querySelectorAll('[data-adjust]').forEach(b=>b.onclick=()=>{if(!c.checkRun())return;const [i,d]=b.dataset.adjust.split(',').map(Number);s.dims[i]+=d;draw();save();controls.querySelector(`[data-adjust="${i},${d}"]`).focus();});
    calculator();confirm.textContent='설계 확인하기';c.feedback('상자 부피와 겉넓이, 두 조건을 함께 확인해요.');
   }else if(s.phase==='boxes'){
    board.innerHTML=order([['전체 꽃게','7.2kg'],['한 상자에','1.2kg']])+`<div class="crab-workbench">${boxArt(s.dims,0,true)}<span class="crab-design-done">✓ 상자 설계 완료</span></div><div class="crab-board-note">우리가 만든 상자로 주문을 준비해요.</div>`;
    heading('02 · 소수의 나눗셈','상자는 몇 개 필요할까요?');
    controls.insertAdjacentHTML('beforeend',`<p class="merchant-tip"><b>상인</b> 같은 무게씩 나눌 때는 전체 무게를 한 상자에 담을 무게로 나누면 된단다.</p><label class="crab-answer-label" for="boxAnswer">필요한 상자 수</label><div class="crab-answer"><input id="boxAnswer" inputmode="numeric" autocomplete="off" maxlength="12"><span>개</span></div>`);
    const input=controls.querySelector('#boxAnswer');input.value=s.boxAnswer;input.oninput=()=>{s.boxAnswer=input.value;save();};input.onkeydown=e=>{if(e.key==='Enter')confirm.click();};
    calculator();confirm.textContent='상자 수 확인하기';c.feedback('7.2kg을 한 상자에 1.2kg씩 나누어 담아요.');
   }else if(s.phase==='crabs'){
    board.innerHTML=order([['한 상자에','1.2kg'],['꽃게 한 마리','400g']])+`<div class="crab-workbench">${boxArt(s.dims,s.crabs,true)}<div class="crab-scale" aria-live="polite"><span>꽃게만의 무게</span><strong>${num(s.crabs*400)}<small>g</small></strong><span>${s.crabs}마리 담았어요</span></div></div>`;
    heading('02 · 꽃게 담기','한 상자에 몇 마리일까요?');
    controls.insertAdjacentHTML('beforeend',`<div class="crab-supply"><img src="${A}crab-illustration.webp" alt="한 마리 400g인 꽃게"><strong>한 마리 400g</strong></div><button id="addCrab" class="primary" ${s.crabs>=6?'disabled':''}>꽃게 1마리 담기 ＋</button><button id="removeCrab" ${s.crabs===0?'disabled':''}>1마리 꺼내기 −</button><p class="crab-tip">1kg = 1,000g</p><small class="crab-learning-note">문제에서는 꽃게 한 마리를 모두 400g으로 생각해요.</small>`);
    for(const [id,delta]of [['addCrab',1],['removeCrab',-1]])controls.querySelector('#'+id).onclick=()=>{if(!c.checkRun())return;s.crabs=Math.max(0,Math.min(6,s.crabs+delta));draw();save();c.tone();controls.querySelector('#'+id).focus();};
    confirm.textContent='담은 무게 확인하기';c.feedback('400g인 꽃게를 담아 1.2kg을 맞춰요. 상자 무게는 빼고 생각해요.');
   }else{
    board.innerHTML=order([['준비한 상자','6상자'],['한 상자에','3마리 · 1.2kg']])+`<div class="crab-workbench">${boxArt(s.dims,3,true)}<span class="crab-design-done">✓ 꽃게 3마리 · 1,200g = 1.2kg</span></div><div class="crab-shipment">${Array.from({length:6},(_,i)=>`<span style="--i:${i}">✓ ${i+1}번 상자</span>`).join('')}</div>`;
    heading('ORDER COMPLETE','꽃게 주문을 완성했어요');
    controls.insertAdjacentHTML('beforeend',`<div class="crab-receipt"><span>7.2 ÷ 1.2 = <b>6상자</b></span><span>1,200 ÷ 400 = <b>3마리</b></span><hr><strong>6상자 · 꽃게 18마리</strong><span>꽃게 전체 무게 7.2kg</span></div><p class="merchant-tip"><b>상인</b> 알맞은 상자에 무게까지 정확하게 담았구나. 정말 고맙다!</p>`);
    confirm.textContent='상인과 인사하기 →';c.feedback('주문을 마쳤어요. 소래포구의 꽃게 조형물과 새우타워도 만나 보아요.','good');
   }
  }
  confirm.onclick=()=>{
   if(!alive||!c.checkRun())return;
   if(s.phase==='complete'){c.next();return;}
   if(s.phase==='design'){
    if(M.volume(s.dims)!==9000)return warn('상자 부피를 9,000cm³로 맞춰 주세요.');
    if(!M.design(s.dims))return warn('겉넓이는 2,800cm² 이하여야 해요. 부피를 유지하며 모양을 바꿔 보세요.');
    s.phase='boxes';
   }else if(s.phase==='boxes'){
    if(!M.exact(s.boxAnswer,6))return warn('전체 7.2kg을 한 상자에 담을 1.2kg으로 나누어 보세요.');
    s.boxes=6;s.phase='crabs';
   }else{
    if(s.crabs!==3)return warn(s.crabs*400<1200?'꽃게가 더 필요해요. 1.2kg은 1,200g이에요.':'1.2kg을 넘었어요. 꽃게를 꺼내 무게를 맞춰 보세요.');
    s.phase='complete';s.proof={version:2,dims:[...s.dims],area:M.area(s.dims),boxes:6,crabs:3};
   }
   save();c.tone();draw();
  };
  draw();
  return {pause(){},destroy(){alive=false;cancelAnimationFrame(artFrame);observer.disconnect();confirm.onclick=null;},help(){return s.phase==='design'?root.NamdongData.lessons.market:{title:'상인의 한마디 · 같은 무게씩 나누기',math:'상자 수 = 전체 무게 ÷ 한 상자에 담을 무게<br>1kg = 1,000g · 400g = 0.4kg',text:'7.2kg을 한 상자에 1.2kg씩 나누어 담아요. 다음에는 한 마리 400g인 꽃게로 한 상자의 무게를 맞춰요.',how:'상자 수를 입력한 뒤 꽃게를 담거나 꺼내 보세요. 저울에는 꽃게만의 무게가 표시돼요.',note:'꽃게의 무게와 주문은 학습용 설정이에요. 상자 부피로 무게를 계산하지 않아요.'};}};
 }
 root.NamdongMarket={mount,boxArt};
})(window);
