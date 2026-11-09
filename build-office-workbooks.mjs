import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';
const [input, outputDir, qaDir] = process.argv.slice(2);
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(qaDir, { recursive: true });
const cases = JSON.parse(await fs.readFile(input, 'utf8'));
const col = n => {
  let s = '';
  for (n++; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};
function style(sheet, range) {
  sheet.showGridLines = false;
  sheet.getRange(range).format.font = { name: 'Arial', size: 11, color: '#172D29' };
  sheet.getRange(range).format.verticalAlignment = 'center';
}
function header(sheet, range) {
  sheet.getRange(range).format = {
    fill: '#163D37',
    font: { name: 'Arial', size: 11, bold: true, color: '#FFFFFF' },
    wrapText: true,
    verticalAlignment: 'center',
    horizontalAlignment: 'center',
  };
  sheet.getRange(range).format.rowHeight = 42;
}
function rows(sheet, matrix, start = 1) {
  const end = col(matrix[0].length - 1) + (start + matrix.length - 1);
  sheet.getRange('A' + start + ':' + end).values = matrix;
}
const manifests = [];
for (const c of cases) {
  const w = Workbook.create(),
    answer = w.worksheets.add('Yanıtlar'),
    vaka = w.worksheets.add('Vaka'),
    notes = w.worksheets.add('Belgeler');
  style(answer, 'A1:C12');
  answer.getRange('A1').values = [['Aday yanıtları']];
  answer.getRange('A1').format.font = { name: 'Arial', size: 16, bold: true };
  answer.getRange('A2:B3').values = [
    ['Vaka kodu', c.id],
    ['İçerik sürümü', c.version],
  ];
  answer.getRange('A5:C5').values = [['No', 'Beklenen çıktı', 'Yanıtınız']];
  header(answer, 'A5:C5');
  rows(
    answer,
    c.tasks.map((t, i) => [i + 1, t, null]),
    6
  );
  answer.getRange('A6:C' + (5 + c.tasks.length)).format.wrapText = true;
  answer.getRange('A6:C' + (5 + c.tasks.length)).format.rowHeight = 126;
  answer.getRange('C6:C' + (5 + c.tasks.length)).format.fill = '#FFF5CE';
  answer.getRange('A1:A12').format.columnWidth = 16;
  answer.getRange('B1:B12').format.columnWidth = 67;
  answer.getRange('C1:C12').format.columnWidth = 78;
  answer.tabColor = '#9E7B28';
  answer.freezePanes.freezeRows(5);
  style(vaka, 'A1:B14');
  rows(vaka, [
    ['Alan', 'Vaka bilgisi'],
    ['Başlık', c.title],
    ['Vaka kodu', c.id],
    ['İçerik sürümü', c.version],
    ['Önerilen süre', c.minutes + ' dakika'],
    ['Olay', c.brief],
    ['Görev', c.mandate],
    [
      'Dosya düzeni',
      'Yanıtlar sayfasındaki numaralı çıktıları doldurabilirsiniz. Kaynak tablolar D kodlu sayfalarda, şirket belgeleri Belgeler sayfasındadır. Kaynak veriler başlangıç dosyasındaki hâliyle korunmalıdır.',
    ],
  ]);
  header(vaka, 'A1:B1');
  vaka.getRange('A1:A12').format.columnWidth = 24;
  vaka.getRange('B1:B12').format.columnWidth = 120;
  vaka.getRange('A2:B8').format.wrapText = true;
  for (let r = 2; r <= 8; r++)
    vaka.getRange('A' + r + ':B' + r).format.rowHeight = Math.max(
      30,
      Math.ceil(String(vaka.getRange('B' + r).values[0][0]).length / 110) * 18 + 16
    );
  vaka.tabColor = '#506B62';
  style(notes, 'A1:C' + (c.docs.length + 1));
  rows(notes, [['Belge', 'Başlık', 'Kaynak metin'], ...c.docs.map(d => [d.code, d.title, d.text])]);
  header(notes, 'A1:C1');
  notes.getRange('A1:A' + (c.docs.length + 1)).format.columnWidth = 12;
  notes.getRange('B1:B' + (c.docs.length + 1)).format.columnWidth = 44;
  notes.getRange('C1:C' + (c.docs.length + 1)).format.columnWidth = 120;
  notes.getRange('A2:C' + (c.docs.length + 1)).format.wrapText = true;
  for (let i = 0; i < c.docs.length; i++)
    notes.getRange('A' + (i + 2) + ':C' + (i + 2)).format.rowHeight = Math.max(
      65,
      Math.ceil(c.docs[i].text.length / 110) * 18 + c.docs[i].text.split('\n').length * 8 + 16
    );
  notes.freezePanes.freezeRows(1);
  notes.tabColor = '#7D8790';
  const ranges = [
    ['Yanıtlar', 'A1:C' + (5 + c.tasks.length)],
    ['Vaka', 'A1:B8'],
    ['Belgeler', 'A1:C' + (c.docs.length + 1)],
  ];
  for (const d of c.docs.filter(d => d.headers.length)) {
    const s = w.worksheets.add(d.code),
      end = col(d.headers.length - 1),
      last = d.rows.length + 4;
    style(s, 'A1:' + end + last);
    s.getRange('A1').values = [[d.code + ' ' + d.title]];
    s.getRange('A1').format.font = { name: 'Arial', size: 14, bold: true };
    s.getRange('A2').values = [['Açıklama ve kapsam Belgeler sayfasında ' + d.code + ' kaydındadır.']];
    s.getRange('A2').format.font = { name: 'Arial', size: 10, italic: true, color: '#52645D' };
    const isTime = (v, j) =>
      typeof v === 'string' &&
      /^\d{1,2}[.:]\d{2}$/.test(v) &&
      /(saat|tarih|teslim|hedefi)/i.test(d.headers[j]);
    const sourceRows = d.rows.map(r =>
      r.map((v, j) =>
        isTime(v, j) ? (Number(v.split(/[.:]/)[0]) * 60 + Number(v.split(/[.:]/)[1])) / 1440 : v
      )
    );
    rows(s, [d.headers, ...sourceRows], 4);
    header(s, 'A4:' + end + '4');
    for (let j = 0; j < d.headers.length; j++) {
      const values = sourceRows.map(r => r[j]),
        max = Math.max(d.headers[j].length, ...values.map(v => String(v).length));
      const width = Math.min(48, Math.max(18, max + 2));
      s.getRange(col(j) + '1:' + col(j) + last).format.columnWidth = width;
      s.getRange(col(j) + '5:' + col(j) + last).format.horizontalAlignment = values.every(
        v => typeof v === 'number'
      )
        ? 'right'
        : 'left';
      s.getRange(col(j) + '5:' + col(j) + last).setNumberFormat(
        values.some(v => typeof v === 'number')
          ? values.some(v => typeof v === 'number' && !Number.isInteger(v))
            ? '#,##0.00'
            : '#,##0'
          : '@'
      );
      for (let i = 0; i < values.length; i++)
        if (isTime(d.rows[i][j], j)) s.getRange(col(j) + (i + 5)).setNumberFormat('hh:mm');
        else if (typeof values[i] === 'string') s.getRange(col(j) + (i + 5)).setNumberFormat('@');
    }
    s.getRange('A4:' + end + last).format.wrapText = true;
    s.getRange('A5:' + end + last).format.rowHeight = 34;
    s.tables.add('A4:' + end + last, true, 'Kaynak_' + d.code);
    s.freezePanes.freezeRows(4);
    s.tabColor = '#7D8790';
    ranges.push([d.code, 'A1:' + end + last]);
  }
  w.recalculate();
  const scanned = await w.inspect({
    kind: 'match',
    searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#SPILL!',
    options: { useRegex: true, maxResults: 5 },
    summary: 'formula check',
  });
  if (scanned.ndjson.includes('"match"')) throw Error('Unexpected formula error ' + c.id);
  const file = path.join(outputDir, c.id + '-calisma.xlsx');
  await (await SpreadsheetFile.exportXlsx(w)).save(file);
  // Every exported worksheet has a preview for visual QA.
  for (const [sheetName, range] of ranges) {
    const img = await w.render({ sheetName, range, scale: 1, format: 'png' });
    await fs.writeFile(
      path.join(qaDir, c.id + '-' + sheetName + '.png'),
      new Uint8Array(await img.arrayBuffer())
    );
  }
  manifests.push({
    id: c.id,
    file,
    sheets: ranges.length,
    sourceTables: c.docs.filter(d => d.headers.length).length,
  });
  console.log(c.id + ' · ' + ranges.length + ' sheets');
}
await fs.writeFile(path.join(outputDir, 'workbook-manifest.json'), JSON.stringify(manifests, null, 2));
