import { describe, expect, it } from "vitest";

import { parseGS1Barcode } from "@/features/foods/barcode";

describe("parseGS1Barcode", () => {
  it("successfully parses valid GS1 2D barcode for tuna triangle kimbap", () => {
    const rawBarcode = "010880100707742117260712";
    const result = parseGS1Barcode(rawBarcode);

    expect(result).not.toBeNull();
    expect(result?.name).toBe("참치마요 삼각김밥");
    expect(result?.category).toBe("간편식");
    expect(result?.expiryDate).toBe("2026-07-12T18:00");
  });

  it("handles parentheses inside raw barcode string", () => {
    const rawBarcode = "(01)08801007077421(17)260712";
    const result = parseGS1Barcode(rawBarcode);

    expect(result).not.toBeNull();
    expect(result?.name).toBe("참치마요 삼각김밥");
    expect(result?.expiryDate).toBe("2026-07-12T18:00");
  });

  it("returns null for non-registered product barcode", () => {
    const rawBarcode = "019999999999999917260712"; // 미등록 가상 바코드
    const result = parseGS1Barcode(rawBarcode);

    expect(result).toBeNull();
  });
});
