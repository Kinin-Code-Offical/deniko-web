# Profil ve Kullanıcı Sistemi

Bu belge, kullanıcı profillerinin nasıl yapılandırıldığını, gizlilik ayarlarını ve avatar yönetimini açıklar.

## 🗃️ Veri Modeli

Profil sistemi üç ana model üzerine kuruludur:

### 1. `User` (Temel Kullanıcı)

Sisteme giriş yapan her kullanıcının temel kaydıdır.

- **`id`**: Benzersiz tanımlayıcı.
- **`username`**: URL'lerde kullanılan benzersiz kullanıcı adı.
- **`image`**: Avatar dosyasının yolu (GCS key veya dış URL).
- **`role`**: `ADMIN`, `TEACHER`, `STUDENT`.

### 2. `UserSettings` (Ayarlar)

Kullanıcının gizlilik tercihlerini tutar. `User` ile 1-1 ilişkilidir.

- **`profileVisibility`**: `"public"` (herkes görebilir) veya `"private"` (sadece izinliler).
- **`showAvatar`**: Avatarın halka açık olup olmadığını belirler.
- **`showEmail`, `showPhone`**: İletişim bilgilerinin görünürlüğü.

### 3. Rol Profilleri (`TeacherProfile` / `StudentProfile`)

Kullanıcının rolüne özel akademik verileri tutar.

- **`TeacherProfile`**: Branş, biyografi, dersler.
- **`StudentProfile`**: Okul numarası, veli bilgileri, sınıf seviyesi.

## 🖼️ Avatar Yönetimi

Avatar sistemi, gizlilik odaklı ve performanslı olacak şekilde tasarlanmıştır.

### Avatar URL Yapısı

Avatarlar doğrudan GCS linki olarak verilmez. Bunun yerine bir proxy API kullanılır:

```
/api/avatar/[userId]?v=[version]
```

Bu yaklaşım şunları sağlar:

1. **Gizlilik Kontrolü**: Sunucu tarafında `UserSettings` kontrol edilerek, gizli profillerin avatarlarının yetkisiz kişilerce görülmesi engellenir.
2. **Cache Yönetimi**: `v` parametresi (avatarVersion) sayesinde tarayıcı önbelleği yönetilir.

### `getAvatarUrl` Yardımcı Fonksiyonu

`lib/utils.ts` içindeki bu fonksiyon, doğru URL'i üretir:

```ts
export function getAvatarUrl(image: string | null | undefined, userId: string, version?: number) {
  if (!image) return "/api/avatars/default"; // Varsayılan avatar
  if (image.startsWith("http")) return image; // Google/External avatar
  return `/api/avatar/${userId}${version ? `?v=${version}` : ""}`; // Dahili avatar
}
```

### API Endpoint: `GET /api/avatar/[userId]`

Bu endpoint (`app/api/avatar/[userId]/route.ts`), avatar isteğini karşılar.

**İşleyiş:**

1. `userId` ile kullanıcı ve `settings` verisi çekilir.
2. İstek yapan kullanıcının oturumu (`auth()`) kontrol edilir.
3. **Erişim Kontrolü**:
    - Kullanıcı kendi avatarını her zaman görür.
    - `showAvatar: false` ise başkası göremez.
    - `profileVisibility: "private"` ise başkası göremez.
4. Erişim izni varsa:
    - Resim GCS'den stream edilir (`getObjectStream`).
    - Uygun `Content-Type` header'ı eklenir.
5. Erişim izni yoksa:
    - `403 Forbidden` veya varsayılan "gizli profil" görseli döndürülür.

## 🔒 Gizlilik Mantığı

Profil sayfasında veya listelerde kullanıcı bilgileri gösterilirken `UserSettings` tablosu dikkate alınır.

Örnek (Backend/Component seviyesinde):

```ts
// Profil görünürlük kontrolü
const canViewProfile = 
  user.id === sessionUser.id || // Kendisi
  user.settings.profileVisibility === "public"; // Herkese açık

if (!canViewProfile) {
  return <PrivateProfileView />;
}
```
