/* Songdo eastern canal: positions from OSM; bridge form checked against Arup's 2009 journal. */
(function(root){'use strict';
 const G=root.CentralGeography,A='asset/namdong-tour/';
 function inside(p,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
 const wet=p=>inside(p,G.water)&&!G.islands.some(q=>inside(p,q));
 function build(T,scene,resources){
  const {materials,textures,geometries}=resources,env=new T.Group();env.name='Songdo georeferenced landscape';scene.add(env);
  let seed=317;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const mat=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.86,...extra});materials.push(m);return m;};
  const boxGeo=new T.BoxGeometry(1,1,1);geometries.push(boxGeo);
  function box(parent,w,h,d,x,y,z,m,angle=0){const o=new T.Mesh(boxGeo,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.rotation.y=angle;parent.add(o);return o;}
  function tube(parent,pts,r,m){const g=new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),Math.max(16,pts.length*2),r,6,false);geometries.push(g);const o=new T.Mesh(g,m);parent.add(o);return o;}
  function flat(poly,m,y=0,holes=[]){const shape=new T.Shape(poly.map(p=>new T.Vector2(p[0],-p[1])));holes.forEach(q=>shape.holes.push(new T.Path(q.map(p=>new T.Vector2(p[0],-p[1])))));const geo=new T.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);geometries.push(geo);const o=new T.Mesh(geo,m);o.position.y=y;env.add(o);return o;}
  const lawn=mat('#7d9861'),earth=mat('#cec1a0'),paving=mat('#d6c8b2'),stone=mat('#aab0a2'),white=mat('#e0e4df',{metalness:.35,roughness:.42}),rail=mat('#748786',{metalness:.6}),wood=mat('#6f4a2e'),roofMat=mat('#46535a'),wall=mat('#eee2bf'),shrub=mat('#4d764d');
  const grassTex=document.createElement('canvas');grassTex.width=128;grassTex.height=128;const gc=grassTex.getContext('2d');gc.fillStyle='#a5b77a';gc.fillRect(0,0,128,128);for(let i=0;i<900;i++){gc.fillStyle=i%2?'#829861':'#b7c88b';gc.fillRect(rand()*128,rand()*128,1,2);}const gt=new T.CanvasTexture(grassTex);gt.wrapS=gt.wrapT=T.RepeatWrapping;gt.repeat.set(170,170);textures.push(gt);lawn.map=gt;
  box(env,2800,.4,2600,-200,-1.5,-250,lawn);
  // Thin paved ribbons trace the actual paths, with the lake covering any crossings below water level.
  function ribbon(points,width,m,y){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length>.2)box(env,width,.13,length,(a[0]+b[0])/2,y,(a[1]+b[1])/2,m,Math.atan2(dx,dz));}}
  G.features.forEach(f=>{const t=f.tags;if(t.highway&&!t.bridge){const width=['footway','path','steps','pedestrian'].includes(t.highway)?3: t.highway==='service'?5:15;ribbon(f.points,width, width>5?earth:paving,-.9);}});
  // Park banks and broad UN waterfront apron.
  const waterFloor=flat(G.water,mat('#236774'),-.7,G.islands);
  const shore=G.water;for(let i=1;i<shore.length;i++){const a=shore[i-1],b=shore[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l>.1)box(env,.65,1.1,l,(a[0]+b[0])/2,-.25,(a[1]+b[1])/2,stone,Math.atan2(dx,dz));}
  G.islands.forEach(p=>{flat(p,lawn,.25);for(let i=0;i<p.length;i+=4){const [x,z]=p[i];box(env,1.8,.5,1.3,x,.04,z,stone,rand());}});
  const plaza=G.features.find(f=>f.id==='1037031075');flat(plaza.points,paving,.1);
  const pc=G.places.plaza;
  const ringGeo=new T.RingGeometry(10,10.45,72);ringGeo.rotateX(-Math.PI/2);geometries.push(ringGeo);for(const factor of [1,1.6,2.2]){const o=new T.Mesh(ringGeo,stone);o.scale.set(factor,1,factor);o.position.set(pc[0],.14,pc[1]);env.add(o);}
  for(let i=0;i<11;i++){const x=pc[0]-12+i*2.6,z=pc[1]-25;box(env,.11,7,.11,x,3.5,z,white);box(env,1.35,.8,.03,x+.67,6.55,z,mat(['#e9ece4','#5991b0','#ca6855','#efce7b'][i%4]));}
  // Glazed façades and floor bands; building footprints retain geographic positions.
  const cn=document.createElement('canvas');cn.width=256;cn.height=512;const cx=cn.getContext('2d');cx.fillStyle='#7298a7';cx.fillRect(0,0,256,512);for(let y=0;y<64;y++)for(let x=0;x<20;x++){const c=rand();cx.fillStyle=c<.08?'#eee4b2':c<.45?'#82a5b3':c<.7?'#527d94':'#a3bdc5';cx.fillRect(x*13+1,y*8+1,11,6);}const windows=new T.CanvasTexture(cn);textures.push(windows);const glass=mat('#bad0d2',{map:windows,roughness:.3,metalness:.3}),cream=mat('#c8cbbf',{map:windows}),darkGlass=mat('#7297aa',{map:windows,roughness:.32});
  function obb(p){const edges=p.slice(1).map((q,i)=>({a:p[i],b:q,l:Math.hypot(q[0]-p[i][0],q[1]-p[i][1])})).sort((a,b)=>b.l-a.l);const e=edges[0],angle=Math.atan2(e.b[1]-e.a[1],e.b[0]-e.a[0]),co=Math.cos(angle),si=Math.sin(angle);const ps=p.map(([x,z])=>[x*co+z*si,-x*si+z*co]),xs=ps.map(p=>p[0]),zs=ps.map(p=>p[1]),lo=[Math.min(...xs),Math.min(...zs)],hi=[Math.max(...xs),Math.max(...zs)],c=[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2];return {x:c[0]*co-c[1]*si,z:c[0]*si+c[1]*co,w:hi[0]-lo[0],d:hi[1]-lo[1],angle:-angle};}
  const hanokArea=G.features.find(f=>f.id==='384282248')?.points;
  function hanok(x,z,w,d,angle,height=5){const group=new T.Group();group.position.set(x,0,z);group.rotation.y=angle;env.add(group);box(group,w,height,d,0,height/2,0,wall);box(group,w+.8,.8,d+.8,0,.15,0,stone);
   for(let a=-w/2+1;a<w/2;a+=2.8){box(group,.24,height+.1,.27,a,height/2,d/2+.15,wood);box(group,2.1,height*.62,.06,a+1.35,height*.48,d/2+.2,wood);for(let k=0;k<5;k++)box(group,.06,height*.58,.07,a+.5+k*.37,height*.48,d/2+.24,wall);}
   // Curved tile eaves, with a long ridge and clipped hips at both ends.
   const vertices=[],indices=[],W=w/2+1.4,D=d/2+1.4,N=12;
   for(let iz=0;iz<=N;iz++){const zz=(iz/N*2-1)*D,ay=Math.abs(zz)/D;for(let ix=0;ix<=N;ix++){const xx=(ix/N*2-1)*W,hip=Math.max(0,(Math.abs(xx)-(W-D*.65))/(D*.65));const yy=height+2.9*(1-ay)**1.55-1.1*hip*(1-ay)+.55*ay**7;vertices.push(xx,yy,zz);}}
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const a=iz*(N+1)+ix;indices.push(a,a+N+1,a+1,a+1,a+N+1,a+N+2);}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();geometries.push(geo);const m=new T.Mesh(geo,roofMat);m.material.side=T.DoubleSide;group.add(m);
   for(let xx=-W;xx<=W;xx+=.65){const pts=[];for(let iz=0;iz<=12;iz++){const zz=(iz/12*2-1)*D,ay=Math.abs(zz)/D,hip=Math.max(0,(Math.abs(xx)-(W-D*.65))/(D*.65));pts.push([xx,height+2.9*(1-ay)**1.55-1.1*hip*(1-ay)+.55*ay**7+.06,zz]);}tube(group,pts,.075,stone);}
   box(group,w, .27,.38,0,height+3,0,roofMat);
  }
  G.features.filter(f=>f.tags.building).forEach((f,i)=>{const b=obb(f.points);if(b.w<1||b.d<1)return;
   const isHanok=(hanokArea&&inside([b.x,b.z],hanokArea))||(-280<b.x&&b.x<-85&&-130<b.z&&b.z<20);
   if(isHanok){if(b.w>50||b.d>42){hanok(b.x-b.w*.22,b.z,b.w*.46,b.d*.8,b.angle,5);hanok(b.x+b.w*.23,b.z,b.w*.46,b.d*.8,b.angle,5);}else hanok(b.x,b.z,b.w,b.d,b.angle,5);return;}
   if(f.id==='314426413'){box(env,b.w,3.5,b.d,b.x,1.75,b.z,glass,b.angle);box(env,b.w+1.2,.35,b.d+1.2,b.x,3.7,b.z,white,b.angle);return;}
   let h=parseFloat(f.tags.height)||parseFloat(f.tags['building:levels'])*3.2||(f.tags.building==='apartments'?70+(i%7)*9:f.tags.building==='hotel'?75:10+(i%4)*7);
   if(f.id==='312895052')h=305;if(b.x>100&&b.z<-100&&h<40)h=90+(i%6)*13;
   const material=i%3===0?cream:i%3===1?glass:darkGlass;box(env,b.w,h,b.d,b.x,h/2-1,b.z,material,b.angle);
   for(let y=9;y<h;y+=7)box(env,b.w+.22,.18,b.d+.22,b.x,y,b.z,white,b.angle);
   box(env,b.w+.5,1.2,b.d+.5,b.x,h,b.z,stone,b.angle);
  });
  // Mountain Strolling Garden Bridge: low inward-leaning twin arches, timber deck.
  function bridge(id,main){const f=G.features.find(f=>f.id===id);if(!f)return;const a=f.points[0],b=f.points.at(-1),len=Math.hypot(b[0]-a[0],b[1]-a[1]);const g=new T.Group();g.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);g.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);env.add(g);
   const deck=y=>3.4+1.4*Math.sin(Math.PI*(y/len+.5));for(let k=0;k<40;k++){const zz=-len/2+(k+.5)*len/40;box(g,4.3,.28,len/40+.12,0,deck(zz),zz,wood);}
   for(const side of [-1,1]){const arch=[];for(let i=0;i<=32;i++){const z=-len/2+len*i/32,t=i/32,up=Math.sin(Math.PI*t);arch.push([side*(2.3-.6*up),2.9+4.0*up,z]);}tube(g,arch,.2,white);
    const hand=[];for(let i=0;i<=32;i++){const z=-len/2+len*i/32;hand.push([side*2.0,deck(z)+1.1,z]);}tube(g,hand,.065,rail);
    for(let i=0;i<=32;i++){const z=-len/2+len*i/32,t=i/32,up=Math.sin(Math.PI*t);tube(g,[[side*2,deck(z),z],[side*2,deck(z)+1.1,z]],.035,rail);if(i%2===0)tube(g,[[side*2.3,deck(z)-.1,z],[side*(2.3-.6*up),2.9+4*up,z]],.065,white);}
   }for(const z of [-len/2,len/2])box(g,5.5,3,2,0,1.5,z,stone);
  }bridge('312895055',true);bridge('311884723',false);
  // Floating timber finger piers, beside the actual East Boathouse.
  const dock=G.places.dock;box(env,21,.45,4,dock[0]+3,.32,dock[1]+9,wood,-.7);for(let i=0;i<4;i++)box(env,1.4,.38,7,dock[0]-4+i*4,.33,dock[1]+5,wood,-.7);
  const treeTexture=new T.TextureLoader().load(A+'central-tree.webp');treeTexture.encoding=T.sRGBEncoding;textures.push(treeTexture);
  const treeMat=new T.ShaderMaterial({uniforms:{map:{value:treeTexture},fogColor:{value:new T.Color('#b8cdd0')}},vertexShader:'varying vec2 vUv; varying float depth; void main(){vUv=uv;vec4 mv=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);mv.xy+=position.xy*vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));depth=-mv.z;gl_Position=projectionMatrix*mv;}',fragmentShader:'uniform sampler2D map;uniform vec3 fogColor;varying vec2 vUv;varying float depth;void main(){vec4 c=texture2D(map,vUv);if(c.a<.55)discard;c.rgb=mix(c.rgb,fogColor,smoothstep(300.,1400.,depth));gl_FragColor=vec4(c.rgb,1.);}',side:T.DoubleSide});materials.push(treeMat);
  const treePoints=[];for(let z=-620;z<170;z+=14)for(let x=-660;x<340;x+=14){const p=[x+(rand()-.5)*12,z+(rand()-.5)*12];if(wet(p)||rand()<.54)continue;const inBuilding=G.features.some(f=>f.tags.building&&inside(p,f.points));if(inBuilding)continue;if(inside(p,plaza.points))continue;if(p[1]>80&&p[0]>0)continue;treePoints.push([p[0],p[1],6+rand()*5]);}
  const plane=new T.PlaneGeometry(1,1);geometries.push(plane);const trees=new T.InstancedMesh(plane,treeMat,treePoints.length),dummy=new T.Object3D();treePoints.forEach(([x,z,h],i)=>{dummy.position.set(x,h/2-.9,z);dummy.scale.set(h*.9,h,1);dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix);});trees.frustumCulled=false;env.add(trees);
  // A few small rabbits make the final island recognizable without a landing route.
  const rabbitMat=mat('#e7e7d8'),rabbitGeo=new T.SphereGeometry(1,12,8);geometries.push(rabbitGeo);for(let i=0;i<5;i++){const x=G.places.rabbit[0]-3+i*1.4,z=G.places.rabbit[1]+Math.sin(i)*2;const body=new T.Mesh(rabbitGeo,rabbitMat);body.scale.set(.5,.42,.8);body.position.set(x,.7,z);env.add(body);for(const side of [-1,1]){const ear=new T.Mesh(rabbitGeo,rabbitMat);ear.scale.set(.1,.45,.14);ear.position.set(x+side*.18,1.25,z-.45);env.add(ear);}}
  const beacon=new T.Group();beacon.name='rabbit-math-light';beacon.position.set(G.places.rabbit[0],0,G.places.rabbit[1]);env.add(beacon);
  const lightMaterial=mat('#ffe5a0',{emissive:'#ffb329',emissiveIntensity:1.3,metalness:.3,roughness:.2});const starGeo=new T.OctahedronGeometry(1.5,0);geometries.push(starGeo);const star=new T.Mesh(starGeo,lightMaterial);star.position.y=11;beacon.add(star);
  const haloGeo=new T.PlaneGeometry(30,30);geometries.push(haloGeo);const haloMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{pulse:{value:1}},vertexShader:'varying vec2 p;void main(){p=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float pulse;varying vec2 p;void main(){float r=length(p);float glow=exp(-r*7.)*.36;float rays=pow(max(0.,1.-abs(p.x)*10.),4.)*max(0.,1.-abs(p.y))* .075+pow(max(0.,1.-abs(p.y)*10.),4.)*max(0.,1.-abs(p.x))*.075;gl_FragColor=vec4(1.,.74,.22,(glow+rays)*pulse);}'});materials.push(haloMat);const halo=new T.Mesh(haloGeo,haloMat);halo.position.y=11;beacon.add(halo);
  const ringGeoLight=new T.TorusGeometry(2.4,.055,6,64);geometries.push(ringGeoLight);const ringA=new T.Mesh(ringGeoLight,lightMaterial),ringB=new T.Mesh(ringGeoLight,lightMaterial);ringA.position.y=ringB.position.y=11;ringB.rotation.x=Math.PI/2;beacon.add(ringA,ringB);
  const rayGeo=new T.CylinderGeometry(.2,3.2,27,24,1,true);geometries.push(rayGeo);const rayMat=new T.MeshBasicMaterial({color:'#ffda6b',transparent:true,opacity:.025,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});materials.push(rayMat);const ray=new T.Mesh(rayGeo,rayMat);ray.position.y=13.5;beacon.add(ray);
  // Draw many repeated pieces in a small number of GPU calls.
  env.updateMatrixWorld(true);const batches=new Map(),remove=[];env.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.geometry!==boxGeo)return;const key=o.material.uuid;if(!batches.has(key))batches.set(key,{mat:o.material,list:[]});batches.get(key).list.push(o.matrixWorld.clone());remove.push(o);});remove.forEach(o=>o.parent.remove(o));for(const b of batches.values()){const mesh=new T.InstancedMesh(boxGeo,b.mat,b.list.length);b.list.forEach((m,i)=>mesh.setMatrixAt(i,m));env.add(mesh);}
  const curve=new T.CatmullRomCurve3(G.route.map(([x,z])=>new T.Vector3(x,0,z)),false,'centripetal');curve.arcLengthDivisions=1400;
  function at(distance,offset=0){const u=Math.max(0,Math.min(1,distance/450)),point=curve.getPointAt(u),tangent=curve.getTangentAt(u).normalize(),right=new T.Vector3(-tangent.z,0,tangent.x);point.addScaledVector(right,offset);return {point,tangent,right,yaw:Math.atan2(-tangent.x,-tangent.z)};}
  // Projective water reflection of actual buildings and banks, with gentle ripple distortion.
  const rt=new T.WebGLRenderTarget(512,384,{depthBuffer:true});textures.push(rt.texture);const mirrorCamera=new T.PerspectiveCamera(),matrix=new T.Matrix4();
  const waterMat=new T.ShaderMaterial({uniforms:{time:{value:0},reflection:{value:rt.texture},textureMatrix:{value:matrix}},vertexShader:'uniform mat4 textureMatrix;varying vec4 mirrorCoord;varying vec3 wp;void main(){vec4 w=modelMatrix*vec4(position,1.);wp=w.xyz;mirrorCoord=textureMatrix*w;gl_Position=projectionMatrix*viewMatrix*w;}',fragmentShader:'uniform sampler2D reflection;uniform float time;varying vec4 mirrorCoord;varying vec3 wp;void main(){vec2 uv=mirrorCoord.xy/mirrorCoord.w;float a=sin(wp.x*1.6+wp.z*.3+time*1.1),b=sin(wp.z*2.8-wp.x*.4-time*.65);uv+=vec2(a*.003,b*.002);vec3 refl=texture2D(reflection,clamp(uv,0.,1.)).rgb;vec3 water=vec3(.12,.36,.40);vec3 c=mix(water,refl,.48);c+=.025*(a+b);float sparkle=pow(max(0.,sin(wp.z*4.1+time)*sin(wp.x*3.2-time)),12.);c+=vec3(.3,.25,.14)*sparkle;gl_FragColor=vec4(c,1.);}'});materials.push(waterMat);const water=flat(G.water,waterMat,0,G.islands);
  let ticks=0;const clip=new T.Plane(new T.Vector3(0,1,0),0);function reflect(renderer,camera){if(ticks++%3)return;const dir=new T.Vector3();camera.getWorldDirection(dir);mirrorCamera.copy(camera);mirrorCamera.position.copy(camera.position);mirrorCamera.position.y=-camera.position.y;mirrorCamera.up.set(0,-1,0);mirrorCamera.lookAt(camera.position.x+dir.x,-camera.position.y-dir.y,camera.position.z+dir.z);mirrorCamera.updateMatrixWorld();matrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);matrix.multiply(mirrorCamera.projectionMatrix).multiply(mirrorCamera.matrixWorldInverse);water.visible=false;waterFloor.visible=false;renderer.clippingPlanes=[clip];renderer.setRenderTarget(rt);renderer.render(scene,mirrorCamera);renderer.setRenderTarget(null);renderer.clippingPlanes=[];water.visible=true;waterFloor.visible=true;}
  function animate(time,camera,distance){star.rotation.y=time*.42;star.position.y=11+Math.sin(time*1.3)*.23;ringA.rotation.y=time*.3;ringB.rotation.z=-time*.23;halo.quaternion.copy(camera.quaternion);haloMat.uniforms.pulse.value=.8+Math.sin(time*2)*.12+distance/450*.4;}
  return {at,waterMat,reflect,animate,env,curve,destroy(){rt.dispose();}};
 }
 root.CentralWorld={build,inside,wet};
})(window);
