/* The illustrated clay map supplies the material; geometry keeps rotation and hole spacing exact. */
(() => {
  'use strict';
  const assetBase=new URL('./',document.currentScript.src);
  class PotteryView {
    constructor(host){
      this.host=host;this.angle=0;this.count=-1;this.bandProgress=0;this.glow=0;this.pulse=0;
      const T=window.THREE;if(!T)throw new Error('3D library unavailable');
      this.renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.outputEncoding=T.sRGBEncoding;
      this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.9;
      this.renderer.domElement.setAttribute('aria-label','손가락으로 돌릴 수 있는 체험용 구멍무늬토기');
      this.renderer.domElement.setAttribute('role','img');host.prepend(this.renderer.domElement);
      this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(35,1,.1,50);
      this.scene.add(new T.HemisphereLight(0xffefd7,0x45352b,.7));
      const key=new T.DirectionalLight(0xffdfae,1.1);key.position.set(-3,5,5);this.scene.add(key);
      const fill=new T.DirectionalLight(0xbddadd,.3);fill.position.set(4,2,-2);this.scene.add(fill);
      this.goldLight=new T.PointLight(0xffc758,0,8);this.goldLight.position.set(0,2,0);this.scene.add(this.goldLight);
      const texture=new T.Texture();
      const loadTexture=src=>new T.ImageLoader().load(src,image=>{texture.image=image;texture.needsUpdate=true;});
      if(location.protocol==='file:'){
        // A file: image cannot be uploaded to WebGL in Chromium. Load the same
        // artwork as an origin-clean data URL, only for double-click execution.
        if(window.GeomdanClayTexture)loadTexture(window.GeomdanClayTexture);
        else{
          const script=document.createElement('script');script.src=new URL('clay-local.js',assetBase).href;
          script.onload=()=>{loadTexture(window.GeomdanClayTexture);script.remove();};
          script.onerror=()=>{console.warn('토기 질감 파일을 불러오지 못했어요.');script.remove();};
          document.head.append(script);
        }
      }else loadTexture(new URL('clay-illustration.webp',assetBase).href);
      texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(2,1);texture.encoding=T.sRGBEncoding;
      this.clay=new T.MeshStandardMaterial({color:0xb3a08a,map:texture,bumpMap:texture,bumpScale:.019,roughness:.98,side:T.DoubleSide});
      this.pot=new T.Group();this.scene.add(this.pot);
      const profile=[[0,-1.12],[.48,-1.12],[.54,-1.08],[.59,-.9],[.68,-.55],[.8,-.1],[.92,.38],[1.02,.83],[1.04,.93],[.98,.93],[.96,.83],[.86,.38],[.74,-.1],[.62,-.55],[.53,-.92],[0,-.97]].map(p=>new T.Vector2(...p));
      this.body=new T.Mesh(new T.LatheGeometry(profile,96),this.clay);this.pot.add(this.body);
      const disk=new T.Mesh(new T.CylinderGeometry(1.38,1.44,.15,96),new T.MeshStandardMaterial({color:0x77533a,roughness:.85}));disk.position.y=-1.22;this.scene.add(disk);
      const foot=new T.Mesh(new T.CylinderGeometry(1.15,1.22,.08,96),new T.MeshStandardMaterial({color:0x352f26,roughness:.9}));foot.position.y=-1.335;this.scene.add(foot);
      const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const c=shadowCanvas.getContext('2d');
      const gradient=c.createRadialGradient(64,64,10,64,64,64);gradient.addColorStop(0,'rgba(25,20,12,.5)');gradient.addColorStop(1,'rgba(25,20,12,0)');c.fillStyle=gradient;c.fillRect(0,0,128,128);
      const shadow=new T.Mesh(new T.PlaneGeometry(4.3,4.3),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.38;this.scene.add(shadow);
      this.tool=new T.Group();const rod=new T.Mesh(new T.CylinderGeometry(.045,.065,.9,16),new T.MeshStandardMaterial({color:0xbe995e,roughness:.85}));rod.rotation.x=Math.PI/2;this.tool.add(rod);this.tool.position.set(0,1.055,1.62);this.tool.visible=false;this.scene.add(this.tool);
      this.startMarker=new T.Mesh(new T.SphereGeometry(.04,12,8),new T.MeshBasicMaterial({color:0xffe6a1}));this.startMarker.position.set(0,1.2,1.08);this.pot.add(this.startMarker);this.startMarker.visible=false;
      this.measureMat=new T.MeshBasicMaterial({color:0xf2dfab,side:T.DoubleSide,transparent:true,opacity:.94});
      this.halo=new T.Mesh(new T.TorusGeometry(1.08,.018,8,128),new T.MeshBasicMaterial({color:0xffd977,transparent:true,opacity:0}));this.halo.rotation.x=Math.PI/2;this.halo.position.y=1.06;this.scene.add(this.halo);
      this.setHoles(0);this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);
    }
    resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;const distance=Math.max(6.7,5.8/(w/h));this.camera.position.set(0,2.55,distance);this.camera.lookAt(0,-.05,0);this.camera.updateProjectionMatrix();}
    setHoles(count){
      if(count===this.count)return;this.count=count;const T=THREE,r=.98,width=2*Math.PI*r;
      const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(width,0);shape.lineTo(width,.27);shape.lineTo(0,.27);shape.closePath();
      for(let i=0;i<count;i++){const hole=new T.Path();hole.absellipse((i+.5)*width/16,.13,.037,.037,0,Math.PI*2,true);shape.holes.push(hole);}
      const geometry=new T.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false,curveSegments:10,steps:1});
      // Subdivide the flat strip before bending, including its long boundary edges.
      const subdivided=this.subdivide(geometry,.075);geometry.dispose();
      const pos=subdivided.attributes.position,uv=subdivided.attributes.uv;
      for(let i=0;i<pos.count;i++){
        const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),theta=x/r-Math.PI/16;
        pos.setXYZ(i,(r+z)*Math.sin(-theta),y+.93,(r+z)*Math.cos(theta));uv.setXY(i,x/width,y+.7);
      }
      subdivided.computeVertexNormals();
      if(this.collar){this.pot.remove(this.collar);this.collar.geometry.dispose();}
      this.collar=new T.Mesh(subdivided,this.clay);this.pot.add(this.collar);
    }
    subdivide(geometry,max){
      const p=geometry.attributes.position,out=[],uv=[];
      const split=(a,b,c,depth)=>{
        const lengths=[Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),Math.hypot(b[0]-c[0],b[1]-c[1],b[2]-c[2]),Math.hypot(c[0]-a[0],c[1]-a[1],c[2]-a[2])];
        const longest=Math.max(...lengths);if(longest<=max||depth>12){out.push(...a,...b,...c);uv.push(0,0,0,0,0,0);return;}
        const i=lengths.indexOf(longest),v=[a,b,c],start=v[i],end=v[(i+1)%3],other=v[(i+2)%3],m=start.map((n,j)=>(n+end[j])/2);
        split(start,m,other,depth+1);split(m,end,other,depth+1);
      };
      for(let i=0;i<p.count;i+=3)split([p.getX(i),p.getY(i),p.getZ(i)],[p.getX(i+1),p.getY(i+1),p.getZ(i+1)],[p.getX(i+2),p.getY(i+2),p.getZ(i+2)],0);
      const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(out,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return result;
    }
    measure(progress){
      this.bandProgress=progress;const T=THREE;if(this.band){this.scene.remove(this.band);this.band.geometry.dispose();this.band=null;}
      if(progress<=0)return;
      const geo=new T.CylinderGeometry(1.065,1.065,.13,96,1,true,0,Math.min(progress,1)*Math.PI*2);
      this.band=new T.Mesh(geo,this.measureMat);this.band.position.y=.82;this.scene.add(this.band);
    }
    setCarving(value){this.tool.visible=value;this.startMarker.visible=true;}
    stamp(){this.pulse=1;}
    render(dt){this.pot.rotation.y=this.angle;this.pulse=Math.max(0,this.pulse-dt*5);this.tool.position.z=1.67-this.pulse*.25;this.goldLight.intensity=this.glow*2;this.halo.material.opacity=this.glow*.7;this.renderer.render(this.scene,this.camera);}
  }
  window.PotteryView=PotteryView;
})();
