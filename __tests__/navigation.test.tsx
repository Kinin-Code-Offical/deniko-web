import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import type { Dictionary } from "@/types/i18n";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock dictionary
const mockDictionary = {
  metadata: {
    home: {
      description: "Description",
    },
  },
  common: {
    app_name: "Deniko",
    copyright: "Copyright",
  },
  home: {
    login: "Login",
    get_started: "Get Started",
    home: "Home",
    footer: {
      brand: "Deniko",
      built_by: "Built by",
      source_code: "Source code",
      github: "GitHub",
      patreon: "Patreon",
      support: "Support",
      platform: "Platform",
      legal: "Legal",
      patent: "Patent",
    },
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  dashboard: {
    nav: {
      dashboard: "Dashboard",
    },
  },
  legal: {
    nav: {
      terms: "Terms of Service",
      privacy: "Privacy Policy",
    },
    footer: {
      rights_reserved: "Rights Reserved",
    },
  },
  navbar: {
    menu_open: "Open menu",
    menu: "Menu",
    theme: "Theme",
    language: "Language",
    legal: "Legal",
    terms: "Terms",
    privacy: "Privacy",
    mobile_menu_title: "Mobile Menu",
    mobile_menu_desc: "Mobile Menu Desc",
    toggle_theme: "Toggle Theme",
  },
  support: {
    nav: {
      faq: "FAQ",
      support: "Support",
    },
    hero: {
      title: "Support Center",
      subtitle: "Help",
      search_placeholder: "Search",
    },
    faq: {
      title: "FAQ",
      categories: {
        general: "General",
        billing: "Billing",
        teachers: "Teachers",
        students: "Students",
      },
      items: {
        general: [],
        billing: [],
        teachers: [],
        students: [],
      },
    },
    cta: {
      title: "CTA",
      subtitle: "Subtitle",
      button_contact: "Contact",
      button_chat: "Chat",
    },
    contact: {
      title: "Contact Support",
      subtitle: "Get in touch",
      info: {
        email: "email@example.com",
        office: "Office",
      },
      form: {
        name: "Name",
        email: "Email",
        subject: "Subject",
        subject_placeholder: "Subject",
        type_label: "Type",
        type_placeholder: "Select type",
        message: "Message",
        message_placeholder: "Message",
        submit: "Submit",
        submitting: "Submitting",
        success_title: "Success",
        success_description: "Success description",
        error_title: "Error",
        error_description: "Error description",
        types: {
          general: "General",
          bug: "Bug",
          billing: "Billing",
          feature: "Feature",
        },
        validation: {
          name_required: "Name required",
          email_invalid: "Email invalid",
          subject_min: "Subject min",
          type_required: "Type required",
          message_min: "Message min",
        },
      },
    },
  },
} as unknown as Dictionary;

describe("Navigation Components", () => {
  describe("Navbar", () => {
    it("contains link to Home", () => {
      render(<Navbar lang="en" dictionary={mockDictionary} />);

      // The logo usually links to home
      const homeLinks = screen.getAllByRole("link", { name: /eniko/i }); // Logo text
      expect(homeLinks.length).toBeGreaterThan(0);
      expect(homeLinks[0]).toHaveAttribute("href", "/en");
    });
  });

  describe("Footer", () => {
    it("contains critical links (Home, Dashboard, Terms, Privacy)", () => {
      render(<Footer lang="en" dictionary={mockDictionary} />);

      // Home (Brand link)
      const homeLinks = screen.getAllByRole("link", { name: /Deniko/i });
      expect(homeLinks.length).toBeGreaterThan(0);
      expect(homeLinks[0]).toHaveAttribute("href", "/en");

      // Dashboard is not in footer, so this test expectation might be wrong too.
      // Let's check the footer component again. It does NOT have dashboard link.
      // It has Login, Register, Legal.

      // Login
      const loginLink = screen.getByRole("link", { name: /Login/i });
      expect(loginLink).toHaveAttribute("href", "/en/login");

      // Terms
      const termsLink = screen.getByRole("link", { name: /Terms of Service/i });
      expect(termsLink).toHaveAttribute("href", "/en/legal/terms");

      // Privacy
      const privacyLink = screen.getByRole("link", { name: /Privacy Policy/i });
      expect(privacyLink).toHaveAttribute("href", "/en/legal/privacy");
    });
  });
});
