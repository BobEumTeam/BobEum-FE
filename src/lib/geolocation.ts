import type { Coordinates } from "@/features/matching/calculate-match-score";

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 10_000,
};

export function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "위치 권한이 거부되었습니다. 브라우저 권한을 허용하거나 좌표를 직접 입력해 주세요.";
    case 2:
      return "현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도하거나 좌표를 직접 입력해 주세요.";
    case 3:
      return "위치 확인 시간이 초과되었습니다. 다시 시도하거나 좌표를 직접 입력해 주세요.";
    default:
      return "현재 위치를 가져오지 못했습니다. 좌표를 직접 입력해 주세요.";
  }
}

export function requestCurrentPosition(): Promise<Coordinates> {
  if (
    typeof navigator === "undefined" ||
    !("geolocation" in navigator)
  ) {
    return Promise.reject(
      new Error(
        "이 브라우저는 위치 기능을 지원하지 않습니다. 좌표를 직접 입력해 주세요.",
      ),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(getGeolocationErrorMessage(error.code)));
      },
      GEOLOCATION_OPTIONS,
    );
  });
}
