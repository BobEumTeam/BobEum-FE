# FoodBridge Frontend

잉여 식품을 공급자와 주변 수혜자 사이에 연결하는 위치 기반 해커톤
MVP의 Next.js 프론트엔드입니다.

백엔드/DB 마이그레이션은 별도 `backend` 저장소에서 관리하는 것을
전제로 분리되었습니다.

## 기술 기반

- Next.js App Router, React, TypeScript, Tailwind CSS
- Supabase PostgreSQL 연동 클라이언트
- Kakao Maps JavaScript API
- Browser Geolocation API
- Gemini API food image analysis

## 로컬 실행

1. 의존성을 설치합니다.

   ```bash
   npm install
   ```

2. 환경 파일을 만들고 Supabase, Kakao, Gemini 값을 입력합니다.

   ```bash
   cp .env.example .env.local
   ```

   `GEMINI_API_KEY`는 서버에서만 사용하는 비공개 키입니다.
   `NEXT_PUBLIC_` 접두사를 붙이지 마세요.

3. 백엔드 저장소의 `supabase/migrations/` SQL 파일을 파일명 순서대로
   Supabase SQL Editor에서 실행하거나 Supabase CLI로 적용합니다.

4. 개발 서버를 실행합니다.

   ```bash
   npm run dev
   ```

## 디렉터리 계획

```text
src/
├── app/                 # 화면과 Route Handlers
├── features/            # foods, matching 도메인 로직
├── lib/
│   └── supabase/        # 브라우저/서버 연결 경계
└── types/               # DB 생성 타입과 공용 타입
docs/                    # 제품/DB/알고리즘 규칙 사본
```

위치는 명시적인 버튼 입력 후 한 번만 가져옵니다. 연속·백그라운드 위치
추적, 위치 기록, 실시간 알림, 채팅, 결제는 범위에서 제외합니다.

## 현재 구현

- `/`: 서비스 홈
- `/foods`: 일회성 현재 위치 또는 수동 좌표와 선호 카테고리를 기준으로
  Haversine 거리를 계산한 추천 목록 및 카카오 픽업 위치 지도
- `/foods/new`: 식품 정보 검증, 이미지 미리보기, Supabase Storage 업로드,
  Gemini 사진 분석 기반 식품명·카테고리·유통기한 후보 자동 입력,
  일회성 현재 위치·부경대 주변 시연 프리셋, `foods` 테이블 등록

식품 이미지는 DB 스키마를 변경하지 않고 공개 `food-images` 버킷의
`{foodId}/image` 경로에 저장합니다.

AI 사진 분석은 공급자 입력을 돕는 기능입니다. 유통기한은 이미지에 확실히
보일 때만 후보로 채우며, 최종 등록 전 공급자가 직접 확인·수정해야 합니다.
