import Link from "next/link";
import Image from "next/image";

import {
  FOOD_IMAGE_BUCKET,
  getFoodImagePath,
} from "@/features/foods/constants";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

const flow = [
  {
    title: "사진 한 장으로 등록",
    description: "AI가 식품명, 수량, 카테고리, 유통기한 후보를 자동 입력해요.",
    icon: "📸",
  },
  {
    title: "가까운 이웃에게 추천",
    description: "거리, 긴급도, 선호 카테고리를 계산해 우선순위를 정해요.",
    icon: "🧭",
  },
  {
    title: "지도에서 바로 확인",
    description: "음식 사진 마커로 어디에 무엇이 있는지 한눈에 보여줘요.",
    icon: "🗺️",
  },
];

type FeaturedFood = Pick<
  Tables<"foods">,
  "category" | "expiry_date" | "id" | "name" | "quantity"
> & {
  imageUrl: string;
};

function formatHoursLeft(expiryDate: string): string {
  const hoursLeft =
    (new Date(expiryDate).getTime() - Date.now()) / (60 * 60 * 1000);

  if (hoursLeft <= 0) {
    return "마감 임박";
  }

  if (hoursLeft < 24) {
    return `${Math.ceil(hoursLeft)}시간 남음`;
  }

  return `${Math.ceil(hoursLeft / 24)}일 남음`;
}

async function getFeaturedFood(): Promise<FeaturedFood | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("foods")
    .select("category, expiry_date, id, name, quantity")
    .eq("status", "available")
    .gt("expiry_date", new Date().toISOString())
    .order("expiry_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const { data: image } = supabase.storage
    .from(FOOD_IMAGE_BUCKET)
    .getPublicUrl(getFoodImagePath(data.id));

  return {
    ...data,
    imageUrl: image.publicUrl,
  };
}

function FeaturedFoodCard({ food }: { food: FeaturedFood | null }) {
  return (
    <div className="animate-float-soft rounded-[2rem] bg-emerald-950 p-5 text-white shadow-2xl shadow-emerald-950/25">
      <div className="rounded-[1.5rem] bg-white p-4 text-emerald-950">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
            긴급 매칭
          </span>
          <span className="text-sm font-black text-emerald-700">
            {food ? "실시간" : "92점"}
          </span>
        </div>
        <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-emerald-100 p-5">
          {food ? (
            <>
              <div className="relative h-36 w-full overflow-hidden rounded-2xl shadow-sm">
                <Image
                  alt={`${food.name} 사진`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  src={food.imageUrl}
                />
              </div>
              <h2 className="mt-4 text-2xl font-black">
                {food.name} {food.quantity}개
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {formatHoursLeft(food.expiry_date)} · {food.category}
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl">🍱</p>
              <h2 className="mt-4 text-2xl font-black">도시락 3개</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                1.2km · 6시간 남음 · 간편식
              </p>
            </>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <span className="rounded-xl bg-sky-50 px-2 py-3 text-sky-800">
            가까움
          </span>
          <span className="rounded-xl bg-orange-50 px-2 py-3 text-orange-800">
            긴급
          </span>
          <span className="rounded-xl bg-emerald-50 px-2 py-3 text-emerald-800">
            AI 분석
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const featuredFood = await getFeaturedFood();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-12 md:py-20">
      <section className="surface-card relative w-full overflow-hidden rounded-[2.5rem] p-6 md:p-12">
        <div className="absolute -top-24 -right-20 size-72 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 size-80 rounded-full bg-emerald-300/25 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fade-up">
            <p className="mb-5 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-black tracking-[0.14em] text-emerald-800 uppercase">
              FoodBridge · AI Food Rescue
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight font-black tracking-tight text-emerald-950 md:text-6xl">
              버려질 음식을
              <span className="block text-orange-500">필요한 이웃에게.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              사진 한 장으로 잉여 식품을 등록하면 AI가 식품 정보를 읽고,
              지도와 매칭 알고리즘이 가까운 수혜자에게 빠르게 연결합니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="animate-pulse-glow rounded-2xl bg-emerald-700 px-6 py-4 text-center font-black text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
                href="/foods/new"
              >
                사진으로 식품 등록하기
              </Link>
              <Link
                className="rounded-2xl border border-emerald-900/15 bg-white px-6 py-4 text-center font-black text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
                href="/foods"
              >
                주변 나눔 식품 보기
              </Link>
            </div>
          </div>

          <div className="animate-fade-up-delay-1 relative">
            <FeaturedFoodCard food={featuredFood} />
          </div>
        </div>

        <ul className="relative mt-10 grid gap-4 md:grid-cols-3">
          {flow.map((item, index) => (
            <li
              className="animate-fade-up-delay-2 rounded-3xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              key={item.title}
              style={{ animationDelay: `${220 + index * 80}ms` }}
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-4 text-lg font-black text-emerald-950">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
