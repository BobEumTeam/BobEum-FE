import { PUKYONG_DAEYEON_COORDINATES } from "@/features/foods/constants";
import type { ReceiverProfile } from "@/features/matching/calculate-match-score";

export type ReceiverSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function coordinateOrDefault(
  value: string | string[] | undefined,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  const rawValue = firstValue(value).trim();
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : fallback;
}

export function parseReceiverProfile(
  searchParams: ReceiverSearchParams,
): ReceiverProfile {
  const preferredCategory = firstValue(
    searchParams.preferred_category,
  ).trim();

  return {
    latitude: coordinateOrDefault(
      searchParams.latitude,
      -90,
      90,
      PUKYONG_DAEYEON_COORDINATES.latitude,
    ),
    longitude: coordinateOrDefault(
      searchParams.longitude,
      -180,
      180,
      PUKYONG_DAEYEON_COORDINATES.longitude,
    ),
    preferredCategory: preferredCategory || null,
  };
}
