import type { Tables } from "@/types/database";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type ReceiverProfile = Coordinates & {
  preferredCategory: string | null;
};

export type MatchableFood = Pick<
  Tables<"foods">,
  "category" | "expiry_date" | "latitude" | "longitude"
>;

export type MatchScore = {
  distanceKm: number;
  distanceScore: number;
  expiryScore: number;
  hoursLeft: number;
  preferenceScore: number;
  total: number;
};

const DISTANCE_WEIGHT = 0.4;
const EXPIRY_WEIGHT = 0.4;
const PREFERENCE_WEIGHT = 0.2;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const EARTH_RADIUS_KM = 6371;
const MAX_RECOMMENDED_DISTANCE_KM = 30;

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateHaversineDistanceKm(
  start: Coordinates,
  end: Coordinates,
): number {
  const startLatitude = degreesToRadians(start.latitude);
  const endLatitude = degreesToRadians(end.latitude);
  const latitudeDelta = degreesToRadians(end.latitude - start.latitude);
  const longitudeDelta = degreesToRadians(end.longitude - start.longitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const normalizedHaversine = Math.min(1, Math.max(0, haversine));
  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(normalizedHaversine),
      Math.sqrt(1 - normalizedHaversine),
    );

  return EARTH_RADIUS_KM * angularDistance;
}

export function calculateMatchScore(
  food: MatchableFood,
  receiver: ReceiverProfile,
  now: Date = new Date(),
): MatchScore {
  const distanceKm = calculateHaversineDistanceKm(receiver, food);
  const distanceScore = 1 / (1 + distanceKm);
  const hoursLeft =
    (new Date(food.expiry_date).getTime() - now.getTime()) /
    MILLISECONDS_PER_HOUR;
  const preferenceScore =
    receiver.preferredCategory !== null &&
    receiver.preferredCategory === food.category
      ? 1
      : 0;

  if (hoursLeft <= 0 || distanceKm > MAX_RECOMMENDED_DISTANCE_KM) {
    return {
      distanceKm,
      distanceScore,
      expiryScore: 0,
      hoursLeft,
      preferenceScore,
      total: 0,
    };
  }

  const expiryScore = 1 / (1 + hoursLeft);
  const total =
    DISTANCE_WEIGHT * distanceScore +
    EXPIRY_WEIGHT * expiryScore +
    PREFERENCE_WEIGHT * preferenceScore;

  return {
    distanceKm,
    distanceScore,
    expiryScore,
    hoursLeft,
    preferenceScore,
    total,
  };
}

export function rankFoodsByMatchScore<T extends MatchableFood>(
  foods: T[],
  receiver: ReceiverProfile,
  now: Date = new Date(),
) {
  return foods
    .map((food) => ({
      ...food,
      match: calculateMatchScore(food, receiver, now),
    }))
    .sort((left, right) => right.match.total - left.match.total);
}
