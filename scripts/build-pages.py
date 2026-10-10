"""Generate crawlable, shareable pages from the shipped GME model catalog."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://thu-cad.github.io/gme-website/'
rows = json.loads((ROOT / 'cases.js').read_text().split('=', 1)[1].strip().rstrip(';'))
esc = html.escape

def page(path, title, description, content, image='assets/gme-complex-models-12-poster.jpg'):
    depth = len(Path(path).parts)
    back = '../' * depth
    url = BASE + path + '/'
    breadcrumb = (f'<a href="{back}models/">建模案例</a><span>/</span>'
                  if path.startswith('models/') else '')
    breadcrumb += f'<span aria-current="page">{esc(title)}</span>'
    meta = {'@context': 'https://schema.org', '@type': 'WebPage', 'name': title, 'description': description, 'url': url, 'image': BASE + image, 'inLanguage': 'zh-CN', 'isPartOf': {'@type': 'WebSite', 'name': 'GME 几何建模引擎', 'url': BASE}}
    out = f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}｜GME</title><meta name="description" content="{esc(description, quote=True)}">
<link rel="canonical" href="{url}"><meta property="og:type" content="website"><meta property="og:title" content="{esc(title, quote=True)}｜GME"><meta property="og:description" content="{esc(description, quote=True)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE + image}"><meta property="og:image:alt" content="{esc(title, quote=True)}"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="{back}style.css?v=site-upgrade-20261010"><link rel="icon" href="{back}assets/gme-logo.png"><script type="application/ld+json">{json.dumps(meta, ensure_ascii=False)}</script></head>
<body><a class="skip" href="#main">跳转到内容</a><header><a class="brand" href="{back}"><img class="gme-logo" src="{back}assets/gme-logo.png" width="43" height="43" alt="GME">GME</a><a class="button primary" href="{back}#contact">参与 GME</a></header>
<main id="main" class="wrap seo-document"><nav class="seo-breadcrumb" aria-label="面包屑"><a href="{back}">首页</a><span>/</span>{breadcrumb}</nav><h1>{esc(title)}</h1><p class="seo-lead">{esc(description)}</p>{content}</main>
<footer class="wrap"><p>GME · Geometry Modeling Engine</p><a href="mailto:gme_community@163.com">gme_community@163.com</a></footer></body></html>'''
    target = ROOT / path / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(out, encoding='utf-8')

for row in rows:
    id = row['id']
    points = ''.join('<li>' + esc(p) + '</li>' for p in row['points'])
    quality = ''
    if row.get('lite'):
        quality = f'<p>提供轻量与高清显示。轻量下载约 {row["lite"]["compressedBytes"]/1e6:.2f} MB，高清约 {row["compressedBytes"]/1e6:.2f} MB。手机优先使用轻量模式，可在视图中切换。</p>'
    content = f'''<div class="seo-back"><a class="button primary" href="../../?example={id}#showcase">打开三维体验</a><a href="../../#contact">咨询与参与</a></div>
<figure class="seo-reference"><img src="../../{row['poster']}" alt="{esc(row['alt'], quote=True)}" width="960" height="640"><figcaption>{esc(row['title'])} · GME Studio 结果图</figcaption></figure>
<section><h2>结构与观察重点</h2><ul>{points}</ul></section>
<section><h2>模型规模与查看方式</h2><p>本案例包含 {row['entities']:,} 个模型部件、{row['faces']:,} 个面。拖动旋转、滚轮缩放，支持复位视角与网格显示；触屏可双指缩放。</p>{quality}</section>
<section><h2>模型来源与适用范围</h2><p>模型使用 GME 生成，并从原生几何数据导出网页显示网格。网页支持观察几何外形与装配关系，不在浏览器中运行内核建模运算。</p><p>本案例用于几何能力展示，不作为实物制造数据或性能基准。网格显示精细度与几何内核计算精度是不同概念；实际应用应结合输入尺度、容差和对应版本验证。</p><a href="../../technology/">了解技术特点与验证方式</a></section>'''
    page('models/' + id, row['title'], row['description'], content, row['poster'])

groups = {'scene':'整机与场景','freeform':'曲面与装配','parts':'基础与零部件'}
content = ''
for group, label in groups.items():
    content += '<section><h2>' + label + '</h2><div class="native-gallery">'
    for row in rows:
        if row['group'] != group: continue
        content += f'<article><a href="{row["id"]}/"><img src="../{row["poster"]}" alt="{esc(row["title"], quote=True)}" loading="lazy" width="320" height="200"><h2>{esc(row["title"])}</h2></a><p>{esc(row["description"])}</p></article>'
    content += '</div></section>'
page('models', 'GME 建模案例目录', '26 个由 GME 生成的模型，覆盖整机、工业场景、自由曲面、装配与机械零件。每个案例均提供结构说明、Studio 结果图和三维体验入口。', content)

page('technology', '技术特点与验证方式', '了解 GME 的自主研发、精度控制、现代 C++ 架构与模型验证方式，区分几何计算、显示网格与工程交付要求。', '''
<section><h2>全自研：从几何表达走向建模操作</h2><p>GME 以自主研发的核心几何算法为基础，围绕几何与拓扑表达、实体构造、布尔运算、曲面操作及查询组织模块。通过 GME Studio 运行真实内核实体，观察建模与检查结果。</p><p>官网案例展示当前已生成的数据。接口可用范围、公开源码范围与许可证，以正式发布版本及对应文档为准。</p><a href="../#modules">查看模块能力目录</a></section>
<section><h2>高精度：以尺度、容差和验证共同定义</h2><p>几何计算需要结合模型单位、尺度与容差判断点、边、面之间的关系。应在目标应用中检查实体有效性、边界连接、求交残差以及关键尺寸，而不是仅依据画面是否光滑判断精度。</p><p>网页的轻量／高清选项控制显示网格的离散精细度，不修改源模型，也不代表内核精度档位。本页不提供未经统一基准验证的固定精度承诺。</p></section>
<section><h2>这批案例如何验证</h2><p>2026 年 10 月 10 日，本批 26 个原生案例在本地 GME 环境完成模型恢复、实体数量核对与逐实体有效性检查，检查通过；随后导出网页显示网格。</p><p>发布前另行核对网格长度、索引范围、有限数值及压缩文件一致性。这些检查针对本批数据，不等同于所有输入、平台和版本的全面保证。</p><a href="../models/">查看经过上述流程的案例</a></section>
<section><h2>现代化、模块化与跨平台</h2><p>项目采用 C++20 与 CMake 组织构建，按建模能力划分模块。Studio 基于 Qt6，将示例运行、结果观察与问题定位放在同一工作流程中。面向 Windows、Linux 和 macOS；具体依赖及支持情况以相应发布版本为准。</p><p>接入时可按场景选择所需能力，并用自己的模型和约束建立回归验证集。</p><a href="../#start">查看构建准备</a></section>
<section><h2>提交可复现的几何问题</h2><ol><li>记录 GME 版本、系统、模型单位及尺度。</li><li>准备有权共享的最小模型和调用步骤。</li><li>说明输入参数、容差、预期结果与实际结果。</li><li>提供实体检查结果、关键尺寸或残差以及截图。</li></ol><a href="../#community">获取问题反馈模板</a></section>
''')
# Add share images to pre-existing concept and module pages without replacing their content.
for target in [*ROOT.glob('examples/*/index.html'), *ROOT.glob('modules/*/index.html')]:
    text = target.read_text()
    if 'property="og:image"' not in text:
        text = text.replace('</head>', f'<meta property="og:image" content="{BASE}assets/gme-complex-models-12-poster.jpg"><meta name="twitter:card" content="summary_large_image"></head>')
    target.write_text(text)
paths = sorted(p.relative_to(ROOT) for p in ROOT.rglob('index.html') if not {'.git', 'node_modules'}.intersection(p.parts))
urls = [BASE + (str(p.parent).rstrip('.') + '/' if str(p.parent) != '.' else '') for p in paths]
(ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>'+esc(u)+'</loc></url>\n' for u in urls) + '</urlset>\n')
print('Generated',len(rows),'case pages; sitemap:',len(urls),'URLs')
