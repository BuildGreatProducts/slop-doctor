// Every user-facing string. Source of truth: docs/COPY.md. Symptom names and prescriptions live in convex/lib/taxonomy.ts.

export const header = {
  wordmark: "Slop Doctor",
  signIn: "Sign in",
  signOut: "Sign out",
};

export const footer = {
  line: "Slop Doctor · Not a real doctor",
  privacy: "Privacy",
  terms: "Terms",
  navLabel: "Footer",
};

export const legal = {
  updated: "23 September 2026",
  eyebrow: (updated: string) => `Slop Doctor · Last updated ${updated}`,
  operator: "Chris Ashby",
  contact: "chris@telescope.design",
};

export const intake = {
  eyebrow: "Now seeing patients",
  headline: "The doctor can see you now",
  subhead:
    "Paste a landing page and the doctor will check it for AI slop: purple gradients, pill badges, buzzwords and the rest.",
  fieldLabel: "Patient's URL",
  fieldPlaceholder: "yoursite.com",
  fieldHelp: "We photograph the page and examine the design. It takes about 30 seconds.",
  submitSignedIn: "Start examination",
  submitSignedOut: "Sign in to see the doctor",
  continueWithGoogle: "Continue with Google",
  signInNote: "Signing in keeps the clinic open. You get 10 examinations a day.",
  recordsHeading: "Your patient records",
  recordsEmpty: "No patients yet. Your charts will appear here.",
  recordSlopIndex: (n: number) => `Slop Index ${n}`,
  recordFailed: "Examination failed",
};

export type StageKey = "queued" | "capturing" | "examining" | "diagnosing" | "complete";

export const waitingRoom = {
  stages: {
    queued: { readout: "Checking in patient", line: "Please take a seat." },
    capturing: { readout: "Taking X-rays", line: "Please remain still while we photograph your hero section." },
    examining: { readout: "Examining", line: "The doctor is looking at every section. Try not to blush." },
    diagnosing: { readout: "Running labs", line: "Dr. Slop is reviewing the results." },
    complete: { readout: "Writing up chart", line: "Your chart is ready." },
  } satisfies Record<StageKey, { readout: string; line: string }>,
  stageOrder: ["queued", "capturing", "examining", "diagnosing", "complete"] as StageKey[],
  quips: [
    "Counting your gradients.",
    "Checking the hero for pills.",
    "Looking for signs of human life.",
    "Measuring the glow.",
    "Asking the font where it's been.",
  ],
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const percent = (p: number) => `${Math.round(p * 100)}%`;

export const regionKindLabels: Record<string, string> = {
  nav: "Navigation",
  hero: "Hero",
  logos: "Logo strip",
  features: "Features",
  testimonials: "Testimonials",
  pricing: "Pricing",
  stats: "Stats",
  steps: "Steps",
  cta: "Call to action",
  footer: "Footer",
  other: "Section",
};

export const scanner = {
  readout: (px: number, region: number, total: number) =>
    `Scanning · Y ${Math.round(px)}px · Region ${pad2(region)}/${pad2(total)}`,
  regionTag: (region: number, name: string, p: number, more: number) =>
    `${pad2(region)} · ${name} · ${percent(p)}${more > 0 ? ` +${more}` : ""}`,
  regionTagClear: (region: number) => `${pad2(region)} · No symptoms`,
  labResultsHeading: "Lab results",
  labResultsEmpty: "Waiting for the first result.",
  groupLab: "Lab tests",
  groupRegion: (region: number, kind: string) => `Region ${pad2(region)} · ${regionKindLabels[kind] ?? kind}`,
  groupPage: "Whole page",
  percent,
  meterLabel: (n: number) => `Slop Index ${n}/100`,
  screenshotAlt: (host: string) => `Screenshot of ${host}`,
};

export const chart = {
  heading: (host: string) => `Slop chart for ${host}`,
  verdictHealthy: "Healthy",
  verdictUnwell: "Needs treatment",
  moodLabels: { happy: "Good sign", meh: "Could be worse", sad: "Bad sign" },
  indexLabel: "Slop Index",
  diagnosisLine: (tier: string) => `Diagnosis: ${tier}`,
  archetypeLabel: "Presents as",
  birthplaceLabel: "Suspected place of birth",
  birthplaceConfirmed: "Confirmed by lab",
  foundIn: (places: string) => `Found in ${places}`,
  notFoundInSections: "Not found in any section.",
  checkedWholePage: "Checked across the whole page.",
  checkedCode: "Checked in the page's code and copy.",
  prognosisLabel: "Prognosis",
  disagreement: "The doctor and the lab disagree.",
  groups: { visual: "Visual symptoms", copy: "Copy symptoms", lab: "Lab results" },
  noSymptoms: "No symptoms found. The doctor is suspicious but impressed.",
  vitalSignsHeading: "Vital signs",
  noVitalSigns: "No signs of human life detected.",
  prescriptionHeading: "Doctor's note",
  prescriptionSignature: (n: number) => `Dr. Slop · Prescription ${pad2(n)}`,
  copyDischarge: "Copy discharge papers",
  secondOpinion: "Get a second opinion",
  examineAnother: "Examine another patient",
  copiedToast: "Discharge papers copied. Share responsibly.",
  copyFallback: "Copy the link above",
  cachedNote: "This patient was examined in the last 24 hours, so here's that chart.",
};

export type TierKey = "clean" | "sniffles" | "slopitis" | "chronic" | "code_purple";

export const tiers: Record<TierKey, { name: string; oneLiner: string }> = {
  clean: { name: "Clean bill of health", oneLiner: "Free-range, hand-reared pixels." },
  sniffles: { name: "Mild case of the AI sniffles", oneLiner: "A few default habits. Nothing a weekend won't fix." },
  slopitis: { name: "Acute Slopitis", oneLiner: "The template is showing. Treatment recommended." },
  chronic: { name: "Chronic Template Syndrome", oneLiner: "Most of this page came out of the box." },
  code_purple: { name: "Code Purple", oneLiner: "Terminal slop. We've called the designer." },
};

// One line of bedside manner for every possible answer, so each card always says something (docs/COPY.md § Chart).
export const archetypeLines: Record<string, string> = {
  saas_clone: "Could be any of 4,000 dashboards. Probably is.",
  demo_day: "Raising a pre-seed round in the hero section.",
  crypto_fever: "Glows in the dark. Promises the moon.",
  linear_lookalike: "Moody, precise and suspiciously familiar.",
  stripe_tribute: "Gradient waves as far as the eye can see.",
  notion_wannabe: "Hand-drawn doodles, hand-me-down layout.",
  template_special: "The placeholder personality is still in the box.",
  actually_designed: "Someone made decisions here. Brave ones.",
};

export const unknownArchetype = {
  name: "A medical mystery",
  line: "Presents as nothing the doctor has seen before.",
};

export const birthplaceLines: Record<string, string> = {
  v0: "Born in a shadcn nursery, raised on Geist.",
  lovable: "Delivered by Lovable, gradients and all.",
  bolt: "Assembled at speed by Bolt.",
  framer: "Smoothly animated out of Framer.",
  webflow: "Adopted from the Webflow template shelter.",
  tailwind_starter: "Grew up in a Tailwind starter kit.",
  website_builder: "Came flat-packed from a website builder.",
  human_designer: "Raised by a human designer. Increasingly rare.",
};

export const unknownBirthplace = {
  name: "Place of birth unknown",
  line: "Found on the hospital steps with no paperwork.",
};

export const prognosisLines: Record<string, string> = {
  full_recovery: "Discharge expected by lunchtime.",
  manageable: "A short course of prescriptions should clear it up.",
  chronic: "Long-term care recommended.",
  terminal: "We've made the patient comfortable.",
};

export const birthplaceLabels: Record<string, string> = {
  v0: "v0",
  lovable: "Lovable",
  bolt: "Bolt",
  framer: "Framer",
  webflow: "Webflow template",
  tailwind_starter: "Tailwind starter kit",
  website_builder: "Website builder theme",
  human_designer: "A human designer",
};

export type ErrorKey =
  | "invalid_url"
  | "private_url"
  | "rate_limited"
  | "clinic_full"
  | "signed_out"
  | "capture_failed"
  | "examine_failed"
  | "diagnose_failed"
  | "not_found"
  | "generic";

export const errors = {
  invalid_url: { message: "That doesn't look like a web address. Use a full URL such as example.com." },
  private_url: { message: "The doctor only makes house calls to public websites. Use a public URL." },
  rate_limited: {
    message: (hours: number) =>
      `You've had 10 examinations today. The clinic reopens in ${hours} ${hours === 1 ? "hour" : "hours"}.`,
  },
  clinic_full: { message: "The clinic is full today. Please come back tomorrow." },
  signed_out: { message: "Sign in to start an examination. It keeps the clinic open.", action: "Sign in" },
  capture_failed: {
    title: "We couldn't photograph this patient",
    message: "The site blocked us or took too long to load. Check the URL and try again.",
    action: "Get a second opinion",
  },
  examine_failed: {
    title: "The examination stopped partway",
    message: "Our vision specialist didn't respond. Try again in a minute.",
    action: "Get a second opinion",
  },
  diagnose_failed: {
    title: "The lab didn't return results",
    message: "Dr. Slop may be busy. Try again in a minute.",
    action: "Get a second opinion",
  },
  not_found: {
    title: "We can't find that chart",
    message: "The link may be wrong.",
    action: "Examine another patient",
  },
  generic: {
    title: "Something went wrong on our side",
    message: "Try again in a minute.",
    action: "Get a second opinion",
  },
};
