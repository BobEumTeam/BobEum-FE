"use client";

import type { ChangeEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { DEMO_PICKUP_LOCATIONS } from "@/features/foods/constants";
import type { ReceiverProfile } from "@/features/matching/calculate-match-score";
import { useLocationSelection } from "@/hooks/use-location-selection";

type ReceiverProfileFormProps = {
  receiver: ReceiverProfile;
};

const inputClassName =
  "w-full rounded-2xl border border-emerald-950/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";

export function ReceiverProfileForm({
  receiver,
}: ReceiverProfileFormProps) {
  const router = useRouter();
  const location = useLocationSelection(receiver);

  function moveReceiverLocation(
    latitude: string,
    longitude: string,
    preferredCategory: string,
  ) {
    const params = new URLSearchParams({
      latitude,
      longitude,
    });
    const trimmedPreferredCategory = preferredCategory.trim();

    if (trimmedPreferredCategory) {
      params.set("preferred_category", trimmedPreferredCategory);
    }

    router.push(`/foods?${params.toString()}`);
  }

  function getPreferredCategory(form: HTMLFormElement | null) {
    const preferredCategoryInput = form?.querySelector<HTMLInputElement>(
      'input[name="preferred_category"]',
    );

    return preferredCategoryInput?.value ?? "";
  }

  function handleDemoLocationChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedLocation = DEMO_PICKUP_LOCATIONS.find(
      (demoLocation) => demoLocation.id === event.target.value,
    );

    if (selectedLocation) {
      const nextCoordinates = location.applyCoordinates(
        selectedLocation,
        `${selectedLocation.name} 시연 좌표를 반영했습니다.`,
      );

      moveReceiverLocation(
        nextCoordinates.latitude,
        nextCoordinates.longitude,
        getPreferredCategory(event.currentTarget.form),
      );
    }
  }

  async function handleUseCurrentLocation(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    const form = event.currentTarget.form;
    const nextCoordinates = await location.useCurrentLocation();

    if (!nextCoordinates) {
      return;
    }

    moveReceiverLocation(
      nextCoordinates.latitude,
      nextCoordinates.longitude,
      getPreferredCategory(form),
    );
  }

  return (
    <form
      action="/foods"
      className="surface-card animate-fade-up-delay-1 grid gap-4 rounded-[1.75rem] p-5 md:grid-cols-[1fr_1fr_1.2fr_auto] md:items-end"
      method="get"
    >
      <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-orange-50 p-4 md:col-span-4 md:flex-row md:items-end">
        <label className="flex-1 text-sm font-bold text-emerald-950">
          시연용 수혜자 위치
          <select
            className={`${inputClassName} mt-2`}
            defaultValue=""
            onChange={handleDemoLocationChange}
          >
            <option disabled value="">
              위치를 선택하세요
            </option>
            {DEMO_PICKUP_LOCATIONS.map((demoLocation) => (
              <option key={demoLocation.id} value={demoLocation.id}>
                {demoLocation.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="rounded-2xl border border-emerald-700 bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60"
          disabled={location.requestState === "loading"}
          onClick={handleUseCurrentLocation}
          type="button"
        >
          {location.requestState === "loading"
            ? "위치 확인 중..."
            : "내 현재 위치 한 번 사용"}
        </button>
        {location.message ? (
          <p
            className={
              location.requestState === "error"
                ? "text-sm font-semibold text-rose-700 md:max-w-72"
                : "text-sm font-semibold text-emerald-800 md:max-w-72"
            }
            role="status"
          >
            {location.message}
          </p>
        ) : null}
      </div>
      <label className="text-sm font-bold text-emerald-950">
        위도
        <input
          className={`${inputClassName} mt-2`}
          max={90}
          min={-90}
          name="latitude"
          onChange={(event) => location.setLatitude(event.target.value)}
          required
          step="0.0000001"
          type="number"
          value={location.latitude}
        />
      </label>
      <label className="text-sm font-bold text-emerald-950">
        경도
        <input
          className={`${inputClassName} mt-2`}
          max={180}
          min={-180}
          name="longitude"
          onChange={(event) => location.setLongitude(event.target.value)}
          required
          step="0.0000001"
          type="number"
          value={location.longitude}
        />
      </label>
      <label className="text-sm font-bold text-emerald-950">
        선호 카테고리
        <input
          className={`${inputClassName} mt-2`}
          defaultValue={receiver.preferredCategory ?? ""}
          maxLength={50}
          name="preferred_category"
          placeholder="예: 베이커리"
          type="text"
        />
      </label>
      <button
        className="rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800"
        type="submit"
      >
        다시 추천
      </button>
    </form>
  );
}
