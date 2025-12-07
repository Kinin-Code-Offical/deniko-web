import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Deniko",
    default: "Deniko",
  },
  description: "The default description for the application layout.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-container">
      <header>Header</header>
      <main>{children}</main>
      <footer>Footer</footer>
    </div>
  );
}
