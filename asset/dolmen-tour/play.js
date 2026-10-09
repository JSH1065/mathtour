(function(root){
 'use strict';
 const M=root.DolmenMath,A='asset/dolmen-tour/',$=id=>document.getElementById(id);
 const pictures={};for(const [k,f] of Object.entries({scene:'worksite.webp',atlas:'sprites.webp'})){const im=new Image();im.src=A+f;pictures[k]=im;}
 // Raster atlas silhouettes are clipped when rendered; all stone/wood/people artwork is generated illustration.
 const sprites={
  cap:{r:[12,137,572,200],p:[[0,.41],[.04,.23],[.2,.06],[.45,0],[.68,.1],[.9,.25],[1,.46],[.98,.7],[.83,.86],[.6,.96],[.27,.96],[.23,.85],[.05,.67]]},
  support:{r:[646,28,257,402],p:[[.03,.72],[.08,.3],[.22,.05],[.57,0],[.87,.04],[.93,.31],[.95,.52],[1,.8],[.91,.94],[.62,1],[.14,.95],[0,.85]]},
  beam:{r:[980,196,542,66],p:[[0,.37],[.01,.12],[.03,.01],[.98,0],[1,.33],[1,.82],[.98,1],[.03,.97],[.01,.85]]},
  fulcrum:{r:[1070,540,410,328],p:[[0,.92],[.31,.2],[.27,.15],[.27,.04],[.31,0],[.66,0],[.73,.06],[.73,.16],[.69,.21],[1,.95],[.89,1],[.72,.91],[.28,.91],[.11,.98]],hole:[[.39,.28],[.6,.26],[.8,.76],[.21,.76]]},
  worker:{r:[131,435,242,539],p:[[.36,.05],[.4,0],[.52,.01],[.54,.04],[.65,.06],[.69,.13],[.65,.19],[.82,.24],[.93,.34],[1,.39],[.95,.46],[.82,.49],[.87,.59],[.8,.78],[.71,.79],[.69,.91],[.9,.95],[.93,.98],[.7,1],[.53,.98],[.52,.91],[.51,.75],[.41,.75],[.36,.92],[.3,1],[.08,.98],[.09,.94],[.14,.77],[.14,.66],[.15,.58],[.04,.47],[0,.38],[.07,.3],[.23,.23],[.35,.19],[.31,.13]]},
  press:{r:[574,476,384,475],p:[[0,.96],[.02,.91],[.09,.87],[.15,.64],[.19,.53],[.2,.45],[.21,.35],[.29,.22],[.45,.12],[.48,.04],[.55,0],[.62,.04],[.65,.12],[.62,.21],[.7,.26],[.77,.35],[.87,.47],[.99,.48],[1,.51],[.86,.52],[.76,.49],[.77,.62],[.7,.77],[.68,.89],[.75,.9],[.77,.94],[.73,.97],[.57,.96],[.55,.89],[.53,.7],[.44,.61],[.3,.71],[.18,.91],[.17,.97],[.07,1]]}
 };
 function polygon(ctx,pts){pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
 function sprite(ctx,key,x,y,w,h,flip=false){const im=pictures.atlas;if(!im.complete||!im.naturalWidth)return;const s=sprites[key];ctx.save();ctx.translate(x+(flip?w:0),y);ctx.scale(flip?-w:w,h);ctx.beginPath();polygon(ctx,s.p);if(s.hole)polygon(ctx,s.hole);ctx.clip('evenodd');ctx.drawImage(im,...s.r,0,0,1,1);ctx.restore();}
 function cover(ctx,im,w,h){if(!im.complete||!im.naturalWidth)return;const z=Math.max(w/im.naturalWidth,h/im.naturalHeight);ctx.drawImage(im,(w-im.naturalWidth*z)/2,(h-im.naturalHeight*z)/2,im.naturalWidth*z,im.naturalHeight*z);}
 function label(ctx,text,x,y,size=23,color='#fff2cf',align='center'){ctx.font=`700 ${size}px "Malgun Gothic", sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,x,y);}
 function card(ctx,text,x,y,w=170){ctx.fillStyle='#153a42ed';ctx.beginPath();ctx.roundRect(x-w/2,y-20,w,40,8);ctx.fill();label(ctx,text,x,y,21);}
 function line(ctx,x1,y1,x2,y2,color='#ffe3a0',width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
 function arrow(ctx,x,y,dx,dy,color='#e6fbfc'){line(ctx,x,y,x+dx,y+dy,color,5);const a=Math.atan2(dy,dx);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+dx,y+dy);ctx.lineTo(x+dx-15*Math.cos(a-.5),y+dy-15*Math.sin(a-.5));ctx.lineTo(x+dx-15*Math.cos(a+.5),y+dy-15*Math.sin(a+.5));ctx.fill();}
 function glow(ctx,x,y,r){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff3aaad');g.addColorStop(.5,'#ffcf4b44');g.addColorStop(1,'#ffcf4b00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
 function createCanvas(host){const canvas=document.createElement('canvas');canvas.className='dolmen-canvas';canvas.setAttribute('role','img');host.append(canvas);const ctx=canvas.getContext('2d');let w=1,h=1;const resize=()=>{const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);};const ro=new ResizeObserver(resize);ro.observe(canvas);resize();return {canvas,ctx,size:()=>({w,h}),destroy:()=>ro.disconnect()};}
 function leverScene(ctx,w,h,s,lift=0,tilt=0,pressing=false){cover(ctx,pictures.scene,w,h);ctx.save();ctx.scale(w/1000,h/520);const arms=s.arms,crew=s.crew;const piv=[350,650],cy=330;
  for(const [i,x] of piv.entries()){sprite(ctx,'fulcrum',x-35,cy,70,93);const handle=x+(i?1:-1)*arms[i]*84;const a=(i?1:-1)*Math.asin(Math.min(lift/70,.55));ctx.save();ctx.translate(x,cy);ctx.rotate(a);const bx=i?-70:-arms[i]*84;sprite(ctx,'beam',bx,-12,arms[i]*84+70,24);ctx.restore();
   ctx.save();ctx.setLineDash([5,5]);for(const v of [handle,x])line(ctx,v,cy-132,v,cy-15,'#ffe08899',2);ctx.restore();line(ctx,Math.min(handle,x),cy-132,Math.max(handle,x),cy-132,'#ffe088',5);for(const v of [handle,x])line(ctx,v,cy-141,v,cy-123,'#ffe088',4);card(ctx,arms[i]+'m',(handle+x)/2,cy-157,76);card(ctx,'받침점',x,cy+112,108);
   card(ctx,(i?'오른쪽 ':'왼쪽 ')+crew[i]+'명',i?845:155,476,155);
   for(let j=0;j<crew[i];j++){const wx=handle+(j-(crew[i]-1)/2)*29-28; sprite(ctx,pressing?'press':'worker',wx,cy-92-j*3,pressing?100:68,185,!!i);}
   if(pressing&&crew[i])arrow(ctx,handle,cy-36,0,45);
  }
  // Both contact arms remain identical. Only the outer effort-arm length changes.
  sprite(ctx,'beam',412,345,176,25);sprite(ctx,'beam',416,369,165,24);sprite(ctx,'fulcrum',420,345,160,73);
  ctx.save();ctx.translate(500,330-lift);ctx.rotate(tilt);sprite(ctx,'cap',-165,-112,330,116);ctx.restore();
  card(ctx,'왼쪽은 최대 2m',155,90,208);card(ctx,'금색 선 = 받침점부터 누르는 자리까지',635,90,475);
  if(lift>10){glow(ctx,500,280,130);arrow(ctx,433,325-lift,0,-42);arrow(ctx,567,325-lift,0,-42);}
  ctx.restore();
 }
 function example(canvas,d,n){
  const w=canvas.clientWidth||230,h=canvas.clientHeight||116,ratio=Math.min(devicePixelRatio||1,2);canvas.width=w*ratio;canvas.height=h*ratio;
  const ctx=canvas.getContext('2d');ctx.scale(w/280*ratio,h/145*ratio);ctx.fillStyle='#eee2c7';ctx.fillRect(0,0,280,145);
  const pivot=226,handle=pivot-d*55;line(ctx,handle,40,pivot,40,'#96703c',3);for(const x of [handle,pivot])line(ctx,x,35,x,45,'#96703c',2);
  label(ctx,d+'m',(handle+pivot)/2,24,17,'#6e4929');sprite(ctx,'fulcrum',pivot-13,89,26,38);sprite(ctx,'beam',handle-6,82,pivot-handle+52,12);sprite(ctx,'cap',pivot+13,60,38,24);
  for(let j=0;j<n;j++)sprite(ctx,'worker',Math.max(3,handle-14-(n-1)*13)+j*24,47,27,76);
  arrow(ctx,handle,61,0,17,'#935340');label(ctx,'받침점',pivot,135,13,'#6e4929');
 }
 let memoryObserver=null;
 function memory(host,show,state){memoryObserver?.disconnect();memoryObserver=null;host.querySelector('.memory-art')?.remove();if(!show)return;const canvas=document.createElement('canvas');canvas.className='memory-art';canvas.setAttribute('aria-hidden','true');host.insertBefore(canvas,host.querySelector('.scene-tag'));const paint=()=>{const {width:w,height:h}=host.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;const ctx=canvas.getContext('2d');ctx.scale(d,d);const unit=Math.min(w/1000,h/600);ctx.translate(w/2,h*.43);ctx.scale(unit,unit);if(M.solved(state,'build')){glow(ctx,0,0,270);sprite(ctx,'support',-110,-50,55,142);sprite(ctx,'support',65,-50,55,142);sprite(ctx,'cap',-180,-155,360,123);}else{if(M.solved(state,'lever')){sprite(ctx,'beam',-100,66,200,27);sprite(ctx,'beam',-100,93,200,27);sprite(ctx,'cap',-185,-38,370,125);}else sprite(ctx,'cap',-185,0,370,125);sprite(ctx,'worker',-240,-45,73,158);sprite(ctx,'worker',170,-45,73,158,true);}};memoryObserver=new ResizeObserver(paint);memoryObserver.observe(host);pictures.atlas.addEventListener('load',paint,{once:true});paint();}
 function mount(o){const {id,state,persist,feedback,tone,next,checkRun}=o,board=$('board'),controls=$('controls'),confirm=$('confirm'),game=$('game');game.classList.add('dolmen-game');board.innerHTML='';controls.innerHTML='';confirm.hidden=false;let dead=false,raf=0,anim=null,last=0,busy=false,hint=false,drag=null,attempts=0;
  const view=createCanvas(board),{canvas,ctx}=view;canvas.setAttribute('aria-label',id==='lever'?'양쪽 지렛대와 덮개돌. 거리와 인원은 옆의 버튼으로 조절해요.':'좌표 설계도. 방향 버튼으로 돌의 표시점을 움직여요.');
  const accessible=document.createElement('div');accessible.className='sr-only';accessible.setAttribute('aria-live','polite');board.append(accessible);
  const status=document.createElement('div');status.className='dolmen-status';board.append(status);
  const small=document.createElement('div');small.className='dolmen-model-note';small.textContent=id==='lever'?'수첩 속 체험용 모형 · 거리와 인원은 게임 설정':'금색 표시점 기준 · 좌표는 수첩 속 체험용 설계도';board.append(small);
  const modalOpen=()=>!!document.querySelector('dialog[open]')||document.hidden;
  const helper=id==='lever'?DolmenHelp.create({state,paint:example}):null,helpButton=$('help'),oldHelpText=helpButton.textContent;helpButton.textContent=id==='lever'?'💡 설명·힌트 다시 보기':'설명 다시 보기';
  if(id==='lever'){game.classList.add('lever-game');$('gameTitle').innerHTML='거대한 덮개돌을 <strong>양쪽에서 같은 힘으로</strong> 들어 올려요';const objective=document.createElement('p');objective.className='lever-objective';objective.textContent='일꾼은 모두 5명! 양쪽 지렛대의 거리와 인원을 조절해요.';$('gameTitle').after(objective);}
  const animate=(kind,done)=>{busy=true;anim={kind,t:0,done};sync();};
  function ensure(){return !dead&&!busy&&!modalOpen()&&checkRun();}
  function sync(){if(id==='lever')syncLever();else syncBuild();}
  function resetVisual(){anim=null;busy=false;}
  function syncLever(){const s=state.lever,r=M.inspectLever(s.arms,s.crew),won=M.solved(state,'lever');status.innerHTML='<span>전체 5명 · <strong>'+r.remaining+'명 대기</strong></span><span>돌의 양쪽 끝을 같은 힘으로!</span>';accessible.textContent=`왼쪽 ${s.arms[0]}m ${s.crew[0]}명, 오른쪽 ${s.arms[1]}m ${s.crew[1]}명. 대기 ${r.remaining}명.`;
   controls.querySelectorAll('[data-arm]').forEach(b=>{const i=Number(b.dataset.side),d=Number(b.dataset.arm);b.setAttribute('aria-pressed',s.arms[i]===d);b.disabled=busy||won;});
   controls.querySelectorAll('[data-crew]').forEach(b=>{const i=Number(b.dataset.side),delta=Number(b.dataset.crew);b.disabled=busy||won||(delta>0?r.remaining===0:s.crew[i]===0);});
   [0,1].forEach(i=>{const product=s.arms[i]*s.crew[i],ready=$('leverReady'+i);$('crew'+i).textContent=s.crew[i]+'명';ready.dataset.level=product===6?'ready':product>6?'over':'low';ready.innerHTML='<b>'+(product===6?'✓ 준비 완료':product>6?'힘이 더 커요':'힘이 부족해요')+'</b><span>'+s.arms[i]+' × '+s.crew[i]+' = '+product+'</span>';$('leverMeter'+i).value=product;});
   $('leverReset').disabled=busy||won;$('leverHint').classList.toggle('needs-help',attempts>=2&&!won);confirm.disabled=busy;confirm.textContent=won?'설계도 확인하기 →':busy?'함께 힘을 모으는 중…':'③ 함께 들어 올리기';
  }
  function nextTip(){const s=state.lever,v=s.arms.map((d,i)=>d*s.crew[i]),r=M.inspectLever(s.arms,s.crew);
   if(s.arms[0]===1)return '왼쪽 1m에는 6명이 필요해요. 일꾼은 모두 5명! 먼저 왼쪽 누르는 거리를 늘려 볼까요?';
   if(v[0]>6)return '왼쪽에 힘이 더 많이 모였어요. 왼쪽은 2m × 3명으로 준비할 수 있어요. 남는 일꾼을 오른쪽으로 보내요.';
   if(v[0]<6)return r.remaining?'왼쪽은 아직 힘이 부족해요. 왼쪽 거리 × 인원이 6이 되도록 대기 중인 일꾼을 보내 보세요.':'일꾼 다섯 명을 모두 배치했지만 왼쪽 힘이 부족해요. 오른쪽 거리를 늘리면 더 적은 인원으로 들 수 있어요.';
   if(s.arms[1]<3)return '왼쪽은 준비 완료! 남은 두 명으로 오른쪽도 들려면 오른쪽 누르는 거리를 더 늘려 보세요.';
   return '왼쪽은 준비 완료! 오른쪽 3m에는 몇 명이 필요할까요? 3 × 인원 = 6을 생각해 보세요.';
  }
  function leverUI(){controls.innerHTML=`<div class="lever-rule"><small>성공 조건 · 양쪽 모두</small><strong>거리 × 인원 = 6</strong><span>돌 양끝을 들어 올리는 힘을 맞춰요.</span></div><div class="lever-sides">${[0,1].map(i=>`<section><h2>${i?'오른쪽':'왼쪽'} 지렛대 <small>최대 ${i?3:2}m</small></h2><div class="lever-adjust-line"><label>① 거리</label><div class="distance-buttons">${Array.from({length:i?3:2},(_,j)=>`<button data-side="${i}" data-arm="${j+1}" aria-label="${i?'오른쪽':'왼쪽'} 누르는 거리 ${j+1}미터">${j+1}m</button>`).join('')}</div></div><div class="lever-adjust-line"><label>② 일꾼</label><div class="crew-adjust"><button data-side="${i}" data-crew="-1" aria-label="${i?'오른쪽':'왼쪽'} 일꾼 빼기">−</button><output id="crew${i}">0명</output><button data-side="${i}" data-crew="1" aria-label="${i?'오른쪽':'왼쪽'} 일꾼 더하기">＋</button></div></div><div class="lever-readiness" id="leverReady${i}" role="status"></div><progress id="leverMeter${i}" max="6" value="0" aria-label="${i?'오른쪽':'왼쪽'} 거리와 인원의 곱, 목표 6"></progress></section>`).join('')}</div><div class="dolmen-tools"><button id="leverHint">💡 서연이의 단계 힌트</button><button id="leverReset">다시 배치</button></div>`;
   controls.querySelectorAll('[data-arm]').forEach(b=>b.onclick=()=>{if(!ensure())return;state.lever.arms[+b.dataset.side]=+b.dataset.arm;sync();persist();feedback('금색 선이 받침점부터 누르는 자리까지의 거리예요. 거리 × 인원이 양쪽 모두 6이 되게 해요.');});
   controls.querySelectorAll('[data-crew]').forEach(b=>b.onclick=()=>{if(!ensure())return;const i=+b.dataset.side,n=state.lever.crew[i]+Number(b.dataset.crew),r=M.inspectLever(state.lever.arms,state.lever.crew);if(n<0||n>5||(Number(b.dataset.crew)>0&&!r.remaining))return;state.lever.crew[i]=n;sync();persist();feedback(M.inspectLever(state.lever.arms,state.lever.crew).ok?'양쪽 모두 준비 완료! 함께 들어 올리기를 눌러 보세요.':`대기 중인 일꾼은 ${5-state.lever.crew[0]-state.lever.crew[1]}명이에요. 양쪽의 거리 × 인원을 확인해요.`);});
   $('leverReset').onclick=()=>{if(!ensure())return;state.lever.arms=[1,1];state.lever.crew=[0,0];sync();persist();feedback('① 거리 선택 → ② 일꾼 배치 → ③ 함께 들어 올리기. 설명은 언제든 다시 볼 수 있어요.');};
   $('leverHint').onclick=()=>helper.open('guide');
   confirm.onclick=()=>{if(!ensure())return;if(M.solved(state,'lever'))return next();const r=M.inspectLever(state.lever.arms,state.lever.crew);if(!r.ok)attempts++;feedback(r.ok?'양쪽에 같은 힘이 모였어요. 함께 천천히 들어 올려요!':nextTip(),r.ok?'good':'bad');tone(r.ok);animate(r.ok?'lift':'attempt',()=>{if(r.ok){state.lever.proof={arms:[...state.lever.arms],crew:[...state.lever.crew]};persist();feedback('성공! 왼쪽 2m × 3명 = 6, 오른쪽 3m × 2명 = 6. 돌을 같은 힘으로 들어 올렸어요!','good');}sync();});};
   feedback(M.solved(state,'lever')?'돌을 들어 올렸어요. 설계도를 확인하러 가요.':'① 거리 선택 → ② 일꾼 5명 나누기. 막히면 오른쪽 위 설명·힌트를 다시 열어 보세요.');sync();
  }
  function grid(){const {w,h}=view.size(),u=Math.min((w-40)/11,(h-66)/6.6),ox=w/2,oy=(h-6.6*u)/2+5*u+8;return {u,ox,oy};}
  function syncBuild(){const p=state.placement,i=p.placed.length,target=M.targets[Math.min(i,2)],won=M.solved(state,'build');status.innerHTML='<span>놓은 돌 <strong>'+i+' / 3</strong></span><span>금색 표시점이 기준이에요</span>';accessible.textContent=`${target.name}, 목표 (${target.x}, ${target.y}), 현재 (${p.x}, ${p.y}). ${i}개 놓음.`;
   $('stoneName').textContent=target.name;$('targetCoord').textContent=`(${target.x<0?'−'+Math.abs(target.x):target.x}, ${target.y})`;$('currentCoord').textContent=`(${p.x<0?'−'+Math.abs(p.x):p.x}, ${p.y<0?'−'+Math.abs(p.y):p.y})`;
   controls.querySelectorAll('[data-move]').forEach(b=>{const [dx,dy]=b.dataset.move.split(',').map(Number);b.disabled=won||busy||p.x+dx< -4||p.x+dx>4||p.y+dy< -1||p.y+dy>4;});$('stoneReset').disabled=busy||won;$('gridToggle').setAttribute('aria-pressed',hint);confirm.disabled=busy;confirm.textContent=won?'고인돌의 빛 만나기 →':busy?'돌을 놓는 중…':i===2?'덮개돌 내려놓기':'이 자리에 놓기';
  }
  function move(dx,dy){if(!ensure()||M.solved(state,'build'))return;const p=state.placement;p.x=Math.max(-4,Math.min(4,p.x+dx));p.y=Math.max(-1,Math.min(4,p.y+dy));sync();persist();}
  function buildUI(){controls.innerHTML=`<div class="blueprint"><small>수첩의 설계도</small><h2 id="stoneName"></h2><strong id="targetCoord" class="coordinate"></strong><p>돌의 <b>금색 표시점</b>을 맞춰요</p><div class="blueprint-list">${M.targets.map(t=>`<span>${t.name} <b>(${t.x<0?'−'+Math.abs(t.x):t.x}, ${t.y})</b></span>`).join('')}</div></div><div class="position-controls"><span>현재 좌표 <output id="currentCoord" class="coordinate"></output></span><div class="dolmen-dpad"><button data-move="0,1" aria-label="위로 한 칸">↑</button><button data-move="-1,0" aria-label="왼쪽으로 한 칸">←</button><button data-move="0,-1" aria-label="아래로 한 칸">↓</button><button data-move="1,0" aria-label="오른쪽으로 한 칸">→</button></div></div><div class="dolmen-tools"><button id="gridToggle" aria-pressed="false">좌표 읽기 힌트</button><button id="stoneReset">원점으로</button></div>`;
   controls.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>move(...b.dataset.move.split(',').map(Number)));
   $('stoneReset').onclick=()=>{if(!ensure())return;state.placement.x=state.placement.y=0;sync();persist();};
   $('gridToggle').onclick=()=>{if(!ensure())return;hint=!hint;const t=M.targets[Math.min(state.placement.placed.length,2)];feedback(hint?`원점에서 ${t.x===0?'가로로 움직이지 않고':t.x<0?'왼쪽으로 '+(-t.x)+'칸':'오른쪽으로 '+t.x+'칸'}, 위로 ${t.y}칸이에요. 첫 수는 가로, 둘째 수는 세로!`:'목표 좌표를 읽고 금색 표시점을 옮겨 보세요.');sync();};
   confirm.onclick=()=>{if(!ensure())return;if(M.solved(state,'build'))return next();const p=state.placement,i=p.placed.length,t=M.targets[i];if(!M.canPlace(i,p)){tone(false);feedback(p.x===t.x?'가로 위치는 맞았어요. 두 번째 수인 세로 위치를 다시 살펴봐요.':p.y===t.y?'세로 위치는 맞았어요. 첫 번째 수인 가로 위치를 다시 살펴봐요.':'설계도와 위치가 달라요. 첫 번째 수는 가로, 두 번째 수는 세로예요.','bad');return;}
    tone(true);feedback(t.name+'의 표시점이 설계도와 일치해요. 천천히 놓아요!','good');animate('place',()=>{p.placed.push({x:p.x,y:p.y});p.index=p.placed.length;p.x=p.y=0;hint=false;persist();sync();feedback(p.placed.length===3?'고인돌 완성! 같은 원점과 좌표로 세 돌을 정확하게 놓았어요.':'정확한 위치에 놓았어요. 다음은 '+M.targets[p.placed.length].name+'이에요.','good');});};
   feedback(M.solved(state,'build')?'설계도대로 완성한 고인돌에서 빛이 피어나요.':'왼쪽 받침돌부터 시작해요. (−3, 1)은 원점에서 왼쪽 세 칸, 위 한 칸이에요.');sync();
  }
  function dot(ctx,x,y,placed=false){ctx.fillStyle=placed?'#e5f5b1':'#ffcf70';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#674625';ctx.lineWidth=2;ctx.stroke();}
  function drawGrid(){const {w,h}=view.size(),{u,ox,oy}=grid(),p=state.placement;cover(ctx,pictures.scene,w,h);ctx.fillStyle='#173c40d9';ctx.beginPath();ctx.roundRect(ox-5.1*u,oy-4.8*u,10.2*u,6.1*u,12);ctx.fill();const X=x=>ox+x*u,Y=y=>oy-y*u;
   ctx.lineWidth=1;ctx.strokeStyle='#ebead22e';for(let x=-4;x<=4;x++)line(ctx,X(x),Y(-1),X(x),Y(4),'#ebead22e',1);for(let y=-1;y<=4;y++)line(ctx,X(-4),Y(y),X(4),Y(y),'#ebead22e',1);
   line(ctx,X(-4.7),Y(0),X(4.7),Y(0));line(ctx,X(0),Y(-1.15),X(0),Y(4.5));
   ctx.fillStyle='#ffe3a0';ctx.beginPath();ctx.moveTo(X(4.7),Y(0));ctx.lineTo(X(4.45),Y(.12));ctx.lineTo(X(4.45),Y(-.12));ctx.fill();ctx.beginPath();ctx.moveTo(X(0),Y(4.5));ctx.lineTo(X(-.12),Y(4.25));ctx.lineTo(X(.12),Y(4.25));ctx.fill();
   const fs=Math.max(13,Math.min(20,u*.36));for(let x=-4;x<=4;x++)if(x)label(ctx,x<0?'−'+(-x):''+x,X(x),Y(0)+17,fs);for(let y=-1;y<=4;y++)if(y)label(ctx,y<0?'−'+(-y):''+y,X(0)-16,Y(y),fs);
   ctx.font=`italic ${fs+5}px Cambria,serif`;ctx.fillStyle='#fff1cd';ctx.fillText('x',X(4.8),Y(0)+18);ctx.fillText('y',X(0)-15,Y(4.5));ctx.fillText('O',X(0)-14,Y(0)+18);
   function stone(i,x,y,placed){const cap=i===2,sw=(cap?7.6:1.12)*u,sh=(cap?2.1:2.6)*u;let lift=0;if(anim?.kind==='place'&&i===p.placed.length)lift=(1-Math.min(anim.t/700,1))*u*.28;
    sprite(ctx,cap?'cap':'support',X(x)-sw/2,Y(y)-(cap?sh/2:1.6*u)-lift,sw,sh);dot(ctx,X(x),Y(y)-lift,placed);
   }
   p.placed.forEach((q,i)=>stone(i,q.x,q.y,true));
   if(p.placed.length<3){line(ctx,X(p.x),Y(0),X(p.x),Y(p.y),'#ffdc84',2);line(ctx,X(0),Y(p.y),X(p.x),Y(p.y),'#ffdc84',2);if(hint){const t=M.targets[p.placed.length];ctx.setLineDash([6,5]);line(ctx,X(0),Y(0),X(t.x),Y(0),'#abebc4',3);line(ctx,X(t.x),Y(0),X(t.x),Y(t.y),'#abebc4',3);ctx.setLineDash([]);ctx.strokeStyle='#bcf1bb';ctx.beginPath();ctx.arc(X(t.x),Y(t.y),15,0,Math.PI*2);ctx.stroke();}stone(p.placed.length,p.x,p.y,false);}else glow(ctx,ox,Y(2),u*3.5);
  }
  if(id==='lever')leverUI();else buildUI();
  function tick(time){if(dead)return;const dt=Math.min(time-last||0,50);last=time;if(anim&&!modalOpen()){anim.t+=dt;const limit=anim.kind==='place'?800:anim.kind==='lift'?1700:1100;if(anim.t>=limit){const fn=anim.done;resetVisual();if(checkRun())fn();}}
   const {w,h}=view.size();ctx.clearRect(0,0,w,h);if(id==='lever'){const won=M.solved(state,'lever'),r=M.inspectLever(state.lever.arms,state.lever.crew);let lift=won?18:0,tilt=0;if(anim?.kind==='lift')lift=18*Math.min(anim.t/1300,1);if(anim?.kind==='attempt'){const bounce=Math.sin(Math.min(anim.t/1000,1)*Math.PI);if(r.enough[0]!==r.enough[1]){lift=7*bounce;tilt=(r.enough[0]?1:-1)*.045*bounce;}}leverScene(ctx,w,h,state.lever,lift,tilt,!!anim||won);}else drawGrid();raf=requestAnimationFrame(tick);
  }
  raf=requestAnimationFrame(tick);
  function key(e){if(id!=='build'||e.target.closest('input,textarea,select,[contenteditable="true"]')||modalOpen())return;const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};if(dirs[e.key]){e.preventDefault();move(...dirs[e.key]);}}
  const pos=e=>{const r=canvas.getBoundingClientRect(),g=grid();return {x:Math.max(-4,Math.min(4,Math.round((e.clientX-r.left-g.ox)/g.u))),y:Math.max(-1,Math.min(4,Math.round((g.oy-(e.clientY-r.top))/g.u)))};};
  function down(e){if(id!=='build'||!ensure()||M.solved(state,'build'))return;const q=pos(e),p=state.placement;if(Math.abs(q.x-p.x)>1||Math.abs(q.y-p.y)>1)return;drag=e.pointerId;canvas.setPointerCapture(e.pointerId);e.preventDefault();}
  function dragMove(e){if(drag!==e.pointerId||!ensure())return;const q=pos(e);state.placement.x=q.x;state.placement.y=q.y;sync();}
  function up(e){if(drag!==e.pointerId)return;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);persist();}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',dragMove);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);window.addEventListener('keydown',key);
  return {help:helper?()=>helper.open('concept'):null,pause(){drag=null;},destroy(){helper?.destroy();helpButton.textContent=oldHelpText;game.classList.remove('lever-game');game.querySelector('.lever-objective')?.remove();dead=true;cancelAnimationFrame(raf);view.destroy();window.removeEventListener('keydown',key);game.classList.remove('dolmen-game');confirm.onclick=null;}};
 }
 let lessonObserver=null;
 function lesson(host,id){lessonObserver?.disconnect();lessonObserver=null;host.querySelector('.lesson-art')?.remove();if(!['lever','build'].includes(id))return;const canvas=document.createElement('canvas');canvas.className='lesson-art';canvas.setAttribute('aria-hidden','true');host.insertBefore(canvas,host.querySelector('span'));const paint=()=>{const {width:w,height:h}=host.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;const ctx=canvas.getContext('2d');ctx.scale(d,d);if(id==='lever'){leverScene(ctx,w,h-48,{arms:[2,3],crew:[3,2]},0,0,false);}else{cover(ctx,pictures.scene,w,h);ctx.fillStyle='#163b3bcc';ctx.fillRect(0,0,w,h);const u=Math.min(w/10,(h-80)/5),ox=w/2,oy=h-80;for(let x=-4;x<=4;x++)line(ctx,ox+x*u,oy,ox+x*u,oy-4*u,'#ddd9b244',1);for(let y=0;y<=4;y++)line(ctx,ox-4*u,oy-y*u,ox+4*u,oy-y*u,'#ddd9b244',1);sprite(ctx,'support',ox-3.56*u,oy-2.6*u,1.12*u,2.6*u);sprite(ctx,'support',ox+2.44*u,oy-2.6*u,1.12*u,2.6*u);sprite(ctx,'cap',ox-3.8*u,oy-4.05*u,7.6*u,2.1*u);for(const t of M.targets){ctx.fillStyle='#ffd271';ctx.beginPath();ctx.arc(ox+t.x*u,oy-t.y*u,6,0,Math.PI*2);ctx.fill();card(ctx,`(${t.x<0?'−'+(-t.x):t.x}, ${t.y})`,ox+t.x*u,oy-t.y*u+27,88);}}};lessonObserver=new ResizeObserver(paint);lessonObserver.observe(host);pictures.atlas.addEventListener('load',paint,{once:true});paint();}
 root.DolmenPlay={mount,memory,lesson};
})(window);


