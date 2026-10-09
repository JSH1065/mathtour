(function(root){
'use strict';
const T=root.THREE;
function create(host,onPick){
  if(!T)throw Error('3D 파일을 불러오지 못했어요. asset 폴더가 함께 있는지 확인해 주세요.');
  const renderer=new T.WebGLRenderer({alpha:false,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));renderer.setClearColor('#243a49',1);
  renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','바둑돌을 누른 뒤 빛나는 빈자리를 누르세요. 위에서 보기 버튼으로 시점을 바꿀 수 있어요.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,650);
  scene.fog=new T.Fog('#344b5d',85,210);
  const hemi=new T.HemisphereLight('#accde6','#565c52',.78);scene.add(hemi);
  const sun=new T.DirectionalLight('#e7d4b3',.68);sun.position.set(-14,28,12);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-35,right:28,top:30,bottom:-30});sun.shadow.bias=-.0004;scene.add(sun);
  const warm=new T.PointLight('#ffbb42',0,35,1.6);warm.position.set(0,4,3);scene.add(warm);
  let randomSeed=537;const rand=()=>((randomSeed=(randomSeed*1664525+1013904223)>>>0)/4294967296);
  const standard=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.86,...extra});m.color.convertSRGBToLinear();return m;};
  const unit=1.72,origin={x:1,y:2};
  const point=(p,y=.11)=>new T.Vector3((p.x-origin.x)*unit,y,(p.y-origin.y)*unit);
  const slabGeo=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,40,24);
  function box(w,h,d,x,y,z,mat,parent=scene){const o=new T.Mesh(slabGeo,mat);o.scale.set(w,h,d);o.position.set(x,y,z);parent.add(o);return o;}
  function texture(){
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),img=ctx.createImageData(256,256);
    for(let i=0;i<img.data.length;i+=4){const n=Math.floor(rand()*37);img.data[i]=180+n;img.data[i+1]=171+n;img.data[i+2]=148+n;img.data[i+3]=255;}ctx.putImageData(img,0,0);
    for(let i=0;i<1000;i++){ctx.fillStyle=i%3?'#81796635':'#f5e8c355';ctx.fillRect(rand()*256,rand()*256,rand()*2+1,rand()*2+1);}
    const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return tex;
  }
  const landscape=root.CheongnaLandscape.create(T,scene,renderer,standard);
  const stoneTexture=texture(),tileMat=standard('#dacdae',{map:stoneTexture,bumpMap:stoneTexture,bumpScale:.022,roughness:.95});
  box(17.6,.30,17.6,0,-.12,0,standard('#666f6b'));
  const tiles=[];
  for(let x=-4;x<=5;x++)for(let y=-3;y<=6;y++)tiles.push({x:(x-origin.x+.5)*unit,z:(y-origin.y+.5)*unit});
  const tileMesh=new T.InstancedMesh(slabGeo,tileMat,tiles.length),dummy=new T.Object3D();
  tiles.forEach((p,i)=>{dummy.position.set(p.x,-.01,p.z);dummy.scale.set(unit-.09,.14,unit-.09);dummy.rotation.set(0,0,0);dummy.updateMatrix();tileMesh.setMatrixAt(i,dummy.matrix);tileMesh.setColorAt(i,new T.Color().setHSL(.105,.13,.82+rand()*.12));});tileMesh.receiveShadow=true;scene.add(tileMesh);
  // Pebbles in the dark paving channels; instanced for tablets.
  const pebbleGeo=new T.IcosahedronGeometry(.026,0),pebbles=new T.InstancedMesh(pebbleGeo,standard('#777b77'),2300);
  for(let i=0;i<2300;i++){
    const cross=i%2,x=-4+Math.floor(rand()*10),y=-3+Math.floor(rand()*10),t=rand();
    dummy.position.set((x-origin.x+(cross?t:0))*unit+(rand()-.5)*.06,.075,(y-origin.y+(cross?0:t))*unit+(rand()-.5)*.06);dummy.rotation.set(rand(),rand(),rand());dummy.scale.set(.5+rand(),.5+rand(),.5+rand());dummy.updateMatrix();pebbles.setMatrixAt(i,dummy.matrix);
  }scene.add(pebbles);
  // A finite raised board, beside (not underneath or behind) the pavilion terrace.
  const curb=standard('#b9b9aa'),posts=standard('#84704c'),rope=standard('#96988b');
  for(const x of [-8.75,8.75])box(.18,.16,17.7,x,.07,0,curb);
  for(const z of [-8.75,8.75])box(17.7,.16,.18,0,.07,z,curb);
  const postGeo=new T.CylinderGeometry(.035,.047,.58,10);
  function bollard(x,z){const p=new T.Mesh(postGeo,posts);p.position.set(x,.1,z);scene.add(p);const cap=new T.Mesh(new T.SphereGeometry(.065,10,8),posts);cap.position.set(x,.4,z);scene.add(cap);}
  for(const x of [-8.95,8.95])for(let z=-8.8;z<=8.9;z+=4.4)bollard(x,z);
  for(const z of [-8.95,8.95])for(const x of [-4.4,4.4])bollard(x,z);
  for(const x of [-8.95,8.95])box(.022,.025,17.6,x,.29,0,rope);
  box(17.6,.025,.022,0,.29,-8.95,rope);
  for(const x of [-5.2,5.2])box(7.2,.025,.022,x,.29,8.95,rope);
  const pavilion=root.Cheongnaru.create(T,standard);scene.add(pavilion.group);
  const wood=standard('#554335'),woodTop=standard('#99805f');
  function seat(x,z){box(1.3,.12,.74,x,.55,z,woodTop);for(const dx of [-.53,.53])for(const dz of [-.28,.28])box(.10,.54,.10,x+dx,.26,z+dz,wood);box(.9,.1,.4,x,.27,z+.79,woodTop);}
  seat(-5.8,-7.1);seat(5.8,-7.1);
  // Every floor segment has a separate wave arrival time, but only two draw calls.
  const segments=[];
  for(let x=-4;x<=6;x++)for(let y=-3;y<=7;y++){
    const a=point({x,y});if(x<6)segments.push({x:a.x+unit/2,z:a.z,turn:0});if(y<7)segments.push({x:a.x,z:a.z+unit/2,turn:Math.PI/2});
  }
  const lightGeo=new T.BoxGeometry(unit,.012,.027),glowGeo=new T.PlaneGeometry(unit,.19);
  glowGeo.rotateX(-Math.PI/2);
  const glowCanvas=document.createElement('canvas');glowCanvas.width=8;glowCanvas.height=64;const glowContext=glowCanvas.getContext('2d'),soft=glowContext.createLinearGradient(0,0,0,64);soft.addColorStop(0,'#fff0');soft.addColorStop(.5,'#fff');soft.addColorStop(1,'#fff0');glowContext.fillStyle=soft;glowContext.fillRect(0,0,8,64);
  const lightMat=new T.MeshBasicMaterial({color:'#ffe6a4',transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}),glowMat=new T.MeshBasicMaterial({color:'#ffd06a',map:new T.CanvasTexture(glowCanvas),transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
  const strips=new T.InstancedMesh(lightGeo,lightMat,segments.length),glows=new T.InstancedMesh(glowGeo,glowMat,segments.length);
  segments.forEach((p,i)=>{dummy.position.set(p.x,.083,p.z);dummy.rotation.set(0,p.turn,0);dummy.scale.set(1,1,1);dummy.updateMatrix();strips.setMatrixAt(i,dummy.matrix);glows.setMatrixAt(i,dummy.matrix);strips.setColorAt(i,new T.Color(0,0,0));glows.setColorAt(i,new T.Color(0,0,0));});scene.add(strips,glows);
  // Quiet markers show playable intersections without lighting the whole plaza.
  const dots=[],bounds=root.BadukPuzzle.bounds,dotMat=new T.MeshBasicMaterial({color:'#81918a',transparent:true,opacity:.45});
  for(let x=bounds.minX;x<=bounds.maxX;x++)for(let y=bounds.minY;y<=bounds.maxY;y++){
    const dot=new T.Mesh(new T.CircleGeometry(.034,12),dotMat);dot.rotation.x=-Math.PI/2;dot.position.copy(point({x,y},.09));scene.add(dot);dots.push(dot);
  }
  const boundaryMat=new T.LineBasicMaterial({color:'#83a39d',transparent:true,opacity:.21});
  const corners=[{x:bounds.minX,y:bounds.minY},{x:bounds.maxX,y:bounds.minY},{x:bounds.maxX,y:bounds.maxY},{x:bounds.minX,y:bounds.maxY},{x:bounds.minX,y:bounds.minY}].map(p=>point(p,.088));scene.add(new T.Line(new T.BufferGeometry().setFromPoints(corners),boundaryMat));
  const blackMat=standard('#2a313a',{roughness:.40,metalness:.08,bumpMap:stoneTexture,bumpScale:.008});
  const whiteMat=standard('#e7e6dd',{roughness:.6,metalness:.01,bumpMap:stoneTexture,bumpScale:.008});
  const stoneGroup=new T.Group(),markerGroup=new T.Group();scene.add(stoneGroup,markerGroup);
  const ringGeo=new T.TorusGeometry(.7,.024,8,72);ringGeo.rotateX(Math.PI/2);
  const selectionMat=new T.MeshBasicMaterial({color:'#ffe09a'}),targetMat=new T.MeshBasicMaterial({color:'#9bf3dd'}),haloMat=new T.MeshBasicMaterial({color:'#eabe5a',transparent:true,opacity:.09,depthWrite:false,blending:T.AdditiveBlending});
  let stones=[],state=[],selected=null,targets=[],hintMove=null,busy=false,anim=null,winStart=null,finishPoint=new T.Vector3(),completed=false,view='play',distance=24;
  let markers=[],winCameraSet=false;
  const boardCenter=new T.Vector3(0,0,1.6),cameraGoal=new T.Vector3(),targetGoal=boardCenter.clone(),look=boardCenter.clone();
  function removeMarkers(){for(const child of [...markerGroup.children]){markerGroup.remove(child);if(child.userData.disposable)child.geometry.dispose();}markers=[];}
  function ring(p,mat,r=.7){const o=new T.Mesh(ringGeo,mat);o.position.copy(point(p,.14));o.scale.set(r/.7,1,r/.7);markerGroup.add(o);markers.push(o);return o;}
  function drawMarkers(){
    removeMarkers();
    const chosen=state.find(p=>p.id===selected);
    if(chosen){ring(chosen,selectionMat,.75);for(const m of targets){const o=ring(m.to,targetMat,.45);o.userData.target=m.to;}}
    if(hintMove){
      const p=state.find(p=>p.id===hintMove.id);if(!p)return;
      if(!chosen)ring(p,selectionMat,.79);
      if(hintMove.reveal){
        const a=point(p,.4),b=point(hintMove.to,.4),mid=a.clone().lerp(b,.5);mid.y=1.55;
        const curve=new T.QuadraticBezierCurve3(a,mid,b),line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(42)),selectionMat);line.userData.disposable=true;markerGroup.add(line);ring(hintMove.to,selectionMat,.50);
        const cone=new T.Mesh(new T.ConeGeometry(.1,.3,12),selectionMat);cone.position.copy(b);cone.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(mid).normalize());cone.userData.disposable=true;markerGroup.add(cone);
      }
    }
  }
  function sync(next){
    state=next.map(p=>({...p}));for(const o of [...stoneGroup.children])stoneGroup.remove(o);stones=[];
    for(const p of state){const mesh=new T.Mesh(sphere,p.color==='black'?blackMat:whiteMat);mesh.scale.set(.69,.25,.64);mesh.position.copy(point(p,.33));mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.id=p.id;stoneGroup.add(mesh);stones.push(mesh);}
    selected=null;targets=[];hintMove=null;drawMarkers();scene.updateMatrixWorld(true);setCamera();
  }
  const particleGeo=new T.BufferGeometry(),particlePositions=new Float32Array(80*3),particleColors=new Float32Array(80*3);
  particleGeo.setAttribute('position',new T.BufferAttribute(particlePositions,3));particleGeo.setAttribute('color',new T.BufferAttribute(particleColors,3));
  const pc=document.createElement('canvas');pc.width=pc.height=32;const px=pc.getContext('2d'),grad=px.createRadialGradient(16,16,0,16,16,16);grad.addColorStop(0,'#fff');grad.addColorStop(.15,'#fff6c9');grad.addColorStop(1,'#fff0');px.fillStyle=grad;px.fillRect(0,0,32,32);
  const sparkMat=new T.PointsMaterial({size:.17,map:new T.CanvasTexture(pc),transparent:true,vertexColors:true,depthWrite:false,blending:T.AdditiveBlending});
  const sparks=new T.Points(particleGeo,sparkMat);sparks.frustumCulled=false;sparks.visible=false;scene.add(sparks);
  function jump(move){
    if(busy)return Promise.resolve();busy=true;removeMarkers();selected=null;targets=[];hintMove=null;
    const moving=stones.find(p=>p.userData.id===move.id),over=stones.find(p=>p.userData.id===move.over),from=point(move.from,.33),to=point(move.to,.33);
    const duration=750+Math.min(450,from.distanceTo(to)*35);
    return new Promise(resolve=>{anim={moving,over,from,to,duration,start:performance.now(),resolve,overStart:over.position.clone(),scale:over.scale.clone()};});
  }
  function setCamera(){
    const aspect=host.clientWidth/Math.max(1,host.clientHeight);
    const scenic=view==='overview'||view==='night';
    const direction=new T.Vector3(0,view==='top'?1:scenic?.84:.66,view==='top'?.1:scenic?-1:1).normalize();
    targetGoal.copy(boardCenter);
    const fit=new T.PerspectiveCamera(camera.fov,aspect,.1,650),corners=[];
    if(view==='top'){
      const ps=[...state,...root.BadukPuzzle.moves(state).map(m=>m.to)].map(p=>point(p));
      const extent=new T.Box3().setFromPoints(ps.length?ps:[point({x:1,y:2})]);extent.expandByScalar(1.5);extent.getCenter(targetGoal);targetGoal.y=0;
      for(const x of [extent.min.x,extent.max.x])for(const z of [extent.min.z,extent.max.z])corners.push(new T.Vector3(x,.2,z));
      distance=18;
    }else if(view==='overview'||view==='night'){
      targetGoal.set(-7.8,0,-.4);distance=45;
      for(const x of [-27.5,12.5])for(const z of [-15,14])corners.push(new T.Vector3(x,.4,z));
      corners.push(new T.Vector3(-22,8.5,-3),new T.Vector3(-10,8.5,-3));
    }else{
      const narrow=aspect<1.1;
      targetGoal.set(narrow?0:-5.0,narrow?.7:1.3,narrow?1.1:0);distance=narrow?19:31;
      if(!narrow)for(const x of [-22.3,-9.7])corners.push(new T.Vector3(x,8.5,-3));
      const ps=[...state,...root.BadukPuzzle.moves(state).map(m=>m.to)].map(p=>point(p));
      const extent=new T.Box3().setFromPoints(ps.length?ps:[point({x:1,y:2})]);extent.expandByScalar(.9);
      for(const x of [extent.min.x,extent.max.x])for(const z of [extent.min.z,extent.max.z])corners.push(new T.Vector3(x,.2,z));
    }
    for(let i=0;i<60;i++){
      fit.position.copy(direction).multiplyScalar(distance).add(targetGoal);fit.lookAt(targetGoal);fit.updateMatrixWorld();
      if(corners.every(p=>{const q=p.clone().project(fit);return Math.abs(q.x)<.92&&q.y<.77&&q.y>-.76;}))break;
      distance*=1.035;
    }
    cameraGoal.copy(direction.multiplyScalar(distance).add(targetGoal));
  }
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();setCamera();}
  new ResizeObserver(resize).observe(host);resize();camera.position.copy(cameraGoal);camera.lookAt(look);
  const ray=new T.Raycaster(),ground=new T.Plane(new T.Vector3(0,1,0),-.1);
  function pick(clientX,clientY){
    if(busy||completed)return;
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const rect=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new T.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),camera);
    const hit=ray.intersectObjects(stones,false)[0];if(hit){onPick({type:'stone',id:hit.object.userData.id});return;}
    const p=new T.Vector3();if(!ray.ray.intersectPlane(ground,p))return;
    const cx=p.x/unit+origin.x,cy=p.z/unit+origin.y;
    const nearby=state.map(s=>({s,d:Math.hypot(cx-s.x,cy-s.y)})).sort((a,b)=>a.d-b.d)[0];
    if(nearby&&nearby.d<.5){onPick({type:'stone',id:nearby.s.id});return;}
    onPick({type:'cell',x:Math.round(cx),y:Math.round(cy)});
  }
  let press=null;
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0||document.querySelector('dialog[open]'))return;press={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};renderer.domElement.setPointerCapture(e.pointerId);});
  renderer.domElement.addEventListener('pointermove',e=>{if(!press||press.id!==e.pointerId)return;if(Math.hypot(e.clientX-press.x,e.clientY-press.y)>9)press.moved=true;});
  renderer.domElement.addEventListener('pointerup',e=>{if(!press||press.id!==e.pointerId)return;const tap=!press.moved;press=null;if(tap)pick(e.clientX,e.clientY);});
  renderer.domElement.addEventListener('pointercancel',()=>{press=null;});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();root.dispatchEvent(new Event('baduk-context-lost'));});
  let previous=performance.now();
  function updateLights(now){
    if(winStart===null)return;
    const elapsed=(now-winStart)/1000;
    for(let i=0;i<segments.length;i++){
      const p=segments[i],dist=Math.hypot(p.x-finishPoint.x,p.z-finishPoint.z),power=T.MathUtils.smoothstep(elapsed-.12*dist,.15,.95);
      strips.setColorAt(i,new T.Color(1,.77,.35).multiplyScalar(power*1.8));glows.setColorAt(i,new T.Color(1,.69,.24).multiplyScalar(power));
    }
    strips.instanceColor.needsUpdate=true;glows.instanceColor.needsUpdate=true;
    const all=T.MathUtils.smoothstep(elapsed,0,4.7);warm.intensity=all*1.15;hemi.intensity=.78-all*.40;sun.intensity=.68-all*.38;
    pavilion.setLight(all);landscape.setLight(all);
    if(elapsed>1.0&&!winCameraSet){winCameraSet=true;if(view!=='top'){view='night';setCamera();}}
  }
  function frame(now){
    requestAnimationFrame(frame);if(document.hidden){previous=now;return;}
    const dt=Math.min((now-previous)/1000,.05);previous=now;
    camera.position.lerp(cameraGoal,1-Math.exp(-dt*4));look.lerp(targetGoal,1-Math.exp(-dt*4));
    if(camera.position.distanceTo(cameraGoal)<.025&&look.distanceTo(targetGoal)<.025){camera.position.copy(cameraGoal);look.copy(targetGoal);}
    camera.position.x=look.x;camera.lookAt(look);
    for(const m of markers)if(m.userData.target)m.scale.setScalar(.94+Math.sin(now*.004)*.06);
    if(anim){
      const a=anim,t=Math.min(1,(now-a.start)/a.duration),e=t*t*(3-2*t);
      a.moving.position.copy(a.from).lerp(a.to,e);a.moving.position.y+=Math.sin(Math.PI*t)*Math.min(2.2,1+a.from.distanceTo(a.to)*.08);
      const vanish=T.MathUtils.smoothstep(t,.28,.83);a.over.scale.copy(a.scale).multiplyScalar(1-vanish);sparks.visible=true;
      for(let i=0;i<80;i++){
        const f=(i%13)/13,u=T.MathUtils.clamp((t-.25-f*.12)/.65,0,1),spin=i*2.399+t*2;
        const p=a.overStart.clone().lerp(a.moving.position,u);p.x+=Math.cos(spin)*.5*Math.sin(Math.PI*u);p.z+=Math.sin(spin)*.5*Math.sin(Math.PI*u);p.y+=.15+Math.sin(Math.PI*u)*(.3+f);
        particlePositions.set([p.x,p.y,p.z],i*3);const light=t>.3&&t<.99?Math.sin(Math.PI*u):0;particleColors.set([light,light*.8,light*.4],i*3);
      }particleGeo.attributes.position.needsUpdate=particleGeo.attributes.color.needsUpdate=true;
      if(t>=1){a.moving.position.copy(a.to);sparks.visible=false;busy=false;anim=null;a.resolve();}
    }
    updateLights(now);
    if(completed&&winStart!==null&&!anim){
      sparks.visible=true;const t=(now-winStart)/1000;
      for(let i=0;i<80;i++){const q=(t*.17+i/80)%1,a=i*2.399;particlePositions.set([finishPoint.x+Math.cos(a)*q*1.5,finishPoint.y+.4+q*3.2,finishPoint.z+Math.sin(a)*q*1.5],i*3);const l=(1-q)*.66;particleColors.set([l,l*.82,l*.43],i*3);}particleGeo.attributes.position.needsUpdate=particleGeo.attributes.color.needsUpdate=true;
    }
    landscape.update(now,camera);renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
  function resetLight(){winStart=null;winCameraSet=false;completed=false;sparks.visible=false;warm.intensity=0;hemi.intensity=.78;sun.intensity=.68;pavilion.setLight(0);landscape.setLight(0);for(let i=0;i<segments.length;i++){strips.setColorAt(i,new T.Color(0,0,0));glows.setColorAt(i,new T.Color(0,0,0));}strips.instanceColor.needsUpdate=glows.instanceColor.needsUpdate=true;view='play';setCamera();}
  function illuminate(p,instant=false){winCameraSet=false;completed=true;finishPoint.copy(point(p,.25));warm.position.set(finishPoint.x,3,finishPoint.z);winStart=performance.now()-(instant?7000:0);selected=null;targets=[];hintMove=null;drawMarkers();}
  function project(p){camera.updateMatrixWorld(true);const v=point(p,.34).project(camera),r=renderer.domElement.getBoundingClientRect();return {x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};}
  return {
    sync,jump,resetLight,illuminate,project,
    select(id,available){selected=id;targets=available;hintMove=null;drawMarkers();},
    hint(move,reveal=false){hintMove=move?{...move,reveal}:null;drawMarkers();},
    toggleView(){view=view==='top'?(completed?'night':'play'):'top';setCamera();return view;},
    overview(){view=view==='overview'?(completed?'night':'play'):'overview';setCamera();return view;},
    getView(){return view;},
    info(){const left=project({x:-2,y:0}),right=project({x:4,y:0});return {drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,lightProgress:winStart===null?0:Math.min(1,(performance.now()-winStart)/4700),view,layout:{pavilionX:pavilion.group.position.x,pavilionZ:pavilion.group.position.z,boardHalfSize:8.6,background:'3d'},rowTiltPixels:right.y-left.y,cameraMoving:camera.position.distanceTo(cameraGoal)>.025||look.distanceTo(targetGoal)>.025};}
  };
}
root.BadukScene={create};
})(window);
