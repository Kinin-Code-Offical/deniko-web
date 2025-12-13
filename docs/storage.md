# Depolama ve Dosya Sistemi (Storage)

Bu belge, projedeki dosya yükleme, saklama ve erişim altyapısını açıklar. Proje, dosya depolama çözümü olarak **Google Cloud Storage (GCS)** kullanmaktadır.

## 🛠️ Altyapı: `lib/storage.ts`

Bu dosya, GCS SDK'sını sarmalayarak güvenli ve standart bir arayüz sunar.

### Önemli Fonksiyonlar

#### `uploadObject(key, data, options)`

Bir dosyayı GCS bucket'ına yükler.

- **Parametreler**:
  - `key`: Dosya yolu (örn: `files/user123/uuid.pdf`).
  - `data`: Buffer veya string veri.
  - `options`: `contentType` ve `cacheControl` ayarları.
- **Güvenlik**: Path traversal (`..`) saldırılarına karşı `validateKey` ile kontrol yapar.

#### `getObjectStream(key)`

Dosyayı okumak için bir `ReadStream` döndürür. Büyük dosyaların belleğe yüklenmeden istemciye aktarılmasını sağlar.

#### `getSignedUrlForKey(key, opts)`

Dosyaya geçici erişim sağlayan imzalı bir URL (Signed URL) üretir.

- **Kullanım**: Doğrudan istemciye (browser) dosya indirme linki vermek istendiğinde kullanılır.
- **Varsayılan Süre**: 5 dakika.

## 🗃️ Veri Modeli: `File`

Veritabanında (`prisma/schema.prisma`) her dosya için bir kayıt tutulur. Bu, dosyaların sahipliğini ve meta verilerini yönetmeyi sağlar.

```prisma
model File {
  id          String   @id @default(cuid())
  key         String   // GCS içindeki tam yol
  filename    String   // Orijinal dosya adı
  mimeType    String   // Örn: application/pdf
  sizeBytes   Int      // Dosya boyutu
  ownerId     String   // Yükleyen kullanıcı
  // ...ilişkiler
}
```

## 🚀 API Endpoint: `/api/files/[fileId]`

Dosyalara erişim için merkezi bir noktadır (`app/api/files/[fileId]/route.ts`).

### İş Akışı

1. **Kimlik Doğrulama**: İstek yapan kullanıcının oturumu kontrol edilir.
2. **Veritabanı Sorgusu**: `fileId` ile dosya kaydı bulunur.
3. **Yetki Kontrolü**:
    - Şu anki mantık: Sadece dosya sahibi (`ownerId`) dosyayı indirebilir.
    - *Gelecek Planı*: Paylaşılan dosyalar (ders materyalleri vb.) için yetki genişletilecek.
4. **Dosya Sunumu**:
    - Yetki varsa, GCS'den stream alınır.
    - `Content-Disposition: attachment` header'ı ile dosya indirme tetiklenir.
    - `Content-Type` doğru ayarlanır.

## 📂 Klasör Yapısı (Bucket İçi)

GCS bucket içinde dosyalar belirli öneklerle (prefix) organize edilir:

- `avatars/`: Kullanıcı profil resimleri.
- `files/`: Genel kullanıcı dosyaları (ödevler, materyaller).
- `uploads/`: Geçici yüklemeler.
- `default/`: Sistem varsayılan görselleri.

`lib/storage.ts` içindeki `validateKey` fonksiyonu, sadece bu izin verilen klasörlere işlem yapılmasını zorunlu kılar.
