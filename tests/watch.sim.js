// Watch-mode (AI vs AI) simulation test. Needs: npm i playwright-core, and Chrome (CHROME=/path, default /usr/bin/google-chrome).
// usage: node tests/watch.sim.js [matches=2]        env: URL (default: serve ./index.html locally), THREE_LOCAL=/path/three.module.js (offline)
// Checks per singles/doubles x easy/normal/hard: invariants hold, no console errors, average rally 5-15 shots, no endless rallies.
const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const matches = +(process.argv[2] || 2);
(async () => {
  let url = process.env.URL, srv;
  if (!url) { srv = http.createServer((q, s) => { s.setHeader('content-type', 'text/html'); s.end(fs.readFileSync(path.join(__dirname, '..', 'index.html'))); }); await new Promise(r => srv.listen(0, r)); url = 'http://localhost:' + srv.address().port + '/'; }
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  let fail = 0;
  for (const [mode, dr, db] of [['doubles', 'normal', 'normal'], ['singles', 'normal', 'normal'], ['doubles', 'easy', 'hard'], ['singles', 'hard', 'hard'], ['singles', 'easy', 'easy']]) {
    const c = await b.newContext({ viewport: { width: 640, height: 400 } }); await c.addInitScript(() => localStorage.setItem('kr_seen', '1')); const p = await c.newPage();
    const errs = []; p.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.text()); }); p.on('pageerror', e => errs.push(e.message));
    if (process.env.THREE_LOCAL) await p.route('**/three.module.js', r => r.fulfill({ path: process.env.THREE_LOCAL, contentType: 'application/javascript' }));
    await p.goto(url); await p.waitForFunction(() => window.__KR);
    const st=await p.evaluate(([dr,db,matches,mode])=>{
 const g=__KR.game; g.setMode(mode); g.setWatch(true); g.setWatchDiff(0,dr); g.setWatchDiff(1,db); g.onAction('enter');
 const r=g.rules, bad=[], st={watch:g.watch,state0:g.state,ctl0:!!g.ctl[0],points:0,faults:{},shots:[],matches:0,games:0,sameTeamConsecutive:0,smashes:0,popups:0,netFlaws:0,outFlaws:0,popFlaws:0,aiWin:[0,0],frames:0,youVisible:null,humanShots:0};
 let cur=0;
 const so=g.strike.bind(g);
 g.strike=function(pl,spec){ cur++; if(r.lastHitter>=0 && (r.lastHitter&1)===(pl.id&1)) st.sameTeamConsecutive++;
   if(spec.smash) st.smashes++; if(spec.flaw==='net')st.netFlaws++; if(spec.flaw==='out')st.outFlaws++; if(spec.flaw==='pop'){st.popFlaws++;}
   return so(pl,spec); };
 const rs=g.releaseServe.bind(g); g.releaseServe=function(){ cur=1;
   if((r.serverId&1)!==r.server) bad.push('server not on serving team');
   const sv=g.players[r.serverId]; if(Math.sign(sv.x)!==r.serveCourtSign()) bad.push('server not in his court');
   if(Math.abs(g.ball.x)>9||Math.abs(g.ball.z)>20) bad.push('ball far away');
   return rs(); };
 const hf=g.handleFault.bind(g);
 g.handleFault=function(ev){ st.points++; const k=ev.detail.slice(0,26); st.faults[k]=(st.faults[k]||0)+1; st.shots.push(cur);
   const hb={server:r.server}; const out=hf(ev);
   if(ev.scorer>=0 && ev.scorer!==hb.server) bad.push('non-server scored'); return out; };
 for(let i=0;i<60*60*90 && st.matches<matches;i++){
   g.update(1/60); st.frames++;
   if(!Number.isFinite(g.ball.x+g.ball.y+g.ball.z)) { bad.push('NaN ball'); break; }
   for(const q of g.players) if(Math.abs(q.x)>8||Math.abs(q.z)>12) { bad.push('player out of bounds '+q.id); }
   if(g.state==='rally' && cur>200){ bad.push('rally>200'); g.onAction('enter'); }
   if(g.state==='end'){ st.matches++; st.aiWin[r.matchWinner>=0?r.matchWinner:0]++; g.onAction('enter'); }
 }
 const sh=st.shots.slice().sort((a,b)=>a-b), n=sh.length;
 st.avgShots=+(sh.reduce((a,b)=>a+b,0)/n).toFixed(2); st.median=sh[n>>1]; st.p10=sh[Math.floor(n*0.1)]; st.p90=sh[Math.floor(n*0.9)]; st.max=sh[n-1];
 st.pctIn5to15=+(100*sh.filter(x=>x>=5&&x<=15).length/n).toFixed(0); st.pctUnder5=+(100*sh.filter(x=>x<5).length/n).toFixed(0); st.pctOver15=+(100*sh.filter(x=>x>15).length/n).toFixed(0);
 st.hist={}; for(const x of st.shots) st.hist[x]=(st.hist[x]||0)+1; delete st.shots; st.simMinutes=+(st.frames/3600).toFixed(1); st.bad=bad.slice(0,6); st.badCount=bad.length; st.finalState=g.state;
 st.youTagDisplay=getComputedStyle(document.getElementById('youTag')).display;
 return st; },[dr,db,matches,mode]);

    const ok = st.badCount === 0 && errs.length === 0 && st.avgShots >= 5 && st.avgShots <= 15 && st.max < 200 && st.watch && st.ctl0 && st.youTagDisplay === 'none' && st.points >= 50;
    console.log(ok ? 'PASS' : 'FAIL', mode, dr + ' vs ' + db, JSON.stringify({ points: st.points, avgShots: st.avgShots, median: st.median, p90: st.p90, max: st.max, pctIn5to15: st.pctIn5to15, bad: st.bad, errs: errs.slice(0, 2) }));
    if (!ok) fail++; await c.close();
  }
  await b.close(); if (srv) srv.close(); console.log(fail ? 'FAILED' : 'ALL WATCH SIM CHECKS PASSED'); process.exit(fail ? 1 : 0);
})();
