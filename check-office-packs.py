"""Read exported OOXML independently; no workbook authoring or recalculation."""
from pathlib import Path
import json,zipfile,xml.etree.ElementTree as ET,math,re
ROOT=Path(__file__).parent
raw=(ROOT/'web/case-data.js').read_text();cases=json.loads(raw.split('window.CASE_CATALOG=')[1].rstrip(';\n'))
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','r':'http://schemas.openxmlformats.org/package/2006/relationships'}
OFF=ROOT/'web/cases/office'
def rendered(v):
 if isinstance(v,int) and abs(v)>=1000:return f'{v:,}'.replace(',','.')
 if isinstance(v,float):return f'{v:g}'.replace('.',',')
 return str(v)
def xl(z):
 shared=[]
 if 'xl/sharedStrings.xml' in z.namelist():shared=[''.join(si.itertext()) for si in ET.fromstring(z.read('xl/sharedStrings.xml'))]
 rel={r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
 def getval(c):
  typ=c.attrib.get('t');v=c.find('s:v',ns)
  if typ=='inlineStr':return ''.join(c.find('s:is',ns).itertext())
  if v is None:return None
  if typ=='s':return shared[int(v.text)]
  if typ=='b':return bool(int(v.text))
  if typ=='str':return v.text
  return float(v.text)
 sheets={}
 for s in ET.fromstring(z.read('xl/workbook.xml')).find('s:sheets',ns):
  target=rel[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
  target=target.lstrip('/') if target.startswith('/') else 'xl/'+target
  sheet=ET.fromstring(z.read(target));sheets[s.attrib['name']]={c.attrib['r']:getval(c) for c in sheet.findall('.//s:sheetData/s:row/s:c',ns)}
  assert not sheet.findall('.//s:f',ns),'Candidate workbook includes unexpected calculated solution'
 return sheets
def col(n):
 t=''
 while n:n,r=divmod(n-1,26);t=chr(65+r)+t
 return t
for c in cases:
 with zipfile.ZipFile(OFF/(c['id']+'-calisma.xlsx')) as z:
  sheets=xl(z);source=[d for d in c['docs'] if d['headers']];assert len(sheets)==len(source)+3
  assert sheets['Yanıtlar']['B2']==c['id'];assert sheets['Yanıtlar']['B3']==c['version']
  for i,t in enumerate(c['tasks']):assert sheets['Yanıtlar']['B'+str(i+6)]==t;assert sheets['Yanıtlar'].get('C'+str(i+6)) is None
  for d in source:
   cells=sheets[d['code']]
   for i,row in enumerate([d['headers']]+d['rows'],4):
    for j,expected in enumerate(row,1):
     actual=cells[col(j)+str(i)]
     if i>4 and isinstance(expected,str) and re.fullmatch(r'\d{1,2}[.:]\d{2}',expected) and re.search(r'saat|tarih|teslim|hedefi',d['headers'][j-1],re.I):
      h,m=map(int,re.split(r'[.:]',expected));expected=(h*60+m)/1440
     if isinstance(expected,(int,float)):assert isinstance(actual,(int,float)) and math.isclose(actual,expected,abs_tol=1e-9),(c['id'],d['code'],i,j,expected,actual)
     else:assert actual==expected,(c['id'],d['code'],i,j,expected,actual)
  for i,d in enumerate(c['docs'],2):assert sheets['Belgeler']['C'+str(i)]==d['text']
 with zipfile.ZipFile(OFF/(c['id']+'-calisma.docx')) as z:
  doc=ET.fromstring(z.read('word/document.xml'));text=' '.join(t.text or '' for t in doc.findall('.//w:t',ns));tables=doc.findall('.//w:tbl',ns);assert len(tables)==len(source)
  for table,d in zip(tables,source):
   rows=table.findall('w:tr',ns)
   assert len(rows)==len(d['rows'])+1
   for row,expected in zip(rows,[d['headers']]+d['rows']):
    cells=[''.join(t.text or '' for t in cell.findall('.//w:t',ns)) for cell in row.findall('w:tc',ns)]
    assert cells==[rendered(v) for v in expected],(c['id'],d['code'],cells,expected)
  assert c['id'] in text and c['version'] in text
  for t in c['tasks']:assert t in text
  for d in c['docs']:
   for para in re.split(r'\n\s*\n',d['text']):assert para in text
  assert c['learning']['drills'][0]['prompt'] not in text
  assert not any('vbaProject' in n or 'embeddings/' in n for n in z.namelist())
with zipfile.ZipFile(ROOT/'web/cases/assessment-aday-paketleri.zip') as z:
 assert len([n for n in z.namelist() if n.endswith('.docx')])==20
 assert len([n for n in z.namelist() if n.endswith('.xlsx')])==20
print('PASS: 20 DOCX / 20 XLSX; all 187 source texts and 92 editable tables; numeric cell types and exact values; numbered blank outputs; no solution formulas or macro payload; complete ZIP.')
