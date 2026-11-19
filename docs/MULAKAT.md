# Mülakatta sorulabilecek sorular · Aday Atölyesi

Bu kart, projeyi kendi ağzınla anlatabilmen için. Cevaplar kısa tutuldu; ayrıntısı belirtilen belgede. Kod yapay zekâ (Claude) ile yazıldı; kapsam, öncelik ve aşağıdaki kararlar senin. Bunu saklama, açıkça söyle: "Ürünü ve kararları ben belirledim, kodu yapay zekâyla yazdım, her kararın nedenini anlatabilirim."

**1. Bu proje ne yapıyor, kimin için?**
İş adaylarının hedef pozisyona göre sınav, vaka ve mülakata hazırlandığı; İK'nın vaka teslimlerini ölçütle değerlendirdiği bir çalışma alanı. Aday kendi çalışmasını düzenler, değerlendirici atanmış teslimi ölçüt ve dayanak üzerinden inceler.

**2. Hangi sorunu çözüyor?**
Adayların hazırlığı dağınık, geri bildirim ya hiç yok ya da 'iyi/kötü' düzeyinde. İK tarafında vaka teslimleri e-postayla dolaşıyor, değerlendirme kişiden kişiye değişiyor.

**3. Değerlendirmeyi nasıl tutarlı hale getirdin?**
Yapılandırılmış değerlendirme: her ölçüt için 0–3 seviye ve seviye tanımları, her ölçütte zayıf/yeterli/güçlü örnek cevap, iki değerlendiricinin aynı sentetik teslimi puanladığı kalibrasyon ekranı ve kör değerlendirme. Puanlar tek bir sayıya toplanmaz.

**4. Neden tek puan vermiyorsun?**
Tek puan, adayın neyi geliştireceğini söylemez ve yanlış kesinlik hissi verir. Ölçüt bazında seviye ve dayanak daha savunulabilir.

**5. Yapay zekâ kullanıyor mu?**
Hayır. Aday metni bir modele gönderilmez, kullanıcı başına maliyet yoktur. Değerlendirmeyi insan yapar.

**6. Teknik yapı?**
Cloudflare Workers üzerinde çalışır; hesap ve teslim verisi D1 (SQLite) ve R2 (dosya) üzerinde. Hazırlık kayıtları önce tarayıcıda tutulur, istenirse hesaba kaydedilir.

**7. Canlı demo nasıl güvenli?**
Her ziyaretçinin kendi alanı var: aday, değerlendirici ve yönetici rolleri tarayıcıya ait rastgele bir kimlikle ayrışıyor; yönetici de başka alanı göremiyor. Kendi dosyan yüklenmiyor, yalnız hazır kurgusal örnek dosya teslim ediliyor. Her gece her şey siliniyor.

**8. Kötüye kullanımı nasıl sınırladın?**
Günde en fazla 1.500, aynı IP'den saatte en fazla 20 yeni demo alanı açılabiliyor. Her alan veritabanına yaklaşık 25 yazma demek; sınır olmasa bir betik günlük kotayı tüketebilirdi.

**9. Gerçek bir işe alımda kullanılır mı?**
Pilot için tasarlandı, ama tek karar aracı olmamalı. Ölçüt örnek cevapları hâlâ uzman incelemesi bekleyen taslak; gerçek kullanımda gruplar arası ayrımcılık izlenmeli ve aday verisinin saklama süresi belirlenmeli.

**10. Neyi farklı yapardın?**
Değerlendirici ve yönetici hesaplarını baştan alan bazlı tasarlardım. İlk sürümde ortak demo hesapları vardı ve yüklenen gerçek bir dosyayı başka ziyaretçi görebiliyordu; bunu sonradan düzelttim.


## Bu projede verdiğim kararlar (sorun → karar → bedel)

- **Ortak demo hesapları:** Ziyaretçi gerçek özgeçmiş yüklerse başkası görebiliyordu → her ziyaretçiye ayrı alan ve yalnız örnek dosya → demoda kendi dosyanla deneme özelliği kalktı.
- **Eski çerezler:** Eski aday kimlikleri ortak ekranlarda görünmüştü → yeni alanın anahtarı olarak kabul edilmiyor → eski ziyaretçiler bir kez yeniden rol seçiyor.
- **Kalibrasyon:** Değerlendiriciler arası fark görünmüyordu → aynı sentetik teslimi iki kişinin puanladığı ekran → ek ekran ve bakım.

---
Son güncelleme: 19 Kasım 2026.
