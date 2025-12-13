# App Directory (`app/`)

Bu klasör, Next.js **App Router** yapısını barındırır. Projenin tüm sayfaları, API route'ları ve layout'ları burada bulunur.

## 📂 Klasör Yapısı

### `[lang]/` (Internationalization)

Tüm sayfa rotaları bu dinamik segmentin altındadır. Bu sayede uygulama çoklu dil desteği (i18n) sunar.

- Örnek: `/tr/dashboard`, `/en/dashboard`.
- `lang` parametresi, sayfa bileşenlerine prop olarak iletilir ve uygun sözlük (`dictionaries/`) dosyasının yüklenmesini sağlar.

### `api/`

Backend API endpoint'lerini içerir.

- **`avatar/[userId]/route.ts`**: Kullanıcı avatarını sunar.
- **`files/[fileId]/route.ts`**: Güvenli dosya indirme işlemi yapar.
- **`auth/*`**: NextAuth.js endpoint'leri (otomatik oluşturulur/yönetilir).

### `actions/`

Server Actions dosyaları. İstemci bileşenlerinden (Client Components) doğrudan sunucu fonksiyonlarını çağırmak için kullanılır.

- Form gönderimleri, veri güncellemeleri vb. burada işlenir.

### `simple/`

Muhtemelen basitleştirilmiş veya test amaçlı sayfalar.

## 📄 Önemli Dosyalar

### `layout.tsx` (Root Layout)

Uygulamanın en dış katmanıdır.

- `<html>` ve `<body>` etiketlerini içerir.
- Global CSS (`globals.css`) burada yüklenir.
- Font konfigürasyonu burada yapılır.

### `globals.css`

Tüm uygulama için geçerli olan CSS stilleri ve Tailwind direktifleri (`@tailwind base`, vb.).

### `not-found.tsx`

404 - Sayfa bulunamadı hatası için özel tasarım.

### `robots.ts` & `sitemap.ts`

SEO için gerekli olan `robots.txt` ve `sitemap.xml` dosyalarını dinamik olarak üretir.
