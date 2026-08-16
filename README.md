# dsh-usage-tracker

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) için kullanım ve maliyet takip eklentisi. Build ve npm bağımlılığı gerektirmez (saf ESM JavaScript).

[English](README.en.md)

## Özellikler

- **Sol altta "Kullanım" butonu** (Ayarlar'ın üstünde) — canlı toplam maliyet rozeti ve **peak/off-peak sinyali**: yeşil = off-peak, mavi = peak.
- **Panel** — toplam maliyet, çağrı sayısı, DeepSeek peak/off-peak dağılımı, sağlayıcı bazında kullanım ve son çağrılar.
- **"Bu oturum" satırı** — yazı kutusunun altında oturum maliyeti.
- **Ayarlar sayfası** — detaylı döküm, geçmişi geri yükleme ve temizleme.
- **Tüm sağlayıcılar** — DeepSeek resmi peak/off-peak (Pekin saati, USD); diğerleri sabit USD tahmini. Codex/ChatGPT aboneliği dahil.
- **Dil** — Türkçe / İngilizce / 中文 (panel başlığındaki dil butonuyla değişir).
- **Kalıcılık** — veriler `~/.dsh/usage-tracker.json` dosyasında tutulur, yeniden başlatınca korunur.

## Kurulum

```bash
dsh plugin --profile web add link:/path/to/dsh-usage-tracker
```

`dsh web`'i yeniden başlat ve sayfayı yenile.

> Yayınlanırsa: `dsh plugin --profile web add dsh-usage-tracker`

## Geliştirme

```bash
node --test 'tests/*.test.js'   # birim + entegrasyon testleri
npm run check                    # sözdizimi kontrolü
```

## Lisans

MIT
