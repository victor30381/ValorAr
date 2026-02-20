import { useState, useEffect } from 'react';
import { X, Robot, SpinnerGap, CheckCircle, WarningCircle } from 'phosphor-react';
import styles from './NewInvestmentModal.module.css';
import { useInvestments } from '../../context/InvestmentContext';
import { calculateInvestmentMetrics, type AiCalculationResult } from '../../services/aiService';
import { getTodayArgentina } from '../../utils/dateUtils';

interface NewInvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Instrument data from Cocos Capital (simulated live feed)
const INSTRUMENT_OPTIONS: Record<string, { ticker: string; label: string; price?: number; tna?: number }[]> = {
    'Lecaps': [
        { ticker: 'S16M6', label: 'S16M6 - Lecap Mar 2026', price: 105.20, tna: 44.50 },
        { ticker: 'S30A6', label: 'S30A6 - Lecap Abr 2026', price: 108.10, tna: 43.80 },
        { ticker: 'S29Y6', label: 'S29Y6 - Lecap May 2026', price: 110.50, tna: 43.20 },
        { ticker: 'S31G6', label: 'S31G6 - Lecap Ago 2026', price: 118.00, tna: 42.50 },
        { ticker: 'S30O6', label: 'S30O6 - Lecap Oct 2026', price: 124.50, tna: 41.80 },
        { ticker: 'S30N6', label: 'S30N6 - Lecap Nov 2026', price: 127.80, tna: 41.50 },
    ],
    'Bonos': [
        { ticker: 'AL30', label: 'AL30 - Bonar 2030' },
        { ticker: 'GD30', label: 'GD30 - Global 2030' },
        { ticker: 'AL35', label: 'AL35 - Bonar 2035' },
        { ticker: 'GD35', label: 'GD35 - Global 2035' },
        { ticker: 'GD38', label: 'GD38 - Global 2038' },
        { ticker: 'GD41', label: 'GD41 - Global 2041' },
        { ticker: 'GD46', label: 'GD46 - Global 2046' },
        { ticker: 'AE38', label: 'AE38 - Bonar 2038' },
    ],
    'Acciones': [
        { ticker: 'GGAL', label: 'GGAL - Grupo Galicia' },
        { ticker: 'YPF', label: 'YPF - YPF S.A.' },
        { ticker: 'PAMP', label: 'PAMP - Pampa Energía' },
        { ticker: 'BBAR', label: 'BBAR - BBVA Argentina' },
        { ticker: 'TXAR', label: 'TXAR - Ternium Argentina' },
        { ticker: 'TECO2', label: 'TECO2 - Telecom Argentina' },
        { ticker: 'SUPV', label: 'SUPV - Supervielle' },
        { ticker: 'CEPU', label: 'CEPU - Central Puerto' },
        { ticker: 'LOMA', label: 'LOMA - Loma Negra' },
    ],
    'FCI': [
        { ticker: 'FCI-MM', label: 'Money Market (Cocos Ahorro)' },
        { ticker: 'FCI-RF', label: 'Renta Fija (Cocos Capital)' },
        { ticker: 'FCI-RV', label: 'Renta Variable (Cocos Acciones)' },
    ],
    'Plazo Fijo': [
        { ticker: 'PF-30', label: 'Plazo Fijo Tradicional (30 días)' },
        { ticker: 'PF-UVA', label: 'Plazo Fijo UVA (90 días)' },
    ],
    'Cripto': [
        { ticker: 'BTC', label: 'Bitcoin (BTC)' },
        { ticker: 'ETH', label: 'Ethereum (ETH)' },
        { ticker: 'USDT', label: 'Tether (USDT)' },
        { ticker: 'SOL', label: 'Solana (SOL)' },
    ]
};

const NewInvestmentModal: React.FC<NewInvestmentModalProps> = ({ isOpen, onClose }) => {
    const { addInvestment } = useInvestments();

    // Form state
    const [formData, setFormData] = useState({
        date: getTodayArgentina(),
        type: '',
        ticker: '',
        price: '',
        amount: '',
        broker: '',
    });

    const [loadingOptions, setLoadingOptions] = useState(false);
    const [availableOptions, setAvailableOptions] = useState<{ ticker: string; label: string; price?: number; tna?: number }[]>([]);

    // AI state
    const [aiResult, setAiResult] = useState<AiCalculationResult | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    // Fetch instruments when type changes
    useEffect(() => {
        if (formData.type && INSTRUMENT_OPTIONS[formData.type]) {
            setLoadingOptions(true);
            setFormData(prev => ({ ...prev, ticker: '', price: '' }));
            setAiResult(null);
            setAiError(null);

            // Simulate API fetch delay
            setTimeout(() => {
                setAvailableOptions(INSTRUMENT_OPTIONS[formData.type] || []);
                setLoadingOptions(false);
            }, 600);
        } else {
            setAvailableOptions([]);
        }
    }, [formData.type]);

    // Auto-fill price when selecting a Lecap ticker
    useEffect(() => {
        if (formData.type === 'Lecaps' && formData.ticker) {
            const selected = availableOptions.find(o => o.ticker === formData.ticker);
            if (selected?.price) {
                setFormData(prev => ({ ...prev, price: selected.price!.toString() }));
            }
        }
    }, [formData.ticker, formData.type, availableOptions]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Reset AI results when changing key fields
        if (['type', 'ticker', 'price', 'amount'].includes(name)) {
            setAiResult(null);
            setAiError(null);
            setSaved(false);
        }
    };

    const canCalculate = formData.date && formData.type && formData.ticker && formData.price && formData.amount && formData.broker;

    const handleAiCalculation = async () => {
        if (!canCalculate) return;

        setAiLoading(true);
        setAiError(null);
        setAiResult(null);

        // Find the TNA of the selected instrument (if available)
        const selectedOption = availableOptions.find(o => o.ticker === formData.ticker);
        const marketTna = selectedOption?.tna;

        try {
            const result = await calculateInvestmentMetrics(
                formData.type,
                formData.ticker,
                Number(formData.price),
                Number(formData.amount),
                formData.date,
                marketTna
            );
            setAiResult(result);
        } catch (err: any) {
            setAiError(err.message || 'Error al calcular. Intente nuevamente.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSaveInvestment = () => {
        if (!aiResult) return;

        addInvestment({
            date: formData.date,
            amount: Number(formData.amount),
            ticker: formData.ticker,
            broker: formData.broker,
            type: formData.type,
            price: Number(formData.price),
            nominals: aiResult.nominals,
            tem: aiResult.tem,
            tir: aiResult.tir,
            tna: aiResult.tna,
            tae: aiResult.tae,
            maturityDate: aiResult.maturityDate,
            maturityValue: aiResult.maturityValue,
            aiExplanation: aiResult.explanation,
        });

        setSaved(true);

        // Close and reset after brief confirmation
        setTimeout(() => {
            resetAndClose();
        }, 1500);
    };

    const resetAndClose = () => {
        setFormData({
            date: getTodayArgentina(),
            type: '',
            ticker: '',
            price: '',
            amount: '',
            broker: '',
        });
        setAiResult(null);
        setAiError(null);
        setAiLoading(false);
        setSaved(false);
        onClose();
    };

    const ganancia = aiResult ? (aiResult.maturityValue - Number(formData.amount)) : 0;

    return (
        <div className={styles.overlay} onClick={resetAndClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Robot size={24} weight="duotone" color="var(--primary)" />
                        <h2>Nueva Inversión Inteligente</h2>
                    </div>
                    <button className={styles.closeButton} onClick={resetAndClose} aria-label="Cerrar">
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.form}>
                    {/* STEP 1: Date */}
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="date">📅 ¿Cuándo realizaste la inversión?</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className={styles.input}
                            required
                        />
                    </div>

                    {/* STEP 2: Instrument Type */}
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="type">📊 ¿En qué tipo de instrumento invertiste?</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className={styles.input}
                        >
                            <option value="">-- Seleccione instrumento --</option>
                            <option value="Acciones">Acciones / CEDEARs</option>
                            <option value="Bonos">Bonos / ONs</option>
                            <option value="Lecaps">Lecaps</option>
                            <option value="FCI">Fondo Común de Inversión</option>
                            <option value="Plazo Fijo">Plazo Fijo</option>
                            <option value="Cripto">Criptomonedas</option>
                        </select>
                    </div>

                    {/* STEP 3: Specific Instrument from Cocos Capital */}
                    {formData.type && (
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="ticker">
                                🏦 Seleccioná el instrumento
                                <span className={styles.sourceTag}>Fuente: Cocos Capital</span>
                            </label>
                            {loadingOptions ? (
                                <div className={styles.loadingInline}>
                                    <SpinnerGap size={18} className={styles.spinner} />
                                    Conectando con Cocos Capital...
                                </div>
                            ) : (
                                <select
                                    id="ticker"
                                    name="ticker"
                                    value={formData.ticker}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    required
                                >
                                    <option value="">-- Elegí una opción --</option>
                                    {availableOptions.map(opt => (
                                        <option key={opt.ticker} value={opt.ticker}>
                                            {opt.label} {opt.price ? `($ ${opt.price})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* STEP 4: Price per nominal */}
                    {formData.ticker && (
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="price">💲 Precio por cada 100 nominales</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                placeholder="Ej: 127.80"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                className={styles.input}
                                required
                            />
                        </div>
                    )}

                    {/* STEP 5: Total amount invested */}
                    {formData.price && (
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="amount">💰 Monto total invertido (ARS)</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                placeholder="Ej: 1000000"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={handleInputChange}
                                className={styles.input}
                                required
                            />
                        </div>
                    )}

                    {/* STEP 6: Broker / Bank */}
                    {formData.amount && (
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="broker">🏛️ Broker o Banco</label>
                            <input
                                type="text"
                                id="broker"
                                name="broker"
                                placeholder="Ej: Cocos Capital, Balanz, IOL"
                                value={formData.broker}
                                onChange={handleInputChange}
                                className={styles.input}
                                required
                            />
                        </div>
                    )}

                    {/* AI CALCULATION BUTTON */}
                    {canCalculate && !aiResult && !saved && (
                        <button
                            type="button"
                            className={styles.btnAiCalculate}
                            onClick={handleAiCalculation}
                            disabled={aiLoading}
                        >
                            {aiLoading ? (
                                <>
                                    <SpinnerGap size={20} className={styles.spinner} />
                                    Analizando con Gemini AI...
                                </>
                            ) : (
                                <>
                                    <Robot size={20} weight="duotone" />
                                    Calcular Rendimiento con IA
                                </>
                            )}
                        </button>
                    )}

                    {/* AI ERROR */}
                    {aiError && (
                        <div className={styles.aiErrorBox}>
                            <WarningCircle size={20} />
                            <span>{aiError}</span>
                        </div>
                    )}

                    {/* AI RESULT PANEL */}
                    {aiResult && !saved && (
                        <div className={styles.aiResultPanel}>
                            <div className={styles.aiResultHeader}>
                                <Robot size={22} weight="duotone" />
                                <span>
                                    {aiResult.source === 'gemini'
                                        ? 'Análisis de Gemini AI'
                                        : 'Cálculo Financiero Local'
                                    }
                                </span>
                                <span className={styles.sourceTag} style={{ marginLeft: 'auto' }}>
                                    {aiResult.source === 'gemini' ? '🤖 Gemini' : '📐 Motor Local'}
                                </span>
                            </div>

                            <div className={styles.metricsGrid}>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Nominales</span>
                                    <span className={styles.metricValue}>
                                        {aiResult.nominals.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Vencimiento</span>
                                    <span className={styles.metricValue}>{aiResult.maturityDate}</span>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Valor al Vto.</span>
                                    <span className={styles.metricValueHighlight}>
                                        $ {aiResult.maturityValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Ganancia</span>
                                    <span className={styles.metricValueGain}>
                                        + $ {ganancia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.ratesGrid}>
                                <div className={styles.rateChip}>
                                    <span className={styles.rateChipLabel}>TEM</span>
                                    <span className={styles.rateChipValue}>{aiResult.tem}</span>
                                </div>
                                <div className={styles.rateChip}>
                                    <span className={styles.rateChipLabel}>TNA</span>
                                    <span className={styles.rateChipValue}>{aiResult.tna}</span>
                                </div>
                                <div className={styles.rateChip}>
                                    <span className={styles.rateChipLabel}>TAE</span>
                                    <span className={styles.rateChipValue}>{aiResult.tae}</span>
                                </div>
                                <div className={styles.rateChip}>
                                    <span className={styles.rateChipLabel}>TIR</span>
                                    <span className={styles.rateChipValue}>{aiResult.tir}</span>
                                </div>
                            </div>

                            <p className={styles.aiExplanation}>
                                💡 {aiResult.explanation}
                            </p>

                            <div className={styles.actions}>
                                <button type="button" className={styles.btnCancel} onClick={resetAndClose}>
                                    Cancelar
                                </button>
                                <button type="button" className={styles.btnSubmit} onClick={handleSaveInvestment}>
                                    <CheckCircle size={20} weight="bold" />
                                    Confirmar y Guardar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SAVED CONFIRMATION */}
                    {saved && (
                        <div className={styles.savedConfirmation}>
                            <CheckCircle size={48} weight="duotone" />
                            <p>¡Inversión registrada exitosamente!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewInvestmentModal;
