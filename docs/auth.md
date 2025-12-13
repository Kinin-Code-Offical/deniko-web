# Kimlik Doğrulama (Authentication)

Bu belge, projedeki kimlik doğrulama ve oturum yönetimi sistemini açıklar. Proje, **Auth.js (NextAuth v5)** kütüphanesini kullanmaktadır.

## 🔐 Genel Yapı

Kimlik doğrulama sistemi şu bileşenlerden oluşur:

- **Konfigürasyon**: `auth.config.ts` ve `auth.ts`.
- **Veritabanı Adaptörü**: Prisma Adapter kullanılarak kullanıcı verileri `User`, `Account`, `Session` tablolarında tutulur.
- **Sağlayıcılar (Providers)**:
  - **Google**: OAuth ile giriş.
  - **Credentials**: Email ve şifre ile giriş.

## 📄 Önemli Dosyalar

### `components/auth/login-form.tsx`

Kullanıcı giriş formunu yöneten React bileşeni.

- **Özellikler**:
  - Zod ile form validasyonu.
  - `useTransition` ile asenkron işlem yönetimi.
  - Hata durumunda (örn: email doğrulanmamış) kullanıcıya geri bildirim (`ResendAlert`).
  - Google ile giriş butonu entegrasyonu.

### `components/auth/google-login-button.tsx`

Google OAuth akışını başlatan buton.

### `lib/auth.ts` (veya `auth.ts`)

Auth.js'in ana yapılandırma dosyasıdır.

- `callbacks`: Oturum (session) ve JWT token içine özel verilerin (örn: `role`, `id`) eklenmesini sağlar.
- `events`: Kullanıcı oluşturma (`createUser`) gibi olayları dinler (örn: hoşgeldin emaili göndermek için).

## 🗃️ Veri Modeli

### `User`

Kullanıcı ana tablosu.

- `emailVerified`: Email doğrulama tarihi. Boşsa kullanıcı doğrulanmamıştır.
- `password`: Hashlenmiş şifre (sadece Credentials girişi için).

### `Account`

OAuth sağlayıcılarından gelen bağlantı bilgileri (Google Access Token vb.) burada tutulur.

### `VerificationToken`

Email doğrulama işlemleri için geçici tokenlar.

## 🚦 Güvenlik Akışı

1. **Giriş (Login)**:
    - Kullanıcı form veya Google ile giriş yapar.
    - Başarılı ise güvenli bir `sessionToken` cookie'si tarayıcıya set edilir.
2. **Oturum Kontrolü (Session Check)**:
    - Sunucu tarafında: `auth()` fonksiyonu ile oturum bilgisi alınır.
    - İstemci tarafında: `useSession` hook'u kullanılabilir (ancak proje genelde server component ağırlıklı).
3. **Middleware**:
    - `middleware.ts` (varsa) veya sayfa bazlı kontrollerle korunması gereken rotalara (örn: `/dashboard`) erişim engellenir.

## ⚠️ Önemli Notlar

- **Email Doğrulama**: Credentials ile kayıt olan kullanıcıların email adreslerini doğrulaması zorunludur. Doğrulanmamış kullanıcılar giriş yapamaz (`NOT_VERIFIED` hatası döner).
- **Rol Yönetimi**: Kullanıcı rolleri (`ADMIN`, `TEACHER`, `STUDENT`) veritabanında tutulur ve session nesnesine eklenerek uygulamanın her yerinde erişilebilir hale getirilir.
