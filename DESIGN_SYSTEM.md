# Design System — Applicant Logical Test

Locked in: Phase 3. Do not change without explicit user approval.

---

## Style Direction

**Warm Minimal · Teal-Led**
Friendly, approachable, and clean. Not corporate or clinical. Mobile-first.

---

## Colors

| Role | Hex | Usage |
|---|---|---|
| Primary (Teal) | `#0084AD` | Header background, logo area, stat numbers |
| CTA (Terracotta) | `#BC3F1D` | Primary action buttons |
| Tag background | `#D4FF98` | Pill/badge backgrounds |
| Tag text / Dark | `#003B4C` | Tag text, headings, dark UI elements |
| Page background | `#F7F7F3` | Warm off-white app background |
| Card background | `#FFFFFF` | Card surfaces |
| Body text | `#4A6572` | Paragraph / body copy |
| Subtle text | `#8A9DA6` | Captions, privacy notes, helper text |
| Stat tile bg | `#F9F9F9` | Background for stat boxes |
| Accent number | `#BC3F1D` | Third stat figure (e.g. "4 types") |

---

## Typography

| Property | Value |
|---|---|
| Font family | Nunito (Google Fonts) |
| Weights used | 400, 600, 700, 800, 900 |
| Base size | 16px |
| Heading style | Extrabold (800), tight leading |
| Body style | Regular (400–600), relaxed leading |

---

## Layout

| Property | Value |
|---|---|
| Page background | `#F7F7F3` |
| Max content width | 430px (mobile-first, centered on desktop) |
| Header band | Full-width `#0084AD`, padding top 40px bottom 32px |
| Card overlap | Card pulls up `-mt-4` over header bottom edge |
| Card border-radius | 20px |
| Card shadow | `0 4px 20px rgba(0,132,173,0.10)` |
| Stat tile border-radius | 12px (`rounded-xl`) |
| Button border-radius | 14px |
| Page bottom padding | 24px |

---

## Components

### Header Band
- Background: `#0084AD`
- Contains: company logo + company name + "Applicant Assessment" subline
- Logo mark: white, on a semi-transparent white-15% rounded rect

### Card
- White background, 20px radius, teal-tinted shadow
- Padding: 20px (`p-5`)
- Overlaps header by 16px (`-mt-4`)

### Tag / Badge
- Background: `#D4FF98` · Text: `#003B4C`
- Font: 12px, 800 weight
- Border-radius: 999px (pill)
- Padding: 4px 14px

### Stat Tiles (row of 3)
- Background: `#F9F9F9`, `rounded-xl`, `p-3`, `text-center`
- Number: 24px, 800 weight — teal `#0084AD` for first two, terracotta `#BC3F1D` for third
- Label: 12px, subtle `#8A9DA6`

### Primary Button (CTA)
- Background: `#BC3F1D` · Text: white
- Full width, 14px radius, 16px font, 800 weight
- Padding: 16px vertical

### Privacy Note
- 12px, `#8A9DA6`, centered, below button

---

## Tailwind Custom Config (to add when initialising Next.js)

```js
colors: {
  fynlo: {
    teal:        '#0084AD',
    terra:       '#BC3F1D',
    lime:        '#D4FF98',
    dark:        '#003B4C',
    bg:          '#F7F7F3',
    body:        '#4A6572',
    subtle:      '#8A9DA6',
    statbg:      '#F9F9F9',
  }
}
```

---

## Screens This Applies To

- Welcome Screen
- Name & Email Entry
- Instructions Screen
- Practice Questions
- Real Test (question screen)
- Completion Screen
- HR Dashboard (adapted — same palette, slightly more data-dense)
