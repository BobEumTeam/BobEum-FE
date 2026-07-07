export type ParsedBarcode = {
  barcode: string;
  name: string;
  category: string;
  expiryDate: string | null;
};

// 데모용 GS25 / CU 편의점 상품 바코드 데이터베이스
export const DEMO_BARCODE_PRODUCTS: Record<
  string,
  { name: string; category: string }
> = {
  "8801007077421": { name: "참치마요 삼각김밥", category: "간편식" },
  "08801007077421": { name: "참치마요 삼각김밥", category: "간편식" }, // 14자리 GTIN 호환
  "8801068402156": { name: "백종원 한판 도시락", category: "간편식" },
  "08801068402156": { name: "백종원 한판 도시락", category: "간편식" },
  "8801115114155": { name: "아이돌 인기 샌드위치", category: "간편식" },
  "08801115114155": { name: "아이돌 인기 샌드위치", category: "간편식" },
  "8801019605553": { name: "서울우유 200ml", category: "유제품" },
  "08801019605553": { name: "서울우유 200ml", category: "유제품" },
};

/**
 * GS1 128 / GS1 DataMatrix 2D 바코드 문자열을 파싱합니다.
 * 규격 예시: "010880100707742117260712"
 *  - 01: GTIN 상품식별코드 AI
 *  - 08801007077421: 14자리 상품 코드
 *  - 17: 유통기한 AI
 *  - 260712: YYMMDD 형태의 유통기한 날짜 (2026년 7월 12일)
 */
export function parseGS1Barcode(rawText: string): ParsedBarcode | null {
  // 괄호 및 공백 제거
  const cleanText = rawText.replace(/[\(\)\s]/g, "");

  let gtin = "";
  let expiryPart = "";

  if (cleanText.startsWith("01")) {
    gtin = cleanText.substring(2, 16); // 14자리 상품코드
    const remaining = cleanText.substring(16);

    if (remaining.startsWith("17")) {
      expiryPart = remaining.substring(2, 8); // YYMMDD (6자리)
    }
  } else {
    // 1D 일반 바코드 또는 부분 매칭 지원
    gtin = cleanText;
  }

  // 매핑 딕셔너리에서 제품 데이터 조회
  const product = DEMO_BARCODE_PRODUCTS[gtin];
  if (!product) {
    return null;
  }

  // 유통기한 변환 (YYMMDD -> datetime-local 표준 포맷: YYYY-MM-DDTHH:mm)
  let expiryDate: string | null = null;
  if (expiryPart && expiryPart.length === 6) {
    const rawYear = parseInt(expiryPart.substring(0, 2), 10);
    const rawMonth = parseInt(expiryPart.substring(2, 4), 10);
    const rawDay = parseInt(expiryPart.substring(4, 6), 10);

    // 2000년대 연도 매핑
    const year = 2000 + rawYear;
    const monthIndex = rawMonth - 1;

    // 유효한 날짜인지 검증
    const date = new Date(year, monthIndex, rawDay, 18, 0, 0); // 편의점 수령을 고려해 마감 시간을 18시로 설정
    if (!Number.isNaN(date.getTime())) {
      const yyyy = String(date.getFullYear());
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      expiryDate = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
  }

  return {
    barcode: gtin,
    name: product.name,
    category: product.category,
    expiryDate,
  };
}
