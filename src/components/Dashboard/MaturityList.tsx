import styles from "./Dashboard.module.css";
import { useInvestments } from "../../context/InvestmentContext";
import { SmileyXEyes } from "phosphor-react";

const MaturityList = () => {
    const { investments } = useInvestments();

    // Filter logic would go here, for now we just check if there are any investments
    // In a real app, we'd filter by date > today && date < today + 30 days
    const upcoming = investments.filter(inv => inv.maturityDate).slice(0, 5);

    if (upcoming.length === 0) {
        return (
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>Próximos Vencimientos</h3>
                </div>
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <SmileyXEyes size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.9rem' }}>No hay vencimientos próximos.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h3>Próximos Vencimientos (30 días)</h3>
                <button className={styles.actionLink}>[Ver Calendario Completo &gt;]</button>
            </div>

            <ul className={styles.maturityList}>
                {upcoming.map((item, index) => (
                    <li key={index} className={styles.maturityItem}>
                        {/* Dot */}
                        <div className={`${styles.maturityDot}`} />

                        <div className={styles.maturityContent}>
                            <div className={styles.maturityRow}>
                                <div>
                                    <span className={styles.maturityDate} style={{ color: 'var(--text-primary)' }}>
                                        {item.maturityDate}
                                    </span>
                                    <span className="text-secondary" style={{ margin: '0 0.5rem' }}>|</span>
                                    <span className={styles.maturityAmount}>
                                        $ {Number(item.amount).toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>
                            <span className={styles.maturityDesc}>{item.ticker || item.type}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MaturityList;
