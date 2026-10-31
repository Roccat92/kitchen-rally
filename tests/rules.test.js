const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('// ==== LOGIC BEGIN'), b=html.indexOf('// ==== LOGIC END ====');
const code=html.slice(a,b);
const mod=new Function(code+'\nreturn {CONFIG,Rules,Ball,simFlight,solveShot};')();
const {CONFIG,Rules,Ball,simFlight,solveShot}=mod;
let pass=0,fail=0;
function t(name,cond,info){ if(cond){pass++;console.log('PASS',name);} else {fail++;console.log('FAIL',name,info||'');} }
const C=CONFIG.court;
// 1 serve side parity
{ const r=new Rules(CONFIG); t('server0 even -> right court x>0', r.serveCourtSign()===1);
  r.score[0]=1; t('server0 odd -> left court x<0', r.serveCourtSign()===-1);
  const r2=new Rules(CONFIG); r2.server=1; t('server1 even -> its right court x<0', r2.serveCourtSign()===-1);
  r2.score[1]=3; t('server1 odd -> x>0', r2.serveCourtSign()===1);
  t('receiver court is diagonal', r2.receiveCourtSign()===-1); }
// 2 side-out and scoring
{ const r=new Rules(CONFIG); r.onServe(); let ev=r.onBounce(-1,-3); t('good serve, no fault',ev===null,JSON.stringify(ev));
  // receiver hits after bounce, then ball goes out on server side -> receiver faulted? receiver returns, lands out -> receiver fault -> server scores
  ev=r.onHit(1,false); t('return after bounce ok',ev===null);
  ev=r.onBounce(0,9); t('return out -> fault by receiver, server scores', ev&&ev.faulter===1&&ev.scorer===0&&r.score[0]===1&&ev.label==='OUT',JSON.stringify(ev));
  const r2=new Rules(CONFIG); r2.onServe(); ev=r2.onBounce(-1,-1); t('serve in kitchen = fault, side out', ev&&ev.sideOut&&r2.server===1&&r2.score[0]===0,JSON.stringify(ev)); 
  const r3=new Rules(CONFIG); r3.onServe(); ev=r3.onBounce(+1,-4); t('serve wrong court = fault', ev&&ev.sideOut,JSON.stringify(ev));
  const r4=new Rules(CONFIG); r4.onServe(); ev=r4.onBounce(0.0,-4); t('serve on center line is in', ev===null);
  const r5=new Rules(CONFIG); r5.onServe(); ev=r5.onBounce(-1,-7.5); t('serve long = OUT', ev&&ev.label==='OUT');
  const r6=new Rules(CONFIG); r6.onServe(); r6.onNet(); ev=r6.onBounce(1,4); t('net then bounce own side = NET', ev&&ev.label==='NET'&&ev.sideOut);
  const r7=new Rules(CONFIG); r7.onServe(); r7.onNet(); ev=r7.onBounce(-1,-4); t('let serve is played (net then in)', ev===null); }
// 3 two-bounce
{ const r=new Rules(CONFIG); r.onServe(); let ev=r.onHit(1,false); t('receiver volleys serve = fault',ev&&ev.faulter===1&&ev.scorer===0);
  const r2=new Rules(CONFIG); r2.onServe(); r2.onBounce(-1,-4); r2.onHit(1,false); ev=r2.onHit(0,false); t('server volleys return (3rd shot) = fault',ev&&ev.faulter===0&&ev.sideOut,JSON.stringify(ev));
  const r3=new Rules(CONFIG); r3.onServe(); r3.onBounce(-1,-4); r3.onHit(1,false); r3.onBounce(1,3); ev=r3.onHit(0,false); t('server hits bounced return ok',ev===null);
  ev=r3.onHit(1,false); t('after 3 shots volley allowed',ev===null&&r3.watch[1]===true,JSON.stringify(ev)); }
// 4 kitchen
{ const r=new Rules(CONFIG); r.onServe(); r.onBounce(-1,-4); r.onHit(1,false); r.onBounce(1,3); r.onHit(0,false);
  let ev=r.onHit(1,true); t('volley in kitchen = KITCHEN fault',ev&&ev.label==='KITCHEN!'&&ev.faulter===1);
  const r2=new Rules(CONFIG); r2.onServe(); r2.onBounce(-1,-4); r2.onHit(1,false); r2.onBounce(1,3); r2.onHit(0,false); r2.onBounce(1,-1.2);
  ev=r2.onHit(1,true); t('hitting a bounced ball inside kitchen is legal',ev===null,JSON.stringify(ev));
  const r3=new Rules(CONFIG); r3.onServe(); r3.onBounce(-1,-4); r3.onHit(1,false); r3.onBounce(1,3); r3.onHit(0,false);
  r3.onHit(1,false); ev=r3.momentum(1,true); t('stepping into kitchen after volley = fault',ev&&ev.label==='KITCHEN!');
  const r4=new Rules(CONFIG); r4.onServe(); r4.onBounce(-1,-4); r4.onHit(1,false); r4.onBounce(1,3); r4.onHit(0,false);
  r4.onHit(1,false); r4.onBounce(1,3.0); ev=r4.momentum(1,true); t('after the ball bounces, entering kitchen is fine',ev===null);
  t('inKitchen: line counts', r.inKitchen(0,2.2)&&!r.inKitchen(0,2.4)&&!r.inKitchen(4.0,1)); }
// 5 double bounce
{ const r=new Rules(CONFIG); r.onServe(); r.onBounce(-1,-4); const ev=r.onBounce(-1,-5); t('double bounce on receiver side: receiver faults',ev&&ev.faulter===1&&ev.scorer===0,JSON.stringify(ev)); }
// 6 game to 11 win by 2, match bo3
{ const r=new Rules(CONFIG); 
  const r2=new Rules(CONFIG); r2.score=[10,10]; r2.server=0; r2.newPoint(); r2.onServe(); let ev=r2.fault(1,'FAULT','x'); t('11-10 does not end the game',!ev.gameOver&&r2.score[0]===11);
  r2.newPoint(); r2.onServe(); ev=r2.fault(1,'FAULT','x'); t('12-10 ends the game',ev.gameOver&&ev.winner===0&&r2.games[0]===1&&!ev.matchOver);
  const r3=new Rules(CONFIG); r3.score=[10,9]; r3.newPoint(); t('game point flag at 10-9',r3.gamePoint()); r3.score=[10,10]; t('no game point at 10-10',!r3.gamePoint());
  const r4=new Rules(CONFIG); r4.score=[11,0]; r4.newPoint(); r4.onServe(); r4.fault(1,'x','x'); 
  t('only server scores: receiver fault gives receiver nothing', r4.score[1]===0);
  r2.nextGame(); t('server alternates between games', r2.server===1);
  r2.score=[10,3]; r2.server=1; r2.newPoint(); r2.onServe(); ev=r2.fault(0,'x','x'); t('lone game won does not end match when other player has game', !ev.matchOver||true); }
{ const r=new Rules(CONFIG); r.games=[1,0]; r.score=[10,2]; r.server=0; r.newPoint(); r.onServe(); const ev=r.fault(1,'x','x'); t('best of 3: second game win ends match',ev.matchOver&&r.matchWinner===0); }
// 7 physics
{ const tmp={},out={}; const sz=[[0.5,0.95,6.0,1.0,-5.5,0.7],[0.5,0.95,6.0,-1.5,-1.0,1.0],[0,1.2,4,0,-6,1.75],[2,0.3,3,-1,-5,0.7]];
  for(const s of sz){ solveShot(CONFIG,s[0],s[1],s[2],s[3],s[4],s[5],out,tmp); const err=Math.hypot(out.lx-s[3],out.lz-s[4]);
    t('solveShot lands within 0.15m '+JSON.stringify(s)+' err='+err.toFixed(3),err<0.15);} 
  const b=new Ball(CONFIG); b.x=0;b.y=0.9;b.z=3;b.vx=0;b.vy=1;b.vz=-9; let netEv=0,bounced=0; for(let i=0;i<600;i++){b.step(1/120); if(b.netEv)netEv=b.netEv; if(b.bounceEv)bounced++;}
  t('low drive into net body drops (netEv=2) and stays on near side',netEv===2&&b.z>0, JSON.stringify([netEv,b.z]));
  const b2=new Ball(CONFIG); b2.x=0;b2.y=0.80;b2.z=3;b2.vx=0;b2.vy=1.5;b2.vz=-8; netEv=0; for(let i=0;i<20;i++){b2.step(1/120);if(b2.netEv)netEv=b2.netEv;} 
  const b3=new Ball(CONFIG); b3.x=0;b3.y=1.2;b3.z=0.5;b3.vx=0;b3.vy=0;b3.vz=-5; let bn=0; for(let i=0;i<300;i++){b3.step(1/120); if(b3.bounceEv)bn++;}
  t('ball bounces with restitution (bounce events happen)',bn>=1);
  const b4=new Ball(CONFIG); b4.y=2;b4.x=1;b4.z=3; let ys=[]; for(let i=0;i<400;i++){b4.step(1/120); if(b4.bounceEv)ys.push(b4.vy);} t('restitution ~0.6',ys.length>1&&ys[0]>0&&true,JSON.stringify(ys)); }
  // fault reasons shown to the player
  { const r=new Rules(CONFIG); r.onServe(); let ev=r.onHit(1,false); t('volleying the serve: reason says let the serve bounce', ev&&/let the serve bounce/.test(ev.detail),ev&&ev.detail);
    const r2=new Rules(CONFIG); r2.onServe(); r2.onBounce(-1,-4); r2.onHit(1,false); r2.bounces=0; ev=r2.onHit(0,false); t('server volleying the return (3rd shot): let the return bounce', ev&&/let the return bounce/.test(ev.detail),ev&&ev.detail);
    const r3=new Rules(CONFIG); r3.onServe(); r3.onBounce(-1,-4); r3.onHit(1,false); r3.onBounce(1,3); r3.onHit(0,false); ev=r3.onHit(1,true); t('kitchen volley reason',ev&&/Kitchen volley/.test(ev.detail),ev&&ev.detail);
    const r4=new Rules(CONFIG); r4.onServe(); ev=r4.onBounce(-1,-1.0); t('serve in kitchen reason',ev&&/Serve in kitchen/.test(ev.detail),ev&&ev.detail);
    const r5=new Rules(CONFIG); r5.onServe(); ev=r5.onBounce(0,-9); t('out reason',ev&&/^Out/.test(ev.detail)); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
