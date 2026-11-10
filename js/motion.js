/* ================= springs ================= */
export class S{constructor(v,k=170,d=22){this.v=v;this.t=v;this.vel=0;this.k=k;this.d=d}
  step(dt){const a=-this.k*(this.v-this.t)-this.d*this.vel;this.vel+=a*dt;this.v+=this.vel*dt}
  snap(v){this.v=this.t=v;this.vel=0}}
export const ease={oc:t=>1-Math.pow(1-t,3),ic:t=>t*t*t,ioc:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
export const rnd=(a,b)=>a+Math.random()*(b-a);
export const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
