# Scripts (`scripts/`)

Bu klasör, geliştirme, bakım ve test süreçlerinde kullanılan yardımcı scriptleri içerir. Genellikle `package.json` üzerinden veya doğrudan `ts-node` ile çalıştırılırlar.

## 📜 Script Listesi

### Kontrol ve Analiz

- **`check-env.ts`**: `.env` dosyasındaki eksik değişkenleri kontrol eder.
- **`check-links.ts`**: Projedeki kırık linkleri tarar.
- **`check-hardcoded.ts`**: Kod içinde hardcoded (sabit) kalmış metinleri veya değerleri arar.
- **`check-console.ts`**: Unutulmuş `console.log` ifadelerini bulur.
- **`analyze_issues.py`**: Python tabanlı sorun analiz scripti.

### Veri Yönetimi

- **`seed-avatars.ts`**: Test kullanıcılarına örnek avatar atamak için kullanılır.
- **`upload-default-avatar.ts`**: Sisteme varsayılan avatar görselini yükler.
- **`migrate-storage-urls.ts`**: Veritabanındaki dosya URL'lerini yeni formata dönüştürmek için migration scripti.

### Kullanıcı İşlemleri

- **`check-user.js` / `check-users.ts`**: Belirli bir kullanıcının verilerini kontrol etmek veya listelemek için CLI araçları.
