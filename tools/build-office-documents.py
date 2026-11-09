"""Editable case dossiers; candidate outputs only, no solutions or rubrics."""
from pathlib import Path
import json, re,sys,subprocess,concurrent.futures
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT,WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'outputs'/'office-packs';QA=ROOT.parent/'office-qa'/'docx';QA.mkdir(parents=True,exist_ok=True)
cases=json.loads((OUT/'catalog.json').read_text())
def cells_table(doc,headers,rows):
 t=doc.add_table(rows=1,cols=len(headers));t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
 weights=[]
 for i,h in enumerate(headers):
  numeric=bool(rows) and all(isinstance(r[i],(int,float)) for r in rows)
  weights.append(max(12,min(24,len(str(h)))) if numeric else max(7,min(32,max(len(str(h)),max((len(str(r[i])) for r in rows),default=0)))))
 widths=[7.15*w/sum(weights) for w in weights]
 for i,w in enumerate(widths):t.columns[i].width=Inches(w)
 trPr=t.rows[0]._tr.get_or_add_trPr();repeat=OxmlElement('w:tblHeader');trPr.append(repeat)
 for rowidx,vals in enumerate([headers]+rows):
  row=t.rows[0] if rowidx==0 else t.add_row()
  no_split=OxmlElement('w:cantSplit');row._tr.get_or_add_trPr().append(no_split);cells=row.cells
  for i,(cell,value) in enumerate(zip(cells,vals)):
   cell.width=Inches(widths[i]);cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
   tcPr=cell._tc.get_or_add_tcPr();margin=OxmlElement('w:tcMar')
   for edge in ['top','left','bottom','right']:
    e=OxmlElement('w:'+edge);e.set(qn('w:w'),'75');e.set(qn('w:type'),'dxa');margin.append(e)
   tcPr.append(margin);borders=OxmlElement('w:tcBorders')
   for edge in ['top','left','bottom','right']:
    e=OxmlElement('w:'+edge);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
   tcPr.append(borders)
   fill=OxmlElement('w:shd');fill.set(qn('w:fill'),'243C48' if rowidx==0 else ('F1F4F6' if rowidx%2==0 else 'FFFFFF'));tcPr.append(fill)
   p=cell.paragraphs[0];p.paragraph_format.space_after=Pt(2);p.paragraph_format.space_before=Pt(2);p.paragraph_format.line_spacing=1.05
   p.alignment=WD_ALIGN_PARAGRAPH.CENTER if rowidx==0 or isinstance(value,(int,float)) else WD_ALIGN_PARAGRAPH.LEFT
   if isinstance(value,float):value=f'{value:g}'.replace('.',',')
   if isinstance(value,int) and abs(value)>=1000:value=f'{value:,}'.replace(',','.')
   p.paragraph_format.keep_with_next=(rowidx<len(rows))
   r=p.add_run(str(value));r.font.name='Arial';r.font.size=Pt(9.5 if len(headers)>5 else 10);r.font.bold=rowidx==0;r.font.color.rgb=RGBColor.from_string('FFFFFF' if rowidx==0 else '000000')
 doc.add_paragraph().paragraph_format.space_after=Pt(1)
 return t
for c in cases:
 d=Document();sec=d.sections[0];sec.page_width=Inches(8.5);sec.page_height=Inches(11);sec.left_margin=sec.right_margin=Inches(.675);sec.top_margin=sec.bottom_margin=Inches(.65)
 for name in ['Normal','Title','Heading 1','Heading 2','Heading 3']:
  s=d.styles[name];s.font.name='Arial';s.font.color.rgb=RGBColor(0,0,0)
 d.styles['Normal'].font.size=Pt(11);d.styles['Normal'].paragraph_format.space_after=Pt(4);d.styles['Normal'].paragraph_format.line_spacing=1.03
 d.styles['Title'].font.size=Pt(23);d.styles['Heading 1'].font.size=Pt(15);d.styles['Heading 2'].font.size=Pt(12)
 d.core_properties.title=c['title'];d.core_properties.author='Aday Atölyesi';d.core_properties.identifier=c['id'];d.core_properties.version=c['version']
 d.add_paragraph(c['company']+' vaka çalışma dosyası','Title')
 d.add_paragraph('Vaka kodu '+c['id']+'    İçerik sürümü '+c['version'])
 d.add_paragraph(c['brief']);d.add_paragraph(c['mandate'])
 d.add_heading('Numaralı çıktılar ve cevap alanları',1)
 for i,t in enumerate(c['tasks']):
  d.add_heading(str(i+1)+' '+t,2)
  p=d.add_paragraph('Yanıtını bu alana yaz.');p.runs[0].font.color.rgb=RGBColor.from_string('777777');p.runs[0].italic=True
  d.add_paragraph()
 d.add_page_break();d.add_heading('Şirket bilgi dosyası',1)
 for src in c['docs']:
  d.add_heading(src['code']+' '+src['title'],2)
  for para in re.split(r'\n\s*\n',src['text']):d.add_paragraph(para)
  if src['headers']:
   d.paragraphs[-1].paragraph_format.keep_with_next=True
   cells_table(d,src['headers'],src['rows'])
 footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT;footer.paragraph_format.space_before=Pt(0);r=footer.add_run();r.font.size=Pt(9);field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');r._r.append(field)
 # Explicitly suppress the default template title border.
 for element in [d._element,d.styles._element]:
  for border in element.xpath('.//w:pBdr'):border.getparent().remove(border)
 title_p=d.paragraphs[0]._p.get_or_add_pPr();border=OxmlElement('w:pBdr')
 for edge in ['top','left','bottom','right']:
  e=OxmlElement('w:'+edge);e.set(qn('w:val'),'nil');border.append(e)
 title_p.append(border)
 d.save(OUT/(c['id']+'-calisma.docx'))
print('20 editable DOCX files written',flush=True)
renderer='/root/.codex/skills/builtins/documents/render_docx.py'
def render(c):
 folder=QA/c['id']
 if folder.exists():
  for old in folder.glob('page-*.png'):old.unlink()
 r=subprocess.run([sys.executable,renderer,str(OUT/(c['id']+'-calisma.docx')),'--output_dir',str(folder),'--emit_pdf'],capture_output=True,text=True)
 if r.returncode:raise RuntimeError(c['id']+' '+r.stderr[-1500:])
 return c['id'],len(list(folder.glob('page-*.png')))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
 results=list(ex.map(render,cases))
(QA/'manifest.json').write_text(json.dumps(results));print(json.dumps(results),flush=True)
