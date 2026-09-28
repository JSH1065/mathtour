(function(root){
 'use strict';
 // Arithmetic only: no eval, functions, variables, or access to page state.
 function calculate(text){
  const source=String(text).replace(/[×xX]/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s/g,'');
  if(!source||source.length>80||/[^\d.+*/()\-]/.test(source))throw Error('숫자와 + − × ÷를 입력해요.');
  const tokens=source.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+*/-]/g)||[];
  if(tokens.join('')!==source)throw Error('계산식을 다시 확인해요.');
  let at=0;
  function value(){
   if(tokens[at]==='+'){at++;return value();}if(tokens[at]==='-'){at++;return -value();}
   if(tokens[at]==='('){at++;const n=expression();if(tokens[at++]!==')')throw Error('괄호를 닫아 주세요.');return n;}
   const token=tokens[at++];if(!token||!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token))throw Error('계산식을 끝까지 입력해요.');return Number(token);
  }
  function term(){let n=value();while(tokens[at]==='*'||tokens[at]==='/'){const op=tokens[at++],b=value();if(op==='/'&&b===0)throw Error('0으로 나눌 수 없어요.');n=op==='*'?n*b:n/b;}return n;}
  function expression(){let n=term();while(tokens[at]==='+'||tokens[at]==='-'){const op=tokens[at++],b=term();n=op==='+'?n+b:n-b;}return n;}
  const answer=expression();if(at!==tokens.length)throw Error('계산식을 다시 확인해요.');if(!Number.isFinite(answer)||Math.abs(answer)>1e12)throw Error('계산할 수 있는 수의 범위를 넘었어요.');
  return Number(answer.toFixed(10));
 }
 function mount(host,session={expression:'',result:'',open:false}){
  const box=document.createElement('details');box.className='zoo-calculator';
  box.innerHTML='<summary>간단 계산기 <span>열기 / 닫기</span></summary><div class="zoo-calc-body"><label for="zooCalcInput">계산식</label><input id="zooCalcInput" type="text" inputmode="decimal" autocomplete="off" maxlength="80" placeholder="예: 12 ÷ 20 × 100"><output id="zooCalcResult" for="zooCalcInput" role="status" aria-live="polite"></output><div class="zoo-calc-keys"></div><small>계산 결과를 보고 직접 답을 적어요.</small></div>';
  const input=box.querySelector('input'),output=box.querySelector('output'),keys=box.querySelector('.zoo-calc-keys');
  input.value=session.expression||'';output.textContent=session.result||'';box.open=!!session.open;
  const update=()=>{session.expression=input.value;session.result='';output.textContent='';output.classList.remove('error');};
  function equals(){try{const n=calculate(input.value);session.result='= '+n.toLocaleString('en-US',{useGrouping:false,maximumFractionDigits:10});output.textContent=session.result;output.classList.remove('error');}catch(e){session.result=e.message;output.textContent=e.message;output.classList.add('error');}}
  for(const key of ['C','(',')','⌫','7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+']){
   const b=document.createElement('button');b.type='button';b.textContent=key;b.dataset.calcKey=key;
   if(key==='C')b.setAttribute('aria-label','계산식 모두 지우기');if(key==='⌫')b.setAttribute('aria-label','계산식 한 글자 지우기');if(key==='=')b.setAttribute('aria-label','계산하기');
   b.onclick=()=>{if(key==='='){equals();return;}if(key==='C')input.value='';else if(key==='⌫'){const end=input.selectionEnd??input.value.length,start=input.selectionStart??end;input.value=input.value.slice(0,start===end?Math.max(0,start-1):start)+input.value.slice(end);const cursor=start===end?Math.max(0,start-1):start;input.setSelectionRange(cursor,cursor);}else if(input.value.length<80){const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.setRangeText(key,start,end,'end');}update();};keys.append(b);
  }
  input.oninput=update;input.onkeydown=e=>{if(e.key==='Enter'||e.key==='='){e.preventDefault();e.stopPropagation();equals();}if(e.key==='Escape'){e.preventDefault();box.open=false;box.querySelector('summary').focus();}};
  box.addEventListener('toggle',()=>{session.open=box.open;});host.append(box);return box;
 }
 const api={calculate,mount};if(typeof module==='object')module.exports=api;root.NamdongCalculator=api;
})(typeof window==='undefined'?globalThis:window);
