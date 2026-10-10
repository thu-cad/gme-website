import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const host = document.getElementById('model-viewport');
const status = document.getElementById('model-status');
try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, matchMedia("(max-width:700px)").matches ? 1.5 : 2));
  renderer.setClearColor(0xf4f8f6);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;renderer.toneMappingExposure = 1;
  renderer.domElement.setAttribute('aria-label', '可交互的三维模型');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .09;
  controls.minDistance = 3.5;
  controls.maxDistance = 18;
  controls.maxPolarAngle = Math.PI * .93;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x637d88, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 8, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9acbff, .9); fill.position.set(-5, 2, -3); scene.add(fill);
  const grid = new THREE.GridHelper(9, 18, 0xbacfc3, 0xdce7e1); grid.position.y = -1.38; scene.add(grid);
  const material = new THREE.MeshStandardMaterial({ color: 0x298ec3, metalness: .32, roughness: .32, side: THREE.DoubleSide });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x1e5672, transparent: true, opacity: .55 });
  let model, wire = false, active = false, needsRender = true;
  controls.addEventListener("change", () => { needsRender = true; });
  let requestVersion=0, controller, desired, loadedName, loadedQuality, home=[5,3.8,5.2];
  const realCases=Object.fromEntries((window.GME_REAL_CASES||[]).map(c=>[c.id,c]));
  const retry=document.getElementById("view-retry");
  function solid(geometry, group, edges = true) {
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    if (edges) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 28), edgeMaterial));
    return mesh;
  }
  function plateShape() {
    const shape = new THREE.Shape();
    shape.moveTo(-1.8, -1.25); shape.lineTo(1.8, -1.25); shape.lineTo(1.8, 1.25); shape.lineTo(-1.8, 1.25); shape.closePath();
    for (const x of [-1.38, 1.38]) for (const y of [-.84, .84]) {
      const hole = new THREE.Path(); hole.absarc(x, y, .16, 0, Math.PI * 2, true); shape.holes.push(hole);
    }
    return shape;
  }
  function bracket(group) {
    const base = solid(new THREE.ExtrudeGeometry(plateShape(), { depth: .27, bevelEnabled: false, curveSegments: 32 }), group);
    base.rotation.x = -Math.PI / 2; base.position.y = -1.25;
    const ring = new THREE.Shape(); ring.absarc(0, 0, .76, 0, Math.PI * 2, false);
    const bore = new THREE.Path(); bore.absarc(0, 0, .43, 0, Math.PI * 2, true); ring.holes.push(bore);
    const tube = solid(new THREE.ExtrudeGeometry(ring, { depth: 1.95, bevelEnabled: false, curveSegments: 64 }), group);
    tube.rotation.x = -Math.PI / 2; tube.position.y = -.98;
    for (const direction of [-1, 1]) {
      const rib = new THREE.Shape(); rib.moveTo(.66, -.98); rib.lineTo(1.30, -.98); rib.lineTo(.66, .45); rib.closePath();
      const mesh = solid(new THREE.ExtrudeGeometry(rib, { depth: .18, bevelEnabled: false }), group);
      mesh.scale.x = direction; mesh.position.z = -.09;
    }
  }
  function sweep(group) {
    const profile = new THREE.Shape();
    profile.moveTo(-.3, -.14); profile.lineTo(.3, -.14); profile.lineTo(.3, .14); profile.lineTo(-.3, .14); profile.closePath();
    const points = [];
    for (let i = 0; i <= 20; i++) { const t = i / 20 * Math.PI * 1.65; points.push(new THREE.Vector3(1.5 * Math.cos(t), -.65 + i / 20 * 1.55, 1.5 * Math.sin(t))); }
    const path = new THREE.CatmullRomCurve3(points);
    solid(new THREE.ExtrudeGeometry(profile, { steps: 180, bevelEnabled: false, extrudePath: path }), group);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(180)), new THREE.LineBasicMaterial({ color: 0xffc36b, depthTest: false, transparent: true, opacity: .8 }));
    line.renderOrder = 2; group.add(line);
  }
  function skinning(group) {
    const points = [], indices = [], rows = 44, cols = 88;
    function pos(u, v) {
      const t = v * Math.PI * 2, twist = u * Math.PI * .7;
      const rx = 1.05 + .28 * Math.sin(u * Math.PI), rz = .64 + .25 * Math.cos(u * Math.PI);
      const x = rx * Math.cos(t), z = rz * Math.sin(t);
      return new THREE.Vector3(x * Math.cos(twist) - z * Math.sin(twist), -1.12 + u * 2.4, x * Math.sin(twist) + z * Math.cos(twist));
    }
    for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) points.push(...pos(i / rows, j / cols).toArray());
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const a = i * (cols + 1) + j, b = a + cols + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); solid(geometry, group, false);
    for (const u of [0, .25, .5, .75, 1]) { const row = []; for (let j = 0; j <= cols; j++) row.push(pos(u, j / cols)); group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(row), edgeMaterial)); }
  }
  function fillet(group) {
    const shape = new THREE.Shape(), a = .92, r = .24;
    shape.moveTo(-a+r,-a); shape.lineTo(a-r,-a); shape.quadraticCurveTo(a,-a,a,-a+r);
    shape.lineTo(a,a-r); shape.quadraticCurveTo(a,a,a-r,a);
    shape.lineTo(-a+r,a); shape.quadraticCurveTo(-a,a,-a,a-r);
    shape.lineTo(-a,-a+r); shape.quadraticCurveTo(-a,-a,-a+r,-a);
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:1.35,bevelEnabled:true,bevelThickness:.2,bevelSize:.18,bevelSegments:12,curveSegments:24});
    geometry.center(); solid(geometry,group);
  }
  function shell(group) {
    const shape=new THREE.Shape();shape.moveTo(-1.65,-1.13);shape.lineTo(1.65,-1.13);shape.lineTo(1.65,1.13);shape.lineTo(-1.65,1.13);shape.closePath();
    const hole=new THREE.Path();hole.moveTo(-1.49,-.97);hole.lineTo(-1.49,.97);hole.lineTo(1.49,.97);hole.lineTo(1.49,-.97);hole.closePath();shape.holes.push(hole);
    const wall=solid(new THREE.ExtrudeGeometry(shape,{depth:1.35,bevelEnabled:false}),group);wall.rotation.x=-Math.PI/2;wall.position.y=-1.12;
    const floor=solid(new THREE.BoxGeometry(3.3,.16,2.26),group);floor.position.y=-1.2;
    for(const x of [-1.14,1.14])for(const z of [-.65,.65]){const boss=new THREE.Group();ringPart(boss,.24,.105,.72,-1.12);boss.position.set(x,0,z);group.add(boss);}
    for(const x of [-.62,0,.62]){const rib=solid(new THREE.BoxGeometry(.095,.62,1.95),group);rib.position.set(x,-.81,0);}
    const divider=solid(new THREE.BoxGeometry(2.95,.42,.09),group);divider.position.set(0,-.91,0);
    for(const side of [-1,1])for(const z of [-.72,.72]){
      const tabShape=new THREE.Shape();tabShape.moveTo(-.28,-.24);tabShape.lineTo(.28,-.24);tabShape.lineTo(.28,.24);tabShape.lineTo(-.28,.24);tabShape.closePath();const bore=new THREE.Path();bore.absarc(0,0,.095,0,Math.PI*2,true);tabShape.holes.push(bore);
      const tab=solid(new THREE.ExtrudeGeometry(tabShape,{depth:.14,bevelEnabled:false,curveSegments:24}),group);tab.rotation.x=-Math.PI/2;tab.position.set(side*1.81,-1.2,z);
    }
    group.scale.setScalar(.9);
  }
  function intersection(group) {
    // Bicubic Bezier patch: a single-span tensor-product spline surface.
    // Uniform X/Z control coordinates make x(u), z(v) linear, so the
    // cylinder intersection can be evaluated directly on the patch.
    const heights=[[-.85,-.2,1.35,.65],[-.45,1.6,-1.45,.35],[.6,-1.5,1.75,-.5],[.95,.3,-.65,.8]];
    function bernstein(t){return [(1-t)**3,3*t*(1-t)**2,3*t*t*(1-t),t**3];}
    function patch(u,v){const bu=bernstein(u),bv=bernstein(v);let y=0;for(let i=0;i<4;i++)for(let j=0;j<4;j++)y+=bu[i]*bv[j]*heights[i][j];return new THREE.Vector3((u-.5)*3.8,y*1.8,(v-.5)*3.2);}
    const vertices=[],indices=[],n=80;
    for(let i=0;i<=n;i++)for(let j=0;j<=n;j++)vertices.push(...patch(i/n,j/n).toArray());
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;indices.push(a,a+1,b,b,a+1,b+1);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x328ec1,roughness:.42,metalness:.12,side:THREE.DoubleSide,transparent:true,opacity:.8})));
    for(let k=0;k<=10;k++)for(const direction of [0,1]){
      const points=[];for(let i=0;i<=100;i++)points.push(direction?patch(k/10,i/100):patch(i/100,k/10));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x246485,transparent:true,opacity:.45})));
    }
    for(const [cx,cz,r] of [[-.79,-.16,.57],[.79,.15,.62]]){
      const cylinder=new THREE.Mesh(new THREE.CylinderGeometry(r,r,2.6,80,1,true),new THREE.MeshStandardMaterial({color:0x8fc9b0,transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false,roughness:.4}));cylinder.position.set(cx,.15,cz);group.add(cylinder);
      const points=[];
      for(let i=0;i<240;i++){const t=i/240*Math.PI*2,x=cx+r*Math.cos(t),z=cz+r*Math.sin(t);points.push(patch(x/3.8+.5,z/3.2+.5));}
      const curve=new THREE.CatmullRomCurve3(points,true,'centripetal');
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,240,.024,8,true),new THREE.MeshStandardMaterial({color:0xffbd45,emissive:0x593800,roughness:.35})));
      for(const y of [-1.15,1.45]){const rim=new THREE.Mesh(new THREE.TorusGeometry(r,.009,5,80),new THREE.MeshBasicMaterial({color:0x569c83}));rim.rotation.x=Math.PI/2;rim.position.set(cx,y,cz);group.add(rim);}
    }
  }
  function defeature(group) {
    const highlight=new THREE.MeshStandardMaterial({color:0xe7ae59,roughness:.36,metalness:.15});
    function part(complex,offset){
      const g=new THREE.Group();g.position.x=offset;g.scale.setScalar(.66);group.add(g);
      const outline=new THREE.Shape();outline.moveTo(-1.25,-.9);outline.lineTo(1.25,-.9);outline.lineTo(1.25,.9);outline.lineTo(-1.25,.9);outline.closePath();
      for(const x of [-.94,.94])for(const z of [-.62,.62]){const p=new THREE.Path();p.absarc(x,z,.12,0,Math.PI*2,true);outline.holes.push(p);}
      if(complex)for(const z of [-.5,.5])for(const x of [-.5,0,.5]){const p=new THREE.Path();p.absarc(x,z,.068,0,Math.PI*2,true);outline.holes.push(p);}
      const base=solid(new THREE.ExtrudeGeometry(outline,{depth:.34,bevelEnabled:false,curveSegments:24}),g);base.rotation.x=-Math.PI/2;base.position.y=-.85;
      ringPart(g,.53,.3,1.18,-.51);
      if(complex){
        for(const side of [-1,1]){const rib=new THREE.Shape();rib.moveTo(.51,-.5);rib.lineTo(1.04,-.5);rib.lineTo(.51,.42);rib.closePath();const m=new THREE.Mesh(new THREE.ExtrudeGeometry(rib,{depth:.1,bevelEnabled:false}),highlight);m.scale.x=side;m.position.z=-.05;g.add(m);}
        for(const z of [-.61,.61]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.4,24),highlight);m.position.set(0,-.31,z);g.add(m);}
        for(const x of [-.5,0,.5])for(const z of [-.5,.5]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.075,.014,6,24),highlight);ring.rotation.x=Math.PI/2;ring.position.set(x,-.5,z);g.add(ring);}
      }
    }
    part(true,-1.03);part(false,1.03);
  }

  function ringPart(group, outer, inner, height, y, holes=0, pitch=0, holeR=.12) {
    const shape=new THREE.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);
    const cut=new THREE.Path();cut.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(cut);
    for(let i=0;i<holes;i++){const t=i/holes*Math.PI*2,h=new THREE.Path();h.absarc(Math.cos(t)*pitch,Math.sin(t)*pitch,holeR,0,Math.PI*2,true);shape.holes.push(h);}
    const mesh=solid(new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:64}),group);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;return mesh;
  }
  function flange(group) {
    ringPart(group,1.65,.56,.3,-.95,12,1.31,.13);
    ringPart(group,.95,.56,.15,-.65);
    ringPart(group,.74,.56,1.28,-.5);
    ringPart(group,.97,.56,.23,.78,8,.8,.085);
    for(let i=0;i<8;i++){const rib=new THREE.Shape();rib.moveTo(.73,-.64);rib.lineTo(1.2,-.64);rib.lineTo(.73,.42);rib.closePath();const m=solid(new THREE.ExtrudeGeometry(rib,{depth:.075,bevelEnabled:false}),group);m.rotation.y=i*Math.PI/4;}
    group.rotation.x=.12;
  }
  function bearing(group) {
    const base=solid(new THREE.ExtrudeGeometry(plateShape(),{depth:.3,bevelEnabled:false,curveSegments:32}),group);base.rotation.x=-Math.PI/2;base.position.y=-1.2;
    const carrier=new THREE.Group();ringPart(carrier,1.06,.66,.65,0);carrier.rotation.x=Math.PI/2;carrier.position.set(0,.02,-.325);group.add(carrier);
    for(const side of [-1,1]) {
      const foot=solid(new THREE.BoxGeometry(.48,1.1,.78),group);foot.position.set(side*.91,-.53,0);
      const rib=new THREE.Shape();rib.moveTo(.55,-.9);rib.lineTo(1.4,-.9);rib.lineTo(.84,.3);rib.closePath();const m=solid(new THREE.ExtrudeGeometry(rib,{depth:.15,bevelEnabled:false}),group);m.scale.x=side;m.position.z=.32;
    }
    const front=new THREE.Group();ringPart(front,1.17,.65,.13,0,8,.94,.085);front.rotation.x=Math.PI/2;front.position.z=.48;group.add(front);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const b=solid(new THREE.CylinderGeometry(.095,.095,.16,6),group);b.rotation.x=Math.PI/2;b.position.set(.94*Math.cos(a),.94*Math.sin(a)+.02,.5);}
  }
  function pipeNetwork(group) {
    function tube(points,r){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));solid(new THREE.TubeGeometry(path,100,r,24,false),group);}
    tube([[-1.75,-.45,0],[-.8,-.45,0],[.5,-.45,0],[1.75,-.45,0]],.27);
    for(const x of [-1.05,0,1.05]) {
      tube([[x,-.45,0],[x,.15,0],[x,.78,.1],[x,1.02,.6],[x,1.02,1.12]],.18);
      const f=new THREE.Group();ringPart(f,.36,.18,.13,0,6,.28,.042);f.rotation.x=Math.PI/2;f.position.set(x,1.02,1.14);group.add(f);
    }
    for(const x of [-1.8,1.8]){const f=new THREE.Group();ringPart(f,.5,.27,.16,0,8,.39,.055);f.rotation.z=Math.PI/2;f.position.set(x,-.45,0);group.add(f);}
    for(const x of [-1.1,1.1]){const support=solid(new THREE.BoxGeometry(.3,.48,.78),group);support.position.set(x,-.95,0);}
    group.scale.setScalar(.86);
  }
  function impeller(group) {
    ringPart(group,1.62,.32,.14,-.9);
    ringPart(group,.55,.32,.9,-.76);
    for(let blade=0;blade<11;blade++){
      const vertices=[],idx=[],nu=30,nv=9;
      for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){
        const u=i/nu,v=j/nv,r=.53+u*1.06,t=blade*Math.PI*2/11+u*.77+v*.075;
        vertices.push(r*Math.cos(t),-.75+v*(.97-.5*u)+.14*Math.sin(u*Math.PI),r*Math.sin(t));
      }
      for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;idx.push(a,b,a+1,b,b+1,a+1);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(idx);g.computeVertexNormals();solid(g,group,false);
    }
  }

  function gear(group) {
    const profile=new THREE.Shape(), teeth=28;
    for(let i=0;i<teeth*4;i++){const t=i/(teeth*4)*Math.PI*2,r=i%4===1||i%4===2?1.64:1.45;const x=r*Math.cos(t),y=r*Math.sin(t);if(i===0)profile.moveTo(x,y);else profile.lineTo(x,y);}profile.closePath();
    const bore=new THREE.Path();bore.absarc(0,0,.32,0,Math.PI*2,true);profile.holes.push(bore);
    for(let i=0;i<8;i++){const t=i/8*Math.PI*2,h=new THREE.Path();h.absarc(.96*Math.cos(t),.96*Math.sin(t),.19,0,Math.PI*2,true);profile.holes.push(h);}
    const mesh=solid(new THREE.ExtrudeGeometry(profile,{depth:.38,bevelEnabled:true,bevelThickness:.025,bevelSize:.018,bevelSegments:2,curveSegments:32}),group);mesh.rotation.x=-Math.PI/2;mesh.position.y=-.5;
    ringPart(group,.59,.32,.52,-.12);ringPart(group,.68,.32,.1,.4);
  }
  function offsetSurface(group) {
    function point(u,v){const x=(u-.5)*3.2,z=(v-.5)*2.5,y=.6*Math.sin(x*1.3)*Math.cos(z*1.2)+.2*x;return new THREE.Vector3(x,y,z);}
    function normal(u,v){const x=(u-.5)*3.2,z=(v-.5)*2.5;return new THREE.Vector3(-(.78*Math.cos(x*1.3)*Math.cos(z*1.2)+.2),1,.72*Math.sin(x*1.3)*Math.sin(z*1.2)).normalize();}
    for(const offset of [0,.42]) {
      const vertices=[],indices=[],n=55;
      for(let i=0;i<=n;i++)for(let j=0;j<=n;j++)vertices.push(...point(i/n,j/n).addScaledVector(normal(i/n,j/n),offset).toArray());
      for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;indices.push(a,a+1,b,b,a+1,b+1);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:offset?0x78bea2:0x298ec3,side:THREE.DoubleSide,transparent:true,opacity:.76,roughness:.4})));
    }
    for(const u of [.15,.5,.85])for(const v of [.15,.5,.85]){const p=point(u,v),n=normal(u,v);group.add(new THREE.ArrowHelper(n,p,.42,0xeab54f,.08,.04));}
  }
  function transition(group) {
    const positions=[],indices=[],nu=65,nv=96;
    function point(u,v){const t=v*Math.PI*2,blend=u*u*(3-2*u),cx=.7*Math.sin(u*Math.PI/2),cy=-1.18+2.65*u;
      const c=Math.cos(t),s=Math.sin(t),squareX=Math.sign(c)*Math.pow(Math.abs(c),.48)*1.12,squareZ=Math.sign(s)*Math.pow(Math.abs(s),.48)*.78;
      return new THREE.Vector3(cx+(1-blend)*squareX+blend*.65*c,cy,(1-blend)*squareZ+blend*.65*s);}
    for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++)positions.push(...point(i/nu,j/nv).toArray());
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;indices.push(a,b,a+1,b,b+1,a+1);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();solid(geo,group,false);
    for(const u of [0,.2,.4,.6,.8,1]){const pts=[];for(let j=0;j<=nv;j++)pts.push(point(u,j/nv));group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x82ddcb})));}
    const top=new THREE.Group();ringPart(top,.9,.65,.13,1.47,8,.78,.055);top.position.x=.7;group.add(top);
  }


  function reset() {camera.position.set(...home);controls.target.set(0,0,0);controls.update();}
  function dispose(object){if(!object)return;scene.remove(object);const geometries=new Set(),materials=new Set();object.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material&&o.material!==material&&o.material!==edgeMaterial)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  function decode(buffer){
    const h=new Uint32Array(buffer,0,8),[magic,version,nv,ni]=h;
    if(magic!==0x31454d47||version!==1||!nv||ni%3||buffer.byteLength!==32+nv*36+ni*4)throw new Error('Invalid GME mesh');
    const geometry=new THREE.BufferGeometry(),data=new THREE.InterleavedBuffer(new Float32Array(buffer,32,nv*9),9);
    geometry.setAttribute('position',new THREE.InterleavedBufferAttribute(data,3,0));geometry.setAttribute('normal',new THREE.InterleavedBufferAttribute(data,3,3));geometry.setAttribute('color',new THREE.InterleavedBufferAttribute(data,3,6));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,32+nv*36,ni),1));
    geometry.computeBoundingBox();const size=new THREE.Vector3(),center=new THREE.Vector3();geometry.boundingBox.getSize(size);geometry.boundingBox.getCenter(center);
    if(!Number.isFinite(size.length())||size.length()<=0)throw new Error('Invalid GME bounds');
    geometry.translate(-center.x,-center.y,-center.z);geometry.rotateX(-Math.PI/2);const scale=4.1/Math.max(size.x,size.y,size.z);geometry.scale(scale,scale,scale);geometry.computeBoundingBox();geometry.computeBoundingSphere();
    grid.position.y=geometry.boundingBox.min.y-.08;
    const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,metalness:.18,roughness:.48,side:THREE.DoubleSide,wireframe:wire}));
    return mesh;
  }
  const quality = document.getElementById('model-quality');
  const qualityStatus = document.getElementById('model-quality-status');
  function selectedAsset(c) {
    const preferLite = quality.value === 'lite' || (quality.value === 'auto' &&
      (matchMedia('(max-width:700px)').matches || navigator.connection?.saveData || c.compressedBytes > 4000000));
    return c.lite && preferLite ? c.lite : c;
  }
  async function downloadMesh(response, compressed, expectedBytes, version) {
    const chunks = [], reader = response.body?.getReader();
    let received = 0;
    if (!reader) chunks.push(new Uint8Array(await response.arrayBuffer()));
    while (reader) {
      const {done, value} = await reader.read();
      if (done) break;
      if (version !== requestVersion) { await reader.cancel(); return null; }
      chunks.push(value); received += value.byteLength;
      const percent = expectedBytes ? Math.min(99, Math.floor(received / expectedBytes * 100)) : 0;
      status.textContent = `正在下载模型 ${percent}% · ${(received / 1000000).toFixed(1)} MB`;
    }
    if (version !== requestVersion) return null;
    status.textContent = '正在准备三维显示…';
    const blob = new Blob(chunks);
    return compressed
      ? new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
      : blob.arrayBuffer();
  }
  function clearModel() {
    ++requestVersion; controller?.abort(); dispose(model); model = null;
    desired = null; loadedName = null; loadedQuality = null;
    host.dataset.model = ''; delete host.dataset.loading; delete host.dataset.error;
    status.hidden = true; qualityStatus.textContent = ''; needsRender = true;
  }
  async function load(name, force = false) {
    if (!name) { clearModel(); return; }
    desired = name;
    const c = realCases[name], asset = c ? selectedAsset(c) : null;
    const mode = c && asset === c.lite ? 'lite' : 'full';
    if (!force && loadedName === name && loadedQuality === mode) return;
    const version = ++requestVersion;
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;
    const signal = requestController.signal;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; requestController.abort(); }, 45000);
    dispose(model); model = null; loadedName = null;
    host.dataset.model = ''; host.dataset.loading = name; delete host.dataset.error;
    status.hidden = false; status.textContent = '正在连接模型资源…'; retry.hidden = true;
    needsRender = true;
    try {
      if (c) {
        const compressed = asset.meshCompressed && typeof DecompressionStream !== 'undefined';
        const bytes = compressed ? asset.compressedBytes : asset.bytes;
        qualityStatus.textContent = `${mode === 'lite' ? '轻量' : '高清'}显示 · 约 ${(bytes / 1000000).toFixed(2)} MB · ${(asset.triangles / 10000).toFixed(1)} 万个三角形`;
        const response = await fetch(compressed ? asset.meshCompressed : asset.mesh, {signal});
        if (!response.ok) throw new Error('Model HTTP ' + response.status);
        const buffer = await downloadMesh(response, compressed, bytes, version);
        if (version !== requestVersion) return;
        if (timedOut) throw new Error('Model download timed out');
        if (signal.aborted || !buffer) return;
        model = decode(buffer); home = c.view || [5, 3.8, 5.2];
        host.dataset.source = 'GME'; host.dataset.triangles = String(asset.triangles);
      } else {
        qualityStatus.textContent = '前端几何原理示意';
        model = new THREE.Group();
        ({boolean:flange,sweep:pipeNetwork,skinning:impeller,fillet:bearing,shell,intersection,defeature,gear,offsetSurface,transition}[name] || bracket)(model);
        grid.position.y = -1.38; home = [5,3.8,5.2];
        host.dataset.source = 'illustration'; delete host.dataset.triangles;
      }
      scene.add(model); model.traverse(o => { if (o.isMesh) o.material.wireframe = wire; });
      reset(); loadedName = name; loadedQuality = mode; host.dataset.model = name;
      delete host.dataset.loading; status.hidden = true; needsRender = true;
    } catch (error) {
      if (version !== requestVersion || (signal.aborted && !timedOut)) return;
      dispose(model); model = null; delete host.dataset.loading; host.dataset.error = 'load';
      status.textContent = timedOut ? '下载超时，请重试、切换轻量显示，或查看下方结果图。' : '模型加载失败，可重试或查看下方 Studio 结果图。';
      status.hidden = false; retry.hidden = false;
      const reference = document.querySelector('.reference');
      if (c) { reference.hidden = false; reference.open = true; }
      console.error('GME model load failed:', name, error);
    } finally { clearTimeout(timeout); }
  }
  window.addEventListener('gme-case-change', event => {
    if (!event.detail) { clearModel(); return; }
    desired = event.detail;
    if (active) load(desired);
    else if (host.dataset.loading) { controller?.abort(); ++requestVersion; delete host.dataset.loading; }
  });
  quality.onchange = () => { if (desired && active) load(desired, true); };
  retry.onclick = () => load(desired, true);
  document.getElementById('view-reset').onclick = reset;
  document.getElementById('view-wire').onclick = e => { needsRender = true; wire = !wire; material.wireframe = wire; model?.traverse(o=>{if(o.isMesh)o.material.wireframe=wire;}); e.currentTarget.setAttribute('aria-pressed', String(wire)); e.currentTarget.textContent = wire ? '隐藏网格' : '显示网格'; };
  host.addEventListener('keydown', e => {
    const offset = camera.position.clone().sub(controls.target), sphere = new THREE.Spherical().setFromVector3(offset);
    if (e.key === 'ArrowLeft') sphere.theta -= .12;
    else if (e.key === 'ArrowRight') sphere.theta += .12;
    else if (e.key === 'ArrowUp') sphere.phi -= .12;
    else if (e.key === 'ArrowDown') sphere.phi += .12;
    else if (e.key === '+' || e.key === '=') sphere.radius /= 1.12;
    else if (e.key === '-') sphere.radius *= 1.12;
    else if (e.key.toLowerCase() === 'r') { e.preventDefault(); reset(); return; }
    else return;
    e.preventDefault(); sphere.makeSafe(); sphere.radius = THREE.MathUtils.clamp(sphere.radius, controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sphere)); controls.update();
  });
  new ResizeObserver(() => { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); needsRender = true; }).observe(host);
  new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active&&desired&&loadedName!==desired&&!host.dataset.loading)load(desired);},{rootMargin:'120px'}).observe(host);
  desired=document.querySelector('[data-case][aria-selected=true]')?.dataset.case||'airliner';
  renderer.setAnimationLoop(() => { if (active && !document.hidden) { controls.update(); if (needsRender) { renderer.render(scene, camera); needsRender = false; } } });
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); status.textContent = '三维显示暂时中断，请刷新页面。也可展开下方的原始结果图。'; status.hidden = false; });
} catch (error) {
  status.textContent = '当前浏览器无法启用三维显示，请使用支持 WebGL 的浏览器。可展开下方查看原始结果图。';
  host.dataset.error='webgl';document.querySelector('.reference').open=true;
  document.getElementById('view-reset').disabled = true; document.getElementById('view-wire').disabled = true;
  console.error('GME viewer initialization failed:', error);
}
