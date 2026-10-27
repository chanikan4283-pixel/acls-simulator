import {waveform,displayRhythm} from './ecg.js';
import {layoutLabels} from './label-layout.js';
import {smoothValue,NECK,procedureBlend,BVM_ANCHORS,facialTargets} from './pose.js';
import {teamMotion} from './team-motion.js';
/* Original procedural cartoon characters. Archived scan assets are no longer rendered. */
const T=globalThis.THREE;
export class Ward {
 constructor(canvas,onPick=()=>{}){
  this.procedureStarts={};this.poseCache=new WeakMap();this.canvas=canvas;this.onPick=onPick;this.time=0;this.state={pulse:true,conscious:true,rr:14};this.quality='standard';this.reduced=false;
  if(!T)throw new Error('3D library unavailable');
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputEncoding=T.sRGBEncoding;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.86;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.scene=new T.Scene();this.scene.background=new T.Color('#adbec5');this.scene.fog=new T.Fog('#adbec5',13,27);
  this.camera=new T.PerspectiveCamera(37,1,.05,60);this.camera.position.set(4.2,3.5,5.8);this.look=new T.Vector3(0,1.25,0);this.desired=this.camera.position.clone();this.target=this.look.clone();
  this.scene.add(new T.HemisphereLight('#f1f7ff','#61736d',.6));
  const key=new T.DirectionalLight('#fff3df',1.3);key.position.set(-3,7,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:1,far:20});key.shadow.bias=-.0005;this.scene.add(key);
  const fill=new T.DirectionalLight('#b1ddff',.65);fill.position.set(4,3,-3);this.scene.add(fill);
  this.room();this.bed();this.patient=this.human('#bc8b70',true);this.patient.root.position.set(0,1.32,0);this.patient.root.rotation.x=-Math.PI/2;this.scene.add(this.patient.root);
  this.patient.root.userData.pick='patient';this.patient.root.traverse(o=>{if(o.isMesh)o.userData.pick='patient';});
  this.compressor=this.human('#a97860',false,'#2d666c');this.compressor.root.position.set(-.85,0,-.15);this.compressor.root.rotation.y=Math.PI/2;this.scene.add(this.compressor.root);
  this.airway=this.human('#d3ac86',false,'#577b9b');this.airway.root.position.set(.15,0,-1.65);this.airway.root.rotation.y=0;this.scene.add(this.airway.root);
  this.bagger=this.human('#bda18f',false,'#516d87');this.bagger.root.position.set(.82,0,-1.6);this.bagger.root.rotation.y=-.5;this.scene.add(this.bagger.root);
  this.nurse=this.human('#c9967d',false,'#3f777e');this.nurse.root.position.set(1.5,0,-.8);this.nurse.root.rotation.y=-.5;this.scene.add(this.nurse.root);
  this.family=this.human('#b58369',false,'#bdab9c',false);this.family.root.position.set(-2.5,0,-2.8);this.family.root.rotation.y=.4;this.scene.add(this.family.root);
  this.equipment();this.step=this.box(.56,.39,.55,this.mat('#607d82'),-.88,.195,-.15);this.box(.58,.03,.57,this.mat('#304e54'),0,.21,0,this.step);this.step.visible=false;this.cameraPreset('overview');
  const glove=this.mat('#a7c9d0',.8),sleeve=this.mat('#2d666c');this.cprArms=[];
  for(let i=0;i<2;i++){const upper=this.mesh(new T.CylinderGeometry(.058,.052,1,16),sleeve),lower=this.mesh(new T.CylinderGeometry(.05,.037,1,16),this.mat('#a97860')),hand=this.ell(.035,.019,.065,glove);this.cprArms.push({upper,lower,hand});upper.visible=lower.visible=hand.visible=false;}
  this.airwayArms=[];
  for(let i=0;i<2;i++){const upper=this.mesh(new T.CylinderGeometry(.057,.052,1,16),this.mat('#577b9b')),lower=this.mesh(new T.CylinderGeometry(.048,.035,1,16),this.mat('#d3ac86')),hand=this.ell(.038,.021,.055,glove);upper.visible=lower.visible=hand.visible=false;this.airwayArms.push({upper,lower,hand});}
  this.bagArm={upper:this.mesh(new T.CylinderGeometry(.057,.052,1,16),this.mat('#516d87')),lower:this.mesh(new T.CylinderGeometry(.048,.035,1,16),this.bagger.skin),hand:this.ell(.038,.021,.055,glove)};
  for(const [person,role] of [[this.compressor,'compressor'],[this.airway,'airway'],[this.bagger,'airway'],[this.nurse,'meds'],[this.family,'history']]){person.root.userData.pick=role;person.root.traverse(o=>{if(o.isMesh)o.userData.pick=role;});}
  for(const rig of [...this.airwayArms,this.bagArm])for(const mesh of Object.values(rig))mesh.userData.pick='airway';
  for(const rig of this.cprArms)for(const mesh of Object.values(rig))mesh.userData.pick='compressor';
  this.ray=new T.Raycaster();this.pointer=new T.Vector2();this.gestures=new Map();this.dragged=false;
  this.labelsVisible=true;this.roleLabels=[this.roleLabel(this.compressor,'COMPRESSIONS'),this.roleLabel(this.airway,'AIRWAY'),this.roleLabel(this.nurse,'MEDS / DEFIB'),this.roleLabel(this.family,'FAMILY'),this.roleLabel(this.bagger,'VENTILATION')];
  canvas.addEventListener('pointerdown',e=>{this.gestures.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.gestures.size===1){this.dragged=false;this.dragStart=[e.clientX,e.clientY];}else this.dragged=true;canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{const old=this.gestures.get(e.pointerId);if(!old)return;const before=[...this.gestures.values()];const previousDistance=before.length===2?Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y):0;this.gestures.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.gestures.size===2){const points=[...this.gestures.values()];const distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);if(distance>5&&previousDistance>5)this.orbitBy(0,0,previousDistance/distance);}else if(Math.hypot(e.clientX-this.dragStart[0],e.clientY-this.dragStart[1])>8||this.dragged){this.dragged=true;this.orbitBy(-(e.clientX-old.x)*.008,(e.clientY-old.y)*.006);}});
  canvas.addEventListener('pointerup',e=>{if(!this.gestures.has(e.pointerId))return;this.gestures.delete(e.pointerId);if(this.dragged||this.gestures.size)return;const r=canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const hit=this.ray.intersectObjects(this.scene.children,true).find(h=>{let visible=true;for(let o=h.object;o;o=o.parent)visible=visible&&o.visible;return visible&&h.object.userData.pick;});if(hit)this.onPick(hit.object.userData.pick);});
  canvas.addEventListener('pointercancel',()=>{this.gestures.clear();this.dragged=true;});
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.orbitBy(0,0,Math.exp(e.deltaY*.001));},{passive:false});
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();
 }
 mat(color,rough=.65,metal=0){return new T.MeshStandardMaterial({color:new T.Color(color).convertSRGBToLinear(),roughness:rough,metalness:metal});}
 mesh(geo,mat,parent=this.scene){const o=new T.Mesh(geo,mat);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 box(w,h,d,mat,x=0,y=0,z=0,parent=this.scene){const o=this.mesh(new T.BoxGeometry(w,h,d),mat,parent);o.position.set(x,y,z);return o;}
 ell(rx,ry,rz,mat,x=0,y=0,z=0,parent=this.scene){const o=this.mesh(new T.SphereGeometry(1,24,18),mat,parent);o.scale.set(rx,ry,rz);o.position.set(x,y,z);return o;}
 rod(a,b,r,mat,parent=this.scene){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const o=this.mesh(new T.CylinderGeometry(r,r,d.length(),12),mat,parent);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 label(text,w=1.2,h=.25,bg='#25444c',fg='#e9f6ed'){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,512,128);x.fillStyle=fg;x.font='bold 48px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,65);const m=new T.MeshBasicMaterial({map:new T.CanvasTexture(c)});return this.mesh(new T.PlaneGeometry(w,h),m);}
 room(){const wall=this.mat('#d4dfdf'),floor=this.mat('#7f979b',.9),trim=this.mat('#627c81'),white=this.mat('#f3eee3'),metal=this.mat('#a6b5b7',.3,.65);
  this.box(12,.1,12,floor,0,-.07,0);this.box(12,4,.15,wall,0,1.9,-4.5);this.box(.15,4,12,wall,-5,1.9,0);
  this.box(12,.12,.15,trim,0,.9,-4.4);this.box(.14,.12,12,trim,-4.9,.9,0);
  for(let i=-5;i<=5;i++){this.box(.012,.006,12,this.mat('#72898d'),i,.001,0);this.box(12,.006,.012,this.mat('#72898d'),0,.002,i);}
  this.box(2.4,2.5,.1,this.mat('#657e88'),2.8,1.25,-4.38);this.box(2.15,.85,.04,this.mat('#a6c8cf',.25),2.8,1.65,-4.3);this.box(.09,.32,.1,metal,3.65,1.05,-4.2);
  const sign=this.label('RESUSCITATION  /  01',2.4,.3);sign.position.set(.1,2.8,-4.38);
  this.box(2,.6,.12,white,-1.6,1.5,-4.32);for(let i=0;i<6;i++){this.ell(.035,.035,.025,this.mat(i<2?'#8bad6b':'#6396a9'),-2.3+i*.25,1.55,-4.23);}
  this.box(1.3,.04,2,this.mat('#fff8e7'),0,3.6,0);
  for(let i=0;i<12;i++)this.box(.1,2.9,.05,this.mat(i%2?'#8aa9a9':'#95b3b2'),-3.65+i*.15,1.5,-3.2);
  this.rod([-3.9,3,-3.2],[-1.7,3,-3.2],.025,metal);
  const cab=this.mat('#a0b5b6');this.box(1.4,.9,.55,cab,3, .45,-3.5);this.box(1.5,.07,.65,white,3,.94,-3.5);for(let i=0;i<3;i++)this.box(1.2,.015,.02,metal,3,.25+i*.24,-3.21);
 }
 bed(){const metal=this.mat('#a6b2b3',.3,.65),dark=this.mat('#43565d'),sheet=this.mat('#e5ede6');this.box(1.25,.2,2.45,sheet,0,1.08,0);this.box(1.35,.12,2.6,dark,0,.93,0);
  this.box(.9,.15,1.8,metal,0,.45,0);for(const x of [-.46,.46])for(const z of [-.85,.85]){this.rod([x,.15,z],[x,.93,z],.035,metal);const wheel=this.mesh(new T.CylinderGeometry(.1,.1,.07,18),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.12,z);}
  for(const x of [-.67,.67]){this.rod([x,1.1,-.65],[x,1.1,.6],.025,metal);this.rod([x,.93,-.65],[x,1.1,-.65],.025,metal);this.rod([x,.93,.6],[x,1.1,.6],.025,metal);}
  this.box(1.28,.35,.08,this.mat('#d0dedc'),0,1.05,1.35);
 }
 clothPanel(width,length,color,parent,y,z){
  const geometry=new T.PlaneGeometry(width,length,24,32),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),v=p.getY(i),edge=Math.abs(x)/(width/2);p.setZ(i,z+.055*(1-edge*edge)-.14*Math.pow(edge,6)+.008*Math.sin(v*31+x*17)+.004*Math.cos(x*48-v*9));}
  geometry.computeVertexNormals();const material=this.mat(color,.98);material.side=T.DoubleSide;const cloth=this.mesh(geometry,material,parent);cloth.position.y=y;return cloth;
 }
 human(skinColor,patient=false,shirt='#3b6976',clinical=true){
  const root=new T.Group(),torso=new T.Group();root.add(torso);torso.position.y=patient?0:.99;
  const skin=this.mat(skinColor,.9),cloth=this.mat(shirt,.95),pants=this.mat('#314659'),hair=this.mat(patient?'#70727b':'#394254'),lip=this.mat('#965c53'),eyeWhite=this.mat('#fff9ed'),iris=this.mat('#253441');
  const profile=[[-.35,.16],[-.28,.19],[-.12,.18],[.08,.22],[.23,.255],[.29,.22],[.33,.13],[.36,.065]].map(([y,r])=>new T.Vector2(r,y));
  const chest=this.mesh(new T.LatheGeometry(profile,32),patient?skin:cloth,torso);chest.scale.z=patient?.48:.62;
  const neck=this.mesh(new T.CylinderGeometry(.064,.075,NECK.top-NECK.bottom,20),skin,torso);neck.position.y=(NECK.top+NECK.bottom)/2;
  const head=new T.Group();head.position.y=.53;torso.add(head);
  this.ell(.148,.177,.14,skin,0,0,0,head);this.ell(.119,.104,.113,skin,0,-.078,.014,head);
  for(const side of [-1,1]){this.ell(.025,.039,.023,skin,side*.145,-.018,0,head);this.ell(.011,.021,.012,this.mat('#b87565'),side*.16,-.018,.008,head);}
  const hairCap=this.mesh(new T.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI/2),hair,head);hairCap.scale.set(.153,.115,.145);hairCap.position.set(0,.06,-.008);
  if(!patient&&clinical){const cap=this.mesh(new T.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI/2),cloth,head);cap.scale.set(.159,.10,.151);cap.position.set(0,.086,0);this.ell(.157,.014,.15,cloth,0,.087,0,head);}
  else if(patient) this.ell(.095,.028,.025,hair,-.025,.114,.105,head);
  const eyes=[],lids=[],brows=[],eyeParts=[];
  for(const x of [-.052,.052]){
   eyes.push(this.ell(.029,.021,.012,eyeWhite,x,.009,.126,head));
   eyeParts.push(this.ell(.011,.014,.006,iris,x,.009,.136,head));
   eyeParts.push(this.ell(.0035,.004,.003,this.mat('#ffffff'),x-.003,.014,.141,head));
   lids.push(this.ell(.032,.007,.014,skin,x,.03,.136,head));
   const brow=this.rod([-.025,0,0],[.025,.003,0],.005,hair,head);brow.position.set(x,.052,.127);brows.push(brow);
  }
  this.ell(.019,.028,.021,skin,0,-.019,.142,head);
  const mouth=this.ell(.029,.005,.007,lip,0,-.071,.131,head);
  const arms=[];
  for(const side of [-1,1]){
   const shoulder=new T.Group();shoulder.position.set(side*.232,.235,0);torso.add(shoulder);
   this.ell(.067,.075,.065,patient?skin:cloth,0,0,0,shoulder);
   this.rod([0,0,0],[0,-.27,0],.052,patient?skin:cloth,shoulder);
   const elbow=new T.Group();elbow.position.y=-.27;shoulder.add(elbow);this.ell(.052,.052,.052,skin,0,0,0,elbow);
   this.rod([0,0,0],[0,-.235,0],.042,skin,elbow);
   const hand=new T.Group();hand.position.y=-.235;elbow.add(hand);
   const handMat=patient?skin:this.mat('#b4dfdf');this.ell(.041,.063,.024,handMat,0,-.035,0,hand);this.ell(.015,.032,.018,handMat,side*.035,-.015,.005,hand);
   arms.push({shoulder,elbow,hand});
  }
  if(patient){
   for(const side of [-1,1]){this.rod([side*.105,-.31,0],[side*.105,-.72,0],.087,skin,torso);this.ell(.083,.083,.076,skin,side*.105,-.72,0,torso);this.rod([side*.105,-.72,0],[side*.105,-1.10,0],.061,skin,torso);this.ell(.065,.07,.115,skin,side*.105,-1.16,.035,torso);}
   this.clothPanel(.57,.94,'#79b8c1',torso,-.73,.105);
   this.gown=this.clothPanel(.46,.53,'#98cbd1',torso,.01,.124);
   this.gownSides=new T.Group();torso.add(this.gownSides);for(const side of [-1,1]){const panel=this.clothPanel(.10,.51,'#98cbd1',this.gownSides,.01,.10);panel.position.x=side*.22;panel.rotation.y=side*.5;}
  }else{
   for(const side of [-1,1]){this.rod([side*.105,.69,0],[side*.105,.39,0],.087,pants,root);this.ell(.087,.086,.086,pants,side*.105,.39,0,root);this.rod([side*.105,.39,0],[side*.105,.10,0],.067,pants,root);this.ell(.085,.062,.145,this.mat('#f2eee4'),side*.105,.065,.05,root);}
   this.box(.065,.075,.009,this.mat('#f5f4e7'),.10,.14,.139,torso);this.box(.045,.015,.012,this.mat('#d6b26b'),.10,.16,.147,torso);
  }
  return {root,torso,chest,neck,head,eyes,lids,brows,mouth,arms,skin,eyeParts,hairCap};
 }
 equipment(){const metal=this.mat('#aabbbd',.3,.55),dark=this.mat('#213e49'),screen=this.mat('#122731'),cream=this.mat('#e3e8df');
  this.box(.65,.75,.55,this.mat('#537c84'),1.35,.55,.65);this.box(.72,.08,.62,cream,1.35,.97,.65);for(let i=0;i<3;i++)this.box(.5,.025,.03,metal,1.35,.35+i*.18,.95);
  const defib=this.box(.55,.36,.25,cream,1.35,1.19,.65);defib.userData.pick='electrical';this.monitorCanvas=document.createElement('canvas');this.monitorCanvas.width=512;this.monitorCanvas.height=300;this.monitorTexture=new T.CanvasTexture(this.monitorCanvas);this.monitorTexture.encoding=T.sRGBEncoding;const live=new T.Mesh(new T.PlaneGeometry(.44,.26),new T.MeshBasicMaterial({map:this.monitorTexture}));live.position.set(1.3,1.23,.79);live.userData.pick='electrical';this.scene.add(live);this.ell(.042,.042,.01,this.mat('#daac57'),1.56,1.18,.79).userData.pick='electrical';
  this.rod([1.05,0,-1.5],[1.05,2.4,-1.5],.018,metal);this.rod([.9,2.36,-1.5],[1.22,2.36,-1.5],.015,metal);this.ell(.065,.16,.035,this.mat('#d7e6de',.2),1.17,2.12,-1.5);
  const padmat=this.mat('#e3dfb9');this.pad1=this.box(.11,.006,.13,padmat,-.085,1.437,-.2);this.pad1.rotation.z=.17;this.pad2=this.box(.11,.006,.14,padmat,.19,1.369,-.01);this.pad2.rotation.z=-.7;// AHA anterolateral: right infraclavicular parasternal + left mid-axillary at the apexthis.pad1.visible=false;this.pad2.visible=false;
  const curve=new T.CatmullRomCurve3([new T.Vector3(.23,1.36,-.04),new T.Vector3(.6,1.2,.3),new T.Vector3(.9,1,.5),new T.Vector3(1.3,1.2,.7)]);this.cable=this.mesh(new T.TubeGeometry(curve,24,.009,6,false),this.mat('#303d40'));this.cable.visible=false;
  this.bag=this.ell(.09,.08,.19,this.mat('#89c9af',.3),.1,1.6,-.77);this.bag.visible=false;this.mask=this.ell(.065,.04,.08,new T.MeshStandardMaterial({color:'#c7e3da',transparent:true,opacity:.65,roughness:.2}),...BVM_ANCHORS.mask);this.mask.visible=false;
  const connectorMaterial=this.mat('#dde8e2',.35);this.maskConnector=new T.Group();this.scene.add(this.maskConnector);
  this.rod([0,1.53,-.5],[0,1.58,-.5],.018,connectorMaterial,this.maskConnector);this.rod([0,1.58,-.5],[.1,1.6,-.58],.018,connectorMaterial,this.maskConnector);
  this.airwayTube=new T.Group();this.scene.add(this.airwayTube);const tubePath=new T.CatmullRomCurve3([new T.Vector3(.007,1.415,-.457),new T.Vector3(.007,1.47,-.459),new T.Vector3(.014,1.53,-.47),new T.Vector3(.05,1.578,-.528),new T.Vector3(.1,1.6,-.58)]);this.mesh(new T.TubeGeometry(tubePath,24,.0105,8,false),connectorMaterial,this.airwayTube);// ETT exits the mouth (lips at y≈1.451, z≈-.459)
  const depthMark=this.mesh(new T.CylinderGeometry(.0118,.0118,.006,12),this.mat('#20262a'),this.airwayTube);depthMark.position.set(.007,1.462,-.459);const tie=this.box(.07,.006,.012,this.mat('#f4f1e6'),.007,1.452,-.462);this.airwayTube.add(tie);
  this.maskConnector.visible=this.airwayTube.visible=false;
  this.steth=new T.Group();this.scene.add(this.steth);this.mesh(new T.CylinderGeometry(.022,.022,.008,20),this.mat('#c9d3d8',.25),this.steth).position.y=.004;this.mesh(new T.CylinderGeometry(.008,.008,.02,10),this.mat('#8a979e',.3),this.steth).position.y=.016;this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,.026,0),new T.Vector3(.03,.14,.02),new T.Vector3(.1,.24,.05),new T.Vector3(.2,.3,.06)]),16,.006,6,false),this.mat('#2c3b44'),this.steth);this.steth.visible=false;
  // Crash / med cart (clickable): red body, drawers, tray with vials and syringes.
  const cart=new T.Group();cart.position.set(2.05,0,-1.35);cart.rotation.y=-.6;this.scene.add(cart);const red=this.mat('#b8463c',.5),drawer=this.mat('#d9675b',.45),handle=this.mat('#e9eef0',.3,.6);
  this.box(.62,.92,.5,red,0,.52,0,cart);for(let i=0;i<4;i++){this.box(.56,.16,.02,drawer,0,.2+i*.2,.26,cart);this.box(.22,.025,.02,handle,0,.25+i*.2,.28,cart);}
  this.box(.66,.04,.54,this.mat('#e3e8df'),0,1.0,0,cart);for(let i=0;i<5;i++){const v=this.mesh(new T.CylinderGeometry(.022,.022,.07,10),this.mat(['#f6d8e8','#dff1ff','#fff2b8','#d9f5e4','#ffd2c2'][i],.3),cart);v.position.set(-.2+i*.1,1.06,-.08);}
  for(let i=0;i<3;i++){const sy=this.mesh(new T.CylinderGeometry(.012,.012,.16,8),this.mat('#f4fbfc',.2),cart);sy.rotation.z=Math.PI/2;sy.position.set(-.05+i*.05,1.04,.12);}
  for(const w of [[-.26,-.2],[.26,-.2],[-.26,.2],[.26,.2]])this.ell(.04,.04,.04,this.mat('#2b3a3f'),w[0],.05,w[1],cart);
  const tag=this.label('MED CART',.5,.12,'#7a221b','#ffffff');tag.position.set(0,1.2,0);cart.add(tag);this.medCart=cart;
  cart.traverse(o=>{if(o.isMesh)o.userData.pick='medcart';});
  this.scope=new T.Group();this.scene.add(this.scope);this.rod([0,0,0],[0,.15,0],.018,this.mat('#416379'),this.scope);this.rod([0,0,0],[0,0,.10],.014,metal,this.scope);this.scope.visible=false;this.ivDressing=this.box(.045,.008,.07,this.mat('#eef0de'),.29,1.36,.10);this.ivDressing.visible=false;this.ivHub=this.ell(.012,.012,.026,this.mat('#84bbbd'),.29,1.375,.10);this.ivHub.visible=false;
 }
 orbitBy(yaw=0,pitch=0,zoom=1){const offset=this.desired.clone().sub(this.target),radius=Math.max(2.2,Math.min(4.1,offset.length()*zoom)),azimuth=Math.atan2(offset.x,offset.z)+yaw,elevation=Math.max(.22,Math.min(1.18,Math.asin(offset.y/offset.length())+pitch));this.desired.set(this.target.x+radius*Math.cos(elevation)*Math.sin(azimuth),this.target.y+radius*Math.sin(elevation),this.target.z+radius*Math.cos(elevation)*Math.cos(azimuth));}
 roleLabel(person,role){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=144;const texture=new T.CanvasTexture(canvas);texture.encoding=T.sRGBEncoding;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false}));sprite.scale.set(.20,.056,1);sprite.renderOrder=20;sprite.userData.pick=person.root.userData.pick;this.scene.add(sprite);const leader=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineBasicMaterial({color:'#c8ede1',transparent:true,opacity:.65,depthTest:false,depthWrite:false}));leader.renderOrder=19;this.scene.add(leader);return {person,role,canvas,texture,sprite,leader,status:''};}
 updateRoleLabels(statuses){for(let i=0;i<this.roleLabels.length;i++){const label=this.roleLabels[i];label.sprite.visible=this.labelsVisible&&this.sceneActive!==false;label.person.head.getWorldPosition(label.sprite.position);label.sprite.position.y+=.30;const status=statuses[i];if(label.status===status)continue;label.status=status;const x=label.canvas.getContext('2d');x.clearRect(0,0,512,144);x.fillStyle='rgba(13,35,43,.85)';x.fillRect(0,0,512,144);x.fillStyle='#a5dcc1';x.fillRect(0,0,6,144);x.textAlign='center';x.font='bold 47px sans-serif';x.fillText(label.role,258,86);label.texture.needsUpdate=true;}
  const width=this.canvas.clientWidth,height=this.canvas.clientHeight;if(!width||!height)return;
  this.camera.updateMatrixWorld();
  const anchors=this.roleLabels.map(label=>{const point=label.sprite.position.clone().project(this.camera);return {x:(point.x+1)*width/2,y:(1-point.y)*height/2,z:point.z,visible:label.sprite.visible&&point.z>-1&&point.z<1&&Math.abs(point.x)<1.15&&Math.abs(point.y)<1.15};});
  const top=Math.min(140,height*.30),bottom=Math.min(100,height*.22);
  const packed=layoutLabels(anchors.map(p=>({...p,y:p.y-top})),width,height-top-bottom,150,34).map(p=>({...p,y:p.y+top})),scale=2*Math.tan(this.camera.fov*Math.PI/360)/height;
  for(let i=0;i<packed.length;i++){
   const label=this.roleLabels[i],p=packed[i],anchor=label.sprite.position.clone();label.sprite.visible=p.visible;label.leader.visible=p.visible;
   if(!p.visible)continue;
   label.sprite.scale.set(p.width*scale,p.height*scale,1);
   label.sprite.position.set(p.x/width*2-1,1-p.y/height*2,p.z).unproject(this.camera);
   const positions=label.leader.geometry.attributes.position;positions.setXYZ(0,anchor.x,anchor.y-.16,anchor.z);positions.setXYZ(1,label.sprite.position.x,label.sprite.position.y,label.sprite.position.z);positions.needsUpdate=true;label.leader.geometry.computeBoundingSphere();
  }
 }
 procedure(name,active){if(!active){delete this.procedureStarts[name];return 0;}if(this.procedureStarts[name]===undefined)this.procedureStarts[name]=this.time;return procedureBlend(this.time-this.procedureStarts[name]);}
 smoothPerson(person,dt){for(const vector of [person.root.position,person.torso.position,person.torso.rotation,person.head.rotation,...person.arms.flatMap(a=>[a.shoulder.rotation,a.elbow.rotation])]){let old=this.poseCache.get(vector);if(!old){old={x:vector.x,y:vector.y,z:vector.z};this.poseCache.set(vector,old);}for(const axis of ['x','y','z']){old[axis]=smoothValue(old[axis],vector[axis],dt);vector[axis]=old[axis];}}}
 cameraPreset(name){const presets={overview:[[3.9,3.25,4.7],[0,1.1,-.15]],patient:[[1.6,2.45,1.6],[0,1.3,-.35]],airway:[[-1.9,3.1,-2.0],[0,1.3,-.7]],defib:[[3.2,2.1,2.5],[.65,1.1,.25]],monitor:[[2.2,3,2.8],[0,1.3,0]],intro:[[5.2,3.2,5.9],[0,1,-.35]]};const p=presets[name]||presets.overview;this.desired.set(...p[0]);this.target.set(...p[1]);if(this.reduced){this.camera.position.copy(this.desired);this.look.copy(this.target);}}
 setQuality(q){this.quality=q;this.renderer.setPixelRatio(q==='high'?Math.min(devicePixelRatio,2):q==='low'?1:Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=q!=='low';this.resize();}
 resize(){const r=this.canvas.parentElement.getBoundingClientRect();if(!r.width||!r.height)return;this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();}
 update(dt,state){this.time+=state?.paused?0:dt;this.state=state||this.state;const s=this.state,t=this.time,idleT=this.reduced?0:t;this.camera.position.lerp(this.desired,this.reduced?1:Math.min(1,dt*4));this.look.lerp(this.target,this.reduced?1:Math.min(1,dt*4));this.camera.lookAt(this.look);
  if(this.visualSession!==s.session){this.visualSession=s.session;this.procedureStarts={};this.historyAt=null;this.historySeen=false;this.lastExpressionUpdate=null;for(const person of [this.patient,this.compressor,this.airway,this.nurse,this.family,this.bagger]){person.lastConcern=undefined;person.lastSpeaking=undefined;}}
  if(s.history&&!this.historySeen)this.historyAt=t;this.historySeen=!!s.history;
  const ventilating=!!s.bvm&&!s.clear,motion=teamMotion(s),breath=motion.breath,compression=motion.compression;
  const depth=(s.cprDepth||5.2)/100;this.patient.chest.scale.z=.48+(motion.compressing?-compression*depth/.25:breath*.025);this.patient.head.rotation.y=s.conscious?Math.sin(idleT*.3)*.04:.035;this.patient.head.rotation.z=s.conscious?Math.sin(idleT*.2)*.02:.04;if(this.patientHair)this.patientHair.visible=[2,3,5].includes(s.id);
  if(this.gown){this.gown.visible=!s.cpr&&!s.pads;this.gownSides.visible=!this.gown.visible;}
  const guarding=s.conscious&&(s.id===4||s.id===3&&s.unstable);this.patient.arms[1].shoulder.rotation.x=guarding?-.18:0;this.patient.arms[1].shoulder.rotation.z=guarding?-.35:s.pads?.32:0;this.patient.arms[1].elbow.rotation.x=guarding?-.35:0;
  for(const [index,person] of [this.patient,this.compressor,this.airway,this.nurse,this.family,this.bagger].entries()){
   const role=index===0?'patient':index===4?'family':'team';const face=facialTargets(s,role,t,this.historyAt,this.reduced);
   const expressiveDt=s.paused?0:dt;person.concern=smoothValue(person.concern??face.concern,face.concern,expressiveDt,6);
   const awake=index!==0||s.conscious,blink=awake&&!this.reduced&&Math.sin(idleT*.85+index*1.4)>.993;
   const close=(!awake||blink)?1:0;person.eyeClose=smoothValue(person.eyeClose??close,close,expressiveDt,30);
   for(const lid of person.lids){lid.position.y=.030-person.eyeClose*.021;lid.scale.y=.007+person.eyeClose*.017;}
   for(const [i,brow]of person.brows.entries())brow.rotation.z=(i?1:-1)*person.concern*.20;
   person.mouth.scale.y=smoothValue(person.mouth.scale.y,.005+face.speaking*.18,expressiveDt,20);
  }
  this.step.visible=!!s.cpr;this.compressor.root.position.set(s.cpr?-.88:-.85,s.cpr?.42:0,-.15);this.compressor.torso.position.z=s.cpr?.12:0;this.compressor.torso.rotation.x=s.cpr?.4+compression*.025:.04;if(s.fatigued&&s.cpr){this.compressor.torso.rotation.x=.55+compression*.012;this.compressor.torso.position.z=.16;}
  for(const [i,a]of this.compressor.arms.entries()){a.shoulder.rotation.x=s.cpr?-1.1:0;a.shoulder.rotation.z=s.cpr?(i?-.14:.14):0;a.elbow.rotation.x=s.cpr?-.22:-.08;}
  if(s.clear){for(const a of this.compressor.arms){a.shoulder.rotation.x=-.5;a.elbow.rotation.x=-1.4;}}
  this.smoothPerson(this.compressor,s.clear?.5:s.paused?0:dt);this.compressor.root.updateMatrixWorld(true);
  const connect=(o,a,b)=>{const d=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.y=d.length();o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());};
  for(let i=0;i<2;i++){const arm=this.compressor.arms[i],rig=this.cprArms[i];arm.shoulder.visible=!s.cpr;rig.upper.visible=rig.lower.visible=rig.hand.visible=!!s.cpr;if(s.cpr){const start=new T.Vector3();arm.shoulder.getWorldPosition(start);const wrist=new T.Vector3(.005+i*.016,1.445-compression*depth+i*.02,-.11);if(!rig.active)rig.wrist=arm.hand.getWorldPosition(new T.Vector3());rig.wrist.lerp(wrist,1-Math.exp(-(s.paused?0:dt)*12));wrist.copy(rig.wrist);const middle=start.clone().lerp(wrist,.5);middle.y+=.015;connect(rig.upper,start,middle);connect(rig.lower,middle,wrist);rig.hand.position.copy(wrist);}rig.active=!!s.cpr;}
  for(const a of this.airway.arms){a.shoulder.rotation.x=ventilating?-1.0:-.08;a.elbow.rotation.x=ventilating?-.9:-.1;}
  for(const person of [this.airway,this.nurse,this.family]){person.head.rotation.y=Math.sin(idleT*.4)*.035;person.torso.position.y=.99+Math.sin(idleT*1.1)*.003;}
  const padProgress=this.procedure('pads',s.pads),ivProgress=this.procedure('iv',s.iv),airwayProgress=this.procedure('airway',s.intubated);
  this.pad1.position.y=1.437+(1-padProgress)*.18;this.pad2.position.y=1.369+(1-padProgress)*.18;this.airwayTube.position.y=(1-airwayProgress)*.12;
  this.ivDressing.visible=this.ivHub.visible=!!s.iv;this.ivDressing.position.y=1.37+(1-ivProgress)*.12;this.ivHub.position.y=1.385+(1-ivProgress)*.12;
  this.pad1.visible=this.pad2.visible=this.cable.visible=!!s.pads;this.bag.visible=!!s.bvm;this.mask.visible=this.maskConnector.visible=!!s.bvm&&!s.intubated&&!s.airwayProcedure;this.airwayTube.visible=!!s.bvm&&(!!s.intubated||(s.airwayProcedure?.progress||0)>.55);this.bag.scale.y=.08-(Math.max(0,breath)*.025);
  // Keep the airway clinician's hands attached to the bag and mask throughout ventilation.
  this.airway.root.position.z=ventilating?-1.45:-1.65;
  this.airway.torso.position.z=ventilating?.16:0;
  this.airway.torso.rotation.x=ventilating?.24:0;
  this.smoothPerson(this.airway,s.clear?.5:s.paused?0:dt);this.airway.root.updateMatrixWorld(true);
  for(let i=0;i<2;i++){const arm=this.airway.arms[i],rig=this.airwayArms[i];arm.shoulder.visible=!ventilating;rig.upper.visible=rig.lower.visible=rig.hand.visible=ventilating;if(ventilating){const shoulder=new T.Vector3();arm.shoulder.getWorldPosition(shoulder);const wrist=i===0?new T.Vector3(...BVM_ANCHORS.leftHand):new T.Vector3(...BVM_ANCHORS.rightHand);
    if(s.airwayProcedure&&!s.clear){const progress=s.airwayProcedure.progress;wrist.y+=.08*Math.sin(Math.PI*progress)+(i?.04:0);wrist.x+=i?.035:-.035;}
    if(!rig.active)rig.wrist=arm.hand.getWorldPosition(new T.Vector3());rig.wrist.lerp(wrist,s.clear?1:1-Math.exp(-(s.paused?0:dt)*12));wrist.copy(rig.wrist);const elbow=shoulder.clone().lerp(wrist,.48);elbow.x+=i===0?-.1:.1;elbow.y-=.08;connect(rig.upper,shoulder,elbow);connect(rig.lower,elbow,wrist);rig.hand.position.copy(wrist);}rig.active=ventilating;}
  this.bagger.torso.rotation.x=ventilating?.1:0;this.bagger.head.rotation.x=ventilating?.15:0;this.smoothPerson(this.bagger,s.clear?.5:s.paused?0:dt);this.bagger.root.updateMatrixWorld(true);this.bagger.arms[0].shoulder.visible=!ventilating;this.bagArm.upper.visible=this.bagArm.lower.visible=this.bagArm.hand.visible=ventilating;if(ventilating){const start=new T.Vector3();this.bagger.arms[0].shoulder.getWorldPosition(start);const wrist=new T.Vector3(...BVM_ANCHORS.bagHand).add(new T.Vector3(0,-Math.max(0,breath)*.025,0)),elbow=start.clone().lerp(wrist,.5);elbow.y-=.08;connect(this.bagArm.upper,start,elbow);connect(this.bagArm.lower,elbow,wrist);this.bagArm.hand.position.copy(wrist);}
  if(s.clear){for(const a of this.airway.arms){a.shoulder.rotation.x=-.4;a.elbow.rotation.x=-1.5;}}
  if(s.auscAnim&&s.auscStart!=null){const e=s.t-s.auscStart,sites=[[0,1.415,.12,0],[.17,1.395,-.1,-.5],[-.17,1.395,-.1,.5]],i=e<3.4?0:e<6.6?1:2,[x,y,z,r]=sites[i];this.steth.visible=true;this.steth.position.set(x,y,z);this.steth.rotation.z=r;}else this.steth.visible=false;
  this.scope.visible=!!s.airwayProcedure&&!s.clear;this.scope.position.set(-.035,1.51,-.51);this.scope.rotation.z=-.22;
  if(s.airwayProcedure)this.airwayTube.position.y=.14*(1-procedureBlend(Math.max(0,s.airwayProcedure.progress-.5),.5));
  this.family.head.rotation.z=s.rosc?-.025:.09;this.family.head.rotation.x=facialTargets(s,'family',t,this.historyAt,this.reduced).speaking>0?Math.sin(idleT*2.8)*.025:.06;this.compressor.head.rotation.x=s.cpr?(s.fatigued?.5+Math.sin(idleT*2.2)*.06:.18):.04;if(s.fatigued&&s.cpr){this.compressor.mouth.scale.y=.08+.04*Math.sin(idleT*3.4);}this.airway.head.rotation.x=ventilating?.15:.03;
  this.nurse.arms[0].shoulder.rotation.x=s.iv?-.55:-.08;this.nurse.arms[0].elbow.rotation.x=s.iv?-1.15:-.08;
  this.family.arms[0].shoulder.rotation.x=-.4;this.family.arms[0].elbow.rotation.x=-1.8;
  this.family.arms[1].shoulder.rotation.x=-.25;this.family.arms[1].elbow.rotation.x=-1.65;
  // Procedure poses: nurse reaches for the antecubital IV during adenosine; head turned for carotid massage.
  if(s.adenosineAnim){this.nurse.arms[0].shoulder.rotation.x=-1.25;this.nurse.arms[0].elbow.rotation.x=-.35;this.nurse.arms[1].shoulder.rotation.x=-1.0;this.nurse.arms[1].elbow.rotation.x=-.6;}
  if(s.vagalAnim==='carotid'){this.patient.head.rotation.y=.55;this.nurse.arms[0].shoulder.rotation.x=-1.35;this.nurse.arms[0].elbow.rotation.x=-.5;}
  if(s.vagalAnim==='valsalva'){this.patient.head.rotation.x=-.25;this.patient.mouth.scale.y=.06+.03*Math.sin(t*6);}
  // Tired compressor: slumped torso, head drooping, bent elbows, breathing hard.
  // Pain without analgesia: grimace, arms jerk, head turns away.
  if(this.patientBaseY===undefined)this.patientBaseY=this.patient.root.position.y;const inPain=s.painUntil&&s.t<s.painUntil&&s.conscious;if(inPain){const k=Math.sin(idleT*14);this.patient.head.rotation.y=.35+.08*k;this.patient.mouth.scale.y=.2;for(const b of this.patient.brows)b.rotation.z=(b===this.patient.brows[0]?-1:1)*.5;for(const [i,a] of this.patient.arms.entries()){a.shoulder.rotation.x=-.18+.08*k;a.shoulder.rotation.z=(i?-1:1)*.22;a.elbow.rotation.x=-1.1;}this.patient.root.position.y=this.patientBaseY+.01*Math.abs(k);}else this.patient.root.position.y=this.patientBaseY;
  // Nurse giving a drug: turn to the IV arm and push.
  if(s.medAnimUntil&&s.t<s.medAnimUntil){this.nurse.root.rotation.y=-.95;this.nurse.arms[0].shoulder.rotation.x=-1.2;this.nurse.arms[0].elbow.rotation.x=-.5;this.nurse.arms[1].shoulder.rotation.x=-.9;this.nurse.arms[1].elbow.rotation.x=-.9;}else this.nurse.root.rotation.y=-.5;
  for(const person of [this.patient,this.nurse,this.family])this.smoothPerson(person,s.paused?0:dt);
  this.updateRoleLabels([s.clear?'Hands clear':motion.ventPause?'Pause for two breaths':s.cpr?(s.fatigued?'Tired — slower, shallower!':'Compressions in progress'):'Ready for compressions',s.clear?'Hands clear':s.airwayProcedure?s.airwayProcedure.label:s.intubated?'Advanced airway / capnography':s.bvm?'Bag-mask ventilation':'Assess breathing',s.charged?'Defibrillator charged':s.iv?'Access established':'Prepare access / equipment',s.history?'History shared':'Available for history',s.clear?'Hands clear':s.bvm?'Bag squeeze / chest rise':'Ready to assist ventilation']);
  for(const person of [this.compressor,this.airway,this.nurse,this.family,this.bagger]){const startled=(this.safetyRemaining||0)>0;person.root.rotation.z=startled?(this.reduced?.08:Math.sin(this.safetyRemaining*9)*.08):0;if(startled){for(const a of person.arms){a.shoulder.rotation.x=-1.6;a.elbow.rotation.x=-.7;}person.head.rotation.z=.15;person.mouth.scale.y=.04;}}
  this.renderer.render(this.scene,this.camera);
 }
 drawMonitor(s){if(!this.monitorCanvas)return;const c=this.monitorCanvas.getContext('2d');c.fillStyle='#07171b';c.fillRect(0,0,512,300);c.fillStyle='#a4f3c7';c.font='bold 25px sans-serif';c.fillText(s.monitor?'II  •  LIVE ECG':'ATTACH MONITOR',18,36);if(s.monitor){c.strokeStyle='#89f5ad';c.lineWidth=3;c.beginPath();for(let i=0;i<490;i++){const t=s.t-5+i/98,y=140-waveform(t,displayRhythm(s),s.hr,s.pacerRate||70)*65+(s.cpr?Math.sin(t*12)*7:0);i?c.lineTo(i+10,y):c.moveTo(i+10,y);}c.stroke();if(s.pacing){const rr=60/s.pacerRate,offset=s.electricalCapture?.215:.24;c.beginPath();for(let n=Math.ceil((s.t-5-offset)/rr);n*rr+offset<=s.t;n++){const xx=(n*rr+offset-(s.t-5))*98+10;c.moveTo(xx,140);c.lineTo(xx,39);}c.stroke();}c.fillText('HR '+s.hr+'   SpO₂ '+(s.pulse?(s.spo2??'—'):'—'),18,235);c.fillText('ETCO₂ '+(s.capno?Math.round(s.etco2):'—'),18,275);}this.monitorTexture.needsUpdate=true;}
 dispose(){this.resizeObserver.disconnect();this.renderer.dispose();}
}
