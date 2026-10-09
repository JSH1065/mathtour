(function(root){
'use strict';
// Photo-informed Cheongnaru: stone lower columns, an open red upper storey,
// and one tiled hip-and-gable roof. Dimensions are adapted for this playable view.
function create(T,material){
  const group=new T.Group();group.position.set(-16,-.13,-3);group.scale.set(1.35,1.10,1.4);
  const stone=material('#b8b9ae'),base=material('#888f88'),red=material('#803e31'),darkRed=material('#55382c');
  const green=material('#2c655b'),mint=material('#709284'),cream=material('#d2bc85'),roofEdge=material('#7a8786');
  const slate=material('#a3adb2',{roughness:.77,side:T.DoubleSide});
  const lit=material('#bc8850',{emissive:'#eab768',emissiveIntensity:.15});
  const boxGeo=new T.BoxGeometry(1,1,1),columnGeo=new T.CylinderGeometry(.94,1,1,16),batches=new Map(),dummy=new T.Object3D();
  function instance(geometry,mat,x,y,z,sx,sy,sz,rotation=0){
    const key=geometry.uuid+mat.uuid;if(!batches.has(key))batches.set(key,{geometry,mat,matrices:[]});
    dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,rotation,0);dummy.updateMatrix();batches.get(key).matrices.push(dummy.matrix.clone());
  }
  const box=(w,h,d,x,y,z,mat)=>instance(boxGeo,mat,x,y,z,w,h,d);
  const pillar=(r,h,x,y,z,mat)=>instance(columnGeo,mat,x,y,z,r,h,r);
  box(8.1,.22,5.1,0,.08,0,base);box(7.75,.14,4.8,0,.25,0,stone);
  // Open lower storey, raised wooden gallery, and stone stair at the side.
  for(const x of [-3.25,-1.63,0,1.63,3.25])for(const z of [-1.8,1.8]){
    box(.60,.15,.60,x,.4,z,stone);pillar(.26,1.65,x,1.29,z,stone);
    box(.53,.16,.53,x,2.10,z,darkRed);pillar(.14,2.2,x,3.46,z,red);
    box(.48,.16,.48,x,4.56,z,green);box(.68,.11,.57,x,4.7,z,mint);
  }
  box(7.45,.26,4.4,0,2.22,0,darkRed);box(7.40,.10,4.35,0,2.39,0,red);
  for(let i=0;i<10;i++)box(.84,.21,2.6-i*.22,3.9,.4+i*.2,-.18+i*.11,stone);
  function gallery(z){
    box(7.35,.12,.13,0,3.12,z,red);box(7.35,.10,.13,0,2.65,z,darkRed);
    for(let i=0;i<=32;i++)box(.068,.65,.075,-3.58+i*7.16/32,2.79,z,red);
  }gallery(-2.1);gallery(2.1);
  for(const x of [-3.64,3.64]){
    box(.13,.12,4.2,x,3.12,0,red);box(.13,.1,4.2,x,2.65,0,darkRed);
    for(let i=0;i<19;i++)box(.075,.65,.065,x,2.79,-2+i*4/18,red);
  }
  // Layered painted beams and repeated bracket blocks under the eaves.
  for(const z of [-1.83,1.83]){
    box(7.4,.24,.3,0,4.64,z,green);box(7.65,.075,.4,0,4.79,z,cream);
    box(7.8,.12,.44,0,4.90,z,green);
    for(let i=0;i<25;i++){
      const x=-3.55+i*7.1/24;
      box(.13,.13,.60,x,4.91,z,red);box(.12,.075,.71,x,5.01,z,mint);
      box(.15,.055,.25,x,4.60,z+.17*Math.sign(z),cream);
    }
  }
  for(const x of [-3.3,3.3])box(.3,.25,3.65,x,4.65,0,green);

  // Curved tiled surfaces: a central ridge, curved slopes, and lower hipped ends.
  // Geometry and a local canvas texture keep this landmark working on file:// too.
  const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle='#768187';ctx.fillRect(0,0,256,128);
  for(let x=0;x<256;x+=16){const g=ctx.createLinearGradient(x,0,x+16,0);g.addColorStop(0,'#4d5960');g.addColorStop(.38,'#87939a');g.addColorStop(1,'#66727a');ctx.fillStyle=g;ctx.fillRect(x,0,16,128);}
  ctx.strokeStyle='#202e3b70';ctx.lineWidth=2;
  for(let y=0;y<128;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}
  const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(3,2);slate.map=tex;slate.bumpMap=tex;slate.bumpScale=.018;
  function surface(fn,nu=64,nv=24){
    const positions=[],uvs=[],indices=[];
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){positions.push(...fn(i/nu,j/nv));uvs.push(i/nu,j/nv);}
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;indices.push(a,b,a+1,b,b+1,a+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
    const mesh=new T.Mesh(geo,slate);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return fn;
  }
  const slope=(u,v,side)=>{
    const x=(u*2-1)*(3+1.54*Math.max(0,(v-.58)/.42)),z=side*3*v;
    const y=7.2-3.56*v+1.73*v*v+.24*Math.pow(Math.abs(u*2-1),8)*v*v;
    return [x,y,z];
  };
  for(const side of [-1,1])surface((u,v)=>slope(u,v,side));
  // Red gable triangles rise above the lower hip roofs at both ends.
  for(const side of [-1,1]){
    const tri=new T.BufferGeometry();tri.setAttribute('position',new T.Float32BufferAttribute([side*3,7.18,0,side*3,5.77,-1.74,side*3,5.77,1.74],3));tri.computeVertexNormals();
    const gable=new T.Mesh(tri,new T.MeshStandardMaterial({color:red.color,roughness:.85,side:T.DoubleSide}));group.add(gable);
    surface((u,v)=>{const w=.58+.42*v;return[side*(3+1.54*v),7.2-3.56*w+1.73*w*w+.24*Math.pow(Math.abs(u*2-1),8)*w*w,(u*2-1)*3*w];},32,14);
    box(.16,.10,2.5,side*3.12,5.65,0,cream);
  }
  function curvedBeam(points,r,mat){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,32,r,6,false),mat);group.add(mesh);}
  for(const side of [-1,1]){
    curvedBeam(Array.from({length:17},(_,i)=>slope(i/16,1,side)),.075,roofEdge);
    const edge=Array.from({length:17},(_,i)=>slope(i/16,1,side).map((v,k)=>k===1?v-.14:v));curvedBeam(edge,.09,green);
  }
  curvedBeam(Array.from({length:19},(_,i)=>{const u=i/18;return[(u*2-1)*3.16,7.25+.22*Math.pow(Math.abs(u*2-1),8),0];}),.105,roofEdge);
  // A restrained readable name plaque, drawn locally rather than a remote texture.
  const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=160;const sc=signCanvas.getContext('2d');sc.fillStyle='#213e38';sc.fillRect(0,0,512,160);sc.strokeStyle='#bdac74';sc.lineWidth=7;sc.strokeRect(8,8,496,144);sc.fillStyle='#efdfac';sc.textAlign='center';sc.textBaseline='middle';sc.font='bold 91px Batang,serif';sc.fillText('청라루',256,86);
  const signTexture=new T.CanvasTexture(signCanvas);signTexture.encoding=T.sRGBEncoding;
  const sign=new T.Mesh(new T.PlaneGeometry(1.75,.55),new T.MeshBasicMaterial({map:signTexture,toneMapped:false}));sign.position.set(0,4.3,1.999);group.add(sign);
  for(const x of [-2.5,0,2.5])box(.30,.06,.30,x,4.52,1.36,lit);
  const illumination=new T.PointLight('#f4bc71',.35,13,1.7);illumination.position.set(0,3.8,2);group.add(illumination);
  for(const {geometry,mat,matrices} of batches.values()){
    const mesh=new T.InstancedMesh(geometry,mat,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  return {group,setLight(power){illumination.intensity=.35+power*1.25;lit.emissiveIntensity=.15+power*.75;}};
}
root.Cheongnaru={create};
})(window);
