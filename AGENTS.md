# AGENTS.md

> **[Agent Rule]** You are an autonomous developer agent executing tasks for the Surplus Food AI Matching Platform.
> You must write 100% of the code. Do not write partial stubs. Follow the map below to understand the repository constraints.

## 1. Core Operating Principles

1. **Zero Human Code**: Every line of application logic, test, and config must be written by the Agent.
2. **Strict Context Gating**: Do not guess implementation details. Refer to the `docs/` directory for absolute truths.

## 2. Repository Knowledge Map

You must read and satisfy the constraints in these files before implementation:

- **Product Scope & Constraints**: [`docs/product-specs.md`](./docs/product-specs.md)
- **Database Single Source of Truth**: [`docs/db-schema.md`](./docs/db-schema.md)
- **Matching Mathematics**: [`docs/algorithms.md`](./docs/algorithms.md)

## 3. Technology Stack

- Framework: Next.js 14+ (App Router, TypeScript)
- Styling: Tailwind CSS
- Backend/Database: Supabase (PostgreSQL)
- Map: Kakao Maps JavaScript API
- Location Input: Browser Geolocation API
- Matching Engine: Deterministic TypeScript scoring algorithm

## 4. Location Rules

- Location permission must only be requested after an explicit user action.
- Capture the current coordinates once during food registration.
- Do not implement continuous tracking, background tracking, or location history.
- Manual coordinate input or map-based location selection must remain available as a fallback.