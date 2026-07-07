import { describe, expect, it } from "vitest";

import {
  getGeminiApiKey,
  getKakaoMapJavascriptKey,
  parsePublicEnvironment,
} from "@/lib/env";

describe("parsePublicEnvironment", () => {
  it("returns a valid Supabase public environment", () => {
    const environment = parsePublicEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: "https://foodbridge.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });

    expect(environment).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://foodbridge.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });
  });

  it("rejects missing or invalid values", () => {
    expect(() =>
      parsePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      }),
    ).toThrow();
  });
});

describe("getKakaoMapJavascriptKey", () => {
  it("returns the configured JavaScript key", () => {
    expect(
      getKakaoMapJavascriptKey({
        NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY: "kakao-javascript-key",
      }),
    ).toBe("kakao-javascript-key");
  });

  it("returns null when the key is missing", () => {
    expect(getKakaoMapJavascriptKey({})).toBeNull();
  });
});

describe("getGeminiApiKey", () => {
  it("returns the configured server-side Gemini key", () => {
    expect(getGeminiApiKey({ GEMINI_API_KEY: "gemini-api-key" })).toBe(
      "gemini-api-key",
    );
  });

  it("returns null when the key is missing", () => {
    expect(getGeminiApiKey({})).toBeNull();
  });
});
