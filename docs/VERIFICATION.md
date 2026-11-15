# 0.19.1 doğrulama kaydı

9 Kasım 2026 · Revizyon dalında yeniden çalıştırıldı.

| Kontrol | Sonuç |
| --- | --- |
| Bağımlılık kurulumu | Node.js 22.23 ile `npm ci` tamamlandı. |
| Lint (`npm run lint`) | 0 hata. Kalan uyarılar kullanılmayan değişkenlerle ilgilidir. |
| Node kontrol paketi (`npm test`) | 34 betik geçti. 0.19'da canlı vitrin kontrolü eklendi. 0.18.1'de statik yayın kontrolü eklendi. 0.17'de otomatik hesap kaydı, 0.18'de İK değerlendirme kontrolü eklendi: ölçüt seviyesi doğrulaması, taslak/yayın, kör değerlendirmede liste-indirme-dosya zinciri gizliliği, kuyruk sırası ve kaçışlı geri bildirim görünümü. Mizaç kontrolü oturum molalarını da sınar. |
| Yerel HTTP demo (`node tests/check-demo.mjs`) | Üç örnek rolün oturumu, aday dosya teslimi, yönetici ataması, değerlendirici indirmesi, özel taslak ve adayın yayımlanan görüşe erişimi doğrulandı. |
| Office paketleri (`python3 tests/check-office-packs.py`) | 20 Word ve 20 Excel dosyası, 187 kaynak metni ve 92 tablo, metin düzeltmelerinden sonra yeniden geçti. |
| Üretim derlemesi | `npm run build` tamamlandı. |
| İK akışı (tarayıcı) | Yönetici kör modu açtı ve üç teslimi eşit dağıtarak atadı; değerlendirici takma adla gördü, DOCX/XLSX/PDF önizlemelerini açtı, ölçüt seviyeleriyle geri bildirim yayımladı; aday ölçüt çubuklarını gördü. |
| Cloudflare yayın provası | `npm run build` ve `wrangler deploy --dry-run` temiz (gzip 358 KB; D1, R2, değişkenler ve gece görevi tanımlı). `wrangler dev` ile yerel Workers ortamında aday girişi ve dosya teslimi, yönetici kör mod ve toplu atama, değerlendirici kuyruğu ve DOCX önizlemesi denendi. Gece sıfırlama ayrı bir deneme Worker'ıyla gerçek D1/R2 üzerinde doğrulandı. |
| Canlı demo dayanıklılığı (0.19.1) | Yerel Workers ortamında 12 API ve 12 bot isteği aynı anda gönderildi: hata kaydı yok, örnek teslimler tek kez yüklendi, `.env`/`config.php` gibi yollar uygulama çalışmadan 404 aldı. Eski Pages adresleri (kök, `web/`, modül sayfası) canlı demoya yönlendi. |
| Görsel kontrol | Masaüstü (1366 px) ve mobil (390 px) görünümde ana ekranlar, vaka ekranı ve modüller headless Chrome ile gezildi; yatay taşma yok. Gerçek telefon testi değildir. |

Canlı iki hesaplı davet, gerçek cihaz kabulü ve gerçek aday pilotu [kabul listesinde](PREPILOT-ACCEPTANCE.md) açık olarak izlenir.
