import styles from "./Dashboard.module.css";
import { useInvestments } from "../../context/InvestmentContext";
import { SmileyXEyes } from "phosphor-react";

const MaturityList = () => {
    const { investments } = useInvestments();

    // Helper to parse DD/MM/YYYY to Date object
    const parseDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d);
    };

    // Filter, sort and slice investments
    const upcoming = investments
        .filter(inv => inv.maturityDate)
        .sort((a, b) => {
            const dateA = parseDate(a.maturityDate);
            const dateB = parseDate(b.maturityDate);
            if (!dateA || !dateB) return 0;
            return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 5);

    const getStatusDotClass = (maturityDateStr?: string) => {
        const matDate = parseDate(maturityDateStr);
        if (!matDate) return '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffMs = matDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 10) return styles.dotDanger;
        if (diffDays < 30) return styles.dotWarning;
        return styles.dotSafe;
    };

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
                <h3>Próximos Vencimientos</h3>
                <button className={styles.actionLink}>[Ver Calendario &gt;]</button>
            </div>

            <ul className={styles.maturityList}>
                {upcoming.map((item) => (
                    <li key={item.id} className={styles.maturityItem}>
                        {/* Status Color Dot */}
                        <div className={`${styles.maturityDot} ${getStatusDotClass(item.maturityDate)}`} />

                        <div className={styles.maturityContent}>
                            <div className={styles.maturityRow}>
                                <span className={styles.maturityDate}>
                                    {item.maturityDate}
                                </span>
                                <span className={styles.maturityAmount}>
                                    $ {(Number(item.amount) - (Number(item.commission) || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <span className={styles.maturityDesc}>{item.ticker || item.type} • {item.broker}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MaturityList;
