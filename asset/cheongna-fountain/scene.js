(function(root){
'use strict';
function create(host){
 const T=root.THREE;if(!T)throw new Error('3D 라이브러리를 불러오지 못했어요.');
 // The photographs and orthographic water effects share one cover projection.
 // No WebGL texture load is needed, so the local file version works as well.
 const photos=[['evening','waterfront-night-v3.webp'],['night','waterfront-midnight-v4.webp']].map(([kind,file])=>{const img=document.createElement('img');img.className='waterfront-photo '+kind;img.alt='';img.draggable=false;img.src=root.CheongnaEmbed?.backgrounds?.[kind]||'asset/cheongna-fountain/'+file;img.onerror=()=>{img.hidden=true;};host.append(img);return img;});
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x000000,0);renderer.outputEncoding=T.sRGBEncoding;host.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-50,50,28.14,-28.14,.1,300);
 camera.position.set(0,0,100);camera.lookAt(0,0,0);
 const imageAspect=1672/941,imageHeight=100/imageAspect,stage=host.parentElement;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
 const context=canvas.getContext('2d'),gradient=context.createRadialGradient(32,32,0,32,32,32);
 gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.16,'rgba(255,255,255,.85)');gradient.addColorStop(.45,'rgba(255,255,255,.22)');gradient.addColorStop(1,'rgba(255,255,255,0)');
 context.fillStyle=gradient;context.fillRect(0,0,64,64);const glowTexture=new T.CanvasTexture(canvas);
 const baseY=-imageHeight*.322,nozzles=[];
 for(let j=0;j<41;j++)nozzles.push({x:(j-20)*2.05,y:baseY+Math.abs(j-20)*.018,z:0,type:'line',side:(j-20)/20});
 for(let j=0;j<18;j++){const a=j/18*Math.PI*2;nozzles.push({x:Math.cos(a)*11.5,y:baseY+2.1+Math.sin(a)*.85,z:-1-Math.sin(a),type:'ring',side:Math.cos(a)});}
 for(let j=0;j<7;j++)nozzles.push({x:(j-3)*1.25,y:baseY+2.6,z:-3,type:'crown',side:(j-3)/3});
 const count=nozzles.length,samples=160,lineSamples=30,total=count*samples;
 const position=new Float32Array(total*3),color=new Float32Array(total*3),reflection=new Float32Array(total*3);
 const linePosition=new Float32Array(count*lineSamples*6),lineColor=new Float32Array(count*lineSamples*6);
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(position,3));geometry.setAttribute('color',new T.BufferAttribute(color,3));
 const pointMaterial=new T.PointsMaterial({size:5.8,sizeAttenuation:false,map:glowTexture,vertexColors:true,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 const jets=new T.Points(geometry,pointMaterial);jets.frustumCulled=false;jets.renderOrder=5;scene.add(jets);
 const reflectionGeometry=new T.BufferGeometry();reflectionGeometry.setAttribute('position',new T.BufferAttribute(reflection,3));reflectionGeometry.setAttribute('color',new T.BufferAttribute(color,3));
 const reflectionMaterial=pointMaterial.clone();reflectionMaterial.size=6.8;reflectionMaterial.opacity=.16;
 const reflected=new T.Points(reflectionGeometry,reflectionMaterial);reflected.frustumCulled=false;reflected.renderOrder=2;scene.add(reflected);
 const lineGeometry=new T.BufferGeometry();lineGeometry.setAttribute('position',new T.BufferAttribute(linePosition,3));lineGeometry.setAttribute('color',new T.BufferAttribute(lineColor,3));
 const lineMaterial=new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.22,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 const lines=new T.LineSegments(lineGeometry,lineMaterial);lines.frustumCulled=false;lines.renderOrder=4;scene.add(lines);
 const spriteMaterial=new T.SpriteMaterial({map:glowTexture,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 function glow(x,y,z,w,h,opacity){const sprite=new T.Sprite(spriteMaterial.clone());sprite.position.set(x,y,z);sprite.scale.set(w,h,1);sprite.material.opacity=opacity;scene.add(sprite);return sprite;}
 const lamps=nozzles.map(n=>glow(n.x,n.y+.04,3,2.8,1.2,0));
 const mist=[glow(-9,baseY+5,1,27,14,0),glow(9,baseY+5,1,27,14,0),glow(0,baseY+7,1,22,22,0)];
 const washes=[glow(-24,baseY-1.7,2,38,4.6,0),glow(0,baseY-1.7,2,38,4.6,0),glow(24,baseY-1.7,2,38,4.6,0)];
 const deckMaterial=new T.MeshBasicMaterial({color:'#425365',transparent:true,opacity:.6});
 const deck=new T.Mesh(new T.BoxGeometry(84,.13,.1),deckMaterial);deck.position.set(0,baseY-.07,-4);scene.add(deck);
 const ringGeometry=new T.EllipseCurve(0,0,11.7,1.1,0,Math.PI*2,false,0).getPoints(80);
 const ring=new T.LineLoop(new T.BufferGeometry().setFromPoints(ringGeometry),new T.LineBasicMaterial({color:'#657d8a',transparent:true,opacity:.35}));ring.position.set(0,baseY+2,-4);scene.add(ring);
 // A faint animated sheen integrates live water with the photographed lake.
 const sheenMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},night:{value:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float time;uniform float night;void main(){float ripple=pow(max(0.,sin(v.y*230.+sin(v.x*24.+time)*2.+time*1.6)),18.);float edge=smoothstep(0.,.14,v.y)*smoothstep(0.,.2,1.-v.y);float a=ripple*edge*(.014+.022*night);gl_FragColor=vec4(.42,.65,.85,a);}'});
 const sheen=new T.Mesh(new T.PlaneGeometry(100,imageHeight*.23),sheenMaterial);sheen.position.set(0,-imageHeight*.275,-5);scene.add(sheen);
 const palettes=[['#16b8ff','#7164ff'],['#6354ff','#04e5f2'],['#ee32e4','#9251ff'],['#ff598a','#ffb340'],['#04e0c2','#5490ff'],['#ffd470','#ff65b5']];
 const white=new T.Color('#cde8fc').convertSRGBToLinear(),tint=new T.Color(),secondary=new T.Color(),jetColor=new T.Color();
 let night=0,height=1.2,last=0,disposed=false,mode=1,group=-1,active=false;
 function resize(){
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);const aspect=w/h;
  pointMaterial.size=Math.max(3.7,Math.min(7,w/210));reflectionMaterial.size=pointMaterial.size*1.2;
  const visibleWidth=aspect<imageAspect?imageHeight*aspect:100,visibleHeight=aspect<imageAspect?imageHeight:100/aspect;
  camera.left=-visibleWidth/2;camera.right=visibleWidth/2;camera.top=visibleHeight/2;camera.bottom=-visibleHeight/2;camera.updateProjectionMatrix();
 }
 const observer=new ResizeObserver(resize);observer.observe(host);
 function path(n,t,amplitude,clock){
  let spread=0,peak=1;
  if(n.type==='line'){
   if(mode===1){peak=.5+.5*Math.pow(Math.cos(n.side*10+clock*3),2);}
   if(mode===2){spread=Math.sin(clock*2+n.side*2)*6;peak=.5+.2*Math.cos(n.side*4);}
   if(mode===4){spread=n.side*8;peak=.48+.32*(1-Math.abs(n.side));}
  }else if(n.type==='ring'){
   spread=mode===4?n.side*12:mode===2?-n.side*8:Math.sin(clock+n.side*2)*3;
   peak=mode===4?.8:.58;
  }else{
   spread=mode===4?n.side*7:mode===2?n.side*3:0;
   peak=(1-Math.abs(n.side)*.24)*(mode===1?1:.93);
  }
  return [n.x+spread*t,n.y+4*amplitude*peak*t*(1-t),n.z+Math.sin(t*Math.PI)*.5];
 }
 function render(frame,stamp){
  if(disposed)return;const dt=last?Math.min(.08,(stamp-last)/1000):.016;last=stamp;const clock=stamp/1000;
  const intro=frame.kind==='waiting',show=frame.kind==='show',finish=frame.kind==='finish',preview=frame.kind==='preview';
  const level=intro?Math.max(0,Math.min(1,frame.progress||0)):show||finish?1:0;
  night+=(level-night)*Math.min(1,dt*6);if(Math.abs(level-night)<.001)night=level;stage.style.setProperty('--night',night.toFixed(3));
  mode=finish?4:frame.beats||1;group=show?frame.group:finish?5:-1;active=show||finish||preview;
  const p=Math.max(0,Math.min(1,frame.progress||0)),pulse=Math.sin(Math.PI*p);
  let wanted=active?(mode===1?7+10*pulse:mode===2?11+5*pulse:14+6*pulse):intro?1+night*2:1.05+Math.sin(clock)*.15;
  if(finish)wanted=17+Math.sin(clock*1.1);height+=(wanted-height)*Math.min(1,dt*7);
  const palette=palettes[Math.max(0,group)];tint.set(palette[0]).convertSRGBToLinear();secondary.set(palette[1]).convertSRGBToLinear();
  pointMaterial.opacity=.47+night*.43;lineMaterial.opacity=.1+night*.14;reflectionMaterial.opacity=.025+night*.13;
  sheenMaterial.uniforms.time.value=clock;sheenMaterial.uniforms.night.value=night;
  for(let j=0;j<count;j++){
   const nozzle=nozzles[j],chase=.5+.5*Math.sin(j*.25-clock*2.4);
   jetColor.copy(white).lerp(tint,night*.96).lerp(secondary,night*(.1+chase*.55));
   if(nozzle.type==='crown')jetColor.lerp(white,night*.2);
   lamps[j].material.color.copy(jetColor);lamps[j].material.opacity=night*(active?.7:.26);
   for(let i=0;i<samples;i++){
    const k=(j*samples+i)*3,t=(i/samples+clock*(.33+(j%3)*.015))%1,xyz=path(nozzle,t,height,clock),scatter=Math.sin(t*Math.PI)*(.095+height*.006);
    position[k]=xyz[0]+Math.sin(i*13.1+j+clock*4)*scatter;position[k+1]=xyz[1]+Math.sin(i*8.7+j)*scatter;position[k+2]=xyz[2]+Math.cos(i*4.8+clock*2)*scatter;
    const sparkle=.72+.28*Math.sin(i*12.5+j+clock*8);
    color[k]=jetColor.r*sparkle;color[k+1]=jetColor.g*sparkle;color[k+2]=jetColor.b*sparkle;
    const dy=xyz[1]-nozzle.y;
    reflection[k]=xyz[0]+Math.sin(dy*11+clock*2)*(.15+dy*.028);
    reflection[k+1]=nozzle.y-3.7*(1-Math.exp(-dy/9))-.06;reflection[k+2]=xyz[2];
   }
   for(let i=0;i<lineSamples;i++){
    const a=path(nozzle,i/lineSamples,height,clock),b=path(nozzle,(i+1)/lineSamples,height,clock),k=(j*lineSamples+i)*6;
    linePosition.set(a,k);linePosition.set(b,k+3);lineColor.set([jetColor.r,jetColor.g,jetColor.b,jetColor.r,jetColor.g,jetColor.b],k);
   }
  }
  mist.forEach((s,i)=>{s.material.color.copy(i===1?secondary:tint);s.material.opacity=night*(active?.13+.04*pulse:.018);s.scale.y=10+height*.45;});
  washes.forEach((s,i)=>{s.material.color.copy(i===1?secondary:tint);s.material.opacity=night*(active?.25:.035);});
  geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;reflectionGeometry.attributes.position.needsUpdate=true;reflectionGeometry.attributes.color.needsUpdate=true;lineGeometry.attributes.position.needsUpdate=true;lineGeometry.attributes.color.needsUpdate=true;
  renderer.render(scene,camera);
 }
 function dispose(){disposed=true;observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>m.dispose());}});glowTexture.dispose();renderer.dispose();photos.forEach(img=>img.remove());}
 resize();return {render,dispose,inspect:()=>({backgroundsReady:photos.every(img=>img.complete&&img.naturalWidth>0),lighting:night<.01?'evening':night>.99?'midnight':'transition',night:Number(night.toFixed(3)),jetSize:pointMaterial.size,mode,group,active,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,jets:count,particles:total})};
}
root.FountainScene={create};
})(window);
