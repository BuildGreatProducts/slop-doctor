# Copy guide — Slop Doctor

Every user-facing string follows this file. Strings live in `src/lib/copy.ts` so they can be reviewed in one place. Symptom names, weights and prescriptions live in `docs/SLOP-TAXONOMY.md` and are not repeated here.

## Voice

A deadpan consultant with a clipboard. The joke is treating design habits as medical conditions with complete seriousness. The doctor is dry, precise and kind to the patient's owner; the doctor only ever mocks the pixels.

| We are | We are not |
|---|---|
| Clinical, dry, precise | Zany, wacky, exclamation-marked |
| Deadpan: the joke is in the framing, not in "lol" | Winking at the reader or explaining the joke |
| Specific: names the symptom and where it is | Vague ("some issues found") |
| Kind to people, blunt about design | Sneering at the person who made the site |
| Brief: a chart, not an essay | Chatty |

Rules of thumb:
- One joke per string at most. Error messages have none in the part that says what to do.
- Medical words replace product words (see Lexicon). Never mix: it's an "examination", never a "scan" in UI copy.
- Never use the slop we diagnose: no em dashes, no "seamless", no ✨, no "not just X, it's Y". A doctor who smokes loses the room.

## Lexicon

| Use | For | Never |
|---|---|---|
| patient | the website being examined | site, target, URL (except in the field label) |
| examination | one run of the pipeline | scan, analysis, audit, test |
| examine | start an examination | scan, analyse, check |
| chart | the results page | results, scorecard ("slop report" only in the landing page's call to action) |
| symptom | a detected slop pattern | issue, problem, finding, error |
| diagnosis | the tier name | verdict, grade, rating |
| Slop Index | the 0–100 score | score, slop score, rating |
| Slop-o-meter | the ten-segment meter | progress bar, gauge |
| prescription | a recommended fix | tip, recommendation, fix |
| vital signs | signs a human designed it | positives, strengths |
| lab results | the list of symptoms and tests as they arrive | findings, log |
| second opinion | examining the same patient again | rescan, retry |
| discharge papers | the share link | share URL, permalink |
| patient records | the signed-in user's past charts | history, past scans |
| the doctor | the product speaking | we, Slop Doctor AI, the AI |
| Dr. Slop | the doctor by name: signatures, the waiting room and errors | Dr. Jev, the algorithm, the model |

## Mechanics

- Sentence case everywhere, including buttons and headings. Uppercase only in `label-mono` readouts, which are styled uppercase by CSS, not typed in capitals.
- No terminal periods on buttons, labels, tags or headings. Full sentences in body text end with a period.
- Buttons are {Verb} {noun}: "Start examination", "Copy discharge papers".
- Second person, present tense, active voice.
- Numerals always: "10 examinations", "3 symptoms".
- Scores are shown as a whole-number percentage (`91%`), in mono, next to a symptom bar or in a region tag.
- Never "Are you sure?". Never a bare "OK".

## Surfaces

### Header
- Wordmark: Slop Doctor
- Signed out: button "Sign in"
- Signed in: button "Sign out"

### Footer (every page)
- Line (mono): Slop Doctor · Not a real doctor
- Links: "Privacy", "Terms"

### Legal pages (`/privacy`, `/terms`)
- Eyebrow (mono): Slop Doctor · Last updated {date}
- Plain English, second person, short paragraphs. The lexicon still applies (examination, chart, symptom), but no jokes in anything that states a right, a limit or an obligation. One dry line is allowed in a heading ("The doctor is not a real doctor").
- The operator name and contact address live in `src/lib/copy.ts` (`legal`), so they change in one place.

### Intake (home)
- Eyebrow (mono): Now seeing patients
- Headline: The doctor can see you now
- Subhead: Paste a landing page and the doctor will check it for AI slop: purple gradients, pill badges, buzzwords and the rest.
- Field label: Patient's URL
- Field placeholder: yoursite.com
- Field help: We photograph the page and examine the design. It takes about 30 seconds.
- Primary button: Get my slop report (signed in or out)
- Sign-in popup (opens when a signed-out visitor submits a valid URL, or presses "Sign in" in the header):
  - Title: Sign in to get your slop report
  - Note: Signing in keeps the clinic open. You get 10 examinations a day.
  - Buttons: "Continue with Google", "Close"
- Example (under the field): label (mono) "Example report"; caption "Every examination ends with a chart like this one, ready to share."; image alt "An example slop chart for synergize.example.com: Slop Index 98, diagnosis Code Purple"
- "Slop report" is the founder's wording for the landing page's call to action (23 Sep 2026). Everywhere else the result is still a chart.
- Records heading: Your patient records
- Records empty: No patients yet. Your charts will appear here.
- Record row: {host} · Slop Index {n} · {relative time}
- Record row, running: {host} · {stage readout} · {relative time}
- Record row, failed: {host} · Examination failed · {relative time}

### Waiting room (stage readouts, mono)
| Status | Readout | Line beneath |
|---|---|---|
| queued | Checking in patient | Please take a seat. |
| capturing | Taking X-rays | Please remain still while we photograph your hero section. |
| examining | Examining | The doctor is looking at every section. Try not to blush. |
| diagnosing | Running labs | Dr. Slop is reviewing the results. |
| complete | Writing up chart | Your chart is ready. |

Rotating quips while waiting (every 4 s, in order):
1. Counting your gradients.
2. Checking the hero for pills.
3. Looking for signs of human life.
4. Measuring the glow.
5. Asking the font where it's been.

### Examination (scanner)
- Scan readout: Scanning · Y {px}px · Region {nn}/{total}
- Region tag: {nn} · {Symptom name} · {pct}% (+{n} when more symptoms are present)
- Region tag, nothing found: {nn} · No symptoms
- Lab results heading: Lab results
- Lab results empty: Waiting for the first result.
- Lab results group headings (mono): Lab tests · Region {nn} · {Section name} · Whole page
- Section names: Navigation, Hero, Logo strip, Features, Testimonials, Pricing, Stats, Steps, Call to action, Footer, Section
- Meter label: Slop Index {n}/100

### Chart
- Heading: Slop chart for {host}
- Index label: Slop Index
- Diagnosis line: Diagnosis: {tier name}, followed by a tick (accessible name "Healthy") for a clean bill of health or the sniffles, or a cross ("Needs treatment") for anything worse
- Archetype label: Presents as
- Birthplace label: Suspected place of birth
- Birthplace confirmed tag: Confirmed by lab
- Prognosis label: Prognosis
- Each determination card shows a face on the right: a square happy face (accessible name "Good sign"), a round meh face ("Could be worse") or a hexagonal sad face ("Bad sign"). Happy: The Actually Designed, A human designer, Full recovery. Meh: The Linear Lookalike, The Stripe Tribute Act, The Notion Wannabe, Framer, Webflow template, Website builder theme, Manageable with treatment, and any unknown answer. Sad: everything else.
- Every determination card always shows a name and a one-liner. Certainty is not shown. Never "Inconclusive". A missing prognosis is taken from the tier.
- Disagreement note: The doctor and the lab disagree.
- Symptom groups: "Visual symptoms", "Copy symptoms", "Lab results"
- Symptom rows expand to show the symptom's one-sentence description (`docs/SLOP-TAXONOMY.md` § Descriptions) and where it was found:
  - Found in {Section} {pct}% · {Section} {pct}% (sections where it scored 35% or more, highest first)
  - Not found in any section.
  - Checked across the whole page. (page-level symptoms)
  - Checked in the page's code and copy. (lab tests)
- No symptoms: No symptoms found. The doctor is suspicious but impressed.
- Vital signs heading: Vital signs
- No vital signs: No signs of human life detected.
- Prescription heading: Doctor's note
- Prescription signature: Dr. Slop · Prescription {nn}
- Buttons: "Share discharge papers", "Get a second opinion", "Examine another patient"
- Share popup title: Share your slop chart
- Share popup buttons: "Post on X", "Share on LinkedIn", "Copy link" (reads "Link copied" for 2 seconds), "Download image", "Close"
- Share popup image loading: Printing your chart…
- Share popup clipboard fallback: Copy the link above
- Share text (X): Dr. Slop diagnosed {host} with {tier} (Slop Index {n}). Get your landing page examined:
- Share image fallback (chart missing or unfinished): eyebrow "Now seeing patients", headline "The doctor can see you now"
- Cached note: This patient was examined in the last 24 hours, so here's that chart.

### Academy referral (bottom of every chart)
- Eyebrow (mono): Referral
- Headline: Build something the doctor can't diagnose
- Body: Dr. Slop refers you to the AI Product Academy. Learn to build products with Claude Code, Codex and Cursor that people will actually pay for. Launch in 30 days or get your money back.
- Button: Join the AI Product Academy (opens https://www.skool.com/aiapps/about in a new tab)
- The promise and guarantee are quoted from the academy's own page; update both together if the offer changes.

### Tier names and one-liners
| Tier | Name | One-liner |
|---|---|---|
| clean | Clean bill of health | Free-range, hand-reared pixels. |
| sniffles | Mild case of the AI sniffles | A few default habits. Nothing a weekend won't fix. |
| slopitis | Acute Slopitis | The template is showing. Treatment recommended. |
| chronic | Chronic Template Syndrome | Most of this page came out of the box. |
| code_purple | Code Purple | Terminal slop. We've called the designer. |

### Archetype, birthplace and prognosis labels
Use the names in `docs/SLOP-TAXONOMY.md` § Determinations exactly. Display labels for birthplace: v0, Lovable, Bolt, Framer, Webflow template, Tailwind starter kit, Website builder theme, A human designer.

One-liners (every answer has one):

| Archetype | One-liner |
|---|---|
| The SaaS Clone | Could be any of 4,000 dashboards. Probably is. |
| The YC Demo Day | Raising a pre-seed round in the hero section. |
| The Crypto Fever Dream | Glows in the dark. Promises the moon. |
| The Linear Lookalike | Moody, precise and suspiciously familiar. |
| The Stripe Tribute Act | Gradient waves as far as the eye can see. |
| The Notion Wannabe | Hand-drawn doodles, hand-me-down layout. |
| The Template Special | The placeholder personality is still in the box. |
| The Actually Designed | Someone made decisions here. Brave ones. |
| (no usable answer) A medical mystery | Presents as nothing the doctor has seen before. |

| Birthplace | One-liner |
|---|---|
| v0 | Born in a shadcn nursery, raised on Geist. |
| Lovable | Delivered by Lovable, gradients and all. |
| Bolt | Assembled at speed by Bolt. |
| Framer | Smoothly animated out of Framer. |
| Webflow template | Adopted from the Webflow template shelter. |
| Tailwind starter kit | Grew up in a Tailwind starter kit. |
| Website builder theme | Came flat-packed from a website builder. |
| A human designer | Raised by a human designer. Increasingly rare. |
| (no usable answer) Place of birth unknown | Found on the hospital steps with no paperwork. |

| Prognosis | One-liner |
|---|---|
| Full recovery | Discharge expected by lunchtime. |
| Manageable with treatment | A short course of prescriptions should clear it up. |
| Chronic | Long-term care recommended. |
| Terminal | We've made the patient comfortable. |

### Errors
Each says what happened, why, and what to do next.

| Key | Message | Action |
|---|---|---|
| `invalid_url` | That doesn't look like a web address. Use a full URL such as example.com. | (inline under the field) |
| `private_url` | The doctor only makes house calls to public websites. Use a public URL. | (inline) |
| `rate_limited` | You've had 10 examinations today. The clinic reopens in {hours} hours. | (inline) |
| `clinic_full` | The clinic is full today. Please come back tomorrow. | (inline) |
| `signed_out` | Sign in to start an examination. It keeps the clinic open. | Sign in |
| `capture_failed` | We couldn't photograph this patient. The site blocked us or took too long to load. Check the URL and try again. | Get a second opinion |
| `examine_failed` | The examination stopped partway. Our vision specialist didn't respond. Try again in a minute. | Get a second opinion |
| `diagnose_failed` | The lab didn't return results. Dr. Slop may be busy. Try again in a minute. | Get a second opinion |
| `not_found` | We can't find that chart. The link may be wrong. | Examine another patient |
| `generic` | Something went wrong on our side. Try again in a minute. | Get a second opinion |

## Copy review rubric

Run against every screen before marking a UI task done:

1. Every product noun and verb comes from the Lexicon.
2. Sentence case; no periods on buttons, labels, tags; buttons are {Verb} {noun}.
3. Numerals, second person, active voice, present tense.
4. Errors say what happened, why, and what to do next, with a real action.
5. No em dashes, no buzzword list terms, no emoji, no "not just X, it's Y".
6. At most one joke per string, and never in the instruction part of an error.
