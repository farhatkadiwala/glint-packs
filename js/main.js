import { PACKS, RAR, CHARS } from './data.js';
import { ART, renderMascots } from './mascots.js';
import { Face } from './faces.js';
import { S, ease, rnd, reduce } from './motion.js';

/* ================= layout ================= */
let VW,VH,CX,CY,cardW,packS,mobile;
const dpr=Math.min(2,devicePixelRatio||1);
const cvS=document.getElementById('streams'),cvC=document.getElementById('confetti');
const gS=cvS.getContext('2d'),gC=cvC.getContext('2d');
function layout(){
  VW=innerWidth;VH=innerHeight;CX=VW/2;CY=VH*.46;mobile=VW<720;
  if(mobile){cardW=Math.min((VW-32-24)/3,170);packS=Math.min(VW*.62,250)/300}
  else{cardW=Math.min(VW*.152,272,VH*.36*.707);packS=Math.min(Math.max(VW*.19,230),VH*.5*.72,330)/300}
  for(const c of[cvS,cvC]){c.width=VW*dpr;c.height=VH*dpr}
  gS.setTransform(dpr,0,0,dpr,0,0);gC.setTransform(dpr,0,0,dpr,0,0);
  if(state==='row')toRow(false);
}
function rowSlots(){
  const gap=cardW*(mobile?.08:.115),s=[];
  const rots=[-3.2,2.2,-1.2,2.8,-2.4],dys=[8,-5,0,-7,5];
  if(!mobile){const tot=5*cardW+4*gap;for(let i=0;i<5;i++)s.push({x:-tot/2+cardW/2+i*(cardW+gap),y:dys[i]*cardW/240,r:rots[i]})}
  else{const h=cardW*1.413,gy=gap*1.6;
    for(let i=0;i<5;i++){const row=i<3?0:1,n=row?2:3,col=row?i-3:i,tot=n*cardW+(n-1)*gap;
      s.push({x:-tot/2+cardW/2+col*(cardW+gap),y:(row?.5:-.5)*(h+gy)-VH*.02,r:rots[i]*.8})}}
  return s;
}

/* ================= pack ================= */
const packLayer=document.getElementById('packLayer');
let pack=null,packIdx=0;
function zig(n,y0,h,top){const pts=[];for(let i=0;i<=n;i++){const x=i/n*300;pts.push(`${x.toFixed(1)}px ${(i%2?y0+(top?h:-h):y0).toFixed(1)}px`)}return pts}
function jag(y,amp,seed){const p=[];let s=seed;const r=()=>{s=(s*9301+49297)%233280;return s/233280};for(let x=0;x<=300;x+=6+r()*6)p.push(`${Math.min(300,x).toFixed(1)}px ${(y+(r()-.5)*amp*2).toFixed(1)}px`);p.push('300px '+y+'px');return p}
function barcode(){let x=0,s='';while(x<96){const w=[1,1,2,1,3,2][Math.random()*6|0];if(Math.random()>.45)s+=`<rect x="${x}" y="0" width="${w}" height="30"/>`;x+=w+1}return `<svg viewBox="0 0 96 30" preserveAspectRatio="none" fill="#111">${s}</svg>`}
function makePack(){
  const P=PACKS[packIdx%PACKS.length];packIdx++;
  const el=document.createElement('div');el.className='pack-pos grab';el.style.setProperty('--pc',P.c);
  const seed=Math.random()*1e5|0;
  const bodyClip=`polygon(${[...jag(56,2.6,seed),...zig(50,416,7,false).reverse()].join(',')})`;
  const lipClip=`polygon(${[...jag(51,3.4,seed+7),'300px 70px','0px 70px'].join(',')})`;
  const stripClip=`polygon(${[...zig(50,0,7,true),'300px 62px','0px 62px'].join(',')})`;
  let slices='';const N=30;
  for(let i=0;i<N;i++)slices+=`<div class="slice" style="left:${i*10}px"><div class="foil-bg" style="--off:${-i*10}px;clip-path:${stripClip}"><div class="tear-label">TEAR HERE →</div></div></div>`;
  el.innerHTML=`<div class="pack-3d">
    <div class="pack-side pack-front">
      <div class="pack-lip" style="clip-path:${lipClip}"></div>
      <div class="pack-body" style="clip-path:${bodyClip}"><div class="foil-bg"></div>
        <div class="pk-word">glint</div><div class="pk-var">${P.name}</div>
        <div class="pk-mascot"><img alt="" src="${ART.cloud?.src||''}"></div>
        <div class="pk-foot"><span>Card pack</span><span>5 cards</span></div><div class="sheen"></div></div>
      <div class="strip">${slices}</div>
    </div>
    <div class="pack-side pack-back" style="clip-path:polygon(${[...zig(50,0,7,true),...zig(50,416,7,false).reverse()].join(',')})">
      <div class="foil-bg"></div><div class="bk-seam"></div>
      <div class="bk-word">glint</div>
      <div class="bk-copy">5 collectible cards.<br>One foil in every pack.<br>Tear along the top edge.</div>
      <div class="bk-bar">${barcode()}<span>0 41983 20577 4</span></div>
    </div></div><div class="pack-shadow"></div>`;
  packLayer.appendChild(el);
  const mascotBox=el.querySelector('.pk-mascot');
  const face=ART.cloud?new Face(mascotBox,ART.cloud,244):null;
  pack={el,P,p3:el.querySelector('.pack-3d'),shadow:el.querySelector('.pack-shadow'),
    slices:[...el.querySelectorAll('.slice')],strip:el.querySelector('.strip'),sheen:el.querySelector('.pack-body .sheen'),
    label:[...el.querySelectorAll('.tear-label')],face,
    x:new S(0,120,18),y:new S(0,120,18),rx:new S(0,140,16),ry:new S(0,140,16),rz:new S(0,140,16),spin:0,
    progress:0,shake:0,fall:null,fly:null,born:performance.now()};
  bindPack(pack);
  return pack;
}
function placeSlices(pk){
  const f=pk.progress*300,n=pk.slices.length;
  // slices fully left of the front are peeled; chain them from the front leftwards
  let px=f,py=0,j=0;
  for(let i=n-1;i>=0;i--){
    const sl=pk.slices[i],left=i*10;
    if(left+10<=f+.01){
      j++;const a=Math.min(.17*j,2.5)*Math.min(1,pk.progress*4);
      const lx=px-10*Math.cos(a),ly=py-10*Math.sin(a);
      sl.style.transform=`translate(${(lx-left).toFixed(2)}px,${ly.toFixed(2)}px) rotate(${a}rad)`;
      px=lx;py=ly;
    }else sl.style.transform='';
  }
}
function bindPack(pk){
  const el=pk.el;let drag=null;
  el.addEventListener('pointerdown',e=>{
    if(state!=='pack'||pk.enter)return;
    const r=el.getBoundingClientRect(),ly=(e.clientY-r.top)/r.height;
    if(ly>.3){pk.shake=1;pk.label.forEach(l=>{l.classList.remove('pulse');void l.offsetWidth;l.classList.add('pulse')});return}
    drag={x:e.clientX};try{el.setPointerCapture(e.pointerId)}catch(_){} /* pointer may already be gone */el.classList.add('grabbing');pk.face?.set('squint');
  });
  el.addEventListener('pointermove',e=>{
    const r=el.getBoundingClientRect();
    pk.hx=(e.clientX-r.left)/r.width-.5;pk.hy=(e.clientY-r.top)/r.height-.5;
    if(!drag||state!=='pack')return;
    const dx=e.clientX-drag.x;drag.x=e.clientX;
    if(dx>0){pk.progress=Math.min(1,pk.progress+dx/(r.width*.94));pk.tearing=performance.now();sparkAt(pk)}
    if(pk.progress>=.985)completeTear(pk);
  });
  const end=()=>{if(!drag)return;drag=null;el.classList.remove('grabbing');if(state==='pack')pk.face?.set('idle')};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  el.addEventListener('pointerleave',()=>{pk.hx=pk.hy=0});
}
function packRect(pk){ // screen coords of pack centre + opening
  const s=packS,x=CX+pk.x.v,y=CY+pk.y.v;
  return {x,y,s,top:y-208*s,openY:y+(-208+56)*s,frontX:x+(-150+pk.progress*300)*s};
}
function sparkAt(pk){
  if(reduce)return;const R=packRect(pk);
  for(let i=0;i<3;i++)parts.push({x:R.frontX,y:R.openY-4*R.s,vx:rnd(-60,160),vy:rnd(-260,-60),g:700,life:rnd(.25,.5),age:0,
    kind:'spark',size:rnd(2,4.5),rot:0,vr:0,col:['#FFD43B','#FF9F43','#FFF3BF','#FF6B3D'][i%4],flip:0,flipV:0});
}
function completeTear(pk){
  if(state!=='pack')return;state='opening';pk.progress=1;placeSlices(pk);
  pk.el.classList.remove('grab','grabbing');
  pk.face?.set('happy');
  const R=packRect(pk);
  pk.fly={vx:rnd(260,380)*R.s,vy:-rnd(520,640)*R.s,vr:rnd(380,520),x:0,y:0,r:0};
  burst(R.x,R.openY,R.s);
  spawnCards(pk);
  setTimeout(()=>{pk.fall={t0:performance.now(),dir:Math.random()<.5?-1:1}},440);setTimeout(()=>{packLayer.style.zIndex=1},640);
}
function tearAuto(){ // keyboard
  if(state!=='pack'||!pack||pack.enter||pack.auto)return;const pk=pack;pk.auto=true;pk.face?.set('squint'); // one run per pack (key repeat used to stack loops)
  const t0=performance.now(),p0=pk.progress;const step=now=>{if(state!=='pack'||pack!==pk)return;const t=Math.min(1,(now-t0)/700);pk.progress=p0+(1-p0)*ease.ioc(t);pk.tearing=now;if(t<1){sparkAt(pk);requestAnimationFrame(step)}else completeTear(pk)};requestAnimationFrame(step);
}

/* ================= cards ================= */
const cardsLayer=document.getElementById('cardsLayer');
let cards=[];
function makeCard(ch){
  const el=document.createElement('div');el.className='card-pos';
  el.innerHTML=`<div class="card r-${ch.rar}" style="--card:${ch.card};--cink:${ch.ink}" tabindex="0" aria-label="${ch.name}, ${RAR[ch.rar].replace(/^\S+ /,'')}">
    <div class="art ${ch.art}"><div class="mascot"><img alt="" src="${ART[ch.id]?.src||''}"></div></div>
    <div class="meta"><div class="name">${ch.name}</div><div class="chip">${ch.type}</div></div>
    <div class="rule"></div>
    <div class="foot"><span>No. ${ch.no}/120</span><span class="rar">${RAR[ch.rar]}</span></div>
    <div class="sheen"></div><div class="foil"></div><div class="glare"></div></div>`;
  cardsLayer.appendChild(el);
  const inner=el.firstElementChild,mascot=el.querySelector('.mascot');
  const c={ch,el,inner,mascot,face:ART[ch.id]?new Face(mascot,ART[ch.id],250):null,
    x:new S(0,150,19),y:new S(0,150,19),r:new S(0,150,19),s:new S(.8,170,20),rx:new S(0,200,18),ry:new S(0,200,18),lift:new S(0,260,22),
    px:.5,py:.5,hover:false,bob:Math.random()*6};
  inner.addEventListener('pointerenter',()=>{if(state!=='row')return;c.hover=true;c.face?.set(ch.hover);el.style.zIndex=10;inner.style.setProperty('--go',1)});
  inner.addEventListener('pointermove',e=>{const r=inner.getBoundingClientRect();c.px=(e.clientX-r.left)/r.width;c.py=(e.clientY-r.top)/r.height});
  const leave=()=>{c.hover=false;c.px=c.py=.5;c.face?.set('idle');el.style.zIndex='';inner.style.setProperty('--go',0)};
  inner.addEventListener('pointerleave',leave);
  inner.addEventListener('focus',()=>{if(state==='row'){c.hover=true;c.face?.set(ch.hover);el.style.zIndex=10;inner.style.setProperty('--go',1)}});
  inner.addEventListener('blur',leave);
  return c;
}
function spawnCards(pk){
  const order=[...CHARS].sort(()=>Math.random()-.5);
  // ultra rare tends to come out first, like a reveal
  cards=order.map(makeCard);
  const base=(packS*300*.8)/cardW;
  cards.forEach((c,i)=>{
    c.x.snap(pk.x.v+rnd(-6,6));c.y.snap(pk.y.v+30*packS);c.r.snap(rnd(-3,3));c.s.snap(base);c.ry.snap(0);
    c.el.style.zIndex=i;
    setTimeout(()=>{ // burst out of the opening
      const k=i-2;c.x.k=c.y.k=90;c.x.d=c.y.d=12;
      c.x.t=pk.x.v+k*cardW*rnd(.5,.66);c.y.t=pk.y.v-150*packS-cardW*rnd(.05,.35)-Math.abs(k)*-cardW*.08;
      c.r.t=k*9+rnd(-6,6);c.s.t=base*1.05;c.ry.t=rnd(-28,28);c.rx.t=rnd(-14,14);
    },60+i*85);
  });
  setTimeout(()=>toRow(true),920);
}
function toRow(stagger){
  const sl=rowSlots();state='row';
  cards.forEach((c,i)=>{
    const go=()=>{c.x.k=c.y.k=160;c.x.d=c.y.d=19;c.x.t=sl[i].x;c.y.t=sl[i].y;c.r.t=sl[i].r;c.s.t=1;c.rx.t=0;c.ry.t=0};
    stagger?setTimeout(go,i*70):go();
  });
  if(stagger)setTimeout(()=>{if(state==='row')btn.classList.add('on')},700); // swapped before it landed: don't show over the new pack
}
const btn=document.getElementById('again');
btn.addEventListener('click',()=>{
  if(state!=='row')return;state='swapping';btn.classList.remove('on');
  cards.forEach((c,i)=>setTimeout(()=>{c.exit={t0:performance.now(),vx:rnd(-120,120),vr:rnd(-50,50)};c.face?.set('happy')},i*45));
  setTimeout(()=>{cards.forEach(c=>c.el.remove());cards=[];enterPack()},620);
});
function enterPack(){
  packLayer.style.zIndex=3;
  if(pack)pack.el.remove();
  const pk=makePack();state='pack';
  pk.enter={t0:performance.now(),dur:1150};
  pk.x.snap(VW*.62);pk.ry.snap(0);
}

/* ================= particles ================= */
let parts=[],streams=null;
const CONF=['#FF5A5A','#FF9F43','#FFD43B','#51CF66','#339AF0','#7950F2','#F06595','#FFFFFF','#22B8CF'];
const RAINBOW=['#FF6B6B','#FFA94D','#FFE066','#8CE99A','#74C0FC','#B197FC','#F783AC'];
function burst(x,y,s){
  if(!reduce)streams={t0:performance.now(),x,y,s};
  const n=reduce?40:170;
  for(let i=0;i<n;i++){
    const a=rnd(-1.35,1.35)+rnd(-.1,.1),sp=rnd(420,1150)*Math.max(.7,s);
    const kind=Math.random()<.5?'rect':Math.random()<.6?'circ':'star';
    parts.push({x:x+rnd(-60,60)*s,y:y+rnd(-6,6),vx:Math.sin(a)*sp,vy:-Math.cos(a)*sp,g:900,life:rnd(3.5,6),age:0,kind,
      size:kind==='rect'?rnd(5,9):kind==='circ'?rnd(2.5,4.5):rnd(4,7),rot:rnd(0,6),vr:rnd(-8,8),col:CONF[i%CONF.length],flip:rnd(0,6),flipV:rnd(4,12),sway:rnd(0,6)});
  }
}
function drawStar(g,r){g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*.12,-r*.12,r,0);g.quadraticCurveTo(r*.12,r*.12,0,r);g.quadraticCurveTo(-r*.12,r*.12,-r,0);g.quadraticCurveTo(-r*.12,-r*.12,0,-r);g.fill()}
function drawStreams(now){
  gS.clearRect(0,0,VW,VH);if(!streams)return;
  const age=(now-streams.t0)/1000;if(age>2.4){streams=null;return}
  const {x,y}=streams,s=Math.max(.75,streams.s);
  const N=21,spread=1.12,Lmax=Math.min(VH*.5,560)*Math.max(.8,s);
  const grow=ease.oc(Math.min(age/.6,1)),L=grow*Lmax;
  const tail=age>.75?ease.ic(Math.min((age-.75)/1.35,1)):0,start=18*s+tail*L;
  const alpha=1-Math.max(0,(age-1.7)/.7);if(L-start<4)return;
  gS.save();gS.globalAlpha=Math.max(0,alpha);gS.filter='blur(.6px)';
  const step=7,ph=age*15,half=spread/(N-1);
  for(let i=0;i<N;i++){
    const a=-spread+2*spread*i/(N-1);
    const L1=[],R1=[];
    for(let d=start;d<=L;d+=step){
      const amp=Math.min(d*.07,11*s),w=Math.sin(d*.075-ph)*amp;
      const a0=a-half*1.02,a1=a+half*1.02,ax=a+w/Math.max(d,1)*.9;
      L1.push([x+Math.sin(a0+ (ax-a))*d,y-Math.cos(a0+(ax-a))*d]);
      R1.push([x+Math.sin(a1+(ax-a))*d,y-Math.cos(a1+(ax-a))*d]);
    }
    if(L1.length<2)continue;
    gS.fillStyle=RAINBOW[i%RAINBOW.length];gS.beginPath();gS.moveTo(...L1[0]);
    for(const p of L1)gS.lineTo(...p);for(let k=R1.length-1;k>=0;k--)gS.lineTo(...R1[k]);gS.closePath();gS.fill();
  }
  // soft fade at the root so it reads as light coming out of the pack
  gS.globalCompositeOperation='destination-out';gS.filter='none';
  const rg=gS.createRadialGradient(x,y,0,x,y,start+70*s);rg.addColorStop(0,'rgba(0,0,0,1)');rg.addColorStop(Math.min(.99,start/(start+70*s)+.01),'rgba(0,0,0,.9)');rg.addColorStop(1,'rgba(0,0,0,0)');
  gS.fillStyle=rg;gS.fillRect(x-L,y-L,2*L,2*L);
  // fade the tips
  const tg=gS.createRadialGradient(x,y,L*.72,x,y,L);tg.addColorStop(0,'rgba(0,0,0,0)');tg.addColorStop(1,'rgba(0,0,0,.85)');gS.fillStyle=tg;gS.fillRect(x-L,y-L,2*L,2*L);
  gS.restore();
}
function drawParts(dt){
  gC.clearRect(0,0,VW,VH);
  parts=parts.filter(p=>p.age<p.life&&p.y<VH+40);
  for(const p of parts){
    p.age+=dt;const drag=Math.exp(-(p.kind==='spark'?3:2.4)*dt);
    p.vx*=drag;p.vy=p.vy*drag+p.g*dt;
    if(p.kind!=='spark'){const term=150;if(p.vy>term)p.vy=term;p.vx+=Math.sin(p.age*3+p.sway)*20*dt}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;p.flip+=p.flipV*dt;
    const fade=Math.min(1,(p.life-p.age)/.6);
    gC.save();gC.globalAlpha=fade;gC.translate(p.x,p.y);gC.rotate(p.rot);gC.fillStyle=p.col;
    if(p.kind==='rect'){gC.scale(1,Math.cos(p.flip));gC.beginPath();gC.roundRect(-p.size/2,-p.size*.32,p.size,p.size*.64,1.2);gC.fill()}
    else if(p.kind==='circ'){gC.scale(Math.cos(p.flip)*.4+.6,1);gC.beginPath();gC.arc(0,0,p.size,0,7);gC.fill()}
    else if(p.kind==='star'){drawStar(gC,p.size)}
    else{gC.beginPath();gC.arc(0,0,Math.max(0,p.size*(1-p.age/p.life)),0,7);gC.fill()}
    if(p.col==='#FFFFFF'){gC.strokeStyle='rgba(0,0,0,.08)';gC.lineWidth=.6;gC.stroke()}
    gC.restore();
  }
}

/* ================= main loop ================= */
let state='loading',last=performance.now(),mouse={x:0,y:0};
addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&state==='pack'){e.preventDefault();tearAuto()}});
function tick(now){
  try{frame(now)}catch(e){console.error(e)}
  requestAnimationFrame(tick);
}
function frame(now){
  const dt=Math.min(.033,(now-last)/1000);last=now;
  /* pack */
  const pk=pack;
  if(pk){
    if(pk.enter){
      const t=Math.min(1,(now-pk.enter.t0)/pk.enter.dur),e=ease.oc(t);
      pk.spin=reduce?0:(1-e)*540;pk.x.t=0; // reduced motion: slide in without the spin
      pk.enterLift=(1-e)*-30;
      if(t>=1)pk.enter=null;
    }
    const idle=state==='pack';
    const tearAct=now-(pk.tearing||0)<120;
    pk.rx.t=idle?-(pk.hy||0)*10:0;pk.ry.t=idle?(pk.hx||0)*14:0;
    pk.rz.t=tearAct?Math.sin(now/30)*1.2:0;
    if(pk.shake>0){pk.rz.t+=Math.sin(now/26)*4*pk.shake;pk.shake=Math.max(0,pk.shake-dt*2.6)}
    for(const s of[pk.x,pk.y,pk.rx,pk.ry,pk.rz])for(let k=0;k<2;k++)s.step(dt/2);
    let fy=0,fr=0,fo=1;
    if(pk.fall){const t=(now-pk.fall.t0)/750;fy=ease.ic(Math.min(t,1))*VH*.9;fr=ease.ic(Math.min(t,1))*24*pk.fall.dir;fo=t>.8?Math.max(0,1-(t-.8)/.2):1}
    const bob=state==='pack'?Math.sin(now/900)*5:0;
    const s=packS;
    pk.el.style.transform=`translate(${(CX+pk.x.v-150).toFixed(2)}px,${(CY+pk.y.v-208+bob+fy+(pk.enterLift||0)).toFixed(2)}px) scale(${s}) rotate(${fr.toFixed(2)}deg)`;
    pk.el.style.opacity=fo;
    pk.p3.style.transform=`perspective(1400px) rotateX(${pk.rx.v.toFixed(2)}deg) rotateY(${(pk.ry.v+pk.spin).toFixed(2)}deg) rotateZ(${pk.rz.v.toFixed(2)}deg)`;
    pk.shadow.style.transform=`scale(${(1-bob/60).toFixed(3)})`;pk.shadow.style.opacity=pk.fall?0:1;
    pk.sheen.style.setProperty('--sx',(55+(pk.hx||0)*-60)+'%');
    if(pk.progress>0&&!pk.fly)placeSlices(pk);
    if(pk.fly){const f=pk.fly;f.vy+=1500*dt*packS;f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=f.vr*dt;
      pk.strip.style.transform=`translate(${(f.x/s).toFixed(1)}px,${(f.y/s).toFixed(1)}px) rotate(${f.r.toFixed(1)}deg)`;pk.strip.style.transformOrigin='100% 0'}
    if(pk.face){
      if(state==='pack'&&pk.face.expr==='idle'){const r=pk.el.getBoundingClientRect();pk.face.lx=Math.max(-3,Math.min(3,(mouse.x-(r.left+r.width/2))/90));pk.face.ly=Math.max(-2.5,Math.min(2.5,(mouse.y-(r.top+r.height*.55))/90))}
      pk.face.tick(now)}
    if(fo<=0&&pk.fall){pk.el.remove();pack=null}
  }
  /* cards */
  for(const c of cards){
    if(c.exit){const t=(now-c.exit.t0)/1000;c.y.t=c.y.v;c.x.t=c.x.v;
      c.y.snap(c.y.v+(t*t*2600+60)*dt);c.x.snap(c.x.v+c.exit.vx*dt);c.r.snap(c.r.v+c.exit.vr*dt);c.el.style.opacity=Math.max(0,1-t*1.6)}
    const hv=c.hover&&state==='row';
    if(state==='row'||state==='swapping'){c.rx.t=hv?(.5-c.py)*18:0;c.ry.t=hv?(c.px-.5)*22:0}
    c.lift.t=hv?1:0;
    for(const s of[c.x,c.y,c.r,c.s,c.rx,c.ry,c.lift])for(let k=0;k<2;k++)s.step(dt/2);
    const sc=cardW/300*c.s.v*(1+c.lift.v*.07),rot=c.r.v*(1-c.lift.v);
    c.el.style.transform=`translate(${(CX+c.x.v-150).toFixed(2)}px,${(CY+c.y.v-212-c.lift.v*cardW*.06).toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
    c.inner.style.transform=`perspective(1100px) rotateX(${c.rx.v.toFixed(2)}deg) rotateY(${c.ry.v.toFixed(2)}deg)`;
    const fx=50+(c.px-.5)*90+c.ry.v*.6,fy=50+(c.py-.5)*90;
    c.inner.style.setProperty('--fx',fx.toFixed(1)+'%');c.inner.style.setProperty('--fy',fy.toFixed(1)+'%');
    c.inner.style.setProperty('--gx',(c.px*100).toFixed(1)+'%');c.inner.style.setProperty('--gy',(c.py*100).toFixed(1)+'%');
    const bob=Math.sin(now/1100+c.bob)*4;
    c.mascot.style.transform=`translate(${((c.px-.5)*-14).toFixed(2)}px,${((c.py-.5)*-10+bob).toFixed(2)}px) scale(${1+c.lift.v*.04})`;
    if(c.face){if(c.face.expr==='idle'){c.face.lx=(c.px-.5)*5;c.face.ly=(c.py-.5)*4}c.face.tick(now)}
  }
  drawStreams(now);drawParts(dt);
}

/* ================= boot ================= */
layout();addEventListener('resize',layout);
try{await renderMascots()}catch(e){console.warn('mascot render failed',e)}
const first=makePack();state='pack';first.y.snap(30);first.el.style.opacity=0;
requestAnimationFrame(()=>{first.y.t=0;first.el.style.transition='opacity .5s ease';first.el.style.opacity=1;setTimeout(()=>first.el.style.transition='',600)});
requestAnimationFrame(tick);
