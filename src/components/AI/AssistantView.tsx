import { useState, useEffect } from 'react';
import * as Icons from 'phosphor-react';
import styles from './AssistantView.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Instrument {
    ticker: string;
    type: string;
    category: string;
    maturity: string;
    price: number | string;
    tna: string;
    tem: string;
    tae: string;
    risk: 'Bajo' | 'Moderado' | 'Alto';
    description: string;
    recommended?: boolean;
    currency: 'ARS' | 'USD';
}

// ─── Data ───────────────────────────────────────────────────────────────────
import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace the fallback mock fetching function logic to include AI fetch
const MOCK_FALLBACK: Instrument[] = [
    // Aquí mantenemos las cauciones
    { ticker: 'CAUC-1D', type: 'Caución Bursátil', category: 'Cauciones', maturity: '1 día (INMEDIATA)', price: 'Tasa Fija', tna: '34.5%', tem: '2.84%', tae: '41.2%', risk: 'Bajo', currency: 'ARS', description: 'Liquidez inmediata.', recommended: true },
    { ticker: 'CAUC-7D', type: 'Caución Bursátil', category: 'Cauciones', maturity: '7 días', price: 'Tasa Fija', tna: '35.0%', tem: '2.88%', tae: '41.8%', risk: 'Bajo', currency: 'ARS', description: 'Ideal para corto plazo.' },
    { ticker: 'CAUC-14D', type: 'Caución Bursátil', category: 'Cauciones', maturity: '14 días', price: 'Tasa Fija', tna: '35.5%', tem: '2.92%', tae: '42.6%', risk: 'Bajo', currency: 'ARS', description: 'Fondo paralizado 2 semanas.' },
    { ticker: 'CAUC-21D', type: 'Caución Bursátil', category: 'Cauciones', maturity: '21 días', price: 'Tasa Fija', tna: '36.2%', tem: '2.97%', tae: '43.4%', risk: 'Bajo', currency: 'ARS', description: 'Alternativa intermedia.' },
    { ticker: 'CAUC-30D', type: 'Caución Bursátil', category: 'Cauciones', maturity: '30 días', price: 'Tasa Fija', tna: '37.0%', tem: '3.04%', tae: '44.5%', risk: 'Bajo', currency: 'ARS', description: 'Mayor rendimiento en cauciones.' },

    // Lecaps Reales de Cocos
    { ticker: 'S17A6', type: 'Letra Capitalizable', category: 'Lecaps / Lefis', maturity: '17/04/2026', price: '$ 115.00', tna: '40.0%', tem: '3.29%', tae: '48.2%', risk: 'Bajo', currency: 'ARS', description: 'Vencimiento Abril 2026.' },
    { ticker: 'S16M6', type: 'Letra Capitalizable', category: 'Lecaps / Lefis', maturity: '16/03/2026', price: '$ 112.50', tna: '39.8%', tem: '3.27%', tae: '47.9%', risk: 'Bajo', currency: 'ARS', description: 'Vencimiento Marzo 2026.' },
    { ticker: 'S27F6', type: 'Letra Capitalizable', category: 'Lecaps / Lefis', maturity: '27/02/2026', price: '$ 111.40', tna: '39.5%', tem: '3.25%', tae: '47.5%', risk: 'Bajo', currency: 'ARS', description: 'Vencimiento Febrero 2026.' },
    { ticker: 'S29Y6', type: 'Letra Capitalizable', category: 'Lecaps / Lefis', maturity: '29/05/2026', price: '$ 119.50', tna: '41.5%', tem: '3.41%', tae: '50.3%', risk: 'Moderado', currency: 'ARS', description: 'Vencimiento Mayo 2026.' },
    { ticker: 'S30A6', type: 'Letra Capitalizable', category: 'Lecaps / Lefis', maturity: '30/04/2026', price: '$ 117.80', tna: '41.0%', tem: '3.37%', tae: '49.6%', risk: 'Moderado', currency: 'ARS', description: 'Vencimiento Abril 2026.' },
    { ticker: 'S31L6', type: 'Letra Capitalizable', category: 'Lecaps / Lefis', maturity: '31/07/2026', price: '$ 121.00', tna: '42.0%', tem: '3.45%', tae: '51.0%', risk: 'Moderado', currency: 'ARS', description: 'Vencimiento Julio 2026.', recommended: true },
    { ticker: 'S31G6', type: 'Letra Capitalizable', category: 'Lecaps / Lefis', maturity: '31/08/2026', price: '$ 125.00', tna: '42.5%', tem: '3.49%', tae: '51.8%', risk: 'Moderado', currency: 'ARS', description: 'Vencimiento Agosto 2026.' },
    { ticker: 'S30N6', type: 'Letra Capitalizable', category: 'Lecaps / Lefis', maturity: '30/11/2026', price: '$ 130.00', tna: '43.0%', tem: '3.53%', tae: '52.5%', risk: 'Moderado', currency: 'ARS', description: 'Vencimiento Noviembre 2026.' },

    // PF
    { ticker: 'PF-BRUBANK', type: 'Plazo Fijo Tradicional', category: 'Plazos Fijos', maturity: '30 días', price: 'Tasa Fija', tna: '39.0%', tem: '3.20%', tae: '46.8%', risk: 'Bajo', currency: 'ARS', description: 'Brubank.' },
    { ticker: 'PF-CIUDAD', type: 'Plazo Fijo Tradicional', category: 'Plazos Fijos', maturity: '30 días', price: 'Tasa Fija', tna: '38.5%', tem: '3.16%', tae: '46.1%', risk: 'Bajo', currency: 'ARS', description: 'Banco Ciudad.' },
    { ticker: 'PF-UALA', type: 'Instrumento Remunerado', category: 'Plazos Fijos', maturity: 'Liquidez Diaria', price: 'Tasa Fija', tna: '41.0%', tem: '3.37%', tae: '49.6%', risk: 'Bajo', currency: 'ARS', description: 'Ualá.' },
    { ticker: 'PF-PREX', type: 'Instrumento Remunerado', category: 'Plazos Fijos', maturity: 'Liquidez Diaria', price: 'Tasa Fija', tna: '40.5%', tem: '3.33%', tae: '48.9%', risk: 'Bajo', currency: 'ARS', description: 'Prex.', recommended: true },
];

const fetchRealMarketDataFromAI = async (): Promise<Instrument[]> => {
    const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
        console.warn('No Google GenAI API key found, falling back to mock.');
        return MOCK_FALLBACK;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [{ googleSearch: {} } as any]
    });

    const prompt = `
USA LA HERRAMIENTA DE BÚSQUEDA (GOOGLE SEARCH) AHORA MISMO.
Eres un experto financiero en Argentina vinculado al broker Cocos Capital. 
Tu tarea es devolver un JSON ESTRICTO con valores REALES, FEHACIENTES, PRECISOS y ACTUALIZADOS de las cotizaciones de hoy (${new Date().toLocaleDateString()}), correspondientes a 3 categorías de inversión. BUSCA ESTOS PRECIOS EN INTERNET.

El arreglo de JSON debe contener exactamente 17 instrumentos distribuidos así:

1. Cauciones Bursátiles en Cocos Capital (5 instrumentos: a 1 día, 7 días, 14 días, 21 días, y 30 días). Provee la tasa real operada.
2. Lecaps / Lefis (8 Letras en total). ES OBLIGATORIO Y ESTRICTO QUE INCLUYAS EXACTAMENTE 8 LETRAS SELECCIONADAS UNICAMENTE DE ESTA LISTA DE COCOS CAPITAL:
[S17A6, S16M6, S27F6, S29Y6, S30A6, S31L6, S31G6, S30N6, S30O6].
NO INVENTES NINGÚN OTRO TICKER. Selecciona las 8 que consideres que ofrecen el mejor rendimiento de esa lista específica. 
CRÍTICO SOBRE LOS PRECIOS: Busca en tus datos de mercado actualizados y devuelve el PRECIO REAL DE COTIZACIÓN AL DÍA DE HOY (ej: $ 115.42). ESTÁ ESTRICTAMENTE PROHIBIDO INVENTAR PRECIOS REDONDEADOS (ej: prohibido devolver $ 115.00 si el precio real es 115.35). Si no puedes conectarte en vivo, usa el último precio de cierre oficial registrado en BYMA/Cocos Capital.
3. Plazos Fijos o Cuentas Remuneradas (4 instrumentos: Brubank, Banco Ciudad, Ualá, Prex).

El objeto DEBE respetar la siguiente interfaz:
{
    "ticker": string, // Nombre, ej: CAUC-1D, S30A6, PF-BRUBANK
    "type": string, // "Caución Bursátil", "Letra Capitalizable", "Plazo Fijo Tradicional", "Instrumento Remunerado"
    "category": string, // EXACTAMENTE "Cauciones", "Lecaps / Lefis", o "Plazos Fijos"
    "maturity": string, // "1 día", "30 días", o fechas tipo "30/04/2026"
    "price": string, // "Tasa Fija" o el precio real en pesos ej: "$ 115.42"
    "tna": string, // Ej: "35.5%"
    "tem": string, // Ej: "2.9%"
    "tae": string, // Ej: "42.0%"
    "risk": "Bajo" | "Moderado" | "Alto",
    "description": string, // Breve descripción comercial
    "recommended": boolean, // (Opcional, pon true a las de mejor rendimiento)
    "currency": "ARS" // Siempre ARS en este caso
}

Solo responde un array JSON puro, sin tags markdown (\`\`\`json), ni ningún otro texto adicional:
    `;

    try {
        const result = await model.generateContent(prompt);
        let rawText = result.response.text();

        // Limpiar el markdown si el modelo lo agrega
        if (rawText.startsWith('\`\`\`json')) {
            rawText = rawText.replace(/\`\`\`json\n?/, '').replace(/\`\`\`$/, '');
        } else if (rawText.startsWith('\`\`\`')) {
            rawText = rawText.replace(/\`\`\`\n?/, '').replace(/\`\`\`$/, '');
        }

        const data: Instrument[] = JSON.parse(rawText.trim());
        if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid format");

        return data;
    } catch (e) {
        console.error("Error fetching AI market data, using fallback: ", e);
        return MOCK_FALLBACK;
    }
};

const AssistantView = () => {
    // Suggestion states
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [lastSync, setLastSync] = useState<Date>(new Date());

    // Calculator states
    const [calcAmount, setCalcAmount] = useState<string>('1000000');
    const [calcRate, setCalcRate] = useState<string>('42');
    const [calcRateType, setCalcRateType] = useState<'TNA' | 'TEM' | 'TAE'>('TNA');
    const [calcDays, setCalcDays] = useState<string>('30');
    const [calcPeriodUnit, setCalcPeriodUnit] = useState<'dias' | 'meses' | 'años'>('dias');
    const [calcMonthlyContribution, setCalcMonthlyContribution] = useState<string>('0');
    const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
    const [calcResult, setCalcResult] = useState<{ finalCapital: number; interest: number; effectiveRate: number; totalContributions: number; totalInvested: number } | null>(null);

    const loadSuggestions = async () => {
        setLoadingSuggestions(true);
        const data = await fetchRealMarketDataFromAI();
        setInstruments(data);
        setLastSync(new Date());
        setLoadingSuggestions(false);
    };

    const handleSelectInstrument = (inst: Instrument) => {
        setSelectedInstrument(inst);

        // Clean rate string (remove % and parse)
        const cleanRate = inst.tna.replace('%', '').trim();
        setCalcRate(cleanRate);
        setCalcRateType('TNA');

        // Parse maturity
        const maturity = inst.maturity.toLowerCase();
        if (maturity.includes('día')) {
            const num = parseInt(maturity.match(/\d+/)?.[0] || '1');
            setCalcDays(num.toString());
            setCalcPeriodUnit('dias');
        } else if (maturity.includes('/') && (inst.category === 'Lecaps / Lefis' || inst.category.includes('Letra'))) {
            // It's a date. Calculate diff from today
            try {
                const parts = maturity.split('/');
                const targetDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                const today = new Date();
                const diffTime = targetDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 0) {
                    setCalcDays(diffDays.toString());
                    setCalcPeriodUnit('dias');
                }
            } catch (e) {
                console.error("Error parsing date", e);
            }
        } else if (maturity.includes('liquidez diaria')) {
            setCalcDays('1');
            setCalcPeriodUnit('dias');
        } else {
            // Default check for "X meses", "X años" if any
            const num = parseInt(maturity.match(/\d+/)?.[0] || '30');
            setCalcDays(num.toString());
            setCalcPeriodUnit('dias');
        }

        // Scroll to calculator
        const calcElement = document.getElementById('compound-calculator');
        if (calcElement) {
            calcElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        loadSuggestions();
    }, []);

    const calculateCompoundInterest = () => {
        const principal = parseFloat(calcAmount.replace(',', '.'));
        const rate = parseFloat(calcRate.replace(',', '.'));
        const periodValue = parseInt(calcDays);
        const monthlyContribution = parseFloat(calcMonthlyContribution.replace(',', '.')) || 0;

        if (isNaN(principal) || isNaN(rate) || isNaN(periodValue) || principal < 0 || periodValue <= 0) return;

        // Convert period to total days for simulation
        let totalDays = periodValue;
        if (calcPeriodUnit === 'meses') totalDays = periodValue * 30;
        else if (calcPeriodUnit === 'años') totalDays = periodValue * 365;

        let dailyRate = 0;
        if (calcRateType === 'TNA') {
            dailyRate = (rate / 100) / 365;
        } else if (calcRateType === 'TEM') {
            dailyRate = (Math.pow(1 + rate / 100, 1 / 30) - 1);
        } else if (calcRateType === 'TAE') {
            dailyRate = (Math.pow(1 + rate / 100, 1 / 365) - 1);
        }

        let currentCapital = principal;
        let totalContributions = 0;

        // Simulate day by day to add monthly contributions
        for (let i = 1; i <= totalDays; i++) {
            currentCapital *= (1 + dailyRate);

            // Add contribution every 30 days
            if (i % 30 === 0 && i !== totalDays) {
                currentCapital += monthlyContribution;
                totalContributions += monthlyContribution;
            }
        }

        const finalCapital = currentCapital;
        const totalInvested = principal + totalContributions;
        const interest = finalCapital - totalInvested;
        const effectiveRate = totalInvested > 0 ? (interest / totalInvested) * 100 : 0;

        setCalcResult({ finalCapital, interest, effectiveRate, totalContributions, totalInvested });
    };

    useEffect(() => {
        calculateCompoundInterest();
    }, [calcAmount, calcRate, calcRateType, calcDays, calcPeriodUnit, calcMonthlyContribution]);

    const groupedInstruments = instruments.reduce((acc: Record<string, Instrument[]>, inst) => {
        if (!acc[inst.category]) acc[inst.category] = [];
        acc[inst.category].push(inst);
        return acc;
    }, {});

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <Icons.TrendUp size={22} weight="fill" />
                </div>
                <div className={styles.headerTitleContainer}>
                    <div>
                        <h2>Sugerencias de Inversión</h2>
                        <p>Oportunidades de Renta Fija en el mercado</p>
                    </div>
                </div>
            </div>

            <div className={styles.syncHeader}>
                <div className={styles.brokerTag}>
                    <Icons.Buildings size={16} />
                    Fuente: Cocos Capital
                </div>
                <button
                    className={styles.refreshBtn}
                    onClick={loadSuggestions}
                    disabled={loadingSuggestions}
                >
                    <Icons.ArrowsClockwise size={16} weight="bold" className={loadingSuggestions ? styles.spinnerAnim : ''} />
                    <span>Actualizar Tasas</span>
                </button>
            </div>

            <p className={styles.lastSyncText}>Última actualización: {lastSync.toLocaleTimeString('es-AR')}</p>

            {loadingSuggestions ? (
                <div className={styles.loadingState}>
                    <Icons.SpinnerGap size={26} className={styles.spinnerAnim} />
                    <span>Conectando con el mercado...</span>
                </div>
            ) : (
                <div className={styles.resultsSection}>
                    {Object.entries(groupedInstruments).map(([category, items]) => (
                        <div key={category} className={styles.categoryGroup}>
                            <h4 className={styles.categoryTitle}>{category}</h4>
                            <div className={styles.instrumentGrid}>
                                {items.map((inst) => (
                                    <div
                                        key={inst.ticker}
                                        className={`${styles.instrumentCard} ${inst.recommended ? styles.instrumentCardRecommended : ''}`}
                                        onClick={() => handleSelectInstrument(inst)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {inst.recommended && (
                                            <div className={styles.recommendedBadge}>
                                                <Icons.Star size={10} weight="fill" />
                                                Recomendado
                                            </div>
                                        )}
                                        <div className={styles.instrumentTop}>
                                            <div className={styles.instrumentInfo}>
                                                <span className={styles.ticker}>{inst.ticker}</span>
                                                <span className={styles.instType}>{inst.type}</span>
                                            </div>
                                            <div className={`${styles.riskBadge} ${inst.risk === 'Bajo' ? styles.riskLow : styles.riskMid}`}>
                                                {inst.risk} R.
                                            </div>
                                        </div>
                                        <p className={styles.instDesc}>{inst.description}</p>

                                        <div className={styles.divider}></div>

                                        <div className={styles.instFooterWrapper}>
                                            <div className={styles.instMetricsRow}>
                                                <div className={styles.metricItem}>
                                                    <span className={styles.metricItemLbl}>TNA</span>
                                                    <span className={styles.metricItemVal}>{inst.tna}</span>
                                                </div>
                                                <div className={styles.metricItem}>
                                                    <span className={styles.metricItemLbl}>TEM</span>
                                                    <span className={styles.metricItemVal}>{inst.tem}</span>
                                                </div>
                                                <div className={styles.metricItem}>
                                                    <span className={styles.metricItemLbl}>TAE</span>
                                                    <span className={`${styles.metricItemVal} ${styles.metricHighlight}`}>{inst.tae}</span>
                                                </div>
                                            </div>
                                            <div className={styles.priceTag}>
                                                {inst.price}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CALCULATOR SECTION */}
            <div className={styles.calcSection} id="compound-calculator">
                <div className={styles.calcHeader}>
                    <div className={styles.calcHeaderIconWrapper}>
                        <Icons.Calculator size={20} weight="fill" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3>Calculadora de Interés Compuesto</h3>
                        {selectedInstrument && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                                Calculando sobre: {selectedInstrument.ticker} ({selectedInstrument.category})
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.calcBody}>
                    <div className={styles.calcForm}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Capital Inicial ($)</label>
                                <input
                                    type="number"
                                    className={styles.calcInput}
                                    value={calcAmount}
                                    onChange={(e) => setCalcAmount(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Aporte Mensual ($)</label>
                                <input
                                    type="number"
                                    className={styles.calcInput}
                                    value={calcMonthlyContribution}
                                    onChange={(e) => setCalcMonthlyContribution(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Tasa (%)</label>
                                <input
                                    type="number"
                                    className={styles.calcInput}
                                    value={calcRate}
                                    onChange={(e) => setCalcRate(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tipo de Tasa</label>
                                <select
                                    className={styles.calcInput}
                                    value={calcRateType}
                                    onChange={(e) => setCalcRateType(e.target.value as any)}
                                >
                                    <option value="TNA">TNA (Nominal Anual)</option>
                                    <option value="TEM">TEM (Efectiva Mensual)</option>
                                    <option value="TAE">TAE (Efectiva Anual)</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label>Plazo total ({calcPeriodUnit})</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        className={styles.calcInput}
                                        style={{ flex: 1 }}
                                        value={calcDays}
                                        onChange={(e) => setCalcDays(e.target.value)}
                                    />
                                    <select
                                        className={styles.calcInput}
                                        value={calcPeriodUnit}
                                        onChange={(e) => setCalcPeriodUnit(e.target.value as any)}
                                        style={{ width: 'auto' }}
                                    >
                                        <option value="dias">Días</option>
                                        <option value="meses">Meses</option>
                                        <option value="años">Años</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {calcResult && (
                        <div className={styles.calcResultBox}>
                            <h4 className={styles.resultTitle}>Proyección Estimada</h4>

                            <div className={styles.resultMain}>
                                <span className={styles.resultLabel}>Capital Final al Vencimiento</span>
                                <span className={styles.resultValuePrimary}>
                                    $ {calcResult.finalCapital.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className={styles.resultDetailsGrid}>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailCardLabel}>Total Invertido</span>
                                    <span className={styles.detailCardValue}>
                                        $ {calcResult.totalInvested.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailCardLabel}>Aportes Extra</span>
                                    <span className={styles.detailCardValue}>
                                        $ {calcResult.totalContributions.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailCardLabel}>Intereses Ganados</span>
                                    <span className={styles.detailCardValueGreen}>
                                        + $ {calcResult.interest.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailCardLabel}>Rendimiento Total</span>
                                    <span className={styles.detailCardValue}>
                                        {calcResult.effectiveRate.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssistantView;
