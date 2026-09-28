(function(root){
  'use strict';
  const TAU=Math.PI*2, LENGTH=288, SPACING=18, COUNT=LENGTH/SPACING;
  class Pottery {
    constructor(){this.reset();}
    reset(){this.phase='measure';this.guess=0;this.turn=0;this.furthest=0;this.holes=0;}
    measure(){if(this.phase==='measure')this.phase='plan';}
    choose(n){if(this.phase==='plan'&&Number.isInteger(n))this.guess=Math.max(0,Math.min(24,n));return this.guess;}
    check(){
      if(this.phase!=='plan')return null;
      const used=this.guess*SPACING,result={ok:used===LENGTH,used,remaining:LENGTH-used,count:this.guess};
      if(result.ok){this.phase='carve';this.holes=1;}
      return result;
    }
    rotate(delta){
      if(this.phase!=='carve'||!Number.isFinite(delta))return {added:0,done:false};
      const before=this.holes;
      this.turn=Math.max(0,Math.min(TAU,this.turn+delta));
      this.furthest=Math.max(this.furthest,this.turn);
      this.holes=Math.min(COUNT,1+Math.floor((this.furthest+1e-8)/(TAU/COUNT)));
      if(this.turn>=TAU-1e-8){this.phase='complete';this.turn=TAU;}
      return {added:this.holes-before,done:this.phase==='complete'};
    }
    snapshot(){return {phase:this.phase,guess:this.guess,turn:this.turn,furthest:this.furthest,holes:this.holes};}
    restore(s){
      this.reset();
      if(!s||!['plan','carve','complete'].includes(s.phase))return;
      this.measure();this.choose(s.guess);
      if(s.phase==='plan')return;
      if(s.guess!==COUNT)return;
      this.check();
      if(!Number.isFinite(s.turn)||!Number.isFinite(s.furthest)||s.turn<0||s.furthest<s.turn||s.furthest>TAU)return;
      if(s.phase==='complete'){
        if(Math.abs(s.turn-TAU)<1e-7&&s.holes===COUNT)this.rotate(TAU);
        return;
      }
      // Restore furthest progress first; backward turns must not erase existing holes.
      if(s.furthest>=TAU-1e-8)return;
      this.rotate(s.furthest);this.rotate(s.turn-s.furthest);
    }
  }
  const api={Pottery,TAU,LENGTH,SPACING,COUNT};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PotteryMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
