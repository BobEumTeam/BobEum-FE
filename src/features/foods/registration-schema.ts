import { z } from "zod";

import {
  FOOD_IMAGE_ACCEPTED_TYPES,
  FOOD_IMAGE_MAX_BYTES,
} from "@/features/foods/constants";

const requiredNumber = (message: string, constraints: z.ZodNumber) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number({ error: message }).pipe(constraints),
  );

const foodRegistrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "식품명을 입력해 주세요.")
      .max(100, "식품명은 100자 이하로 입력해 주세요."),
    quantity: requiredNumber(
      "수량을 입력해 주세요.",
      z
        .number()
        .int("수량은 정수로 입력해 주세요.")
        .positive("수량은 1개 이상이어야 합니다."),
    ),
    expiry_date: z
      .string()
      .min(1, "유통기한을 입력해 주세요.")
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "올바른 유통기한을 입력해 주세요.",
      ),
    category: z
      .string()
      .trim()
      .min(1, "카테고리를 입력해 주세요.")
      .max(50, "카테고리는 50자 이하로 입력해 주세요."),
    latitude: requiredNumber(
      "위도를 입력해 주세요.",
      z
        .number()
        .min(-90, "위도는 -90 이상이어야 합니다.")
        .max(90, "위도는 90 이하여야 합니다."),
    ),
    longitude: requiredNumber(
      "경도를 입력해 주세요.",
      z
        .number()
        .min(-180, "경도는 -180 이상이어야 합니다.")
        .max(180, "경도는 180 이하여야 합니다."),
    ),
    image: z
      .custom<File>((value) => value instanceof File, {
        message: "식품 사진을 선택해 주세요.",
      })
      .refine((file) => file.size > 0, "식품 사진을 선택해 주세요.")
      .refine(
        (file) => file.size <= FOOD_IMAGE_MAX_BYTES,
        "사진은 5MB 이하만 업로드할 수 있습니다.",
      )
      .refine(
        (file) =>
          FOOD_IMAGE_ACCEPTED_TYPES.includes(
            file.type as (typeof FOOD_IMAGE_ACCEPTED_TYPES)[number],
          ),
        "JPEG, PNG 또는 WebP 사진만 업로드할 수 있습니다.",
      ),
  })
  .superRefine((value, context) => {
    if (
      !Number.isNaN(new Date(value.expiry_date).getTime()) &&
      new Date(value.expiry_date).getTime() <= Date.now()
    ) {
      context.addIssue({
        code: "custom",
        message: "유통기한은 현재보다 이후여야 합니다.",
        path: ["expiry_date"],
      });
    }
  });

export type FoodRegistrationInput = z.infer<typeof foodRegistrationSchema>;
export type FoodRegistrationField = keyof FoodRegistrationInput;
export type FoodRegistrationFieldErrors = Partial<
  Record<FoodRegistrationField, string[]>
>;

export function parseFoodRegistration(formData: FormData) {
  return foodRegistrationSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    expiry_date: formData.get("expiry_date"),
    category: formData.get("category"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    image: formData.get("image"),
  });
}
