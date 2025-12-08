# Copilot Instructions for deniko

## 0. Yanıt Biçimi

- Varsayılan olarak **yalnızca kod** üret; açıklama, plan veya uzun metin yazma.
- Mevcut bir dosyayı düzeltirken:
  - Mümkünse sadece ilgili bölümü değiştir.
  - Cevabı tek bir uygun code block (`ts`, `tsx`, `js`, `md`, `yml`) içinde ver.
- Açıklama, yorum veya test senaryosu açıklaması ancak kullanıcı özellikle isterse yazılmalı.

---

## Proje Özeti

deniko; Next.js 16 (App Router) + TypeScript, Prisma + PostgreSQL, Auth.js v5, Tailwind CSS v4, Shadcn UI + Radix, Framer Motion, Docker ve Google Cloud Run üzerine kurulu bir yapıdır. Kod üretirken bu teknolojilere uygun desenleri kullan.

**Test beklentisi:**  
Önerilen teknoloji ve pattern’ler proje yapısı ve stack’iyle çelişmemeli.

---

## Genel Kurallar

- Tüm kodlar tip güvenli olacak; `any` kullanılmayacak.
- API route’larında giriş doğrulaması için `zod` veya benzeri şema doğrulama kullanılacak.
- Veri erişimi için `lib/prisma.ts` üzerinden Prisma client kullanılacak.
- UI bileşenleri Shadcn UI pattern’ine uygun olacak; Tailwind utility sınıfları kullanılacak.
- Metinler i18n yapısında tanımlanacak; hardcoded string kullanılmayacak.
- Server/Client component ayrımına uy; gereksiz client bileşenleri oluşturma.
- Kod erişilebilirliği (a11y) göz önünde bulundurulacak.
- Performans optimizasyonu: gereksiz re-render ve gereksiz fetch yapma.

**Test beklentisi:**

- Üretilen kodda tip güvenliği ihlali olmamalı.
- i18n yapısına aykırı hardcoded string olmamalı.
- Yanlış server/client component seçimi olmamalı.
- Gereksiz DB sorgusu veya bariz performans problemi oluşturmamalı.

---

## Kod Stili

- ESLint ve Prettier kurallarına tam uyum.
- Dosya adları ve klasör yapısı proje içi düzenle uyumlu.
- Commit formatı: `feat/<scope>-description`, `fix/<scope>-description`, `refactor/<scope>-description`.

**Test beklentisi:**

- Kod Prettier formatına uygun olmalı.
- ESLint hatası üretmemeli.
- Dosya adlandırma proje standardıyla çatışmamalı.

---

## Güvenlik

- Hiçbir ortam değişkeni, API anahtarı veya kimlik bilgisi commitlenmez.
- Tüm yeni fonksiyonlarda hata yakalama (try/catch) ve anlamlı HTTP dönüşleri sağlanır.
- Auth.js kullanımına uygun session kontrolü yapılır.

**Test beklentisi:**

- `.env` değerleri veya gizli anahtarlar koda gömülmemeli.
- API route'larında hata yönetimi ve doğru HTTP status kodları olmalı.
- Session gerektiren yerlerde kontrol unutulmamalı.

---

## Veri Tabanı

- Model değişiklikleri için Prisma migration dosyası oluşturulur.
- Yeni alanlar eklendiğinde ilgili API route’ları ve tipler güncellenir.
- Transaction gereken yerlerde `prisma.$transaction` kullanılır.

**Test beklentisi:**

- Prisma tipiyle çelişen alan kalmamalı.
- Migration gerektiren değişikliklerde migration üretilmeli.
- Transaction gereken senaryolarda doğru kullanım sağlanmalı.

---

## Test

- Testler Vitest ile yazılır.
- UI testleri Testing Library ile yazılır.
- API testlerinde mock Prisma client kullanılır.
- Testler `unit` ve `integration` olarak ayrılabilir.

**Test beklentisi:**

- Üretilen kod test edilebilir olmalı.
- Bağımlılıklar mocklanabilir şekilde tasarlanmalı.
- UI bileşenleri Testing Library ile testlenebilir yapıda olmalı.

---

## SEO ve Google Search Optimizasyonu

- Oluşturulan her yeni sayfa için Lighthouse, Pagespeed ve genel SEO araçlarının puanını yükseltecek şekilde semantic HTML kullanılır (`header`, `main`, `section`, `footer`).
- Meta etiketleri Next.js Metadata API üzerinden tanımlanır (`metadata.ts` veya `export const metadata`).
- Sayfalarda doğru başlık hiyerarşisi kullanılır (`h1` yalnızca bir adet).
- Görsellerde `next/image` kullanılır ve her görsele açıklayıcı `alt` atanır.
- Render bloklayan JS/CSS üretilmez; kritik içerikler SSR/SSG stratejisine göre doğru şekilde işlenir.
- `robots.txt` ve `sitemap.xml` proje yapısına uygun ve güncel tutulur.
- Gerekli olduğu yerlerde schema.org JSON-LD yapısal veri eklenir.
- Canonical URL etiketleri doğru belirlenir.
- Dahili linkleme mantıklı ve taranabilir olacak şekilde yapılandırılır.
- Lazy-loading sadece gerekli içeriklere uygulanır.
- Google Search Console yönergelerine uygun noindex/nofollow kullanımı sağlanır.
- Dinamik veri kullanan sayfalarda SEO dostu SSR/SSG kararı alınır; istemci render zorunlu kılınmaz.

**Test beklentisi:**

- Metadata title/description alanları tanımlı olmalı.
- Semantic HTML, Lighthouse SEO ve erişilebilirlik testlerinde kabul edilebilir seviyede olmalı.
- `next/image` ve `alt` kullanımı tutarlı olmalı.
- JSON-LD gerekiyorsa doğru şema tipinde ve hatasız olmalı.
- Robots ve sitemap ile çelişen davranış olmamalı.
- SSR/SSG seçimi SEO standartlarına uygun olmalı.

---

### Uygulama Standartları (SEO için)

- Her page/layout dosyasında `export const metadata` tanımlanmalı. İçerikte `title`, `description`, `openGraph` ve `alternates` (hreflang/canonical) bulunmalı.
- Tüm görseller `next/image` ile eklenmeli; `alt` zorunlu olmalı. Büyük medya lazy-load, hero görseller `priority` olmalı.
- `public/robots.txt` yoksa oluşturulmalı; `/sitemap.xml` dinamik ya da script ile üretilmeli. CI pipeline’da sitemap üretimi doğrulanmalı.
- `lib/seo/json-ld.ts` altında JSON-LD helper’ları (Article, BreadcrumbList, Organization vb.) tanımlanmalı ve ilgili sayfalarda kullanılmalı.
- i18n sayfalarında canonical ve hreflang link elementleri otomatik üretilmeli.
- Dinamik sayfalarda seçilen render stratejisi (SSG/SSR/ISR) yorum satırı veya PR açıklamasında kısaca belirtilmeli.
- Mümkünse CI’de Lighthouse/Pagespeed kontrolü (örn. `lighthouse-ci`) çalıştırılmalı.

---

## SEO Ortam Kontrollü Noindex Yönetimi

- Projede environment tabanlı noindex yönetimi kullanılmalıdır.
- `NEXT_PUBLIC_NOINDEX=true` ise tüm sayfalarda Next.js Metadata API üzerinden `robots: { index: false, follow: false }` uygulanmalıdır.
- `NEXT_PUBLIC_NOINDEX=false` ise sayfalar indexlenebilir olmalıdır.
- `NEXT_PUBLIC_NOINDEX` staging, preview ve development ortamlarında `true`, production’da `false` olacak şekilde tasarlanmalıdır.

**Test beklentisi:**

- NOINDEX=true iken metadata çıktısında noindex/nofollow görünmeli.
- NOINDEX=false iken index/follow açık olmalı.

---

## i18n

- Kullanıcıya görünen tüm stringler i18n dictionary dosyalarında tanımlanır.
- Yeni anahtar eklendiğinde hem TR hem EN dosyaları güncellenir.
- JSX içinde görünen text, placeholder, alt ve aria-label gibi tüm metinler i18n üzerinden okunmalıdır.

**Test beklentisi:**

- Kullanıcıya görünen raw string kalmamalı.
- TR ve EN dictionary’ler arasında key uyumu korunmalı.

---

## TypeScript Tip Kuralları (No Any)

- `any` tipi kullanılmamalıdır.
- Tüm fonksiyonlar için dönüş tipi açıkça yazılmalıdır.
- Tüm React bileşenlerinin props’ları için `Props` interface veya `type` tanımı kullanılmalıdır.
- API cevapları `ApiResponse<T>` gibi generic tiplerle tanımlanmalıdır.
- `fetch()` çağrıları `await res.json<T>()` ile tipli kullanılmalıdır.
- Uygun tip yoksa önce `/types` veya `types/` altında yeni bir tip/interface oluşturulmalıdır.
- `unknown`, `object` gibi geniş tipler gerektiğinde kullanılmalı, aksi halde dar ve anlamlı tipler tercih edilmelidir.

**Test beklentisi:**

- Explicit `any` içeren kod kalmamalıdır.
- Derleyici implicit any uyarısı vermemelidir.

---

## PR Gereklilikleri

- Lint, test ve build hatasız geçmeli.
- Yeni özellikler için tipler güncellenmiş olmalı.
- Yeni i18n anahtarları eksiksiz eklenmiş olmalı.
- UI bileşenlerinde erişilebilirlik kuralları uygulanmış olmalı.

---

## Copilot Prompt Örnekleri

Bu örnekleri kullanırken, Copilot’un **önce kodu, sonra gerekiyorsa testi** üretmesi; açıklamayı minimumda tutması beklenir.

- `Next.js App Router için "/app/api/lesson/route.ts" altında GET ve POST destekleyen bir API route oluştur. Giriş doğrulamasını zod ile yap, Prisma ile DB işlemlerini gerçekleştir, anlamlı hata mesajları döndür. Kodun sonunda bu route için birim testleri de ekle.`
- `Shadcn UI tabanlı "LessonCard" adlı bir bileşen oluştur. Props: { id, title, tutorName, date, status }. Tailwind ile tasarla, metinleri i18n'den al, Testing Library ile basit bir render testi ekle.`
- `Prisma "Lesson" modeline "durationMinutes" alanı ekleyen migration üret ve ilgili API’ları, tipleri ve testleri güncelle.`
- `Dashboard sayfasındaki statik metinleri i18n sistemine taşı; ilgili dictionary key'lerini ve güncellenmiş JSX kodunu üret.`
