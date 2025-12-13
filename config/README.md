# Config (`config/`)

Bu klasör, uygulamanın statik konfigürasyon verilerini içerir.

## 📄 Dosyalar

### `dashboard.ts`

Dashboard menü yapısını (sidebar linkleri) tanımlar.

- Hangi rolün hangi menüleri göreceği burada belirlenir.
- Örnek yapı:

  ```ts
  export const dashboardConfig = {
    sidebarNav: [
      {
        title: "Dersler",
        href: "/dashboard/lessons",
        icon: "book",
      },
      // ...
    ]
  }
  ```
