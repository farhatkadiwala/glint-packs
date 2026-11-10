/* ================= faces ================= */
const EYE={
  idle:'<ellipse class="ink" rx="5" ry="6.4" stroke="none"/><circle cx="-1.7" cy="-2.5" r="2.1" fill="#fff"/><circle cx="1.8" cy="2.1" r=".95" fill="#fff"/>',
  happy:'<path class="ink" d="M-5.5 1.5 Q0 -6 5.5 1.5" fill="none" stroke-width="2.8"/>',
  heart:'<path d="M0 6.5C-10 0-7.5-8.5-2.6-6.4-1.1-5.7 0-4.2 0-4.2s1.1-1.5 2.6-2.2C7.5-8.5 10 0 0 6.5Z" fill="#FF3B6B"/><circle cx="-3.2" cy="-3.6" r="1.4" fill="#fff" opacity=".9"/>',
  star:'<path class="ink" stroke="none" d="M0-7.5C.9-2.4 2.4-.9 7.5 0 2.4.9.9 2.4 0 7.5-.9 2.4-2.4.9-7.5 0-2.4-.9-.9-2.4 0-7.5Z"/><circle cx="-1.4" cy="-1.6" r="1.1" fill="#fff"/>',
  sqL:'<path class="ink" d="M-4.5-5 L4 0 L-4.5 5" fill="none" stroke-width="2.6"/>',
  sqR:'<path class="ink" d="M4.5-5 L-4 0 L4.5 5" fill="none" stroke-width="2.6"/>',
};
const MOUTH={
  smile:'<path class="ink" d="M-5 7 Q0 12 5 7" fill="none" stroke-width="2.5"/>',
  open:'<path class="ink" stroke-width="1.2" d="M-6.5 5.5 Q0 17 6.5 5.5 Z"/><path d="M-3.2 11 Q0 9 3.2 11 Q0 13.6-3.2 11Z" fill="#FF6B8A"/>',
  wavy:'<path class="ink" d="M-8 9 q2-3 4 0 t4 0 t4 0 t4 0" fill="none" stroke-width="2.2"/>',
};
function faceMarkup(expr){
  let L=EYE.idle,R=EYE.idle,M=MOUTH.smile;
  if(expr==='happy'){L=R=EYE.happy;M=MOUTH.open}
  if(expr==='heart'){L=R=EYE.heart;M=MOUTH.open}
  if(expr==='star'){L=R=EYE.star;M=MOUTH.open}
  if(expr==='wink'){R=EYE.happy;M=MOUTH.open}
  if(expr==='squint'){L=EYE.sqL;R=EYE.sqR;M=MOUTH.wavy}
  return `<g class="blush"><ellipse cx="-24" cy="9" rx="7" ry="4"/><ellipse cx="24" cy="9" rx="7" ry="4"/></g>
  <g class="look"><g class="eyes"><g transform="translate(-14 -2)">${L}</g><g transform="translate(14 -2)">${R}</g></g>${M}</g>`;
}
export class Face{
  constructor(host,art,boxPx){
    this.el=document.createElementNS('http://www.w3.org/2000/svg','svg');
    this.el.setAttribute('viewBox','-50 -50 100 100');this.el.classList.add('face');
    const w=art.fw/100*boxPx*2.0; // eyes span ~28/100 of viewbox
    Object.assign(this.el.style,{left:`calc(${art.fx}% - ${w/2}px)`,top:`calc(${art.fy}% - ${w/2}px)`,width:w+'px',height:w+'px'});
    host.appendChild(this.el);this.set('idle');this.lx=0;this.ly=0;
    this.nextBlink=performance.now()+1500+Math.random()*3000;
  }
  set(e){if(e===this.expr)return;this.expr=e;this.el.innerHTML=faceMarkup(e);this.look=this.el.querySelector('.look')}
  tick(now){
    if(this.look)this.look.setAttribute('transform',`translate(${this.lx.toFixed(2)} ${this.ly.toFixed(2)})`);
    if(now>this.nextBlink&&this.expr==='idle'){this.el.classList.add('blink');setTimeout(()=>this.el.classList.remove('blink'),110);this.nextBlink=now+2500+Math.random()*3500}
  }
}
