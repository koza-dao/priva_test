# MVPBoard - Aztec ZKP Job Platform (v0.86.0)

Bu proje, Aztec Network üzerinde gizlilik korumalı bir iş ilanı ve başvuru platformunu Zero-Knowledge Proof (ZKP) teknolojisi ile gerçekleştirir. Aztec v0.86.0 versiyonu için optimize edilmiştir.

## Proje Yapısı

```
mvp_project/
├── src/                          # Kaynak kod
│   └── main.nr                   # Ana Noir kontratı
├── target/                       # Derleme çıktıları
│   └── mvp_project-MVPBoard.json # Kontrat artifact'ı
├── contracts/                    # TypeScript arayüzleri
├── package.json                  # Bağımlılıklar
├── zkp-job-platform-aztec.ts     # Aztec SDK entegrasyonu
├── deploy-aztec.ts               # Deploy script'i
└── Nargo.toml                    # Proje konfigürasyonu
```

## Özellikler

- **İş İlanı Yayınlama**: İş veren, pozisyon bilgilerini gizlilik korumalı şekilde yayınlar
- **Özgeçmiş Gönderimi**: Adaylar, özgeçmişlerini gizli tutarak sisteme kaydeder
- **Gizli Eşleştirme Algoritması**: İlan ve özgeçmiş arasındaki eşleşme skoru hesaplanır
- **Gizli Veri Depolama**: Tüm veriler şifrelenmiş olarak zincirde saklanır

## Teknolojiler

- [Noir](https://noir-lang.org/): Aztec Network'ün resmi ZKP programlama dili
- [Aztec Protocol v0.86.0](https://docs.aztec.network/): Gizlilik odaklı Layer 2 çözümü
- [TypeScript](https://www.typescriptlang.org/): Tip güvenlikli JavaScript
- [Node.js](https://nodejs.org/): JavaScript runtime

## Kurulum

### Gereksinimler

- Node.js >= 18.x ve <= 20.17.x
- Docker
- Aztec CLI

### Adımlar

1. Aztec araçlarını yükleyin:

```bash
bash -i <(curl -s https://install.aztec.network)
aztec-up v0.86.0
```

2. Projeyi klonlayın ve bağımlılıkları yükleyin:

```bash
git clone https://github.com/yourusername/mvp_project.git
cd mvp_project
npm install
```

3. Kontratı derleyin:

```bash
aztec-nargo compile
```

4. Kontratı deploy edin:

```bash
npm run deploy
```

## Kullanım

### İş İlanı Yayınlama

```typescript
// Platform örneği oluştur
const platform = await initializeZKPPlatformAztec({});

// İş ilanı yayınla
const result = await platform.publishJob(
  123,  // title (Field olarak)
  456,  // company (Field olarak)
  789   // requirements (Field olarak)
);

console.log("İş ilanı hash:", result.jobHash);
```

### Özgeçmiş Gönderme

```typescript
// Özgeçmiş gönder
const result = await platform.submitResume(
  111,  // name (Field olarak)
  222,  // skills (Field olarak)
  5     // experience (yıl)
);

console.log("Özgeçmiş hash:", result.resumeHash);
```

### Eşleştirme Skoru Hesaplama

```typescript
// Eşleştirme skoru hesapla
const result = await platform.computeMatch(
  789,  // job requirements (Field olarak)
  222,  // candidate skills (Field olarak)
  5     // experience (yıl)
);

console.log("Eşleştirme skoru:", result.matchScore);
```

## Gizlilik Özellikleri

- **Private Functions**: Aztec Network'ün `#[aztec(private)]` özelliği ile işlem verilerini koruma
- **Şifrelenmiş Storage**: Veriler zincirde şifrelenmiş olarak saklanır
- **Zero-Knowledge İspatları**: İşlemlerin geçerliliği ispat edilirken özel veriler açığa çıkmaz
- **Seçici Şeffaflık**: Belirli taraflar için kısmi veri görünürlüğü sağlanabilir

## Lisans

MIT
