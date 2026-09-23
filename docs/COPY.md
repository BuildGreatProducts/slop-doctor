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
| chart | the results page | report, results, scorecard |
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
| Dr. Jev | the model, in signatures only | the algorithm |

## Mechanics

- Sentence case everywhere, including buttons and headings. Uppercase only in `label-mono` readouts, which are styled uppercase by CSS, not typed in capitals.
- No terminal periods on buttons, labels, tags or headings. Full sentences in body text end with a period.
- Buttons are {Verb} {noun}: "Start examination", "Copy discharge papers".
- Second person, present tense, active voice.
- Numerals always: "10 examinations", "3 symptoms".
- Probabilities are shown as `P 0.91` in mono tags and as "91% sure" in prose.
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
- Primary button (signed in): Start examination
- Primary button (signed out): Sign in to see the doctor
- Sign-in choice: "Continue with Google"
- Sign-in note: Signing in keeps the clinic open. You get 10 examinations a day.
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
| diagnosing | Running labs | Dr. Jev is reviewing the results. |
| complete | Writing up chart | Your chart is ready. |

Rotating quips while waiting (every 4 s, in order):
1. Counting your gradients.
2. Checking the hero for pills.
3. Looking for signs of human life.
4. Measuring the glow.
5. Asking the font where it's been.

### Examination (scanner)
- Scan readout: Scanning · Y {px}px · Region {nn}/{total}
- Region tag: {nn} · {Symptom name} · P {0.00}
- Inconclusive region tag: {nn} · {Symptom name} · Inconclusive
- Lab results heading: Lab results
- Lab results empty: Waiting for the first result.
- Source chips: "Exam", "Lab"
- Meter label: Slop Index {n}/100

### Chart
- Heading: Chart for {host}
- Index label: Slop Index
- Diagnosis line: Diagnosis: {tier name}
- Archetype label: Presents as
- Birthplace label: Suspected place of birth
- Birthplace confirmed tag: Confirmed by lab
- Certainty label: Doctor's certainty {nn}%
- Inconclusive: Inconclusive: second opinion advised
- Prognosis label: Prognosis
- Disagreement note: The doctor and the lab disagree.
- Symptom groups: "Visual symptoms", "Copy symptoms", "Lab results"
- No symptoms: No symptoms found. The doctor is suspicious but impressed.
- Vital signs heading: Vital signs
- No vital signs: No signs of human life detected.
- Prescription heading: Doctor's note
- Prescription signature: Dr. Jev · Prescription {nn}
- Buttons: "Copy discharge papers", "Get a second opinion", "Examine another patient"
- Copied toast: Discharge papers copied. Share responsibly.
- Cached note: This patient was examined in the last 24 hours, so here's that chart.

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
| `diagnose_failed` | The lab didn't return results. Dr. Jev may be busy. Try again in a minute. | Get a second opinion |
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
