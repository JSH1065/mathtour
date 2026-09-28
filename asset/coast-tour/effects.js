(() => {
  'use strict';
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  class Animation {
    constructor(paused){this.paused=paused;this.active=false;this.raf=0;this.last=0;this.elapsed=0;}
    start(){this.stop();this.elapsed=0;this.last=0;this.active=true;this.raf=requestAnimationFrame(t=>this.frame(t));}
    frame(t){if(!this.active)return;const dt=this.last?Math.min(50,t-this.last):0;this.last=t;if(!this.paused()){this.elapsed+=dt;this.paint(dt);}this.raf=requestAnimationFrame(t=>this.frame(t));}
    stop(){this.active=false;cancelAnimationFrame(this.raf);}
  }
  function size(canvas){const r=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return {c,w:r.width,h:r.height};}
  class Boat extends Animation {
    constructor({paused,ready,phase}){super(paused);this.ready=ready;this.phase=phase;this.rig=document.getElementById('boatRig');this.sprite=document.getElementById('boatSprite');this.dest=document.getElementById('boatDestination');this.canvas=document.getElementById('boatWake');}
    begin(returning){this.returning=returning;this.finished=false;this.arriving=!returning;this.sprite.style.transform=returning?'scaleX(-1)':'';this.dest.style.opacity='0';super.start();this.paint(0);}
    paint(){
      const t=reduced?7000:this.elapsed,departDuration=1700,arriveStart=this.returning?2450:0,arriveDuration=2900;
      let x;
      if(this.returning&&t<departDuration){x=12-85*smooth(t/departDuration);}
      else if(t<arriveStart){x=-75;this.dest.style.opacity=String(smooth((t-departDuration)/650));}
      else{if(!this.arriving){this.arriving=true;this.sprite.style.transform='';this.dest.style.opacity='1';this.phase();}const p=smooth((t-arriveStart)/arriveDuration);x=-75+87*p;}
      const docked=t>=arriveStart+arriveDuration,bob=reduced?0:Math.sin(this.elapsed/580)*2;
      this.rig.style.left=x+'%';this.rig.style.transform=`translateY(${bob}px) rotate(${reduced?0:Math.sin(this.elapsed/950)*.22}deg)`;
      const {c,w,h}=size(this.canvas);c.clearRect(0,0,w,h);const left=x/100*w,y=h*.76+bob,bw=w*.52;
      // Anchor the feet to the illustrated dock using the background's cover transform.
      const scale=Math.max(w/1672,h/941),ox=(w-1672*scale)/2,oy=(h-941*scale)/2;
      const feet=this.returning?[[1205,515],[1380,535]]:[[1410,680],[1520,700]];
      document.querySelectorAll('#boatPassengers img').forEach((person,i)=>{
        person.style.width=130*scale+'px';person.style.height=160*scale+'px';
        person.style.left=ox+(feet[i][0]-65)*scale+'px';
        person.style.top=oy+(feet[i][1]-151)*scale+'px';
      });
      c.save();c.strokeStyle='#d0f3f4';c.globalAlpha=docked?.16:.35;c.lineWidth=2;
      for(let i=0;i<8;i++){const flow=reduced?0:(this.elapsed/40+i*7)%20;c.beginPath();c.ellipse(left+bw*.5,y+5+i*2,bw*(.31+i*.018)+flow,2+i*.7,0,0,Math.PI*2);c.stroke();}c.restore();
      if(docked&&!this.finished){this.finished=true;this.ready();}
    }
  }
  class Sunset extends Animation {
    constructor({paused,ready}){super(paused);this.ready=ready;this.canvas=document.getElementById('sunsetAtmosphere');this.night=document.getElementById('nightLayer');this.reward=document.getElementById('rewardLayer');this.success=false;this.successElapsed=0;}
    begin(seconds){this.current=this.target=seconds;this.success=false;this.successElapsed=0;this.notified=false;this.reward.style.opacity=0;super.start();this.paint(0);}
    setTime(seconds){this.target=seconds;if(reduced)this.current=seconds;}
    celebrate(){this.success=true;this.successElapsed=0;this.notified=false;}
    paint(dt){
      this.current+=(this.target-this.current)*(reduced?1:1-Math.exp(-dt/130));
      if(Math.abs(this.current-this.target)<.05)this.current=this.target;
      if(this.success)this.successElapsed+=dt;
      const a=CoastMath.atmosphere(this.current),reward=this.success?smooth((this.successElapsed-700)/2300):0;
      this.night.style.opacity=String(a.night);this.reward.style.opacity=String(reward);
      const {c,w,h}=size(this.canvas);c.clearRect(0,0,w,h);if(!w||!h)return;
      // Use the same centered cover transform as all three illustrated background plates.
      const W=1672,H=941,s=Math.max(w/W,h/H),ox=(w-W*s)/2,oy=(h-H*s)/2;
      const horizon=H*.530,r=21,sy=horizon+(2*a.sunProgress-1)*r,sx=W*a.sunX;
      c.save();c.translate(ox,oy);c.scale(s,s);
      if(sy-r<horizon&&!this.success){
        c.save();c.beginPath();c.rect(0,0,W,horizon);c.clip();
        const glow=c.createRadialGradient(sx,sy,r*.5,sx,sy,r*4);glow.addColorStop(0,'#ffedb9cc');glow.addColorStop(.3,'#ffd05c66');glow.addColorStop(1,'#f5a62b00');c.fillStyle=glow;c.beginPath();c.arc(sx,sy,r*4,0,Math.PI*2);c.fill();
        const sun=c.createRadialGradient(sx-r*.25,sy-r*.25,0,sx,sy,r);sun.addColorStop(0,'#ffffe8');sun.addColorStop(.8,'#fff4ac');sun.addColorStop(1,'#ffd160');c.fillStyle=sun;c.beginPath();c.arc(sx,sy,r,0,Math.PI*2);c.fill();c.restore();
        c.save();c.globalAlpha=.45*(1-smooth((a.sunProgress+.2)/1.3));c.fillStyle='#ffdd83';for(let i=0;i<28;i++){const y=horizon+7+i*3.6,flow=reduced?0:Math.sin(this.elapsed/530+i*1.1);c.fillRect(sx-(9+i*.8)+flow*5,y,(18+i*1.6)*(1+flow*.2),1.4);}c.restore();
      }
      if(this.success){
        const p=clamp(this.successElapsed/4500),starAlpha=smooth((this.successElapsed-250)/1400);
        for(let i=0;i<48;i++){const x=(Math.sin(i*78.233)*43758.54%1+1)%1*W,y=(Math.sin(i*27.137+3)*13741.13%1+1)%1*H*.43;
          const twinkle=reduced?.8:.45+.55*(Math.sin(this.elapsed/550+i)+1)/2;c.globalAlpha=starAlpha*twinkle;c.fillStyle=i%3?'#fff5d9':'#bce8ff';const sz=i%5===0?3:1.7;c.beginPath();c.arc(x,y,sz,0,Math.PI*2);c.fill();if(i%5===0){c.fillRect(x-sz*3,y-.7,sz*6,1.4);c.fillRect(x-.7,y-sz*3,1.4,sz*6);}}
        c.globalAlpha=1;
        if(!reduced&&p<1){for(let i=0;i<30;i++){const q=clamp((p-i*.008)/.76),x=W*(.75+(.42-.75)*q)+Math.sin(i*2.3+q*8)*55*(1-q),y=H*(.56-(Math.sin(q*Math.PI)*.36))-(i%5)*8;c.globalAlpha=Math.sin(q*Math.PI)*.8;c.fillStyle=i%2?'#ffe5a3':'#b9f5eb';c.beginPath();c.arc(x,y,2.2+(i%3),0,Math.PI*2);c.fill();}}
      }
      c.restore();c.globalAlpha=1;
      this.canvas.dataset.sunY=String(sy);this.canvas.dataset.night=String(a.night);this.canvas.dataset.reward=String(reward);
      if(this.success&&this.successElapsed>2600&&!this.notified){this.notified=true;this.ready();}
    }
  }
  window.CoastEffects={Boat,Sunset};
})();
