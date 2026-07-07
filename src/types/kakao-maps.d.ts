type KakaoLatLng = {
  getLat(): number;
  getLng(): number;
};

type KakaoLatLngBounds = {
  extend(position: KakaoLatLng): void;
};

type KakaoMap = {
  setBounds(bounds: KakaoLatLngBounds): void;
  setCenter(position: KakaoLatLng): void;
  setLevel(level: number): void;
};

type KakaoMarker = {
  setMap(map: KakaoMap | null): void;
};

type KakaoCustomOverlay = {
  setMap(map: KakaoMap | null): void;
  setZIndex(zIndex: number): void;
};

type KakaoInfoWindow = {
  close(): void;
  open(map: KakaoMap, marker: KakaoMarker): void;
};

type KakaoMapsNamespace = {
  load(callback: () => void): void;
  Map: new (
    container: HTMLElement,
    options: {
      center: KakaoLatLng;
      level: number;
    },
  ) => KakaoMap;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Marker: new (options: {
    map: KakaoMap;
    position: KakaoLatLng;
    title?: string;
  }) => KakaoMarker;
  CustomOverlay: new (options: {
    content: HTMLElement;
    map: KakaoMap | null;
    position: KakaoLatLng;
    xAnchor?: number;
    yAnchor?: number;
  }) => KakaoCustomOverlay;
  InfoWindow: new (options: {
    content: HTMLElement;
    removable?: boolean;
  }) => KakaoInfoWindow;
  event: {
    addListener(
      target: KakaoMarker,
      eventName: string,
      listener: () => void,
    ): void;
    removeListener(
      target: KakaoMarker,
      eventName: string,
      listener: () => void,
    ): void;
  };
};

type KakaoGlobal = {
  maps: KakaoMapsNamespace;
};

interface Window {
  kakao?: KakaoGlobal;
}
