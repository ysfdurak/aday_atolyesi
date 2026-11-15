"""Canlı vitrin için örnek aday teslimlerini üretir.

Çıktı: server/vitrin-samples.mjs (base64 gömülü üç küçük Word dosyası).
Dosyalar kurgusaldır; her gece sıfırlamada vitrine yeniden yüklenir.
Çalıştırma: python3 tools/build-vitrin-samples.py
"""
import base64, io, json
from pathlib import Path
from docx import Document
from docx.shared import Pt

ROOT = Path(__file__).resolve().parent.parent
SAMPLES = [
    {
        'case': 'kpi-paradoksu',
        'user': 'vitrin-ornek-1',
        'name': 'ornek-aday-1-kpi-paradoksu.docx',
        'sections': [
            ('Aylık yönetim değerlendirme notu',
             'Toplam zamanında çözüm oranı %92\'den %85,8\'e düştü (−6,2 puan). Ancak iki kanalda da oran yükseldi; '
             'düşüşün nedeni talep karmasının daha zor kanala kayması. Önceki dönem karmasıyla son dönem oranı %94,2 '
             '(+2,2 puan). Sonuç: ekiplerin kötüleştiği çıkarımı veriyle desteklenmiyor. Önerim: toplam oranı '
             'raporlamaya devam etmek, yanına kanal oranlarını ve sabit karma oranını eklemek. '
             'Varsayım: kanal tanımları iki dönemde aynı.'),
            ('Analiz tabloları ve hesap eki',
             'Önceki dönem: (760+160)/(800+200) = %92. Son dönem: (194+664)/1000 = %85,8. '
             'Sabit karma: 0,80 × 97 + 0,20 × 83 = %94,2. Paydalar toplam talep adedidir.'),
            ('İzleyen dönem çalışma planı',
             '1. hafta: kanal bazlı rapor taslağı (sorumlu: iş analisti). 2. hafta: karmanın neden değiştiğinin '
             'araştırılması. 4. hafta: üç göstergeli ilk aylık rapor. Hedef değişikliği genel müdür onayına sunulacak.'),
            ('Dört slaytlık sunum içeriği',
             '1) Toplam oran neden düştü? 2) Kanal bazında sonuçlar 3) Sabit karma hesabı 4) Öneri ve onay istenen karar.'),
        ],
    },
    {
        'case': 'vardiya-darbogazi',
        'user': 'vitrin-ornek-2',
        'name': 'ornek-aday-2-vardiya-plani.docx',
        'sections': [
            ('Günlük vardiya ve görev dağılım çizelgesi',
             'Toplama iş yükü 1.800 dakika; paketlemede başlangıçta 300 dakikalık açık var. Bir kişiyi tam vardiya '
             'toplamadan paketlemeye kaydırıyorum: kalan üç kişi toplama yükünü karşılıyor, paketleme kapasitesi '
             '4 × 300 = 1.200 dakikaya çıkıyor. Hedef: 17.30 son araç çıkışında bekleyen paket kalmaması.'),
            ('Çalışma tabloları ve hesap eki',
             'Toplama: 900×1 + 300×3 = 1.800 dk. Paketleme ihtiyacı 1.200 dk, mevcut kapasite 3 × 300 = 900 dk.'),
            ('Vardiya başlangıcı bilgilendirmesi',
             'Bugün bir arkadaşımız tam gün paketlemede olacak; görev dağılımı panoda. Sorular için bana ulaşın.'),
            ('Yönetici notu',
             'Fazla mesai yerine iç kaydırma seçildi. Risk: toplamada öğleden sonra yoğunluk. Saatlik kontrol yapılacak.'),
        ],
    },
    {
        'case': 'butce-sapmasi',
        'user': 'vitrin-ornek-3',
        'name': 'ornek-aday-3-butce-notu.docx',
        'sections': [
            ('Yönetim değerlendirme notu',
             'Bütçe 58.000 TL, gerçekleşen 73.000 TL: 15.000 TL olumsuz sapma. 8.000 TL hacim, 6.000 TL fiyat, '
             '1.000 TL sabit maliyet farkından geliyor. Esnek bütçeye (66.000 TL) göre fark 7.000 TL. Önerim: hacme '
             'bağlı kalemleri esnek bütçeyle izlemek, birim fiyat artışı için tedarikçi görüşmesini öne almak.'),
            ('Finansal çalışma tabloları',
             'Fiyat-hacim ayrıştırma tablosu; esnek bütçe karşılaştırması; iç ve dış kaynak maliyet karşılaştırması.'),
            ('Sonraki ay için karar önerisi',
             'İç kaynak 82.000 TL, dış kaynak 82.200 TL; yalnız maliyetle iç kaynak 200 TL düşük. Fark küçük olduğu '
             'için kalite ve esneklik ölçütleri de değerlendirilmeli.'),
            ('Toplantı sonrası özet mesaj',
             'Sapmanın hacim, fiyat ve sabit maliyet etkisine ayrıldığı ve esnek bütçe önerisi paylaşıldı. '
             'Onay sonrası takvim gönderilecek.'),
        ],
    },
]

def build(sample):
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)
    doc.add_heading('Örnek aday yanıtı (kurgusal)', level=1)
    for i, (title, body) in enumerate(sample['sections'], 1):
        doc.add_heading(f'{i}. {title}', level=2)
        doc.add_paragraph(body)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()

out = []
for s in SAMPLES:
    data = build(s)
    out.append({'case': s['case'], 'user': s['user'], 'name': s['name'], 'base64': base64.b64encode(data).decode()})
    print(s['name'], len(data), 'bayt')
js = ('// Üretilmiş dosya: tools/build-vitrin-samples.py\n'
      '// Canlı vitrinde gece sıfırlamada yüklenen kurgusal örnek teslimler.\n'
      'export const SAMPLES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
(ROOT / 'server' / 'vitrin-samples.mjs').write_text(js, encoding='utf-8')
