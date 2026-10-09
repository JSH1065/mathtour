/* Photo-inspired lattice, not a survey of the installation. Pure rules shared by game and QA. */
(function(root){
  'use strict';
  const bounds={minX:-2,maxX:4,minY:-1,maxY:6};
  const photo=[
    {id:'a',x:0,y:0,color:'black',name:'왼쪽 검은 돌'},
    {id:'b',x:1,y:0,color:'white',name:'뒤쪽 흰 돌'},
    {id:'c',x:1,y:1,color:'white',name:'가운데 흰 돌'},
    {id:'d',x:2,y:0,color:'black',name:'뒤쪽 검은 돌'},
    {id:'e',x:2,y:1,color:'black',name:'가운데 검은 돌'},
    {id:'f',x:2,y:2,color:'white',name:'오른쪽 흰 돌'},
    {id:'g',x:1,y:4,color:'white',name:'앞쪽에 떨어진 흰 돌'}
  ];
  const inside=(x,y)=>x>=bounds.minX&&x<=bounds.maxX&&y>=bounds.minY&&y<=bounds.maxY;
  const copy=s=>s.map(p=>({...p}));
  function initial(mode='photo'){return copy(mode==='practice'?photo.filter(p=>['a','b','d'].includes(p.id)):photo);}
  function moves(state){
    const occupied=new Map(state.map(p=>[`${p.x},${p.y}`,p])),out=[];
    for(const p of state)for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
      let x=p.x+dx,y=p.y+dy;
      while(inside(x,y)){
        const over=occupied.get(`${x},${y}`);
        if(over){
          const tx=x+dx,ty=y+dy;
          if(inside(tx,ty)&&!occupied.has(`${tx},${ty}`))out.push({id:p.id,over:over.id,from:{x:p.x,y:p.y},to:{x:tx,y:ty}});
          break; // Only the FIRST stone on this line can be jumped.
        }
        x+=dx;y+=dy;
      }
    }
    return out;
  }
  function equal(a,b){return a.id===b.id&&a.over===b.over&&a.to?.x===b.to?.x&&a.to?.y===b.to?.y;}
  function apply(state,move){
    const valid=moves(state).find(m=>equal(m,move));
    if(!valid)throw Error('이동할 수 없는 자리입니다.');
    return state.filter(p=>p.id!==valid.over).map(p=>p.id===valid.id?{...p,...valid.to}:{...p});
  }
  // Only occupancy affects solvability. Cache failed states; IDs and colors remain intact in returned moves.
  const failed=new Set();
  function solve(state){
    if(state.length===1)return [];
    const key=state.map(p=>`${p.x},${p.y}`).sort().join(';');
    if(failed.has(key))return null;
    for(const move of moves(state)){
      const rest=solve(apply(state,move));
      if(rest!==null)return [move,...rest];
    }
    failed.add(key);return null;
  }
  function restore(record){
    if(!record||record.version!==1||!['photo','practice'].includes(record.mode)||!Array.isArray(record.moves)||record.moves.length>6)return null;
    try{
      let state=initial(record.mode);const history=[copy(state)],validMoves=[];
      for(const raw of record.moves){
        const move=moves(state).find(m=>equal(m,raw));
        if(!move)return null;
        state=apply(state,move);history.push(copy(state));validMoves.push(move);
      }
      return {mode:record.mode,state,history,moves:validMoves};
    }catch(_){return null;}
  }
  const api={bounds,photo,initial,copy,moves,apply,solve,restore};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.BadukPuzzle=api;
})(typeof window!=='undefined'?window:globalThis);
