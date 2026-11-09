# Mimari ve kurulum

Tarayıcıdaki hazırlık alanı, vaka motorları ve modüller `web/` dizinindedir. `scripts/prepare-workspace.mjs` ortak katalogları üretir ve arayüzü derlemenin statik dosya dizinine kopyalar. Üretim giriş noktası Vinext üzerinde Cloudflare Worker olarak derlenir. `/api/pilot` işlemlerinin veri kaynağı D1 ve R2 bağlarıdır.

| Veri | Saklandığı yer | Erişim |
| --- | --- | --- |
| Atölye yanıtı, plan, CV metni, deneyim ve prova | Tarayıcı depolaması | Aynı tarayıcı profili |
| Açıkça hesaba kaydedilen hazırlık yedeği | D1 | Hazırlık kaydının sahibi |
| Vaka dosyası ve revizyonlar | R2 ve D1 teslim üst bilgisi | Teslim sahibi, pilot yöneticisi ve ilgili atanmış değerlendirici |
| Yayımlanan İK görüşü | D1, teslim kimliğine bağlı | Yetkili teslim erişimi |
| Adayın özel dosya karşılaştırması ve görüşme özeti | D1 | Teslim sahibi |
| Değerlendirici taslağı | D1 ve sekme taslağı | Taslağın yazarı ve geçerli atama |

CV metni hesap yedeğinden çıkarılır. Cihaz yedeği yerel kayıtları taşıyabilir. Bir cihazdan diğerine aktarmak için uygulamadaki yedekleme veya hesaba kaydetme seçenekleri kullanılır.

## Yerel çalışma

Node.js 24 ile proje kökünde `npm run demo` çalıştır ve [yerel demoyu](http://127.0.0.1:5173) aç. Aday, İK değerlendiricisi ve pilot yöneticisi rollerini [demo senaryosuyla](DEMO.md) dene.

Geliştirme ve üretim çıktısını doğrulamak için proje kökünde sırayla çalıştır.

```sh
npm ci
npm test
python3 check-office-packs.py
npm run build
```

Office dosyası kontrolü için Python 3 gerekir. Üretim derlemesi `dist/` altında oluşur.

## Barındırılan pilotu yapılandırma

1. Yeni barındırma projenizde `.openai/hosting.json` dosyasına kendi proje kimliğinizi ekleyin. Şablonda `DB` ve `BUCKET` bağları vardır.
2. D1 üzerinde `drizzle/` SQL migration dosyalarını sıralı uygulayın. R2 dosya alanını özel tutun.
3. Worker ortamına `PILOT_OWNER_EMAIL` değerini ekleyin. İlk kayıtta bu adresle eşleşen kullanıcı yönetici rolü alır. Var olan kullanıcı rolleri D1'deki kayıtlardan okunur.
4. Pilot API'yi kimlik doğrulaması yapan bir ağ geçidinin arkasında çalıştırın. Ağ geçidi istemciden gelen `oai-authenticated-user-*` başlıklarını temizleyip kendi doğruladığı kullanıcı bilgilerini eklemelidir.
5. `npm run build` ile dağıtım çıktısını üretin. Sonra ayrı aday ve değerlendirici hesaplarıyla [canlı pilot kabul senaryosunu](../PREPILOT-ACCEPTANCE.md) yürütün.

Yerel demo yalnız loopback adresine bağlanır. Sabit sentetik roller ve bellek içi kayıtlar kullanır. Bulut pilotu için Worker girişini ve doğrulanmış kimlik ağ geçidini kullanın.

## İçerik ve bakım

Rol sorusu düzenlemek için `content/` kaynaklarını güncelle ve `node build-role-bank.cjs` çalıştır. Genel katalogları `node scripts/prepare-workspace.mjs` üretir. Kurgu vakaların sürümünü değiştirirken eski teslimin ait olduğu vaka sürümünü koru. Ayrıntılı eski tasarım kararları [geliştirme geçmişinde](../HISTORY.md) bulunur.

Üçüncü taraf kaynak bildirimleri [Sites Vite eklentisinin lisansı](../scripts/vite/sites-vite-plugin.LICENSE) ve [stil kaynağının lisansında](../vendor/shadcn-tailwind-4.13.0.LICENSE.md) bulunur.
