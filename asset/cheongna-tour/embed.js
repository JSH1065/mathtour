(() => {
'use strict';
const config=window.CheongnaActivityConfig;if(!config)return;
const target=config.parentOrigin==='null'?'*':config.parentOrigin;
const send=(type,payload={})=>parent.postMessage({channel:'cheongna-tour',token:config.token,game:config.game,type,...payload},target);
let completed=null,continueButton=null;
const valid=record=>config.game==='baduk'?window.BadukPuzzle?.restore(record)?.state.length===1&&record.mode==='photo':window.FountainRhythm?.restore(record)?.phase==='done';
function refresh(){
 if(!continueButton)return;
 continueButton.hidden=!valid(completed);
}
const bridge=window.CheongnaEmbed={...config,
 save(snapshot){send('save',{snapshot});if(completed&&!valid(snapshot)){completed=null;refresh();}},
 complete(snapshot){if(!valid(snapshot))return;completed=snapshot;send('complete',{snapshot});refresh();},
 ready(){send('ready');},
 setSound(sound){send('sound',{sound});}
};
document.addEventListener('DOMContentLoaded',()=>{
 document.body.classList.add('chapter-activity');
 const nav=document.querySelector('.site-header nav'),back=document.createElement('button');back.textContent='설명·대화 다시 보기';back.onclick=()=>send('review');nav.prepend(back);
 continueButton=document.createElement('button');continueButton.id='chapterContinue';continueButton.className='primary';continueButton.hidden=true;continueButton.textContent=config.game==='baduk'?'빛나는 청라루로 돌아가기 →':'공연의 빛 담으러 가기 →';
 continueButton.onclick=()=>{if(valid(completed))send('continue',{snapshot:completed});};
 (document.getElementById(config.game==='baduk'?'ending':'finishCard')).append(continueButton);refresh();
});
window.addEventListener('message',e=>{
 if(e.source!==parent||e.origin!==config.parentOrigin||e.data?.channel!=='cheongna-parent'||e.data.token!==config.token)return;
 if(e.data.type==='pause')bridge.onPause?.();if(e.data.type==='resume')bridge.onResume?.();
});
})();
