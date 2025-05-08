# ZKP Job Platform - Aztec Network Port

Bu dosya, ZKP-Enabled Web3 Job Application Platform'un Aztec Network'e port edilmesiyle ilgili bilgileri içerir.

## Aztec Network Nedir?

Aztec Network, Ethereum üzerinde çalışan gizlilik odaklı bir Layer 2 çözümüdür. Zincir üzerindeki işlemleri gizli tutmak için sıfır bilgi ispatlarını (Zero Knowledge Proofs) kullanır. Aztec'in kendi programlama dili olan Noir, ZKP devrelerini tanımlamak için kullanılır ve tam da bizim projemizin yapısına uygun bir çözümdür.

## Proje Yapısı

```
zkp-job-platform/
├── src/                            # Noir Zero-Knowledge devreleri (Aztec uyumlu)
│   ├── main.nr                     # Ana devre ve Aztec contract entegrasyonu
│   ├── job_publisher.nr            # İş ilanı commitment oluşturma
│   ├── cv_publisher.nr             # Özgeçmiş commitment oluşturma
│   ├── apply.nr                    # Başvuru commitment oluşturma
│   ├── match.nr                    # Eşleştirme algoritması
│   └── approve.nr                  # Onay commitment oluşturma
│
├── contracts/                      # Aztec kontrat implementasyonu
│   └── MVPBoard.ts                 # TypeScript MVPBoard kontratı
│
├── zkp-job-platform-aztec.js       # Aztec frontend entegrasyonu
├── deploy-aztec.ts                 # Aztec deployment script
├── AZTEC_PORT_README.md            # Bu dosya
└── README.md                       # Ana proje dökümantasyonu
```

## Aztec Port'u Değişiklikleri

### 1. Noir Devreleri

Mevcut Noir kodları Aztec ekosistemi ile uyumlu olacak şekilde güncellenmiştir:

- `import { aztec } from "@aztec/noir"` importları eklenmiştir
- `#[aztec::private]` dekoratörleri ile fonksiyonlar işaretlenmiştir
- Modül yapısı `contract` bloğu kullanılarak güncellendi
- Aztec olayları (`aztec::emit`) eklendi

### 2. TypeScript Kontrat

MVPBoard.sol yerine, Aztec için MVPBoard.ts oluşturulmuştur:

- Aztec'e özgü Note yapıları (JobPostNote, ResumeNote, ApplicationNote, ApprovalNote)
- AztecContract'tan türeyen MVPBoard sınıfı
- Veri gizliliği için `PrivateMethod` dekoratörleri
- Kontrat storage ve event tanımları

### 3. Frontend Entegrasyonu

Yeni bir `zkp-job-platform-aztec.js` dosyası oluşturulmuştur:

- Aztec SDK ile etkileşim
- Not oluşturma, serileştirme ve string dönüşümleri
- Kontrat metotlarını çağırma
- Olay abonelikleri

## Kurulum

### Gereksinimler

- Node.js 16 veya üstü
- Aztec toolchain kurulumu
- TypeScript

### Kurulum Adımları

1. Gerekli paketleri yükleyin:

```bash
npm install @aztec/sdk @aztec/noir @aztec/barretenberg @types/node typescript ts-node
```

2. TypeScript yapılandırması:

```bash
echo '{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}' > tsconfig.json
```

3. Noir devrelerini Aztec için derleyin:

```bash
# Aztec CLI kurulumu
npm install -g @aztec/cli

# Devreleri derleyin
aztec-noir compile ./src/*.nr --output-dir ./artifacts
```

4. Kontratı deploy edin:

```bash
# Opsiyonel: .env dosyasına private key ekleyin
echo "PRIVATE_KEY=your_private_key" > .env

# Derleme ve deploy
npx ts-node deploy-aztec.ts
```

## Kullanım

### 1. Aztec SDK Entegrasyonu

```javascript
import { ZKPJobPlatformAztec, initializeZKPPlatformAztec } from './zkp-job-platform-aztec.js';

// Platform başlatma
const platform = await initializeZKPPlatformAztec({
  privateKey: 'YOUR_PRIVATE_KEY', // Opsiyonel
  mvpBoardAddress: 'DEPLOYED_CONTRACT_ADDRESS' // Opsiyonel, yoksa yeni deploy edilir
});

// Platform kullanımı
const jobResult = await platform.publishJob(
  'ZK Engineer',
  'Privacy Labs',
  'Remote',
  ['Noir', 'ZKP', 'TypeScript'],
  10,
  2,
  '12345' // Secret
);

console.log('Job commitment:', jobResult.jobCommitment);
```

### 2. Olaylara Abone Olma

```javascript
platform.subscribeToEvents({
  onJobPublished: (event) => {
    console.log('New job published:', event.jobCommitment);
  },
  onResumeSubmitted: (event) => {
    console.log('New resume submitted:', event.resumeCommitment);
  },
  onApplicationCreated: (event) => {
    console.log('New application:', event.applicationCommitment);
    console.log('Match score:', event.matchScore);
  },
  onApprovalDone: (event) => {
    console.log('New approval:', event.approvalCommitment);
  }
});
```

## Gizlilik Avantajları

Aztec Network'e port edilmiş bu proje, orijinal projeden daha güçlü gizlilik özellikleri sunar:

1. **Tam Gizli İşlemler**: Tüm kontrat işlemleri varsayılan olarak gizlidir
2. **İşlem Gizliliği**: İşlemlerin içeriği zincir üzerinde görünmez
3. **Durum Gizliliği**: Depolanan veriler şifrelenmiştir
4. **Zero-Knowledge Özelliği**: Eşleşme puanı gibi veriler bile sadece ilgili taraflara açıktır
5. **Özel Notlar**: Aztec Note yapısı, özel veri taşıma için optimize edilmiştir

## Prodüksiyona Geçiş İçin Adımlar

1. **Güvenlik İncelemesi**: Noir devrelerinin ve kontrat kodunun profesyonel bir güvenlik denetiminden geçirilmesi
2. **Aztec Mainnet**: Aztec Mainnet yayına girdiğinde kontratın migrate edilmesi
3. **Kullanıcı Arayüzü**: Aztec cüzdan entegrasyonu ile kullanıcı dostu bir arayüz 
4. **Performans İyileştirmeleri**: Büyük veri setleri için off-chain önbelleğe alma

## Notlar ve Kısıtlamalar

- Şu anda Aztec Network testnet aşamasındadır
- Noir dili halen aktif geliştirme aşamasındadır, API değişiklikleri olabilir
- Gizlilik avantajları, daha sınırlı işlem throughput'u ile dengelenmelidir
- Not yapıları sabittir ve dinamik boyutlu verileri işlemek için özel teknikler gerekebilir

## Kaynaklar

- [Aztec Network Dokümantasyonu](https://docs.aztec.network/)
- [Noir Programlama Dili](https://docs.aztec.network/noir/language)
- [Aztec SDK](https://docs.aztec.network/sdk/overview)
- [Noir ve ZKP Devreleri](https://docs.aztec.network/dev/circuit_development) 