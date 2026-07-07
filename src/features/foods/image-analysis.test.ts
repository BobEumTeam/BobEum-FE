import { describe, expect, it } from "vitest";

import {
  FOOD_IMAGE_ANALYSIS_CATEGORIES,
  extractJsonObject,
  parseFoodImageAnalysis,
} from "@/features/foods/image-analysis";

describe("FOOD_IMAGE_ANALYSIS_CATEGORIES", () => {
  it("keeps the allowed registration categories explicit", () => {
    expect(FOOD_IMAGE_ANALYSIS_CATEGORIES).toEqual([
      "간편식",
      "베이커리",
      "음료",
      "신선식품",
      "유제품",
      "기타",
    ]);
  });
});

describe("extractJsonObject", () => {
  it("extracts JSON from fenced model output", () => {
    expect(
      extractJsonObject(`
        \`\`\`json
        {"name":"삼각김밥","confidence":0.9}
        \`\`\`
      `),
    ).toEqual({
      confidence: 0.9,
      name: "삼각김밥",
    });
  });

  it("throws when no JSON object exists", () => {
    expect(() => extractJsonObject("삼각김밥처럼 보입니다.")).toThrow(
      "AI 응답에서 JSON 객체를 찾지 못했습니다.",
    );
  });
});

describe("parseFoodImageAnalysis", () => {
  it("accepts a safe food image analysis result", () => {
    expect(
      parseFoodImageAnalysis(
        JSON.stringify({
          category: "간편식",
          confidence: 0.82,
          expiry_date: "2026-07-07T18:00:00+09:00",
          name: "삼각김밥",
          notes: "포장 전면과 일부 날짜 표시가 보입니다.",
          quantity: 3,
          ready_to_eat: true,
          storage: "냉장",
        }),
      ),
    ).toEqual({
      category: "간편식",
      confidence: 0.82,
      expiry_date: "2026-07-07T18:00:00+09:00",
      name: "삼각김밥",
      notes: "포장 전면과 일부 날짜 표시가 보입니다.",
      quantity: 3,
      ready_to_eat: true,
      storage: "냉장",
    });
  });

  it("rejects invented free-form categories", () => {
    expect(() =>
      parseFoodImageAnalysis(
        JSON.stringify({
          category: "매우 맛있는 음식",
          confidence: 0.8,
          expiry_date: null,
          name: "도시락",
          notes: null,
          quantity: 1,
          ready_to_eat: true,
          storage: "냉장",
        }),
      ),
    ).toThrow();
  });

  it("rejects non-positive quantities", () => {
    expect(() =>
      parseFoodImageAnalysis(
        JSON.stringify({
          category: "간편식",
          confidence: 0.8,
          expiry_date: null,
          name: "삼각김밥",
          notes: null,
          quantity: 0,
          ready_to_eat: true,
          storage: "냉장",
        }),
      ),
    ).toThrow();
  });
});
