# docs/algorithms.md

## 1. Matching Score Formula

When sorting food items for a receiver, implement the exact weighting formula below:

$$
S = 0.4 \cdot S_{\text{dist}}
  + 0.4 \cdot S_{\text{expiry}}
  + 0.2 \cdot S_{\text{pref}}
$$

If `hoursLeft <= 0`, the total score must immediately be `0`.

If `distanceKm > 30`, the total score must immediately be `0`.
The platform may still display the food item, but it must be sorted below
in-range recommendations.

## 2. GPS Distance

Calculate the geographic distance between the receiver and food coordinates
using the Haversine formula.

Let:

- receiver latitude: $\phi_1$
- receiver longitude: $\lambda_1$
- food latitude: $\phi_2$
- food longitude: $\lambda_2$
- Earth radius: $R = 6371$ kilometers

Convert all coordinate values from degrees to radians.

$$
a =
\sin^2\left(\frac{\phi_2-\phi_1}{2}\right)
+
\cos(\phi_1)\cos(\phi_2)
\sin^2\left(\frac{\lambda_2-\lambda_1}{2}\right)
$$

$$
\text{distanceKm}
=
2R \cdot
\arctan2\left(\sqrt{a}, \sqrt{1-a}\right)
$$

The distance score is:

$$
S_{\text{dist}} = \frac{1}{1 + \text{distanceKm}}
$$

Distance is the first eligibility gate. Foods beyond 30 km are treated as
outside the recommended pickup radius.

## 3. Expiry Urgency Score

Calculate the remaining time in hours:

$$
\text{hoursLeft}
=
\frac{\text{expiryDate} - \text{currentTime}}{3{,}600{,}000}
$$

If `hoursLeft <= 0`:

$$
S = 0
$$

Otherwise, the urgency score is higher when the food is closer to expiry:

$$
S_{\text{expiry}} = \frac{1}{1 + \text{hoursLeft}}
$$

## 4. Preference Score

$$
S_{\text{pref}} =
\begin{cases}
1.0, & \text{if receiver preferred category equals food category} \\
0.0, & \text{otherwise}
\end{cases}
$$

Category comparison must use the stored category values without AI inference.

## 5. Sorting Rules

- Sort available foods by total score in descending order.
- Foods beyond 30 km receive a total score of `0`.
- Expired foods receive a total score of `0`.
- Do not use live tracking or continuously update scores from location changes.
- Recalculate scores only after an explicit receiver location or preference update.

## 6. Location Acquisition

The Browser Geolocation API may be called only after an explicit user action.

Use a one-time location request with
`navigator.geolocation.getCurrentPosition(success, error, options)`.

Do not use `navigator.geolocation.watchPosition`.

If location permission is denied or unavailable, preserve the manually entered
coordinates and show an actionable error message.

## 7. AI Food Image Analysis

AI image analysis is used only as a supplier registration helper.

The input is a selected food image. The output must be parsed as JSON with:

- `name`: Korean food name or `null`
- `quantity`: positive integer or `null`
- `category`: one of `간편식`, `베이커리`, `음료`, `신선식품`, `유제품`, `기타`, or `null`
- `expiry_date`: ISO-8601 datetime with timezone or `null`
- `storage`: one of `상온`, `냉장`, `냉동`, `알 수 없음`, or `null`
- `ready_to_eat`: boolean or `null`
- `confidence`: number from 0 to 1
- `notes`: short supplier-facing note or `null`

The AI prompt must enforce these safety rules:

- Extract an expiry date only when it is visibly written on the package.
- Extract quantity only when separate food units are clearly countable.
- Use `null` for quantity when the count is hidden, cropped, stacked, ambiguous, or not visually countable.
- Never invent or guess an expiry date.
- Use `null` for hidden, blurry, incomplete, or uncertain expiry text.
- Keep the allowed category set fixed.
- Treat the result as an editable suggestion.

AI analysis must not directly create a database record. The supplier must submit
the final registration form after reviewing the suggested values.
