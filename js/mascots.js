import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ================= 3D mascots (rendered once to images) ================= */
export const ART={}; // id -> {src, fx, fy, fw}
function phys(color,o={}){return new THREE.MeshPhysicalMaterial(Object.assign({color,roughness:.18,clearcoat:1,clearcoatRoughness:.08},o))}
const B={
  plip(){
    const pts=[];for(let i=0;i<=64;i++){const t=Math.PI*i/64;pts.push(new THREE.Vector2(Math.sin(t)*Math.pow((1-Math.cos(t))/2,.85)*1.3,Math.cos(t)*1.45))}
    pts.reverse();
    const g=new THREE.Group();
    const m=new THREE.Mesh(new THREE.LatheGeometry(pts,96),phys('#2BB8F0',{roughness:.1,sheen:.5,sheenColor:new THREE.Color('#bff3ff')}));
    g.add(m);g.rotation.z=.14;
    const a=new THREE.Object3D();a.position.set(0,-.5,.86);g.add(a);g.userData.face=a;g.userData.fs=1.05;return g;
  },
  ollie(){
    const g=new THREE.Group();
    const dough=new THREE.Mesh(new THREE.TorusGeometry(1,.5,48,128),phys('#E7A35E',{roughness:.5,clearcoat:.2}));
    const ice=new THREE.Mesh(new THREE.TorusGeometry(1,.47,48,128),phys('#FF7DB8',{roughness:.12}));
    ice.scale.set(1.01,1.01,.8);ice.position.z=.13;g.add(dough,ice);
    const cols=['#FFFFFF','#FFD43B','#4DABF7','#69DB7C','#9775FA','#FF6B6B'];
    const sg=new THREE.CapsuleGeometry(.035,.14,4,8);
    for(let i=0;i<38;i++){
      const u=Math.random()*Math.PI*2, v=.35+Math.random()*1.0;
      if(Math.abs(u+Math.PI/2)<.55&&v>.6)continue; // keep face area clear
      const r=.47*.8;const p=new THREE.Vector3((1+.47*Math.cos(v))*Math.cos(u),(1+.47*Math.cos(v))*Math.sin(u),.13+r*Math.sin(v)/.8*.8+.02);
      const s=new THREE.Mesh(sg,phys(cols[i%cols.length],{roughness:.3}));s.position.copy(p);s.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);g.add(s);
    }
    g.rotation.x=-.42;
    const a=new THREE.Object3D();a.position.set(0,-1,.52);g.add(a);g.userData.face=a;g.userData.fs=.95;return g;
  },
  pilly(){
    const g=new THREE.Group(),R=.66,H=.95;
    const mk=(c,top)=>{const h=new THREE.Group();
      const cyl=new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,64,1,true),phys(c));cyl.position.y=(top?1:-1)*H/2;
      const sp=new THREE.Mesh(new THREE.SphereGeometry(R,64,32,0,Math.PI*2,0,Math.PI/2),phys(c));sp.position.y=(top?1:-1)*H;if(!top)sp.rotation.x=Math.PI;
      h.add(cyl,sp);return h};
    g.add(mk('#FF5544',true),mk('#FFF3E2',false));
    const band=new THREE.Mesh(new THREE.TorusGeometry(R,.025,8,96),phys('#E8D9C4'));band.rotation.x=Math.PI/2;g.add(band);
    g.rotation.z=-.62;
    const a=new THREE.Object3D();a.position.set(0,-.42,R);g.add(a);g.userData.face=a;g.userData.fs=.95;return g;
  },
  morel(){
    const g=new THREE.Group();
    const cap=new THREE.Mesh(new THREE.SphereGeometry(1.35,96,48,0,Math.PI*2,0,Math.PI/2),phys('#E8384F',{roughness:.2}));
    cap.scale.set(1,.78,1);cap.position.y=.25;
    const under=new THREE.Mesh(new THREE.CylinderGeometry(1.33,1.12,.16,96),phys('#F6E2C6',{roughness:.6,clearcoat:.2}));under.position.y=.18;
    const sp=[];for(let i=0;i<=24;i++){const t=i/24;const y=-1.15+t*1.4;const r=.52+.1*Math.sin(t*Math.PI*.9)+(t<.12?-(.12-t)*2.6:0);sp.push(new THREE.Vector2(Math.max(.02,r),y))}
    const stem=new THREE.Mesh(new THREE.LatheGeometry(sp,96),phys('#FFF2DD',{roughness:.35}));
    g.add(stem,under,cap);
    const dots=[[0,.95,.55,.28],[-.75,.62,.68,.2],[.72,.66,.66,.22],[-.3,.5,1.12,.16],[.4,.46,1.1,.14],[0,.98,-.2,.2],[-1.05,.36,.3,.16],[1.05,.38,.28,.15]];
    for(const[x,y,z,r]of dots){const d=new THREE.Mesh(new THREE.SphereGeometry(r,32,16),phys('#FFFFFF',{roughness:.3}));d.scale.set(1,.45,1);
      const n=new THREE.Vector3(x,(y-.25)/.78,z).normalize();d.position.set(n.x*1.35,.25+n.y*1.35*.78,n.z*1.35);d.lookAt(d.position.clone().add(n));d.rotateX(Math.PI/2);g.add(d)}
    g.rotation.x=.22;g.rotation.z=.06;
    const a=new THREE.Object3D();a.position.set(0,-.42,.62);g.add(a);g.userData.face=a;g.userData.fs=.8;return g;
  },
  bolt(){
    const s=new THREE.Shape();
    const P=[[.22,1.6],[-.95,-.08],[-.08,-.08],[-.5,-1.6],[.95,.28],[.08,.28],[.62,1.6]];
    s.moveTo(...P[0]);for(let i=1;i<P.length;i++)s.lineTo(...P[i]);s.closePath();
    const geo=new THREE.ExtrudeGeometry(s,{depth:.32,bevelEnabled:true,bevelThickness:.26,bevelSize:.2,bevelSegments:10,curveSegments:8});
    geo.center();
    const m=new THREE.Mesh(geo,phys('#FFD24A',{metalness:.55,roughness:.16,envMapIntensity:1.6,sheen:.4,sheenColor:new THREE.Color('#fff2b0')}));
    const g=new THREE.Group();g.add(m);g.rotation.y=-.28;g.rotation.x=.1;
    const a=new THREE.Object3D();a.position.set(.02,.12,.42);g.add(a);g.userData.face=a;g.userData.fs=.72;return g;
  },
  cloud(){
    const g=new THREE.Group();
    const cv=document.createElement('canvas');cv.width=256;cv.height=16;const cx=cv.getContext('2d');const lg=cx.createLinearGradient(0,0,256,0);
    ['#ffd1e8','#c9f0ff','#d8ffe0','#fff2c2','#e6d1ff','#ffd1e8'].forEach((c,i,a)=>lg.addColorStop(i/(a.length-1),c));cx.fillStyle=lg;cx.fillRect(0,0,256,16);
    const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.repeat.set(2,1);tex.wrapS=THREE.RepeatWrapping;
    const mat=phys('#ffffff',{map:tex,metalness:.15,roughness:.1,iridescence:1,iridescenceIOR:1.8,iridescenceThicknessRange:[120,980]});
    for(const[x,y,r]of[[-.9,-.12,.74],[0,.3,.98],[.9,-.08,.72],[-.35,-.42,.7],[.42,-.42,.7]]){
      const sp=new THREE.Mesh(new THREE.SphereGeometry(r,64,48),mat);sp.position.set(x,y,0);sp.scale.z=.72;g.add(sp)}
    g.rotation.y=.12;
    const a=new THREE.Object3D();a.position.set(0,-.12,.7);g.add(a);g.userData.face=a;g.userData.fs=1.05;return g;
  },
};
export async function renderMascots(){
  const size=640;
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  r.setPixelRatio(1);r.setSize(size,size,false);
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.outputColorSpace=THREE.SRGBColorSpace;
  const pm=new THREE.PMREMGenerator(r);const env=pm.fromScene(new RoomEnvironment(),.04).texture;
  const cam=new THREE.PerspectiveCamera(28,1,.1,100);cam.position.set(0,0,9);cam.lookAt(0,0,0);
  for(const k of Object.keys(B)){
    const sc=new THREE.Scene();sc.environment=env;
    const key=new THREE.DirectionalLight(0xffffff,1.5);key.position.set(-3,4,5);sc.add(key);
    const rim=new THREE.DirectionalLight(0xffffff,.9);rim.position.set(4,-2,-3);sc.add(rim);
    sc.add(new THREE.AmbientLight(0xffffff,.25));
    const g=B[k]();const holder=new THREE.Group();holder.add(g);sc.add(holder);
    holder.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(g),sz=new THREE.Vector3(),c=new THREE.Vector3();box.getSize(sz);box.getCenter(c);
    const f=3.5/Math.max(sz.x,sz.y);holder.scale.setScalar(f);holder.position.copy(c.multiplyScalar(-f));
    holder.updateMatrixWorld(true);
    r.render(sc,cam);
    const a=g.userData.face,w=new THREE.Vector3(),w2=new THREE.Vector3();
    a.getWorldPosition(w);w2.copy(w).add(new THREE.Vector3(f*.55*g.userData.fs,0,0));
    const p1=w.clone().project(cam),p2=w2.clone().project(cam);
    ART[k]={src:r.domElement.toDataURL('image/png'),fx:(p1.x+1)/2*100,fy:(1-p1.y)/2*100,fw:Math.abs(p2.x-p1.x)/2*100*2};
  }
  r.dispose();pm.dispose();
}
