import { describe, expect, it } from "vitest";

import { PUKYONG_DAEYEON_COORDINATES } from "@/features/foods/constants";
import { parseReceiverProfile } from "@/features/matching/receiver-profile";

describe("parseReceiverProfile", () => {
  it("uses the Pukyong Daeyeon demo coordinates by default", () => {
    expect(parseReceiverProfile({})).toEqual({
      ...PUKYONG_DAEYEON_COORDINATES,
      preferredCategory: null,
    });
  });

  it("accepts valid static coordinates and a preferred category", () => {
    expect(
      parseReceiverProfile({
        latitude: "35.1796",
        longitude: "129.0756",
        preferred_category: "채소",
      }),
    ).toEqual({
      latitude: 35.1796,
      longitude: 129.0756,
      preferredCategory: "채소",
    });
  });

  it("falls back when coordinates are outside their valid range", () => {
    expect(
      parseReceiverProfile({
        latitude: "100",
        longitude: "-200",
      }),
    ).toMatchObject(PUKYONG_DAEYEON_COORDINATES);
  });
});
