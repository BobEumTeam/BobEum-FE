"use client";

import { useState } from "react";

import type { Coordinates } from "@/features/matching/calculate-match-score";
import { requestCurrentPosition } from "@/lib/geolocation";

type LocationRequestState = "idle" | "loading" | "success" | "error";

function formatCoordinate(value: number): string {
  return value.toFixed(7);
}

export function useLocationSelection(initialCoordinates: Coordinates) {
  const [latitude, setLatitude] = useState(
    String(initialCoordinates.latitude),
  );
  const [longitude, setLongitude] = useState(
    String(initialCoordinates.longitude),
  );
  const [requestState, setRequestState] =
    useState<LocationRequestState>("idle");
  const [message, setMessage] = useState("");

  function applyCoordinates(coordinates: Coordinates, successMessage: string) {
    const formattedCoordinates = {
      latitude: formatCoordinate(coordinates.latitude),
      longitude: formatCoordinate(coordinates.longitude),
    };

    setLatitude(formattedCoordinates.latitude);
    setLongitude(formattedCoordinates.longitude);
    setRequestState("success");
    setMessage(successMessage);

    return formattedCoordinates;
  }

  async function useCurrentLocation() {
    setRequestState("loading");
    setMessage("현재 위치를 한 번 확인하고 있어요...");

    try {
      const coordinates = await requestCurrentPosition();
      return applyCoordinates(coordinates, "현재 위치를 좌표에 반영했습니다.");
    } catch (error) {
      setRequestState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "현재 위치를 가져오지 못했습니다.",
      );

      return null;
    }
  }

  return {
    applyCoordinates,
    latitude,
    longitude,
    message,
    requestState,
    setLatitude,
    setLongitude,
    useCurrentLocation,
  };
}
