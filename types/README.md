# Types (`types/`)

Bu klasör, proje genelinde kullanılan TypeScript tip tanımlarını içerir.

## 📄 Dosyalar

- **`i18n.ts`**: Uluslararasılaştırma (i18n) ile ilgili tipler. `Dictionary` yapısı burada tanımlanır.
- **`next-auth.d.ts`**: NextAuth.js tiplerini genişletir (Module Augmentation). `Session` ve `User` nesnelerine `role`, `id` gibi özel alanların eklenmesini sağlar.
- **`user.ts`**: Kullanıcı ile ilgili frontend'e özgü tipler.
- **`api.ts`**: API yanıtları ve istekleri için ortak tipler.
