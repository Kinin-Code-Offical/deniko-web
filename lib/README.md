# Library Directory (`lib/`)

Bu klasör, uygulamanın iş mantığını, yardımcı fonksiyonlarını, veritabanı ve servis yapılandırmalarını içerir.

## 📄 Önemli Dosyalar

### `db.ts`

Prisma Client örneğini (instance) oluşturur ve dışa aktarır.

- **Amaç**: Veritabanı bağlantısını tek bir noktadan yönetmek ve development ortamında çoklu bağlantı oluşmasını engellemek (global caching).
- **Kullanım**: `import { db } from "@/lib/db";`

### `storage.ts`

Google Cloud Storage (GCS) işlemlerini yöneten yardımcı modül.

- **Fonksiyonlar**:
  - `uploadObject`: Dosya yükler.
  - `getObjectStream`: Dosya okuma akışı (stream) döner.
  - `getSignedUrlForKey`: Geçici erişim URL'i üretir.
- **Güvenlik**: Dosya yollarını (`key`) doğrular, path traversal saldırılarını engeller.

### `utils.ts`

Genel amaçlı yardımcı fonksiyonlar.

- **`cn(...)`**: Tailwind sınıflarını koşullu olarak birleştirmek için (clsx + tailwind-merge).
- **`formatPhoneNumber(value)`**: Telefon numaralarını formatlar (Özellikle TR numaraları için).
- **`getAvatarUrl(...)`**: Kullanıcı avatarı için doğru URL'i (GCS veya External) belirler.
- **`createImage`, `getCroppedImg`**: Resim işleme (crop) yardımcıları.

### `auth.ts` / `auth.config.ts` (Varsayılmıştır)

NextAuth.js yapılandırması.

### `logger.ts`

Uygulama loglarını yönetmek için (muhtemelen Pino veya Winston wrapper).

### `env.ts`

Ortam değişkenlerini (Environment Variables) doğrulamak için (T3 Env veya Zod tabanlı). `process.env` yerine tip güvenli erişim sağlar.

## 📂 Alt Klasörler

- **`hooks/`**: React Custom Hooks.
