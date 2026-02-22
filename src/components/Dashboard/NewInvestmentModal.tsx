import { useState, useEffect } from 'react';
import { X, Robot, SpinnerGap, CheckCircle, WarningCircle, TrendUp, TrendDown } from 'phosphor-react';
import styles from './NewInvestmentModal.module.css';
import { useInvestments } from '../../context/InvestmentContext';
import { calculateInvestmentMetrics, getLiveMarketRates, type AiCalculationResult } from '../../services/aiService';
import { getTodayArgentina } from '../../utils/dateUtils';

interface NewInvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type MovementType = '' | 'inversion' | 'retiro';

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
        { ticker: 'TX26', label: 'TX26 - Bono CER Nov 2026' },
        { ticker: 'TZXM7', label: 'TZXM7 - Bono CER Mar 2027' },
    ],
    'Plazo Fijo': [
        { ticker: 'PF-BRUBANK', label: 'Plazo Fijo - Brubank', price: 100, tna: 38.00 },
        { ticker: 'PF-CIUDAD', label: 'Plazo Fijo - Banco Ciudad', price: 100, tna: 37.00 },
        { ticker: 'PF-UALA', label: 'Plazo Fijo - Ualá', price: 100, tna: 36.50 },
        { ticker: 'PF-PREX', label: 'Plazo Fijo - Prex', price: 100, tna: 36.50 },
        { ticker: 'PF-UVA', label: 'Plazo Fijo UVA (90 días)', price: 100, tna: 1.00 },
    ],
    'Cauciones Bursátiles': [
        { ticker: 'CAUC-1D', label: 'Caución 1 día (Cocos)', price: 100, tna: 36.25 },
        { ticker: 'CAUC-3D', label: 'Caución 3 días (Cocos)', price: 100, tna: 36.50 },
        { ticker: 'CAUC-7D', label: 'Caución 7 días (Cocos)', price: 100, tna: 37.10 },
        { ticker: 'CAUC-14D', label: 'Caución 14 días (Cocos)', price: 100, tna: 37.45 },
        { ticker: 'CAUC-21D', label: 'Caución 21 días (Cocos)', price: 100, tna: 37.80 },
        { ticker: 'CAUC-30D', label: 'Caución 30 días (Cocos)', price: 100, tna: 38.25 },
    ]
};

const NewInvestmentModal: React.FC<NewInvestmentModalProps> = ({ isOpen, onClose }) => {
    const { addInvestment, addWithdrawal } = useInvestments();

    // Movement type: '' = not selected, 'inversion', 'retiro'
    const [movementType, setMovementType] = useState<MovementType>('');

    // Form state for investment
    const [formData, setFormData] = useState({
        date: getTodayArgentina(),
        type: '',
        ticker: '',
        price: '',
        amount: '',
        broker: '',
    });

    // Form state for withdrawal
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalDescription, setWithdrawalDescription] = useState('');

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

            const loadOptions = async () => {
                const baseOptions = INSTRUMENT_OPTIONS[formData.type];
                // Fetch live rates from AI
                const liveOptions = await getLiveMarketRates(formData.type, baseOptions);
                setAvailableOptions(liveOptions);
                setLoadingOptions(false);
            };

            loadOptions();
        } else {
            setAvailableOptions([]);
        }
    }, [formData.type]);

    // Auto-fill price when selecting a Lecap, Caución or Plazo Fijo ticker
    useEffect(() => {
        if (['Lecaps', 'Cauciones Bursátiles', 'Plazo Fijo'].includes(formData.type) && formData.ticker) {
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
        setTimeout(() => {
            resetAndClose();
        }, 1500);
    };

    const handleSaveWithdrawal = () => {
        if (!withdrawalAmount || Number(withdrawalAmount) <= 0) return;

        addWithdrawal({
            date: formData.date,
            amount: Number(withdrawalAmount),
            description: withdrawalDescription || undefined,
        });

        setSaved(true);
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
        setMovementType('');
        setWithdrawalAmount('');
        setWithdrawalDescription('');
        setAiResult(null);
        setAiError(null);
        setAiLoading(false);
        setSaved(false);
        onClose();
    };

    const ganancia = aiResult ? (aiResult.maturityValue - Number(formData.amount)) : 0;

    // Dynamic header based on movement type
    const getHeaderTitle = () => {
        if (movementType === 'retiro') return 'Nuevo Retiro';
        if (movementType === 'inversion') return 'Nueva Inversión Inteligente';
        return 'Nuevo Movimiento';
    };

    const getHeaderIcon = () => {
        if (movementType === 'retiro') return <TrendDown size={24} weight="duotone" color="#ef4444" />;
        if (movementType === 'inversion') return <Robot size={24} weight="duotone" color="var(--primary)" />;
        return <TrendUp size={24} weight="duotone" color="var(--primary)" />;
    };

    return (
        <div className={styles.overlay} onClick={resetAndClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getHeaderIcon()}
                        <h2>{getHeaderTitle()}</h2>
                    </div>
                    <button className={styles.closeButton} onClick={resetAndClose} aria-label="Cerrar">
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.form}>
                    {/* STEP 1: Date */}
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="date">📅 ¿Cuándo se realizó el movimiento?</label>
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

                    {/* STEP 2: Movement Type Selection */}
                    {!movementType && !saved && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>📊 ¿Qué tipo de movimiento querés registrar?</label>
                            <div className={styles.movementTypeSelector}>
                                <button
                                    type="button"
                                    className={styles.btnInversion}
                                    onClick={() => setMovementType('inversion')}
                                >
                                    <TrendUp size={22} weight="bold" />
                                    <span>Nueva Inversión</span>
                                </button>
                                <button
                                    type="button"
                                    className={styles.btnRetiro}
                                    onClick={() => setMovementType('retiro')}
                                >
                                    <TrendDown size={22} weight="bold" />
                                    <span>Nuevo Retiro</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== INVESTMENT FLOW ===== */}
                    {movementType === 'inversion' && !saved && (
                        <>
                            {/* Instrument Type */}
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
                                    <option value="Lecaps">Lecaps</option>
                                    <option value="Plazo Fijo">Plazos Fijos</option>
                                    <option value="Cauciones Bursátiles">Cauciones Bursátiles</option>
                                    <option value="Bonos">Bonos / ONs / CER</option>
                                </select>
                            </div>

                            {/* Specific Instrument */}
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
                                                    {opt.label}
                                                    {opt.price ? ` ($${opt.price})` : ''}
                                                    {opt.tna ? ` [TNA: ${opt.tna}%]` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* Price / Rate (Hidden for Cauciones/PF as they are parity 100) */}
                            {formData.ticker && (
                                <div className={styles.formGroup} style={['Cauciones Bursátiles', 'Plazo Fijo'].includes(formData.type) ? { display: 'none' } : {}}>
                                    <label className={styles.label} htmlFor="price">
                                        💲 {formData.type === 'Bonos' ? 'Precio por cada 100 nominales' : 'Precio de compra'}
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        placeholder="Ej: 105.20"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        required={!['Cauciones Bursátiles', 'Plazo Fijo'].includes(formData.type)}
                                    />
                                </div>
                            )}

                            {/* TNA Info Badge (Always visible if TNA exists) */}
                            {formData.ticker && availableOptions.find(o => o.ticker === formData.ticker)?.tna && (
                                <div className={styles.formGroup}>
                                    <div className={styles.tnaInfo}>
                                        <TrendUp size={14} weight="bold" />
                                        <span>TNA de mercado: <strong>{availableOptions.find(o => o.ticker === formData.ticker)?.tna}%</strong></span>
                                    </div>
                                </div>
                            )}

                            {/* Total amount invested */}
                            {(formData.price || ['Cauciones Bursátiles', 'Plazo Fijo'].includes(formData.type)) && (
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

                            {/* Broker / Bank */}
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
                            {canCalculate && !aiResult && (
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
                            {aiResult && (
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
                        </>
                    )}

                    {/* ===== WITHDRAWAL FLOW ===== */}
                    {movementType === 'retiro' && !saved && (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="withdrawalAmount">
                                    💸 Monto a retirar (ARS)
                                </label>
                                <input
                                    type="number"
                                    id="withdrawalAmount"
                                    placeholder="Ej: 500000"
                                    step="0.01"
                                    min="0"
                                    value={withdrawalAmount}
                                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="withdrawalDesc">
                                    📝 Descripción (opcional)
                                </label>
                                <input
                                    type="text"
                                    id="withdrawalDesc"
                                    placeholder="Ej: Retiro parcial, pago de gastos..."
                                    value={withdrawalDescription}
                                    onChange={(e) => setWithdrawalDescription(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            {withdrawalAmount && Number(withdrawalAmount) > 0 && (
                                <div className={styles.withdrawalSummary}>
                                    <TrendDown size={20} weight="bold" />
                                    <span>
                                        Se debitarán <strong>$ {Number(withdrawalAmount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong> de tu capital total
                                    </span>
                                </div>
                            )}

                            <div className={styles.actions}>
                                <button type="button" className={styles.btnCancel} onClick={resetAndClose}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className={styles.btnRetiroConfirm}
                                    onClick={handleSaveWithdrawal}
                                    disabled={!withdrawalAmount || Number(withdrawalAmount) <= 0}
                                >
                                    <CheckCircle size={20} weight="bold" />
                                    Confirmar Retiro
                                </button>
                            </div>
                        </>
                    )}

                    {/* SAVED CONFIRMATION */}
                    {saved && (
                        <div className={styles.savedConfirmation} style={{
                            color: movementType === 'retiro' ? '#ef4444' : 'var(--primary)'
                        }}>
                            <CheckCircle size={48} weight="duotone" />
                            <p>{movementType === 'retiro'
                                ? '¡Retiro registrado exitosamente!'
                                : '¡Inversión registrada exitosamente!'
                            }</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewInvestmentModal;
