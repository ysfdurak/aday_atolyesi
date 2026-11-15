#!/usr/bin/env python3
"""İngilizce vitrin vakasının dosyalarını üretir (web/cases/en/).

Kaynak: Türkçe vaka (web/case-data.js içindeki kayıt) ve İngilizce karşılığı (web/cases/en/<id>.json).
İki kaydın aynı yerdeki metinleri eşlenerek Türkçe Word ve Excel çalışma dosyalarındaki metinler
İngilizcesiyle değiştirilir (biçim korunur); CSV tabloları ve aday paketi (.md) İngilizce kayıttan yazılır.

Kullanım: python3 tools/build-en-showcase.py [vaka-id]   (varsayılan: vardiya-darbogazi)
"""
import csv
import io
import json
import re
import subprocess
import sys
from pathlib import Path

import docx
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
EN_DIR = ROOT / 'web' / 'cases' / 'en'
CASE_ID = sys.argv[1] if len(sys.argv) > 1 else 'vardiya-darbogazi'

# Çalışma dosyalarındaki sabit etiketler (vaka verisinde olmayanlar)
LABELS = {
    'Yanıtını bu alana yaz.': 'Write your answer here.',
    'Koru Dağıtım vaka çalışma dosyası': 'Koru Distribution case workbook',
    'Numaralı çıktılar ve cevap alanları': 'Numbered outputs and answer fields',
    'Şirket bilgi dosyası': 'Company information file',
    'Aday yanıtları': 'Candidate answers',
    'Vaka kodu': 'Case code',
    'İçerik sürümü': 'Content version',
    'No': 'No.',
    'Beklenen çıktı': 'Expected output',
    'Yanıtın': 'Your answer',
    'Alan': 'Field',
    'Vaka bilgisi': 'Case information',
    'Başlık': 'Title',
    'Önerilen süre': 'Suggested time',
    'Olay': 'Situation',
    'Görev': 'Task',
    'Dosya düzeni': 'File layout',
    'Belge': 'Document',
    'Kaynak metin': 'Source text',
    'Yanıtlar': 'Answers',
    'Vaka': 'Case',
    'Belgeler': 'Documents',
    'Yanıtlar sayfasındaki numaralı çıktıları doldurabilirsiniz. Kaynak tablolar D kodlu sayfalarda, şirket belgeleri Belgeler sayfasındadır. Kaynak veriler başlangıç dosyasındaki hâliyle korunmalıdır.':
        'Fill in the numbered outputs on the Answers sheet. Source tables are on the D-coded sheets and company documents on the Documents sheet. Keep the source data as it is in the starting file.',
}


def load_tr():
    src = (ROOT / 'web' / 'case-data.js').read_text(encoding='utf-8')
    data = json.loads(src[src.index('['):src.rstrip().rstrip(';').rindex(']') + 1])
    return next(c for c in data if c['id'] == CASE_ID)


def pairs(tr, en, out):
    """Aynı yapıdaki iki kayıttan (Türkçe, İngilizce) metin çiftleri çıkarır."""
    if isinstance(tr, str) and isinstance(en, str):
        if tr != en:
            out[tr] = en
            for a, b in zip(tr.split('\n\n'), en.split('\n\n')):
                out[a] = b
    elif isinstance(tr, list) and isinstance(en, list):
        for a, b in zip(tr, en):
            pairs(a, b, out)
    elif isinstance(tr, dict) and isinstance(en, dict):
        for k in tr:
            if k in en:
                pairs(tr[k], en[k], out)
    return out


def translate(text, table, missing):
    if text is None:
        return None
    if text in table:
        return table[text]
    # "D01 Şirket dosyası / ..." biçimindeki başlıklar ve "1 <görev>" satırları
    m = re.match(r'^(D\d\d|\d+)(\s+)(.*)$', text, re.S)
    if m and m.group(3) in table:
        return m.group(1) + m.group(2) + table[m.group(3)]
    m = re.match(r'^(D\d\d) (.*)$', text)
    if m:
        return text
    m = re.match(r'^Açıklama ve kapsam Belgeler sayfasında (D\d\d) kaydındadır\.$', text)
    if m:
        return f'Description and scope are in record {m.group(1)} on the Documents sheet.'
    m = re.match(r'^Vaka kodu (\S+)\s+İçerik sürümü (\S+)$', text)
    if m:
        return f'Case code {m.group(1)}    Content version {m.group(2)}'
    m = re.match(r'^(\d+) dakika$', text)
    if m:
        return f'{m.group(1)} minutes'
    if re.search(r'[çğıöşüÇĞİÖŞÜ]', text):
        missing.add(text)
    return text


def set_paragraph(p, text):
    if not p.runs:
        p.add_run(text)
        return
    p.runs[0].text = text
    for r in p.runs[1:]:
        r.text = ''


def build_docx(tr, table, missing):
    d = docx.Document(ROOT / 'web' / tr['wordFile'].lstrip('/'))
    def walk_paragraphs(paras):
        for p in paras:
            if p.text.strip():
                new = translate(p.text, table, missing)
                if new != p.text:
                    set_paragraph(p, new)
    walk_paragraphs(d.paragraphs)
    for t in d.tables:
        for row in t.rows:
            for cell in row.cells:
                walk_paragraphs(cell.paragraphs)
    d.core_properties.title = table.get(tr['title'], tr['title'])
    d.core_properties.language = 'en-GB'
    d.save(EN_DIR / f'{CASE_ID}-workbook.docx')


def build_xlsx(tr, table, missing):
    wb = openpyxl.load_workbook(ROOT / 'web' / tr['excelFile'].lstrip('/'))
    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for c in row:
                if isinstance(c.value, str):
                    c.value = translate(c.value, table, missing)
        if ws.title in LABELS:
            ws.title = LABELS[ws.title]
    wb.save(EN_DIR / f'{CASE_ID}-workbook.xlsx')


def build_csv(en):
    for doc in en['docs']:
        if not doc.get('file'):
            continue
        buf = io.StringIO()
        w = csv.writer(buf, delimiter=';', lineterminator='\n')
        w.writerow(doc['headers'])
        w.writerows(doc['rows'])
        (ROOT / 'web' / doc['file'].lstrip('/')).write_text('﻿' + buf.getvalue(), encoding='utf-8')


def build_md(en):
    out = [f"# {en['title']}", '', f"Original synthetic practice case · {en['version']} · Level {en['level']} · About {en['minutes']} minutes", '',
           en['brief'], '', '## Candidate task', '', en['mandate'], '']
    for doc in en['docs']:
        out += [f"## {doc['code']} / {doc['title']}", '', doc['text'], '']
        if doc['headers']:
            out.append('|' + '|'.join(doc['headers']) + '|')
            out.append('|' + '|'.join('---' for _ in doc['headers']) + '|')
            out += ['|' + '|'.join(str(x) for x in r) + '|' for r in doc['rows']]
            out.append('')
    out += ['## Expected outputs', '']
    out += [f'{i}. {t}' for i, t in enumerate(en['tasks'], 1)]
    out += ['', 'Open-ended answers are not scored automatically. The case is for preparation; it does not claim equivalence with a real assessment centre or guarantee a job. The reference solution opens in the app after your first submission.', '']
    (EN_DIR / f'{CASE_ID}-candidate.md').write_text('\n'.join(out), encoding='utf-8')


def main():
    tr = load_tr()
    en = json.loads((EN_DIR / f'{CASE_ID}.json').read_text(encoding='utf-8'))
    table = pairs(tr, en, {})
    table.update(LABELS)
    missing = set()
    build_docx(tr, table, missing)
    build_xlsx(tr, table, missing)
    build_csv(en)
    build_md(en)
    if missing:
        print('Çevrilmeden kalan metinler:')
        for m in sorted(missing):
            print(' -', m[:160])
        sys.exit(1)
    print('İngilizce vitrin dosyaları hazır:', ', '.join(sorted(p.name for p in EN_DIR.glob(f'{CASE_ID}*'))))


if __name__ == '__main__':
    main()
