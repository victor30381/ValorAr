import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("VITE_GOOGLE_GENAI_API_KEY is missing. AI features will use fallback calculations.");
}

export interface AiCalculationResult {
    maturityDate: string;
    maturityValue: number;
    nominals: number;
    tem: string;
    tir: string;
    tna: string;
    tae: string;
    explanation: string;
    source: 'gemini' | 'local'; // Whether Gemini or local fallback was used
}

// ──────────────────────────────────────────
// TICKER → MATURITY DATE MAPPING
// Standard Argentine Lecap ticker convention
// ──────────────────────────────────────────
const MONTH_CODES: Record<string, number> = {
    'E': 1, 'F': 2, 'M': 3, 'A': 4, 'Y': 5, 'J': 6,
    'L': 7, 'G': 8, 'S': 9, 'O': 10, 'N': 11, 'D': 12,
};

/**
 * Parses a standard Argentine ticker code into a maturity date.
 * Format: S{DD}{MonthCode}{YearDigit} → e.g. S30N6 → 30/11/2026
 */
function parseTickerMaturity(ticker: string): string | null {
    // Match pattern: S + 2 digits (day) + 1 letter (month) + 1 digit (year)
    const match = ticker.match(/^S(\d{2})([A-Z])(\d)$/);
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const monthCode = match[2];
    const yearDigit = parseInt(match[3], 10);

    const month = MONTH_CODES[monthCode];
    if (!month) return null;

    const year = 2020 + yearDigit;
    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');

    return `${dd}/${mm}/${year}`;
}

/**
 * Calculates days between a YYYY-MM-DD purchase date and a DD/MM/YYYY maturity date.
 */
function daysBetween(purchaseDateStr: string, maturityDateStr: string): number {
    // Parse purchase date (YYYY-MM-DD)
    const [py, pm, pd] = purchaseDateStr.split('-').map(Number);
    const purchaseDate = new Date(py, pm - 1, pd);

    // Parse maturity date (DD/MM/YYYY)
    const [md, mm, my] = maturityDateStr.split('/').map(Number);
    const maturityDate = new Date(my, mm - 1, md);

    const diffMs = maturityDate.getTime() - purchaseDate.getTime();
    return Math.max(Math.round(diffMs / (1000 * 60 * 60 * 24)), 1);
}

// ──────────────────────────────────────────
// LOCAL FALLBACK CALCULATOR
// ──────────────────────────────────────────
function calculateLocally(
    instrumentType: string,
    ticker: string,
    price: number,
    amount: number,
    purchaseDate: string,
    marketTna?: number  // TNA from market data (e.g. 43.80 for 43.80%)
): AiCalculationResult {

    // 1. Determine maturity date
    let maturityDate = "Sin vencimiento";
    const parsedMaturity = parseTickerMaturity(ticker);

    if (instrumentType === 'Lecaps' || instrumentType === 'Bonos') {
        maturityDate = parsedMaturity || "N/A";
    } else if (instrumentType === 'Plazo Fijo') {
        // 30 days from purchase
        const [y, m, d] = purchaseDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        if (ticker === 'PF-UVA') {
            date.setDate(date.getDate() + 90); // UVA is 90 days
        } else {
            date.setDate(date.getDate() + 30);
        }
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        maturityDate = `${dd}/${mm}/${yyyy}`;
    }

    // 2. Calculate nominals
    const nominals = (amount / price) * 100;

    // 3. Calculate maturity value
    let maturityValue = amount; // Default: no gain

    if (instrumentType === 'Lecaps' || instrumentType === 'Bonos') {
        // Lecaps capitalize monthly — price can be > 100.
        // Use market TNA to compute actual return.
        if (marketTna && maturityDate !== 'N/A' && maturityDate !== 'Sin vencimiento') {
            const days = daysBetween(purchaseDate, maturityDate);
            const tnaDecimal = marketTna / 100; // e.g. 43.80 → 0.438
            maturityValue = amount * (1 + tnaDecimal * days / 365);
        } else {
            // Fallback: if no TNA, assume ~40% TNA (reasonable Argentine rate)
            if (maturityDate !== 'N/A' && maturityDate !== 'Sin vencimiento') {
                const days = daysBetween(purchaseDate, maturityDate);
                maturityValue = amount * (1 + 0.40 * days / 365);
            }
        }
    } else if (instrumentType === 'Plazo Fijo') {
        const estimatedTNA = marketTna ? marketTna / 100 : 0.37;
        const days = ticker === 'PF-UVA' ? 90 : 30;
        maturityValue = amount * (1 + estimatedTNA * days / 365);
    }

    // 4. Calculate financial metrics
    let tem = "N/A";
    let tna = "N/A";
    let tae = "N/A";
    let tir = "N/A";
    let explanation = "";

    if (maturityDate !== "Sin vencimiento" && maturityDate !== "N/A") {
        const days = daysBetween(purchaseDate, maturityDate);
        const totalReturn = (maturityValue - amount) / amount; // Rendimiento total

        // TEM: ((1 + rendimiento_total) ^ (30/días)) - 1
        const temValue = Math.pow(1 + totalReturn, 30 / days) - 1;
        tem = `${(temValue * 100).toFixed(2)}%`;

        // TNA: rendimiento_total * (365 / días)
        const tnaValue = totalReturn * (365 / days);
        tna = `${(tnaValue * 100).toFixed(2)}%`;

        // TAE: ((1 + TEM) ^ 12) - 1
        const taeValue = Math.pow(1 + temValue, 12) - 1;
        tae = `${(taeValue * 100).toFixed(2)}%`;

        // TIR ≈ TAE for single cashflow
        tir = tae;

        const ganancia = maturityValue - amount;
        explanation = `Compraste ${nominals.toFixed(2)} nominales de ${ticker} a $${price} cada 100 VN. ` +
            `En ${days} días (vto. ${maturityDate}) recibirás $${maturityValue.toFixed(2)}, ` +
            `ganando $${ganancia.toFixed(2)} (${(totalReturn * 100).toFixed(2)}% total). ` +
            `Cálculo local (Gemini no disponible).`;
    } else {
        explanation = `Inversión de $${amount} en ${ticker} (${instrumentType}). ` +
            `Sin vencimiento definido. Métricas calculadas localmente.`;
    }

    return {
        maturityDate,
        maturityValue,
        nominals,
        tem,
        tir,
        tna,
        tae,
        explanation,
        source: 'local',
    };
}


// ──────────────────────────────────────────
// MAIN FUNCTION: tries Gemini, falls back to local
// ──────────────────────────────────────────
export const calculateInvestmentMetrics = async (
    instrumentType: string,
    ticker: string,
    price: number,
    amount: number,
    purchaseDate: string,
    marketTna?: number
): Promise<AiCalculationResult> => {

    // Try Gemini AI first
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `
Eres un asesor financiero experto del mercado argentino. Necesito que calcules las métricas financieras para la siguiente inversión.

DATOS DE LA INVERSIÓN:
- Tipo de Instrumento: ${instrumentType}
- Ticker: ${ticker}
- Precio de Compra (por cada 100 nominales): ${price}
- Monto Total Invertido: ARS $${amount}
- Fecha de Compra: ${purchaseDate}

INSTRUCCIONES DE CÁLCULO:
1. **Fecha de Vencimiento**: Determina la fecha de vencimiento basándote en el ticker.
   - Convención de tickers argentinos: S30N6 = vence 30/Nov/2026, S31G6 = 31/Ago/2026, S16M6 = 16/Mar/2026, etc.
   - Para Plazos Fijos: asume 30 días desde la fecha de compra.
   - Para Acciones/CEDEARs/FCI/Cripto: no tienen vencimiento, indica "Sin vencimiento".

2. **Nominales**: Cantidad de nominales = (Monto Invertido / Precio) * 100

3. **Valor al Vencimiento (Maturity Value)**:
   - Para Lecaps y Bonos Discount: los nominales se reciben al 100% al vencimiento, entonces Maturity Value = Nominales.
   - Para Plazos Fijos: Capital * (1 + TNA * días / 365).
   - Para otros instrumentos: estimar según precio de mercado.

4. **Métricas Financieras** (calcular todas):
   - TEM (Tasa Efectiva Mensual): rendimiento mensual efectivo
   - TIR (Tasa Interna de Retorno): rendimiento considerando flujos de fondos
   - TNA (Tasa Nominal Anual): tasa anual sin capitalización
   - TAE (Tasa Anual Efectiva): tasa anual con capitalización

   Fórmulas base para Lecaps (discount to nominal):
   - Ganancia = Nominales - Monto Invertido
   - Rendimiento Total = Ganancia / Monto Invertido
   - Días hasta vencimiento = diferencia entre fecha compra y vencimiento
   - TEM = ((Nominales / Monto) ^ (30 / días_hasta_vto)) - 1
   - TNA = Rendimiento Total * (365 / días_hasta_vto)
   - TAE = ((1 + TEM) ^ 12) - 1
   - TIR ≈ TAE para un solo flujo

5. **Explicación**: Breve explicación en español de los cálculos.

RESPONDE EXCLUSIVAMENTE en formato JSON (sin markdown, sin backticks, solo JSON puro):
{
    "maturityDate": "DD/MM/YYYY",
    "maturityValue": number,
    "nominals": number,
    "tem": "X.XX%",
    "tir": "X.XX%",
    "tna": "X.XX%",
    "tae": "X.XX%",
    "explanation": "Explicación breve en español"
}
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonStr = text.replace(/```json|```/g, '').trim();
            const data = JSON.parse(jsonStr);

            return {
                maturityDate: data.maturityDate || "N/A",
                maturityValue: Number(data.maturityValue) || 0,
                nominals: Number(data.nominals) || 0,
                tem: data.tem || "N/A",
                tir: data.tir || "N/A",
                tna: data.tna || "N/A",
                tae: data.tae || "N/A",
                explanation: data.explanation || "Cálculo realizado por Gemini AI.",
                source: 'gemini',
            };

        } catch (error: any) {
            console.warn("Gemini AI unavailable, using local calculation fallback:", error.message);
            // Fall through to local calculation
        }
    }

    // Fallback: local calculation
    console.log("Using local financial calculator.");
    return calculateLocally(instrumentType, ticker, price, amount, purchaseDate, marketTna);
};
