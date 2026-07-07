# docs/product-specs.md

## 1. Objective

Build a minimum viable product (MVP) for a surplus food matching web platform within a 2-day hackathon timeline.

The platform connects surplus food suppliers with nearby receivers using location, expiry time, and category preference.

## 2. In-Scope (Must Implement)

### Supplier Flow

Provide a food registration form containing:

- name
- quantity
- expiry_date
- category
- latitude
- longitude
- image file

The supplier can explicitly request their current location through the browser Geolocation API.

The location is captured once and saved with the food registration. Manual coordinate input must remain available if permission is denied or location acquisition fails.

The supplier can optionally use AI image analysis after selecting a food photo.
The AI analysis must:

- Estimate the food name
- Estimate the quantity only when individual food units are clearly visible
- Classify the category
- Extract an expiry date only when it is visibly present
- Suggest storage and ready-to-eat metadata for supplier review
- Fill the registration form as a helper, not as an irreversible final decision

The supplier must be able to review and edit all AI-filled values before final registration.

### Receiver Flow

Provide a receiver page that:

- Retrieves available foods from Supabase
- Displays food images and registration information
- Calculates the documented matching score
- Sorts foods from highest to lowest match score
- Shows the receiver and food pickup locations on Kakao Maps
- Allows the receiver to use a one-time current location or manually entered coordinates
- Allows the receiver to reserve an available food item

Reservation changes the food status from `available` to `reserved`.
Reserved foods must disappear from the available recommendation list.

### Map Flow

Use the Kakao Maps JavaScript API to:

- Display the receiver position
- Display available food pickup markers
- Fit the viewport to visible markers
- Show food information when a marker is selected

## 3. Location and Privacy Constraints

- Request location permission only after the user clicks a location button.
- Capture location only once per explicit request.
- Do not continuously watch the user's position.
- Do not store location history.
- Do not run location collection in the background.
- Clearly handle permission denial and browser errors.
- Keep manual coordinate entry available.

## 4. Out-of-Scope (Strictly Forbidden)

- Continuous or background GPS tracking
- Location history collection
- Real-time WebSocket push notifications
- LLM or Gemini recipe generation
- Automatic registration without supplier confirmation
- In-app chat systems
- Payment gateways
- Administrator pages
- Complex authentication and authorization
