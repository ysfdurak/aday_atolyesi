/* Original Mizaç narrative rules. Content architecture informed by public sample reports;
   no DISC scoring, proprietary items, norms or profile taxonomy are used. */
const NARRATIVE = {
  plan: {
    high: {
      story:
        'Çalışmaya başlamadan önce işin adımlarını ve ara teslimlerini görünür kılmak bu profilde belirgin bir tercih. Kişi, neyin hangi sırayla yapılacağını bilerek ilerlemeyi seçiyor. Birden fazla iş olduğunda yalnız son tarihe bakmak yerine aradaki ilerlemeyi takip etmeye yönelebilir.',
      value:
        'Bağımlı işlerde planı görünür tutma, ara teslimleri konuşma ve işin hangi aşamada olduğunu paylaşma fırsatı bulabilir.',
      over: 'Plan araç olmaktan çıkıp değişmemesi gereken bir çerçeveye dönüşürse, yeni bilgiye rağmen eski sırayı korumak ek iş yaratabilir.',
      manager:
        'Beklenen çıktıyı, ara teslimleri ve öncelik değiştiğinde kimin karar vereceğini başta netleştirin. Plan revizyonunu başarısızlık gibi sunmadan birlikte güncelleyin.',
      do: 'Görüşmeden önce gündemi ve beklenen kararı paylaşın; değişiklik varsa hangi adımın neden değiştiğini belirtin.',
      dont: 'Öncelik sırasını sessizce değiştirip herkesin bunu fark edeceğini varsaymayın.',
      decision: 'Kararın uygulama adımlarının ve sonraki etkilerinin açık olmasını isteyebilir.',
      environment:
        'Ara teslimlerin görünür olduğu, öncelik değişikliklerinin açıkça bildirildiği çalışma düzeni.',
      friction: 'Günü fırsatlara göre değiştiren bir çalışma arkadaşıyla iş sırası konusunda ayrışabilir.',
      experiment:
        'Bir görevde yalnızca ilk iki adımı ayrıntılandırıp kalanını yeni bilgiye göre güncelleyin.',
      metric: 'Plan güncelleme sayısını ve güncellemenin yarattığı tekrar işini birlikte not edin.',
    },
    low: {
      story:
        'İşi ilerlerken şekillendirme ve sonraki adımı o anın bilgisiyle belirleme tercihi öne çıkıyor. Kişi, baştan ayrıntılı bir sıra kurmaktansa işin içine girerek yön bulmayı seçiyor. Bu tercih planlama becerisinin olmadığı anlamına gelmez; ne kadar ön yapı istediğini anlatır.',
      value:
        'Önceden bütünü görülemeyen işlerde işe giriş yapma ve ortaya çıkan bilgiye göre yol çizme fırsatı bulabilir.',
      over: 'Birbiriyle bağlantılı görevlerde ara teslimler görünmez kalırsa, başka kişilerin ne zaman devreye gireceği belirsizleşebilir.',
      manager:
        'Uygulama yönteminde alan bırakırken son çıktı, vazgeçilmez ara teslim ve başkalarına bağımlı noktaları birlikte belirleyin.',
      do: 'Önce ulaşılacak sonucu ve kritik sınırları açıklayın; yöntemi birlikte şekillendirmek için alan bırakın.',
      dont: 'Bütün adımların aynı ayrıntı düzeyinde baştan yazılmasını tek başarı ölçütü yapmayın.',
      decision: 'Kararın bir sonraki uygulanabilir adımını görerek ilerlemeyi seçebilir.',
      environment: 'Sonucun ve kritik sınırların net, yöntemin ise geliştirmeye açık olduğu işler.',
      friction: 'Her adımı önceden kesinleştirmek isteyen biriyle hazırlık düzeyi konusunda ayrışabilir.',
      experiment:
        'Başlamadan önce yalnız üç ara teslim ve iki bağımlılık yazın; ayrıntılı takvim oluşturmadan deneyin.',
      metric: 'Atlanan devir teslim veya son dakika açıklama ihtiyacındaki değişimi gözleyin.',
    },
    mid: {
      story:
        'Yanıtlar, önceden yapılandırma ile akış içinde şekillendirme arasında yer alıyor. Bu sonuç kişinin her iki yaklaşımı da eşit beceriyle kullandığını göstermez. Özellikle rutin iş, yeni proje ve son dakika talebinde tercihinin nasıl değiştiği somut örneklerle anlaşılabilir.',
      value:
        'İşin ne kadarının başta planlanmasını istediği konuşularak, aşırı veya yetersiz hazırlığın önüne geçilebilir.',
      over: 'Planın hangi noktada yeterli sayıldığı konuşulmazsa ekip üyeleri farklı hazırlık düzeyleri bekleyebilir.',
      manager:
        'Göreve göre hangi ara teslimlerin baştan netleşeceğini, hangilerinin ilerlerken belirleneceğini birlikte kararlaştırın.',
      do: 'Bu iş için hangi adımların baştan net olması gerektiğini sorun.',
      dont: 'Orta puanı otomatik olarak esneklik veya uyum becerisi diye yorumlamayın.',
      decision: 'Hazırlık ihtiyacını görev türüne göre örneklerle netleştirin.',
      environment: 'Ön planlama düzeyinin görev özelinde birlikte belirlendiği bir düzen.',
      friction: 'Hazırlık beklentileri konuşulmadığında farklı kişiler bu yaklaşımı farklı okuyabilir.',
      experiment: 'Biri rutin, biri yeni iki işte tercih edilen plan ayrıntısını karşılaştırın.',
      metric: 'Hazırlık süresi, tekrar iş ve bağımlı kişilerin bilgi ihtiyacını not edin.',
    },
  },
  detail: {
    high: {
      story:
        'Teslim öncesi kontrol, küçük farkları inceleme ve tamamlanma ölçütlerini gözden geçirme tercihi belirgin. Kişi, çıktı hazır görünse bile son bir kontrol turuna değer veriyor. Kontrolün kapsamını yalnız genel izlenimle belirlemek yerine ayrıntılı maddeler üzerinden ele alabilir.',
      value:
        'Veri tesliminde kritik alanların, kayıt farklarının ve tamamlanma ölçütlerinin görünür tutulmasına katkı verme fırsatı bulabilir.',
      over: 'Her ayrıntıya aynı düzeyde kontrol uygulanırsa düşük etkili farklar teslimi geciktirebilir. Kontrol sıklığının hata maliyetiyle eşleştirilmesi yararlı olur.',
      manager:
        'Hangi alanların kritik olduğunu ve kabul edilebilir teslim düzeyini açıkça tanımlayın. Kontrol turu için zaman ayırın; sınırsız kontrol beklemeyin.',
      do: 'Örnek çıktı, kabul ölçütü ve kritik hata tanımını paylaşın.',
      dont: 'Kontrol ihtiyacını kişisel güvensizlik olarak yorumlamayın veya teslim ölçütünü son anda değiştirip belirtmeyin.',
      decision:
        'Bir kararın uygulanmasından önce veri ve çıktıdaki tutarsızlıkların açıklanmasını isteyebilir.',
      environment: 'Kontrolün kapsamı ve tamamlanma ölçütleri belirli olan işler.',
      friction: 'İlk taslağı hızlıca paylaşmak isteyen biriyle “hazır” kelimesinin anlamı farklı olabilir.',
      experiment:
        'Bir çıktıyı kritik, önemli ve kozmetik ayrıntılar olarak üçe ayırıp kontrol süresini buna göre dağıtın.',
      metric: 'Kontrol süresi ile teslimden sonra bulunan önemli hata sayısını birlikte izleyin.',
    },
    low: {
      story:
        'Çıktının genel amacına bakma ve ayrıntıları ihtiyaç ortaya çıktıkça ele alma tercihi öne çıkıyor. Kişi, ana sonuç yeterince belirgin olduğunda her küçük fark için ayrı bir inceleme yapmayı gerekli görmeyebilir. Bu yanıtlar dikkat kapasitesini veya hata yapma oranını ölçmez.',
      value:
        'İşin ana hedefini ve genel sonucunu görünür tutma, ayrıntı incelemesini önceliklendirme fırsatı bulabilir.',
      over: 'Küçük görünen ancak iş açısından kritik bir alanın gözden kaçmaması için kontrol gerekliliklerinin dışarıdan görünür olması gerekebilir.',
      manager:
        'Hangi ayrıntıların isteğe bağlı, hangilerinin zorunlu olduğunu örnekle ayırın. Yalnız “daha dikkatli ol” demek yerine kısa kontrol listesi verin.',
      do: 'Önce çıktının amacını, ardından mutlaka doğrulanacak az sayıdaki kritik alanı açıklayın.',
      dont: 'Küçük ayrıntı tercihini özensizlik veya düşük sorumluluk olarak etiketlemeyin.',
      decision: 'Ayrıntılı incelemeden önce genel sonucun neyi değiştireceğini anlamak isteyebilir.',
      environment: 'Kritik kontrol adımlarının kısa ve görünür olduğu, ana hedefin açıklandığı işler.',
      friction: 'Ayrıntılı kontrol yapan bir çalışma arkadaşıyla tamamlanma standardı konusunda ayrışabilir.',
      experiment: 'Teslim öncesi yalnız beş kritik alanı içeren sabit bir kontrol turu deneyin.',
      metric: 'Kontrol turunun süresini ve sonradan fark edilen kritik eksikleri kaydedin.',
    },
    mid: {
      story:
        'Genel sonuç ve ayrıntılı kontrol arasında tek bir yön belirgin değil. Kişi bazı işlerde son kontrolü önemli görürken başka işlerde ana amacın sağlanmasını yeterli buluyor olabilir. Hangi farkları kritik gördüğü, puanın kendisinden daha açıklayıcı bir görüşme konusudur.',
      value:
        'Kontrol kapsamı görevle birlikte tanımlanırsa, genel hedef ve kritik ayrıntı arasında ortak bir çalışma standardı kurulabilir.',
      over: '“Bu kadar kontrol yeterli” kararının gerekçesi açıklanmazsa ekip içinde farklı beklentiler oluşabilir.',
      manager:
        'İş başında kontrol kapsamını ve teslim ölçütünü konuşun; geçmiş bir teslimden birlikte örnek seçin.',
      do: 'Bu görevde hangi hatanın sonucu ciddi biçimde değiştireceğini sorun.',
      dont: 'Orta puanı ne düşük dikkat ne de dengeli kalite yönetimi kanıtı sayın.',
      decision: 'Hangi kararda ne kadar ayrıntı istediğini iki farklı örnek üzerinden araştırın.',
      environment: 'Kontrol düzeyinin işin riskiyle birlikte belirlendiği bir düzen.',
      friction: 'Kalite standardının örtük bırakılması aynı iş için farklı hazır olma algıları yaratabilir.',
      experiment: 'İki görevde kontrol listesi kullanımının neyi değiştirdiğini karşılaştırın.',
      metric: 'Önemli hata, kontrol süresi ve tekrar işini birlikte değerlendirin.',
    },
  },
  voice: {
    high: {
      story:
        'Farklı görüşünü erken paylaşma, gerekçeli itiraz etme ve konuşmaya kendi önerisiyle katılma tercihi belirgin. Kişi, öneriyi yalnız kendi içinde olgunlaştırmak yerine tartışmaya taşıyarak geliştirmeyi seçebilir. Bu, ikna becerisi veya liderlik başarısı hakkında tek başına sonuç vermez.',
      value:
        'Karar öncesi farklı seçeneklerin ve çekincelerin görünür olmasına katkı verme fırsatı bulabilir.',
      over: 'Görüşünü erken ve sık paylaşmak, diğer katılımcıların düşüncelerini tamamlamadan yönün belirlenmesine yol açabilir.',
      manager:
        'Görüşünü gerekçesiyle duymak için alan açın; ardından diğer katılımcılar için de söz sırası oluşturun.',
      do: 'Görüşünü ve dayanağını doğrudan sorun; karşı görüşü kişiselleştirmeden tartışın.',
      dont: 'İtirazı yalnız otoriteye karşı çıkış diye okumayın veya yüksek katılımı otomatik liderlik kanıtı saymayın.',
      decision:
        'Seçenekleri tartışmaya açarak ve kendi çekincesini söyleyerek karara katılmayı tercih edebilir.',
      environment: 'Farklı görüşlerin gerekçeleriyle ifade edilebildiği toplantılar.',
      friction: 'Düşüncesini sonra paylaşan biriyle sessizliğin ne anlama geldiği yanlış anlaşılabilir.',
      experiment:
        'Bir toplantıda önerinizi söyledikten sonra iki kişinin görüşünü sormadan ikinci kez konuşmamayı deneyin.',
      metric: 'Duyulan alternatif sayısını ve karar öncesi ortaya çıkan yeni bilgiyi not edin.',
    },
    low: {
      story:
        'Önce dinleme, düşünceyi kendi içinde olgunlaştırma ve görüşü daha sonra paylaşma tercihi öne çıkıyor. Kişi toplantıdaki ilk sessizliğinde mutlaka onay veriyor olmayabilir. Yazılı hazırlık veya bire bir görüşme, düşüncesini görünür kılmanın daha yakın bulduğu yolu olabilir.',
      value: 'Konuşulan seçenekleri dinleyip daha sonra düşünülmüş bir katkı sunma fırsatı bulabilir.',
      over: 'Görüşünü paylaşmayı ertelemek, önemli çekincenin karar alındıktan sonra duyulmasına neden olabilir.',
      manager:
        'Gündemi önceden paylaşın ve karar kapanmadan görüşünü açıkça sorun. Yanıtı yalnız anlık söz alma üzerinden değerlendirmeyin.',
      do: 'Düşünmesi için kısa bir hazırlık payı bırakın; yazılı görüş paylaşma seçeneği sunun.',
      dont: 'Sessizliği onay, isteksizlik veya bilgisizlik diye varsaymayın.',
      decision: 'Karara katkı vermeden önce düşüncelerini düzenlemek ve seçenekleri dinlemek isteyebilir.',
      environment: 'Hazırlık ve yazılı katkı için alan bulunan çalışma düzeni.',
      friction: 'Hızla konuşarak karar alan biriyle görüşün ne zaman hazır sayıldığı konusunda ayrışabilir.',
      experiment: 'Toplantı öncesi bir öneri ve bir çekince yazıp karar kapanmadan bunları paylaşın.',
      metric: 'Karardan sonra ilk kez duyulan çekincelerin sayısını gözleyin.',
    },
    mid: {
      story:
        'Görüşünü erken paylaşma ile önce dinleme arasında tek yönlü bir tercih görünmüyor. Konuya hâkimiyet, toplantının amacı veya katılımcılar farklı olduğunda yaklaşım değişiyor olabilir; hangi koşulun etkili olduğu bu formdan anlaşılamaz.',
      value:
        'Katılım biçimi açıkça konuşulduğunda, toplantı içinde ve sonrasında katkı kanalları birlikte düzenlenebilir.',
      over: 'Diğer kişiler ne zaman anlık görüş, ne zaman yazılı dönüş bekleyeceklerini bilemeyebilir.',
      manager: 'Görüşünü hangi aşamada ve hangi kanalda paylaşmayı tercih ettiğini sorun.',
      do: 'Bu konuda şimdi konuşmak mı, kısa hazırlıktan sonra dönmek mi daha yararlı olur diye sorun.',
      dont: 'Farklı katılım biçimlerini otomatik olarak çekingenlik veya baskınlık olarak etiketlemeyin.',
      decision: 'Sözlü ve yazılı katkı tercihlerini kararın türüne göre araştırın.',
      environment: 'Farklı katılım kanallarının açık olduğu bir düzen.',
      friction: 'Beklenen katılım zamanı örtük bırakılırsa görüşün eksik kaldığı düşünülebilir.',
      experiment: 'Bir toplantıda önceden yazılı görüş, diğerinde anlık tartışma deneyin.',
      metric: 'Hangi yöntemde gerekçelerin ve çekincelerin daha görünür olduğunu karşılaştırın.',
    },
  },
  collab: {
    high: {
      story:
        'Sorun henüz çözülmeden görüş alma ve çalışma sürerken kısa paylaşımlar yapma tercihi belirgin. Kişi, tek başına tamamlanmış çıktı sunmak yerine taslağı başkalarıyla geliştirerek ilerlemeyi seçiyor. Bu tercih ekip uyumu, empati veya ilişki kalitesinin doğrudan ölçümü değildir.',
      value:
        'Taslak aşamasında farklı bilgileri bir araya getirme ve bağımlı kişileri erkenden sürece katma fırsatı bulabilir.',
      over: 'Her küçük adımı birlikte değerlendirmek gereksiz görüşme ve kesintiye dönüşebilir. Hangi konunun ortak değerlendirme gerektirdiği belirlenmelidir.',
      manager:
        'Paylaşım noktalarını planlayın; bunun yanında kesintisiz bireysel çalışma için de zaman ayırın.',
      do: 'Görüş istenen noktayı ve kimden hangi katkının beklendiğini açıkça belirtin.',
      dont: 'Görüş alışverişi isteğini karar verememe olarak yorumlamayın; her konuda herkesin onayını zorunlu kılmayın.',
      decision:
        'Alternatifleri başkalarıyla konuşarak ve taslağa geri bildirim alarak geliştirmeyi tercih edebilir.',
      environment: 'Kısa ve amaçlı ortak değerlendirmelerin yapılabildiği işler.',
      friction: 'Önce tek başına taslak hazırlamak isteyen biriyle paylaşım zamanı konusunda ayrışabilir.',
      experiment: 'Bir işte yalnız iki planlı görüşme noktası belirleyip aradaki çalışmayı bağımsız yürütün.',
      metric: 'Görüşme süresi, tekrar iş ve geç öğrenilen bilgileri birlikte izleyin.',
    },
    low: {
      story:
        'Problemi önce kendi başına ele alma ve taslağı belirli bir olgunluğa getirdikten sonra paylaşma tercihi öne çıkıyor. Kişi, sık ortak görüşme yerine bağımsız çalışma bloklarını seçiyor. Bu, insanlarla çalışamadığı veya destek istemeyeceği anlamına gelmez.',
      value:
        'Kesintisiz odak gerektiren taslak hazırlama ve bireysel çalışma aşamalarına yer verme fırsatı bulabilir.',
      over: 'Paylaşım çok geç yapılırsa diğer kişilerin ihtiyaçları veya farklı bilgileri ancak çıktı tamamlandıktan sonra anlaşılabilir.',
      manager:
        'Bağımsız çalışma alanı tanıyın; dış bağımlılıkları etkileyen ara paylaşım noktalarını birlikte belirleyin.',
      do: 'Hangi konuda ne zaman bilgi gerektiğini netleştirin; odağı gereksiz kesintilerle bölmeyin.',
      dont: 'Bağımsız çalışma tercihini ekipten uzak durma veya düşük bağlılık olarak değerlendirmeyin.',
      decision:
        'Önce kendi değerlendirmesini oluşturup ardından belirli sorularla geri bildirim almayı tercih edebilir.',
      environment: 'Odak bloklarının ve kararlaştırılmış paylaşım zamanlarının bulunduğu işler.',
      friction:
        'Çalışırken sık fikir alışverişi isteyen biri bağımsız ilerlemeyi bilgi saklama olarak yanlış okuyabilir.',
      experiment: 'Taslağın ilk üçte birlik aşamasında ilgili kişiye tek bir kısa kontrol noktası açın.',
      metric: 'Geç gelen ihtiyaç değişikliklerinin ve yeniden yapılan işin sayısını izleyin.',
    },
    mid: {
      story:
        'Bağımsız çalışma ve sık fikir alışverişi arasında net bir yön görünmüyor. Kişinin hangi görevde ortak üretim, hangi görevde tek başına çalışma istediği ayrıca anlaşılmalıdır. Bu sonuç otomatik olarak hem bireysel hem takım işinde yüksek beceri anlamına gelmez.',
      value: 'Görevdeki bağımlılıklar ve odak ihtiyacı konuşularak uygun paylaşım sıklığı bulunabilir.',
      over: 'Paylaşım sıklığı her gün değişiyorsa çalışma arkadaşları ne zaman bilgi alacaklarını kestiremeyebilir.',
      manager: 'İş başında ortak çalışma ve bağımsız ilerleme aşamalarını birlikte belirleyin.',
      do: 'Bu taslağı birlikte mi geliştirelim, ilk sürümden sonra mı gözden geçirelim diye sorun.',
      dont: 'Paylaşım tercihindeki değişimi kişisel yakınlık veya uzaklık olarak yorumlamayın.',
      decision: 'Hangi kararın ortak görüş, hangisinin bireysel hazırlık gerektirdiğini örneklerle konuşun.',
      environment: 'Paylaşım sıklığının görev özelinde belirlendiği bir düzen.',
      friction: 'Açık bir iletişim ritmi yoksa ekip farklı sıklıklarda geri dönüş bekleyebilir.',
      experiment: 'Bir işte ortak başlangıç ve bağımsız üretim düzeni deneyin.',
      metric: 'Bilgi bekleme süresi ve sonradan yapılan kapsam değişikliklerini not edin.',
    },
  },
  initiative: {
    high: {
      story:
        'Yetki alanındaki ilk adımı kendisinin atması ve ayrıntılı yönlendirme beklemeden küçük bir başlangıç yapması belirgin bir tercih. Kişi, işi başlatmak için bütün tarifin tamamlanmasını gerekli görmeyebilir. Bu yanıtlar yetkiyi doğru kullanma veya sonuca ulaşma becerisini ayrıca kanıtlamaz.',
      value:
        'Sorumluluk sınırları belli olduğunda bekleyen küçük işleri harekete geçirme ve deneme önerme fırsatı bulabilir.',
      over: 'Yetki sınırları net değilse başlatılan adım başka kişilerin karar alanını veya mevcut işi etkileyebilir.',
      manager:
        'Hangi kararları tek başına alabileceğini, hangilerinde haber veya onay gerektiğini örneklerle netleştirin.',
      do: 'Beklenen sonucu ve karar sınırını söyleyin; ilk adım önerisini dinleyin.',
      dont: 'İnisiyatif beklerken karar alanını belirsiz bırakmayın veya her küçük adımı sonradan yeniden onaya bağlamayın.',
      decision: 'Yetkisi içindeki küçük ve uygulanabilir adımı erken belirlemek isteyebilir.',
      environment: 'Karar yetkisi ile sorumluluğun açıkça eşleştirildiği işler.',
      friction: 'Önce görev tarifinin tamamlanmasını isteyen biriyle başlama zamanı konusunda ayrışabilir.',
      experiment: 'Bir görev için “kendim karar veririm / haber veririm / onay alırım” sınırlarını yazın.',
      metric: 'Gereksiz bekleme ve sonradan geri alınan adımları birlikte izleyin.',
    },
    low: {
      story:
        'Harekete geçmeden önce beklentiyi ve sorumluluk alanını netleştirme tercihi öne çıkıyor. Kişi, görevin kime ait olduğunu ve nasıl ilerlenmesinin istendiğini duymayı tercih edebilir. Bu, isteksizlik veya sorumluluk almama sonucunu tek başına desteklemez.',
      value:
        'Yetki ve görev sınırlarının baştan konuşulmasına, belirsiz talebin görünür hâle gelmesine katkı verme fırsatı bulabilir.',
      over: 'Her ilk adım için yeni bir yönlendirme beklenirse, karar alanı aslında belli olan küçük işlerde de gecikme oluşabilir.',
      manager:
        'Açık görev tarifiyle başlayın; ardından hangi benzer durumlarda yeniden onay gerekmeyeceğini birlikte belirleyin.',
      do: 'Başlangıç beklentisini, sorumlu kişiyi ve tek başına alınabilecek kararları açıkça söyleyin.',
      dont: 'Tarif ihtiyacını otomatik düşük potansiyel veya düşük sahiplenme diye adlandırmayın.',
      decision: 'Karardan önce kimin sorumlu olduğunu ve hangi adımın beklenildiğini anlamak isteyebilir.',
      environment: 'Sorumlu ve karar sınırlarının görünür olduğu, net örneklerle başlayan işler.',
      friction:
        'Tarif vermeden “kendiliğinden çöz” beklentisi taşıyan biriyle karşılıklı bekleme oluşabilir.',
      experiment:
        'Tek bir tekrar eden işte yönlendirme olmadan alınabilecek ilk adımı önceden kararlaştırın.',
      metric: 'Başlamak için sorulan açıklama sayısını ve yanlış başlangıçları izleyin.',
    },
    mid: {
      story:
        'Başlatma ile çerçeveyi netleştirme arasında tek yönlü tercih görünmüyor. Yetki, konuya aşinalık veya olası sonuçlar kararını etkiliyor olabilir. Hangi durumda ilk adımı attığı ve hangi durumda yönlendirme istediği gerçek iş örnekleriyle araştırılmalıdır.',
      value: 'Karar alanı konuşulduğunda başlatma ve danışma sınırları görev özelinde netleştirilebilir.',
      over: 'Benzer görünen görevlerde farklı başlama davranışı, beklenti açık değilse diğer kişilerce yanlış okunabilir.',
      manager:
        'İnisiyatif beklenen kararları tek tek tarif edin; genel “daha girişken ol” geri bildirimiyle yetinmeyin.',
      do: 'Bu durumda ilk adımı atmak için hangi bilginin eksik olduğunu sorun.',
      dont: 'Orta puanı otomatik olarak doğru düzeyde inisiyatif kullanma becerisi saymayın.',
      decision: 'Tek başına karar ve danışma tercihini yetki örnekleriyle inceleyin.',
      environment: 'Karar sınırlarının görev özelinde konuşulabildiği işler.',
      friction: 'Belirsiz yetki alanı kimin başlatacağı konusunda karşılıklı beklemeye yol açabilir.',
      experiment: 'Üç yakın görevde ilk adımı kimin atacağını önceden belirleyin.',
      metric: 'Bekleme süresi ve gereksiz onay turunu gözleyin.',
    },
  },
  evidence: {
    high: {
      story:
        'Karar öncesinde kaynakları, alternatifleri ve varsayımları inceleme tercihi belirgin. Kişi, ilk açıklama makul görünse bile başka bir dayanak veya karşı örnek aramayı seçebilir. Bir öneriyi kabul etmeden önce neye dayandığını görmek isteyebilir; bu, analitik beceri düzeyinin ölçümü değildir.',
      value:
        'Karar gerekçelerinin görünür kılınmasına, veri kaynağının ve alternatif açıklamaların konuşulmasına katkı verme fırsatı bulabilir.',
      over: 'Karar için yeterli bilgi eşiği belirlenmezse ek karşılaştırma ihtiyacı karar anını sürekli ileri taşıyabilir.',
      manager:
        'Hangi bilginin zorunlu olduğunu, kararın son zamanını ve belirsiz kalan noktaları açıkça ayırın.',
      do: 'Önerinizle birlikte kaynak, varsayım ve seçeneklerin neden elendiğini paylaşın.',
      dont: 'Kaynak sorusunu kişisel güvensizlik olarak okumayın veya dayanağı olmayan kesinlik kullanmayın.',
      decision:
        'Kararı kaynak ve alternatif karşılaştırmasıyla kurmayı, varsayımları açık tutmayı tercih edebilir.',
      environment: 'Veriye erişimin ve gerekçeli tartışmanın mümkün olduğu işler.',
      friction: 'Deneyimiyle hızlı kanaat oluşturan biriyle yeterli kanıtın miktarı konusunda ayrışabilir.',
      experiment: 'Bir karar için başlamadan önce “hangi üç bilgi yeterli?” sorusuna yanıt yazın.',
      metric: 'Karar hazırlık süresi ile sonradan değişen önemli varsayımları birlikte izleyin.',
    },
    low: {
      story:
        'Kararlarda deneyime, ilk değerlendirmeye ve genel kanaate başvurma tercihi öne çıkıyor. Kişi, tanıdık görünen bir konuda her seçeneği yeniden ayrıntılı karşılaştırmayı gerekli görmeyebilir. Bu tercih veri okuyamadığı veya analitik düşünemediği anlamına gelmez.',
      value:
        'Benzer durumlarda geçmiş deneyimi devreye sokma ve kararın pratik tarafını tartışmaya taşıma fırsatı bulabilir.',
      over: 'Yeni bir durum tanıdık bir örneğe benzetildiğinde, önemli farklılıkların gözden kaçmaması için varsayımlar ayrıca kontrol edilmelidir.',
      manager:
        'Deneyim gerekçesini dinleyin; yeni veya yüksek etkili konularda zorunlu iki kanıt kontrolünü birlikte belirleyin.',
      do: 'Önce önerinin neyi değiştireceğini açıklayın, ardından kritik dayanakları kısa biçimde gösterin.',
      dont: 'Deneyime dayanmayı mantıksızlık olarak adlandırmayın veya kanıt beklentisini örtük bırakmayın.',
      decision: 'İlk değerlendirme ve geçmiş benzerliklerle yön belirlemeyi tercih edebilir.',
      environment: 'Deneyimin paylaşıldığı ve kritik varsayımlar için kısa kontrollerin bulunduğu işler.',
      friction:
        'Her seçeneği yeniden karşılaştırmak isteyen biriyle karar için gereken hazırlık düzeyi farklı olabilir.',
      experiment: 'Bir kararda ilk kanaatinizi yazın; ardından onu yanlışlayabilecek tek bir bilgi arayın.',
      metric: 'İlk kanaati değiştiren yeni bilgi sayısını ve karar süresini gözleyin.',
    },
    mid: {
      story:
        'Deneyim ve kaynak karşılaştırması arasında tek bir tercih belirgin değil. Hangi konularda ek veri aradığı, hangilerinde deneyimini yeterli gördüğü araştırılmalıdır. Bu sonuç her kararda doğru kanıt düzeyini seçtiğini göstermez.',
      value: 'Karar türleri ayrıldığında, hangi bilginin nerede gerekli olduğu birlikte netleştirilebilir.',
      over: 'Kanıt standardı açıklanmazsa bir öneride ayrıntı istenirken diğerinde hızlı kabul verilmesi tutarsız algılanabilir.',
      manager:
        'Kararın etkisi, geri alınabilirliği ve konuya aşinalığa göre beklenen dayanağı birlikte belirleyin.',
      do: 'Bu kararda sizi ikna edecek bilgi nedir diye sorun.',
      dont: 'Orta puanı doğrudan dengeli veya objektif karar verme kanıtı saymayın.',
      decision: 'Deneyim ve veri kullanımını iki farklı karar örneğinde karşılaştırın.',
      environment: 'Karar için gereken kanıtın baştan konuşulduğu işler.',
      friction: 'Kanıt beklentisinin değişme nedeni söylenmezse diğerleri hazırlığı yanlış ayarlayabilir.',
      experiment: 'İki kararda hangi bilginin yeterli sayıldığını açıkça kaydedin.',
      metric: 'Ek bilgi talepleri ve değişen varsayımların gerekçelerini inceleyin.',
    },
  },
  change: {
    high: {
      story:
        'Yeni araç veya yöntemleri küçük ölçekte deneme ve koşullar değiştiğinde yaklaşımını değiştirme tercihi belirgin. Kişi, iş gören bir yöntem varken de alternatif araştırmayı seçebilir. Bu, her değişimi doğru değerlendirdiği veya yeniliği başarıyla uyguladığı anlamına gelmez.',
      value:
        'Alternatif yöntemlerin denenmesi ve mevcut iş yapışının sorgulanması için fikir üretme fırsatı bulabilir.',
      over: 'Denemeler sonuçlandırılmadan yeni yönteme geçilirse ortak standartların ve öğrenilen derslerin kaydı zayıf kalabilir.',
      manager:
        'Denemenin amacını, başarı ölçütünü ve ne zaman sürdürme/durdurma kararı verileceğini netleştirin.',
      do: 'Yeni yöntemin gerekçesini, küçük deneme alanını ve değerlendirme tarihini konuşun.',
      dont: 'Sadece yenilik önerildi diye uygulanabilirliğin ve öğrenme süresinin ayrıca incelendiğini varsaymayın.',
      decision: 'Geri alınabilir bir denemeyle seçenek hakkında bilgi toplamayı tercih edebilir.',
      environment: 'Sınırlı denemelere izin veren ve sonuçlarını takip eden işler.',
      friction:
        'İşleyen yöntemi korumayı isteyen biriyle değişiklik ihtiyacının yeterince açık olup olmadığı tartışılabilir.',
      experiment: 'Bir yöntemi yalnız tek görevde sınayın; eski yöntemle aynı ölçüt üzerinden karşılaştırın.',
      metric: 'Denemenin sonucu, öğrenme süresi ve sürdürülen değişiklikleri kaydedin.',
    },
    low: {
      story:
        'İşe yaradığı bilinen araç ve yöntemleri sürdürme tercihi öne çıkıyor. Kişi, mevcut yöntem yeterliyken alternatif aramaya zaman ayırmayı gerekli görmeyebilir. Bu yanıtlar öğrenme kapasitesi veya değişime uyum becerisi hakkında doğrudan bir sonuç vermez.',
      value:
        'Bilinen iş akışını sürdürme ve yeni önerinin mevcut yönteme göre hangi ihtiyacı çözdüğünü görünür kılma fırsatı bulabilir.',
      over: 'Koşullar değiştiğinde eski yöntemin yeterliliği tekrar incelenmezse gerekli bir iyileştirme ertelenebilir.',
      manager:
        'Değişiklik nedenini somut bir sorunla ilişkilendirin; küçük deneme ve öğrenme için zaman tanıyın.',
      do: 'Neyin korunacağını, neyin değişeceğini ve denemenin geri alınabilir olup olmadığını açıklayın.',
      dont: 'Bilinen yöntemi sürdürme tercihini doğrudan gelişime kapalı olma diye etiketlemeyin.',
      decision: 'Yeni seçeneğin mevcut yönteme göre neyi iyileştirdiğini görmek isteyebilir.',
      environment: 'Değişiklik gerekçesinin ve geçiş desteğinin açık olduğu işler.',
      friction:
        'Yeni yöntemi hemen denemek isteyen biriyle değişiklik ihtiyacını değerlendirme süresi farklı olabilir.',
      experiment: 'Mevcut yöntemin zorlandığı tek bir küçük görevde alternatif deneyin.',
      metric: 'Eski ve yeni yöntemi aynı çıktı, hata ve süre ölçütleriyle karşılaştırın.',
    },
    mid: {
      story:
        'Bilinen yöntemi sürdürme ile yenisini deneme arasında net bir yön görünmüyor. Yenilik seçiminin hangi koşullarda değiştiği örneklerle araştırılmalıdır. Orta puan tek başına sağlıklı değişim yönetimi becerisi göstermez.',
      value:
        'Yöntem seçiminin gerekçesi görünür tutulduğunda değişiklik ve devam kararları ortaklaştırılabilir.',
      over: 'Hangi yeniliğe açık, hangisine mesafeli olduğu açıklanmazsa ekip seçimin nedenini anlamayabilir.',
      manager:
        'Bir yeniliği denemek için hangi sorunun çözülmesini ve hangi bilginin görülmesini beklediğini konuşun.',
      do: 'Bu değişikliği denemeye değer kılan koşullar neler diye sorun.',
      dont: 'Orta puanı ne yenilikçilik ne de direnç etiketi olarak kullanın.',
      decision: 'Yeni yöntem kararını gerekçe ve deneme koşulları üzerinden araştırın.',
      environment: 'Sürdürme ve değiştirme gerekçelerinin paylaşılabildiği işler.',
      friction: 'Yöntem seçiminin dayanağı görünmez kaldığında diğer kişiler öngörülemez bulabilir.',
      experiment: 'Bir değişiklik ve bir devam kararı için gerekçeleri yazın.',
      metric: 'Karar sonrasında beklenen faydanın gerçekten oluşup oluşmadığını izleyin.',
    },
  },
  pace: {
    high: {
      story:
        'İlk taslağı erken oluşturma ve küçük adımlardan gelen geri bildirimle ilerleme tercihi belirgin. Kişi, uzun bir hazırlık döneminden sonra tek çıktı vermek yerine kısa döngüleri seçiyor. Bu form gerçek işlem hızını veya zaman baskısındaki başarısını ölçmez.',
      value: 'Erken taslak ve küçük denemelerle geri bildirim alınmasına fırsat sağlayabilir.',
      over: 'İlk çıktı tamamlanmış ürün gibi okunursa veya geri dönüşü zor bir işe aynı yaklaşım uygulanırsa gereksiz düzeltme oluşabilir.',
      manager:
        'Taslak ve son teslim ölçütlerini ayırın. Geri alınabilir adımlarda erken ilerleme, geri alınamaz kararlarda başlangıç kontrolü belirleyin.',
      do: 'İlk sürümün amacını ve hangi noktada geri bildirim verileceğini açıkça söyleyin.',
      dont: 'Erken taslağı son kalite düzeyi diye değerlendirmeyin veya hazırlık gerektiren her işi hızla başlatmasını beklemeyin.',
      decision: 'Küçük bir ilk adımla bilgi toplayarak kararı geliştirmeyi tercih edebilir.',
      environment: 'Taslakların açıkça etiketlendiği ve kısa geri bildirim döngülerinin bulunduğu işler.',
      friction: 'İlk çıktının daha olgun olmasını isteyen biriyle paylaşım standardı farklı olabilir.',
      experiment:
        'Bir görevde ilk taslağı erken paylaşın; başlamadan önce geri alınamaz riskler için kısa kontrol koyun.',
      metric: 'İlk geri bildirim zamanı, düzeltme sayısı ve toplam bitirme süresini birlikte izleyin.',
    },
    low: {
      story:
        'İlk adım öncesinde düşünmeye ve hazırlığa zaman ayırma tercihi öne çıkıyor. Kişi, sık küçük taslak paylaşmak yerine daha olgun bir ilk çıktı sunmayı seçebilir. Bu, yavaş çalıştığı veya kısa sürede sonuç üretemediği sonucunu desteklemez.',
      value: 'İlk çıktıdan önce seçenekleri ele alma ve hazırlık aşamasını görünür kılma fırsatı bulabilir.',
      over: 'Hazırlığın bitiş ölçütü belirsizse geri bildirim gecikebilir; ekip ihtiyaçları ancak geç bir aşamada fark edilebilir.',
      manager:
        'Hazırlığın amacını ve ilk paylaşım zamanını kararlaştırın. İlk sürümün eksiksiz olması gerekmediğini somut örnekle belirtin.',
      do: 'Hazırlık için hangi bilgi ve ne kadar süre gerektiğini sorun.',
      dont: 'Düşünme tercihini düşük enerji veya düşük performans olarak yorumlamayın.',
      decision: 'Harekete geçmeden önce seçenekleri düzenlemek ve ilk çıktıyı olgunlaştırmak isteyebilir.',
      environment: 'Hazırlık ve ilk paylaşım zamanının açıkça belirlendiği işler.',
      friction: 'Çok erken taslak isteyen biriyle hazırlığın ne zaman yeterli olduğu konusunda ayrışabilir.',
      experiment: 'Bir işte hazırlığa süre sınırı koyup tek sayfalık ilk taslak paylaşın.',
      metric: 'İlk geri bildirimin geliş zamanı ve sonradan değişen kapsamı gözleyin.',
    },
    mid: {
      story:
        'Erken ilk çıktı ve daha uzun hazırlık arasında tek yönlü tercih görünmüyor. Bu, zaman yönetiminin iyi veya kötü olduğunu söylemez. Hangi görevin erken deneme, hangisinin hazırlık gerektirdiğini nasıl ayırdığı araştırılabilir.',
      value: 'İlk çıktı standardı konuşularak görev türüne uygun bir geri bildirim düzeni kurulabilir.',
      over: 'İlk paylaşım beklentisi açık olmazsa bazı işlerde erken, bazılarında geç dönüş diğerlerini zorlayabilir.',
      manager: 'Her yeni görevde ilk sürümün kapsamını ve paylaşım zamanını birlikte belirleyin.',
      do: 'Bu işte ilk taslaktan ne zaman ve hangi olgunlukta yararlanabileceğimizi sorun.',
      dont: 'Orta puanı otomatik olarak duruma uygun tempo ayarlama becerisi saymayın.',
      decision: 'Hazırlık ve deneme tercihini farklı karar örneklerinde karşılaştırın.',
      environment: 'İlk çıktı beklentisinin görev özelinde belirlendiği işler.',
      friction: 'Taslak olgunluğu konuşulmadığında işin ilerlemediği veya erken paylaşıldığı düşünülebilir.',
      experiment: 'Bir görev için erken taslak, diğeri için hazırlıklı ilk çıktı düzenini karşılaştırın.',
      metric: 'İlk paylaşım, geri bildirim ve bitirme zamanlarını birlikte inceleyin.',
    },
  },
};
const MOTIVE_TEXT = [
  [
    'Net beklenti ve düzen',
    'Katılımcı, görev sınırlarının ve önceliklerin açık olmasını kendisini destekleyen koşullar arasında seçti. Yöneticiyle ilk görüşmede “iyi tamamlanmış iş” örneği ve öncelik değiştiğinde kullanılacak iletişim yolu birlikte belirlenebilir.',
    'Haftalık kısa öncelik görüşmesi ve yazılı teslim ölçütü deneyin.',
  ],
  [
    'Bağımsız karar alanı',
    'Katılımcı, işi yürütürken karar verebileceği bir alanı tercih ettiğini doğrudan belirtti. Bunun hangi kararları kapsadığı ayrıca konuşulmalıdır; bağımsızlık tercihi tek başına görevi desteksiz yapabilme becerisi değildir.',
    'Tek başına karar, haber verme ve onay alma sınırlarını birlikte yazın.',
  ],
  [
    'Birlikte üretme',
    'Katılımcı, başkalarıyla ortak üretimi destekleyici bir koşul olarak seçti. Hangi aşamada birlikte çalışmak istediği ve hangi aşamada odak ihtiyacı duyduğu konuşulabilir.',
    'Bir işte ortak başlangıç ve kısa taslak incelemesi planlayın.',
  ],
  [
    'Öğrenme ve yenilik',
    'Katılımcı, yeni şeyler öğrenme ve deneme fırsatını destekleyici bir koşul olarak seçti. Bu seçim öğrenme hızını veya tüm değişikliklerden hoşlanacağını göstermez; öğrenmek istediği somut alan ayrıca sorulmalıdır.',
    'Küçük bir öğrenme hedefi ve uygulamada kullanılacak görev belirleyin.',
  ],
  [
    'Görünür takdir',
    'Katılımcı, katkısının fark edilmesini destekleyici bir koşul olarak seçti. Takdirin hangi biçimini yararlı bulduğu varsayılmamalıdır; somut geri bildirim, özel teşekkür veya ekip içinde paylaşım seçenekleri konuşulabilir.',
    'İyi yapılan somut eylemi ve etkisini açıklayan geri bildirim verin.',
  ],
  [
    'İlerleme ve sorumluluk',
    'Katılımcı, ilerleme fırsatını ve sorumluluk alanını destekleyici koşul olarak seçti. Terfi beklentisi veya yönetici potansiyeli bu seçimden çıkarılamaz; hangi sorumlulukları geliştirmek istediği konuşulmalıdır.',
    'Bir görevde sınırları belli ek sorumluluk ve sonrasında değerlendirme görüşmesi planlayın.',
  ],
];
const REPORT_CHAPTERS = [
  'İK yönetici özeti',
  'Bütünlüklü davranış anlatımı',
  'Katkı fırsatları ve aşırı kullanım',
  'Kişiyle iletişim rehberi',
  'Farklı yaklaşımlarla çalışma',
  'Karar ve problem çözme',
  'Ekip içindeki çalışma biçimi',
  'Yönetilme ve görev devri',
  'Görüş ayrılıklarını yönetme',
  'Yoğun iş koşullarında çalışma',
  'Destekleyici ortam ve motivasyon',
  'Tercihler ve mevcut rol beklentisi',
  'Gelişim öncelikleri',
  '30–60–90 günlük uygulama',
  'Yapılandırılmış İK görüşmesi',
  'Senaryo tercihlerini yorumlama',
  'Puanlar ve yanıt dayanakları',
  'Raporun kapsamı ve kaynakları',
];
let activeReport = null;
function jumpReport(i) {
  document.getElementById('chapter-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function reportSection(i, subtitle, body) {
  return `<section class="report-page" id="chapter-${i}"><div class="report-kicker"><span>MİZAÇ · KAPSAMLI İK RAPORU</span><span>${String(i + 1).padStart(2, '0')} / ${REPORT_CHAPTERS.length}</span></div><span class="eyebrow">${subtitle}</span><h2>${REPORT_CHAPTERS[i]}</h2>${body}<div class="report-foot">Öz bildirimden üretilen görüşme hipotezleri · Model 0.2 / Rapor 0.3</div></section>`;
}
function ruleNote(ids, m) {
  return `<details class="rule-note"><summary>Yorumun dayanağı</summary><p>${ids.map(id => `${m[id].name}: ${m[id].score}/100 · ${id.toUpperCase()}-${m[id].band.toUpperCase()}`).join(' | ')}. Yorumlar özgün, önceden yazılmış kurallardan seçilir; işte gözlenmiş davranış olarak sunulmaz.</p></details>`;
}
function combinedInsights(m) {
  const out = [];
  const add = (condition, title, text, ids) => {
    if (condition) out.push({ title, text, ids });
  };
  add(
    m.plan.band === 'high' && m.change.band === 'high',
    'Yapılandırılmış deneme',
    'Ön planlama ile yeni yöntem deneme aynı profilde belirgin. Bir yeniliği bütünüyle serbest denemek yerine adımlarını ve kontrol noktalarını kurarak ele alma tercihi araştırılabilir. Değişim ile düzen bu kişi için birbirinin karşıtı olmak zorunda değildir.',
    ['plan', 'change']
  );
  add(
    m.evidence.band === 'high' && m.pace.band !== 'high',
    'Kararın dayanağını olgunlaştırma',
    'Kaynak incelemesi belirgin, erken ilk çıktı tercihi ise baskın değil. Karar öncesi bilgi toplama ve hazırlığın nerede biteceği konuşulmalıdır. Araştırılması gereken konu “yavaşlık” değil, yeterli bilgi eşiğinin ve ilk paylaşım zamanının nasıl belirlendiğidir.',
    ['evidence', 'pace']
  );
  add(
    m.detail.band === 'high' && m.pace.band === 'high',
    'Erken çıktı ile kontrolü birlikte isteme',
    'Kişi hem erken taslağa hem ayrıntılı kontrole değer veriyor. Bu iki tercihi nasıl sıraladığı anlaşılmalıdır: ilk sürümde hangi alanları kontrol ediyor, hangi ayrıntıları sonraki tura bırakıyor? Aynı anda her ikisini eksiksiz yapması beklenmemelidir.',
    ['detail', 'pace']
  );
  add(
    m.voice.band === 'low' && m.collab.band !== 'low',
    'Ortak çalışmada düşünerek katkı',
    'Fikir alışverişine tümüyle mesafeli görünmezken görüşünü sesli paylaşmadan önce dinlemeyi seçiyor. Toplantıda az konuşması, ortak üretime katılmak istemediği anlamına gelmez. Yazılı taslak veya kısa bire bir hazırlığın katkısını araştırın.',
    ['voice', 'collab']
  );
  add(
    m.voice.band === 'high' && m.collab.band === 'low',
    'Bağımsız hazırlık ve görünür görüş',
    'Kendi başına hazırlanma ile görüşünü açık paylaşma birlikte belirgin. Ekipteki konuşma miktarını ortak çalışma isteğiyle karıştırmayın. Görüşün hangi aşamada diğer bilgilerle zenginleştirildiği ayrıca araştırılmalıdır.',
    ['voice', 'collab']
  );
  add(
    m.initiative.band === 'high' && m.plan.band === 'low',
    'Başlatıp yolu şekillendirme',
    'İlk adımı atma ve ilerlerken yön bulma birlikte belirgin. Özellikle başkalarının işini etkileyen adımlarda haber verme noktaları ve yetki sınırları net olmalıdır. Bu örüntü tek başına girişimcilik veya sonuç alma yeteneği göstermez.',
    ['initiative', 'plan']
  );
  add(
    m.initiative.band === 'low' && m.plan.band === 'high',
    'Başlangıç çerçevesini net isteme',
    'Ön yapılandırma ve harekete geçmeden beklentiyi netleştirme birlikte belirgin. Bir işi başlatmak için gereken asgari tarif konuşulmalıdır. Sınırları açık bir işte sürekli yönlendirme isteyip istemediği gerçek örnekle ayrılabilir.',
    ['initiative', 'plan']
  );
  add(
    m.change.band === 'high' && m.detail.band === 'high',
    'Değişimi kontrol ederek ele alma',
    'Yeni yöntem deneme ve ayrıntılı kontrol aynı profilde belirgin. Değişiklik fikrinin yanında denemenin sonucunu hangi ölçütle kontrol ettiğini araştırın. Yeni bir yöntem istemesi, kontrol standartlarından vazgeçmek istediği anlamına gelmez.',
    ['change', 'detail']
  );
  add(
    m.evidence.band === 'low' && m.pace.band === 'high',
    'İlk kanaatten ilk adıma',
    'Deneyime başvurma ve erken adım atma birlikte belirgin. Tanıdık işlerde kullanılan yaklaşımın yeni veya geri dönüşü zor bir karara aynen taşınıp taşınmadığını araştırın. Kısa bir varsayım kontrolü yararlı bir deneme olabilir.',
    ['evidence', 'pace']
  );
  if (!out.length)
    out.push({
      title: 'Tek bir birleşim baskın değil',
      text: 'Önceden tanımlı birleşimlerden biri belirginleşmedi. Kişiyi genel bir tipe yerleştirmek yerine görev örneklerinden başlayın. Özellikle orta aralıktaki yanıtların görev koşuluna mı, madde yorumuna mı bağlı olduğunu görüşmede araştırın.',
      ids: ['plan', 'voice', 'evidence'],
    });
  return out;
}
function report(input) {
  const s = input || state;
  const complete =
    s.complete &&
    ITEMS.every(q => Number.isInteger(s.answers[q.id]) && s.answers[q.id] >= 1 && s.answers[q.id] <= 5) &&
    SCENARIOS.every((sc, i) => Number.isInteger(s.scenarios[i]) && !!sc.options[s.scenarios[i]]);
  if (!complete) {
    el.innerHTML = `<div class="narrow card"><h1>Rapor için formu tamamlayın.</h1><p>96 ifade ve 6 senaryo tamamlandığında kapsamlı rapor hazırlanır.</p><div class="actions"><button class="primary" onclick="page('setup')">Devam et</button><button onclick="demo()">Örnek kapsamlı raporu aç</button></div></div>`;
    return;
  }
  activeReport = s;
  const dims = score(s.answers),
    m = Object.fromEntries(dims.map(d => [d.id, d])),
    n = Object.fromEntries(dims.map(d => [d.id, NARRATIVE[d.id][d.band]])),
    role = ROLES[s.role] || ROLES.general,
    facets = facetScores(s.answers),
    q = quality(s.answers),
    insights = combinedInsights(m);
  const preferred = d => (d.band === 'high' ? d.right : d.band === 'low' ? d.left : 'İki tercih arasında');
  const salient = [...dims]
    .sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
    .filter(d => d.band !== 'mid')
    .slice(0, 3);
  const focus = role.focus;
  const demo = s.demo === true;
  const context =
    s.context ||
    (demo ? { plan: 4, detail: 4, voice: 5, collab: 4, initiative: 4, evidence: 4, change: 4, pace: 5 } : {});
  let sections = [];
  sections.push(
    reportSection(
      0,
      'Bütün profilin kısa okuması',
      `<div class="executive-highlight"><h3>${salient.length ? salient.map(d => preferred(d)).join(' · ') : 'Tek bir çalışma tercihi baskın görünmüyor'}</h3><p>Bu ifade bir kişilik tipi veya aday etiketi değildir; yanıtların yönünü kısaca özetler.</p></div><div class="report-prose"><p>${salient.length ? `Bu profilde en belirgin öz bildirim tercihleri ${salient.map(d => `<b>${d.name.toLocaleLowerCase('tr')}</b>`).join(', ')} başlıklarında görülüyor. Bu alanlar kişinin kendisini anlatırken daha net bir yön işaretlediği konulardır; daha yüksek yetkinlik gösterdiği alanlar olarak sıralanmamıştır.` : 'Boyutların çoğunda yanıtlar iki yaklaşım arasında. Bu sonuçtan çok yönlülük veya uyum becerisi çıkarılamaz; göreve göre neyin değiştiğini konuşmak gerekir.'}</p><p>${insights[0].text}</p><p><b>İK açısından odak:</b> ${role.text} Bu raporun görüşme sırası bu bağlama göre düzenlenmiştir; puanlar role göre değiştirilmemiştir.</p></div><div class="two report-inset"><div><h3>Katkı fırsatları</h3><ul>${focus.map(id => `<li>${n[id].value}</li>`).join('')}</ul></div><div><h3>Yakından araştırılacak koşullar</h3><ul>${focus.map(id => `<li>${n[id].over}</li>`).join('')}</ul></div></div><div class="report-callout"><b>İlk görüşme sorusu:</b> ${m[focus[0]].q} Ardından bu yaklaşımın işe yaramadığı bir karşı örnek isteyin.</div>`
    )
  );
  sections.push(
    reportSection(
      1,
      'Kişiyi ayrı puanlar yerine bir bütün olarak okuma',
      `<div class="report-prose">${[
        ['İşe yaklaşımı', 'plan', 'detail'],
        ['Karar ve ilerleme biçimi', 'evidence', 'pace'],
        ['İnsanlarla çalışma biçimi', 'voice', 'collab'],
        ['Başlatma ve yöntem seçimi', 'initiative', 'change'],
      ]
        .map(([title, a, b]) => `<h3>${title}</h3><p>${n[a].story} ${n[b].story}</p>`)
        .join(
          ''
        )}</div><h3>Tercihler bir araya geldiğinde</h3>${insights.map(x => `<div class="report-insight"><b>${x.title}</b><p>${x.text}</p></div>`).join('')}${ruleNote(
        DIMS.map(d => d.id),
        m
      )}`
    )
  );
  sections.push(
    reportSection(
      2,
      'Avantajı davranış örneğiyle doğrulama',
      `<p>Bu bölüm kanıtlanmış yetkinlik listesi değildir. Kişinin tercih ettiği yaklaşımın değer yaratabileceği görevleri ve tercih aşırı kullanıldığında ortaya çıkabilecek iş sorunlarını yan yana gösterir.</p><div class="tablewrap"><table><thead><tr><th>Tercih alanı</th><th>Katkı fırsatı</th><th>Aşırı kullanım / eksik sınır</th></tr></thead><tbody>${dims.map(d => `<tr><td><b>${d.name}</b><br><small>${preferred(d)}</small></td><td>${n[d.id].value}</td><td>${n[d.id].over}</td></tr>`).join('')}</tbody></table></div><div class="report-callout">İK için kullanım: Her satır için “Bunu yaptığınız somut bir olay ve sonucu neydi?” sorusunu sorun. Tercih beyanı ile gösterilmiş beceriyi ayrı kaydedin.</div>`
    )
  );
  sections.push(
    reportSection(
      3,
      'Yönetici ve çalışma arkadaşları için pratik rehber',
      `<div class="report-prose"><p>Bu kişiyle iletişimde ${m.voice.band === 'low' ? 'ön hazırlık ve görüşünü karar kapanmadan duyurma alanı açmak' : m.voice.band === 'high' ? 'görüşünü gerekçesiyle ifade edebileceği açık bir tartışma zemini oluşturmak' : 'görüşünü hangi kanalda ve ne zaman paylaşmak istediğini netleştirmek'} üzerinde durulabilir. ${m.evidence.band === 'high' ? 'Önerilerin dayanağını görünür kılmak da yararlı bir başlangıçtır.' : m.evidence.band === 'low' ? 'Önce pratik sonucu, ardından kritik dayanağı açıklamak denenebilir.' : 'Görüşme başında bu konu için beklenen bilgi ayrıntısını konuşmak yararlı olabilir.'}</p></div><div class="tablewrap"><table><tr><th>Başlık</th><th>Deneyin</th><th>Kaçının</th></tr>${dims.map(d => `<tr><td>${d.name}</td><td>${n[d.id].do}</td><td>${n[d.id].dont}</td></tr>`).join('')}</table></div><div class="report-callout"><b>Toplantı açılışı örneği:</b> “Bu görüşmenin sonunda şu kararı almamız gerekiyor. Elimizdeki bilgi ve açık kalan noktalar bunlar. Önce nasıl hazırlanmak veya görüşünü nasıl paylaşmak istersin?”</div>${ruleNote(['voice', 'evidence', 'collab'], m)}`
    )
  );
  sections.push(
    reportSection(
      4,
      'Farklı çalışma tercihleriyle karşılaşınca',
      `<p>Aşağıdaki karşılaştırmalar gerçek bir çalışma arkadaşının değerlendirmesi değildir. Kişinin farklı yaklaşımı olan biriyle iş birliği kurmasına yönelik durum örnekleridir.</p><div class="tablewrap"><table><tr><th>Karşı tarafın yaklaşımı</th><th>Bu profilde araştırılacak fark</th><th>Ortak çalışma anlaşması</th></tr><tr><td>Hemen bir ilk çıktı görmek istiyor</td><td>${n.pace.friction} ${n.evidence.decision}</td><td>“Taslak” ile “teslim” standardını ayırın. İlk taslak tarihini ve sonradan tamamlanacak alanları yazın.</td></tr><tr><td>Karar öncesi kapsamlı kanıt istiyor</td><td>${n.evidence.friction}</td><td>Zorunlu üç bilgi, kararın son zamanı ve henüz bilinmeyen noktaları birlikte belirleyin.</td></tr><tr><td>Sürekli fikir alışverişiyle ilerliyor</td><td>${n.collab.friction}</td><td>Paylaşım sıklığını ve bağımsız odak bloklarını kararlaştırın; sessizliği yorumlamak yerine sorun.</td></tr><tr><td>Önce planın ve yöntemin netleşmesini istiyor</td><td>${n.plan.friction} ${n.change.decision}</td><td>Kritik adımları sabitleyin; deneme yapılabilecek alanı ve gözden geçirme tarihini ayrı belirleyin.</td></tr></table></div><h3>Kişinin kendi iletişimini uyarlaması</h3><p>Görüşmenin başında karşı tarafın neye ihtiyacı olduğunu sorun: kısa sonuç mu, gerekçe mi, ortak tartışma mı, hazırlık zamanı mı? Kendi tercihinizin karşı taraf için de uygun olduğunu varsaymayın. Bir sonraki görüşmede yalnız bir iletişim değişikliği deneyip sonucu birlikte değerlendirin.</p>`
    )
  );
  sections.push(
    reportSection(
      5,
      'Gerekçe, karar anı ve ilk adım',
      `<div class="report-prose"><p>${n.evidence.decision} ${n.pace.decision} ${n.initiative.decision}</p><p>Bu üç tercih birlikte, kararın hangi bilgiyle, ne zaman ve kimin hareket alanında ele alınacağını konuşmak için kullanılabilir. Kararın doğru çıkacağı veya kişinin yüksek problem çözme becerisi taşıdığı bu tercihlerden hesaplanmaz.</p></div><div class="report-inset"><h3>Üç kritik soru</h3><ol><li><b>Hangi bilgi yeterli?</b> ${n.evidence.manager}</li><li><b>İlk paylaşım ne zaman?</b> ${n.pace.manager}</li><li><b>Kim hangi adımı atabilir?</b> ${n.initiative.manager}</li></ol></div><h3>Görev üzerinden örnek</h3><p>Bir raporda iki farklı toplam görülüyor ve teslim iki saat sonra. Kişiye tek bir “doğru kişilik cevabı” seçtirmek yerine; hangi kaynağı kontrol edeceğini, ne zaman haber vereceğini ve hangi koşulda geçici bir çıktı paylaşacağını sorun. Yanıtı işin riskine ve gerçek teslim gerekliliklerine göre değerlendirin.</p><p><b>Bu profile uygun deneme:</b> ${n.evidence.experiment} ${n.pace.experiment}</p>${ruleNote(['evidence', 'pace', 'initiative'], m)}`
    )
  );
  sections.push(
    reportSection(
      6,
      'Katılım, bilgi akışı ve ortak çıktı',
      `<div class="report-prose"><p>${n.collab.decision} ${n.voice.decision} Ekip içinde görünürlük ve ortak çalışma isteği aynı şey değildir: çok konuşan bir kişi bağımsız çalışmayı tercih edebilir; önce dinleyen bir kişi sık ortak değerlendirme isteyebilir.</p></div><div class="report-inset"><h3>Bu profilde konuşulacak ekip anlaşmaları</h3><ul><li><b>Paylaşım ritmi:</b> ${n.collab.manager}</li><li><b>Görüşe katılım:</b> ${n.voice.manager}</li><li><b>İş bağımlılıkları:</b> ${n.plan.manager}</li><li><b>Ortak teslim standardı:</b> ${n.detail.manager}</li></ul></div><h3>Diğerleri nasıl yanlış okuyabilir?</h3><p>${n.collab.friction} ${n.voice.friction} Bunlar ekipten alınmış geri bildirim değildir; yanlış anlamayı önlemek için konuşulacak olası durum örnekleridir.</p><div class="report-callout"><b>Ortak çalışma cümlesi:</b> “İlk taslağı hangi aşamada paylaşalım, o zamana kadar hangi bilgileri birbirimize haber verelim ve karar kapanmadan görüşünü nasıl alalım?”</div>${ruleNote(['collab', 'voice', 'plan', 'detail'], m)}`
    )
  );
  sections.push(
    reportSection(
      7,
      'Yöneticinin uygulayabileceği destek',
      `<p>Bu rehber, kişinin hangi işte başarılı olacağını söylemez. Görevi ve geri bildirim düzenini açıkça tanımlamak için yöneticiye konuşma başlıkları verir.</p><div class="tablewrap"><table><tr><th>Yönetim konusu</th><th>Bu profilde denenebilecek yaklaşım</th></tr>${dims.map(d => `<tr><td><b>${d.name}</b></td><td>${n[d.id].manager}</td></tr>`).join('')}</table></div><div class="two report-inset"><div><h3>Görev verirken</h3><p>Çıktı, son tarih, karar alanı ve haber verme noktalarını birbirinden ayırın. Kişinin hangi desteği istediğini sorun; rapordaki öneriyi kendisiyle teyit etmeden standart uygulama hâline getirmeyin.</p></div><div><h3>Geri bildirim verirken</h3><p>“Sen böylesin” yerine gözlenen olay, kişinin eylemi ve iş sonucunu konuşun. Aynı tercihin farklı bir görevde yararlı olabileceğini de ele alın; hedef kişilik puanını değiştirmek değildir.</p></div></div>`
    )
  );
  sections.push(
    reportSection(
      8,
      'Tartışma biçimi hakkında görüşme hipotezleri',
      `<p>Form, çatışma çözme becerisini ölçmez. Aşağıdaki durumlar, farklı iş tercihlerinin görüş ayrılığına nasıl dönüşebileceğini araştırmak için kullanılır.</p><div class="tablewrap"><table><tr><th>Olası ayrışma</th><th>Bu profildeki konuşma konusu</th><th>Somut çözüm adımı</th></tr><tr><td>Görüşün ne zaman paylaşılacağı</td><td>${n.voice.friction}</td><td>Karar verilmeden önce yazılı veya sözlü son bir görüş turu açın. Sessizlikten onay çıkarmayın.</td></tr><tr><td>Karar için ne kadar bilgi gerektiği</td><td>${n.evidence.friction}</td><td>Gerçek bilgi eksiğini ve tercih edilen hazırlık düzeyini ayırın; karar eşiğini birlikte yazın.</td></tr><tr><td>İlk çıktının ne kadar olgun olması gerektiği</td><td>${n.detail.friction} ${n.pace.friction}</td><td>Örnek bir çıktı üzerinden taslak ve tamamlanmış teslim ölçütlerini ayırın.</td></tr><tr><td>İşin birlikte mi bağımsız mı ilerleyeceği</td><td>${n.collab.friction}</td><td>Ortak çalışmanın amacını ve odak zamanını belirtin; iletişim sıklığını önceden kararlaştırın.</td></tr></table></div><h3>Görüşmede araştırın</h3><p>“Yakın zamanda bir çalışma arkadaşınızla yaklaşım konusunda ayrıldığınız bir olayı anlatın. Sizin öneriniz neydi, karşı taraf ne istiyordu, hangi bilgi veya anlaşma farkı azalttı?” Kişinin açıklamasına ek olarak mümkünse gerçek çıktı veya gözlenebilir sonuç isteyin.</p>${ruleNote(['voice', 'evidence', 'detail', 'pace', 'collab'], m)}`
    )
  );
  sections.push(
    reportSection(
      9,
      'Son tarih, belirsizlik ve değişen öncelikler',
      `<p>Bu form kişinin stres düzeyini, dayanıklılığını veya baskı altındaki psikolojik tepkisini ölçmez. Burada ele alınan konu, çalışma koşulları zorlaştığında açıkça kararlaştırılması yararlı olabilecek iş düzenidir.</p><div class="report-insight"><h3>Son tarih çok yakınsa</h3><p>${n.pace.manager} ${n.detail.manager}</p><p><b>İş anlaşması:</b> İlk çıktı, zorunlu kontroller ve sonradan tamamlanabilecek ayrıntılar için ayrı zamanlar belirleyin. Son teslimi etkileyen bir bilgi varsa kimin haberdar edileceğini netleştirin.</p></div><div class="report-insight"><h3>Talep veya sorumluluk belirsizse</h3><p>${n.initiative.manager} ${n.evidence.manager}</p><p><b>İş anlaşması:</b> Bilinenleri, bilinmeyenleri ve yetki içindeki ilk adımı üç ayrı satıra yazın. Belirsizlik azalmadan geri dönüşü zor bir karar verilmesi gerekip gerekmediğini ayrıca değerlendirin.</p></div><div class="report-insight"><h3>Öncelik veya yöntem değişirse</h3><p>${n.plan.manager} ${n.change.manager}</p><p><b>İş anlaşması:</b> Yeni öncelik geldiğinde hangi eski işin duracağını, hangi ara teslimin değiştiğini ve geçiş desteğini açıkça bildirin.</p></div><div class="report-callout">Görüşme sorusu: “Benzer bir durumda işinizi zorlaştıran koşul neydi, bunu nasıl fark ettiniz ve hangi somut destek fark yarattı?” Yanıttan sağlık veya psikolojik durum sonucu çıkarmayın.</div>`
    )
  );
  sections.push(
    reportSection(
      10,
      'Çalışma koşulları ile doğrudan seçilen ihtiyaçlar',
      `<h3>Tercihlerden türetilen ortam önerileri</h3><div class="report-prose"><p>Aşağıdaki ortamlar kişinin tercihlerini konuşmak için başlangıç noktasıdır. Bunların dışında çalışamayacağı veya bu koşullarda mutlaka başarılı olacağı anlamına gelmez.</p></div><ul class="environment-list">${dims.map(d => `<li><b>${d.name}:</b> ${n[d.id].environment}</li>`).join('')}</ul><h3>Katılımcının doğrudan seçtiği iki koşul</h3>${(
        s.motives || []
      )
        .filter(i => MOTIVE_TEXT[i])
        .map(
          i =>
            `<div class="report-insight"><span class="tag">Doğrudan beyan</span><h3>${MOTIVE_TEXT[i][0]}</h3><p>${MOTIVE_TEXT[i][1]}</p><p><b>Görüşme önerisi:</b> ${MOTIVE_TEXT[i][2]}</p></div>`
        )
        .join(
          ''
        )}<p>Bu iki seçim kapsamlı bir motivasyon veya değerler envanteri değildir. Ücret beklentisi, kariyer hedefi, bağlılık ve tatmin düzeyi ayrıca ölçülmemiştir.</p>`
    )
  );
  sections.push(
    reportSection(
      11,
      'Doğal / uyarlanmış profil yerine açık veri ayrımı',
      `<p>Bu raporda bir DISC doğal veya uyarlanmış profil hesaplanmaz. Ana form tipik çalışma tercihlerini toplar. Aşağıdaki isteğe bağlı bölüm, kişinin <b>mevcut görevinde kendisinden beklediğini düşündüğü yaklaşımı</b> ayrıca kaydeder. Bu, davranış gözlemi veya işverenin onayladığı rol standardı değildir.</p>${demo ? '<div class="report-callout">Örnek rapordaki rol beklentileri de kurgusaldır; karşılaştırmanın nasıl görüneceğini göstermek için eklenmiştir.</div>' : ''}<div class="tablewrap"><table><tr><th>Alan</th><th>Tipik tercih /100</th><th>Algılanan rol beklentisi /100</th><th>Görüşme notu</th></tr>${dims
        .map(d => {
          const c = context[d.id];
          return `<tr><td>${d.name}</td><td>${d.score}</td><td>${Number.isInteger(c) ? (c - 1) * 25 : 'Henüz yanıt yok'}</td><td>${!Number.isInteger(c) ? 'Karşılaştırma için ek beyan gerekiyor.' : Math.abs((c - 1) * 25 - d.score) >= 25 ? 'Farklı yön veya düzey beyanı var. Hangi görev ve beklentinin bu farkı yarattığını sorun.' : 'Beyanlar yakın görünüyor. Bu yakınlık rol uyumu veya performans kanıtı değildir.'}</td></tr>`;
        })
        .join(
          ''
        )}</table></div><p class="muted">25 puan fark yalnız görüşme işareti için tasarım eşiğidir. Farktan stres, uyumsuzluk, enerji kaybı veya başarısızlık olasılığı hesaplanmaz.</p><div class="no-print actions"><button onclick="openRoleContext()">${demo ? 'Kurgusal karşılaştırmanın açıklaması' : '8 soruluk rol beklentisi bölümünü doldur / düzenle'}</button></div><div id="role-context-panel" class="no-print"></div>`
    )
  );
  sections.push(
    reportSection(
      12,
      'Tercihi değiştirmek yerine davranış seçeneklerini artırma',
      `<p>Gelişim başlıkları düşük puanlardan seçilmez. Seçilen görüşme bağlamı ve kişinin tercihinin bir görevde işe yarayıp yaramadığı esas alınır. Aşağıdaki üç başlık ilk görüşmede katılımcıyla birlikte önceliklendirilmelidir.</p>${focus.map((id, i) => `<div class="report-insight"><span class="eyebrow">Öncelik ${i + 1} · ${m[id].name}</span><h3>Bir alternatif yaklaşımı küçük ölçekte deneyin</h3><p><b>Neden konuşuluyor?</b> ${n[id].over}</p><p><b>Deneme:</b> ${n[id].experiment}</p><p><b>Gözlem:</b> ${n[id].metric}</p><p><b>Değerlendirme sorusu:</b> Bu alternatif hangi görevde işe yaradı, hangi görevde mevcut tercih daha yararlı kaldı?</p></div>`).join('')}<div class="report-callout">Düşük veya yüksek puanı “düzeltme” hedefi koymayın. Başarı ölçütü, kişinin işin gereğine göre farklı davranışlar kullanabilmesi ve ortaya çıkan somut iş sonucudur.</div>`
    )
  );
  sections.push(
    reportSection(
      13,
      'Yönetici / mentor ile takip düzeni',
      `<div class="tablewrap"><table><tr><th>Dönem</th><th>Yapılacak çalışma</th><th>Somut çıktı</th><th>Gözden geçirme</th></tr><tr><td>İlk 30 gün</td><td>Raporu katılımcıyla okuyun. Uyan ve uymayan anlatımları iş örnekleriyle ayırın. ${n[focus[0]].experiment}</td><td>Bir görev için mevcut yöntem, alternatif deneme ve başlangıç gözlemi.</td><td>${n[focus[0]].metric}</td></tr><tr><td>31–60. gün</td><td>Aynı yaklaşımı ikinci bir görevde sınayın. ${n[focus[1]].experiment}</td><td>İki görevden karşılaştırılabilir çıktı; yararlı olan bir iletişim veya kontrol anlaşması.</td><td>${n[focus[1]].metric}</td></tr><tr><td>61–90. gün</td><td>Hangi koşulda hangi yöntemin seçileceğini birlikte yazın. ${n[focus[2]].experiment}</td><td>Kişiye ve göreve özgü bir sayfalık çalışma anlaşması.</td><td>${n[focus[2]].metric}</td></tr></table></div><h3>Takip görüşmesinin dört sorusu</h3><ol><li>Hangi davranışı hangi görevde denediniz?</li><li>Sonuçta gözlenebilir ne değişti?</li><li>İşin koşullarında, sonucu açıklayabilecek başka ne değişti?</li><li>Bu yaklaşımı nerede sürdüreceksiniz, nerede kullanmayacaksınız?</li></ol><p>Plan bir performans taahhüdü değildir. Ölçülecek çıktı işin niteliğine göre seçilmeli; aynı görev için ölçüt tanımı takip boyunca korunmalıdır.</p>`
    )
  );
  sections.push(
    reportSection(
      14,
      'Karar yerine kanıt toplamayı destekleyen rehber',
      `<p>Aynı rol için tüm katılımcılara aynı çekirdek sorular ve değerlendirme çıpaları uygulanmalıdır. Kişiye özgü takip soruları aşağıdaki hipotezleri açıklığa kavuşturmak içindir; kişilik puanıyla birleştirilen toplam aday puanı üretilmez.</p>${focus.map((id, i) => `<div class="report-insight"><h3>${i + 1}. ${m[id].name}</h3><p><b>Çekirdek soru:</b> ${m[id].q}</p><p><b>Öz bildirim hipotezi:</b> ${n[id].decision}</p><p><b>Takip:</b> Kendi yaptığınız adım tam olarak neydi? Karşı bir yaklaşım ne olabilirdi? Tercihinizin işe yaramadığı bir olay oldu mu?</p><p><b>İş örneğiyle doğrulama:</b> ${JOBMAP[id][2]}</p></div>`).join('')}<div class="tablewrap"><table><tr><th>Kanıt düzeyi</th><th>Görüşmede kaydedilecek bilgi</th></tr><tr><td>0 · Örnek yok</td><td>Yalnız genel kanaat veya varsayımsal yanıt.</td></tr><tr><td>1 · Olay var</td><td>Bir olay anlatıldı; kişinin kendi eylemi veya sonucu belirsiz.</td></tr><tr><td>2 · Somut eylem</td><td>Kişinin neyi nasıl yaptığı ve olayın bağlamı açık.</td></tr><tr><td>3 · Somut eylem ve sonuç</td><td>Kendi eylemi ve gözlenebilir sonucu açık; sonucu etkileyen diğer koşullar da konuşuldu.</td></tr></table></div><p>Bu çıpa yalnız anlatımdaki kanıtı düzenler; iş becerisi için göreve özgü ayrı ölçüt gerekir.</p><h3>Görüşme notu</h3><p>Durum / görev: __________________________________________________</p><p>Kendi eylemi / sonuç: ______________________________________________</p><p>Karşı örnek / doğrulama ihtiyacı: _____________________________________</p>`
    )
  );
  sections.push(
    reportSection(
      15,
      'Tercih sorusu ile gerçek davranışı ayırma',
      `<p>Altı senaryoda doğru-yanlış puanı yoktur. Seçenekler kişilik puanına eklenmez. Bu bölüm tercih ile o tercihi uygulayabilme becerisini ayırarak görüşmeye devam eder.</p>${SCENARIOS.map(
        (sc, i) => {
          const o = sc.options[s.scenarios[i]],
            d = m[o[1]],
            opposite = (o[3] === -1 && d.band === 'high') || (o[3] !== -1 && d.band === 'low');
          return `<div class="report-insight"><span class="eyebrow">Senaryo ${i + 1} · ${sc.title}</span><p><b>Durum:</b> ${sc.text}</p><p><b>Seçilen yaklaşım:</b> ${o[0]}</p><p><b>Öz bildirimle birlikte okuma:</b> ${opposite ? 'Ana formdaki yön ile burada seçilen ilk yaklaşım farklılaşıyor. Bunu tutarsızlık diye etiketlemeyin; senaryonun hangi koşulunun farklı tercihe yol açtığını sorun.' : `Bu seçim ${d.name.toLocaleLowerCase('tr')} başlığındaki görüşmeye ek bir bağlam sağlar. Tek bir seçenek, o yaklaşımın her durumda kullanılacağını göstermez.`}</p><p><b>Takip:</b> Bu yaklaşımı seçmenizde hangi koşul etkiliydi? İkinci adımınız ne olurdu? Benzer bir gerçek olayda ne yaptınız?</p></div>`;
        }
      ).join('')}`
    )
  );
  sections.push(
    reportSection(
      16,
      'Puan grafiği, alt başlıklar ve cevap izi',
      `<p>Puanlar 1–5 yanıt ortalamalarının 0–100 dönüşümüdür. Yüzdelik dilim veya başarı olasılığı değildir. İki uç da davranış tercihini anlatır.</p>${dims
        .map(d => {
          const fs = facets.filter(f => f.dim === d.id),
            rows = ITEMS.filter(x => x.dim === d.id),
            vals = rows.map(x => (x.reverse ? 6 - s.answers[x.id] : s.answers[x.id]));
          return `<article class="score-evidence"><div class="row"><h3>${d.name}</h3><b>${d.score} / 100</b></div><div class="track"><i style="left:${d.score}%"></i></div><div class="ends"><span>${d.left}</span><span>${d.right}</span></div><div class="facet-pair">${fs.map(f => `<span>${f.name}: <b>${f.score}/100</b></span>`).join('')}</div><p class="muted">12/12 yanıt · Kodlanmış yanıt aralığı ${Math.min(...vals)}–${Math.max(...vals)} /5. Alt başlıklar kavramsaldır; ayrı alt ölçek oldukları henüz doğrulanmadı.</p>${Math.min(Math.abs(d.score - 35), Math.abs(d.score - 65)) <= 5 ? '<p class="report-callout">Puan geçici yorum sınırına yakın. Küçük bir yanıt değişimi bant metnini değiştirebilir; bunu kesin bir kategori gibi okumayın.</p>' : ''}<details><summary>12 yanıtı ve puan anahtarını gör</summary><div class="tablewrap"><table><tr><th>Madde</th><th>İfade</th><th>Yanıt</th><th>Kodlanmış</th></tr>${rows.map(x => `<tr><td>${x.id}</td><td>${x.text}</td><td>${s.answers[x.id]}</td><td>${x.reverse ? 6 - s.answers[x.id] : s.answers[x.id]}${x.reverse ? ' · ters' : ''}</td></tr>`).join('')}</table></div></details></article>`;
        })
        .join(
          ''
        )}<h3>Yanıt örüntüsü kontrolleri</h3>${q.flags.length ? q.flags.map(f => `<p>${f}</p>`).join('') : '<p>Tanımlı kaba kontroller eşik aşmadı. Bu, yanıtların doğruluğunu veya ölçeğin güvenirliğini kanıtlamaz.</p>'}<p>Tek seçeneğe yoğunlaşma ve benzer içerikli ters maddeler arasındaki farklar yalnız görüşmede açıklama için kullanılır; dürüstlük veya aldatma puanı değildir.</p>`
    )
  );
  sections.push(
    reportSection(
      17,
      'Raporu doğru sınırlar içinde kullanma',
      `<div class="report-prose"><p><b>Ölçülen:</b> Kişinin 96 ifadede bildirdiği tipik çalışma tercihleri. Ek bilgi olarak altı senaryo tercihi ve iki destekleyici koşul seçimi. İsteğe bağlı rol beklentisi bölümü ayrıca etiketlenir.</p><p><b>Ölçülmeyen:</b> Genel yetenek, liderlik başarısı, iş performansı, dürüstlük, psikolojik sağlık, stres toleransı ve işe alınma uygunluğu. Gözlemci değerlendirmesi veya bağımsız performans verisi bulunmaz.</p><p><b>Bilimsel durum:</b> Mizaç özgün ve henüz doğrulanmamış bir araştırma formudur. Güvenirlik, ölçüm hatası, norm, faktör yapısı ve işle ilişki kanıtı olmadan bu rapor eleme veya aday sıralama için kullanılamaz.</p><p><b>Puanlama:</b> Ters madde = 6 − yanıt. Boyut = (12 madde ortalaması − 1) × 25. Geçici yorum bantları: 35 altı sol, 35–65 arası orta, 65 üstü sağ. Bunlar normlara dayanan eşikler değildir. Rapor metinleri 24 temel anlatım dalı ve çok boyutlu birleşim kurallarından seçilir.</p><p><b>DISC ile ilişkisi:</b> Bu, bir DISC testi veya lisanslı DISC raporu değildir. DISC raporlarından yalnız içerik kapsamı ve kullanım biçimi açısından yararlanıldı; D/i/S/C skoru, çarkı, doğal/uyarlanmış profil veya o ürünlerin soru/metinleri kullanılmadı.</p><p><b>Kaynak incelemesi:</b> <a href="https://s3-us-west-1.amazonaws.com/download.ttisi.com/sample-reports/man_m.pdf" target="_blank" rel="noopener">TTI Management–Staff örnek raporu</a>; <a href="https://www.everythingdisc.com/kit-resources" target="_blank" rel="noopener">Everything DiSC kaynak sayfası</a>; <a href="https://www.apa.org/ed/accreditation/about/policies/personnel-selection-procedures.pdf" target="_blank" rel="noopener">SIOP seçim araçlarının doğrulanması ilkeleri</a>.</p><p><b>İzlenebilirlik:</b> Form sürümü 0.2, rapor sürümü 0.3. Yanıtlar değişmeden aynı yorum kuralları çalışır. Bu rapordaki kişisel bilgiler ve yanıtlar bu tarayıcıda tutulur; bir AI servisine gönderilmez.</p></div>`
    )
  );
  el.innerHTML = `<div class="report-toolbar no-print"><div><span class="eyebrow">${demo ? 'Kurgusal örnek rapor' : 'Kişisel çalışma tercihleri'}</span><h1>Kapsamlı İK raporu.</h1><p>${esc(s.alias || 'İsimsiz katılımcı')} · ${role.name} · 18 bölüm</p></div><div class="actions"><button class="primary" onclick="window.print()">Tam raporu PDF olarak kaydet</button><button onclick="exportNarrative()">Rapor metni · HTML</button><button onclick="exportNarrativeJSON()">Rapor verisi · JSON</button><button onclick="exportPilotRow(${demo})">Pilot satırı · CSV</button></div></div><div class="report-notice no-print">Araştırma formu · Kişiye özgü anlatımlar öz bildirime dayalı görüşme hipotezleridir. DISC sonucu veya doğrulanmış işe alım değerlendirmesi değildir.</div><div class="report-layout"><aside class="report-nav no-print"><b>Rapor içeriği</b>${REPORT_CHAPTERS.map((t, i) => `<button onclick="jumpReport(${i})"><span>${String(i + 1).padStart(2, '0')}</span> ${t}</button>`).join('')}<button onclick="page('research')">Araştırma merkezine git →</button></aside><div class="report-book"><div class="report-cover"><span class="eyebrow">MİZAÇ / İŞTE DAVRANIŞ HARİTASI</span><h1>Birlikte nasıl<br>daha iyi çalışabiliriz?</h1><p>Davranış tercihleri, iletişim rehberi<br>ve gelişim görüşmesi raporu</p><div class="cover-identity"><b>${esc(s.alias || 'İsimsiz katılımcı')}</b><span>${role.name}</span><span>Form 0.2 · Rapor 0.3 · ${new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul' }).format(new Date())}</span></div><div class="cover-lines">${dims.map(d => `<div><span>${d.name}</span><i style="width:${d.score}%"></i></div>`).join('')}</div><small>${demo ? 'Kurgusal katılımcı ve örnek veriler.' : 'Katılımcı öz bildirimi.'} Araştırma sürümü; işe alım kararı için kullanılamaz.</small></div>${sections.join('')}</div></div><div class="actions no-print"><button onclick="page('setup')">Yanıtları gözden geçir</button><button onclick="clearData()">Bu cihazdaki verilerimi sil</button></div>`;
  window.scrollTo(0, 0);
}
function openRoleContext() {
  if (activeReport?.demo) {
    alert(
      'Bu örnekte gösterilen 8 rol beklentisi kurgusaldır. Kendi tamamlanmış raporunuzda mevcut görevinizde sizden beklenen yaklaşımı ayrıca belirtebilirsiniz.'
    );
    return;
  }
  const panel = document.getElementById('role-context-panel');
  panel.innerHTML = `<div class="card"><h3>Mevcut rol beklentisi · isteğe bağlı öz bildirim</h3><p>Son dört haftadaki görevinizde sizden hangi yaklaşımın beklendiğini düşünüyorsunuz? Bu bölüm işveren tarafından doğrulanmış bir rol standardı değildir. Yeni bir göreviniz yoksa boş bırakabilirsiniz.</p>${DIMS.map(d => `<label for="context-${d.id}">${d.name}</label><select id="context-${d.id}"><option value="">Yanıtlamıyorum / bilgim yok</option>${[1, 2, 3, 4, 5].map(v => `<option value="${v}" ${state.context?.[d.id] === v ? 'selected' : ''}>${v} · ${v === 1 ? d.left : v === 5 ? d.right : v === 3 ? 'İki yaklaşım arasında' : v === 2 ? 'Sol yaklaşıma daha yakın' : 'Sağ yaklaşıma daha yakın'}</option>`).join('')}</select>`).join('')}<div class="actions"><button class="primary" onclick="saveRoleContext()">Karşılaştırmayı rapora ekle</button><button onclick="document.getElementById('role-context-panel').innerHTML=''">Kapat</button></div></div>`;
}
function saveRoleContext() {
  state.context = {};
  DIMS.forEach(d => {
    const v = document.getElementById('context-' + d.id).value;
    if (v) state.context[d.id] = Number(v);
  });
  save();
  report();
  setTimeout(() => jumpReport(11), 0);
}
function exportNarrative() {
  if (!activeReport) return;
  const content = document.querySelector('.report-book').innerHTML;
  downloadText(
    'mizac-kapsamli-ik-raporu.html',
    '<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mizaç · Kapsamlı İK Raporu</title><style>body{max-width:900px;margin:40px auto;padding:20px;color:#183b39;font:16px/1.65 Arial,sans-serif}h1,h2,h3{line-height:1.2}h1{font-size:40px}h2{font-size:29px}h3{font-size:20px}table{width:100%;border-collapse:collapse;font-size:14px}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}.report-page{margin:40px 0;padding:25px 0;border-top:2px solid #246458}.report-kicker,.report-foot,.muted,.eyebrow{color:#61746f;font-size:12px}.report-kicker{display:flex;justify-content:space-between}.report-foot{margin-top:25px}.report-callout,.report-inset,.executive-highlight{padding:20px;background:#edf3e6;margin:20px 0}.report-insight{margin:24px 0}.no-print{display:none}.track{height:7px;background:#dde8d6;position:relative;margin:20px 0}.track i{position:absolute;width:12px;height:12px;border-radius:50%;background:#246458;top:-3px}.ends{display:flex;justify-content:space-between;font-size:12px}.facet-pair span{display:block}.cover-identity span{display:block}.report-cover{padding:35px 0}.cover-lines{display:none}.score-evidence{border-bottom:1px solid #ddd;padding:20px 0}@media print{.report-cover{break-after:page}.report-page{break-before:page;border:0;margin:0}.report-insight,table tr,.score-evidence{break-inside:avoid}body{margin:0;font-size:11pt}details{display:none}}</style><body>' +
      content +
      '</body></html>',
    'text/html;charset=utf-8'
  );
}
function exportNarrativeJSON() {
  if (!activeReport) return;
  downloadText(
    'mizac-kapsamli-ik-raporu.json',
    JSON.stringify(
      {
        formVersion: '0.2',
        reportVersion: '0.3',
        status: 'unvalidated-research',
        participant: activeReport,
        dimensionScores: score(activeReport.answers).map(d => ({ id: d.id, score: d.score, band: d.band })),
        chapters: Array.from(document.querySelectorAll('.report-page')).map((p, i) => ({
          title: REPORT_CHAPTERS[i],
          text: p.innerText,
        })),
        limitations: 'DISC sonucu veya işe alım kararı değildir; öz bildirime dayanan görüşme hipotezleri.',
      },
      null,
      2
    ),
    'application/json'
  );
}
