const menu=document.querySelector('.menu');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);document.querySelector('nav').classList.toggle('open',open)});document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('nav').classList.remove('open')}));
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  heroVideo.muted = true;
  if (!reducedMotion.matches) heroVideo.play().catch(() => {});
  reducedMotion.addEventListener('change', event => {
    if (event.matches) heroVideo.pause();
  });
}
const cases={boolean:{n:'001',code:'BOOLEANS / PART MODELING',title:'从基本体到机械零件',description:'将底板、筒体与加强结构组合，再通过减运算形成孔与内腔。复杂零件可以分解为一组可验证的几何操作。',points:['构造用于组合与切除的基本实体','用布尔操作逐步形成目标形状','在 Studio 中观察最终实体与边界'],alt:'通过布尔运算组合的蓝色带孔机械支架'},sweep:{n:'002',code:'SWEEPING / PROFILE & PATH',title:'让截面沿路径形成形状',description:'用轮廓定义截面，用路径控制延伸方向。扫掠把曲线输入转化为可观察的三维形状，连接线框设计与曲面建模。',points:['准备截面轮廓与扫掠路径','设置扫掠条件并生成几何结果','对照输入曲线检查形状与边界'],alt:'左侧输入轮廓与右侧蓝色扫掠曲面'},skinning:{n:'003',code:'SKINNING / SURFACE CONSTRUCTION',title:'在多个截面之间构造曲面',description:'通过一组截面约束描述形状的变化，蒙皮操作连接这些截面，形成连续的曲面表达。',points:['组织用于描述形状变化的截面','使用蒙皮模块构造目标曲面','检查曲面连接、边界与显示结果'],alt:'由变化截面构造的蓝色弯曲蒙皮曲面'}};Object.assign(cases,{"fillet": {"n": "004", "code": "BLENDING / EDGE TRANSITION", "title": "让尖锐边界形成平滑过渡", "description": "圆角用于连接相邻表面，改善零件边缘与局部形状。三维示意展示圆角方块，可从不同方向观察过渡面。", "points": ["对比平面与圆角过渡面的连接", "旋转查看顶面、侧面和角部形状", "开启网格观察曲面离散化结构"], "alt": "GME Studio 立方体圆角结果"}, "shell": {"n": "005", "code": "SHELLING / THIN-WALLED PART", "title": "从实心体到薄壁结构", "description": "抽壳移除选定开口面并形成内外壁，常用于壳体与容器建模。示意模型呈现开口壳体、底部与壁厚关系。", "points": ["从开口观察内部空间", "旋转查看底面与侧壁的连接", "区分外部尺寸、内部空间和壁厚"], "alt": "GME Studio 长方体开口抽壳结果"}, "intersection": {"n": "006", "code": "INTERSECTORS / SURFACE INTERSECTION", "title": "找出两张曲面的共同边界", "description": "曲面求交是布尔与裁剪等操作的基础。示意模型以两个半透明球面展示空间相交关系，金色曲线标出它们的交线。", "points": ["观察两球的重叠区域", "沿不同视角追踪闭合交线", "理解交线与两张曲面的几何关系"], "alt": "GME Studio 球面与球面求交结果"}, "defeature": {"n": "007", "code": "DEFEATURE / GEOMETRY SIMPLIFICATION", "title": "保留主体，简化局部细节", "description": "特征去除用于几何简化，便于后续分析与处理。左侧展示带凸台的零件，右侧展示移除局部凸台后的主体形状。", "points": ["左侧金色凸台标出待移除的局部特征", "右侧展示保留主体后的简化形状", "旋转比较简化前后的空间结构"], "alt": "特征去除前后三维示意", "reference": false}});Object.assign(cases,{"boolean": {"n": "001", "code": "ENGINEERING / MULTI-HOLE FLANGE", "title": "多孔法兰与加强筋结构", "description": "将环形底座、阶梯轴套、两组螺栓孔与周向加强筋组织成一个工程零件。比单次布尔运算更进一步，观察多种结构在同一模型中的空间关系。", "points": ["12 个底座安装孔与 8 个上法兰连接孔", "贯穿内孔、阶梯轴套与双层法兰", "8 道径向加强筋连接轴套与底座"], "alt": "GME Studio 多孔法兰参考结果"}, "fillet": {"n": "004", "code": "ENGINEERING / BEARING HOUSING", "title": "带筋轴承座与连接结构", "description": "轴承座同时涉及环形支承、安装底板、加强筋和紧固件布局。旋转模型，检查中心通孔、前盖与底座之间的装配关系。", "points": ["中心轴承孔与环形前盖", "四孔安装底板、双侧支承与加强筋", "环向布置的 8 个六角紧固件"], "alt": "GME Studio 复杂轴承盖参考结果"}, "sweep": {"n": "002", "code": "ENGINEERING / BRANCH MANIFOLD", "title": "多分支歧管与法兰连接", "description": "以主管、三条弯曲支路和端部法兰表达管路系统。转动视角观察各分支的走向、连接位置及支架布局。", "points": ["连续主管与三条空间弯曲支路", "主管两端与支路出口的孔阵法兰", "支承脚座与分支间距的空间布局"], "alt": "GME Studio 三通管参考结果"}, "skinning": {"n": "003", "code": "ENGINEERING / FREEFORM IMPELLER", "title": "十一叶片自由曲面叶轮", "description": "通过沿半径变化的扭转与高度构造弯曲叶片，再沿轮毂周向阵列。适合观察自由曲面、重复结构和轮毂之间的关系。", "points": ["11 片沿径向扭转的曲面叶片", "逐渐变化的叶片高度与通道宽度", "带中心轴孔的轮毂和底盘"], "alt": "自由曲面叶轮三维示意", "reference": false}});Object.assign(cases,{"shell": {"n": "005", "code": "ENGINEERING / RIBBED ENCLOSURE", "title": "带筋薄壁壳体与安装结构", "description": "以开口设备壳体为主题，将薄壁、底板、内部隔筋、空心安装柱和外部连接耳组合展示。旋转模型，从内部和底部观察结构关系。", "points": ["四个空心安装柱与四个带孔连接耳", "三道横向隔筋与一道纵向连接筋", "连续外壁、薄底板及内部多分区结构"], "alt": "GME Studio 抽壳基础参考结果"}, "intersection": {"n": "006", "code": "ENGINEERING / MULTI-SURFACE INTERSECTIONS", "title": "球面与三向圆柱的交线网络", "description": "三根正交圆柱穿过同一球面，构成多曲面相交场景。半透明曲面展示空间关系，金色曲线标出球柱交线与柱柱交线。", "points": ["一张球面与三张正交圆柱面", "六条球柱闭合交线，分布于六个出口", "三组柱柱交线，观察交线分支与汇合"], "alt": "GME Studio 曲面求交基础参考结果"}, "defeature": {"n": "007", "code": "ENGINEERING / SELECTIVE FEATURE REMOVAL", "title": "复杂零件的局部特征去除对比", "description": "左右对照同一零件的细节版与简化版。保留四个主安装孔和中心轴套通孔，移除小孔、凸台与加强筋，观察简化范围。", "points": ["左侧包含六个小孔、两个凸台与两道加强筋", "金色区域标示本次去除的细节与小孔边界", "右侧保留底板、轴套和主要安装接口"], "alt": "选择性特征去除工程示意", "reference": false}});Object.assign(cases,{intersection:{"n": "006", "code": "INTERSECTION / SPLINE × CYLINDERS", "title": "样条曲面与圆柱面的空间交线", "description": "一张双三次 Bézier 样条面与两张圆柱面相交。蓝色曲面的起伏使交线沿高度变化，金色闭合曲线展示交线同时位于两类曲面上的空间关系。", "points": ["双三次样条曲面，参数网格展示曲面起伏", "两个圆柱穿过不同曲率区域，形成两条空间交线", "金色交线按曲面参数计算并采样显示，可旋转观察"], "alt": "GME Studio 圆柱面与样条面求交参考结果"}});Object.assign(cases,{"gear": {"n": "008", "code": "ENGINEERING / PATTERNED GEAR", "title": "孔阵列齿轮与阶梯轮毂", "description": "组合周向齿形、减重孔和阶梯轮毂，观察轮廓拉伸与重复特征构成的机械结构。齿形采用展示用简化轮廓。", "points": ["28 个周向齿形与 8 个减重孔", "贯穿轴孔、阶梯轮毂与边缘倒角", "旋转查看齿廓、盘体厚度和轮毂连接"], "alt": "GME Studio 齿轮参考结果"}, "offsetSurface": {"n": "009", "code": "GEOMETRY / NORMAL SURFACE OFFSET", "title": "起伏曲面的法向偏移", "description": "蓝色为原始曲面，绿色为沿单位法向生成的偏移曲面。金色箭头连接对应采样点，直观展示偏移方向随曲率变化。", "points": ["两张对应的起伏曲面与固定偏移距离", "九组法向箭头展示局部偏移方向", "侧向观察曲面间距与边界变化"], "alt": "自由曲面法向偏移示意", "reference": false}, "transition": {"n": "010", "code": "ENGINEERING / MULTI-SECTION TRANSITION", "title": "偏心方圆过渡管", "description": "将圆角矩形入口逐步过渡到偏心圆形出口，形成连续变化的管壁。截面轮廓同时发生形状与位置变化，顶部配置带孔连接法兰。", "points": ["圆角矩形到圆形的连续截面变化", "偏心出口与弯曲过渡壁面", "六条截面参考线及八孔顶部法兰"], "alt": "多截面方圆过渡管示意", "reference": false}});
Object.assign(cases,Object.fromEntries((window.GME_REAL_CASES||[]).map(c=>[c.id,c])));
const tabs=[...document.querySelectorAll('[data-case]')];
let activeCaseFilter='all';
const caseSearch=document.getElementById('case-search');
function selectCase(b,updateUrl=false){
 if(!b||!cases[b.dataset.case])return;
 tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===b));t.tabIndex=t===b?0:-1});
 const c=cases[b.dataset.case];
 document.getElementById('case-index').textContent=(c.real?'GME MODEL / ':'CONCEPT / ')+c.n;
 document.getElementById('case-code').textContent=c.code;
 document.getElementById('case-title').textContent=c.title;
 document.getElementById('case-description').textContent=c.description;
 const img=document.getElementById('case-img');document.querySelector('.reference').hidden=c.reference===false;
 if(c.reference!==false)img.src=c.poster||'assets/'+b.dataset.case+'.png';img.alt=c.alt;
 document.getElementById('case-points').replaceChildren(...c.points.map(p=>{const li=document.createElement('li');li.textContent=p;return li}));
 document.getElementById('case-caption').textContent=c.real?`${c.entities} 个模型部件 · ${c.faces.toLocaleString()} 个面。由 GME 模型导出显示网格，网页提供旋转与查看，不在浏览器中执行建模运算。`:'前端几何原理示意，并非 GME 内核输出。部分案例附有 Studio 参考结果。';
 document.getElementById('case-panel').setAttribute('aria-labelledby',b.id);
 document.getElementById('model-viewport').setAttribute('aria-label',c.title+'，拖动旋转，滚轮缩放，右键平移；方向键旋转，加减键缩放');
 window.dispatchEvent(new CustomEvent('gme-case-change',{detail:b.dataset.case}));
 if(updateUrl){const u=new URL(location.href);u.searchParams.set('example',b.dataset.case);history.replaceState(null,'',u);}
}
function filterCases(preferred){
 const q=caseSearch.value.trim().toLowerCase();
 let visible=[];
 tabs.forEach(b=>{const c=cases[b.dataset.case];const match=c&&(activeCaseFilter==='principle'?!c.real:c.real&&(activeCaseFilter==='all'||c.group===activeCaseFilter));b.hidden=!match||![c?.title,c?.description,...(c?.points||[])].join(' ').toLowerCase().includes(q);if(!b.hidden)visible.push(b);});
 document.querySelectorAll('[data-case-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.caseFilter===activeCaseFilter)));
 document.getElementById('case-catalog-count').textContent=visible.length?`${visible.length} 个${activeCaseFilter==='principle'?'原理示意':'GME 案例'} · 仅加载当前选中的三维模型`:'没有匹配的案例，请尝试其他关键词或类别。';
 const selected=visible.find(b=>b.dataset.case===preferred)||visible.find(b=>b.getAttribute('aria-selected')==='true')||visible[0];
 if(selected)selectCase(selected);
}
for(const b of tabs){
 b.onclick=()=>selectCase(b,true);
 b.onkeydown=e=>{const visible=tabs.filter(t=>!t.hidden),i=visible.indexOf(b);let n;
 if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%visible.length;
 if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i+visible.length-1)%visible.length;
 if(e.key==='Home')n=0;if(e.key==='End')n=visible.length-1;
 if(n!==undefined){e.preventDefault();visible[n].focus();selectCase(visible[n],true);}};
}
caseSearch.addEventListener('input',()=>filterCases());
document.querySelectorAll('[data-case-filter]').forEach(b=>b.onclick=()=>{activeCaseFilter=b.dataset.caseFilter;caseSearch.value='';filterCases();});
const modules=[["base", "基础设施", "数学类型、容器与公共工具"], ["laws", "数学表达式", "规律表达式与计算基础"], ["kernel", "几何与拓扑内核", "实体结构、历史与模型管理"], ["intersectors", "几何求交", "曲线 / 曲面之间的求交"], ["query", "几何查询", "点定位、包围盒与质量属性"], ["clearance", "距离与间隙", "几何对象间的距离计算"], ["constructors", "实体构造", "从几何元素创建点、线、面、体"], ["euler", "拓扑编辑", "欧拉操作与拓扑关系维护"], ["booleans", "布尔运算", "并、交、差、切片与压印"], ["sweeping", "扫掠", "沿路径生成曲面与实体"], ["skinning", "蒙皮与放样", "由多个截面构造曲面"], ["covering", "曲面覆盖", "由封闭线框生成面"], ["offsetting", "几何偏移", "曲线、曲面与实体偏移"], ["blending", "圆角与倒角", "边界过渡与形状修整"], ["stitching", "曲面缝合", "连接片体及曲面边界"], ["shelling", "实体抽壳", "面向薄壁模型的抽壳操作"], ["lop", "局部操作", "局部几何与拓扑修改"], ["healing", "模型修复", "几何模型修复能力"], ["faceter", "网格离散化", "用于实体显示的网格剖分"], ["ihl", "消隐线", "视图中的可见边界计算"], ["remove", "移除面", "面移除及相关建模操作"], ["ct", "胞元拓扑", "胞元拓扑结构与操作"], ["interop", "数据交换", "模型互操作与数据交换"], ["asm", "装配管理", "装配模型、组件与实体管理接口"], ["abl", "高级圆角", "高级过渡、可变半径与截面相关接口"], ["warping", "空间变形", "弯曲、扭转与基于 law 的空间映射接口"], ["hlc", "高层组件框架", "当前为模块骨架，提供初始化接口"], ["defeature", "特征识别与去除", "模型简化；当前随 HUDONG 模式启用，依赖 DPS 适配层"], ["dpsadaptor", "DPS / SPD 适配", "几何能力与数据适配；随 HUDONG 模式启用"], ["acisadaptor", "ACIS 适配层", "连接 GME 与真实 ACIS 的类型、实体和 API，需相关依赖"]];const moduleImages={"base": {"src": "assets/modules/base.svg", "alt": "基础设施功能示意图", "label": "功能示意"}, "laws": {"src": "assets/modules/laws.png", "alt": "规律表达式曲线（构造示例）", "label": "Studio 示例"}, "kernel": {"src": "assets/modules/kernel.svg", "alt": "几何与拓扑内核功能示意图", "label": "功能示意"}, "intersectors": {"src": "assets/modules/intersectors.png", "alt": "螺旋线与圆环面求交", "label": "Studio 示例"}, "query": {"src": "assets/modules/query.png", "alt": "实体体积查询", "label": "Studio 示例"}, "clearance": {"src": "assets/modules/clearance.png", "alt": "实体间距离计算", "label": "Studio 示例"}, "constructors": {"src": "assets/modules/constructors.png", "alt": "球体构造", "label": "Studio 示例"}, "euler": {"src": "assets/modules/euler.png", "alt": "欧拉拓扑操作（布尔示例）", "label": "Studio 示例"}, "booleans": {"src": "assets/modules/booleans.png", "alt": "布尔运算零件建模", "label": "Studio 示例"}, "sweeping": {"src": "assets/modules/sweeping.png", "alt": "轮廓扫掠", "label": "Studio 示例"}, "skinning": {"src": "assets/modules/skinning.png", "alt": "曲面蒙皮", "label": "Studio 示例"}, "covering": {"src": "assets/modules/covering.png", "alt": "曲面覆盖", "label": "Studio 示例"}, "offsetting": {"src": "assets/modules/offsetting.png", "alt": "圆环面偏移相关示例", "label": "Studio 示例"}, "blending": {"src": "assets/modules/blending.png", "alt": "立方体圆角", "label": "Studio 示例"}, "stitching": {"src": "assets/modules/stitching.png", "alt": "管状曲面缝合", "label": "Studio 示例"}, "shelling": {"src": "assets/modules/shelling.png", "alt": "长方体抽壳", "label": "Studio 示例"}, "lop": {"src": "assets/modules/lop.png", "alt": "局部面移动", "label": "Studio 示例"}, "healing": {"src": "assets/modules/healing.svg", "alt": "模型修复功能示意图", "label": "功能示意"}, "faceter": {"src": "assets/modules/faceter.png", "alt": "圆柱组合实体离散化", "label": "Studio 示例"}, "ihl": {"src": "assets/modules/ihl.svg", "alt": "消隐线功能示意图", "label": "功能示意"}, "remove": {"src": "assets/modules/remove.png", "alt": "圆孔面移除", "label": "Studio 示例"}, "ct": {"src": "assets/modules/ct.svg", "alt": "胞元拓扑功能示意图", "label": "功能示意"}, "interop": {"src": "assets/modules/interop.svg", "alt": "数据交换功能示意图", "label": "功能示意"}, "asm": {"src": "assets/modules/asm.svg", "alt": "装配管理功能示意图", "label": "功能示意"}, "abl": {"src": "assets/modules/abl.svg", "alt": "高级圆角功能示意图", "label": "功能示意"}, "warping": {"src": "assets/modules/warping.svg", "alt": "空间变形功能示意图", "label": "功能示意"}, "hlc": {"src": "assets/modules/hlc.svg", "alt": "高层组件框架功能示意图", "label": "功能示意"}, "defeature": {"src": "assets/modules/defeature.svg", "alt": "特征识别与去除功能示意图", "label": "功能示意"}, "dpsadaptor": {"src": "assets/modules/dpsadaptor.svg", "alt": "DPS / SPD 适配功能示意图", "label": "功能示意"}, "acisadaptor": {"src": "assets/modules/acisadaptor.svg", "alt": "ACIS 适配层功能示意图", "label": "功能示意"}, "aciscompat": {"src": "assets/modules/aciscompat.svg", "alt": "ACIS 兼容层功能示意图", "label": "功能示意"}};let activeModuleFilter='all';const moduleGroups={foundation:['base','laws','kernel','euler','ct','asm','hlc'],modeling:['constructors','booleans','sweeping','skinning','covering','offsetting','blending','stitching','shelling','lop','healing','remove','abl','warping','defeature'],analysis:['intersectors','query','clearance','faceter','ihl'],integration:['interop','dpsadaptor','acisadaptor']};function renderModules(){const q=document.getElementById('module-search').value.trim().toLowerCase();const results=modules.filter(m=>m.join(' ').toLowerCase().includes(q)&&(activeModuleFilter==='all'||moduleGroups[activeModuleFilter].includes(m[0])));document.getElementById('module-grid').replaceChildren(...results.map(m=>{let a=document.createElement('article');a.className='module';const visual=moduleImages[m[0]],figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');figure.className='module-visual';img.src=visual.src;img.alt=visual.alt;img.loading='lazy';img.width=240;img.height=160;caption.textContent=visual.label;figure.append(img);a.append(figure);let c=document.createElement('code'),h=document.createElement('h3'),p=document.createElement('p');c.textContent=m[0];h.textContent=m[1];if(['booleans','intersectors','defeature'].includes(m[0])){const link=document.createElement('a');link.href='modules/'+m[0]+'/';link.textContent=m[1];h.replaceChildren(link);}p.textContent=m[2];a.append(c,h,p);return a}));document.getElementById('module-count').textContent=results.length+' / '+modules.length+' 个模块目录';document.getElementById('module-empty').hidden=results.length!==0}document.getElementById('module-search').oninput=renderModules;renderModules();document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{const t=document.getElementById(b.dataset.copy).textContent;try{await navigator.clipboard.writeText(t);b.textContent='已复制';setTimeout(()=>b.textContent='复制命令',2000)}catch{const r=document.createRange();r.selectNodeContents(document.getElementById(b.dataset.copy));window.getSelection().removeAllRanges();window.getSelection().addRange(r);b.textContent='已选中，请手动复制'}});document.getElementById('download-template').onclick=()=>{const txt='# GME 几何问题反馈\n\n## 问题概述\n简要描述问题与涉及模块。\n\n## 环境\n- GME 版本 / 提交号：\n- 操作系统：\n- 编译器与构建配置：\n- 相关模块：\n\n## 最小复现步骤\n1. \n2. \n3. \n\n## 预期结果\n\n## 实际结果\n\n## 模型与调用参数\n附上有权共享的最小模型、调用顺序、参数和容差。\n\n## 日志与截图\n\n## 补充说明\n问题是否稳定复现？是否与版本或数据规模有关？\n';const url=URL.createObjectURL(new Blob([txt],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='GME-issue-template.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

filterCases();
const applicationForm=document.getElementById('application-form');
let applicationDraft='';
applicationForm.addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(applicationForm),interests=data.getAll('interest');
  const error=document.getElementById('interest-error');error.hidden=interests.length>0;
  if(!interests.length){applicationForm.querySelector('[name=interest]').focus();return;}
  const name=data.get('name').trim(),email=data.get('email').trim(),message=data.get('message').trim();
  if(!name||message.length<5){const input=document.getElementById(!name?'app-name':'app-message');input.setCustomValidity(!name?'请填写姓名或昵称。':'请至少填写 5 个非空白字符。');input.reportValidity();return;}
  const purposes=data.getAll('purpose');const purposeError=document.getElementById('purpose-error');purposeError.hidden=purposes.length>0;if(!purposes.length){applicationForm.querySelector('[name=purpose]').focus();return;}
  const enterprise=data.get('applicantType')==='企业';
  const subject='GME 开源参与意向｜'+data.get('applicantType')+'｜'+name;
  const body=['GME 社区团队，你好！','','我希望参与 GME 开源社区，以下是我的基本信息与意向：','','参与身份：'+data.get('applicantType'),'姓名 / 联系人：'+name,(enterprise?'企业联系邮箱：':'联系邮箱：')+email,(enterprise?'所在单位：':'单位 / 学校：')+(data.get('organization').trim()||'未填写'),...(enterprise?['使用或预计使用引擎的人员数量：'+data.get('teamSize')+' 人']:[]),'角色 / 研究方向：'+(data.get('role').trim()||'未填写'),'参与方向：'+interests.join('、'),'计划用途：'+purposes.join('、'),...(purposes.includes('其他')?['其他用途说明：'+data.get('purposeOther').trim()]:[]),'购买 GME 软件意愿：'+data.get('softwarePayment'),'购买 GME 完整源代码意愿：'+data.get('sourcePayment'),'','使用场景与期待：',message,'','期待进一步交流，谢谢！'].join('\n');
  applicationDraft='收件人：gme_community@163.com\n主题：'+subject+'\n\n'+body;
  document.getElementById('application-text').value=applicationDraft;
  document.getElementById('application-send').href='mailto:gme_community@163.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  document.getElementById('application-preview').hidden=false;
  document.getElementById('application-status').textContent='';
  document.getElementById('preview-title').focus();
});
applicationForm.addEventListener('input',e=>{
  if(e.target.setCustomValidity)e.target.setCustomValidity('');
  if(e.target.name==='interest')document.getElementById('interest-error').hidden=true;
  document.getElementById('application-preview').hidden=true;
});
document.getElementById('application-copy').onclick=async()=>{
  const status=document.getElementById('application-status');
  try{await navigator.clipboard.writeText(applicationDraft);status.textContent='申请内容已复制。请粘贴到邮箱中并确认发送。';}
  catch{const preview=document.getElementById('application-text');preview.focus();preview.select();status.textContent='请手动复制已选中的申请内容。';}
};

function syncApplicationFields(){
 const enterprise=applicationForm.querySelector('[name=applicantType]:checked').value==='企业';
 document.getElementById('email-label').textContent=enterprise?'企业联系邮箱 *':'联系邮箱 *';
 document.getElementById('org-label').textContent=enterprise?'所在单位全称 *':'单位 / 学校（选填）';
 const org=document.getElementById('app-org');org.required=enterprise;org.placeholder=enterprise?'请填写企业 / 单位全称':'选填';
 document.getElementById('app-email').placeholder=enterprise?'请填写用于企业联系的邮箱':'用于后续联系';
 document.getElementById('enterprise-fields').hidden=!enterprise;
 const count=document.getElementById('app-team-size');count.required=enterprise;count.disabled=!enterprise;
 const other=applicationForm.querySelector('[name=purpose][value="其他"]').checked;
 document.getElementById('purpose-other-label').hidden=!other;
 const detail=document.getElementById('app-purpose-other');detail.required=other;detail.disabled=!other;
}
applicationForm.addEventListener('change',syncApplicationFields);
applicationForm.addEventListener('input',e=>{
 if(e.target.name==='purpose')document.getElementById('purpose-error').hidden=true;
});
syncApplicationFields();

document.querySelectorAll('[data-module-filter]').forEach(button=>button.addEventListener('click',()=>{
 activeModuleFilter=button.dataset.moduleFilter;
 document.querySelectorAll('[data-module-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 renderModules();
}));
const caseLayoutBreakpoint=window.matchMedia('(min-width:1001px)');
function syncCaseTabOrientation(){document.querySelector('[aria-label="建模案例"]').setAttribute('aria-orientation',caseLayoutBreakpoint.matches?'vertical':'horizontal');}
caseLayoutBreakpoint.addEventListener('change',syncCaseTabOrientation);syncCaseTabOrientation();

const gmeRequestedExample=new URLSearchParams(location.search).get('example');
if(gmeRequestedExample&&Object.hasOwn(cases,gmeRequestedExample)){activeCaseFilter=cases[gmeRequestedExample].real?'all':'principle';filterCases(gmeRequestedExample);}
