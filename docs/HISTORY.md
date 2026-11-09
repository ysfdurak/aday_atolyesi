# Aday Atölyesi 0.15.1

Adayın sınav pratiğini, çalışma tercihlerini, pozisyon kararlarını, şirket vakalarını ve deneyimlerini tek hazırlık alanında toplar. Ana geliştirme kökü bu projedir; üç özgün bağımsız Site değiştirilmez. Birleşik işe uygunluk puanı veya aday sıralaması üretilmez.

## 0.15.1 kayıt kontrolü düzeltmesi

Rol seçimi geçmişi uygulama tarafından dizi olarak yazılırken kurtarma kontrolü yalnız nesne biçimini kabul ediyordu. Geçerli geçmiş artık anahtara özgü biçimle kabul edilir; hiçbir kayıt silinmez veya dönüştürülmez. Gerçek okuma hatasında hangi kayıt türünün ve hangi biçim kontrolünün takıldığı gösterilir. `node check-recovery.cjs` gerçek rol geçmişi yazıcısından çıkan kaydı kullanarak gerilemeyi denetler; depolama üzerinde sıfır değişiklik yapıldığını ve bozuk kayıt korumasının sürdüğünü doğrular.

## 0.15 pilot öncesi kabul kapsamı

20 pozisyon için bağlı hazırlık yolları ve kıdem odağı; 24 rol yetkinliğinde seçime bağlı gerekçe/karşı koşul; altı alanda hata defteri; mizaç boyutlarında örnek/ters örnek/deney gözlemi. Mevcut soru anahtarları ve tercih puanları korunur.

`#file-work/<teslim-id>`: ilk/son dosya, teslim zincirindeki görüşler, çıktı bazında karşılaştırma ve görüşme özeti. Özet hesabına kaydedilir; aday açıkça bu cihaza aktarır ve dosyada seçerse provada kullanılır. PDF/Office otomatik okunmaz. Revizyona atanmış değerlendirici yalnız aynı zincirdeki önceki dosyalara da erişebilir; rol/atama geri alınınca yetki kapanır. `pilot_file_work` için eklemeli Drizzle migration vardır.

Dört seçimlik `#start`, teslim araması ve görüş filtresi, sekmede korunan taslaklar ve okunamayan cihaz kaydına kurtarma ekranı eklendi. 29 otomatik kontrol grubu geçti; görsel tarayıcı ve iki gerçek hesaplı canlı kabul henüz tamamlanmadı. Ayrıntılı tamamlanan/açık kabul listesi: [PREPILOT-ACCEPTANCE.md](PREPILOT-ACCEPTANCE.md).

## 0.14 görüşmeye geçiş

`#rehearsal` yalnız mülakat dosyasına seçilen deneyim ve teslim edilmiş metin vakalarından soru/takip sorusu üretir. Cevap ve öz kontrol taslakları korunur; aynı kaynağa bağlı en fazla beş değişmeyen deneme saklanır. Kaynak değişirse eski prova yeni kayda taşınmaz. Dosyada açık dayanak soruları gösterilir; günlük planda bütçe içinde prova önerilir. Ses kaydı veya otomatik değerlendirme yoktur.

Pilot deneyim formu, isteğe bağlı görev durumu, tahmini süre, cihaz, hazırlık yolu ve sonraki kullanım tercihi toplar. Yönetici özeti yalnız yetkili hesaba açıktır. Eski geri bildirimler uyumludur. `node check-rehearsal.cjs` ve `node check-cycle-integration.mjs` yeni sözleşmeleri doğrular. Öznel ürün puanı **82/100**; gerçek aday, iki hesap ve görsel doğrulama sınırlamaları sürer. Ayrıntılar: [RELEASE-0.14.md](RELEASE-0.14.md).

## 0.13 gelişim döngüsü

`#growth` alanı güncel cevap ve insan görüşünden en fazla iki çalışma önerir. Kısa çalışma notları, aynı vaka sürümündeki ilk/son teslim alıntıları ve yeni bağlamdaki somut dayanaklar taslak olarak korunur. Analist, operasyon uzmanı ve ekip lideri için üç bağlı yol vardır. PDF/Word/Excel görüşleri adayın isteğiyle, yalnız kendi son teslimlerinden getirilir; dosya metni otomatik okunmaz. Yeni revizyon önceki savunmayı güncel saymaz. Mülakat dosyasına gelişim notları adayın seçimiyle eklenir.

`node check-growth.cjs` kaynak/alıntı/sürüm bütünlüğünü; `node check-cycle-integration.mjs` dosya akışını ve kendi geri bildirimine erişim sınırını kontrol eder. Yeniden değerlendirme: **80/100**, öznel ürün incelemesi; gerçek aday pilotu henüz yapılmadı. Ayrıntılar: [GROWTH-REVIEW.md](GROWTH-REVIEW.md), sonraki çalışma: [PILOT-PROTOCOL.md](PILOT-PROTOCOL.md).

## Güncel kapsam

- 20 hedef pozisyon; ortak pozisyon/kıdem bağlamı. Rol Atölyesi: 24 yetkinlik, 187 durum; içerik 0.4.1. Seçenekler uzunluk/dil açısından düzenlendi, paket içinde harf dağılımı dengelendi. Eski yanıtlar özgün metinleriyle arşivlenir.
- Zihin Parkuru: altı alan, sabit 36 soruluk/40 dakikalık genel deneme ve pozisyona odaklı çalışma. Çalışma önerileri kendi kayıtlarına dayanır; kalibre edilmiş meslek normu değildir.
- Mizaç: 96 ifade, 6 senaryo, aday özeti ve ayrıntılı rapor. Pozisyon/koşul notları, tercih puanlarından ayrı tutulur.
- 20 derin kurgusal şirket vakası; 187 belge, 92 veri tablosu; Word/Excel paketleri. Taslak, sürümlü teslim, öz inceleme, insan geri bildirimi, alıştırma, revizyon, karar savunması ve yeni bağlam akışı.
- Deneyim arşivi: kaynak türü, durum/görev, kendi katkısı, sonuç, dayanak, alternatif, öğrenme ve risk/dış koşul. Taslak kaydı, düzenleme ve arama. Eski kayıtlar korunur; eksik alanlar takip sorusuyla gösterilir.
- Mülakat dosyası: adayın seçtiği deneyimler ve bu cihazdaki teslim edilmiş metin vakaları; isteğe bağlı atölye kapsam özeti. JSON ve tarayıcıdan yazdırma/PDF. CV, ilan, taslak ve seçilmeyen kayıtlar dışarıda kalır. Kurgusal çalışma gerçek iş deneyimi olarak etiketlenmez. Yalnız güncel teslime bağlı insan görüşü gösterilir.
- Ana sayfada tek sonraki adım, çalışma kapsam kartları, dosya ve hesap kaydına erişim. Mobil menü, dört bağlantılı alt gezinme, klavye odağı ve azaltılmış hareket desteği.
- Başlangıçta hafif vaka kataloğu; tüm belgeler/arşiv yalnız vaka veya teslim alanı açılırken yüklenir. Ağ hatasında yeniden deneme ve geç tamamlanan isteğin yeni sayfayı ezmesini önleyen kontrol vardır.
- ChatGPT girişli davetli pilot; D1 kullanıcı/teslim/kayıt verisi, özel R2 dosyaları. PDF/DOCX/XLSX dosya başına 10 MB. Hazırlık kaydı açıkça hesabına kaydedilip başka cihazda yüklenebilir; otomatik eşitleme değildir. Merkezi hazırlık kaydında CV metni tutulmaz.
- CV alanında metin düzenleme, seçilmiş ilan gereksinimleriyle kelime eşleştirme, TXT/yazdırma. Bu geliştirme CV kapsamını genişletmez.

## Geliştirme

Vinext / Cloudflare Worker. Düzenlenebilir ön yüz web/ altındadır. `node scripts/prepare-workspace.mjs` içerik sözleşmelerini ve hafif kataloğu üretir, web/ dosyalarını ignored public/ içine kopyalar; index.html workspace.html olur. Framework derlemesi package.json build üzerinden çalışır. .openai/hosting.json Site kimliği, DB ve BUCKET bağlarını korur.

İlgili kontroller:

- `node check-candidate-experience.cjs`: seçili içerik, geri bildirim sürümü, gizli/özel alanların dışarıda kalması, eski/yeni yedekler, tam/hafif katalog plan eşdeğerliği, filtreler.
- `node check-workspace-loading.cjs`: bağımlılık yükleme, ortak istek, hata/yeniden deneme ve gezinme yarışı; durum yenilemesi formları ezmez.
- `node checks.cjs`, `node check-preparation.cjs`, `node check-modules-integration.cjs`: ortak plan ve kayıtlar.
- `node check-learning.cjs`, `node check-cases.cjs`, `node check-dossier-integrity.cjs`, `node check-cycle-integration.mjs`: vaka ve dosya akışları.
- `node check-role-editorial.cjs`, `node check-positions.cjs`, `node check-position-modules.cjs`: içerik dengesi ve modüller.

## Doğrulama ve kalan işler

İçerik, pilot ve UX ayrıntıları MODULE-AUDIT.md, ROLE-OPTION-REVIEW.md ve CANDIDATE-UX-REVIEW.md içindedir. Uzman içerik incelemesi ve gerçek aday pilotu/psikometrik kalibrasyon tamamlanmış sayılmaz. İki gerçek hesabın üretimde dosya teslimi, incelemesi ve farklı cihazdan yüklemesi ayrıca kabul testidir. Davet, paylaşım, domain ve ödeme kapsamı bu değişiklikte genişletilmez.

## Geçmiş sürüm notları

Aşağıdaki kayıtlar tarihsel geliştirme kapsamıdır. Güncel özellik durumu için yukarıdaki özet esas alınır.

## Assessment Atölyesi — 0.2

12 özgün vaka; temel/orta/ileri düzeyde dörder vaka,35 belge,15 CSV tablo,33 sayısal kontrol,60 inceleme ölçütü. Türler: veri analizi, karar/sunum, önceliklendirme, yönetim görüşmesi. Roller: analist, operasyon, ekip liderliği, yeni mezun ve fonksiyonel roller. Zorluk etiketleri tasarım amaçlıdır; ölçülmüş eşdeğerlik yoktur.

- İçerik kaynağı build-cases.py; python3 build-cases.py ile case-data.js,12 aday Markdown paketi,15 UTF-8 BOM/noktalı virgül CSV ve bütün aday dosyaları ZIP üretilir. Cevaplar ZIP/aday paketinde yoktur; uygulama kaynaklarında öğrenme amacıyla yer alır. Güvenli seçme sınavı değildir.
- Her vakada görev yetkisi, veri tanımları,4–5 açık uçlu teslim,0–4 sayısal kontrol,4–6 ölçüt, bir yeni bilgi kartı, alternatif çözüm dayanakları, sık hatalar ve iki savunma sorusu vardır. Tek bir açık uçlu doğru yanıt dayatılmaz.
- İlk çözüm tesliminden sonra referans inceleme açılır. Sayısal uyum yalnız hesap kontrolüdür;0–3 öz inceleme kullanıcıya aittir, toplam aday/işe uygunluk puanına çevrilmez.
- Taslak her değişiklikte kaydedilir; son teslim yanıtları ayrı kopyalanır. Sonraki taslak değişiklikleri son teslim hesabını değiştirmez. Yeni bilgi kartı ilk yaklaşım yazılınca açılır; kart yanıtı isteğe bağlıdır.
- assessments kayıtları ana aa-state-v1 içinde bulunur; bütün kayıtları yedekleme/geri yükleme/silme akışına dahildir. Bilinmeyen vaka kimliği/sürümü ve geçersiz teslim/öz inceleme yedekleri reddedilir.
- Vaka listesinde rol/düzey/tür filtresi; çalışma sonuçlarında teslim/taslak sayısı vardır. Sonuçlar yalnız çalışma durumudur; kişilik ve sınav sonuçlarıyla toplanmaz.

Doğrulama: check-cases.cjs bağımsız olarak bütün33 sayısal anahtarı, ek bilgi hesaplarını, stok/kapasite ayrımlarını, dosya bütünlüğünü, boş/yanlış/yerel ondalık girişlerini, teslim kopyasını, yedek sürümünü, çözüm gösterim kapısını ve HTML kaçışını kontrol eder. Tarayıcıda filtre, görev kaydı, yeni bilgi,3/3 sayısal kontrol, öz inceleme ve yenilemede korunma doğrulandı. Baskı stilleri eklendi; dışa aktarılan PDF’nin sayfa düzeni ayrıca doğrulanmadı.

## Strateji ve toparlanma serisi — 0.3

Havuz20 vakaya çıktı:59 belge,24 CSV tablo,62 sayısal referans ve104 inceleme ölçütü. Temel4, orta8 ve ileri8 vaka. Mevcut12 vakanın kimlik ve içerik sürümleri korunur; eski çözümler geçerlidir. Sayımlar arayüzde katalogdan türetilir.

Yeni8 vaka case-expansion.py içinde tutulur ve build-cases.py ile üretilir. Stratejik karar filtresiyle seçilebilir; yeni seri listede önce gelir.

- Yeni şube lokasyonu: üç aday, dönüşüm/sepet/marj, eski şubeden satış aktarımı, rezerv/izin riski ve dönüşüm duyarlılığı.
- Pazara giriş modeli: kendi şubesi, bayilik, çevrim içi pilot; faaliyet ve başlangıç nakdi, rezerv, kontrol ve çıkış esnekliği.
- Dört haftalık nakit toparlanması: hafta sonu bakiyesi, erken tahsilat, ödeme erteleme, onaylı kaynak sınırı ve gecikme senaryosu.
- Zarar portföyü: katkı, kaçınılabilir gider, dağıtılmış merkez gideri, çapraz satış, kapanış/fiyat alternatifi.
-90 günlük toparlanma: sınırlı kişi-hafta/nakit altında fiyat, tedarik, stok, kalite, sistem ve pilot aksiyonlarını sıralama.
- Kapasite büyütme: kendi yatırım, iş ortağı ve süreli karma model; talep azalması ve kalite riski.
- Müşteri toparlanması: net büyüme ile kohort kaybı, tüm müşterilere indirim maliyeti, hedefli çalışma ve katkı farkı.
- Büyük müşteri kararı: yüksek sonuç/uzun tahsilat vadesi ile küçük müşteri portföyünü karşılaştırma; rezervli fonlama ve peşinat duyarlılığı.

Her vakada karar sahibi/varsayım/kısıtlar,5 görev,3–4 sayısal kontrol,5–6 ölçüt ve yeni bilgi kartı vardır. Matematik dışında tek bir zorunlu iş kararı dayatılmaz. Gerekçeli erteleme/pilot da kabul edilebilir; öz inceleme uzman puanı değildir.

check-cases.cjs bütün62 anahtarı bağımsız hesaplar; yeni seri için ayrıca haftalık nakit bakiyeleri, şube sıralamasının değişmesi, eylem kapasitesi, indirim kapsamı ve peşinat açığı denetlenir.

## Şirket dosyaları ve yönlendirmesiz aday akışı — 0.4 / içerik2.0.0

20 vaka şirket dosyası olarak yeniden yazıldı:187 belge,92 tablo,456 veri satırı. Dosya başına8–12 belge; şirket/iş modeli, organizasyon ve yetki, mevcut durum, dönem geçmişi, işlem/sözleşme/saha kayıtları, iç yazışmalar ve işleyiş bilgisi bulunur. Sayısal referanslar62 ve değerlendirme ölçütleri104 olarak teslim sonrası materyalde korunur.

- case-briefs-v2.py: tarafsız olay anlatımı, gerekli veri tanımları, yalnız beklenen çıktı adları ve nötr başlıklar.
- deep-dossiers.py: her şirkete özgü geçmiş ve operasyon kayıtları, organizasyon, paydaş yazışmaları; şube/kriz dosyalarında ek saha, kira, yatırım, stok ve sözleşme tabloları. Bütün veriler sentetiktir.
- Şube paketi12 belge/38 satır; kira hükmü, yatırım alt kalemi, mevcut mağaza geçmişi,120 yanıtlı müşteri araştırması ve saha sayımı içerir. Denge Teknik10 belge/30 satır; alacak ve ödeme alt kayıtları ana haftalık plana bağlanır.
- Adayın ilk ekranında puanlama ölçütü, hesap sorusu, sayısal cevap alanı, örnek yöntem, ipucu veya ek bilgi kartı yoktur. Çıktılar karar notu, çalışma/hesap eki, sunum içeriği, uygulama çizelgesi veya iletişim taslağı biçiminde istenir. Yöntem adaya bırakılır.
- Referans hesap, alternatif çözüm ve öz inceleme yalnız teslim sonrasında açılır. Açık uçlu metinler otomatik puanlanmaz; sayısal alanı olmayan aday çalışmasına0/62 veya benzeri puan verilmez.
- Markdown/CSV ve ZIP paketleri yeniden üretildi. Aday paketlerine değerlendirme ölçütleri eklenmez.
- doc.code alanı D01… sırasını izler. Tüm belgeleri aç/kapat düğmesi okuma için vardır.

### Eski çalışmalar

Önceki20 vakanın1.0.0 sürümü case-archive-v1.js içinde korunur.1.0.0 kayıtları yerinde bırakılır; arşiv ekranı özgün belgeleri ve yanıtları salt okunur gösterir. Yeni2.0.0 kayıtları caseId@2.0.0 anahtarıyla tutulur. Ana yedekleme hem eski hem yeni sürümleri içerir; geri yükleme her kaydı kendi içerik sürümüyle doğrular. Eski sürüm linkleri yeni dosya indirmelerine yönlendirilmez. Güncel teslim sayısı ve arşiv sayısı ayrı gösterilir.

### Kontrol

check-cases.cjs:62 bağımsız hesap, aday materyalinde referans/ölçüt gizliliği, tarafsız çıktı akışı, eski/yeni kayıt ve yedek uyumu. check-dossier-integrity.cjs: dosya uzunluğu/kodları, tahsilat/ödeme/sermaye/kapasite alt toplamları, müşteri kohort zinciri, bölgesel/kontrat tutarları ve sevk miktarlarının tutarlılığı. checks.cjs ortak planı doğrular. Bu sürümde tarayıcı kontrolü altyapı zaman aşımı nedeniyle tamamlanmadı; görsel ve gerçek cihaz doğrulaması yapılmış kabul edilmez.

## Pilot gelişim döngüsü — 0.5

Şube lokasyonu, dört haftalık nakit toparlanma ve bire bir görüşme vakaları 3.0.0 sürümüne yükseltildi. Yalnız ilk çıktı açıklaması mevcut durum/hedef durum/beklenti ve gerekçeli kararı belirginleştirir; aday yöntem, ölçüt veya çözümle yönlendirilmez. Üç vakanın 2.0.0 dosyaları önceki arşive eklendi; mevcut 1.0.0/2.0.0 kayıtlar yeni görevlere taşınmaz. Diğer 17 vaka bağımsız 2.0.0 çalışması olarak devam eder.

- pilot-learning.py: 15 belge bağlantılı derin referans bölümü, alternatif savunulabilir kararlar, altı odaklı alıştırma, ölçüte bağlı alıştırma eşleştirmeleri. Derin inceleme ve alıştırmalar ilk teslimden sonra görünür. Her referanstaki kaynak kodu aday dosyasına bağlıdır.
- learning-engine.js: en çok 50 ayrı teslim, revizyon gerekçesi, ilk/son karşılaştırma, teslime bağlı insan değerlendirmesi, eski teslim formatıyla uyum. Aynı metin tekrar teslim edilemez. Geri bildirim eski teslimde kalır; yeni revizyona aitmiş gibi gösterilmez.
- learning-ui.js: öz inceleme, insan incelemesi ve referanslar açıkça ayrılır. Aday yalnız tek teslim için JSON değerlendirme isteği indirir. Değerlendirici #cases/reviewer alanında kaynağı ve yanıtı inceler, her ölçüte düzey (0–3), bire bir alıntı, gözlem ve sonraki adım girip JSON indirir. Aday bunu kendi ekranına yükler. Dosyalar otomatik gönderilmez; kimlik/uzmanlık doğrulanmaz. Değerlendirici formu geçicidir, otomatik kayıt yoktur.
- Yanlış vaka/sürüm/teslim, tekrarlı geri bildirim ve teslimde aynen bulunmayan alıntılar reddedilir. Dayanak yokken 0 seçilmesi gerekir; otomatik anlamsal değerlendirme yapılmaz. Bu eşleştirme kimlik doğrulama veya dijital imza değildir.
- Alıştırma yanıtı yazılınca referansı açılır. Revizyon sonrasında yeni bağlama geçiş bağlantısı kurulur: şube→yeni şehir, nakit→90 gün, görüşme→ekip yükü. Başlangıç bağlantısından sonraki teslimler izlenir; bu vakalar kalibre edilmiş eşdeğer form değildir. Değişen bilgiye karar savunması yazılı not olarak saklanır; ses kaydı veya sözlü değerlendirme henüz yoktur.
- Gelişim kayıtları ve insan geri bildirimleri ortak yerel yedeğe dahildir. Sunucuya kayıt/cihaz eşitleme, harici AI çağrısı, otomatik yetkinlik puanı ve pilot katılımcı daveti eklenmedi.

Kontroller: check-learning.cjs geçmiş korunması, revizyon şartları, dosya eşleşmesi, hatalı alıntı/sürüm/tekrar reddi, yedekleme, teslim öncesi referans gizliliği, v2 arşiv, yeni referans hesapları ve geçerli alıştırma bağlantılarını denetler. Mevcut üç regresyon dosyası da geçer. Yerel tarayıcıda şube için ilk teslim→istek indirme→değerlendirici formu→geri bildirim indirme/yükleme→revizyon akışı sentetik QA metinleriyle sınandı. Bu kontrol içerik geçerliği, değerlendirenler arası tutarlılık veya gerçek aday gelişimi kanıtı değildir. Pilot henüz başlatılmadı; mevcut erişim korunur.


## Tüm vakalarda gelişim yolu ve ortak plan — 0.6

Kalan 17 vaka 3.0.0 sürümüne yükseltildi. 20 güncel dosyanın tamamında beş derin referans bölümü (100 bölüm), ikişer alıştırma (40 çalışma), öz inceleme, teslime bağlı insan değerlendirmesi, gerekçeli revizyon, karar savunma notu ve başka bir vakaya geçiş bulunur. learning-expansion.py her vakaya özgü mevcut durum, ek veri sınırlamaları, alternatif karar ve uygulama notlarını üretir; referans hesapları özgün sayısal anahtarlara bağlar. Örneğin Denge Teknik nakdi, Dora kârlılığı ve Pera yatırımı farklı analiz ufuklarıdır; tek bir başarı puanı üretilmez.

Önceki 20 adet 2.0.0 dosya ve 20 adet 1.0.0 dosya arşivde saklıdır. Yeni görev açıklamaları eski yanıtlarla birleştirilmez. Önceki üç 3.0.0 pilot çalışması aynı kimlikte devam eder. Arşiv dosyası geçmişteki adıyla case-archive-v1.js olarak korunmuştur; içeriği hem v1 hem v2 içerir.

preparation-plan.js hedef rolünden başlangıç vakası önerir; mevcut uygun taslak/teslimi önce devam ettirir. Gerçek çalışma kayıtları taslak→inceleme→alıştırma→revizyon→yazılı savunma→yeni bağlam sırasını belirler. Öz inceleme insan değerlendirmesi yerine gösterilmez; insan incelemesi beklerken aday kendi çalışmasını sürdürebilir. Vaka adımı 15–20 dakikalık çalışma bloğu olarak günlük bütçeye sığdırılır; 60–85 dakikalık tam vaka bitmiş sayılmaz. Manuel günlük kutucuklar aşama ilerletmez. CV görevleri bu hazırlık rotasına dahil edilmez; mevcut CV ekranı korunur.

Son üç güne girildiğinde 45 dakika ve üzeri günlük bütçede, son gerçek denemesi yakın olmayan adaya 40 dakikalık prova önerilir. Deneme sonrası alan odağı son gerçek ve yeterli yanıtlı rapordan; Mizaç çalışması öz bildirimden; liderlik modülü ortak insan yönetimi senaryolarından gelir. Kişilik boyutları beceri puanı veya vaka seçme anahtarı olarak kullanılmaz. Rol ve kıdem için teknik senaryo kapsamı hâlâ ayrı geliştirme konusudur.

Vaka yol kartı başlanan, teslim edilen, insan incelemesi bulunan ve revize edilen dosya sayılarını gösterir. Günlük bütçeye girmeyen vaka adımına buradan erişilebilir. Yedi günlük görünüm mevcut kayıtların aynı kaldığı varsayımıyla öneridir, gelecekteki gelişimi tahmin etmez. Yeni bağlam vakaları normlanmış eşdeğer test değildir. Tüm çalışma verileri cihazda ve ortak yedekte tutulur; hesap/cihaz eşitleme veya otomatik dış gönderim eklenmedi.

check-learning.cjs artık 20 akışı kapsar. check-preparation.cjs beş rol × beş süre kombinasyonunu, gerçek aşama geçişlerini, manuel işaret izolasyonunu, bağlantı öncesi teslimlerin yeni bağlam sayılmamasını, devam eden taslağı, hedef tarihine göre deneme önerisini ve yeni alıştırma hesaplarını doğrular. checks.cjs, check-cases.cjs ve check-dossier-integrity.cjs regresyonları korunur. Otomatik kontroller içerik geçerliği veya gerçek aday gelişimi kanıtı değildir. Ücretsiz pilot henüz başlatılmadı, erişim değiştirilmedi.

## Düzenlenebilir Word ve Excel paketleri — 0.7

20 vakanın her biri için tek Word çalışma dosyası ve tek Excel çalışma kitabı eklendi. dist/cases/office içindeki 40 dosya ve genişletilmiş toplu ZIP, vaka ekranlarından indirilebilir. İçerik/görev sürümü 3.0.0 olarak korunur; yalnız dosya biçimi eklenir. Mevcut çalışmalar yeni sürüme taşınmaz veya değiştirilmez.

- Word: vaka kodu/sürümü, olay ve görev, numaralı boş cevap alanları, tüm şirket belgeleri ve düzenlenebilir tablolar. Görsel tablo ekran görüntüsü kullanılmaz. Siyah başlıklar, tekrar eden tablo başlıkları, satır bölünmesini önleyen ayar ve büyüklüğe göre sütun genişliği bulunur.
- Excel: Yanıtlar, Vaka, Belgeler ve her kaynak tablo için D kodlu sayfa. 92 kaynak tablo özgün sayı/metin türleriyle yer alır; 187 belgenin açıklaması ve kapsamı Belgeler sayfasında korunur. Yanıt alanları boş ve düzenlenebilirdir; formül, hazır çözüm, referans sonuç veya rubrik eklenmez.
- Dosyalar adayın doğrudan üzerinde çalışabilmesi için kaynak ve cevap alanlarını aynı dosyada tutar. Numaralama o vakadaki gerçek çıktı sayısını izler; her vaka zorla beş çıktıya çevrilmez. Word/Excel üzerinde kaynakları değiştirmeden cevap alanları kullanılabilir.
- build-office-workbooks.mjs, sağlanan artifact-tool ile 20 XLSX üretir; çalıştırma primary runtime Node ile özel tmp dizininde yapılır. build-office-documents.py, primary runtime Python/python-docx ile 20 DOCX üretir ve paketli render_docx.py ile sayfa PNG/PDF kontrolünü hazırlar. Her iki builder outputs/office-packs/catalog.json girdisini kullanır; yalnız -calisma.docx/-calisma.xlsx sonuçları dist/cases/office dizinine alınır. outputs dizini sürüm kontrolü dışında tutulur.
- build-cases.py Word/Excel indirme yollarını katalogda ve dosyaları ZIP içinde tutar. Office dosyalarını yeniden üretmez; içerik değiştiğinde önce katalog, sonra iki Office builder, ardından dosyaları dist'e kopyalama ve son katalog/ZIP üretimi çalıştırılır.
- check-office-packs.py dışa aktarılan OOXML'i bağımsız okur: tüm kaynak satır/hücre değerleri, sayısal türler, açıklamalar, numaralı boş yanıtlar, makro/formül olmaması ve ZIP tamlığı doğrulanır.

Bu güncelleme indirilebilir çalışma dosyaları içindir. DOCX/XLSX/PDF yükleyerek özgün dosya teslimi, dosya biçimini otomatik reddetme, sunucuda dosya saklama veya değerlendiriciye otomatik gönderim eklenmedi. Mevcut uygulama içi metin teslimi ve JSON insan değerlendirme akışı aynen çalışır. Gelecek dosya tesliminde PDF tek seçenek olmayacak; DOCX ve XLSX için de ayrı yapısal kontroller gerekecektir.

Office dışa aktarımında saat olduğu açık sütunlardaki 09.45 gibi değerler yerel Excel saat değeri ve hh:mm biçimiyle yazılır; böylece 10.30 metninin 10.3 olarak görünmesi önlenir ve saatler hesaplamalarda kullanılabilir. Diğer metin/kimlik alanları metin olarak korunur. Word sayfaları render edildi; sayfa sınırları ve dışa aktarılan tüm tablo metinleri kontrol edildi. Yerel tarayıcıda Word/Excel bağlantıları görüldü; dosya indirme denemesi tarayıcı altyapısı zaman aşımı nedeniyle tamamlanmış sayılmaz. Yayınlama sonucu ve Office dosyalarının bağımsız yapısal kontrolleri ayrıca doğrulanır.

## Pilot hesap ve dosya altyapısı — 0.8

Mevcut Site kimliği ve sahibiyle sınırlı erişim korunarak statik yayından Vinext Worker yayınına geçildi. Kimlik Sites/ChatGPT girişinden gelir; harici e-posta/şifre hesabı, Supabase projesi veya alan adı satın alınmadı. D1 yapılandırılmış kayıtları, özel R2 deposu özgün aday dosyalarını tutar. Üretim kimliği yalnız platformun sağladığı başlıklardan alınır. Hizmet erişimi ziyaretçi kimliği oluşturmaz ve kullanıcı API'sine erişemez.

- Kaynak arayüz artık `web/` altındadır. `scripts/prepare-workspace.mjs` kaynakları `public/` altına kopyalar ve giriş dosyasını `workspace.html` olarak adlandırır. `/` bu sayfaya yönlendirir. Eski mutlak modül yolları korunur. `dist/` yalnız üretilen Worker/istemci çıktısıdır; sürüm kontrolü dışındadır.
- Vaka üreticisi ve bağımsız kontroller `web/` kaynaklarını kullanır. Office üreticilerinden gelen son dosyaları `web/cases/office/` altına alın; sonra `build-cases.py` çalıştırın. Derleme, yalnız aday çıktıları içeren `pilot-catalog.json` dosyasını günceller. Çözümler ve rubrikler bu API kataloğunda yoktur.
- `Hesabım ve teslimler`: aday açıkça seçtiğinde hazırlık kaydı sunucuda saklanır. Otomatik eşitleme yoktur. Sürüm kontrolü başka cihazın yeni kaydının üzerine yazmayı engeller. CV metni sunucuya gönderilmez; hesap kaydı yüklenirken bu cihazdaki CV korunur. Kullanıcı geçişinde cihaz kayıtları otomatik olarak hesaba yüklenmez veya indirilmez.
- Tek özgün PDF/DOCX/XLSX dosyası, en fazla 10 MB. Sunucuda boyut, uzantı/içerik imzası, Office merkezi dizini ve ana XML, şifre/makro/gömülü çalıştırılabilir bileşen kontrolleri yapılır. PDF denetimi temel imza ve şifre/etkin içerik belirteçleri düzeyindedir; tam PDF ayrıştırma, virüs tarama veya içerik uygunluğu garantisi değildir. Aday numaralı çıktı düzenini onaylar; içerik ve numaralı bölümler insan tarafından incelenir. Dosya sayısı 25, toplam depolama 100 MB/aday pilot kotasıdır.
- Dosyalar yalnız sahibi, yönetici ve yetkisi süren atanmış değerlendirici tarafından indirilebilir. Yönetici Site'nin mevcut sahibi olan doğrulanmış e-posta hesabıdır. Site erişim politikasını değiştirmek uygulama içi rol atamasından ayrıdır. İlk ziyaretinde aday olarak kaydedilen kullanıcı yönetici tarafından değerlendirici yapılabilir. Bu işlem kendi başına dışarıya site daveti göndermez.
- Değerlendirici her beklenen çıktı için gözlem, dosyada sayfa/hücre/bölüm ve kısa alıntı dayanağı, sonraki çalışma adımı ve genel değerlendirme verir. Geri bildirim tek teslim için sabitlenir; otomatik toplam/yetkinlik/işe uygunluk puanı yoktur. Dosyadan alıntının doğruluğu sunucu tarafından otomatik doğrulanmaz.
- Revizyon yeni dosya ve değişiklik notuyla önceki aynı kullanıcı/vaka/sürüm teslimine bağlanır. Eski dosya ve geri bildirim korunur. Hesap dosya akışı mevcut tarayıcıdaki metin teslim/JSON inceleme akışından ayrıdır; hazırlık planı aşamalarını henüz otomatik ilerletmez. Bu sınırlama ekranda açıkça belirtilir.
- Şema `db/schema.ts`, ilk göç `drizzle/0000_quick_sir_ram.sql`; yayın sırasında Sites göçleri uygular. Kaynakta, tarayıcıda veya depoda servis anahtarı yoktur. Yerel test kimlikleri yalnız bellek içi SQLite/mok R2 test ortamında kullanılır; üretim kimliği taklit edilmez.

Kontroller: `node check-pilot.mjs` gerçek SQLite şeması ve taklit R2 ile adaylar arası kayıt/dosya izolasyonu, değerlendirici ataması ve yetki iptali, kayıt sürümü çatışması, CV dışlama, 40 Office dosyasının kabulü, hatalı dosya reddi, sabit geri bildirim, revizyon sahipliği ve kota sınırlarını doğrular. Temel ürün/vaka/öğrenme/hazırlık planı/içerik kontrolleri korunur. Yerel tarayıcıda ana uygulama ve kimliksiz hesap ekranı doğrulandı; gerçek ChatGPT oturumu ile tam aday/değerlendirici akışı henüz uçtan uca denenmedi. Site dış adaylara açılmadı ve pilot daveti gönderilmedi.

Pilot açılmadan önce kalanlar: gerçek hesaplarla cihazlar arası kayıt ve aday–değerlendirici dosya döngüsünü doğrulama; dosya teslimlerinin hazırlık planı/öğrenme aşamalarıyla bağlanması; mobil teslim ve hata kurtarma denemeleri; pilot süresi/kapsamı ve geri bildirim kapasitesinin kesinleştirilmesi. Kendi alan adı ve bağımsız e-posta ile giriş, mevcut ChatGPT girişli davetli pilot sonrasında ayrıca değerlendirilecek dağıtım kararıdır.

## Pilot akışını birleştirme ve son kontroller — 0.9

Dosya teslimleri artık hazırlık planı ve vaka özetinde sunucudaki gerçek kayıtlarıyla yer alır. Tarayıcıdaki metin teslimi taklit edilmez. Dosyadan ilerleyen aday için ilk teslim → ilk dosyanın insan geri bildirimi → kısa alıştırma → gerekçeli dosya revizyonu → son revizyon üzerinde yeni bilgi savunması → yeni vaka bağlantısı → bağlantıdan sonra yeni bağlam teslimi aşamaları sunucuda korunur. Yeni bağlamı bağlantıdan önce çözmek döngüyü kapatmaz. Yeni bir bağımsız ilk teslim, önceki döngünün notlarını silmez. Tamamlanma bir kalite veya gelişim puanı değildir.

İki ek tablo için 0001 göçü, pilot deneyim formu için 0002 göçü eklendi. Uygulanmış göçler değiştirilmedi. Cihazlar arası öğrenme adımlarında da sürüm çatışması kontrolü var. Hesap kayıtları indirilebilir; hazırlık yedeği, özgün dosya metaverileri/geri bildirim ve döngü notları kendi kullanıcı kapsamıyla dışa aktarılır. Özgün dosyalar ayrıca tek tek indirilir; hesap dışa aktarımı cihaz yedeği olarak doğrudan içe aktarılmaz. CV metni merkezi hazırlık kaydından dışlanır.

Değerlendirici geri bildirimini kısmen doldurup hesabına taslak olarak kaydedebilir. Taslağı aday ve başka değerlendirici göremez. Yayımlanan görüş sabitlenir. Değerlendirici ekranı atanmış dosyaları önce gösterir; kendi hazırlık araçları kapalı bir ayrıntı alanındadır. Pilot deneyim formu kullanım kolaylığı, fayda, zorluk, yeniden kullanım isteği ve isteğe bağlı öneri toplar. Yönetici işlem sayılarını ve deneyim formlarını görür; bu sayılar etki veya psikometrik doğrulama iddiası değildir.

Mobil bağlantı yeniden denemelerinde aynı istemci teslim kodu kullanılır. Eşzamanlı aynı kodla iki istek gelmesi ilk dosyayı silmez veya üzerine yazmaz; geçici nesneler ayrı anahtarlardadır ve yalnız kaybeden isteğin nesnesi temizlenir. Pilot kota 100 dosya / 250 MB olarak genişletildi; böylece 20 vakanın revizyonları 25 dosya sınırına takılmaz. Dosya başına 10 MB korunur.

Yerel Worker testi, Node testlerinde görünmeyen bir Office açma sorununu ortaya çıkardı: Cloudflare zlib iç tamponu için beklenen XML boyutundan daha geniş ama sınırlı bir çıkış bütçesi gerekiyor. Çıkış boyutu hâlâ dizindeki beyanla birebir kontrol edilir; açılmış toplam ve tek girdi sınırları korunur. HTTP önizlemelerinde randomUUID yokken getRandomValues ile v4 kod üretimi eklenir. Mobil hesap başlığı taşması giderilir. Hata ekranında kimliksiz oturum ile geçici bağlantı sorunu ayrılır; tekrar deneme metinleri korunur.

Yeni kontroller:
- check-cycle-integration.mjs: dosya üzerinden tam döngü, referansların önce kapalı olması, taslak gizliliği, eski sürüm yazma reddi, revizyon/savunma ve transfer sırası, gerçek hazırlık planına bağlama, yeni bağımsız döngüde önceki notların korunması, hesap dışa aktarım kapsamı.
- check-worker-storage.mjs: Miniflare Worker içinde gerçek yerel D1/R2; 40 Word/Excel dosyası, özgün dosya baytlarının yükleme/indirmede aynı kalması, eşzamanlı mobil yeniden deneme, aday izolasyonu, değerlendirici yetki iptali, kayıt çatışması, taslak ve pilot deneyimi gizliliği, hesap dışa aktarımı. Test kimlikleri yalnız bu yalıtılmış yerel ortamda sağlanır; gerçek giriş doğrulaması yerine geçmez.
- check-pilot-client.cjs: eksik/yetersiz cihaz depolamasında geri alma ve HTTP bağlamında güvenli, farklı teslim kodları.
- Yerel tarayıcıda 390 px iframe ile aday alıştırması ve değerlendirici taslak kaydı sentetik API cevaplarıyla denendi. Aday ve değerlendirici gövdelerinde yatay taşma yoktu (375 px kullanılabilir genişlik = 375 px scrollWidth). Bu arayüz fixture'ları yalnız ignored public/outputs altında tutuldu; üretim derlemesi public'i yeniden oluşturup bunları dışlar.

Canlı gerçek iki hesapla ChatGPT giriş/davet akışı doğrulanmış sayılmaz. Site sahibi dışındaki hesaplara henüz erişim verilmedi; dış davet veya e-posta gönderilmedi. Özel alan adı, bağımsız e-posta/şifre kimliği ve ödeme bu sürümde açılmadı. Pilotun aday/değerlendirici kapasitesi ve dönüş takvimi insan operasyonu gerektirir. Sentetik çalışma araçlarının ölçüm geçerliği için gerçek pilot/uzman çalışması hâlâ gereklidir.

Transfer bağlantısı ayrıca o anda mevcut hedef teslim kodlarını kaydeder. Böylece aynı milisaniyeye denk gelen bir yeni teslim ile bağlantıdan önceki teslim ayrılır. Dosya sırası aynı zaman damgasında D1 satır sırasıyla sabitlenir. Değerlendirici bekleme adımı, günlük bütçede 20 dakika yerine en fazla 5 dakikalık durum kontrolüdür.

## Assessment dışındaki modül denetimi — 0.10

MODULE-AUDIT.md, 31 Ekim 2026 kaynak karşılaştırmasını ve kapsam sınırlarını içerir. Rol modülünün birleşik kopyası eski 24 soru/8 yetkinlikte kalmıştı; ayrı Site'deki 76 soru/12 yetkinlik 0.2.0 kaynağı taşındı. Ardından 36 özgün bireysel/profesyonel durumla 112 soruluk 0.3.0 içerik havuzu oluşturuldu. Yedi rol seçeneği, rolün desteklediği yetkinlikler, gerçek standart/geniş soru sayıları, tıklanabilir yetkinlik kartları, oturumda yetkinlik atlaması ve havuzda rol/yetkinlik/arama filtreleri eklendi. Yönetici olmayan rotalar çalışan yönetimi sorularını almaz. Örnek rapor seçili rol ve paket kapsamını kullanır. Kısmi alan indeksi null'dır; yalnız tamamlanan alan yorumlanır. Eski cevaplar ve sabit sorular korunur, kapsam genişlemesi tamamlanma sayılmaz.

Mizaç motoru ve ayrıntılı raporu, Zihin motorları/koç/sınav/pilot dosyaları güncel ayrı kaynaklarla karşılaştırıldı. Mizaç aday özetine kalite notları, motor ve ortak özete geçersiz/eksik/demo kayıt korumaları eklendi. Zihin'de kaynak sürüm kaybı bulunmadı; bağımsız çözüm, bankalar, koç, sınav, pilot ve oturum kontrolleri geçti. Ölçme geçerliği ve norm araştırması bu teknik kontrollerle tamamlanmış sayılmaz.

build-module-contracts.cjs, ortak özetin yetkinlik ve soru kapsamını gerçek bankadan türetir. Böylece ortak ilerleme kartı kapsam dışı eski cevapları saymaz; sahte tamamlandı bayrağı yeterli değildir. Aynı derleme görevi anahtar içermeyen kapsam sözleşmesini günceller. Rol bankasında değişiklik varsa önce build-role-bank.cjs çalıştırılır; yalnız üretilen dosyayı düzenlemeyin. check-rol.cjs yedi rol × iki derinlik, 76 eski sorunun korunması, 112 sorunun taslak puanları ve rol sızıntısını; check-modules-integration.cjs Mizaç sınır/örnek izolasyonu, ortak kapsam ve beş hedef rolün gerçek modül köprüsünü doğrular.

Yerel tarayıcıda analist standardı (9 yetkinlik / 20 soru), analitik alana atlama, cevap kaydı ve kısmi rapor doğrulandı. 390 px iframe'de tek yetkinlik kartından özel paket oluşturuldu (1 yetkinlik / 8 standart soru); yatay taşma yoktu. Bunlar yerel arayüz testleridir, canlı iki hesaplı pilot kabulünün yerine geçmez. Ayrı üç kaynak Site'de değişiklik veya yayın yapılmadı; bütün geliştirmeler birleşik üründedir.
