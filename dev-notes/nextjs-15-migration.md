# Next.js 15 Migration Notes

## Async Params
In Next.js 15, `params` and `searchParams` in `page.tsx`, `layout.tsx`, `route.ts` etc. are Promises.
You MUST await them before accessing properties.

### Incorrect:
```tsx
export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug; // undefined!
}
```

### Correct:
```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}
```

## Prisma & Undefined Params
If `await params` returns an object where a property is undefined (e.g. due to incorrect destructuring or upstream issue), passing it to Prisma `findUnique` will throw a validation error.
Always validate params before using them in DB queries.

```tsx
const { token } = await params;
if (!token) {
    // Handle error
}
```
