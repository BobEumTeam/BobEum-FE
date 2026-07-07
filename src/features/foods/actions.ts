"use server";

import { revalidatePath } from "next/cache";

import {
  FOOD_IMAGE_BUCKET,
  getFoodImagePath,
} from "@/features/foods/constants";
import {
  type FoodRegistrationFieldErrors,
  parseFoodRegistration,
} from "@/features/foods/registration-schema";
import { createClient } from "@/lib/supabase/server";

export type FoodRegistrationState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: FoodRegistrationFieldErrors;
  foodId?: string;
};

export type FoodReservationState = {
  foodId?: string;
  message: string;
  status: "idle" | "error" | "success";
};

export async function registerFood(
  _previousState: FoodRegistrationState,
  formData: FormData,
): Promise<FoodRegistrationState> {
  const parsed = parseFoodRegistration(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const foodId = crypto.randomUUID();
  const imagePath = getFoodImagePath(foodId);
  const supabase = await createClient();
  const imageBytes = await parsed.data.image.arrayBuffer();

  const { error: imageError } = await supabase.storage
    .from(FOOD_IMAGE_BUCKET)
    .upload(imagePath, imageBytes, {
      cacheControl: "3600",
      contentType: parsed.data.image.type,
      upsert: false,
    });

  if (imageError) {
    console.error("Food image upload failed:", imageError.message);
    return {
      status: "error",
      message:
        "사진을 업로드하지 못했습니다. Storage 마이그레이션 적용 여부를 확인해 주세요.",
    };
  }

  const { error: foodError } = await supabase.from("foods").insert({
    id: foodId,
    supplier_id: null,
    name: parsed.data.name,
    quantity: parsed.data.quantity,
    expiry_date: new Date(parsed.data.expiry_date).toISOString(),
    category: parsed.data.category,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    status: "available",
  });

  if (foodError) {
    console.error("Food registration failed:", foodError.message);
    return {
      status: "error",
      message:
        "식품 정보를 저장하지 못했습니다. RLS 정책 적용 여부를 확인해 주세요.",
    };
  }

  revalidatePath("/");
  revalidatePath("/foods");

  return {
    status: "success",
    message: "식품이 등록되었습니다. 이제 수혜자에게 추천할 수 있어요.",
    foodId,
  };
}

export async function reserveFood(
  _previousState: FoodReservationState,
  formData: FormData,
): Promise<FoodReservationState> {
  const foodId = formData.get("foodId");

  if (typeof foodId !== "string" || foodId.length === 0) {
    return {
      status: "error",
      message: "수령 신청할 식품을 찾지 못했습니다.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("foods")
    .update({ status: "reserved" })
    .eq("id", foodId)
    .eq("status", "available");

  if (error) {
    console.error("Food reservation failed:", error.message);
    return {
      foodId,
      status: "error",
      message:
        "수령 신청에 실패했습니다. 예약 상태 변경 정책 적용 여부를 확인해 주세요.",
    };
  }

  revalidatePath("/");
  revalidatePath("/foods");

  return {
    foodId,
    status: "success",
    message: "수령 신청이 완료되었습니다. 추천 목록에서 해당 식품을 숨겼어요.",
  };
}
