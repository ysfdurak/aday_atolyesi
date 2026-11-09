# 0.18.0 doğrulama kaydı

9 Kasım 2026 · Revizyon dalında yeniden çalıştırıldı.

| Kontrol | Sonuç |
| --- | --- |
| Bağımlılık kurulumu | Node.js 22.23 ile `npm ci` tamamlandı. |
| Lint (`npm run lint`) | 0 hata. Kalan uyarılar kullanılmayan değişkenlerle ilgilidir. |
| Node kontrol paketi (`npm test`) | 33 betik geçti. 0.18.1'de statik yayın kontrolü eklendi. 0.17'de otomatik hesap kaydı, 0.18'de İK değerlendirme kontrolü eklendi: ölçüt seviyesi doğrulaması, taslak/yayın, kör değerlendirmede liste-indirme-dosya zinciri gizliliği, kuyruk sırası ve kaçışlı geri bildirim görünümü. Mizaç kontrolü oturum molalarını da sınar. |
| Yerel HTTP demo (`node tests/check-demo.mjs`) | Üç örnek rolün oturumu, aday dosya teslimi, yönetici ataması, değerlendirici indirmesi, özel taslak ve adayın yayımlanan görüşe erişimi doğrulandı. |
| Office paketleri (`python3 tests/check-office-packs.py`) | 20 Word ve 20 Excel dosyası, 187 kaynak metni ve 92 tablo, metin düzeltmelerinden sonra yeniden geçti. |
| Üretim derlemesi | `npm run build` tamamlandı. |
| İK akışı (tarayıcı) | Yönetici kör modu açtı ve üç teslimi eşit dağıtarak atadı; değerlendirici takma adla gördü, DOCX/XLSX/PDF önizlemelerini açtı, ölçüt seviyeleriyle geri bildirim yayımladı; aday ölçüt çubuklarını gördü. |
| Görsel kontrol | Masaüstü (1366 px) ve mobil (390 px) görünümde ana ekranlar, vaka ekranı ve modüller headless Chrome ile gezildi; yatay taşma yok. Gerçek telefon testi değildir. |

Canlı iki hesaplı davet, gerçek cihaz kabulü ve gerçek aday pilotu [kabul listesinde](PREPILOT-ACCEPTANCE.md) açık olarak izlenir.
