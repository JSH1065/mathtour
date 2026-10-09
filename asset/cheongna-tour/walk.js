(() => {
'use strict';
const M=CheongnaLakeModel,$=id=>document.getElementById(id),keys=new Set(),axis={x:0,y:0};
let player={...M.start},follower={x:M.start.x-34,y:M.start.y+7},active=false,paused=()=>false,onSave=()=>{},onStep=()=>{},previous=0,sinceSave=0,stride=0,stickId=null;
const canvas=$('walkTrail'),ctx=canvas.getContext('2d');
let points=[];for(let i=1;i<M.path.length;i++){const a=M.path[i-1],b=M.path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<len;d+=32)points.push([a[0]+(b[0]-a[0])*d/len,a[1]+(b[1]-a[1])*d/len]);}
function stopInput(){keys.clear();axis.x=axis.y=0;stickId=null;$('stick').style.transform='';}
function paint(now,moving){
 const box=$('walkViewport').getBoundingClientRect();if(!box.width||!box.height)return;
 const scale=Math.max(box.width/1536,box.height/1024,.64)*1.3,w=1536*scale,h=1024*scale;
 const tx=Math.min(0,Math.max(box.width-w,box.width*.44-player.x*scale)),ty=Math.min(0,Math.max(box.height-h,box.height*.67-player.y*scale));
 $('walkWorld').style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;
 for(const [id,p] of [['walkMinwoo',player],['walkSeoyeon',follower]]){const el=$(id);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.zIndex=Math.round(p.y);el.classList.toggle('moving',moving);}
 ctx.clearRect(0,0,1536,1024);ctx.fillStyle='#ffec9d';ctx.shadowColor='#ffd175';ctx.shadowBlur=9;
 for(const [i,p] of points.entries()){ctx.globalAlpha=.35+.3*Math.sin(now*.003-i*.4);ctx.beginPath();ctx.ellipse(p[0],p[1],3.8,2.2,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.shadowBlur=0;
 const distance=Math.hypot(player.x-M.destination.x,player.y-M.destination.y),near=distance<48;
 $('arriveFountain').disabled=!near;$('arriveFountain').textContent=near?'음악분수 살펴보기 →':'음악분수 앞으로 이동하세요';
 $('walkTip').textContent=near?'음악분수에 도착했어요. 앞의 풍경을 살펴볼까요?':player.x<580?'청라루의 빛을 뒤로하고, 호숫가 길을 따라 오른쪽으로.':player.x<1080?'물가의 갈대와 호수에 비친 불빛을 보며 걸어요.':'음악분수 앞 둥근 광장으로 올라가 보세요.';
 $('walkProgress').textContent=near?'도착! 아래 버튼 또는 Enter로 풍경 살펴보기':'방향키 · WASD · 왼쪽 조이스틱으로 이동';
}
function tick(now){const dt=Math.min(.04,(now-previous)/1000||0);previous=now;
 if(active){let moved=false;if(!paused()){
  let x=axis.x+(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0),y=axis.y+(keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}
  const dx=x*92*dt,dy=y*92*dt,before={...player};
  if(M.onPath({x:player.x+dx,y:player.y+dy})){player.x+=dx;player.y+=dy;}else{if(M.onPath({x:player.x+dx,y:player.y}))player.x+=dx;if(M.onPath({x:player.x,y:player.y+dy}))player.y+=dy;}
  moved=Math.hypot(player.x-before.x,player.y-before.y)>.02;
  if(moved){stride+=dt;if(stride>.38){stride=0;onStep();}const vx=player.x-follower.x,vy=player.y-follower.y,dist=Math.hypot(vx,vy);if(dist>34){const f={x:follower.x+vx/dist*Math.min(dist-34,92*dt),y:follower.y+vy/dist*Math.min(dist-34,92*dt)};if(M.onPath(f))follower=f;}
   sinceSave+=dt;if(sinceSave>.7){onSave({...player});sinceSave=0;}}
 }paint(now,moved);}
 requestAnimationFrame(tick);
}
document.addEventListener('keydown',e=>{if(!active||paused()||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('button,a,input,dialog'))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(key)){e.preventDefault();keys.add(key);}else if((e.key==='Enter'||e.code==='Space')&&!e.repeat){e.preventDefault();if(!$('arriveFountain').disabled)$('arriveFountain').click();}});
document.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',stopInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopInput();});
function stickMove(e){const r=$('joystick').getBoundingClientRect(),dx=e.clientX-r.x-r.width/2,dy=e.clientY-r.y-r.height/2,d=Math.hypot(dx,dy),max=r.width*.32,m=Math.min(max,d);axis.x=d>5?dx/d*m/max:0;axis.y=d>5?dy/d*m/max:0;$('stick').style.transform=`translate(${axis.x*max}px,${axis.y*max}px)`;}
$('joystick').onpointerdown=e=>{if(!active||paused()||e.button!==0)return;e.preventDefault();stickId=e.pointerId;$('joystick').setPointerCapture(e.pointerId);stickMove(e);};
$('joystick').onpointermove=e=>{if(e.pointerId===stickId)stickMove(e);};
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(event,e=>{if(e.pointerId===stickId)stopInput();});
window.CheongnaWalk={start(p,options){player=M.onPath(p)?{...p}:{...M.start};follower={x:player.x-30,y:player.y};if(!M.onPath(follower))follower={...player};paused=options.paused;onSave=options.onSave;onStep=options.onStep;active=true;stopInput();paint(performance.now(),false);},stop(){if(active)onSave({...player});active=false;stopInput();},pause:stopInput,inspect:()=>({active,player:{...player},follower:{...follower},onPath:M.onPath(player),near:Math.hypot(player.x-M.destination.x,player.y-M.destination.y)<48})};
requestAnimationFrame(tick);
})();
