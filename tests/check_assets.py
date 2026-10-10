from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import array, gzip, json, math, struct
root = Path(__file__).resolve().parents[1]
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.tags = []
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
htmls = [p for p in root.rglob('*.html') if 'node_modules' not in p.parts]
for p in htmls:
    parser=Parser(); parser.feed(p.read_text())
    ids=[a['id'] for t,a in parser.tags if 'id' in a]
    assert len(set(ids)) == len(ids), ('duplicate IDs',p)
    for tag,attrs in parser.tags:
        for name in ('href','src','poster'):
            value=attrs.get(name)
            if not value: continue
            u=urlsplit(value)
            if u.scheme or u.netloc: continue
            dest=p.parent/unquote(u.path) if u.path else p
            if dest.is_dir(): dest/='index.html'
            assert dest.exists(), (p,value)
            if u.fragment and not u.path: assert u.fragment in ids, (p,value)
rows=json.loads((root/'cases.js').read_text().split('=',1)[1].strip().rstrip(';'))
lite_count=0
for row in rows:
    for asset in [row]+([row['lite']] if 'lite' in row else []):
        data=(root/asset['mesh']).read_bytes(); h=struct.unpack('<8I',data[:32])
        assert h[:2] == (0x31454d47,1)
        assert len(data)==asset['bytes']==32+h[2]*36+h[3]*4
        assert h[2]==asset['vertices'] and h[3]//3==asset['triangles']
        assert h[4:7]==(row['entities'],row['faces'],row['closed'])
        assert gzip.decompress((root/asset['meshCompressed']).read_bytes())==data
        numbers=array.array('f'); numbers.frombytes(data[32:32+h[2]*36]); assert all(math.isfinite(v) for v in numbers)
        indices=array.array('I'); indices.frombytes(data[32+h[2]*36:]); assert max(indices)<h[2]
    if 'lite' in row:lite_count+=1
    p=root/'models'/row['id']/'index.html';text=p.read_text();assert 'property="og:image"' in text and 'rel="canonical"' in text
print(f'PASS: {len(htmls)} HTML pages, links/anchors, {len(rows)} models, {lite_count} lightweight variants; mesh structure, finite numbers, indices and gzip verified.')
