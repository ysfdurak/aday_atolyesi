# 0.17.0 doğrulama kaydı

9 Kasım 2026 · Revizyon dalında yeniden çalıştırıldı.

| Kontrol | Sonuç |
| --- | --- |
| Bağımlılık kurulumu | Node.js 22.23 ile `npm ci` tamamlandı. |
| Lint (`npm run lint`) | 0 hata. Kalan uyarılar kullanılmayan değişkenlerle ilgilidir. |
| Node kontrol paketi (`npm test`) | 31 betik geçti. 0.16.0'daki 30 kontrole otomatik hesap kaydı kontrolü eklendi (CV dışlama, değişiklik algılama, sürüm çakışması, misafir koruması). |
| Yerel HTTP demo (`node tests/check-demo.mjs`) | Üç örnek rolün oturumu, aday dosya teslimi, yönetici ataması, değerlendirici indirmesi, özel taslak ve adayın yayımlanan görüşe erişimi doğrulandı. |
| Office paketleri (`python3 tests/check-office-packs.py`) | 20 Word ve 20 Excel dosyası, 187 kaynak metni ve 92 tablo, metin düzeltmelerinden sonra yeniden geçti. |
| Üretim derlemesi | `npm run build` tamamlandı. |
| Görsel kontrol | Masaüstü (1366 px) ve mobil (390 px) görünümde ana ekranlar, vaka ekranı ve modüller headless Chrome ile gezildi; yatay taşma yok. Gerçek telefon testi değildir. |

Canlı iki hesaplı davet, gerçek cihaz kabulü ve gerçek aday pilotu [kabul listesinde](PREPILOT-ACCEPTANCE.md) açık olarak izlenir.
