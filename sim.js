/* MyLoader: geometría de prototipo y reloj determinista, sin peticiones de red. */
(function(){
'use strict';
const T=THREE, stage=document.getElementById('stage');
const scene=new T.Scene();scene.background=new T.Color(0xe7dfcb);
const camera=new T.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;stage.appendChild(renderer.domElement);
scene.add(new T.HemisphereLight(0xffffff,0xb8a783,2));const sun=new T.DirectionalLight(0xfff5d8,2.1);sun.position.set(-7,15,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;scene.add(sun);
const mat=(color,metalness=0)=>new T.MeshStandardMaterial({color,roughness:.63,metalness});
const cream=mat(0xece2c8),rail=mat(0x777b76),slot=mat(0x4e5656),yellow=mat(0xf2bd26),orange=mat(0xbf5933),red=mat(0xba4a36),brown=mat(0x8f5638),white=mat(0xf8efe0),rock=mat(0x5c6060,.1),dark=mat(0x343b3b);
function box(parent,w,h,d,m,x,y,z){let o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function cyl(parent,r,h,m,x,y,z){let o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
function label(text,x,z){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.fillStyle='#584b39';g.font='bold 34px system-ui';g.textAlign='center';g.fillText(text,256,55);const tx=new T.CanvasTexture(c);const p=new T.Mesh(new T.PlaneGeometry(2.6,.49),new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}));p.rotation.x=-Math.PI/2;p.position.set(x,.035,z);scene.add(p)}
box(scene,20,.22,13,cream,0,-.18,0);box(scene,19.3,.08,12.3,mat(0xd8cba9),0,-.03,0);
// Los caminos son rutas visuales simplificadas. Cada tramo contiene dos carriles y una ranura guía.
const P={switch:[0,0],dock:[-5,-2.7],hopper:[5,-2.5],ramp:[4.2,3.7],trough:[-5.4,2.8],chute:[1.2,3.6]};
function path(points,width=.68){let curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],.16,p[1])));let pts=curve.getPoints(80);let verts=[];for(let i=0;i<pts.length-1;i++){let a=pts[i],b=pts[i+1],v=b.clone().sub(a).normalize(),n=new T.Vector3(-v.z,0,v.x).multiplyScalar(width/2);for(let off of [-1,1]){let aa=a.clone().addScaledVector(n,off),bb=b.clone().addScaledVector(n,off);verts.push(aa,bb)}}for(let side of [-1,1]){let geo=new T.BufferGeometry().setFromPoints(verts.filter((_,i)=>i%4=== (side===-1?0:2)||i%4===(side===-1?1:3)));scene.add(new T.Line(geo,new T.LineBasicMaterial({color:0x666c68})))}let tube=new T.Mesh(new T.TubeGeometry(curve,80,.31,8,false),rail);tube.scale.y=.11;scene.add(tube);let groove=new T.Line(new T.BufferGeometry().setFromPoints(pts.map(p=>p.clone().add(new T.Vector3(0,.035,0)))),new T.LineBasicMaterial({color:0x434a48}));scene.add(groove);return curve}
const routes={
 A:path([[0,0],[-1.4,-.7],[-3,-1.4],[-5,-2.7],[-4.9,-4.4],[-2.4,-4.7],[-.8,-2.5],[0,0]]),
 B:path([[0,0],[1,-1.3],[3,-2.7],[5,-2.5],[6,-1.2],[5.6,1.2],[4.2,3.7],[1.2,3.6],[.4,1.7],[0,0]]),
 C:path([[0,0],[-1.5,1],[-3.7,1.6],[-5.4,2.8],[-4.7,4.7],[-2.8,4.5],[-1.1,2.3],[0,0]])};
// Plástico de los tres destinos.
box(scene,2.4,.17,1.7,brown,-5,-.01,-2.7);box(scene,2.1,.22,.28,white,-5,.26,-3.4);box(scene,2.1,.22,.28,white,-5,.26,-2.0);label('MUELLE / CARGA',-5,-1.15);
for(let x of [4.4,5.6])box(scene,.15,1.1,.15,white,x,.55,-2.7);box(scene,1.8,.28,1.25,red,5,1.12,-2.7);box(scene,1.25,.6,.95,white,5,1.45,-2.7);label('TOLVA',5,-1.05);
box(scene,2.2,.2,1.15,red,4.2,.12,3.7);box(scene,2,.13,.52,white,2.5,.75,3.65);label('RAMPA',4.1,5.1);
box(scene,2.1,.18,1.55,brown,-5.4,.09,2.8);label('CANAL DE ENTREGA',-5.2,4.2);
box(scene,1.6,.12,.55,red,1.2,.65,3.6);box(scene,.15,.7,.15,white,.4,.35,3.6);box(scene,.15,.7,.15,white,2,.35,3.6);
for(let i=0;i<3;i++){let p=[-1.3+i*.43,.1,.55+i*.15];box(scene,.26,.1,.26,red,...p)}label('DESVÍO',0,-.6);
// Un solo chasis. Las carrocerías se muestran estacionadas cuando no están acopladas.
const chassis=new T.Group();scene.add(chassis);box(chassis,.98,.25,.62,orange,0,.34,0);for(let x of [-.32,.32])for(let z of [-.33,.33]){let w=cyl(chassis,.16,.1,dark,x,.22,z);w.rotation.x=Math.PI/2}
function shell(kind){let g=new T.Group();if(kind==='scoop'){box(g,.95,.35,.67,yellow,0,.65,0);box(g,.43,.37,.66,white,-.2,.92,0);let b=box(g,.43,.12,.73,yellow,.64,.55,0);b.rotation.z=-.25}else if(kind==='skip'){box(g,.9,.32,.65,yellow,0,.64,0);box(g,.39,.32,.65,white,.23,.94,0);let b=box(g,.53,.16,.83,yellow,-.61,.48,0);b.rotation.z=.22}else{box(g,.4,.38,.68,white,-.28,.85,0);box(g,.65,.19,.79,yellow,.25,.78,0);for(let z of [-.34,.34])box(g,.65,.21,.07,yellow,.25,.94,z);box(g,.07,.22,.75,yellow,.55,.94,0)}return g}
const shells={scoop:shell('scoop'),skip:shell('skip'),dump:shell('dump')};Object.values(shells).forEach(o=>scene.add(o));
const ballMeshes=Array.from({length:12},()=>{let o=new T.Mesh(new T.SphereGeometry(.105,12,8),rock);o.castShadow=true;scene.add(o);return o});
const phases=[
 {name:'La pala toma bolitas de la tolva',body:'scoop',route:'B',duration:8,from:[5,-2.5],to:[1.2,3.6]},
 {name:'La pala deposita bolitas en el canal',body:'scoop',route:'B',duration:3},
 {name:'Cambio de carrocería: cargador',body:'skip',route:'A',duration:2.5},
 {name:'El cargador recoge bolitas del muelle',body:'skip',route:'A',duration:7},
 {name:'El cargador eleva las bolitas al camión',body:'skip',route:'A',duration:3},
 {name:'Cambio de carrocería: volquete',body:'dump',route:'C',duration:2.5},
 {name:'El volquete lleva la carga a la tolva',body:'dump',route:'B',duration:8},
 {name:'El volquete descarga; inversión de marcha',body:'dump',route:'B',duration:4}
];
let sim=0,playing=true,speed=1,cycles=0,last=performance.now(),audio=null;
function stateAt(t){let total=phases.reduce((a,p)=>a+p.duration,0),local=t%total,index=0;while(local>=phases[index].duration){local-=phases[index].duration;index++}return {index,progress:local/phases[index].duration}}
function reset(){sim=0;cycles=0;playing=true;document.getElementById('play').textContent='Pausar';update()}
function update(){const st=stateAt(sim),ph=phases[st.index],u=st.progress;document.getElementById('phase').textContent=ph.name;document.getElementById('count').textContent='Ciclos: '+cycles;
 let route=routes[ph.route],q=route.getPointAt((st.index===1||st.index===7)?1-u:u),tan=route.getTangentAt((st.index===1||st.index===7)?1-u:u);chassis.position.set(q.x,0,q.z);chassis.rotation.y=Math.atan2(-tan.z,tan.x)+(st.index===1||st.index===7?Math.PI:0);chassis.updateMatrixWorld(true);
 for(let k in shells){let o=shells[k];if(k===ph.body){chassis.add(o);o.position.set(0,0,0);o.rotation.y=0}else{scene.add(o);let pos=k==='scoop'?[-3.6,-3.35]:k==='skip'?[-5.4,2.5]:[-4.7,-2.7];o.position.set(pos[0],0,pos[1]);o.rotation.y=0}}
 const stores=[[5,1.79,-2.7],[1.2,.83,3.6],[-5.4,.33,2.8],[-5,.39,-2.7],[0,.98,0]];
 let location=st.index<1?0:st.index<2?1:st.index<4?2:st.index<5?3:st.index<7?4:0;
 ballMeshes.forEach((b,i)=>{let p=stores[location];if(location===4){let v=new T.Vector3((i%4)*.16-.25,.96+Math.floor(i/4)*.16,(i%3)*.16-.15);chassis.localToWorld(v);b.position.copy(v)}else b.position.set(p[0]+(i%4)*.18-.27,p[1]+Math.floor(i/4)*.2,p[2]+(i%3)*.19-.19)});
}
function frame(now){let dt=Math.min((now-last)/1000,.1);last=now;if(playing){let before=Math.floor(sim/38),duration=phases.reduce((a,p)=>a+p.duration,0);sim+=dt*speed;if(Math.floor(sim/duration)>Math.floor((sim-dt*speed)/duration))cycles++;update();if(audio){let o=audio.osc;o.frequency.setTargetAtTime(90+Math.sin(sim*14)*5,audio.ctx.currentTime,.03)}}camera.position.set(target.x+radius*Math.sin(polar)*Math.sin(azimuth),target.y+radius*Math.cos(polar),target.z+radius*Math.sin(polar)*Math.cos(azimuth));camera.lookAt(target);renderer.render(scene,camera);requestAnimationFrame(frame)}
let target=new T.Vector3(0,0,0),radius=18,azimuth=-.5,polar=.85,drag=null;
renderer.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,button:e.button};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(drag.button===2||e.shiftKey){target.x-=dx*.015;target.z+=dy*.015}else{azimuth-=dx*.006;polar=Math.max(.2,Math.min(1.5,polar-dy*.006))}});
renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();radius=Math.max(7,Math.min(32,radius*Math.exp(e.deltaY*.001)))},{passive:false});
document.getElementById('play').onclick=()=>{playing=!playing;document.getElementById('play').textContent=playing?'Pausar':'Iniciar'};document.getElementById('reset').onclick=reset;document.getElementById('speed').onchange=e=>speed=Number(e.target.value);document.getElementById('camera').onclick=()=>{target.set(0,0,0);radius=18;azimuth=-.5;polar=.85};
document.getElementById('sound').onclick=()=>{let b=document.getElementById('sound');if(audio){audio.osc.stop();audio.ctx.close();audio=null;b.textContent='Sonido: no';b.setAttribute('aria-pressed','false')}else{let ctx=new (window.AudioContext||window.webkitAudioContext)(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sawtooth';osc.frequency.value=90;gain.gain.value=.012;osc.connect(gain).connect(ctx.destination);osc.start();audio={ctx,osc};b.textContent='Sonido: sí';b.setAttribute('aria-pressed','true')}};
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});update();requestAnimationFrame(frame);
})();
