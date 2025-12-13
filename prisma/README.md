# Prisma (`prisma/`)

Bu klasör, veritabanı şemasını ve migration geçmişini barındırır.

## 📄 `schema.prisma`

Veritabanı modellerini tanımlayan ana dosyadır.

### Ana Modeller

- **`User`**: Temel kullanıcı hesabı.
- **`UserSettings`**: Kullanıcı tercihleri ve gizlilik ayarları.
- **`TeacherProfile` / `StudentProfile`**: Role özgü detaylı bilgiler.
- **`Classroom`**: Sınıf/Grup tanımları.
- **`Lesson`**: Ders kayıtları (Zaman, Konu, Ücret vb.).
- **`Homework`**: Ödevler.
- **`File`**: Yüklenen dosyaların meta verileri.

### Enums

Veritabanında kullanılan sabit listeler:

- `Role`: `ADMIN`, `TEACHER`, `STUDENT`
- `LessonStatus`: `SCHEDULED`, `COMPLETED`, `CANCELLED`
- `LessonType`: `PRIVATE`, `GROUP`

## 📂 `migrations/`

Veritabanı şemasında yapılan değişikliklerin SQL karşılıklarını içeren klasör. `prisma migrate` komutu ile oluşturulur.
