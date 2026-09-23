// Mirror of docs/SLOP-TAXONOMY.md. Change the doc first, then this file.

export type RegionKind =
  | "nav"
  | "hero"
  | "logos"
  | "features"
  | "testimonials"
  | "pricing"
  | "stats"
  | "steps"
  | "cta"
  | "footer"
  | "other";

export const REGION_KINDS: RegionKind[] = [
  "nav",
  "hero",
  "logos",
  "features",
  "testimonials",
  "pricing",
  "stats",
  "steps",
  "cta",
  "footer",
  "other",
];

export type NoulSpec = { question: string; whenTrue: string; whenFalse: string };

export type SymptomGroup = "visual" | "copy" | "lab";

export type Symptom = {
  key: string;
  name: string;
  /** One sentence on what the symptom is, shown when a chart row is expanded. */
  about: string;
  weight: number;
  group: SymptomGroup;
  source: "lab" | "exam";
  scope: "region" | "page" | "lab";
  appliesTo?: RegionKind[] | "any";
  noul?: NoulSpec;
  rx: string;
};

// Probability bands for Noul answers.
export const PRESENT_MIN = 0.65;
export const INCONCLUSIVE_MIN = 0.35;
// Choice and Score answers below this confidence are inconclusive.
export const CONFIDENCE_MIN = 0.5;
// Weighted symptom points that count as a fully sloppy page.
export const SATURATION = 16;
export const VITAL_SIGN_BONUS = 5;
export const NO_SYMPTOM_RX = "No treatment needed. Keep doing whatever you're doing, and stay away from purple.";

export const VISUAL_SYMPTOMS: Symptom[] = [
  {
    key: "purple_gradient",
    name: "Purple Gradient Fever",
    about: "A gradient that fades through purple, violet or indigo, the house colour of AI-generated software pages.",
    weight: 3,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: "any",
    noul: {
      question:
        "Does `region` use a gradient that includes purple, violet or indigo as a background, button fill or large decorative shape?",
      whenTrue: "The description of `region` mentions a gradient containing purple, violet, lavender or indigo.",
      whenFalse: "`region` has no gradient, or its gradients contain no purple, violet, lavender or indigo.",
    },
    rx: "Take one solid colour daily and call me in the morning.",
  },
  {
    key: "gradient_text",
    name: "Gradient Text Jaundice",
    about: "Headline words filled with a colour gradient instead of one solid colour.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["hero", "cta", "features"],
    noul: {
      question: "Is any heading text in `region` filled with a colour gradient rather than a single solid colour?",
      whenTrue: "The description of `region` says a heading or words in it are gradient-filled.",
      whenFalse: "All text in `region` is a single solid colour per word.",
    },
    rx: "Let your headline be one colour. It's braver than it sounds.",
  },
  {
    key: "glow_orbs",
    name: "Aura Glowmatosis",
    about: "Soft glows, blurred coloured blobs or coloured shadows used purely as decoration.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: "any",
    noul: {
      question:
        "Does `region` contain a soft glow, a blurred coloured orb or blob, or a coloured shadow used as decoration?",
      whenTrue: "The description of `region` mentions a glow, blurred orb or blob, halo, or coloured box shadow.",
      whenFalse: "`region` has no glows, blurred orbs or coloured shadows.",
    },
    rx: "Remove the glowing orb. It is not a feature.",
  },
  {
    key: "glassmorphism",
    name: "Glassmorphic Cataracts",
    about: "Translucent frosted-glass panels with a blurred background showing through.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: "any",
    noul: {
      question: "Does `region` use frosted-glass panels: translucent cards with a blurred background showing through?",
      whenTrue: "The description of `region` mentions translucent, frosted, glass-like or backdrop-blurred panels.",
      whenFalse: "The panels in `region` are opaque, or there are no panels.",
    },
    rx: "Replace frosted glass with an opaque surface. Your text will thank you.",
  },
  {
    key: "bento",
    name: "Bento Box Disorder",
    about: "Features packed into a grid of rounded tiles of different sizes, like a lunchbox.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["features", "other"],
    noul: {
      question:
        "Is `region` laid out as a bento grid: rounded tiles of different sizes packed into a grid, each holding one feature?",
      whenTrue: "The description of `region` mentions a grid of rounded tiles or cards of unequal sizes.",
      whenFalse: "`region` is not a grid of mixed-size tiles.",
    },
    rx: "One idea per section, laid out for the idea, not the lunchbox.",
  },
  {
    key: "sparkle",
    name: "Sparkle Infection",
    about: "A sparkle or star-burst icon used to announce that something involves AI.",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: "any",
    noul: {
      question: "Does `region` use a sparkle or star-burst icon or emoji (✨) to mark something as AI or magic?",
      whenTrue: "The description or visible text of `region` includes a sparkle icon or ✨ emoji.",
      whenFalse: "`region` has no sparkle icon or emoji.",
    },
    rx: "Say what the AI does instead of sprinkling it with sparkles.",
  },
  {
    key: "emoji_icons",
    name: "Emoji Rash",
    about: "Emoji standing in for icons, bullets or section markers.",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: "any",
    noul: {
      question: "Does `region` use emoji as icons, bullets or section markers?",
      whenTrue: "The description or visible text of `region` shows emoji standing in for icons or bullets.",
      whenFalse: "`region` uses no emoji as icons or bullets.",
    },
    rx: "Swap emoji bullets for words, or for icons drawn for your product.",
  },
  {
    key: "pill_badge",
    name: "Pill Badge Pox",
    about: "A small rounded badge above the headline, usually announcing something new.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["hero"],
    noul: {
      question:
        "Is there a small rounded pill or badge above the main headline in `region`, typically announcing something new?",
      whenTrue: "The description of `region` mentions a pill, badge or tag placed above the headline.",
      whenFalse: "There is no pill or badge above the headline in `region`.",
    },
    rx: 'Delete the "New ✨" pill. If it\'s news, put it in the headline.',
  },
  {
    key: "centered_hero",
    name: "Centred Hero Syndrome",
    about: "The stock hero: a centred headline, a centred subheading and one or two centred buttons.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["hero"],
    noul: {
      question:
        "Does `region` follow the stock hero layout: a centred headline, a centred subheading and one or two centred buttons?",
      whenTrue: "The description of `region` says the headline, subheading and buttons are centre-aligned.",
      whenFalse: "The hero in `region` is left-aligned, asymmetric or otherwise not the centred stack.",
    },
    rx: "Try a left-aligned hero. Your eyes read left to right, and so do your customers'.",
  },
  {
    key: "serif_accent",
    name: "Italic Serif Tic",
    about: "One italic serif word dropped into an otherwise sans-serif headline.",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["hero", "cta"],
    noul: {
      question:
        "Does a headline in `region` set one or a few words in an italic serif font while the rest of the headline is sans-serif?",
      whenTrue: "The description of `region` mentions an italic or serif accent word inside a sans-serif headline.",
      whenFalse: "The headline in `region` uses one typeface style throughout.",
    },
    rx: "Pick one typeface for the headline and commit to it.",
  },
  {
    key: "logo_wall",
    name: "Phantom Logo Wall",
    about: "A \"trusted by\" row of greyed-out logos that look generic or made up.",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["logos", "hero"],
    noul: {
      question:
        'Does `region` show a "trusted by" strip of company logos that look generic, greyed-out or like placeholders?',
      whenTrue: "The description of `region` mentions a row of greyed-out, generic or unrecognisable company logos.",
      whenFalse: "`region` has no logo strip, or its logos are clearly recognisable real companies.",
    },
    rx: "Show one real customer with a name and a quote instead of ten grey logos.",
  },
  {
    key: "icon_tiles",
    name: "Icon Tile Uniformity",
    about: "Feature cards that each open with a thin line icon in a small rounded square.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["features"],
    noul: {
      question:
        "Does `region` show feature cards that each have a thin line icon inside a small rounded square at the top of the card?",
      whenTrue: "The description of `region` mentions line icons inside rounded squares or circles on top of cards.",
      whenFalse: "The cards in `region` have no icon tiles, or there are no cards.",
    },
    rx: "Show the feature working. An icon in a box is not a feature.",
  },
  {
    key: "triplets",
    name: "Triplet Syndrome",
    about: "Three identical cards in a row, whether features, testimonials or pricing tiers.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["features", "testimonials", "pricing"],
    noul: {
      question:
        "Does `region` contain exactly three identical side-by-side cards (for example three features, three testimonials or three pricing tiers)?",
      whenTrue: "The description of `region` mentions three cards of the same size and structure in a row.",
      whenFalse: "`region` does not contain a row of three identical cards.",
    },
    rx: "Nothing in nature comes in identical threes. Vary the rhythm.",
  },
  {
    key: "accent_border",
    name: "Left-Border Palsy",
    about: "Cards or callouts with a coloured stripe down just one edge.",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: "any",
    noul: {
      question: "Do cards or callouts in `region` have a coloured border on only their left or top edge?",
      whenTrue: "The description of `region` mentions a coloured left or top edge on cards or callouts.",
      whenFalse: "The cards in `region` have no single-edge coloured borders.",
    },
    rx: "Lose the coloured edge on every card. Save emphasis for one thing.",
  },
  {
    key: "numbered_steps",
    name: "One-Two-Three Compulsion",
    about: "A \"1, 2, 3\" walkthrough of steps, whether or not the product needs one.",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["steps", "features", "other"],
    noul: {
      question: 'Does `region` present a numbered sequence of steps such as "1, 2, 3" or "Step 1, Step 2, Step 3"?',
      whenTrue: "The description or visible text of `region` shows numbered steps.",
      whenFalse: "`region` has no numbered step sequence.",
    },
    rx: "If it takes three steps, show the product doing them.",
  },
  {
    key: "stat_banner",
    name: "Vanity Stat Rash",
    about: "A row of big round numbers like \"10k+ users\" or \"99.9% uptime\".",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["stats", "hero", "other"],
    noul: {
      question:
        'Does `region` show a row of large headline statistics such as "10k+ users", "99.9% uptime" or "5x faster"?',
      whenTrue: "The description or visible text of `region` shows a row of big numbers with short labels.",
      whenFalse: "`region` has no row of headline statistics.",
    },
    rx: "One real number with a source beats four round ones.",
  },
  {
    key: "grid_bg",
    name: "Graph Paper Lattice",
    about: "A faint grid, dot or line pattern sitting behind the hero.",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["hero"],
    noul: {
      question: "Does `region` have a faint grid, dot or line pattern in its background?",
      whenTrue: "The description of `region` mentions a grid, dot or line pattern in the background.",
      whenFalse: "The background of `region` has no grid, dot or line pattern.",
    },
    rx: "Clear the graph paper from behind your hero. It's not a maths exam.",
  },
  {
    key: "stock_3d",
    name: "Abstract Blob Implants",
    about: "Abstract 3D shapes, blobs or gradient artwork standing in for the actual product.",
    weight: 1,
    group: "visual",
    source: "exam",
    scope: "region",
    appliesTo: ["hero", "features"],
    noul: {
      question:
        "Does `region` use abstract 3D shapes, blobs or generic gradient illustrations instead of showing the product or real people?",
      whenTrue: "The description of `region` mentions abstract 3D shapes, blobs, spheres or generic gradient artwork.",
      whenFalse: "`region` shows the product, real photography, custom illustration, or no imagery.",
    },
    rx: "Show your product. The floating 3D torus doesn't do anything.",
  },
];

export const PAGE_SYMPTOMS: Symptom[] = [
  {
    key: "dark_default",
    name: "Midnight Pallor",
    about: "A near-black page lit up with neon or purple accents: dark mode as a personality.",
    weight: 2,
    group: "visual",
    source: "exam",
    scope: "page",
    noul: {
      question: "Is the page a dark theme (near-black or very dark background) with bright neon or purple accents?",
      whenTrue:
        "`page.colour_scheme` is dark and `page.palette` or the region descriptions include neon, purple, violet or cyan accents.",
      whenFalse: "The page has a light background, or a dark background without neon or purple accents.",
    },
    rx: "Try daylight. Dark mode is a setting, not a personality.",
  },
  {
    key: "vague_value",
    name: "Vague Value Prop",
    about: "A headline that doesn't say what the product does or who it's for.",
    weight: 2,
    group: "copy",
    source: "exam",
    scope: "page",
    noul: {
      question: "Does `page.hero_text` fail to say what the product does and who it is for?",
      whenTrue:
        'The hero text is aspirational or generic (for example "Build the future", "Unlock your potential") and a reader could not tell what the product does.',
      whenFalse: "The hero text names what the product does, or who it is for, in concrete terms.",
    },
    rx: 'Say what it does and who it\'s for in the headline. "The future of work" is not a product.',
  },
  {
    key: "rule_of_three",
    name: "Tricolon Tic",
    about: "Slogans in threes, like \"Fast. Simple. Powerful.\", used more than once.",
    weight: 1,
    group: "copy",
    source: "exam",
    scope: "page",
    noul: {
      question: 'Does `page.copy` repeatedly use three-beat slogans like "Fast. Simple. Powerful." or "Build, ship and scale"?',
      whenTrue: "The copy contains two or more lists of three punchy adjectives or verbs used as slogans.",
      whenFalse: "The copy has at most one such three-beat slogan.",
    },
    rx: "Cut one of your three adjectives. Then cut another.",
  },
  {
    key: "not_x_but_y",
    name: "Contrast Reflex",
    about: "The \"It's not just X, it's Y\" construction, used for emphasis.",
    weight: 1,
    group: "copy",
    source: "exam",
    scope: "page",
    noul: {
      question: 'Does `page.copy` use the construction "It\'s not just X, it\'s Y" or "not X, but Y" as a rhetorical device?',
      whenTrue: 'The copy contains a "not just X, it\'s Y" or "not X, but Y" sentence used for emphasis.',
      whenFalse: "The copy has no such construction.",
    },
    rx: "Say what it is. Skip what it isn't.",
  },
];

export const LAB_SYMPTOMS: Symptom[] = [
  {
    key: "em_dash",
    name: "Em-Dash Haemorrhage",
    about: "Heavy use of the long em dash in the copy, a favourite habit of AI writing tools.",
    weight: 1,
    group: "copy",
    source: "lab",
    scope: "lab",
    rx: "Ration your em dashes to one per page. Commas are free.",
  },
  {
    key: "buzzwords",
    name: "Buzzword Bloat",
    about: "Three or more stock marketing words such as \"seamless\", \"unlock\" or \"supercharge\".",
    weight: 2,
    group: "copy",
    source: "lab",
    scope: "lab",
    rx: 'Replace every "seamless" with what actually happens.',
  },
  {
    key: "lorem",
    name: "Placeholder Residue",
    about: "Leftover placeholder text such as \"lorem ipsum\", \"Acme Inc\" or \"John Doe\".",
    weight: 3,
    group: "copy",
    source: "lab",
    scope: "lab",
    rx: "Remove the placeholder text before the patient goes outside.",
  },
  {
    key: "inter_itis",
    name: "Inter-itis",
    about: "The main typeface is Inter or another system default, the most common choice on the web.",
    weight: 2,
    group: "lab",
    source: "lab",
    scope: "lab",
    rx: "Try a typeface with a pulse. Inter is lovely; so is everyone else's site.",
  },
  {
    key: "font_fashion",
    name: "Fashionable Font Fever",
    about: "A currently fashionable typeface, such as Instrument Serif or Space Grotesk.",
    weight: 1,
    group: "lab",
    source: "lab",
    scope: "lab",
    rx: "Your font is on trend. That's the problem.",
  },
];

export const ALL_SYMPTOMS: Symptom[] = [...VISUAL_SYMPTOMS, ...PAGE_SYMPTOMS, ...LAB_SYMPTOMS];
export const SYMPTOMS_BY_KEY: Record<string, Symptom> = Object.fromEntries(ALL_SYMPTOMS.map((s) => [s.key, s]));

// Lab rules
export const EM_DASH_MIN_COUNT = 3;
export const EM_DASH_MIN_PER_100_WORDS = 0.5;
export const BUZZWORD_MIN_DISTINCT = 3;

export const BUZZWORDS = [
  "seamless",
  "seamlessly",
  "unlock",
  "supercharge",
  "elevate",
  "effortless",
  "effortlessly",
  "revolutionize",
  "revolutionise",
  "leverage",
  "game-changer",
  "game-changing",
  "next-level",
  "harness",
  "empower",
  "streamline",
  "cutting-edge",
  "robust",
  "all-in-one",
  "unleash",
  "reimagine",
  "transform your",
  "10x",
  "in today's fast-paced",
];

export const LOREM_PHRASES = [
  "lorem ipsum",
  "Acme Inc",
  "Acme Corp",
  "Your Company",
  "Company Name",
  "John Doe",
  "Jane Doe",
];

export const DEFAULT_FONTS = [
  "Inter",
  "Geist",
  "Geist Sans",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Arial",
  "Helvetica",
  "Helvetica Neue",
  "sans-serif",
];

export const TREND_FONTS = [
  "Space Grotesk",
  "Instrument Serif",
  "Instrument Sans",
  "DM Sans",
  "Plus Jakarta Sans",
  "Outfit",
  "Manrope",
  "Satoshi",
  "Sora",
  "Bricolage Grotesque",
];

// Generator fingerprints, checked in order; first match wins. Evidence is the page's own host, its
// <meta name="generator"> tag, or an asset URL in src/href: never an ordinary link to a builder's site.
// Quantifiers are bounded because the HTML is page-controlled.
const generatorMeta = (name: string) =>
  new RegExp(`<meta[^>]{0,200}name=["']generator["'][^>]{0,200}content=["'][^"']{0,40}${name}`, "i");
const assetFrom = (host: string) => new RegExp(`(?:src|href)=["'][^"']{0,300}${host}`, "i");

export const GENERATOR_FINGERPRINTS: { birthplace: string; hosts: RegExp[]; html: RegExp[] }[] = [
  { birthplace: "lovable", hosts: [/\.lovable\.app$/], html: [generatorMeta("lovable"), /<script[^>]{0,300}src=["'][^"']{0,200}(?:gptengineer|lovable)/i] },
  { birthplace: "bolt", hosts: [/\.bolt\.host$/], html: [generatorMeta("bolt")] },
  { birthplace: "v0", hosts: [/\.v0\.app$/, /\.vusercontent\.net$/], html: [generatorMeta("v0")] },
  {
    birthplace: "framer",
    hosts: [/\.framer\.(website|app|ai)$/],
    html: [generatorMeta("framer"), assetFrom("framerusercontent\\.com")],
  },
  { birthplace: "webflow", hosts: [/\.webflow\.io$/], html: [generatorMeta("webflow"), assetFrom("website-files\\.com")] },
  { birthplace: "website_builder", hosts: [], html: [generatorMeta("(?:wix|squarespace|wordpress)")] },
];

// Vital signs: each present sign subtracts VITAL_SIGN_BONUS from the Slop Index.
export type VitalSign = { key: string; name: string; source: "lab" | "exam"; noul?: NoulSpec };

export const VITAL_SIGNS: VitalSign[] = [
  { key: "distinctive_type", name: "Distinctive typeface", source: "lab" },
  {
    key: "custom_imagery",
    name: "Custom imagery",
    source: "exam",
    noul: {
      question:
        "Does the page show real photography or custom illustration made for this product, rather than stock or abstract artwork?",
      whenTrue: "The region descriptions mention real photography or illustration specific to this product.",
      whenFalse: "The imagery is stock, abstract, generic, or absent.",
    },
  },
  {
    key: "product_ui",
    name: "Shows the actual product",
    source: "exam",
    noul: {
      question: "Does the page show screenshots or recordings of the real product interface?",
      whenTrue: "The region descriptions mention product screenshots, UI previews or recordings of the product.",
      whenFalse: "No part of the page shows the product's actual interface.",
    },
  },
  {
    key: "concrete_copy",
    name: "Concrete copy",
    source: "exam",
    noul: {
      question:
        "Does `page.copy` include specific details such as real customer names, precise numbers with context, or named use cases?",
      whenTrue: "The copy includes specific names, precise figures with context, or named use cases.",
      whenFalse: "The copy is general and could describe many products.",
    },
  },
  {
    key: "unconventional_layout",
    name: "Unconventional layout",
    source: "exam",
    noul: {
      question:
        "Does the page layout depart clearly from the standard template of centred hero, logo strip, three feature cards, testimonials, pricing and CTA?",
      whenTrue: "The sequence and layout of `page.regions` is clearly different from that standard template.",
      whenFalse: "The page follows that standard template, or close to it.",
    },
  },
];

export const VITAL_SIGNS_BY_KEY: Record<string, VitalSign> = Object.fromEntries(VITAL_SIGNS.map((v) => [v.key, v]));

// Determinations
export type ChoiceSpec = { key: string; question: string; options: Record<string, string> };
export type ScoreSpec = { key: string; question: string; levels: string[] };

export const ARCHETYPE: ChoiceSpec = {
  key: "archetype",
  question: "Which description best matches the overall design of the page?",
  options: {
    saas_clone: "The SaaS Clone: a generic software landing page indistinguishable from a starter template",
    demo_day:
      "The YC Demo Day: a startup page with bold claims, a waitlist or demo button and investor-friendly buzzwords",
    crypto_fever: "The Crypto Fever Dream: dark, neon and futuristic, with web3 or AI-agent grandeur",
    linear_lookalike: "The Linear Lookalike: dark, minimal and precise, with subtle glows and product screenshots",
    stripe_tribute: "The Stripe Tribute Act: light, airy, with colourful gradient waves and polished illustrations",
    notion_wannabe: "The Notion Wannabe: off-white, hand-drawn doodles, friendly serif or rounded type",
    template_special:
      "The Template Special: an obvious Framer or Webflow template with the placeholder personality intact",
    actually_designed: "The Actually Designed: a distinctive, considered design that doesn't follow a common template",
  },
};

export const ARCHETYPE_NAMES: Record<string, string> = {
  saas_clone: "The SaaS Clone",
  demo_day: "The YC Demo Day",
  crypto_fever: "The Crypto Fever Dream",
  linear_lookalike: "The Linear Lookalike",
  stripe_tribute: "The Stripe Tribute Act",
  notion_wannabe: "The Notion Wannabe",
  template_special: "The Template Special",
  actually_designed: "The Actually Designed",
};

export const BIRTHPLACE: ChoiceSpec = {
  key: "birthplace",
  question: "Which tool most likely produced this page's design?",
  options: {
    v0: "Vercel v0: shadcn/ui components, neutral greys, Geist or Inter, rounded cards with thin borders",
    lovable: "Lovable: colourful gradients, rounded cards, playful but generic React + Tailwind layout",
    bolt: "Bolt: a basic Tailwind page with stock layout and few distinguishing details",
    framer: "Framer or Framer AI: polished template motion, large type, smooth sections",
    webflow: "A Webflow template: classic marketing sections with template spacing",
    tailwind_starter: "A shadcn or Tailwind starter kit, possibly generated by a coding agent",
    website_builder: "A website builder theme such as Wix, Squarespace or WordPress",
    human_designer: "A human designer: distinctive choices that don't match any tool's defaults",
  },
};

export const PROGNOSIS: ChoiceSpec = {
  key: "prognosis",
  question: "If this page's design were a patient, what is its prognosis?",
  options: {
    full_recovery: "Full recovery: healthy already, or one small change away",
    manageable: "Manageable with treatment: a few default habits to break",
    chronic: "Chronic: the template defaults run through most of the page",
    terminal: "Terminal: the page is almost entirely template defaults",
  },
};

export const PROGNOSIS_NAMES: Record<string, string> = {
  full_recovery: "Full recovery",
  manageable: "Manageable with treatment",
  chronic: "Chronic",
  terminal: "Terminal",
};

export const TEMPLATEDNESS: ScoreSpec = {
  key: "templatedness",
  question: "How closely does the page follow common landing-page template defaults?",
  levels: [
    "Unmistakably bespoke",
    "Mostly original with a few common patterns",
    "Half template, half original",
    "Mostly template defaults",
    "Indistinguishable from the starter template",
  ],
};

export const COPY_TEMPERAMENT: ScoreSpec = {
  key: "copy_temperament",
  question: "How does the copy in `page.copy` read?",
  levels: [
    "Human with opinions: specific, voiceful, occasionally funny",
    "Competent marketing copy",
    "Generic marketing copy full of familiar phrases",
    "Press-release android: interchangeable buzzwords with no specifics",
  ],
};

// Tiers
export type TierKey = "clean" | "sniffles" | "slopitis" | "chronic" | "code_purple";

export const TIERS: { key: TierKey; max: number }[] = [
  { key: "clean", max: 15 },
  { key: "sniffles", max: 35 },
  { key: "slopitis", max: 55 },
  { key: "chronic", max: 75 },
  { key: "code_purple", max: 100 },
];

// Which tiers each prognosis agrees with (for "The doctor and the lab disagree").
export const PROGNOSIS_TIERS: Record<string, TierKey[]> = {
  full_recovery: ["clean", "sniffles"],
  manageable: ["slopitis"],
  chronic: ["chronic"],
  terminal: ["code_purple"],
};

export function appliesToKind(symptom: Symptom, kind: RegionKind): boolean {
  return symptom.appliesTo === "any" || (symptom.appliesTo?.includes(kind) ?? false);
}
