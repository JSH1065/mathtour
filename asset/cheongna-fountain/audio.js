(function(root){
'use strict';
// Original procedural score. One AudioContext clock drives both music and the jets.
function create(){
  let ctx=null,master=null,enabled=false,sequence=null,preview=null,available=true,scheduled=0,generation=0;
  const beat=.6,voices=new Set();
  function ensure(){if(ctx)return ctx;const AC=root.AudioContext||root.webkitAudioContext;if(!AC){available=false;return null;}try{ctx=new AC();master=ctx.createGain();master.gain.value=enabled?.7:0;const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=4;master.connect(compressor);compressor.connect(ctx.destination);}catch(e){available=false;}return ctx;}
  async function unlock(){const c=ensure();if(!c)return false;try{await c.resume();return c.state==='running';}catch(e){return false;}}
  function setEnabled(value){enabled=value;const c=ensure();if(c)master.gain.setTargetAtTime(value?.7:0,c.currentTime,.03);if(value)unlock();return enabled;}
  function now(){return ctx?.state==='running'?ctx.currentTime:performance.now()/1000;}
  function tone(freq,when,duration,level=.12,type='sine',harmonic=true){if(!ctx)return;for(const [multiple,volume] of harmonic?[[1,1],[2,.18],[3,.045]]:[[1,1]]){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq*multiple;g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(level*volume,when+.012);g.gain.exponentialRampToValueAtTime(.0001,when+duration);o.connect(g);g.connect(master);o.start(when);o.stop(when+duration+.03);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();g.disconnect();};scheduled++;}}
  function stopVoices(){for(const o of voices){try{o.stop();}catch(e){}}voices.clear();}
  function stop(){generation++;sequence=null;preview=null;stopVoices();}
  function blockTone(event,start){const roots=[261.63,220,174.61,196,164.81,261.63],scale=[1,1.25,1.5,2];tone(roots[event.group%6]*scale[event.start%4]*2,start,.6*event.beats*.9,.105);if(event.beats===4)tone(roots[event.group%6]*1.5,start+.035,2.1,.055);}
  async function start(score,options={}){stop();const ticket=generation;await unlock();if(ticket!==generation)return false;const events=root.FountainRhythm.timeline(score);if(!events)return false;const total=root.FountainRhythm.TOTAL;const leadIn=Math.max(.12,options.leadIn||.12),opened=now(),origin=opened+leadIn,clock=ctx?.state==='running'?'audio':'wall';sequence={origin,opened,leadIn,clock,events,total,duration:total*beat};if(ctx?.state==='running'){
    if(leadIn>1)[523.25,783.99,1046.5].forEach((f,i)=>tone(f,opened+.2+i*.55,.9,.028));
    for(let n=0;n<total;n++){const t=origin+n*beat;tone(n%4===0?880:660,t,.045,n%4===0?.035:.018,'sine',false);if(n%4===0){tone([130.81,110,87.31,98,82.41,130.81][n/4],t,2.15,.1);tone([329.63,261.63,220,246.94,196,329.63][n/4],t+.03,2.05,.035);}}
    events.forEach(e=>blockTone(e,origin+e.at*beat));
    [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,origin+total*beat+i*.1,1.2,.065));
  }return true;}
  async function audition(beats){stop();const ticket=generation;await unlock();if(ticket!==generation)return;const origin=now()+.025;preview={origin,clock:ctx?.state==='running'?'audio':'wall',beats,duration:beats*beat};if(ctx?.state==='running')blockTone({beats,group:0,start:0},origin);}
  function cue(success=true){if(!ctx||ctx.state!=='running')return;const t=ctx.currentTime;[success?523.25:246.94,success?783.99:220].forEach((f,i)=>tone(f,t+i*.09,.25,.055));}
  function sample(){if(sequence){const elapsed=(sequence.clock==='audio'?ctx.currentTime:performance.now()/1000)-sequence.origin;if(elapsed<0)return {kind:'waiting',progress:Math.max(0,1+elapsed/sequence.leadIn),remaining:-elapsed};const at=elapsed/beat;if(at>=sequence.total)return {kind:'finished'};const e=[...sequence.events].reverse().find(e=>at>=e.at)||sequence.events[0];return {kind:'show',beats:e.beats,progress:(at-e.at)/e.beats,beat:Math.floor(at),group:e.group,elapsed};}if(preview){const elapsed=(preview.clock==='audio'?ctx.currentTime:performance.now()/1000)-preview.origin;if(elapsed>preview.duration){preview=null;return {kind:'idle'};}return {kind:'preview',beats:preview.beats,progress:Math.max(0,elapsed/preview.duration)};}return {kind:'idle'};}
  function finish(){sequence=null;preview=null;}
  return {unlock,setEnabled,start,audition,cue,stop,finish,sample,inspect:()=>({enabled,available,state:ctx?.state||'uninitialized',scheduled,activeVoices:voices.size,playing:!!sequence,beatSeconds:beat})};
}
root.FountainAudio={create};
})(window);
