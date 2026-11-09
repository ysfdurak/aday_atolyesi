# Maya Platform — Olay yönetimi

Özgün sentetik hazırlık vakası · 3.0.0 · Düzey 3 · Yaklaşık 80 dakika

Maya Platform’da 09.00’da bir ödeme durumu olayı açıldı. Teknik, satış, finans ve destek ekipleri ayrı kanallarda çalışıyor. İlk iki saat için olay koordinasyonunu üstlendin;10.00’da yönetim güncellemesi yapılacak.

## Aday görevi

Aşağıdaki şirket dosyası temelinde istenen çıktıları hazırlayıp teslim etmen bekleniyor. Kararın ve kullanılacak çalışma yaklaşımı sana ait.

## D01 / Şirket dosyası / Maya Platform

Maya Platform,çevrim içi sipariş altyapısı sağlayan 140 çalışanlı bir teknoloji işletmesidir. Ödeme sağlayıcısı dış hizmettir; sipariş durumu şirketin kendi sisteminde tutulur. Müşteri destek ekibinde 70 çalışan vardır, ancak farklı vardiya ve eğitim gruplarında çalışırlar. Olay başladığında 40 eğitimli temsilci aktif durumdadır.

Finans mutabakatı sipariş ve sağlayıcı hareketini eşleştirir. Satış müşteri yöneticileri üzerinden, destek ise talep sistemi üzerinden iletişim kurar. Büyük müşteriler için ayrı hesap yöneticisi bulunur; olay sırasında aynı kullanıcı birden fazla kanala yazabilir. Teknik olayın durumu ve müşteri talebinin kapanışı iki ayrı kayıttır. Sen koordinasyon rolündesin; teknik üretim erişimi ve toplu iade onayın yok. Yönetim ilk iki saatlik dosyayı ve 10.00 güncellemesini bekliyor.

## D02 / Organizasyon ve görev çerçevesi

Yürürlükteki görev dağılımından alınan kayıt. Tablodaki kişiler kurgusaldır. Vaka kapsamındaki görevin, ilgili karar toplantısının dosyasını ve önerisini hazırlamaktır. Nihai onaylar aşağıdaki yapı içinde verilir.

|Birim / kişi|Sorumluluk|Karar / onay alanı|
|---|---|---|
|Teknik olay sahibi / Aras|Sistem inceleme|Teknik müdahale|
|Finans / Ceren|Tahsilat eşleştirme|Finansal işlem onayı|
|Destek / Sibel|Müşteri talepleri|Eğitimli ekip atama|
|Koordinasyon / sen|Olay dosyası|Bilgi ve toplantı ritmi|

## D03 / 09.00 sipariş anlık görüntüsü

Üç ana sipariş durumu birbirini dışlar. Risk işareti bekleyen siparişlerden bazılarına eklenmiştir. Rapor 09.00 anlık görüntüsüdür; sonraki durum değişiklikleri ayrı olay günlüğüne yazılmaktadır.

|Durum|Sipariş adedi|
|---|---|
|İşlenmiş|1500|
|Bekleyen|350|
|Başarısız|150|
|Bekleyen içinde yinelenme riski işareti|60|

## D04 / Destek ekibi kapasitesi

Normal talep gelişi 120/saat, olay döneminde 240/saat. Kuyruk başlangıcı 200 taleptir. Mevcut eğitimli 40 temsilcinin planlama hızı kişi başına 4 talep/saattir. Toplam 70 çalışan bulunur. Bir saatte 10 eğitimli ek kişi sağlanabiliyor.

|Kaynak|Kişi|
|---|---|
|Şu an eğitimli aktif temsilci|40|
|Toplam çalışan; tamamı eğitimli değil|70|
|Bir saat içinde gelebilen eğitimli ek destek|10|

## D05 / İlk mesajlar

Teknik ekip yeniden deneme mekanizmasını inceliyor. Tahmini çözüm saati henüz onaylı değil. Finans, tahsilat kayıtlarını mutabakata alıyor. Teknik müdahale ve iade yetkisi ilgili ekiplerdedir. Koordinasyon rolünde olay günlüğü ve iletişim ritmi belirlenebilir.

## D06 / Önceki altı olay

Aşağıdaki kayıtlar bilgi dosyasının dönemsel ekidir. Ayrı bir tablo olduğu için başka belgelerdeki tutar veya adetlerin üzerine kendiliğinden eklenmez. Dönem ve kapsam sütunları kayıtların ait olduğu grubu gösterir.

|Olay|Teknik süre dk|Başlangıç kuyruğu|Müşteri takip bitişi saat|
|---|---|---|---|
|O 01|20|60|1|
|O 02|45|130|3|
|O 03|15|40|1|
|O 04|70|240|5|
|O 05|30|100|2|
|O 06|40|160|4|

## D07 / 09.00 durum mesajları

İlgili bölümün çalışma sisteminden alınmış kurgusal kayıtlar. Açıklama alanları kayıt sahibinin dönem içindeki notlarıdır; yönetim tarafından doğrulanmış neden sonuç değerlendirmesi değildir.

|Saat|Birim|Kayıt|Durum|
|---|---|---|---|
|08.52|İzleme|Ödeme durum gecikmesi|Olay açıldı|
|08.55|Destek|Benzer müşteri mesajları|İlk örnekler|
|08.57|Teknik|Sağlayıcı bağlantısı|İnceleniyor|
|08.58|Satış|Kurumsal hesap sorusu|Yanıt bekliyor|
|09.00|Finans|Tahsilat eşleşmesi|Başlatıldı|
|09.00|Destek|Kuyruk|200 talep|
|09.01|Teknik|Yeniden deneme|Karar bekliyor|
|09.02|Yönetim|İlk özet|10.00 talebi|

## D08 / İç yazışmalar / toplantı öncesi

Satış: “Müşteriler bizden süre istiyor. Bazı hesaplara 30 dakikada düzeleceğini söyleyen temsilci olmuş olabilir; ortak mesaj henüz paylaşılmadı.”

Teknik: “Olayı incelemeye aldık. Sağlayıcının yanıtını bekliyoruz. Yeniden deneme mekanizmasının durumunu kontrol etmeden toplu işlem başlatmayacağız.”

Finans: “Başarısız görünen siparişler için sağlayıcıdaki tahsilat durumunu ayrıca eşleştiriyoruz. Kesin sonuç dosyası ilk anda hazır değil.”

Destek: “On eğitimli kişi bir saat içinde gelebilir. Diğer çalışanların bir kısmı bu işlem grubunda çalışmıyor. Aynı sipariş için açılan birden fazla talep var.”

## D09 / İşleyiş ve toplantı kayıtları

Ana kuyruk sayısı talepleri gösterir, tekil müşteri sayısını değil. Talep/sipariş eşleştirmesi olay sırasında sürmektedir. Planlama hızları müşteri işlerinin aynı karmaşıklıkta olduğu varsayımıyla verilmiştir. Yönetim sunumu teknik durum, müşteri durumu ve finans mutabakatı için ayrı sorumlulardan bilgi alacaktır.

## Beklenen çıktılar

1. İlk iki saat için olay yönetimi çizelgesi. Mevcut durum, önerilen hedef/beklenti ve seçiminizin gerekçesi bu çıktıda yer almalıdır.
2. Yönetim ve müşteri için ayrı iletişim taslakları.
3. Operasyon çalışma tabloları ve hesap eki.
4. Olayın devri ve kapanışında kullanılacak kayıt taslağı.

Açık uçlu yanıtların otomatik yetkinlik puanlaması yoktur. Vaka hazırlık içindir; gerçek değerlendirme merkezi eşdeğerliği veya işe alınma garantisi sunmaz. Referans çözüm, ilk çözüm tesliminden sonra uygulamada açılır.
