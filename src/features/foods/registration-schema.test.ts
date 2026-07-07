import { describe, expect, it, vi } from "vitest";

import { parseFoodRegistration } from "@/features/foods/registration-schema";

function createValidFormData(): FormData {
  const formData = new FormData();
  formData.set("name", "식빵");
  formData.set("quantity", "3");
  formData.set("expiry_date", "2030-07-07T18:00");
  formData.set("category", "베이커리");
  formData.set("latitude", "37.5665");
  formData.set("longitude", "126.9780");
  formData.set(
    "image",
    new File(["image"], "bread.webp", { type: "image/webp" }),
  );
  return formData;
}

describe("parseFoodRegistration", () => {
  it("parses a complete food registration", () => {
    vi.setSystemTime(new Date("2030-07-06T12:00:00Z"));

    const result = parseFoodRegistration(createValidFormData());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        name: "식빵",
        quantity: 3,
        category: "베이커리",
        latitude: 37.5665,
        longitude: 126.978,
      });
    }

    vi.useRealTimers();
  });

  it("rejects expired food and an unsupported image", () => {
    vi.setSystemTime(new Date("2030-07-08T12:00:00Z"));
    const formData = createValidFormData();
    formData.set(
      "image",
      new File(["document"], "food.pdf", { type: "application/pdf" }),
    );

    const result = parseFoodRegistration(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.expiry_date).toContain(
        "유통기한은 현재보다 이후여야 합니다.",
      );
      expect(errors.image).toContain(
        "JPEG, PNG 또는 WebP 사진만 업로드할 수 있습니다.",
      );
    }

    vi.useRealTimers();
  });

  it("rejects missing coordinates instead of coercing them to zero", () => {
    const formData = createValidFormData();
    formData.set("latitude", "");
    formData.set("longitude", "");

    const result = parseFoodRegistration(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.latitude).toContain("위도를 입력해 주세요.");
      expect(errors.longitude).toContain("경도를 입력해 주세요.");
    }
  });
});
