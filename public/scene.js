import * as THREE from 'three';
import {SVGLoader} from './assets/vendor/SVGLoader.js';
import {RoomEnvironment} from './assets/vendor/RoomEnvironment.js';

const canvas=document.querySelector('#world');
let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
}catch(error){fallback(error);}
function fallback(error){
  document.body.classList.remove('has-webgl');
  document.body.classList.add('no-webgl');
  window.dispatchEvent(new Event('k4v0g:fallback'));
  console.warn('Experiencia 3D no disponible; contenido completo activado.',error);
}
if(renderer) init().catch(fallback);
async function init(){
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;
  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x0a0f1c,.033);
  const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);
  camera.position.set(0,0,9);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const env=pmrem.fromScene(room,.035);
  scene.environment=env.texture;
  room.dispose();pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xd5f5ff,0x0f172a,2.6));
  const light=new THREE.DirectionalLight(0xf0f9ff,4.5);light.position.set(-3,5,4);scene.add(light);
  const cyanLight=new THREE.PointLight(0x22d3ee,35,20,2);cyanLight.position.set(4,1.5,3);scene.add(cyanLight);
  const rim=new THREE.PointLight(0x74a5e5,26,20,2);rim.position.set(-3,-1,1);scene.add(rim);

  const rig=new THREE.Group();scene.add(rig);
  const emblem=new THREE.Group();rig.add(emblem);
  const svg=await new SVGLoader().loadAsync('./assets/emblem.svg');
  const chrome=new THREE.MeshStandardMaterial({color:0xe2edf7,metalness:1,roughness:.23,envMapIntensity:1.55});
  const edge=new THREE.MeshStandardMaterial({color:0x28627d,metalness:.92,roughness:.2,envMapIntensity:1.8});
  const parts=[];
  for(const path of svg.paths){
    for(const shape of SVGLoader.createShapes(path)){
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:25,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:2,bevelThickness:2,curveSegments:7});
      const mesh=new THREE.Mesh(geometry,[chrome,edge]);
      emblem.add(mesh);parts.push(mesh);
    }
  }
  const bounds=new THREE.Box3().setFromObject(emblem),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const normal=3.15/Math.max(size.x,size.y);
  for(const mesh of parts){
    mesh.geometry.translate(-center.x,-center.y,-center.z);
    mesh.geometry.scale(normal,-normal,normal);
    mesh.geometry.computeVertexNormals();
    const c=new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
    mesh.userData.explode=new THREE.Vector3(c.x*.3,c.y*.32,(parts.indexOf(mesh)-parts.length/2)*.22);
  }

  const orbits=new THREE.Group();rig.add(orbits);
  const lineMat=new THREE.MeshBasicMaterial({color:0x22d3ee,transparent:true,opacity:.38});
  const ring1=new THREE.Mesh(new THREE.TorusGeometry(2.22,.008,6,150),lineMat);ring1.rotation.set(1.12,.2,-.2);orbits.add(ring1);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.37,.006,6,150),lineMat);ring2.rotation.set(.35,.75,.55);orbits.add(ring2);
  const ring3=new THREE.Mesh(new THREE.TorusGeometry(2.51,.005,6,150),new THREE.MeshBasicMaterial({color:0x3786a6,transparent:true,opacity:.28}));ring3.rotation.set(.1,-.5,.2);orbits.add(ring3);
  const markers=new THREE.Group();orbits.add(markers);
  const markerGeo=new THREE.BoxGeometry(.055,.055,.055);
  for(let i=0;i<24;i++){
    const angle=i/24*Math.PI*2;
    const marker=new THREE.Mesh(markerGeo,new THREE.MeshBasicMaterial({color:i%3===0?0xa5f3fc:0x164e63}));
    marker.position.set(Math.cos(angle)*2.22,Math.sin(angle)*2.22,0);
    markers.add(marker);
  }
  markers.rotation.copy(ring1.rotation);

  const satellites=new THREE.Group();rig.add(satellites);
  const satelliteGeo=new THREE.OctahedronGeometry(.095,0);
  for(let i=0;i<9;i++){
    const m=new THREE.Mesh(satelliteGeo,chrome);
    const a=i*2.399;
    m.position.set(Math.cos(a)*(2.7+i*.03),Math.sin(a)*(2.3+i*.05),Math.sin(i*3)*.8);
    m.rotation.set(i*.4,i*.7,0);satellites.add(m);
  }

  const tunnel=new THREE.Group();scene.add(tunnel);
  const tunnelMat=new THREE.LineBasicMaterial({color:0x2c607f,transparent:true,opacity:.13});
  for(let i=0;i<18;i++){
    const geometry=new THREE.EdgesGeometry(new THREE.BoxGeometry(14,10,.015));
    const frame=new THREE.LineSegments(geometry,tunnelMat);
    frame.position.z=-3-i*3.5;
    tunnel.add(frame);
  }
  const grid=new THREE.GridHelper(100,65,0x254a69,0x172e4c);
  grid.position.y=-3.5;grid.material.transparent=true;grid.material.opacity=.17;scene.add(grid);
  const count=150;
  const points=new Float32Array(count*3);
  // Deterministic star field, without runtime allocations.
  for(let i=0;i<count;i++){
    points[i*3]=Math.sin(i*127.1)*17;
    points[i*3+1]=Math.cos(i*311.7)*10;
    points[i*3+2]=-2-((i*7.17)%35);
  }
  const pointGeometry=new THREE.BufferGeometry();pointGeometry.setAttribute('position',new THREE.BufferAttribute(points,3));
  const stars=new THREE.Points(pointGeometry,new THREE.PointsMaterial({color:0x67e8f9,size:.026,transparent:true,opacity:.55,sizeAttenuation:true}));scene.add(stars);

  const pointer=new THREE.Vector2();
  addEventListener('pointermove',e=>{pointer.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5);},{passive:true});
  addEventListener('pointerleave',()=>pointer.set(0,0));
  let keys=[];
  function measure(){
    const mobile=innerWidth<=760;
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.35:1.6));renderer.setSize(innerWidth,innerHeight);
    const h=innerHeight;
    const section=id=>document.getElementById(id);
    const community=section('comunidad'),team=section('miembros'),project=section('proyectos'),resources=section('recursos'),contact=section('contacto');
    // Each chapter has a physical pose: x, y, z, rotation x/y/z, size, exploded amount.
    keys=[
      {at:0,v:mobile?[0,-.92,0,.06,-.28,-.08,.54,0]:[2.15,.05,0,.04,-.38,-.1,.94,0]},
      {at:community.offsetTop-h*.35,v:mobile?[.65,.2,-1,.1,.6,.08,.8,.1]:[2.55,.2,-1,.12,.7,.15,1.12,.12]},
      {at:community.offsetTop+(community.offsetHeight-h)*.55,v:mobile?[.4,.2,-1.5,.3,2.8,-.1,.87,.9]:[2.8,0,-1.4,.25,2.8,-.08,1.1,1]},
      {at:team.offsetTop-h*.15,v:mobile?[.3,1.2,-3,.7,4.9,-.2,.65,.45]:[-.2,.6,-4,.6,5,-.3,1,.6]},
      {at:project.offsetTop,v:mobile?[1.2,.4,-3,.2,6.5,.1,.65,.2]:[-2.5,-.55,-1,.05,6.6,.1,.92,.08]},
      {at:project.offsetTop+(project.offsetHeight-h)*.48,v:mobile?[1,.5,-2,.4,8,.2,.7,.7]:[-2.4,-.6,-.2,.5,8,.2,.96,.8]},
      {at:project.offsetTop+project.offsetHeight-h*.45,v:mobile?[-.5,.3,-3,.1,10,-.1,.8,.1]:[1.4,.4,-3,.2,10,-.1,1.2,.2]},
      {at:resources.offsetTop+resources.offsetHeight*.4,v:mobile?[1,.3,-3,.4,11,-.4,.7,.65]:[1.5,-.2,-2,.4,11,-.4,1,.7]},
      {at:contact.offsetTop,v:mobile?[0,-.2,-5,0,12.3,0,1.2,0]:[0,0,-4,0,12.3,0,1.5,0]},
      {at:contact.offsetTop+contact.offsetHeight-h,v:mobile?[0,.1,-4,0,12.5,0,1.15,0]:[0,.3,-3,0,12.5,0,1.6,0]}
    ].sort((a,b)=>a.at-b.at);
  }
  measure();addEventListener('resize',measure);addEventListener('load',measure);document.fonts.ready.then(measure);
  const target=new Float32Array(8),pose=new Float32Array(keys[0].v);
  let last=performance.now(),time=0,visible=!document.hidden;
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;last=performance.now();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback('WebGL context lost');});
  document.body.classList.add('has-webgl');
  const smooth=t=>t*t*(3-2*t);
  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(!visible||document.body.classList.contains('no-webgl'))return;
    const state=window.k4v0gState||{y:scrollY,paused:false,reduced:false};
    if(!state.paused)time+=dt;
    let k=0;
    while(k<keys.length-2&&state.y>keys[k+1].at)k++;
    const a=keys[k],b=keys[k+1];
    const t=smooth(THREE.MathUtils.clamp((state.y-a.at)/Math.max(1,b.at-a.at),0,1));
    const lerp=state.paused?1:1-Math.exp(-dt*7);
    for(let i=0;i<8;i++){target[i]=a.v[i]+(b.v[i]-a.v[i])*t;pose[i]+=(target[i]-pose[i])*lerp;}
    const idle=state.paused?0:Math.sin(time*.6)*.045;
    rig.position.set(pose[0],pose[1]+idle,pose[2]);
    const px=state.paused?0:pointer.x*.12,py=state.paused?0:pointer.y*.1;
    rig.rotation.set(pose[3]+py,pose[4]+idle+px,pose[5]);rig.scale.setScalar(pose[6]);
    parts.forEach(mesh=>{mesh.position.copy(mesh.userData.explode).multiplyScalar(pose[7]);});
    orbits.rotation.set(Math.sin(time*.1)*.12,time*.065,Math.sin(time*.15)*.08);
    satellites.rotation.y=-time*.1;
    tunnel.rotation.z=state.reduced?0:Math.sin(state.progress*Math.PI*2)*.18;
    tunnel.position.z=(state.progress||0)*9;
    stars.rotation.z=state.reduced?0:time*.003;
    // Pause removes ambient movement and inertia; natural scroll still selects the chapter.
    renderer.render(scene,camera);
  }
  renderer.render(scene,camera);requestAnimationFrame(frame);
}
