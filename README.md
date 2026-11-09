# Aday Atölyesi

Aday Atölyesi, başvuru hazırlığını **hedef → pratik → vaka → geri bildirim → revizyon → mülakat provası** akışında birleştiren Türkçe portföy projesidir. Aday kendi çalışmasını düzenler. İK değerlendiricisi atanmış vaka teslimini ölçüt ve dayanak üzerinden inceler.

[Uygulama sürümü 0.16.0](CHANGELOG.md) · [Demo senaryosu](docs/DEMO.md) · [Mimari ve kurulum](docs/ARCHITECTURE.md) · [Doğrulama](docs/VERIFICATION.md)

| Alan | Kullanıcı ne yapar? |
| --- | --- |
| Hazırlık planı | 20 pozisyondan birini seçer ve kıdemine uygun çalışma sırası oluşturur. |
| Rol Atölyesi | 24 yetkinlikte 187 senaryodan pozisyona göre seçilen soruları çözer ve karar gerekçesini yazar. |
| Zihin Parkuru | Altı beceri alanında pratik yapar ve yanlışlarını hata defterinde izler. |
| Mizaç | 96 ifade ve 6 senaryoyla çalışma tercihlerini değerlendirir ve gerçek örneklerle gözden geçirir. |
| Assessment Atölyesi | 20 kurgusal şirket vakasında Word ve Excel belgelerini kullanır, bir karar üretir ve revize eder. |
| Mülakat hazırlığı | Seçtiği örnekleri bir dosyada toplar ve kendi dayanaklarıyla prova yapar. |
| İK incelemesi | Atanmış teslimi ve revizyon zincirini açar, çıktı bazında dayanaklı görüş yazar. |

## Yerel demo

Node.js 24 kurulu bir bilgisayarda proje klasörünü aç ve çalıştır:

```sh
npm run demo
```

Tarayıcıda [http://127.0.0.1:5173](http://127.0.0.1:5173) adresini aç. Hesabım ve teslimler ekranından **Demo rolünü seç** düğmesiyle aday, İK değerlendiricisi veya pilot yöneticisi rolünü açabilirsin. Bu komut için paket kurulumu veya harici hesap gerekmez. Demo, hesap ve teslim kayıtlarını bellekte tutar. Sunucuyu durdurunca bu kayıtlar silinir. Tarayıcıdaki atölye ilerlemesi aynı tarayıcı profilinde saklanır. Demoda kurgusal dosyalar kullan.

## Geliştirme ve kontroller

```sh
npm ci
npm test
npm run build
```

`npm test` kök dizindeki Node kontrol betiklerini çalıştırır. Word/Excel paketlerinin bağımsız OOXML kontrolü için `python check-office-packs.py` komutunu kullan. GitHub Actions bu kontrolleri ve derlemeyi çalıştıracak şekilde tanımlanmıştır.

- `web/` aday arayüzü, atölyeler, vaka verileri ve indirilebilir örnekler
- `pilot-service.mjs` teslim, atama, geri bildirim ve hesap kayıtları
- `file-workspace.mjs` revizyon zinciri ve adayın kişisel dosya notları
- `drizzle/` D1 şeması ve sıralı migration dosyaları
- `scripts/demo.mjs` sentetik rolleri yerelde açan demo
- `content/` düzenlenebilir rol ve pozisyon içeriği

## Kapsam ve sınırlar

Uygulama başvuru hazırlığı ve gelişim amaçlıdır. Mizaç ve senaryo sonuçları öz değerlendirmeyi destekler. İşe alınma olasılığı veya tek bir uygunluk puanı hesaplanmaz. İK görüşü, yayımlandığı teslim sürümüyle birlikte gösterilir. Vaka dosyalarındaki sayfa ve hücre referanslarını kullanıcı ekler ve değerlendirici kontrol eder.

Gerçek aday pilotu, iki gerçek hesapla canlı kabul, masaüstü ve mobil görsel kabul ile psikometrik doğrulama açık çalışma kalemleridir. [Pilot kabul durumu](PREPILOT-ACCEPTANCE.md) · [Pilot planı](PILOT-PROTOCOL.md)

Projeyi geliştiren **Yusuf Durak**.
