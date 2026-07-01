/**
 * PHASE 1 categories — low-return-rate products only.
 * Excluded: clothing, shoes, women's bags/accessories (high return rate).
 * These may be added in a future phase after return rate analysis.
 */
export const ALLOWED_CATEGORIES = [
  { id: "largo-consumo", label: "Largo Consumo", icon: "ShoppingCart" },
  { id: "oggettistica", label: "Oggettistica", icon: "Gift" },
  { id: "cani-gatti", label: "Cani e Gatti", icon: "Heart" },
  { id: "elettrica-elettronica", label: "Minuteria Elettrica/Elettronica", icon: "Zap" },
  { id: "casa", label: "Casa", icon: "Home" },
  { id: "hobby", label: "Hobby e Creatività", icon: "Star" },
  { id: "giocattoli", label: "Giocattoli e Bambini", icon: "Smile" },
  { id: "salute-benessere", label: "Salute e Benessere", icon: "Activity" },
  { id: "sport", label: "Sport e Tempo Libero", icon: "Dumbbell" },
  { id: "ufficio", label: "Cancelleria e Ufficio", icon: "Briefcase" },
] as const;

export type CategoryId = (typeof ALLOWED_CATEGORIES)[number]["id"];

/**
 * EXCLUDED categories (Phase 1) — high return rate.
 * Will be reconsidered in Phase 2 with appropriate return filters.
 */
export const EXCLUDED_CATEGORIES_PHASE1 = [
  "abbigliamento",
  "scarpe",
  "borse",
  "accessori-donna",
  "gioielli",
  "intimo",
] as const;

/**
 * Products containing these keywords are STRICTLY FORBIDDEN.
 * Validated server-side on every product insert/update.
 */
export const BLACKLISTED_KEYWORDS = [
  "monopattino",
  "monopattini",
  "accendino",
  "accendini",
  "sigaretta",
  "sigarette",
  "tabacco",
  "alcolici",
  "alcolico",
  "scommesse",
  "gioco d'azzardo",
  "droghe",
  "farmaci senza prescrizione",
  "armi",
  "abbigliamento",
  "vestito",
  "vestiti",
  "scarpe",
  "borsa",
  "borsetta",
  "intimo",
  "reggiseno",
  "costume da bagno",
] as const;

export type BlacklistedKeyword = (typeof BLACKLISTED_KEYWORDS)[number];
