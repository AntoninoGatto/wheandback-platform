import OpenAI from "openai";
import type { Locale } from "@/lib/i18n/routing";

/** Common product search terms → English (longest phrases first per locale). */
const PHRASE_MAP: Record<Exclude<Locale, "en">, Record<string, string>> = {
  it: {
    "lampada da tavolo": "desk lamp",
    "lampada led": "led lamp",
    "lampada notte": "night light",
    "tazza termica": "thermos mug",
    "auricolari bluetooth": "bluetooth earphones",
    "cane gatto": "dog cat pet",
    lampada: "lamp",
    cuscino: "pillow",
    tazza: "mug cup",
    borraccia: "water bottle",
    zaino: "backpack",
    orologio: "watch",
    tablet: "tablet",
    telefono: "phone",
    caricatore: "charger",
    cavo: "cable",
    cuffie: "headphones",
    auricolari: "earphones",
    tastiera: "keyboard",
    mouse: "mouse",
    sedia: "chair",
    tappeto: "rug",
    vaso: "vase",
    decorazione: "decoration",
    giocattolo: "toy",
    bambino: "baby kids",
    cane: "dog pet",
    gatto: "cat pet",
    sport: "sport fitness",
    yoga: "yoga",
    palestra: "gym fitness",
    cucina: "kitchen",
    bagno: "bathroom",
    ufficio: "office",
    penna: "pen",
    quaderno: "notebook",
    beauty: "beauty",
    massaggio: "massage",
    crema: "cream",
    diffusore: "diffuser",
    profumo: "perfume",
  },
  fr: {
    "lampe de bureau": "desk lamp",
    "lampe led": "led lamp",
    lampe: "lamp",
    oreiller: "pillow",
    tasse: "mug cup",
    gourde: "water bottle",
    sac: "bag backpack",
    montre: "watch",
    tablette: "tablet",
    telephone: "phone",
    chargeur: "charger",
    casque: "headphones",
    ecouteurs: "earphones",
    clavier: "keyboard",
    souris: "mouse",
    chaise: "chair",
    tapis: "rug",
    decoration: "decoration",
    jouet: "toy",
    chien: "dog pet",
    chat: "cat pet",
    sport: "sport fitness",
    cuisine: "kitchen",
    salle: "bathroom",
    bureau: "office",
    stylo: "pen",
    cahier: "notebook",
  },
  es: {
    "lampara de mesa": "desk lamp",
    "lampara led": "led lamp",
    lampara: "lamp",
    almohada: "pillow",
    taza: "mug cup",
    botella: "water bottle",
    mochila: "backpack",
    reloj: "watch",
    tableta: "tablet",
    telefono: "phone",
    cargador: "charger",
    auriculares: "headphones earphones",
    teclado: "keyboard",
    raton: "mouse",
    silla: "chair",
    alfombra: "rug",
    decoracion: "decoration",
    juguete: "toy",
    perro: "dog pet",
    gato: "cat pet",
    deporte: "sport fitness",
    cocina: "kitchen",
    bano: "bathroom",
    oficina: "office",
    boligrafo: "pen",
    cuaderno: "notebook",
  },
  de: {
    "tischlampe": "desk lamp",
    "led lampe": "led lamp",
    lampe: "lamp",
    kissen: "pillow",
    tasse: "mug cup",
    flasche: "water bottle",
    rucksack: "backpack",
    uhr: "watch",
    tablet: "tablet",
    telefon: "phone",
    ladegerat: "charger",
    ladegerät: "charger",
    kabel: "cable",
    kopfhorer: "headphones",
    kopfhörer: "headphones",
    ohrhorer: "earphones",
    ohrhörer: "earphones",
    tastatur: "keyboard",
    maus: "mouse",
    stuhl: "chair",
    teppich: "rug",
    deko: "decoration",
    spielzeug: "toy",
    hund: "dog pet",
    katze: "cat pet",
    sport: "sport fitness",
    kuche: "kitchen",
    küche: "kitchen",
    buro: "office",
    büro: "office",
    stift: "pen",
    notizbuch: "notebook",
  },
};

const translationCache = new Map<string, string>();

function normalizeQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function translateWithDictionary(query: string, locale: Exclude<Locale, "en">): string | null {
  const map = PHRASE_MAP[locale];
  const normalized = normalizeQuery(query);

  if (map[normalized]) return map[normalized];

  for (const [phrase, english] of Object.entries(map).sort((a, b) => b[0].length - a[0].length)) {
    if (normalized.includes(phrase)) {
      return english;
    }
  }

  return null;
}

async function translateWithAi(query: string, locale: Locale): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 40,
    messages: [
      {
        role: "user",
        content: `Translate this e-commerce product search query from ${locale} to concise English keywords for a product catalog API. Return ONLY the English keywords, no punctuation or explanation.\nQuery: ${query}`,
      },
    ],
  });

  const translated = response.choices[0]?.message?.content?.trim();
  return translated || null;
}

/** Build English CJ search terms from a customer query in any site locale. */
export async function translateSearchQueryForCj(
  query: string,
  locale: string
): Promise<{ englishQuery: string; translated: boolean }> {
  const trimmed = query.trim();
  if (!trimmed) return { englishQuery: trimmed, translated: false };

  if (locale === "en") {
    return { englishQuery: trimmed, translated: false };
  }

  const safeLocale = (["it", "fr", "es", "de"] as const).includes(locale as Locale)
    ? (locale as Exclude<Locale, "en">)
    : "it";

  const cacheKey = `${safeLocale}:${normalizeQuery(trimmed)}`;
  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey)!;
    return { englishQuery: cached, translated: cached !== trimmed };
  }

  let englishQuery = translateWithDictionary(trimmed, safeLocale) ?? trimmed;

  if (englishQuery === trimmed) {
    try {
      const ai = await translateWithAi(trimmed, safeLocale);
      if (ai) englishQuery = ai;
    } catch {
      // keep original query as fallback
    }
  }

  translationCache.set(cacheKey, englishQuery);
  return { englishQuery, translated: englishQuery.toLowerCase() !== trimmed.toLowerCase() };
}

/** Search terms for local DB products (original + English when different). */
export function buildLocalSearchTerms(query: string, englishQuery: string): string[] {
  const terms = new Set<string>([query.trim()]);
  if (englishQuery.trim() && englishQuery.trim().toLowerCase() !== query.trim().toLowerCase()) {
    terms.add(englishQuery.trim());
  }
  return Array.from(terms);
}
