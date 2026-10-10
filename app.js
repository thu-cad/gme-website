const menu=document.querySelector('.menu');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);document.querySelector('nav').classList.toggle('open',open)});document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('nav').classList.remove('open')}));
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  heroVideo.muted = true;
  // Start only when the visitor presses Play; pause when outside the viewport.
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) heroVideo.pause();
  }).observe(heroVideo);
  document.addEventListener('visibilitychange', () => { if (document.hidden) heroVideo.pause(); });
}
const cases = {...window.GME_CONCEPT_CASES, ...Object.fromEntries((window.GME_REAL_CASES || []).map(c => [c.id, c]))};
const tabs = [...document.querySelectorAll('[data-case]')];
let activeCaseFilter = 'all';
const caseSearch = document.getElementById('case-search');
const casePanel = document.getElementById('case-panel');
const caseEmpty = document.getElementById('case-empty');
const caseShare = document.getElementById('case-share');
const caseDetail = document.getElementById('case-detail');
const shareStatus = document.getElementById('case-share-status');
const aliases = {
  airliner: ['飞机', '航空', 'airplane', 'airliner', 'aircraft'],
  motherboard: ['电路板', '电脑', 'pcb', 'motherboard'],
  eiffel: ['建筑', '巴黎', '铁塔', 'eiffel'],
  factory: ['工厂', '工业', 'factory', 'plant'],
  rocket: ['航天', '火箭', 'rocket'],
  yacht: ['船', '船舶', '游艇', 'yacht'],
  car: ['车辆', '汽车', 'car'],
  espresso: ['家电', '咖啡', 'coffee'],
  'spline-compressor': ['压缩机', '涡轮', '发动机', 'compressor'],
  'spline-manifold': ['管路', '歧管', 'manifold'],
  centrifugal: ['离心', '蜗壳', '叶轮', 'impeller'],
};
function updateCaseUrl(id) {
  const url = new URL(location.href);
  if (id) url.searchParams.set('example', id);
  else url.searchParams.delete('example');
  history.replaceState(null, '', url);
}
function selectCase(button, updateUrl = true) {
  if (!button || !cases[button.dataset.case]) return;
  const id = button.dataset.case, c = cases[id];
  casePanel.hidden = false;
  caseEmpty.hidden = true;
  tabs.forEach(tab => {
    tab.setAttribute('aria-selected', String(tab === button));
    tab.tabIndex = tab === button ? 0 : -1;
  });
  document.getElementById('case-index').textContent = (c.real ? 'GME MODEL / ' : 'CONCEPT / ') + c.n;
  document.getElementById('case-code').textContent = c.code;
  document.getElementById('case-title').textContent = c.title;
  document.getElementById('case-description').textContent = c.description;
  const img = document.getElementById('case-img');
  document.querySelector('.reference').hidden = c.reference === false;
  if (c.reference !== false) img.src = c.poster || 'assets/' + id + '.png';
  img.alt = c.alt;
  document.getElementById('case-points').replaceChildren(...c.points.map(text => {
    const li = document.createElement('li'); li.textContent = text; return li;
  }));
  document.getElementById('case-caption').textContent = c.real
    ? `${c.entities} 个模型部件 · ${c.faces.toLocaleString()} 个面。由 GME 模型导出显示网格，网页提供旋转与查看，不在浏览器中执行建模运算。`
    : '前端几何原理示意，并非 GME 内核输出。部分案例附有 Studio 参考结果。';
  casePanel.setAttribute('aria-labelledby', button.id);
  document.getElementById('model-viewport').setAttribute('aria-label', c.title + '，拖动旋转，滚轮缩放，右键平移；方向键旋转，加减键缩放');
  caseDetail.href = (c.real ? 'models/' : 'examples/') + id + '/';
  caseShare.dataset.url = new URL(caseDetail.getAttribute('href'), location.href).href;
  shareStatus.textContent = '';
  document.getElementById('model-quality-label').hidden = !c.lite;
  window.dispatchEvent(new CustomEvent('gme-case-change', {detail: id}));
  if (updateUrl) updateCaseUrl(id);
}
function filterCases(preferred, updateUrl = true) {
  const terms = caseSearch.value.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = [];
  tabs.forEach(button => {
    const id = button.dataset.case, c = cases[id];
    const inGroup = c && (activeCaseFilter === 'principle' ? !c.real : c.real && (activeCaseFilter === 'all' || c.group === activeCaseFilter));
    const text = [id, c?.title, c?.description, ...(c?.points || []), ...(aliases[id] || [])].join(' ').toLowerCase();
    button.hidden = !inGroup || !terms.every(term => text.includes(term));
    if (!button.hidden) visible.push(button);
  });
  document.querySelectorAll('[data-case-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.caseFilter === activeCaseFilter)));
  document.getElementById('case-catalog-count').textContent = visible.length
    ? `${visible.length} 个${activeCaseFilter === 'principle' ? '原理示意' : ' GME 案例'} · 仅加载当前选中的三维模型`
    : '没有匹配的案例';
  const selected = visible.find(b => b.dataset.case === preferred) || visible.find(b => b.getAttribute('aria-selected') === 'true') || visible[0];
  if (selected) selectCase(selected, updateUrl);
  else {
    tabs.forEach(tab => { tab.setAttribute('aria-selected', 'false'); tab.tabIndex = -1; });
    casePanel.hidden = true; caseEmpty.hidden = false;
    window.dispatchEvent(new CustomEvent('gme-case-change', {detail: null}));
    if (updateUrl) updateCaseUrl(null);
  }
}
for (const button of tabs) {
  button.onclick = () => selectCase(button);
  button.onkeydown = event => {
    const visible = tabs.filter(t => !t.hidden), i = visible.indexOf(button);
    let n;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') n = (i + 1) % visible.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') n = (i + visible.length - 1) % visible.length;
    if (event.key === 'Home') n = 0;
    if (event.key === 'End') n = visible.length - 1;
    if (n !== undefined && visible[n]) { event.preventDefault(); visible[n].focus(); selectCase(visible[n]); }
  };
}
caseSearch.addEventListener('input', () => filterCases());
document.querySelectorAll('[data-case-filter]').forEach(button => button.onclick = () => {
  activeCaseFilter = button.dataset.caseFilter; caseSearch.value = ''; filterCases();
});
document.getElementById('case-clear').onclick = () => {
  activeCaseFilter = 'all'; caseSearch.value = ''; filterCases(); caseSearch.focus();
};
caseShare.onclick = async () => {
  const url = caseShare.dataset.url;
  try { await navigator.clipboard.writeText(url); shareStatus.textContent = '案例介绍链接已复制，包含模型图片和三维体验入口。'; }
  catch { shareStatus.textContent = '请复制案例介绍页地址：' + url; }
};
function restoreCaseFromUrl() {
  const requested = new URLSearchParams(location.search).get('example');
  activeCaseFilter = cases[requested]?.real === false || (cases[requested] && !cases[requested].real) ? 'principle' : 'all';
  caseSearch.value = ''; filterCases(requested);
}
window.addEventListener('popstate', restoreCaseFromUrl);
const modules=[["base", "基础设施", "数学类型、容器与公共工具"], ["laws", "数学表达式", "规律表达式与计算基础"], ["kernel", "几何与拓扑内核", "实体结构、历史与模型管理"], ["intersectors", "几何求交", "曲线 / 曲面之间的求交"], ["query", "几何查询", "点定位、包围盒与质量属性"], ["clearance", "距离与间隙", "几何对象间的距离计算"], ["constructors", "实体构造", "从几何元素创建点、线、面、体"], ["euler", "拓扑编辑", "欧拉操作与拓扑关系维护"], ["booleans", "布尔运算", "并、交、差、切片与压印"], ["sweeping", "扫掠", "沿路径生成曲面与实体"], ["skinning", "蒙皮与放样", "由多个截面构造曲面"], ["covering", "曲面覆盖", "由封闭线框生成面"], ["offsetting", "几何偏移", "曲线、曲面与实体偏移"], ["blending", "圆角与倒角", "边界过渡与形状修整"], ["stitching", "曲面缝合", "连接片体及曲面边界"], ["shelling", "实体抽壳", "面向薄壁模型的抽壳操作"], ["lop", "局部操作", "局部几何与拓扑修改"], ["healing", "模型修复", "几何模型修复能力"], ["faceter", "网格离散化", "用于实体显示的网格剖分"], ["ihl", "消隐线", "视图中的可见边界计算"], ["remove", "移除面", "面移除及相关建模操作"], ["ct", "胞元拓扑", "胞元拓扑结构与操作"], ["interop", "数据交换", "模型互操作与数据交换"], ["asm", "装配管理", "装配模型、组件与实体管理接口"], ["abl", "高级圆角", "高级过渡、可变半径与截面相关接口"], ["warping", "空间变形", "弯曲、扭转与基于 law 的空间映射接口"], ["hlc", "高层组件框架", "当前为模块骨架，提供初始化接口"], ["defeature", "特征识别与去除", "模型简化；当前随 HUDONG 模式启用，依赖 DPS 适配层"], ["dpsadaptor", "DPS / SPD 适配", "几何能力与数据适配；随 HUDONG 模式启用"], ["acisadaptor", "ACIS 适配层", "连接 GME 与真实 ACIS 的类型、实体和 API，需相关依赖"]];const moduleImages={"base": {"src": "assets/modules/base.svg", "alt": "基础设施功能示意图", "label": "功能示意"}, "laws": {"src": "assets/modules/laws.png", "alt": "规律表达式曲线（构造示例）", "label": "Studio 示例"}, "kernel": {"src": "assets/modules/kernel.svg", "alt": "几何与拓扑内核功能示意图", "label": "功能示意"}, "intersectors": {"src": "assets/modules/intersectors.png", "alt": "螺旋线与圆环面求交", "label": "Studio 示例"}, "query": {"src": "assets/modules/query.png", "alt": "实体体积查询", "label": "Studio 示例"}, "clearance": {"src": "assets/modules/clearance.png", "alt": "实体间距离计算", "label": "Studio 示例"}, "constructors": {"src": "assets/modules/constructors.png", "alt": "球体构造", "label": "Studio 示例"}, "euler": {"src": "assets/modules/euler.png", "alt": "欧拉拓扑操作（布尔示例）", "label": "Studio 示例"}, "booleans": {"src": "assets/modules/booleans.png", "alt": "布尔运算零件建模", "label": "Studio 示例"}, "sweeping": {"src": "assets/modules/sweeping.png", "alt": "轮廓扫掠", "label": "Studio 示例"}, "skinning": {"src": "assets/modules/skinning.png", "alt": "曲面蒙皮", "label": "Studio 示例"}, "covering": {"src": "assets/modules/covering.png", "alt": "曲面覆盖", "label": "Studio 示例"}, "offsetting": {"src": "assets/modules/offsetting.png", "alt": "圆环面偏移相关示例", "label": "Studio 示例"}, "blending": {"src": "assets/modules/blending.png", "alt": "立方体圆角", "label": "Studio 示例"}, "stitching": {"src": "assets/modules/stitching.png", "alt": "管状曲面缝合", "label": "Studio 示例"}, "shelling": {"src": "assets/modules/shelling.png", "alt": "长方体抽壳", "label": "Studio 示例"}, "lop": {"src": "assets/modules/lop.png", "alt": "局部面移动", "label": "Studio 示例"}, "healing": {"src": "assets/modules/healing.svg", "alt": "模型修复功能示意图", "label": "功能示意"}, "faceter": {"src": "assets/modules/faceter.png", "alt": "圆柱组合实体离散化", "label": "Studio 示例"}, "ihl": {"src": "assets/modules/ihl.svg", "alt": "消隐线功能示意图", "label": "功能示意"}, "remove": {"src": "assets/modules/remove.png", "alt": "圆孔面移除", "label": "Studio 示例"}, "ct": {"src": "assets/modules/ct.svg", "alt": "胞元拓扑功能示意图", "label": "功能示意"}, "interop": {"src": "assets/modules/interop.svg", "alt": "数据交换功能示意图", "label": "功能示意"}, "asm": {"src": "assets/modules/asm.svg", "alt": "装配管理功能示意图", "label": "功能示意"}, "abl": {"src": "assets/modules/abl.svg", "alt": "高级圆角功能示意图", "label": "功能示意"}, "warping": {"src": "assets/modules/warping.svg", "alt": "空间变形功能示意图", "label": "功能示意"}, "hlc": {"src": "assets/modules/hlc.svg", "alt": "高层组件框架功能示意图", "label": "功能示意"}, "defeature": {"src": "assets/modules/defeature.svg", "alt": "特征识别与去除功能示意图", "label": "功能示意"}, "dpsadaptor": {"src": "assets/modules/dpsadaptor.svg", "alt": "DPS / SPD 适配功能示意图", "label": "功能示意"}, "acisadaptor": {"src": "assets/modules/acisadaptor.svg", "alt": "ACIS 适配层功能示意图", "label": "功能示意"}, "aciscompat": {"src": "assets/modules/aciscompat.svg", "alt": "ACIS 兼容层功能示意图", "label": "功能示意"}};let activeModuleFilter='all';const moduleGroups={foundation:['base','laws','kernel','euler','ct','asm','hlc'],modeling:['constructors','booleans','sweeping','skinning','covering','offsetting','blending','stitching','shelling','lop','healing','remove','abl','warping','defeature'],analysis:['intersectors','query','clearance','faceter','ihl'],integration:['interop','dpsadaptor','acisadaptor']};function renderModules(){const q=document.getElementById('module-search').value.trim().toLowerCase();const results=modules.filter(m=>m.join(' ').toLowerCase().includes(q)&&(activeModuleFilter==='all'||moduleGroups[activeModuleFilter].includes(m[0])));document.getElementById('module-grid').replaceChildren(...results.map(m=>{let a=document.createElement('article');a.className='module';const visual=moduleImages[m[0]],figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');figure.className='module-visual';img.src=visual.src;img.alt=visual.alt;img.loading='lazy';img.width=240;img.height=160;caption.textContent=visual.label;figure.append(img);a.append(figure);let c=document.createElement('code'),h=document.createElement('h3'),p=document.createElement('p');c.textContent=m[0];h.textContent=m[1];if(['booleans','intersectors','defeature'].includes(m[0])){const link=document.createElement('a');link.href='modules/'+m[0]+'/';link.textContent=m[1];h.replaceChildren(link);}p.textContent=m[2];a.append(c,h,p);return a}));document.getElementById('module-count').textContent=results.length+' / '+modules.length+' 个模块目录';document.getElementById('module-empty').hidden=results.length!==0}document.getElementById('module-search').oninput=renderModules;renderModules();document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{const t=document.getElementById(b.dataset.copy).textContent;try{await navigator.clipboard.writeText(t);b.textContent='已复制';setTimeout(()=>b.textContent='复制命令',2000)}catch{const r=document.createRange();r.selectNodeContents(document.getElementById(b.dataset.copy));window.getSelection().removeAllRanges();window.getSelection().addRange(r);b.textContent='已选中，请手动复制'}});document.getElementById('download-template').onclick=()=>{const txt='# GME 几何问题反馈\n\n## 问题概述\n简要描述问题与涉及模块。\n\n## 环境\n- GME 版本 / 提交号：\n- 操作系统：\n- 编译器与构建配置：\n- 相关模块：\n\n## 最小复现步骤\n1. \n2. \n3. \n\n## 预期结果\n\n## 实际结果\n\n## 模型与调用参数\n附上有权共享的最小模型、调用顺序、参数和容差。\n\n## 日志与截图\n\n## 补充说明\n问题是否稳定复现？是否与版本或数据规模有关？\n';const url=URL.createObjectURL(new Blob([txt],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='GME-issue-template.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

restoreCaseFromUrl();
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
  if(enterprise && !data.get('organization').trim()){const field=document.getElementById('app-org');field.setCustomValidity('请填写所在单位全称。');field.reportValidity();return;}
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


// Optional public Feishu form. Never send form data or credentials in a URL.
const configuredForm = window.GME_SITE?.applicationFormUrl;
if (configuredForm) {
  try {
    const url = new URL(configuredForm);
    if (url.protocol === 'https:' && /(^|\.)feishu\.cn$/.test(url.hostname)) {
      document.getElementById('online-application-link').href = url.href;
      document.getElementById('online-application').hidden = false;
    }
  } catch { /* An invalid configuration leaves the working email option available. */ }
}
document.getElementById('application-download').onclick = () => {
  const url = URL.createObjectURL(new Blob([applicationDraft], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'GME-参与申请.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
