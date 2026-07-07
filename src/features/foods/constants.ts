export const FOOD_IMAGE_BUCKET = "food-images";
export const FOOD_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const FOOD_IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PUKYONG_DAEYEON_COORDINATES = {
  latitude: 35.1338,
  longitude: 129.1057,
} as const;

export const DEMO_PICKUP_LOCATIONS = [
  {
    id: "pukyong-daeyeon",
    name: "부경대학교 대연캠퍼스 인근",
    latitude: 35.1338,
    longitude: 129.1057,
  },
  {
    id: "kyungsung-pukyong-station",
    name: "경성대·부경대역 인근",
    latitude: 35.1375758,
    longitude: 129.1003743,
  },
  {
    id: "gwangalli",
    name: "광안리해수욕장 인근",
    latitude: 35.1542634,
    longitude: 129.1204897,
  },
] as const;

export function getFoodImagePath(foodId: string): string {
  return `${foodId}/image`;
}
