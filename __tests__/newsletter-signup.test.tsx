import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NewsletterSignup } from "../components/newsletter-signup";

import type { Dictionary } from "@/types/i18n";

// Mock dictionary for testing
const mockDictionary = {
  newsletter: {
    title: "Test Title",
    description: "Test Description",
    placeholder: "Test Placeholder",
    button: "Test Button",
    success: "Test Success",
    error: "Test Error",
  },
} as unknown as Dictionary;

describe("NewsletterSignup Component", () => {
  it("renders all text from dictionary (no hardcoded strings)", () => {
    render(<NewsletterSignup dictionary={mockDictionary} />);

    // Check Title
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Test Title"
    );

    // Check Description
    expect(screen.getByText("Test Description")).toBeInTheDocument();

    // Check Placeholder
    expect(screen.getByPlaceholderText("Test Placeholder")).toBeInTheDocument();

    // Check Button
    expect(
      screen.getByRole("button", { name: "Test Button" })
    ).toBeInTheDocument();
  });

  it("shows success message from dictionary after submission", () => {
    render(<NewsletterSignup dictionary={mockDictionary} />);

    const input = screen.getByPlaceholderText("Test Placeholder");
    const button = screen.getByRole("button", { name: "Test Button" });

    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.click(button);

    expect(screen.getByText("Test Success")).toBeInTheDocument();
  });
});
