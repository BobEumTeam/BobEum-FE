import { describe, expect, it } from "vitest";

import {
  calculateHaversineDistanceKm,
  calculateMatchScore,
  rankFoodsByMatchScore,
  type MatchableFood,
} from "@/features/matching/calculate-match-score";

const now = new Date("2030-07-07T00:00:00.000Z");

type TestFood = MatchableFood & { id: string };

function createFood(
  overrides: Partial<TestFood> = {},
): TestFood {
  return {
    id: "food-1",
    category: "베이커리",
    expiry_date: "2030-07-07T09:00:00.000Z",
    latitude: 0,
    longitude: 0.1,
    ...overrides,
  };
}

describe("calculateMatchScore", () => {
  it("calculates geographic distance with the Haversine formula", () => {
    expect(
      calculateHaversineDistanceKm(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
      ),
    ).toBeCloseTo(111.1949, 3);
  });

  it("uses the exact distance, expiry, and preference weights", () => {
    const result = calculateMatchScore(
      createFood(),
      {
        latitude: 0,
        longitude: 0,
        preferredCategory: "베이커리",
      },
      now,
    );

    expect(result.distanceKm).toBeCloseTo(11.1195, 3);
    expect(result.distanceScore).toBeCloseTo(1 / (1 + 11.1195), 5);
    expect(result.expiryScore).toBeCloseTo(1 / 10);
    expect(result.preferenceScore).toBe(1);
    expect(result.total).toBeCloseTo(
      0.4 * (1 / (1 + 11.1195)) + 0.4 * (1 / 10) + 0.2,
      5,
    );
  });

  it("returns a total score of zero as soon as food is expired", () => {
    const result = calculateMatchScore(
      createFood({ expiry_date: "2030-07-06T23:59:59.000Z" }),
      {
        latitude: 0,
        longitude: 1,
        preferredCategory: "베이커리",
      },
      now,
    );

    expect(result.total).toBe(0);
  });

  it("returns a total score of zero when food is outside the recommended distance", () => {
    const result = calculateMatchScore(
      createFood({
        expiry_date: "2030-07-07T01:00:00.000Z",
        latitude: 37.5665,
        longitude: 126.978,
      }),
      {
        latitude: 35.1338,
        longitude: 129.1057,
        preferredCategory: "베이커리",
      },
      now,
    );

    expect(result.distanceKm).toBeGreaterThan(300);
    expect(result.total).toBe(0);
  });

  it("sorts foods from highest to lowest total score", () => {
    const ranked = rankFoodsByMatchScore(
      [
        createFood({
          id: "far",
          category: "채소",
          latitude: 35.1796,
          longitude: 129.0756,
        }),
        createFood({
          id: "preferred",
          latitude: 37.5665,
          longitude: 126.978,
        }),
      ],
      {
        latitude: 37.5665,
        longitude: 126.978,
        preferredCategory: "베이커리",
      },
      now,
    );

    expect(ranked.map((food) => food.id)).toEqual(["preferred", "far"]);
  });

  it("prioritizes a nearby food over a far urgent food", () => {
    const ranked = rankFoodsByMatchScore(
      [
        createFood({
          id: "far-urgent",
          expiry_date: "2030-07-07T01:00:00.000Z",
          latitude: 37.5665,
          longitude: 126.978,
        }),
        createFood({
          id: "near-less-urgent",
          expiry_date: "2030-07-10T00:00:00.000Z",
          latitude: 35.1891679,
          longitude: 128.9040327,
        }),
      ],
      {
        latitude: 35.1338,
        longitude: 129.1057,
        preferredCategory: null,
      },
      now,
    );

    expect(ranked.map((food) => food.id)).toEqual([
      "near-less-urgent",
      "far-urgent",
    ]);
  });
});
