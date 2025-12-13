# Mimari Dokümantasyonu

Bu belge, **Deniko** projesinin genel teknik mimarisini, kullanılan teknolojileri ve veri akışını açıklar.

## 🏗️ Teknoloji Yığını (Tech Stack)

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Dil**: TypeScript
- **Veritabanı**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Kimlik Doğrulama**: Auth.js (NextAuth.js v5)
- **Dosya Depolama**: Google Cloud Storage (GCS)
- **Stil**: Tailwind CSS
- **UI Kütüphanesi**: Radix UI / shadcn-ui
- **Uluslararasılaştırma (i18n)**: URL tabanlı (`/[lang]/...`)

## 🧩 Temel Modüller

Proje modüler bir yapıda tasarlanmıştır. Ana modüller şunlardır:

### 1. Kimlik ve Yetkilendirme (Auth)

- **Konum**: `auth.ts`, `auth.config.ts`, `app/api/auth/*`
- **Amaç**: Kullanıcı girişi (Google, Email/Şifre), oturum yönetimi ve rol tabanlı erişim kontrolü (RBAC).
- **Modeller**: `User`, `Account`, `Session`, `VerificationToken`.

### 2. Profil Sistemi

- **Konum**: `app/[lang]/users/*`, `components/dashboard/user-nav.tsx`
- **Amaç**: Kullanıcıların (Öğretmen/Öğrenci) profillerini yönetmesi ve görüntülemesi.
- **Özellikler**:
  - **Polimorfik Profil Yapısı**: `User` tablosu temel kimliktir. `TeacherProfile` ve `StudentProfile` tabloları role özgü verileri tutar.
  - **Gizlilik**: `UserSettings` tablosu ile profil görünürlüğü (`public`/`private`) ve iletişim tercihleri yönetilir.

### 3. Akademik Yönetim (LMS)

- **Konum**: `app/[lang]/dashboard/*`
- **Amaç**: Ders, sınıf, ödev ve sınav yönetimi.
- **Modeller**: `Classroom`, `Lesson`, `Homework`, `SchoolExam`, `TrialExam`.
- **İlişkiler**: Öğretmenler öğrencileri `StudentTeacherRelation` üzerinden yönetir.

### 4. Dosya ve Medya Yönetimi

- **Konum**: `lib/storage.ts`, `app/api/files/*`, `app/api/avatar/*`
- **Amaç**: Kullanıcı avatarları, ödev dosyaları ve ders materyallerinin güvenli depolanması.
- **Altyapı**: Google Cloud Storage. Dosyalar `File` modeli ile veritabanında indekslenir.

## 🔄 Veri Akışı

### İstemci (Client) -> Sunucu (Server)

Veri alışverişi iki ana yöntemle yapılır:

1. **Server Actions**: Form gönderimleri ve mutasyonlar (veri değiştirme) için kullanılır.
    - Örnek: `actions/auth.ts` -> `login()`, `actions/user.ts` -> `updateProfile()`.
2. **API Routes**: Dosya sunumu ve bazı dinamik veri çekme işlemleri için kullanılır.
    - Örnek: `/api/avatar/[userId]` -> Avatar görselini stream eder.

### Veritabanı Erişimi

Tüm veritabanı işlemleri **Prisma Client** (`lib/db.ts`) üzerinden yapılır. Doğrudan SQL sorgusu yerine Prisma'nın tip güvenli metodları kullanılır.

### Dosya Erişimi

1. Kullanıcı dosya yükler -> Sunucu GCS'ye yazar -> `File` kaydı oluşturulur.
2. Kullanıcı dosya ister -> `/api/files/[fileId]` endpoint'i yetki kontrolü yapar -> GCS'den `ReadStream` açar -> İstemciye pipe eder.

## 📂 Klasör Yapısı Özeti

- **`app/`**: Sayfalar, layout'lar ve API route'ları.
- **`components/`**: Yeniden kullanılabilir React bileşenleri.
- **`lib/`**: Yardımcı fonksiyonlar, konfigürasyonlar ve iş mantığı (business logic).
- **`prisma/`**: Veritabanı şeması ve migration dosyaları.
- **`types/`**: Global TypeScript tip tanımları.
- **`scripts/`**: Bakım ve kontrol scriptleri.
