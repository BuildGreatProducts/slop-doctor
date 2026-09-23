# Slop taxonomy

The reference the doctor diagnoses from. This file is the source of truth for `convex/lib/taxonomy.ts`: every symptom key, name, weight, Jev question and prescription in code must match this file. Change it here first.

## Where the tells come from

AI builders (v0, Lovable, Bolt, Cursor and Claude Code without a design system) default to the most statistically common choices in their training data, which is mostly shadcn/ui plus Tailwind SaaS templates. Framer AI and Webflow templates have their own house defaults. The patterns below are drawn from 2026 writing on "AI slop" design:

- [AI Design Slop: 16 patterns that out your app as vibe-coded](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)
- [AI slop web design guide](https://www.925studios.co/blog/ai-slop-web-design-guide)
- [Why your AI keeps building the same purple gradient website](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)
- [AI slop design: why AI-generated UI looks generic](https://vibecodekit.dev/ai-slop-design)

Note the 2026 twist: anti-slop advice has created a new default of its own: a cream background, an Instrument Serif italic accent word and a sage accent. The doctor catches that too (`serif_accent`, `font_fashion`).

## How detection works

There are two kinds of test:

- **Lab** (`source: "lab"`). Deterministic code over the page's HTML, markdown and Firecrawl branding. Probability is always 1 when found. Anything that needs counting or maths is a lab test, because Jev does not count reliably.
- **Exam** (`source: "exam"`). A Jev Noul, asked either per region (the state is one region's description) or once for the page (the state is the page summary).

### Probability bands (Noul answers)

| `noul` | Meaning | Shown as | Counts toward index |
|---|---|---|---|
| ≥ 0.65 | Present | Symptom | Yes, weighted by p |
| 0.35 – 0.65 | Inconclusive | "Inconclusive: second opinion advised" | No |
| < 0.35 | Absent | Shown as a low score | No |

Every symptom check is stored, whatever its score, so the doctor can show all of them while scanning and on the chart. Only present findings count toward the index. A region-level symptom takes the **highest** p across the regions it was asked about. Lab tests are stored as 100% (found) or 0% (not found).

On screen every score is a percentage with a bar: green under 20%, yellow (the `warning` token) from 20% to 70%, red over 70% (`docs/DESIGN.md` § Slop Doctor mapping). The colours describe the score only; the bands above decide what counts.

### Choice and Score confidence

Score answers (`templatedness`) with `confidence < 0.5` don't feed the index. Choice answers are always shown: at 50% or more as the doctor's certainty, below that as "a hunch". A missing or invalid choice falls back to a fun default, and a missing prognosis is taken from the tier (`docs/COPY.md` § Chart).

## Jev state shapes

Colours are always converted to English names in code before they reach Jev (the jaggedness docs say hex codes underperform). Numbers Jev sees are informational only; thresholds live in code.

**Region call state:**

```json
{
  "region": {
    "kind": "hero",
    "description": "Factual description from the vision model",
    "visible_text": "Up to 600 characters of text in the region"
  },
  "page": {
    "fonts": ["Inter"],
    "palette": ["violet", "indigo", "near-black", "white"],
    "colour_scheme": "dark"
  }
}
```

**Page call state:**

```json
{
  "page": {
    "host": "example.com",
    "title": "Page title",
    "fonts": ["Inter"],
    "palette": ["violet", "indigo", "near-black", "white"],
    "colour_scheme": "dark",
    "hero_text": "Visible text of the hero region",
    "copy": "Page markdown, trimmed to 4,000 characters",
    "regions": [{ "kind": "hero", "description": "..." }]
  }
}
```

## Visual symptoms (exam, per region)

Each is a Noul. `appliesTo` lists the region kinds the question is asked about (`any` means every region). Region kinds: `nav`, `hero`, `logos`, `features`, `testimonials`, `pricing`, `stats`, `steps`, `cta`, `footer`, `other`.

| Key | Name | Weight | appliesTo |
|---|---|---|---|
| `purple_gradient` | Purple Gradient Fever | 3 | any |
| `gradient_text` | Gradient Text Jaundice | 2 | hero, cta, features |
| `glow_orbs` | Aura Glowmatosis | 2 | any |
| `glassmorphism` | Glassmorphic Cataracts | 2 | any |
| `bento` | Bento Box Disorder | 2 | features, other |
| `sparkle` | Sparkle Infection | 1 | any |
| `emoji_icons` | Emoji Rash | 1 | any |
| `pill_badge` | Pill Badge Pox | 2 | hero |
| `centered_hero` | Centred Hero Syndrome | 2 | hero |
| `serif_accent` | Italic Serif Tic | 1 | hero, cta |
| `logo_wall` | Phantom Logo Wall | 1 | logos, hero |
| `icon_tiles` | Icon Tile Uniformity | 2 | features |
| `triplets` | Triplet Syndrome | 2 | features, testimonials, pricing |
| `accent_border` | Left-Border Palsy | 1 | any |
| `numbered_steps` | One-Two-Three Compulsion | 1 | steps, features, other |
| `stat_banner` | Vanity Stat Rash | 1 | stats, hero, other |
| `grid_bg` | Graph Paper Lattice | 1 | hero |
| `stock_3d` | Abstract Blob Implants | 1 | hero, features |

### Questions

Each entry gives the Noul `instructions`, then `criteria.true` / `criteria.false`, then the prescription.

**`purple_gradient`: Purple Gradient Fever**
- Q: Does `region` use a gradient that includes purple, violet or indigo as a background, button fill or large decorative shape?
- True: The description of `region` mentions a gradient containing purple, violet, lavender or indigo.
- False: `region` has no gradient, or its gradients contain no purple, violet, lavender or indigo.
- Rx: Take one solid colour daily and call me in the morning.

**`gradient_text`: Gradient Text Jaundice**
- Q: Is any heading text in `region` filled with a colour gradient rather than a single solid colour?
- True: The description of `region` says a heading or words in it are gradient-filled.
- False: All text in `region` is a single solid colour per word.
- Rx: Let your headline be one colour. It's braver than it sounds.

**`glow_orbs`: Aura Glowmatosis**
- Q: Does `region` contain a soft glow, a blurred coloured orb or blob, or a coloured shadow used as decoration?
- True: The description of `region` mentions a glow, blurred orb or blob, halo, or coloured box shadow.
- False: `region` has no glows, blurred orbs or coloured shadows.
- Rx: Remove the glowing orb. It is not a feature.

**`glassmorphism`: Glassmorphic Cataracts**
- Q: Does `region` use frosted-glass panels: translucent cards with a blurred background showing through?
- True: The description of `region` mentions translucent, frosted, glass-like or backdrop-blurred panels.
- False: The panels in `region` are opaque, or there are no panels.
- Rx: Replace frosted glass with an opaque surface. Your text will thank you.

**`bento`: Bento Box Disorder**
- Q: Is `region` laid out as a bento grid: rounded tiles of different sizes packed into a grid, each holding one feature?
- True: The description of `region` mentions a grid of rounded tiles or cards of unequal sizes.
- False: `region` is not a grid of mixed-size tiles.
- Rx: One idea per section, laid out for the idea, not the lunchbox.

**`sparkle`: Sparkle Infection**
- Q: Does `region` use a sparkle or star-burst icon or emoji (✨) to mark something as AI or magic?
- True: The description or visible text of `region` includes a sparkle icon or ✨ emoji.
- False: `region` has no sparkle icon or emoji.
- Rx: Say what the AI does instead of sprinkling it with sparkles.

**`emoji_icons`: Emoji Rash**
- Q: Does `region` use emoji as icons, bullets or section markers?
- True: The description or visible text of `region` shows emoji standing in for icons or bullets.
- False: `region` uses no emoji as icons or bullets.
- Rx: Swap emoji bullets for words, or for icons drawn for your product.

**`pill_badge`: Pill Badge Pox**
- Q: Is there a small rounded pill or badge above the main headline in `region`, typically announcing something new?
- True: The description of `region` mentions a pill, badge or tag placed above the headline.
- False: There is no pill or badge above the headline in `region`.
- Rx: Delete the "New ✨" pill. If it's news, put it in the headline.

**`centered_hero`: Centred Hero Syndrome**
- Q: Does `region` follow the stock hero layout: a centred headline, a centred subheading and one or two centred buttons?
- True: The description of `region` says the headline, subheading and buttons are centre-aligned.
- False: The hero in `region` is left-aligned, asymmetric or otherwise not the centred stack.
- Rx: Try a left-aligned hero. Your eyes read left to right, and so do your customers'.

**`serif_accent`: Italic Serif Tic**
- Q: Does a headline in `region` set one or a few words in an italic serif font while the rest of the headline is sans-serif?
- True: The description of `region` mentions an italic or serif accent word inside a sans-serif headline.
- False: The headline in `region` uses one typeface style throughout.
- Rx: Pick one typeface for the headline and commit to it.

**`logo_wall`: Phantom Logo Wall**
- Q: Does `region` show a "trusted by" strip of company logos that look generic, greyed-out or like placeholders?
- True: The description of `region` mentions a row of greyed-out, generic or unrecognisable company logos.
- False: `region` has no logo strip, or its logos are clearly recognisable real companies.
- Rx: Show one real customer with a name and a quote instead of ten grey logos.

**`icon_tiles`: Icon Tile Uniformity**
- Q: Does `region` show feature cards that each have a thin line icon inside a small rounded square at the top of the card?
- True: The description of `region` mentions line icons inside rounded squares or circles on top of cards.
- False: The cards in `region` have no icon tiles, or there are no cards.
- Rx: Show the feature working. An icon in a box is not a feature.

**`triplets`: Triplet Syndrome**
- Q: Does `region` contain exactly three identical side-by-side cards (for example three features, three testimonials or three pricing tiers)?
- True: The description of `region` mentions three cards of the same size and structure in a row.
- False: `region` does not contain a row of three identical cards.
- Rx: Nothing in nature comes in identical threes. Vary the rhythm.

**`accent_border`: Left-Border Palsy**
- Q: Do cards or callouts in `region` have a coloured border on only their left or top edge?
- True: The description of `region` mentions a coloured left or top edge on cards or callouts.
- False: The cards in `region` have no single-edge coloured borders.
- Rx: Lose the coloured edge on every card. Save emphasis for one thing.

**`numbered_steps`: One-Two-Three Compulsion**
- Q: Does `region` present a numbered sequence of steps such as "1, 2, 3" or "Step 1, Step 2, Step 3"?
- True: The description or visible text of `region` shows numbered steps.
- False: `region` has no numbered step sequence.
- Rx: If it takes three steps, show the product doing them.

**`stat_banner`: Vanity Stat Rash**
- Q: Does `region` show a row of large headline statistics such as "10k+ users", "99.9% uptime" or "5x faster"?
- True: The description or visible text of `region` shows a row of big numbers with short labels.
- False: `region` has no row of headline statistics.
- Rx: One real number with a source beats four round ones.

**`grid_bg`: Graph Paper Lattice**
- Q: Does `region` have a faint grid, dot or line pattern in its background?
- True: The description of `region` mentions a grid, dot or line pattern in the background.
- False: The background of `region` has no grid, dot or line pattern.
- Rx: Clear the graph paper from behind your hero. It's not a maths exam.

**`stock_3d`: Abstract Blob Implants**
- Q: Does `region` use abstract 3D shapes, blobs or generic gradient illustrations instead of showing the product or real people?
- True: The description of `region` mentions abstract 3D shapes, blobs, spheres or generic gradient artwork.
- False: `region` shows the product, real photography, custom illustration, or no imagery.
- Rx: Show your product. The floating 3D torus doesn't do anything.

## Page symptoms (exam, one page-level call)

| Key | Name | Weight |
|---|---|---|
| `dark_default` | Midnight Pallor | 2 |
| `vague_value` | Vague Value Prop | 2 |
| `rule_of_three` | Tricolon Tic | 1 |
| `not_x_but_y` | Contrast Reflex | 1 |

**`dark_default`: Midnight Pallor**
- Q: Is the page a dark theme (near-black or very dark background) with bright neon or purple accents?
- True: `page.colour_scheme` is dark and `page.palette` or the region descriptions include neon, purple, violet or cyan accents.
- False: The page has a light background, or a dark background without neon or purple accents.
- Rx: Try daylight. Dark mode is a setting, not a personality.

**`vague_value`: Vague Value Prop**
- Q: Does `page.hero_text` fail to say what the product does and who it is for?
- True: The hero text is aspirational or generic (for example "Build the future", "Unlock your potential") and a reader could not tell what the product does.
- False: The hero text names what the product does, or who it is for, in concrete terms.
- Rx: Say what it does and who it's for in the headline. "The future of work" is not a product.

**`rule_of_three`: Tricolon Tic**
- Q: Does `page.copy` repeatedly use three-beat slogans like "Fast. Simple. Powerful." or "Build, ship and scale"?
- True: The copy contains two or more lists of three punchy adjectives or verbs used as slogans.
- False: The copy has at most one such three-beat slogan.
- Rx: Cut one of your three adjectives. Then cut another.

**`not_x_but_y`: Contrast Reflex**
- Q: Does `page.copy` use the construction "It's not just X, it's Y" or "not X, but Y" as a rhetorical device?
- True: The copy contains a "not just X, it's Y" or "not X, but Y" sentence used for emphasis.
- False: The copy has no such construction.
- Rx: Say what it is. Skip what it isn't.

## Lab symptoms (code)

| Key | Name | Weight | Rule (in code) |
|---|---|---|---|
| `em_dash` | Em-Dash Haemorrhage | 1 | ≥ 3 em dashes (—) **and** ≥ 0.5 em dashes per 100 words in the page markdown |
| `buzzwords` | Buzzword Bloat | 2 | ≥ 3 distinct terms from the buzzword list (case-insensitive, whole words) |
| `lorem` | Placeholder Residue | 3 | Any of: "lorem ipsum", "Acme Inc", "Acme Corp", "Your Company", "Company Name", "John Doe", "Jane Doe" |
| `inter_itis` | Inter-itis | 2 | The primary font (first family in branding typography) is in the default list |
| `font_fashion` | Fashionable Font Fever | 1 | Any page font is in the trend list |

**Buzzword list:** seamless, seamlessly, unlock, supercharge, elevate, effortless, effortlessly, revolutionize, revolutionise, leverage, game-changer, game-changing, next-level, harness, empower, streamline, cutting-edge, robust, all-in-one, unleash, reimagine, transform your, 10x, in today's fast-paced.

**Default font list:** Inter, Geist, Geist Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, Helvetica, Helvetica Neue, sans-serif.

**Trend font list:** Space Grotesk, Instrument Serif, Instrument Sans, DM Sans, Plus Jakarta Sans, Outfit, Manrope, Satoshi, Sora, Bricolage Grotesque.

Prescriptions:
- `em_dash`: Ration your em dashes to one per page. Commas are free.
- `buzzwords`: Replace every "seamless" with what actually happens.
- `lorem`: Remove the placeholder text before the patient goes outside.
- `inter_itis`: Try a typeface with a pulse. Inter is lovely; so is everyone else's site.
- `font_fashion`: Your font is on trend. That's the problem.

## Lab notes (not symptoms)

**Generator fingerprint.** Confirms the birthplace; weight 0. Evidence is the page's own host, its `<meta name="generator">` tag, or an asset URL in a `src`/`href` attribute. An ordinary link to a builder's website (for example "Built with Bolt") is not evidence. Checked in this order, first match wins:

| Evidence | Birthplace |
|---|---|
| host `*.lovable.app`; generator meta "Lovable"; a script from `gptengineer` or `lovable` | `lovable` |
| host `*.bolt.host`; generator meta "Bolt" | `bolt` |
| host `*.v0.app` or `*.vusercontent.net`; generator meta "v0" | `v0` |
| host `*.framer.website`, `*.framer.app` or `*.framer.ai`; generator meta "Framer"; assets from `framerusercontent.com` | `framer` |
| host `*.webflow.io`; generator meta "Webflow"; assets from `website-files.com` | `webflow` |
| generator meta containing Wix, Squarespace or WordPress | `website_builder` |

## Vital signs (signs of human life)

Each present vital sign subtracts 5 from the Slop Index.

| Key | Name | Detection |
|---|---|---|
| `distinctive_type` | Distinctive typeface | Lab: the primary font is in neither the default nor the trend list |
| `custom_imagery` | Custom imagery | Exam (page): Does the page show real photography or custom illustration made for this product, rather than stock or abstract artwork? |
| `product_ui` | Shows the actual product | Exam (page): Does the page show screenshots or recordings of the real product interface? |
| `concrete_copy` | Concrete copy | Exam (page): Does `page.copy` include specific details such as real customer names, precise numbers with context, or named use cases? |
| `unconventional_layout` | Unconventional layout | Exam (page): Does the page layout depart clearly from the standard template of centred hero, logo strip, three feature cards, testimonials, pricing and CTA? |

Criteria for the exam vital signs (`true` / `false`):

- `custom_imagery`: The region descriptions mention real photography or illustration specific to this product. / The imagery is stock, abstract, generic, or absent.
- `product_ui`: The region descriptions mention product screenshots, UI previews or recordings of the product. / No part of the page shows the product's actual interface.
- `concrete_copy`: The copy includes specific names, precise figures with context, or named use cases. / The copy is general and could describe many products.
- `unconventional_layout`: The sequence and layout of `page.regions` is clearly different from that standard template. / The page follows that standard template, or close to it.

A vital-sign Noul counts as present at ≥ 0.65.

## Determinations (exam, page-level)

### `archetype` (Choice): patient archetype
Instructions: Which description best matches the overall design of the page?

| Option | Criterion |
|---|---|
| `saas_clone` | The SaaS Clone: a generic software landing page indistinguishable from a starter template |
| `demo_day` | The YC Demo Day: a startup page with bold claims, a waitlist or demo button and investor-friendly buzzwords |
| `crypto_fever` | The Crypto Fever Dream: dark, neon and futuristic, with web3 or AI-agent grandeur |
| `linear_lookalike` | The Linear Lookalike: dark, minimal and precise, with subtle glows and product screenshots |
| `stripe_tribute` | The Stripe Tribute Act: light, airy, with colourful gradient waves and polished illustrations |
| `notion_wannabe` | The Notion Wannabe: off-white, hand-drawn doodles, friendly serif or rounded type |
| `template_special` | The Template Special: an obvious Framer or Webflow template with the placeholder personality intact |
| `actually_designed` | The Actually Designed: a distinctive, considered design that doesn't follow a common template |

### `birthplace` (Choice): suspected place of birth
Instructions: Which tool most likely produced this page's design?

| Option | Criterion |
|---|---|
| `v0` | Vercel v0: shadcn/ui components, neutral greys, Geist or Inter, rounded cards with thin borders |
| `lovable` | Lovable: colourful gradients, rounded cards, playful but generic React + Tailwind layout |
| `bolt` | Bolt: a basic Tailwind page with stock layout and few distinguishing details |
| `framer` | Framer or Framer AI: polished template motion, large type, smooth sections |
| `webflow` | A Webflow template: classic marketing sections with template spacing |
| `tailwind_starter` | A shadcn or Tailwind starter kit, possibly generated by a coding agent |
| `website_builder` | A website builder theme such as Wix, Squarespace or WordPress |
| `human_designer` | A human designer: distinctive choices that don't match any tool's defaults |

If a lab generator fingerprint matched, the lab result replaces this answer and is labelled "confirmed by lab".

### `templatedness` (Score)
Instructions: How closely does the page follow common landing-page template defaults?
Levels: 0 "Unmistakably bespoke", 1 "Mostly original with a few common patterns", 2 "Half template, half original", 3 "Mostly template defaults", 4 "Indistinguishable from the starter template".

### `copy_temperament` (Score)
Instructions: How does the copy in `page.copy` read?
Levels: 0 "Human with opinions: specific, voiceful, occasionally funny", 1 "Competent marketing copy", 2 "Generic marketing copy full of familiar phrases", 3 "Press-release android: interchangeable buzzwords with no specifics".

### `prognosis` (Choice): the doctor's opinion
Instructions: If this page's design were a patient, what is its prognosis?

| Option | Criterion |
|---|---|
| `full_recovery` | Full recovery: healthy already, or one small change away |
| `manageable` | Manageable with treatment: a few default habits to break |
| `chronic` | Chronic: the template defaults run through most of the page |
| `terminal` | Terminal: the page is almost entirely template defaults |

Shown next to the computed tier. When they disagree, the chart says "The doctor and the lab disagree."

## Scoring (in `convex/lib/scoring.ts`)

1. **Symptom points** `raw = Σ weight × p` over counted symptoms (region-level: max p per symptom; lab: p = 1).
2. **Symptom score** `s = min(1, raw / 16)`. Sixteen weighted points is a fully sloppy page.
3. **Template score** `t = templatedness.score / 4`, only when its confidence ≥ 0.5.
4. **Slop Index** `round(100 × (0.7 × s + 0.3 × t)) − 5 × vitalSigns`, or `round(100 × s) − 5 × vitalSigns` when `t` is inconclusive. Clamp to 0–100.
5. **Tier:**

| Index | Key | Diagnosis |
|---|---|---|
| 0–15 | `clean` | Clean bill of health |
| 16–35 | `sniffles` | Mild case of the AI sniffles |
| 36–55 | `slopitis` | Acute Slopitis |
| 56–75 | `chronic` | Chronic Template Syndrome |
| 76–100 | `code_purple` | Code Purple |

6. **Prescriptions:** the three counted symptoms with the highest `weight × p` (ties broken by taxonomy order) supply their Rx lines. With none, the prescription is: "No treatment needed. Keep doing whatever you're doing, and stay away from purple."

The same scoring module runs on the client to fill the Slop-o-meter as findings are revealed, so the running figure always equals the final one once every finding is shown.
