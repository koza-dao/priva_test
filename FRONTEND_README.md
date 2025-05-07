# ZKP Job Platform Frontend Integration

Bu dosya, ZKP-Enabled Web3 Job Application Platform'un önyüz entegrasyonu için oluşturulan dosyaları ve kullanımlarını açıklar.

## Dosya Yapısı

```
zkp-job-platform/
├── src/                          # Noir Zero-Knowledge devreleri
├── contracts/                    # Ethereum akıllı kontratları
├── scripts/                      # Deployment ve test scriptleri
├── zkp-job-platform.js           # Ana entegrasyon kütüphanesi
├── zkp-job-platform-usage.js     # Kütüphane kullanım örneği
├── zkp-job-platform.html         # Demo arayüzü
├── FRONTEND_README.md            # Bu dosya
├── PROJECT_STRUCTURE.md          # Proje yapısı açıklaması
└── README.md                     # Ana proje dökümantasyonu
```

## Entegrasyon Dosyaları

### 1. zkp-job-platform.js

Bu dosya, Noir ZKP devreleri ve Ethereum akıllı kontratları ile etkileşime geçmek için gerekli tüm fonksiyonları içeren ana JavaScript kütüphanesini içerir. Temel olarak aşağıdaki yetenekleri sağlar:

- ZKP devrelerini yükleme ve başlatma
- İş ilanı yayınlama ve bu süreci ZKP ile doğrulama
- Özgeçmiş gönderme ve bu süreci ZKP ile doğrulama
- İş başvurusu yapma ve eşleşme puanını hesaplama
- Karşılıklı onay süreci ve gizli bilgilerin paylaşımı

### 2. zkp-job-platform-usage.js

Bu dosya, ana kütüphanenin nasıl kullanılacağını gösteren bir örnek uygulama içerir. Aşağıdaki özellikleri gösterir:

- MetaMask cüzdan bağlantısı
- Form verilerini yakalama ve ZKP devreleri için uygun formata dönüştürme
- İş ilanı, özgeçmiş, başvuru ve onay süreçlerini yönetme
- Blockchain olaylarını dinleme ve kullanıcı arayüzünde gösterme

### 3. zkp-job-platform.html

Bu dosya, sistemin işleyişini göstermek için basit bir web arayüzü sağlar. Aşağıdaki bölümleri içerir:

- İşveren: İş ilanı yayınlama formu
- Aday: Özgeçmiş gönderme formu
- Başvuru: İş başvurusu yapma formu
- Onay: Karşılıklı onay süreci
- Blockchain olayları: Sistem üzerindeki tüm etkinlikleri gösterir

## Kurulum ve Kullanım

### Gereksinimler

- Node.js ve npm
- MetaMask cüzdan eklentisi
- Noir derleyicisi (ZKP devreleri için)

### Kurulum Adımları

1. Gerekli paketleri yükleyin:
   ```bash
   npm install ethers@5.7.2 @noir-lang/noir_js @noir-lang/backend_barretenberg
   ```

2. Noir devrelerini derleyin:
   ```bash
   nargo compile --acir target/mvp.acir
   ```

3. Devreleri JSON formatına dönüştürün:
   ```bash
   mkdir -p circuits
   nargo compile-json ./src/main.nr -o ./circuits/main.json
   nargo compile-json ./src/job_publisher.nr -o ./circuits/job_publisher.json
   nargo compile-json ./src/cv_publisher.nr -o ./circuits/cv_publisher.json
   nargo compile-json ./src/apply.nr -o ./circuits/apply.json
   nargo compile-json ./src/match.nr -o ./circuits/match.json
   nargo compile-json ./src/approve.nr -o ./circuits/approve.json
   ```

4. Akıllı kontratları dağıtın:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

5. `zkp-job-platform.js` dosyasında dağıtılan kontrat adresini güncelleyin:
   ```javascript
   const platformConfig = {
     provider,
     mvpBoardAddress: 'YOUR_CONTRACT_ADDRESS', // Buraya dağıtılan kontrat adresini yazın
     mvpBoardABI: MVPBoardABI
   };
   ```

6. Web sayfasını bir sunucuda çalıştırın:
   ```bash
   npx serve .
   ```

### Kullanım Senaryosu

Adım adım bir kullanım senaryosu:

1. `zkp-job-platform.html` sayfasını tarayıcınızda açın
2. "Connect Wallet" butonu ile MetaMask'a bağlanın
3. İşveren rolünde:
   - İş detaylarını doldurun ve bir gizli anahtar belirleyin
   - "Post Job" butonuna tıklayarak ilanı yayınlayın
   - Oluşturulan "Job Commitment" değerini not alın
4. Aday rolünde:
   - Özgeçmiş bilgilerinizi doldurun ve bir gizli anahtar belirleyin
   - "Submit Resume" butonuna tıklayarak özgeçmişi gönderin
   - Oluşturulan "Resume Commitment" değerini not alın
5. Başvuru yapın:
   - "Job Commitment" ve "Resume Commitment" değerlerini girin
   - Bir başvuru gizli anahtarı belirleyin
   - "Apply" butonuna tıklayın
   - Eşleşme puanını ve "Application Commitment" değerini görüntüleyin
6. Karşılıklı onay verin:
   - Her iki taraf da kendi gizli anahtarlarını girin
   - "Approve" butonuna tıklayın
   - Onay tamamlandığında, iletişim bilgilerini güvenli bir şekilde paylaşabilirsiniz

## Notlar ve Uyarılar

- Bu dosyalar bir demo için hazırlanmıştır ve güvenlik açısından production ortamında kullanım için optimize edilmemiştir.
- Gerçek bir uygulamada, kullanıcı gizli anahtarları daha güvenli bir şekilde saklanmalıdır.
- Frontend'de oluşturulan ZKP'ler, işlem maliyeti ve performans açısından gerçek uygulamalarda backend'de oluşturulabilir.
- İletişim bilgileri paylaşımı, bu demoda basit bir kullanıcı arayüzü ile gösterilmektedir. Gerçek bir uygulamada bu, şifrelenmiş bir mesajlaşma sistemi ile yapılmalıdır.

## Geliştirme İçin Öneriler

1. **Kullanıcı Deneyimi**:
   - Zamanlanmış bildirimler ekleyin
   - İş ilanlarını kategorilere göre filtreleme mekanizması ekleyin
   - Profil sayfası ve kullanıcı geçmişi bölümleri ekleyin

2. **Güvenlik**:
   - Gizli anahtar yönetimi için daha sağlam bir sistem geliştirin
   - İletişim bilgilerinin paylaşımı için end-to-end şifreleme ekleyin
   - Daha gelişmiş ZKP doğrulama mekanizmaları ekleyin

3. **Performans**:
   - ZKP oluşturma işlemini bir arka plan işçisine taşıyın
   - Daha verimli bir eşleştirme algoritması geliştirin
   - Önbelleğe alma ve durum yönetimi ekleyin

4. **Entegrasyon**:
   - Token tabanlı ekonomik teşvikler ekleyin
   - Farklı blockchain ağlarını destekleyin
   - Beceri doğrulama için harici ZKP sistemleriyle entegrasyon ekleyin 