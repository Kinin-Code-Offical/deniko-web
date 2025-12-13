# Deniko

Deniko, öğretmenler ve öğrenciler için geliştirilmiş kapsamlı bir eğitim yönetim ve özel ders takip platformudur.

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- pnpm
- PostgreSQL Veritabanı
- Google Cloud Storage Hesabı (veya emülatör)

### Kurulum

1. Bağımlılıkları yükleyin:

    ```bash
    pnpm install
    ```

2. Çevresel değişkenleri ayarlayın:
    `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli anahtarları (Database URL, Auth Secret, GCS Credentials) doldurun.

3. Veritabanını hazırlayın:

    ```bash
    pnpm prisma migrate dev
    ```

### Geliştirme

Geliştirme sunucusunu başlatmak için:

```bash
pnpm dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Test ve Lint

Kod kalitesini kontrol etmek için:

```bash
pnpm lint        # ESLint kontrolü
pnpm test:all    # Tüm testleri çalıştır
```

### Build

Prodüksiyon sürümü almak için:

```bash
pnpm build
```

## 🏗️ Mimari Özeti

Proje **Next.js 15 (App Router)** üzerine inşa edilmiştir.

- **`app/`**: Sayfalar ve API route'ları. Çoklu dil desteği (`[lang]`) içerir.
- **`components/`**: UI bileşenleri.
- **`lib/`**: İş mantığı, veritabanı (`db.ts`) ve depolama (`storage.ts`) araçları.
- **`prisma/`**: Veritabanı şeması (`schema.prisma`).

Daha detaylı bilgi için **[docs/architecture.md](docs/architecture.md)** dosyasına bakınız.

## 📚 Dokümantasyon

Projenin detaylı teknik dokümantasyonu `docs/` klasörü altındadır:

- **[Mimari ve Teknoloji Yığını](docs/architecture.md)**: Genel sistem yapısı.
- **[Profil Sistemi](docs/profile.md)**: Kullanıcı profilleri, gizlilik ve avatar yönetimi.
- **[Depolama (Storage)](docs/storage.md)**: Dosya yükleme ve GCS entegrasyonu.
- **[Kimlik Doğrulama (Auth)](docs/auth.md)**: Giriş, kayıt ve güvenlik.
- **[API Dokümantasyonu](app/README.md)**: API endpoint'leri.

## 🤝 Katkıda Bulunma

1. Yeni bir branch açın (`feature/ozellik-adi`).
2. Değişikliklerinizi yapın.
3. Testleri çalıştırın.
4. Pull Request (PR) açın.
