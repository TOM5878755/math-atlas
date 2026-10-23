import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {ATLAS} from "./atlas-data.js?v=three-atlas-1";

const canvas=document.querySelector("#universe");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x02040b,1);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x02040b,.0042);
const camera=new THREE.PerspectiveCamera(56,innerWidth/innerHeight,.1,500);camera.position.set(0,8,72);
const controls=new OrbitControls(camera,canvas);Object.assign(controls,{enableDamping:true,dampingFactor:.055,rotateSpeed:.55,zoomSpeed:.72,minDistance:8,maxDistance:160,autoRotate:true,autoRotateSpeed:.18});
const universe=new THREE.Group();scene.add(universe);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(9,9),clickable=[],nodeMap=new Map();
let selected=null,hovered=null,motion=null;
const seeded=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};

function starTexture(color="#ffffff"){
  const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");
  const g=x.createRadialGradient(64,64,0,64,64,60);g.addColorStop(0,"#fff");g.addColorStop(.07,"#fff");g.addColorStop(.2,color);g.addColorStop(.45,color+"77");g.addColorStop(1,"transparent");x.fillStyle=g;x.fillRect(0,0,128,128);
  x.globalCompositeOperation="screen";x.fillStyle="#fff";x.globalAlpha=.42;x.beginPath();x.moveTo(64,4);x.lineTo(69,57);x.lineTo(124,64);x.lineTo(69,70);x.lineTo(64,124);x.lineTo(59,70);x.lineTo(4,64);x.lineTo(59,57);x.closePath();x.fill();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const textures=new Map();const getTexture=c=>{if(!textures.has(c))textures.set(c,starTexture(c));return textures.get(c)};
function labelSprite(text,color,major=false){
  const c=document.createElement("canvas");c.width=512;c.height=128;const x=c.getContext("2d");x.textAlign="center";x.textBaseline="middle";x.shadowColor="#000";x.shadowBlur=14;x.fillStyle="#f5f8ff";x.font=`${major?600:500} ${major?31:25}px "Noto Sans SC",sans-serif`;x.fillText(text,256,48);x.font="500 12px Space Grotesk";x.fillStyle=color;x.fillText(major?"DISCIPLINE":"FIELD",256,84);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,opacity:.9}));
  s.scale.set(major?5.7:4.2,major?1.42:1.05,1);s.position.y=major?3.3:1.9;return s;
}
function makeSprite(node,size){
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:getTexture(node.color),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.setScalar(size);s.userData={node,baseSize:size};clickable.push(s);nodeMap.set(node.id,s);return s;
}
function addLine(a,b,color,opacity=.22){const g=new THREE.BufferGeometry().setFromPoints([a,b]);universe.add(new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending})))}
function addDust(center,color,count,spread,seed){
  const pos=new Float32Array(count*3),col=new Float32Array(count*3),base=new THREE.Color(color);
  for(let i=0;i<count;i++){const u=seeded(seed+i*3),v=seeded(seed+i*3+1),w=seeded(seed+i*3+2),r=Math.pow(u,.68)*spread,th=v*Math.PI*2,ph=Math.acos(2*w-1);
    pos[i*3]=center.x+r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=center.y+r*.58*Math.cos(ph);pos[i*3+2]=center.z+r*Math.sin(ph)*Math.sin(th);const k=.42+seeded(seed+i*7)*.58;col[i*3]=base.r*k;col[i*3+1]=base.g*k;col[i*3+2]=base.b*k}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));universe.add(new THREE.Points(g,new THREE.PointsMaterial({size:.14,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending})));
}
function normalize(){
  ATLAS.id="root";ATLAS.depth=0;ATLAS.path=["数学"];let total=1;
  ATLAS.children.forEach((c,i)=>{c.id=`c${i}`;c.depth=1;c.path=["数学",c.name];c.parent=ATLAS;total++;
    c.children.forEach((s,j)=>{s.id=`c${i}s${j}`;s.depth=2;s.path=[...c.path,s.name];s.parent=c;s.color=c.color;total++;
      s.children=(s.topics||[]).map((name,k)=>({id:`c${i}s${j}t${k}`,name,en:"Topic",depth:3,path:[...s.path,name],parent:s,color:c.color,description:`${name}是${s.name}中的重要主题，理解它有助于建立${c.name}的完整知识结构。`,children:[]}));total+=s.children.length})});
  document.querySelector("#nodeCount").textContent=`${total} STARS`;
}
normalize();
const positions=[[-28,17,-9],[-9,24,5],[15,22,-7],[30,9,7],[28,-13,-8],[9,-24,6],[-14,-23,-7],[-31,-8,7],[1,3,-25],[2,2,26]].map(p=>new THREE.Vector3(...p));
const root=makeSprite(ATLAS,7.5);root.position.set(0,0,0);root.add(labelSprite("数学 · MATHEMATICS","#bcecff",true));universe.add(root);addDust(new THREE.Vector3(),ATLAS.color,500,15,900);
ATLAS.children.forEach((cluster,ci)=>{
  const cp=positions[ci];cluster.position=cp.clone();addLine(new THREE.Vector3(),cp,cluster.color,.26);addDust(cp,cluster.color,ci>7?180:260,9.5,ci*1000+3);
  const major=makeSprite(cluster,4.5);major.position.copy(cp);major.add(labelSprite(cluster.name,cluster.color,true));universe.add(major);
  cluster.children.forEach((sub,si)=>{
    const n=cluster.children.length,ang=si/n*Math.PI*2+ci*.71,radial=5.8+(si%2)*1.1,sp=cp.clone().add(new THREE.Vector3(Math.cos(ang)*radial,Math.sin(ang)*radial*.72,((si%3)-1)*2.5));
    sub.position=sp.clone();addLine(cp,sp,cluster.color,.32);const ss=makeSprite(sub,2.25);ss.position.copy(sp);universe.add(ss);const lab=labelSprite(sub.name,cluster.color);lab.visible=false;ss.add(lab);sub.label=lab;
    sub.children.forEach((topic,ti)=>{const ta=ti/sub.children.length*Math.PI*2+si,tp=sp.clone().add(new THREE.Vector3(Math.cos(ta)*2.35,Math.sin(ta)*1.55,(ti%2?1:-1)*1.25));topic.position=tp.clone();addLine(sp,tp,cluster.color,.16);const ts=makeSprite(topic,.82);ts.position.copy(tp);universe.add(ts)})
  });
});
function background(){
  const count=6500,pos=new Float32Array(count*3),col=new Float32Array(count*3),pal=["#8fbfff","#ffffff","#b297ff","#72d9ff"].map(c=>new THREE.Color(c));
  for(let i=0;i<count;i++){const r=55+Math.pow(seeded(i+4),.55)*115,th=seeded(i+9)*Math.PI*2,ph=Math.acos(2*seeded(i+17)-1);pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.cos(ph);pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);const c=pal[i%4],b=.25+seeded(i+30)*.75;col[i*3]=c.r*b;col[i*3+1]=c.g*b;col[i*3+2]=c.b*b}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({size:.22,vertexColors:true,transparent:true,opacity:.88,depthWrite:false})));
}background();

const typeName=n=>["知识核心","数学主星系","分支领域","知识主题"][n.depth];
function flyTo(node){const p=node.position||new THREE.Vector3(),dir=camera.position.clone().sub(controls.target).normalize(),dist=[64,20,11,7][node.depth];motion={fromC:camera.position.clone(),toC:p.clone().add(dir.multiplyScalar(dist)),fromT:controls.target.clone(),toT:p.clone(),t:0}}
function selectNode(node,fly=false){
  selected=node;document.querySelector("#introCard").classList.add("hidden");const p=document.querySelector("#detailPanel");p.style.setProperty("--c",node.color||"#bcecff");p.classList.add("open");
  document.querySelector("#detailPath").textContent=node.path.join(" / ");document.querySelector("#detailType").textContent=typeName(node);document.querySelector("#detailTitle").textContent=node.name;document.querySelector("#detailDescription").textContent=node.description;
  const children=node.children||[];document.querySelector("#childCount").textContent=children.length;const list=document.querySelector("#childList");list.innerHTML="";children.forEach(ch=>{const b=document.createElement("button");b.textContent=ch.name;b.onclick=()=>selectNode(ch,true);list.appendChild(b)});
  ATLAS.children.forEach(c=>c.children.forEach(s=>{if(s.label)s.label.visible=node===c||node===s||node.parent===s||camera.position.distanceTo(s.position)<25}));document.querySelectorAll("#clusterList button").forEach((b,i)=>b.classList.toggle("active",node===ATLAS.children[i]||node.path.includes(ATLAS.children[i].name)));if(fly)flyTo(node);
}
document.querySelector("#focusButton").onclick=()=>selected&&flyTo(selected);
const list=document.querySelector("#clusterList");ATLAS.children.forEach(c=>{const b=document.createElement("button");b.style.setProperty("--c",c.color);b.innerHTML=`<i></i><span>${c.name}</span><small>${c.children.length}</small>`;b.onclick=()=>selectNode(c,true);list.appendChild(b)});
function flatten(n,out=[]){out.push(n);(n.children||[]).forEach(c=>flatten(c,out));return out}const all=flatten(ATLAS),search=document.querySelector("#searchInput"),results=document.querySelector("#searchResults");
search.addEventListener("input",()=>{const q=search.value.trim().toLowerCase();results.innerHTML="";if(!q){results.classList.remove("open");return}all.filter(n=>n.name.toLowerCase().includes(q)||(n.en||"").toLowerCase().includes(q)).slice(0,8).forEach(n=>{const b=document.createElement("button");b.innerHTML=`<span>${n.name}</span><small>${n.path.slice(0,-1).join(" / ")}</small>`;b.onclick=()=>{selectNode(n,true);results.classList.remove("open");search.value=n.name};results.appendChild(b)});results.classList.toggle("open",results.childElementCount>0)});search.addEventListener("keydown",e=>{if(e.key==="Enter"&&results.firstChild)results.firstChild.click()});
function point(e){pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);const h=raycaster.intersectObjects(clickable,false)[0]?.object||null;if(hovered!==h){if(hovered)hovered.scale.setScalar(hovered.userData.baseSize);hovered=h;if(h)h.scale.setScalar(h.userData.baseSize*1.45);canvas.style.cursor=h?"pointer":"grab"}}
canvas.addEventListener("pointermove",point);canvas.addEventListener("click",e=>{point(e);if(hovered)selectNode(hovered.userData.node,true)});canvas.addEventListener("pointerdown",()=>{controls.autoRotate=false;document.querySelector("#rotateButton").classList.remove("active")});
function reset(){selected=null;document.querySelector("#detailPanel").classList.remove("open");document.querySelector("#introCard").classList.remove("hidden");motion={fromC:camera.position.clone(),toC:new THREE.Vector3(0,8,72),fromT:controls.target.clone(),toT:new THREE.Vector3(),t:0};ATLAS.children.forEach(c=>c.children.forEach(s=>s.label&&(s.label.visible=false)))}
document.querySelector("#resetButton").onclick=reset;document.querySelector("#homeButton").onclick=e=>{e.preventDefault();reset()};document.querySelector("#startButton").onclick=()=>selectNode(ATLAS.children[0],true);document.querySelector("#closePanel").onclick=()=>document.querySelector("#detailPanel").classList.remove("open");document.querySelector("#rotateButton").onclick=e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.classList.toggle("active",controls.autoRotate)};
const help=document.querySelector("#helpDialog");document.querySelector("#helpButton").onclick=()=>help.showModal();document.querySelector("#closeHelp").onclick=()=>help.close();
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();if(motion){motion.t=Math.min(1,motion.t+.035);const k=1-Math.pow(1-motion.t,3);camera.position.lerpVectors(motion.fromC,motion.toC,k);controls.target.lerpVectors(motion.fromT,motion.toT,k);if(motion.t>=1)motion=null}clickable.forEach((s,i)=>{const k=1+Math.sin(t*(1.2+(i%7)*.08)+i)*.08;if(s!==hovered)s.scale.setScalar(s.userData.baseSize*k)});universe.rotation.y=Math.sin(t*.035)*.025;controls.update();renderer.render(scene,camera)}animate();
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});setTimeout(()=>document.querySelector("#loading").classList.add("done"),1100);
