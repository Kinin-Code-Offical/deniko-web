import { describe, it, expect, vi } from 'vitest';

// Mock CSS imports to prevent syntax errors in Node environment
vi.mock('*.css', () => ({ default: {} }));

// Mock next/font/google
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

// Mock components that might cause issues
vi.mock('@/components/ui/sonner', () => ({ Toaster: () => null }));
vi.mock('@/components/providers', () => ({ Providers: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('@/components/ui/cookie-consent', () => ({ CookieConsent: () => null }));
vi.mock('@/components/GoogleAnalytics', () => ({ default: () => null }));

describe('Metadata i18n Compliance', () => {
  it('app/layout.tsx should not have hardcoded title/description', async () => {
    // Dynamic import of the layout file
    const layoutModule = await import('../../app/layout');
    const { metadata } = layoutModule;

    expect(metadata).toBeDefined();

    // Check Title
    let title = '';
    if (typeof metadata?.title === 'string') {
      title = metadata.title;
    } else if (metadata?.title && 'default' in metadata.title) {
      title = metadata.title.default;
    }

    // Heuristic: If the title contains specific hardcoded words like "Özel Ders", it's likely hardcoded.
    // Ideally, we would check if it matches a mocked dictionary value, 
    // but since we can't easily mock a static object's dependencies if they aren't function calls,
    // we rely on checking for known hardcoded strings or checking if it equals a translation key.

    // In a real i18n setup, the title might be "home.title" (if using a key) 
    // or the result of a function call. 
    // If it's a static string in a file that doesn't import a dictionary, it's hardcoded.

    // For this test, we will fail if we detect the known hardcoded string from the current codebase.
    // This forces the developer to change it to something else (dynamic).

    const hardcodedTitle = "Deniko | Özel Ders Yönetim Platformu";
    const hardcodedDesc = "Deniko ile özel derslerinizi kolayca yönetin. Öğrenci takibi, ders programı ve veli bilgilendirme özellikleriyle eğitiminizi dijitalleştirin.";

    if (title === hardcodedTitle) {
      throw new Error(`Metadata title in app/layout.tsx is hardcoded: "${title}". Use i18n dictionary.`);
    }

    // Check Description
    const description = metadata?.description;
    if (description === hardcodedDesc) {
      throw new Error(`Metadata description in app/layout.tsx is hardcoded. Use i18n dictionary.`);
    }
  });
});
