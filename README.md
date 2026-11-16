# Aday Atölyesi

Aday Atölyesi, başvuru hazırlığını **hedef → pratik → vaka → geri bildirim → revizyon → mülakat provası** akışında birleştiren Türkçe portföy projesidir. Aday kendi çalışmasını düzenler. İK değerlendiricisi atanmış vaka teslimini ölçüt ve dayanak üzerinden inceler.

[Uygulama sürümü 0.20.0](CHANGELOG.md) · [Demo senaryosu](docs/DEMO.md) · [Mimari ve kurulum](docs/ARCHITECTURE.md) · [Doğrulama](docs/VERIFICATION.md)

| Alan | Kullanıcı ne yapar? |
| --- | --- |
| Hazırlık planı | 20 pozisyondan birini seçer ve kıdemine uygun çalışma sırası oluşturur. |
| Rol Atölyesi | 24 yetkinlikte 187 senaryodan pozisyona göre seçilen soruları çözer ve karar gerekçesini yazar. |
| Zihin Parkuru | Altı beceri alanında pratik yapar ve yanlışlarını hata defterinde izler. |
| Mizaç | 96 ifade ve 6 senaryoyla çalışma tercihlerini değerlendirir ve gerçek örneklerle gözden geçirir. |
| Vaka Atölyesi | 20 kurgusal şirket vakasında Word ve Excel belgelerini kullanır, bir karar üretir ve revize eder. |
| Mülakat hazırlığı | Seçtiği örnekleri bir dosyada toplar ve kendi dayanaklarıyla prova yapar. |
| İK incelemesi | Atanmış teslimi ekranda açar, her ölçüt için 0–3 seviye seçer ve çıktı bazında dayanaklı görüş yazar. Yönetici kör değerlendirmeyi açabilir, bekleyen teslimleri toplu atar. |

## Canlı demo

**[aday.ysfdurak.com](https://aday.ysfdurak.com/)**: tam sürüm, kurulum gerektirmez. Hesap ve ayarlar → **Giriş yap** ile bir rol seç (aday, İK değerlendiricisi veya pilot yöneticisi), şifre yok. Örnek teslimler yüklüdür; aday olarak dosya teslim edebilir, değerlendirici olarak ölçütlü geri bildirim yazabilir, yönetici olarak atama ve kör değerlendirmeyi deneyebilirsin.

> **Not:** Canlı demo herkese açık bir vitrindir. Değerlendirici ve yönetici hesapları ortaktır; yüklenen dosyalar bu rolleri seçen herkese görünür. **Gerçek kişisel bilgi içeren dosya yükleme.** Bütün kayıtlar ve dosyalar her gece 03.00'te (TSİ) silinir, dosya sınırı 3 MB'tır. Nasıl çalıştığı: [docs/YAYIN.md](docs/YAYIN.md).

Eski `ysfdurak.github.io/aday_atolyesi` adresi canlı demoya yönlenir.

### İngilizce tanıtım turu

Uygulama Türk adaylar için yazıldığından arayüz ve içerik Türkçe kalır. İngilizce okuyan ziyaretçi için adresin sonuna `?lang=en` eklenir: [aday.ysfdurak.com/?lang=en](https://aday.ysfdurak.com/?lang=en). Her ekranın ne işe yaradığını anlatan bir rehber paneli açılır, menü ve başlıkların altında küçük İngilizce karşılıklar görünür, **Koru Distribution** vakası (belgeler, Word/Excel dosyaları ve referans çözüm) tamamen İngilizce açılır. `?lang=tr` turu kapatır. Ayrıntı: [docs/INGILIZCE-TUR.md](docs/INGILIZCE-TUR.md).

## Yerel demo

Node.js 22.13 veya üstü (önerilen: 24) kurulu bir bilgisayarda proje klasörünü aç ve çalıştır:

```sh
npm run demo
```

Aynı bilgisayardaki tarayıcıda [http://127.0.0.1:5173](http://127.0.0.1:5173) adresini aç (bu adres yalnızca komutu çalıştırdığın bilgisayarda açılır; telefondan açılmaz). Hesabım ve teslimler ekranından **Demo rolünü seç** düğmesiyle aday, İK değerlendiricisi veya pilot yöneticisi rolünü açabilirsin. Bu komut için paket kurulumu veya harici hesap gerekmez. Demo, hesap ve teslim kayıtlarını bellekte tutar. Sunucuyu durdurunca bu kayıtlar silinir. Tarayıcıdaki atölye ilerlemesi aynı tarayıcı profilinde saklanır. Demoda kurgusal dosyalar kullan.

## Geliştirme ve kontroller

```sh
npm ci
npm test
npm run build
```

`npm test` `tests/` altındaki kontrol betiklerini çalıştırır. `npm run lint` ESLint, `npm run format` Prettier çalıştırır. Word/Excel paketlerinin bağımsız OOXML kontrolü için `python3 tests/check-office-packs.py` komutunu kullan. GitHub Actions lint, test, Office kontrolü ve derlemeyi çalıştırır.

| Klasör | İçerik |
| --- | --- |
| `web/` | Aday arayüzü, atölyeler (`web/modules/`), vaka verileri ve indirilebilir dosyalar |
| `server/` | Pilot API: teslim, atama, geri bildirim, hesap kaydı (`pilot-service.mjs`), kimlik katmanı (`identity.mjs`), canlı demo vitrini (`vitrin.mjs`) |
| `content/` | Düzenlenebilir rol, yetkinlik ve pozisyon içeriği |
| `tools/` | İçerikten veri dosyalarını üreten betikler (`npm run cases` vakaları yeniden üretir) |
| `tests/` | Otomatik kontroller |
| `drizzle/` | D1 şeması ve sıralı migration dosyaları |
| `scripts/` | Demo, derleme ve test çalıştırıcıları |
| `docs/` | Mimari, demo, pilot protokolü, doğrulama kaydı ve geçmiş incelemeler |

`web/case-data.js`, Office paketleri ve benzeri büyük dosyalar `tools/` betiklerinin çıktısıdır; demo kurulum gerektirmeden çalışsın diye repoda tutulur ve `.gitattributes` ile üretilmiş dosya olarak işaretlidir.

## Kapsam ve sınırlar

Uygulama başvuru hazırlığı ve gelişim amaçlıdır. Mizaç ve senaryo sonuçları öz değerlendirmeyi destekler. İşe alınma olasılığı veya tek bir uygunluk puanı hesaplanmaz. İK görüşü, yayımlandığı teslim sürümüyle birlikte gösterilir. Vaka dosyalarındaki sayfa ve hücre referanslarını kullanıcı ekler ve değerlendirici kontrol eder.

Gerçek aday pilotu, iki gerçek hesapla canlı kabul, masaüstü ve mobil görsel kabul ile psikometrik doğrulama açık çalışma kalemleridir. [Pilot kabul durumu](docs/PREPILOT-ACCEPTANCE.md) · [Pilot planı](docs/PILOT-PROTOCOL.md)

Projeyi geliştiren **Yusuf Durak**.
