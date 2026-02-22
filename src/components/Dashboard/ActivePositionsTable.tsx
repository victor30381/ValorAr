import { Money, Bank, Scroll, SmileyXEyes, Trash } from "phosphor-react";
import styles from "./Dashboard.module.css";
import { useInvestments } from "../../context/InvestmentContext";

const ActivePositionsTable = () => {
    const { investments, removeInvestment } = useInvestments();

    const getIcon = (type: string) => {
        switch (type) {
            case 'Plazo Fijo': return <Bank size={20} color="#00C49F" />;
            case 'Lecaps': return <Scroll size={20} color="#FFBB28" />;
            case 'Cauciones Bursátiles': return <Money size={20} color="var(--primary)" />;
            case 'Bonos': return <Scroll size={20} color="#FF8042" />;
            default: return <Money size={20} color="#8884d8" />;
        }
    };

    if (investments.length === 0) {
        return (
            <div className={styles.card}>
                <div className={styles.tableHeader}>
                    <h3>Posiciones Activas</h3>
                </div>
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <SmileyXEyes size={40} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                    <p>No tienes inversiones activas registradas.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Utiliza el botón "+" para comenzar.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.tableHeader}>
                <h3>Posiciones Activas</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {investments.length} {investments.length === 1 ? 'posición' : 'posiciones'}
                </span>
            </div>

            {/* Mobile Card View */}
            <div className={styles.positionsList}>
                {investments.map((inv) => {
                    const ganancia = inv.maturityValue
                        ? inv.maturityValue - inv.amount
                        : 0;

                    return (
                        <div key={inv.id} className={styles.mobilePositionCard}>
                            {/* Header: Icon + Ticker + Delete */}
                            <div className={styles.mobileCardHeader}>
                                <div className={styles.mobileCardTicker}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        background: 'var(--bg-main)',
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8
                                    }}>
                                        {getIcon(inv.type)}
                                    </div>
                                    <div>
                                        <span className={styles.mobileCardTickerName}>
                                            {inv.ticker || inv.type}
                                        </span>
                                        <span className={styles.mobileCardType}>{inv.type}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeInvestment(inv.id)}
                                    className={styles.mobileDeleteBtn}
                                    title="Eliminar inversión"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>

                            {/* Invested amount */}
                            <div className={styles.mobileCardRow}>
                                <span className={styles.mobileCardLabel}>Invertido</span>
                                <span className={styles.mobileCardValue}>
                                    $ {Number(inv.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Nominals */}
                            {inv.nominals && (
                                <div className={styles.mobileCardRow}>
                                    <span className={styles.mobileCardLabel}>Nominales</span>
                                    <span className={styles.mobileCardValue}>
                                        {inv.nominals.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            {/* Maturity */}
                            {inv.maturityDate && (
                                <div className={styles.mobileCardRow}>
                                    <span className={styles.mobileCardLabel}>Vencimiento</span>
                                    <span className={styles.mobileCardValue}>{inv.maturityDate}</span>
                                </div>
                            )}

                            {/* Rates */}
                            {(inv.tem || inv.tna || inv.tae) && (
                                <div className={styles.mobileCardRates}>
                                    {inv.tem && <span className={styles.mobileCardRate}>TEM {inv.tem}</span>}
                                    {inv.tna && <span className={styles.mobileCardRate}>TNA {inv.tna}</span>}
                                    {inv.tae && <span className={styles.mobileCardRate}>TAE {inv.tae}</span>}
                                </div>
                            )}

                            {/* Gain */}
                            {ganancia > 0 && (
                                <div className={styles.mobileCardRow} style={{ marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                    <span className={styles.mobileCardLabel}>Ganancia Est.</span>
                                    <span className={styles.mobileCardGain}>
                                        + $ {ganancia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivePositionsTable;
