import { useState } from 'react';
import { TrendUp, TrendDown, Trash, ListBullets, FilePdf, SpinnerGap } from 'phosphor-react';
import styles from './MovementsView.module.css';
import { useInvestments } from '../../context/InvestmentContext';
import { useAuth } from '../../context/AuthContext';
import { generatePortfolioPDF } from '../../services/pdfService';

type FilterType = 'all' | 'inversiones' | 'retiros';

interface MovementItem {
    id: string;
    date: string;
    type: 'inversion' | 'retiro';
    amount: number;
    title: string;
    subtitle: string;
}

const MovementsView = () => {
    const {
        investments,
        withdrawals,
        removeInvestment,
        removeWithdrawal,
        totalCapital,
        totalWithdrawals,
        netCapital,
    } = useInvestments();

    const { user } = useAuth();

    const [filter, setFilter] = useState<FilterType>('all');
    const [pdfLoading, setPdfLoading] = useState(false);

    // Combine investments and withdrawals into a unified list
    const allMovements: MovementItem[] = [
        ...investments.map((inv) => ({
            id: inv.id,
            date: inv.date,
            type: 'inversion' as const,
            amount: inv.amount,
            title: inv.ticker ? `${inv.type} — ${inv.ticker}` : inv.type,
            subtitle: inv.broker
                ? `${inv.broker}${inv.tae ? ` • TAE: ${inv.tae}` : ''}`
                : (inv.tae ? `TAE: ${inv.tae}` : 'Inversión registrada'),
        })),
        ...withdrawals.map((w) => ({
            id: w.id,
            date: w.date,
            type: 'retiro' as const,
            amount: w.amount,
            title: 'Retiro de fondos',
            subtitle: w.description || 'Sin descripción',
        })),
    ];

    // Sort by date descending
    allMovements.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });

    // Apply filter
    const filteredMovements = allMovements.filter((m) => {
        if (filter === 'inversiones') return m.type === 'inversion';
        if (filter === 'retiros') return m.type === 'retiro';
        return true;
    });

    // Group by date
    const groupedByDate: Record<string, MovementItem[]> = {};
    filteredMovements.forEach((m) => {
        if (!groupedByDate[m.date]) {
            groupedByDate[m.date] = [];
        }
        groupedByDate[m.date].push(m);
    });

    const formatDate = (dateStr: string) => {
        try {
            const [year, month, day] = dateStr.split('-');
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
        } catch {
            return dateStr;
        }
    };

    const handleDelete = async (movement: MovementItem) => {
        if (movement.type === 'inversion') {
            await removeInvestment(movement.id);
        } else {
            await removeWithdrawal(movement.id);
        }
    };

    const handleExportPDF = async () => {
        setPdfLoading(true);
        try {
            // small delay to show spinner
            await new Promise(r => setTimeout(r, 100));
            await generatePortfolioPDF(
                investments,
                withdrawals,
                user?.displayName || user?.email || undefined
            );
        } catch (err) {
            console.error('Error generando PDF:', err);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>Movimientos</h2>
                    <p>Historial completo de inversiones y retiros</p>
                </div>
                <button
                    className={styles.importBtn}
                    onClick={handleExportPDF}
                    disabled={pdfLoading || (investments.length === 0 && withdrawals.length === 0)}
                    title="Exportar reporte PDF"
                >
                    {pdfLoading ? (
                        <SpinnerGap size={18} weight="bold" className={styles.spinnerAnim} />
                    ) : (
                        <FilePdf size={18} weight="bold" />
                    )}
                    <span>{pdfLoading ? 'Generando...' : 'Exportar PDF'}</span>
                </button>
            </div>

            {/* Summary row */}
            <div className={styles.summaryRow}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Invertido</span>
                    <span className={styles.summaryValueGreen}>
                        $ {totalCapital.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Retirado</span>
                    <span className={styles.summaryValueRed}>
                        $ {totalWithdrawals.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Neto</span>
                    <span className={styles.summaryValuePrimary}>
                        $ {netCapital.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Filter tabs */}
            <div className={styles.filterTabs}>
                <button
                    className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                <button
                    className={`${styles.filterTab} ${filter === 'inversiones' ? styles.filterTabActive : ''}`}
                    onClick={() => setFilter('inversiones')}
                >
                    <TrendUp size={14} weight="bold" />
                    Inversiones
                </button>
                <button
                    className={`${styles.filterTab} ${filter === 'retiros' ? styles.filterTabActive : ''}`}
                    onClick={() => setFilter('retiros')}
                >
                    <TrendDown size={14} weight="bold" />
                    Retiros
                </button>
            </div>

            {/* Movements list */}
            {filteredMovements.length === 0 ? (
                <div className={styles.emptyState}>
                    <ListBullets size={48} weight="thin" />
                    <p>No hay movimientos registrados</p>
                    <span>Usá el botón + para registrar una inversión o retiro</span>
                </div>
            ) : (
                <div className={styles.movementsList}>
                    {Object.entries(groupedByDate).map(([date, movements]) => (
                        <div key={date}>
                            <div className={styles.dateGroup}>{formatDate(date)}</div>
                            {movements.map((movement) => (
                                <div key={movement.id} className={styles.movementCard}>
                                    {/* Icon */}
                                    <div className={`${styles.movementIcon} ${movement.type === 'inversion' ? styles.iconInversion : styles.iconRetiro
                                        }`}>
                                        {movement.type === 'inversion'
                                            ? <TrendUp size={20} weight="bold" />
                                            : <TrendDown size={20} weight="bold" />
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className={styles.movementInfo}>
                                        <span className={styles.movementTitle}>{movement.title}</span>
                                        <span className={styles.movementSubtitle}>{movement.subtitle}</span>
                                    </div>

                                    {/* Amount */}
                                    <div className={styles.movementRight}>
                                        <span className={
                                            movement.type === 'inversion'
                                                ? styles.movementAmountGreen
                                                : styles.movementAmountRed
                                        }>
                                            {movement.type === 'inversion' ? '+' : '-'} ${' '}
                                            {movement.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className={styles.movementDate}>{formatDate(movement.date)}</span>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(movement)}
                                        aria-label="Eliminar"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MovementsView;
