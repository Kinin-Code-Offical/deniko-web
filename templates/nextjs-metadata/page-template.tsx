import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title | Deniko",
  description: "A clear and concise description of the page content.",
};

export default function Page() {
  return (
    <main>
      <h1>Page Title</h1>
      <p>Page content goes here.</p>
    </main>
  );
}
