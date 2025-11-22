import { GoogleGenAI } from "@google/genai";
import { LoanParams, LoanResult } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getFinancialAdvice = async (params: LoanParams, result: LoanResult): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Klucz API nie został skonfigurowany. Skontaktuj się z administratorem.";

  const prompt = `
    Jesteś doświadczonym doradcą finansowym. Przeanalizuj poniższą symulację kredytu dla klienta w Polsce.
    
    Dane kredytu:
    - Kwota: ${params.amount} PLN
    - Okres: ${params.months} miesięcy (${(params.months / 12).toFixed(1)} lat)
    - Oprocentowanie: ${params.rate}%
    - Rodzaj rat: ${params.type === 'equal' ? 'Równe' : 'Malejące'}
    
    Wyniki symulacji:
    - Miesięczna rata (początkowa/stała): ${result.schedule[0].payment.toFixed(2)} PLN
    - Całkowity koszt odsetek: ${result.totalInterest.toFixed(2)} PLN
    - Całkowity koszt kredytu: ${result.totalCost.toFixed(2)} PLN

    Proszę o krótką, zwięzłą analizę (maksymalnie 3-4 zdania).
    1. Czy rata jest bezpieczna dla przeciętnego budżetu?
    2. Czy całkowity koszt odsetek jest wysoki w stosunku do kapitału?
    3. Jedna krótka porada finansowa (np. o nadpłacaniu).
    
    Używaj prostego języka, formatuj używając Markdown. Bądź pomocny i profesjonalny.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Nie udało się wygenerować porady.";
  } catch (error) {
    console.error("Błąd Gemini:", error);
    return "Wystąpił błąd podczas łączenia z asystentem AI. Spróbuj ponownie później.";
  }
};