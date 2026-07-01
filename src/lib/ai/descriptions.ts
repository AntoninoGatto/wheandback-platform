import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GeneratedDescription {
  name: string;
  description: string;
  bulletPoints: string[];
}

export async function generateProductDescription(
  originalName: string,
  originalDescription: string,
  categoryName: string,
  price: number,
  cashbackPercent: number
): Promise<GeneratedDescription> {
  const prompt = `Sei un copywriter esperto di e-commerce italiano.
Hai il compito di scrivere la scheda prodotto per la piattaforma Whe&Back® — un marketplace etico con cashback.

Prodotto originale (in inglese o cinese): "${originalName}"
Descrizione originale: "${originalDescription?.slice(0, 500) ?? "Non disponibile"}"
Categoria: ${categoryName}
Prezzo di vendita: €${price.toFixed(2)}
Cashback offerto: ${cashbackPercent}%

Rispondi SOLO con un JSON valido in questo formato:
{
  "name": "Nome prodotto in italiano (max 60 caratteri, accattivante)",
  "description": "Descrizione in italiano (150-200 parole, tono professionale ma amichevole, menziona il cashback di ${cashbackPercent}%)",
  "bulletPoints": ["Punto chiave 1", "Punto chiave 2", "Punto chiave 3", "Punto chiave 4"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);

  return {
    name: parsed.name ?? originalName,
    description: parsed.description ?? "",
    bulletPoints: parsed.bulletPoints ?? [],
  };
}
