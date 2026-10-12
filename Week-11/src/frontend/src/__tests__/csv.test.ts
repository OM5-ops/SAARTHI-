import { downloadCsv, toCsv } from "@/utils/csv";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("toCsv", () => {
  it("joins headers and rows with commas and newlines", () => {
    const csv = toCsv(
      ["Month", "Invoiced"],
      [
        ["2026-01", "1000"],
        ["2026-02", "2000"],
      ],
    );
    expect(csv).toBe("Month,Invoiced\n2026-01,1000\n2026-02,2000");
  });

  it("escapes cells containing commas, quotes and newlines", () => {
    const csv = toCsv(["Buyer"], [['Bharat, "BHEL"'], ["line1\nline2"]]);
    expect(csv).toBe('Buyer\n"Bharat, ""BHEL"""\n"line1\nline2"');
  });

  it("produces a header-only CSV for no rows", () => {
    expect(toCsv(["A", "B"], [])).toBe("A,B");
  });
});

describe("downloadCsv", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a downloadable link and revokes the object URL", () => {
    const click = vi.fn();
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === "a") el.click = click;
      return el;
    });

    downloadCsv("report.csv", "A,B\n1,2");

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
  });
});
