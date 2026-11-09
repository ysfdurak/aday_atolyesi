# Aday ve İK demo senaryosu

`npm run demo` komutuyla yerel sunucuyu başlat. Adres olarak `http://127.0.0.1:5173` kullan. Hesabım ve teslimler bölümündeki giriş ekranı üç örnek rol sunar. Aynı rol değişimini çıkış ve yeniden giriş ile yapabilirsin. Eşzamanlı deneme için farklı tarayıcı profilleri kullan. Aşağıdaki akışta **Ardıç Hizmet — Aylık yönetim toplantısı** vakasını ve [Word](../web/cases/office/kpi-paradoksu-calisma.docx) ya da [Excel](../web/cases/office/kpi-paradoksu-calisma.xlsx) çalışma dosyasını kullanabilirsin.

| Sıra | Rol | Eylem | Beklenen sonuç |
| --- | --- | --- | --- |
| 1 | Aday | Hedef pozisyon, kıdem, tarih ve çalışma süresini seç. | Günlük çalışma planı oluşur. |
| 2 | Aday | Assessment Atölyesi'nde bir vakayı aç. Word veya Excel çalışma dosyasına beklenen çıktıları yaz ve teslim et. | Teslim kodu ve bekleyen görüş görünür. |
| 3 | Pilot yöneticisi | Teslimi bul ve örnek İK değerlendiricisini ata. | Atama teslim kaydında görünür. |
| 4 | İK değerlendiricisi | Atanmış teslimde dosyayı ve ölçütleri incele. Her çıktı için gözlem, dayanak ve sonraki adımı yaz. | Taslak kaydedilebilir ve yayımlanan görüş teslim sürümüne bağlanır. |
| 5 | Aday | Geri bildirimi aç, kısa alıştırmayı yap ve yeni dosyayı önceki teslimin revizyonu olarak gönder. | İlk ve son dosyayı birlikte inceleyebilirsin. |
| 6 | Aday | Karar savunması ve yeni bağlam çalışmasına ilerle. Dosya çalışmasından seçili özeti mülakat dosyasına aktar. | Özet ve dayanaklar provada kullanılır. |

Adayın yazdığı kişisel karşılaştırma ve görüşme özeti kendi hesabına aittir. İK ekranı teslim, revizyon zinciri, ölçüt ve yayımlanmış görüşleri gösterir. Atama ve erişim kuralları aynı pilot servisi üzerinden çalışır.

Teslim, atama ve görüş paylaşımını tekrarlamak için proje kökünde `node check-demo.mjs` çalıştır. [Doğrulama kaydında](VERIFICATION.md) bu otomatik kontrol ile görsel ve canlı kabulün durumunu ayrı ayrı görebilirsin.

Demo sunucusunu durdurmak için `Ctrl+C` kullan. Sunucuyu yeniden başlattığında örnek hesaplar ve boş teslim listesiyle açılır. Tam çalışma adımları için [pilot protokolüne](../PILOT-PROTOCOL.md) bak.
