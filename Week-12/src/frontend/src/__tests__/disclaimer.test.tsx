import { Disclaimer } from "@/components/Disclaimer";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Disclaimer", () => {
  it("shows the persistent academic-project disclaimer", () => {
    render(<Disclaimer />);
    expect(
      screen.getByText("Academic Project — Not an Official Government Portal."),
    ).toBeInTheDocument();
  });

  it("makes no official-affiliation claim", () => {
    render(<Disclaimer />);
    const text = screen.getByText(
      "Academic Project — Not an Official Government Portal.",
    ).textContent;
    expect(text).toContain("Not an Official Government Portal");
  });
});
