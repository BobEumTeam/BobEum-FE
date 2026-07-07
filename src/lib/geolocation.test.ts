import { describe, expect, it } from "vitest";

import { getGeolocationErrorMessage } from "@/lib/geolocation";

describe("getGeolocationErrorMessage", () => {
  it("explains denied location permission", () => {
    expect(getGeolocationErrorMessage(1)).toContain("권한이 거부");
  });

  it("explains an unavailable location", () => {
    expect(getGeolocationErrorMessage(2)).toContain("확인할 수 없습니다");
  });

  it("explains a location timeout", () => {
    expect(getGeolocationErrorMessage(3)).toContain("시간이 초과");
  });
});
