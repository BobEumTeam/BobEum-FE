import { z } from "zod";

export const FOOD_IMAGE_ANALYSIS_CATEGORIES = [
  "간편식",
  "베이커리",
  "음료",
  "신선식품",
  "유제품",
  "기타",
] as const;

export const foodImageAnalysisSchema = z.object({
  name: z.string().trim().min(1).max(100).nullable(),
  quantity: z.number().int().positive().max(99).nullable(),
  category: z.enum(FOOD_IMAGE_ANALYSIS_CATEGORIES).nullable(),
  expiry_date: z.iso.datetime({ offset: true }).nullable(),
  storage: z.enum(["상온", "냉장", "냉동", "알 수 없음"]).nullable(),
  ready_to_eat: z.boolean().nullable(),
  confidence: z.number().min(0).max(1),
  notes: z.string().trim().max(300).nullable(),
});

export type FoodImageAnalysis = z.infer<typeof foodImageAnalysisSchema>;

export const FOOD_IMAGE_ANALYSIS_PROMPT = `
You are an assistant for a Korean surplus food sharing MVP.

Analyze the supplied food image and extract registration helper data.

Return only valid JSON with this exact shape:
{
  "name": string | null,
  "quantity": positive integer | null,
  "category": "간편식" | "베이커리" | "음료" | "신선식품" | "유제품" | "기타" | null,
  "expiry_date": ISO-8601 string with timezone | null,
  "storage": "상온" | "냉장" | "냉동" | "알 수 없음" | null,
  "ready_to_eat": boolean | null,
  "confidence": number from 0 to 1,
  "notes": string | null
}

Rules:
- Prefer Korean food names such as "삼각김밥", "샌드위치", "도시락", "식빵", "우유".
- Set quantity only when separate food units are clearly countable in the image.
- Use null for quantity when the count is hidden, cropped, stacked, ambiguous, or not visually countable.
- The category must be one of the allowed Korean category values.
- Extract expiry_date ONLY if the exact expiration date text (e.g., "2026.07.12", "EXP 07/26") is 100% clearly visible, sharp, and readable on the package or product label in the image.
- ZERO TOLERANCE FOR GUESSING: If you are even 1% unsure, or if the text is blurry, partially covered, or hidden, you MUST set "expiry_date" to null.
- Never hallucinate, invent, or guess an expiry date based on the current date, food category, or average shelf life.
- Under NO circumstances should you guess the date. If it is not clearly printed and visible in the image, you MUST set "expiry_date" to null.
- If the food is unpackaged, fresh produce (fruits, vegetables), or home-cooked food without a printed expiration label, you MUST set "expiry_date" to null.
- Do not calculate, extrapolate, or guess any future date.
- If the visible expiry text omits a timezone, interpret it as Asia/Seoul (+09:00).
- Keep notes short and useful for a supplier reviewing the result.
`.trim();

export function extractJsonObject(text: string): unknown {
  const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedJson?.[1] ?? text;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
    throw new Error("AI 응답에서 JSON 객체를 찾지 못했습니다.");
  }

  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
}

export function parseFoodImageAnalysis(text: string): FoodImageAnalysis {
  return foodImageAnalysisSchema.parse(extractJsonObject(text));
}
