import Image from "next/image";

import type { MatchScore } from "@/features/matching/calculate-match-score";
import { ReserveFoodButton } from "@/features/matching/reserve-food-button";
import type { Tables } from "@/types/database";

type RankedFoodCardProps = {
  food: Tables<"foods"> & {
    imageUrl: string;
    match: MatchScore;
  };
  rank: number;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatHoursLeft(hoursLeft: number): string {
  if (hoursLeft <= 0) {
    return "유통기한 지남";
  }
  if (hoursLeft < 24) {
    return `${Math.ceil(hoursLeft)}시간 남음`;
  }
  return `${Math.ceil(hoursLeft / 24)}일 남음`;
}

function weightedPercent(score: number, weight: number): string {
  return `${(score * weight * 100).toFixed(1)}점`;
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return `${distanceKm.toFixed(1)}km`;
}

export function RankedFoodCard({ food, rank }: RankedFoodCardProps) {
  const scorePercent = Math.round(food.match.total * 100);

  return (
    <article className="animate-fade-up grid overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white/90 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/10 sm:grid-cols-[15rem_1fr]">
      <div className="relative min-h-64 bg-emerald-100 sm:min-h-full">
        <Image
          alt={`${food.name} 사진`}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 100vw, 224px"
          src={food.imageUrl}
        />
        <span className="absolute top-4 left-4 rounded-full bg-emerald-950/95 px-3 py-1 text-sm font-black text-white shadow-lg">
          추천 {rank}위
        </span>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-950/45 to-transparent" />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              {food.category}
            </span>
            <h2 className="mt-3 text-2xl font-black text-emerald-950">
              {food.name}
            </h2>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
            <p className="text-xs font-bold text-emerald-700">AI 추천</p>
            <strong className="text-3xl font-black text-emerald-800">
              {scorePercent}
            </strong>
            <span className="ml-1 text-sm font-bold text-slate-500">점</span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-emerald-50 p-3">
            <dt className="text-slate-500">수량</dt>
            <dd className="mt-1 font-bold text-slate-900">{food.quantity}개</dd>
          </div>
          <div className="rounded-2xl bg-orange-50 p-3">
            <dt className="text-slate-500">남은 시간</dt>
            <dd className="mt-1 font-bold text-slate-900">
              {formatHoursLeft(food.match.hoursLeft)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-sm text-slate-500">
          유통기한 {dateFormatter.format(new Date(food.expiry_date))}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          픽업 좌표 {food.latitude}, {food.longitude}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          GPS 직선거리 {formatDistance(food.match.distanceKm)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800 shadow-sm">
            거리 {weightedPercent(food.match.distanceScore, 0.4)}
          </span>
          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-orange-800 shadow-sm">
            긴급도 {weightedPercent(food.match.expiryScore, 0.4)}
          </span>
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-800 shadow-sm">
            선호 {weightedPercent(food.match.preferenceScore, 0.2)}
          </span>
        </div>

        <ReserveFoodButton foodId={food.id} />
      </div>
    </article>
  );
}
