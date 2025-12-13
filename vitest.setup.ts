import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("server-only", () => {
  return {};
});

vi.mock("next/server", () => {
  return {
    NextRequest: class { },
    NextResponse: class {
      static json() { }
      static redirect() { }
      static next() { }
    },
  };
});

vi.mock("next-auth", () => ({
  default: vi.fn(),
  NextAuth: vi.fn(() => ({
    auth: vi.fn(),
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

// Mock environment variables for testing
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.GCS_BUCKET_NAME = "test-bucket";
process.env.GCS_PROJECT_ID = "test-project";
process.env.GCS_CLIENT_EMAIL = "test@example.com";
process.env.GCS_PRIVATE_KEY = "private-key";
process.env.AUTH_SECRET = "secret";
process.env.AUTH_GOOGLE_ID = "google-id";
process.env.AUTH_GOOGLE_SECRET = "google-secret";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

// No-Reply
process.env.SMTP_NOREPLY_HOST = "smtp.example.com";
process.env.SMTP_NOREPLY_PORT = "465";
process.env.SMTP_NOREPLY_USER = "noreply@example.com";
process.env.SMTP_NOREPLY_PASSWORD = "noreply-password";
process.env.SMTP_NOREPLY_FROM = "noreply@example.com";

// Support
process.env.SMTP_SUPPORT_HOST = "smtp.example.com";
process.env.SMTP_SUPPORT_PORT = "465";
process.env.SMTP_SUPPORT_USER = "support@example.com";
process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
process.env.SMTP_SUPPORT_PASSWORD = "support-password";
process.env.SMTP_SUPPORT_FROM = "support@example.com";

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
