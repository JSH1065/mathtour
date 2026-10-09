(function(root){
'use strict';
function create(T,scene,renderer,material){
  const group=new T.Group();scene.add(group);
  let seed=8371;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const geometries={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,10),sphere:new T.SphereGeometry(1,10,8),leaf:new T.IcosahedronGeometry(1,1)};
  const batches=new Map(),dummy=new T.Object3D();
  function part(geometry,mat,x,y,z,sx,sy,sz,turn=0){
    const key=geometry.uuid+mat.uuid;if(!batches.has(key))batches.set(key,{geometry,mat,matrices:[]});
    dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,turn,0);dummy.updateMatrix();batches.get(key).matrices.push(dummy.matrix.clone());
  }
  const box=(w,h,d,x,y,z,m)=>part(geometries.box,m,x,y,z,w,h,d);
  const stone=material('#919690'),wall=material('#747e7c'),paving=material('#959e9b'),paving2=material('#8c9694'),rail=material('#b4bcb8');
  const grass=material('#364b3c'),grassDark=material('#273d35'),trunk=material('#403d32'),leaves=[material('#25473e'),material('#345348'),material('#466251')];
  const turfCanvas=document.createElement('canvas');turfCanvas.width=turfCanvas.height=128;const turfContext=turfCanvas.getContext('2d'),turfPixels=turfContext.createImageData(128,128);
  for(let i=0;i<turfPixels.data.length;i+=4){const v=178+rand()*72;turfPixels.data[i]=v*.95;turfPixels.data[i+1]=v;turfPixels.data[i+2]=v*.92;turfPixels.data[i+3]=255;}turfContext.putImageData(turfPixels,0,0);const turf=new T.CanvasTexture(turfCanvas);turf.encoding=T.sRGBEncoding;turf.wrapS=turf.wrapT=T.RepeatWrapping;turf.repeat.set(24,24);grassDark.map=turf;
  const metal=material('#3c494b'),timber=material('#655345'),plank=material('#85715b');
  const lampMat=new T.MeshBasicMaterial({color:'#ffdb93',toneMapped:false});
  const shoreLightMat=new T.MeshBasicMaterial({color:'#dfaa53',toneMapped:false,transparent:true,opacity:.5});
  // Two adjacent platforms, with the pavilion terrace projecting farther over the lake.
  // Board: x [-8.6,8.6], z [-8.6,8.6]. Pavilion: x [-22,-10], z [-7,1].
  box(22,1.25,24,0,-.98,1,wall);box(16,1.25,27,-19,-.98,-.5,wall);
  box(22,.16,24,0,-.27,1,stone);box(16,.16,27,-19,-.27,-.5,stone);
  for(let x=-27;x<11;x+=1.25)for(let z=-13.75;z<13;z+=1.25){
    if((x>-11&&z<-11)||(x<-11&&z>13))continue;
    box(1.225,.065,1.225,x+.625,-.16,z+.625,(Math.floor((x+z)*10)%3)?paving:paving2);
  }
  // A path and planted park connect to the landward edge, not a floating board.
  box(260,2,210,-5,-1.30,117,grassDark);
  box(90,2,150,-72,-1.30,66,grassDark);box(90,2,146,57,-1.30,68,grassDark);
  for(let i=0;i<14;i++){const z=-6+i*1.5;part(geometries.leaf,grass,-28.2,.0,z,1.3,.55,1.25);part(geometries.leaf,grass,13,.0,z+5,1.2,.45,1.3);}
  box(90,.18,5,-5,-.20,16,stone);
  box(90,.1,4.75,-5,-.06,16,paving);
  box(90,.20,2,-5,-.15,21.2,grass);
  for(let i=0;i<5;i++){box(48,.24,1.5,-27,.02+i*.25,24+i*2.1,stone);box(48,.22,.95,-27,.15+i*.25,24.3+i*2.1,grass);}
  // Low stone coping and pale balustrade follow the stepped shoreline.
  const shoreline=[[[-27,-14],[-11,-14]],[[-11,-14],[-11,-11]],[[-11,-11],[11,-11]],[[11,-11],[11,12.5]],[[-27,-14],[-27,12.5]]];
  const glowingStrips=[];
  function segment(a,b){
    const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),turn=Math.atan2(-dz,dx),x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
    part(geometries.box,rail,x,.80,z,length,.16,.28,turn);part(geometries.box,stone,x,.01,z,length,.15,.44,turn);
    const posts=Math.ceil(length/2.2);
    for(let i=0;i<=posts;i++){const u=i/posts,px=a[0]+dx*u,pz=a[1]+dz*u;box(.21,1.08,.21,px,.42,pz,rail);box(.32,.08,.32,px,1,pz,rail);part(geometries.sphere,rail,px,1.09,pz,.105,.13,.105);}
    const balusters=Math.ceil(length/.48);
    for(let i=1;i<balusters;i++){const u=i/balusters;part(geometries.cylinder,rail,a[0]+dx*u,.41,a[1]+dz*u,.065,.65,.065);}
    const light=new T.Mesh(new T.BoxGeometry(length,.045,.06),shoreLightMat);light.position.set(x,-.60,z);light.rotation.y=turn;group.add(light);glowingStrips.push(light);
    for(let k=0;k<Math.floor(length/1.1);k++){const u=k*1.1/length;part(geometries.box,stone,a[0]+dx*u,-.88,a[1]+dz*u,.035,.42,.1,turn);}
  }shoreline.forEach(([a,b])=>segment(a,b));
  function bench(x,z,turn=0){
    part(geometries.box,timber,x,.27,z,2,.12,.7,turn);
    for(let i=-1;i<=1;i++)part(geometries.box,plank,x,.36,z+i*.21,2,.08,.17,turn);
    for(const offset of [-.75,.75])part(geometries.box,metal,x+offset,.02,z,.12,.50,.64,turn);
  }
  bench(7,11.1);bench(-22,10.7);bench(-15,10.7);
  const planter=material('#56615b'),flower=material('#a45e75'),soil=material('#3e4030');
  for(const [x,z] of [[9.9,9.9],[-9.9,9.9],[9.9,-9.9]]){
    part(geometries.cylinder,planter,x,.05,z,.48,.5,.48);part(geometries.cylinder,soil,x,.32,z,.43,.08,.43);
    for(let i=0;i<9;i++){const a=i*2.399,r=.35*Math.sqrt(i/9);part(geometries.leaf,i%3===0?flower:leaves[i%3],x+Math.cos(a)*r,.41+rand()*.1,z+Math.sin(a)*r,.16,.12,.16);}
  }
  function tree(x,z,height=6){
    part(geometries.cylinder,trunk,x,height*.36-.2,z,.12,height*.72,.12);
    for(let j=0;j<7;j++){const angle=j*2.399,r=height*.17*(.5+rand());part(geometries.leaf,leaves[j%3],x+Math.cos(angle)*r,height*(.65+rand()*.23),z+Math.sin(angle)*r,height*(.19+rand()*.06),height*(.12+rand()*.06),height*(.16+rand()*.09),angle);}
  }
  for(let i=0;i<40;i++)tree(-61+rand()*120,28+rand()*34,4+rand()*5);
  for(let i=0;i<24;i++)tree((i%2?-1:1)*(30+rand()*20),-9+rand()*34,3+rand()*5);
  // Far shore uses restrained 3D silhouettes; no photograph behind the geometry.
  box(300,3,45,0,-1.4,-103,grassDark);
  for(let i=0;i<70;i++)tree(-145+i*4.2,-83-rand()*7,4+rand()*6);
  const facade=[material('#617784'),material('#647985'),material('#73838b')],glass=material('#344e61'),windowGlow=new T.MeshBasicMaterial({color:'#b9c7c3',transparent:true,opacity:.48,toneMapped:false});
  for(let i=0;i<18;i++){
    const x=-113+i*13+rand()*4,z=-110-rand()*20,w=5+rand()*4,h=10+rand()*18,d=5+rand()*4;
    box(w,h,d,x,h/2-1,z,facade[i%3]);box(w+.35,.38,d+.35,x,h-.8,z,glass);
    for(let side=0;side<3;side++)box(.15,h*.95,.15,x-w/2+side*w/2,h/2,z+d/2+.08,glass);
    for(let row=1;row<h-1;row+=1.35)for(let col=0;col<4;col++){const xx=x-w*.36+col*w*.24;box(.40,.68,.05,xx,row,z+d/2+.06,rand()<.19?windowGlow:glass);}
  }
  for(const [x,z] of [[-27,12],[10,13],[-36,21],[26,21],[-56,21]]){
    part(geometries.cylinder,metal,x,1.95,z,.055,4.2,.055);box(.65,.12,.65,x,4.08,z,metal);box(.37,.16,.37,x,3.94,z,lampMat);
    const light=new T.PointLight('#f4c18a',.55,10,1.7);light.position.set(x,3.8,z);group.add(light);
  }
  // A lit edge in the real scene is mirrored by the water render below.
  for(const {geometry,mat,matrices} of batches.values()){
    const mesh=new T.InstancedMesh(geometry,mat,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=mat===trunk;mesh.receiveShadow=true;group.add(mesh);
  }
  // Continuous 3D sky, with dusk haze instead of an image plane.
  const sky=new T.Mesh(new T.SphereGeometry(420,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,vertexShader:'varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vPosition; void main(){float h=normalize(vPosition).y;vec3 low=vec3(.25,.34,.41),high=vec3(.025,.095,.19);vec3 col=mix(low,high,smoothstep(-.02,.62,h));float cloud=sin(vPosition.x*.025+sin(vPosition.z*.017)*2.)*.5+.5;col+=vec3(.028,.02,.023)*cloud*smoothstep(.05,.30,h)*(1.-smoothstep(.30,.6,h));gl_FragColor=vec4(col,1.);}',toneMapped:false}));scene.add(sky);
  const waterY=-1.26,target=new T.WebGLRenderTarget(640,384,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat});target.texture.encoding=T.sRGBEncoding;
  const mirrorCamera=new T.PerspectiveCamera(),textureMatrix=new T.Matrix4();
  const waterMaterial=new T.ShaderMaterial({uniforms:{reflection:{value:target.texture},textureMatrix:{value:textureMatrix},time:{value:0},eye:{value:new T.Vector3()},waterY:{value:waterY}},
    vertexShader:'uniform mat4 textureMatrix;varying vec4 vReflection;varying vec3 vWorld;void main(){vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;vReflection=textureMatrix*world;gl_Position=projectionMatrix*viewMatrix*world;}',
    fragmentShader:`uniform sampler2D reflection;uniform float time;uniform vec3 eye;varying vec4 vReflection;varying vec3 vWorld;
      void main(){vec2 p=vWorld.xz;float a=sin(p.y*9.+sin(p.x*.73)*1.1-time*.42)*.4+sin(p.y*16.+p.x*2.2+time*.38)*.2+sin(p.y*2.7-p.x*.37-time*.24)*.4;float b=sin(p.y*2.1+p.x*.11+time*.17);vec2 uv=vReflection.xy/vReflection.w;uv+=vec2(b,a)*.0014;vec3 r=texture2D(reflection,clamp(uv,vec2(.001),vec2(.999))).rgb;
      float fresnel=pow(1.-clamp(normalize(eye-vWorld).y,0.,1.),2.);vec3 base=vec3(.043,.111,.14);vec3 color=mix(base,r,.47+.25*fresnel);color+=vec3(.018,.023,.028)*pow(max(0.,a),12.);gl_FragColor=vec4(color,1.);}`,
    side:T.DoubleSide,toneMapped:false});
  const water=new T.Mesh(new T.PlaneGeometry(700,700),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(0,waterY,-160);scene.add(water);
  const reflectLook=new T.Vector3(),direction=new T.Vector3(),bias=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),clipPlane=new T.Plane(new T.Vector3(0,1,0),-waterY);
  let lastReflection=-100;
  function update(now,camera){
    waterMaterial.uniforms.time.value=now*.001;waterMaterial.uniforms.eye.value.copy(camera.position);
    if(now-lastReflection<80)return;lastReflection=now;
    mirrorCamera.copy(camera);mirrorCamera.position.y=2*waterY-camera.position.y;camera.getWorldDirection(direction);reflectLook.copy(camera.position).add(direction);reflectLook.y=2*waterY-reflectLook.y;mirrorCamera.up.set(0,-1,0);mirrorCamera.lookAt(reflectLook);mirrorCamera.updateMatrixWorld(true);
    textureMatrix.copy(bias).multiply(mirrorCamera.projectionMatrix).multiply(mirrorCamera.matrixWorldInverse);
    const previousTarget=renderer.getRenderTarget(),previousClipping=renderer.clippingPlanes,previousShadow=renderer.shadowMap.autoUpdate;
    water.visible=false;renderer.clippingPlanes=[clipPlane];renderer.shadowMap.autoUpdate=false;renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,mirrorCamera);renderer.setRenderTarget(previousTarget);renderer.clippingPlanes=previousClipping;renderer.shadowMap.autoUpdate=previousShadow;water.visible=true;
  }
  return {update,setLight(t){shoreLightMat.opacity=.50+t*.35;},landmark:{x:-16,z:-3},water};
}
root.CheongnaLandscape={create};
})(window);
