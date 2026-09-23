---
version: alpha
name: Slop Doctor
description: A light, Swiss-grid design system for Slop Doctor, adopted from the Product Squad system. Clean paper-white surfaces, one saturated orange accent, Switzer for words and Geist Mono for figures, flat tonal depth, architectural corners, and a pencil-line doctor drawn in the margins. It reads like a clinical chart, and it is deliberately everything AI slop is not.
colors:
  primary: "#F55200"
  on-primary: "#141414"
  primary-container: "#FFE1CC"
  on-primary-container: "#7A2600"
  primary-deep: "#C43E00"
  surface: "#FDFCFA"
  surface-container: "#F4F2EE"
  surface-container-high: "#EAE7E1"
  on-surface: "#141414"
  on-surface-variant: "#625D55"
  pencil: "#4A4741"
  outline: "#CFCAC0"
  outline-variant: "#E6E2DA"
  grid-line: "#E6E2DA"
  inverse-surface: "#141414"
  inverse-on-surface: "#FDFCFA"
  error: "#B8321E"
  on-error: "#FFFFFF"
  error-container: "#F8DDD8"
  success: "#1E7A3C"
  warning: "#8A5300"
typography:
  display-lg:
    fontFamily: Switzer
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Switzer
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Switzer
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.01em
  title-md:
    fontFamily: Switzer
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
  body-lg:
    fontFamily: Switzer
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
  body-md:
    fontFamily: Switzer
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: Switzer
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Switzer
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  label-mono:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.06em
rounded:
  none: 0
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 12px 20px
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.inverse-on-surface}"
  button-secondary:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 12px 20px
    height: 44px
  button-secondary-hover:
    backgroundColor: "{colors.pencil}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
    height: 44px
  button-ghost-hover:
    backgroundColor: "{colors.surface-container}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px 14px
    height: 44px
  input-field-focus:
    backgroundColor: "{colors.surface}"
  chip:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 6px 12px
    height: 32px
  chip-selected:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 6px 12px
    height: 32px
  card:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 24px
  panel-grid:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 40px
  list-item:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    padding: 16px 0
  list-item-hover:
    backgroundColor: "{colors.surface-container}"
  rung:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.none}"
    height: 20px
  rung-reached:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.none}"
    height: 20px
  rung-hatched:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.none}"
    height: 20px
  note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 12px 16px
  toast:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
    height: 44px
  banner-error:
    backgroundColor: "{colors.error-container}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 16px
  scan-rule:
    backgroundColor: "{colors.primary}"
    height: 2px
    rounded: "{rounded.none}"
  scan-readout:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.none}"
    padding: 4px 8px
  region-box:
    backgroundColor: transparent
    textColor: "{colors.pencil}"
    rounded: "{rounded.none}"
  region-tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.none}"
    padding: 4px 8px
---

# Slop Doctor

> Adopted verbatim from the Product Squad design system (tokens unchanged). Brand-specific component meanings are remapped for Slop Doctor in § Slop Doctor mapping below.

## Brand & Style

Slop Doctor looks like a working document, not a marketing page: the 1975 NASA Graphics Standards Manual reset for a web app. Clean paper-white ground, a strict Swiss grid, one saturated orange, and figures set in a monospace so numbers read as measurements. The pencil-line doctor, a simple geometric figure with a clipboard, lives in the margins and empty states, never behind a headline. The aesthetic intent is "precise and dry": a visitor should feel they've opened a well-kept clinical chart that happens to have a sense of humour in the corners. The emotional response is calm confidence, the opposite of the dark-mode, purple-glow developer-tool default and of Skool's yellow gamified feed. Two anti-patterns to hold the line against: rounding creeping back toward friendly 16px corners, and the orange spreading from one element per screen to ambient decoration.

## Colors

The palette is mono-accent on near-white paper. `surface` (#FDFCFA) is a clean white with the faintest warmth, chosen over pure white so the pencil greys and the paper grid sit naturally on it, and over cream so it never reads as retro. `surface-container` and `surface-container-high` are the two tonal steps for cards and rung tracks. `primary` (#F55200) is the single accent, rationed to one element per screen: the primary button, the reached rungs, the current next action, or one rule beside a note. It passes 3:1 as large text on `surface`, so it may be used for headline-size numbers but never for body text; `primary-deep` (#C43E00) carries orange at body size at 4.9:1. `on-primary` is near-black, not white: black-on-orange is the system's signature pairing at 5.3:1 and reads as a manual, not a sale banner. `primary-container` is the pale tint for a highlighted card or a selected row, always with `on-primary-container` text. `pencil` (#4A4741) is graphite for every hand-drawn line and agent; the pencil is never orange. `grid-line` draws the paper grid. Semantic colours are muted to sit under the accent: `error`, `success` and `warning` all pass AA as text on `surface`, and none of them is used decoratively. There is no dark mode.

## Typography

Switzer (Fontshare, free for commercial use) carries every word, chosen for its grotesk neutrality with slightly more warmth than Helvetica; it is not Inter and must not be substituted with it. Geist Mono carries every figure: rung numbers, versions, timestamps, durations, counts, and the small uppercase labels that echo the NASA manual's figure captions. `display-lg` (56/600, tight tracking) is for one line on a page, usually the product name or the ladder headline. `headline-lg` and `headline-md` head pages and sections. `title-md` (18/600) heads cards and list groups. Body sits at 16px with a 1.55 line-height; `body-lg` is for first-run and empty-state prose only, `body-sm` for notes and metadata. `label-md` (14/600) is the button and chip face. `label-mono` (12/500, +0.06em, uppercase) is the only tracked style and the only mono style; it is never used for sentences. Numerals everywhere use `font-variant-numeric: tabular-nums`. Weights are 400 and 600 only; 700 is reserved for the wordmark.

## Layout & Spacing

The grid is Swiss: 12 columns, 24px gutters, 48px outer margins, a 1280px frame, and a 720px measure for prose and documents. Everything is left-aligned to the grid, including headings, buttons and figures; nothing is centred except a lone empty-state illustration. Spacing runs on an 8px base with a deliberately restrained ladder: `xs 4, sm 8, md 16, lg 24, xl 40, 2xl 64`. Cards use 24px internal padding; sections are separated by 40px; page regions by 64px. Structure is drawn with rules rather than boxes wherever possible: a 1px `outline-variant` hairline under a section title does the work a card border would do elsewhere. The paper grid is a background element, not a layout tool: a 24px cell grid in `grid-line` at low weight, permitted in exactly three places, the page header band, empty states, and the marketing hero, and never behind body text, tables or forms. Dense views (the review queue, document lists) drop `lg` to `md` between rows but keep the same grid.

## Elevation & Depth

Depth is flat and tonal. Level one is the `surface` page. Level two is a `surface-container` card or a `surface-container-high` track sitting on it with no border and no shadow. Interactive surfaces that need an edge, inputs, focused elements, menus, get a 1px `outline-variant` hairline, which strengthens to `outline` on hover and to `on-surface` on focus. One soft shadow, `0 2px 8px rgba(20, 20, 20, 0.08)`, is reserved for floating menus and the toast, and always sits alongside its hairline, never instead of it. There is no glass, no blur, no gradient, and no shadow used for hierarchy: if a region needs to feel more important, it gets a heavier rule or the single orange element, not lift. The hatch, 45-degree 1px `outline` lines at 6px intervals on `surface`, is the system's texture for "not yet": unfilled rungs, empty progress, placeholders.

## Shapes

Corners are architectural. Buttons, inputs, toasts and banners use `sm` (4px); cards and grid panels use `md` (8px); `lg` (12px) is reserved for dialogs and nothing else. Rungs, rules and the note block are square (`none`), because measurements have square edges. `full` is reserved for chips and avatars, so a pill means "tag or person" and never "action". The agent shapes are drawn geometrically, circle, triangle, square and diamond, with square or minimally softened corners, in a single pencil weight. Any component drifting above 8px outside a dialog is a regression.

## Components

Buttons: `button-primary` is orange with black text, one per screen, hover deepens to `primary-deep` with paper-white text. `button-secondary` is black with paper-white text for the second action on a screen; hover lifts to `pencil`. `button-ghost` is transparent with a hairline that appears on hover as a `surface-container` fill; it takes destructive-confirm and tertiary actions. All buttons are 44px tall, `sm` corners, `label-md` face, no icons-only without a label. Inputs: `input-field` is `surface` with a 1px `outline-variant` border, label above in `label-md`, helper in `body-sm` `on-surface-variant`; focus swaps the border to `on-surface` at 2px with no glow, error swaps it to `error` and shows the message beneath in `error`. Chips: `chip` is a `surface-container` pill in `label-md` for filters and tags; `chip-selected` inverts to black, as the reference image does. Cards: `card` is `surface-container`, 24px padding, `md` corners, no border. `panel-grid` is the one component permitted to carry the paper grid background; it is used for the page header band and first-run empty states, 40px padding, `md` corners. Lists: `list-item` rows are borderless with `outline-variant` hairlines between them and a `surface-container` hover; figures in the row are `label-mono`. The ladder: `rung` is a 20px `surface-container-high` segment; `rung-reached` fills orange with black text; `rung-hatched` is the hatch on `surface` for rungs not yet reached, so the eight segments read as a measured bar with reached, current and remaining states. Rung labels are `label-mono` beneath each segment. Notes: `note` is Chris's comment, a `surface` block with a 3px `primary` rule on the left edge, `body-sm` text, author and time in `label-mono`; it is the one place orange appears as a rule. Feedback: `toast` is black on paper-white text, 44px, bottom-left, gone in 4 seconds; `banner-error` is `error-container` with `on-surface` text, a 3px `error` rule on the left, title in `label-md`, body in `body-sm`, one action button. The agents themselves are not a component: they are pencil-line illustrations placed by hand in empty states and margins.

## Do's and Don'ts

- **Do** ration `primary` to one element per screen. The reached rungs count as that element on the ladder view.
- **Do** set every number in Geist Mono with tabular figures. A count in Switzer is a bug.
- **Do** draw structure with hairlines and spacing before reaching for a card.
- **Do** keep the pencil graphite. Agents, doodles and underlines are `pencil`, never `primary`.
- **Do** use the hatch for "not yet" and the paper grid only in the header band, empty states and the marketing hero.
- **Do** put black text on orange. White text on orange fails contrast at body size and reads as a sale.
- **Don't** ship a dark mode, a purple or cyan accent, a gradient, a glow or a glass card. That is the developer-tool default this system exists to refuse.
- **Don't** let corners creep above 8px outside a dialog, and never round a rung.
- **Don't** use orange as body text; use `primary-deep` if orange text is unavoidable.
- **Don't** introduce a second accent or a yellow. Yellow is Skool.
- **Don't** substitute Inter, Instrument Serif, Outfit or Plus Jakarta Sans for Switzer under any circumstances.
- **Don't** use shadows for hierarchy or place the paper grid behind body text, tables or forms.

## Slop Doctor mapping

The tokens and rules above are unchanged. These are the Slop Doctor meanings of the brand-specific pieces, plus the scanner components.

- **The joke is the system.** The Don'ts above (no purple, no gradient, no glow, no glass, no Inter, no dark mode) are the same tells the doctor diagnoses. Slop Doctor must look like the cure. Breaking a Don't here is malpractice.
- **Slop-o-meter** reuses the ladder shape: ten square `rung` segments. Filled segments take the score's tone (`tone-low` `success`, `tone-mid` `warning`, `tone-high` `primary`, same thresholds as the symptom bar), empty ones are `rung-hatched`. The label beneath is `label-mono` (`SLOP INDEX 62/100`). The big Slop Index figure on the chart takes the same tone as its text colour; `primary` passes 3:1 at `display-lg`, and `success` and `warning` pass AA.
- **Doctor's note** reuses `note`: prescriptions on the chart, a 3px `primary` rule on the left, `body-sm`, signed in `label-mono` (`DR. JEV · PRESCRIPTION 01`).
- **The pencil-line doctor** replaces the agents: one geometric figure (circle head, square coat, a clipboard rectangle) in a single `pencil` weight, used only in the intake empty state and the error state. Never orange, never a hero.
- **Scanner frame** is a `panel-grid` without the paper grid: the screenshot sits inside a 1px `outline-variant` frame, `md` corners, scrolling vertically.
- **Unexamined area** uses the hatch on top of the screenshot at partial opacity; it lifts as the scan rule passes. Hatch still means "not yet".
- **`scan-rule`** is a 2px `primary` horizontal rule spanning the frame. It is the one orange element while an examination runs (the primary button is not on screen then). It moves with a linear ease; under `prefers-reduced-motion` it does not move and the final boxes appear at once.
- **`scan-readout`** rides on the right end of the scan rule: `label-mono` uppercase on `inverse-surface` (`SCANNING · Y 1240PX · REGION 03/07`).
- **`region-box`** is a 1px `pencil` hairline rectangle drawn around a region when its findings arrive. Square corners. No fill, no shadow. An inconclusive region uses a dashed 1px `outline` instead; a region where every check scored low (`is-clear`) uses a solid 1px `outline`.
- **`region-tag`** pins inside the region box's top-left corner: `label-mono` on `surface` with a 1px `pencil` border (`03 · PURPLE GRADIENT FEVER · 91%`, or `08 · NO SYMPTOMS`).
- **Lab results** is the doctor's live checklist: `list-item` rows grouped under `label-mono` headings (Lab tests, Region 01 · Hero, …, Whole page). Each row is the symptom name in `body-sm` and a `symptom-bar`. Rows fade in; the list scrolls itself to follow the scan.
- **`symptom-bar`** shows one score: an 80px (`xl` × 2) track of `surface-container-high`, 8px (`sm`) tall, square corners, with a fill whose width is the score, and the percentage beside it in `label-mono`. Fill colour by score: under 20% `success` (green), 20% to 70% `warning`, over 70% `primary` (the button orange-red). The fill grows from the left over 500ms when the bar first appears; under `prefers-reduced-motion` it doesn't animate. This is the one place the semantic colours describe a diagnosis rather than a system state, and the high band deliberately repeats the primary colour, so a chart shows more than one orange element: the score colours are the exception to "one orange element per screen" (founder decisions, 23 Sep 2026). The brief asked for yellow in the middle band; the system's `warning` token (a deep amber) stands in, because this system has no yellow (see Don'ts). If a true yellow is ever wanted, add it as a token here first.
- **Severity order:** symptom lists sort highest score first, so the red bars lead.
- **Verdict mark:** a 20px filled circle after the diagnosis line: `success` with an `inverse-on-surface` tick when the tier is healthy (clean or sniffles), `primary` with an `on-primary` cross otherwise. 2px strokes, round caps.
- **Mood faces:** the three determination cards carry a 40px pencil-line face on the right, drawn like the pencil-line doctor: `pencil`, 1.5px, never coloured. The head's shape carries the verdict: a square with a smile is good, a circle with a flat mouth is meh, a hexagon with a frown is bad. The card is a two-column grid: text, then the face centred vertically.
- **Share card** (the generated 1200×630 image): `surface` with a 12px `surface-container` frame and 56px padding. Header: the logo mark and the Geist Mono wordmark on the left, `slopdoctor.app` in mono on the right. Middle: "Slop chart for {host}" in Switzer 600, the diagnosis with the verdict mark, and the one-liner; on the right the `label-mono` "Slop Index", the figure in Geist Mono 600 at 132px, and a 10-square meter, all in the score's tone. Bottom: the top three symptoms as name, bar and percentage, and the three determinations with their faces. Colours come from `src/lib/tokens.ts` because the renderer can't read CSS variables.
- **Share popup:** the system `dialog` (native `<dialog>`, `lg` corners, hairline, menu shadow) widened to 760px, with the backdrop at the dialog-backdrop tint. It shows the card in an `md`-cornered hairline frame (hatched while loading), then `button-primary` "Post on X", `button-secondary` "Share on LinkedIn", and `button-ghost` "Copy link" and "Download image". The buttons stack full-width under 600px.
- **Logo:** a 28px square pencil-line doctor face (with a head mirror) sits left of the wordmark, `sm` gap. The wordmark is set in Geist Mono 600 at `title-md` size, normal case, replacing the Switzer 700 wordmark (founder decision, 23 Sep 2026).
- **Symptom accordion** (chart only): each symptom is a native `<details>`. The `summary` is a row of the name (`label-md`), the `symptom-bar` and a `label-mono` toggle (`+`, or `−` when open), with a `surface-container` hover and the standard focus ring; rows are separated by `outline-variant` hairlines. The open panel shows the one-sentence description in `body-sm` and where it was found in `label-mono` `on-surface-variant`. No animation, no chevron icons.
