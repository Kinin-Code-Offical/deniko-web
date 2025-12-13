# Hooks (`lib/hooks/`)

Bu klasör, React bileşenlerinde kullanılan özel kancaları (Custom Hooks) içerir.

## 🎣 Mevcut Hook'lar

### `use-timeout.ts`

Belirli bir süre sonra bir fonksiyonu çalıştıran hook. `setTimeout`'un React yaşam döngüsü ile uyumlu halidir.

### `useCopyToClipboard.ts`

Metin kopyalama işlevini yönetir.

- **Dönüş**: `[copiedText, copyFn]`
- **Özellik**: Kopyalama işleminden sonra belirli bir süre "kopyalandı" durumunu tutabilir.

### `useUserTiming.ts`

Performans ölçümü için User Timing API'sini kullanan hook. Bileşenlerin render sürelerini ölçmek için kullanılabilir.
