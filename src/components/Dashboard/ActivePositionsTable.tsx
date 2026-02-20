import { Money, Bank, Scroll, SmileyXEyes, Trash } from "phosphor-react";
import styles from "./Dashboard.module.css";
import { useInvestments } from "../../context/InvestmentContext";

const ActivePositionsTable = () => {
    const { investments, removeInvestment } = useInvestments();

    if (investments.length === 0) {
        return (
            <div className={styles.card}>
                <div className={styles.tableHeader}>
                    <h3>Posiciones Activas</h3>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <SmileyXEyes size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No tienes inversiones activas registradas.</p>
                    <p style={{ fontSize: '0.9rem' }}>Utiliza el botón "Nueva Inversión" para comenzar.</p>
                </div>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'Plazo Fijo': return <Bank size={20} color="#00C49F" />;
            case 'Lecaps': return <Scroll size={20} color="#FFBB28" />;
            default: return <Money size={20} color="#8884d8" />;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.tableHeader}>
                <h3>Posiciones Activas</h3>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>Tipo</th>
                            <th>Activo</th>
                            <th>Invertido</th>
                            <th>Nominales</th>
                            <th>TEM</th>
                            <th>TNA</th>
                            <th>TAE</th>
                            <th>Vencimiento</th>
                            <th style={{ textAlign: 'right' }}>Ganancia Est.</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {investments.map((inv) => {
                            const ganancia = inv.maturityValue
                                ? inv.maturityValue - inv.amount
                                : 0;

                            return (
                                <tr key={inv.id}>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-main)', width: 32, height: 32, borderRadius: 8 }}>
                                            {getIcon(inv.type)}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{inv.ticker || inv.type}</td>
                                    <td>$ {Number(inv.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                    <td>{inv.nominals ? inv.nominals.toLocaleString('es-AR', { maximumFractionDigits: 2 }) : '-'}</td>
                                    <td style={{ color: '#10b981', fontWeight: 600 }}>{inv.tem || '-'}</td>
                                    <td style={{ color: '#10b981', fontWeight: 600 }}>{inv.tna || '-'}</td>
                                    <td style={{ color: '#10b981', fontWeight: 600 }}>{inv.tae || '-'}</td>
                                    <td>{inv.maturityDate || '-'}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: ganancia > 0 ? '#10b981' : 'var(--text-secondary)' }}>
                                        {ganancia > 0
                                            ? `+ $ ${ganancia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => removeInvestment(inv.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-secondary)',
                                                transition: 'color 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                            title="Eliminar inversión"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivePositionsTable;
