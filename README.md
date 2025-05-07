# MVP Project: ZKP-Enabled Web3 Job Application Platform

## 🚀 Proje Amacı

Bu proje, Web3 ekosistemindeki işverenler ve geliştiriciler arasında **gizlilik** ve **doğrulanabilirlik** unsurlarını bir araya getiren bir iş ilanı ve başvuru platformu sunmayı amaçlar. Ana hedefler:

1. **Gizlilik**: Kullanıcılar (işveren ve aday), kimlik veya kişisel verilerini doğrudan ifşa etmeden iş ilanı yayınlayıp başvuru yapabilsin.
2. **Doğrulanabilirlik**: Hem iş ilanı hem de CV içeriği, Zero-Knowledge Proof (ZKP) kullanılarak doğrulanabilir hale getirilsin.
3. **Eşleştirme**: Adayların beceri profilleri ile iş gereksinimleri arasında ZKP tabanlı puanlama mekanizması çalışsın.
4. **Karşılıklı Onay**: İşveren ve aday son adımda zincir üstünde onay verirse, taraflar arasında gerçek veriler paylaşılabilsin.

## 🏗️ Nasıl Çalışıyor?

1. **Veri Modelleri**  
   - `JobPost`: İş ilanı içeriği ve işveren sırrı (secret)  
   - `Resume` (CV): Adayın özgeçmişi ve aday sırrı  
   - `Application`: Başvuru işleminin commitment’ı  
   - `Approval`: Karşılıklı onay commitment’ı  

2. **Modüler Noir Kaynakları**  
   - `job_publisher.nr`: İş ilanını hash’leyen fonksiyon  
   - `cv_publisher.nr`: Özgeçmişi hash’leyen fonksiyon  
   - `apply.nr`: Başvuru commitment kontrolü  
   - `match.nr`: İş-özgeçmiş eşleştirme puanı hesaplama  
   - `approve.nr`: Onay commitment kontrolü  
   - `main.nr`: Tüm modülleri birleştiren ana devre  

3. **ACIR Derleme ve Solidity Verifier**  
   ```bash
   nargo compile --acir target/mvp.acir
   nargo target/solidity-verifier target/mvp.acir --out contracts/MVPVerifier.sol
   ```

4. **Akıllı Kontrat** (`MVPBoard.sol`)  
   - `publishJob`, `submitResume`, `apply`, `approve` fonksiyonları  
   - Her biri ZKP doğrulaması sonrası ilgili event’i emit eder

5. **Deployment Script** (`scripts/deploy.js`)  
   - Hardhat kullanarak kontrat deploy edilir

## 📂 Proje Dosya Yapısı

```
mvp_project/
├── job_publisher.nr
├── cv_publisher.nr
├── apply.nr
├── match.nr
├── approve.nr
├── main.nr
├── nargo.toml
├── contracts/
│   ├── MVPVerifier.sol
│   └── MVPBoard.sol
└── scripts/
    └── deploy.js
└── README.md
```

## ⚙️ Kurulum ve Çalıştırma

1. **Noir** ortamı:
   ```bash
   nargo compile --acir target/mvp.acir
   ```
2. **Solidity Verifier**:
   ```bash
   nargo target/solidity-verifier target/mvp.acir --out contracts/MVPVerifier.sol
   ```
3. **Node.js & Hardhat**:
   ```bash
   npm install
   npx hardhat run scripts/deploy.js --network <network>
   ```

## 🎯 Sonuç

Bu MVP ile:
- İşverenler güvenli ve gizli iş ilanı yayınlayabilir.
- Adaylar özgeçmişlerini gizli tutarak başvuru yapabilir.
- Platform, ZKP ile yetkinlik doğrulaması ve puanlama sunar.
- Son aşamada karşılıklı onayla kişi bilgileri paylaşılabilir.

Daha fazla geliştirme için modüller kolayca genişletilebilir.
