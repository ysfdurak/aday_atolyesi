# 0.13 ürün değerlendirmesi — 4 Kasım 2026

Bu değerlendirme uygulanan özelliklere ve kod kontrollerine dayanır. Puan, önceki 74/100 değerlendirmesiyle aynı ağırlıkları kullanan öznel ürün değerlendirmesidir; gerçek kullanıcı memnuniyeti veya ölçüm geçerliliği sonucu değildir.

| Alan | Önce | Şimdi | Gerekçe |
|---|---:|---:|---|
| Aday için değer | 22/25 | 22/25 | Hazırlık alanları tek yerde; gerçek başvuru sonucuna katkı henüz sınanmadı. |
| İçerik derinliği | 17/20 | 18/20 | Analist, operasyon uzmanı ve ekip lideri için beklenti, çıktı ve mülakat sorularıyla üç bağlı yol eklendi. |
| Geri bildirim ve gelişim döngüsü | 11/20 | 15/20 | Gerçek yanıt/gerekçe bağlantısı, en fazla iki çalışma, alıntı doğrulamalı ilk/son ve yeni bağlam notu. |
| Kullanım kolaylığı | 15/20 | 16/20 | Tek gelişim raporu, taslak koruma, vaka seçimi, kaynak yanıta dönüş ve kendi dosya görüşlerini getirme. Yeni ekranın görsel kullanıcı testi yapılmadı. |
| Ticari hazırlık | 9/15 | 9/15 | Pilot protokolü hazır; gerçek kullanım, ödeme isteği ve değerlendirici iş yükü henüz ölçülmedi. |
| **Toplam** | **74/100** | **80/100** | Ürün içi gelişim döngüsü güçlendi; saha kanıtı henüz oluşmadı. |

## Yeni davranışlar

- Gelişim raporu güncel teslime bağlı insan görüşünü, güncel sürümdeki rol seçimlerini, gerçek/ipucusuz denemedeki yanıtları ve yazılmamış deneyim alanlarını kaynaklarıyla gösterir. Yeterli kayıt varsa en fazla iki çalışma önerir; farklı modül puanlarını toplamaz. Mizaç puanı öncelik hesabına girmez.
- Rol kartında adayın gerçekten seçtiği seçenek ve içerik bankasındaki gerekçe görünür. Eski içerik sürümü veya örnek sonuç kişisel değerlendirmeye katılmaz. Destekleyici seçim, gerçek işte kanıtlanmış beceri olarak sunulmaz.
- İlk ve son metin aynı vaka sürümündeki sabit teslimlere bağlıdır. Alıntı ilgili teslimde aynen bulunmalıdır. Değişiklik nedeni ve açık kalan kontrol adayın öz değerlendirmesidir; otomatik başarı/kalite artışı hesaplanmaz.
- Yeni bağlamda alıntılar iki somut teslime bağlanır. Kaynak teslim güncel olmalı, hedef teslim bağlantıdan sonra yapılmalıdır. Farklı vakaların puan farkından gelişim oranı üretilmez.
- Yeni revizyon eski savunmayı arşivler; yeni yanıt için savunma ve yeni bağlam bağlantısı yeniden gerekir. Önceki notların kaynak teslimleri korunur.
- Dosya görüşlerini getirme, yalnız oturum sahibinin teslimlerini okur; yönetici ve değerlendirici de bu uç noktada başkalarının kayıtlarını alamaz. Her vaka/sürümün son teslimi esas alınır; son dosyada görüş yoksa eski görüş güncel öncelik yapılmaz. Referans insan tarafından yazılmıştır; PDF/Office içeriği otomatik okunmaz veya alıntı doğrulaması yapılmaz. Bu karşılaştırmalar için Hesabım ve teslimler akışı kullanılır.
- Mülakat dosyasına gelişim notu eklemek isteğe bağlıdır. Yeni bağlam notu ancak hem kaynak hem hedef seçilmişse girer. Taslaklar, CV ve seçilmeyen kayıtlar eklenmez.

## Doğrulama ve sınırlar

`check-growth.cjs` kanonik 187 madde puan uyumunu, kaynak alıntılarını, örnek/ipucu/eski sürüm dışlamasını, iki öneri sınırını, değişmeyen ilk teslimi, eski savunmanın geçersizliğini, aktarım zaman sırasını, geçmiş bağlantıları, yedek doğrulamasını ve seçili içerik ihracını denetler. `check-cycle-integration.mjs` gerçek servis işleyicisini SQLite ve nesne deposu taklidiyle çalıştırır; dosya döngüsünü ve kendi görüşlerine erişim sınırını denetler. Diğer plan, içerik ve bütünleşme kontrolleri ayrıca çalıştırılır.

Bu turdaki yeni ekran tarayıcıda görsel olarak doğrulanmadı: önceki tarayıcı erişimi güvenlik politikasıyla engellendiği için yeniden veya alternatif yoldan denenmedi. İki gerçek hesapla canlı dosya/değerlendirici kabul testi ve aday pilotu hâlâ gerekli. Üç hazırlık yolu kalibre edilmiş mesleki norm değildir. Gerçek işe alım kararı, kişilik tanısı veya aday sıralaması üretilmez.

## Sonraki puan artışı için öncelik

Yeni modül sayısını artırmadan önce pilotta adayın geri bildirimden somut revizyona geçebildiğini, kaynağı doğru bulduğunu ve değerlendiricinin değişimi makul sürede inceleyebildiğini gözlemle. Ticari puanı yalnız gerçek kullanım ve açık ödeme tercihi kanıtıyla güncelle. Pilot yöntemi PILOT-PROTOCOL.md içindedir.
