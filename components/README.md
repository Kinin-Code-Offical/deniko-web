# Components Directory (`components/`)

Bu klasör, uygulamanın yeniden kullanılabilir React bileşenlerini (components) içerir. Bileşenler işlevlerine göre alt klasörlere ayrılmıştır.

## 📂 Alt Klasörler

- **`ui/`**: Temel arayüz elemanları (Button, Input, Card, Dialog vb.). Genellikle **shadcn/ui** kütüphanesinden türetilmiştir.
- **`auth/`**: Kimlik doğrulama ile ilgili bileşenler.
  - `login-form.tsx`: Giriş formu.
  - `register-form.tsx`: Kayıt formu.
  - `google-login-button.tsx`: Google ile giriş butonu.
- **`dashboard/`**: Yönetim paneli (Dashboard) sayfalarına özel bileşenler.
  - `user-nav.tsx`: Üst bardaki kullanıcı profil menüsü.
  - `shell.tsx`: Dashboard genel düzeni (sidebar, header).
- **`landing/`**: Karşılama (Landing) sayfası bileşenleri.
- **`users/`**: Kullanıcı profili görüntüleme bileşenleri.
- **`providers/`**: React Context provider'ları (Theme, Session vb.).

## 🧩 Önemli Bileşenler

### `UserNav` (`dashboard/user-nav.tsx`)

Dashboard üst barında sağ köşede duran, kullanıcının avatarını gösteren ve tıklandığında profil/çıkış menüsünü açan bileşen.

**Props**

- `user`: Kullanıcı bilgilerini (isim, email, resim) içeren obje.
- `dictionary`: Dil çeviri objesi.
- `lang`: Mevcut dil kodu.

**Kullanım**

```tsx
<UserNav user={session.user} dictionary={dict} lang="tr" />
```

### `LoginForm` (`auth/login-form.tsx`)

Kullanıcı giriş işlemlerini yöneten form. Email/Şifre ve Google girişi seçeneklerini sunar.

**Props**

- `dictionary`: Çeviri metinleri.
- `lang`: Dil kodu.

### `GoogleAnalytics` (`GoogleAnalytics.tsx`)

Google Analytics takibi için script'i sayfaya ekleyen bileşen.

### `ThemeToggle` (`theme-toggle.tsx`)

Aydınlık/Karanlık mod (Light/Dark mode) arasında geçiş yapan buton.
