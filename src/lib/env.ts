import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const kakaoMapKeySchema = z.string().trim().min(1);
const serverSecretSchema = z.string().trim().min(1);

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function parsePublicEnvironment(
  environment: Record<string, string | undefined>,
): PublicEnvironment {
  return publicEnvironmentSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function getPublicEnvironment(): PublicEnvironment {
  return parsePublicEnvironment(process.env);
}

export function getKakaoMapJavascriptKey(
  environment: Record<string, string | undefined> = process.env,
): string | null {
  const result = kakaoMapKeySchema.safeParse(
    environment.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY,
  );

  return result.success ? result.data : null;
}

export function getGeminiApiKey(
  environment: Record<string, string | undefined> = process.env,
): string | null {
  const result = serverSecretSchema.safeParse(environment.GEMINI_API_KEY);

  return result.success ? result.data : null;
}
