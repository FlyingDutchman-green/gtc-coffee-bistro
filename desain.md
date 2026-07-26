# GTC Coffee & Bistro — Design System & Motion Budget (`desain.md`)

> This file is the authoritative record of responsive layout token decisions and motion budget rules. It is referenced by `prd.md` and must be updated whenever a layout or animation decision is made.

---

## §1 Responsive Token Decisions

### §1.1 MenuGrid (PRD §4.3) — Mobile Layout Choice

**Decision**: **Horizontally swipeable `scroll-snap` strip** (option B from PRD §4.3).

**Rationale**:
- Native CSS `scroll-snap-type: x mandatory` on the scroll container keeps all touch handling **off the main thread** — no JS event listeners, no passive scroll blocking.
- Matches the swipe-left UX pattern that users on entry-level Android devices are already familiar with from image carousels.
- No additional JavaScript payload — zero cost to the PRD §3 TBT and JS bundle budgets.
- Single-column stacked list (option A) was considered but rejected: five tall cards stacked vertically require excessive scroll on small screens before users reach the next section.

**Implementation tokens** (Tailwind):

| Breakpoint | Layout | Container class |
|------------|--------|-----------------|
| `< 640px` (mobile) | Single-row horizontal scroll-snap, each card = 85vw | `flex flex-nowrap overflow-x-auto snap-x snap-mandatory` |
| `640px – 1023px` (tablet) | CSS Grid `grid-cols-3` with wrap | `grid grid-cols-3` |
| `≥ 1024px` (desktop) | CSS Grid `grid-cols-5` | `grid grid-cols-5` |

**Scroll-snap card token**: Each card child: `snap-start shrink-0 w-[85vw] sm:w-auto`

**Scroll-bar suppression** (decorative, not functional): `scrollbar-none` utility on the scroll container strips the platform scrollbar on mobile without affecting scroll functionality.

---

## §2 Motion Budget

> All animation work **must** be restricted to compositor-only properties.
> Any property that triggers layout recalculation (width, height, margin, padding, top/left) or paint (color, background, border-radius on un-promoted layers) is **banned** from animation.

### Permitted animated properties
| Property | Reason |
|----------|--------|
| `opacity` | Compositor only |
| `transform: translateY()` / `translateX()` | Compositor only |
| `transform: scale()` | Compositor only |
| `transform: rotate()` | Compositor only |

### Banned animated properties
| Property | Reason |
|----------|--------|
| `width`, `height` | Forces layout recalculation |
| `margin`, `padding` | Forces layout recalculation |
| `top`, `left`, `right`, `bottom` (non-transform) | Forces layout recalculation |
| `background-color` (via JS) | Can force paint; use `opacity` overlay instead |
| `border-radius` (animated from 0) | Forces paint on un-promoted layers |
| `filter: blur()` | Triggers stacking context; expensive on low-end GPU |
| `box-shadow` (animated) | Triggers paint |

### §2.1 Per-section Motion Rules

| Section | Trigger | Max duration | Stagger | Properties |
|---------|---------|-------------|---------|------------|
| §4.1 Hero | Mount (`animate`) | 0.72s | 0.15s/item | opacity, y |
| §4.2 AboutVibe | `whileInView`, once, `-50px` margin | 0.65s | 0.10s/item | opacity, y |
| §4.3 MenuGrid | `whileInView`, once, `-50px` margin | 0.60s | 0.08s/item | opacity, y |
| §4.4 HoursLocation | `whileInView`, once, `-50px` margin | 0.55s | — | opacity, y |
| §4.5 Footer | `whileInView`, once, `-50px` margin | 0.50s | — | opacity |

### §2.2 `prefers-reduced-motion` handling
All motion components **must** check `useReducedMotion()` from Framer Motion and set `initial="visible"` if true. The CSS global override in `globals.css` (`animation-duration: 0.01ms`) serves as a belt-and-suspenders safety net for non-Framer-Motion CSS animations.

### §2.3 `willChange` policy
Apply `style={{ willChange: "opacity, transform" }}` on animated elements to promote them to their own compositor layer **before** the animation starts. Remove it after animation completes if the element is static thereafter (can use `onAnimationComplete` to reset to `willChange: "auto"`).

---

## §3 Typography Scale

| Token | Font | Weight | Size (desktop) | Usage |
|-------|------|--------|----------------|-------|
| `display-xl` | Playfair Display | 800 | 5rem–8rem | Hero H1 |
| `display-lg` | Playfair Display | 700 | 3.5rem–5rem | Section H2 |
| `display-md` | Playfair Display | 600 | 2rem–3rem | Card titles (if serif) |
| `label` | Inter | 600 | 0.75rem | Eyebrows, category names |
| `body` | Inter | 300–400 | 1rem | Paragraph copy |
| `caption` | Inter | 400 | 0.875rem | Teasers, metadata |

---

## §4 Colour Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `espresso-950` | `#0F0E0C` | Page background |
| `espresso-900` | `#161512` | Section alternate background |
| `espresso-800` | `#1E1B17` | Card background |
| `espresso-700` | `#2C281F` | Card hover background |
| `crema-50` | `#FDF8F2` | Primary text |
| `crema-200` | `#ECDAB8` | Body text |
| `crema-300` | `#D8B98A` | Muted text / captions |
| `amber-bistro` | `#D4924E` | Primary accent, CTAs |
| `gold-accent` | `#C8A96E` | Gradient end, highlights |
