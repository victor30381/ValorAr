import { Clock, TrendUp, Wallet } from "phosphor-react";
import MetricCard from "./MetricCard";
import ActivePositionsTable from "./ActivePositionsTable";
import MaturityList from "./MaturityList";
import AssetDistributionChart from "./AssetDistributionChart";
import styles from "./Dashboard.module.css";
import { useInvestments } from "../../context/InvestmentContext";

const DashboardView = () => {
    const { investments, totalCapital, netCapital } = useInvestments();

    // Calculate total estimated gain
    const totalGain = investments.reduce((sum, inv) => {
        if (inv.maturityValue) {
            const amount = Number(inv.amount) || 0;
            const commission = Number(inv.commission) || 0;
            const realAmount = amount - commission;
            return sum + (inv.maturityValue - realAmount);
        }
        return sum;
    }, 0);

    // Calculate weighted average TAE
    const weightedTae = investments.reduce((sum, inv) => {
        if (inv.tae && inv.amount) {
            const amount = Number(inv.amount) || 0;
            const commission = Number(inv.commission) || 0;
            const realAmount = amount - commission;

            const taeNum = parseFloat(inv.tae.replace('%', '').replace(',', '.'));
            if (!isNaN(taeNum)) {
                return sum + (taeNum * realAmount);
            }
        }
        return sum;
    }, 0);
    const avgTae = totalCapital > 0 ? (weightedTae / totalCapital) : 0;

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <div>
                    <h2>Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tu portafolio de inversiones</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <MetricCard
                    title="Capital Invertido"
                    value={`$ ${netCapital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                    subtitle="Inversiones - Retiros"
                    icon={<Wallet size={24} weight="duotone" />}
                    variant="Primary"
                />
                <MetricCard
                    title="Ganancia Est."
                    value={`$ ${totalGain.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                    color="success"
                    icon={<TrendUp size={24} weight="duotone" />}
                    variant="Blue"
                />
                <MetricCard
                    title="Capital al Vencimiento"
                    value={`$ ${(netCapital + totalGain).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                    subtitle="Invertido + Ganancia"
                    icon={<Wallet size={24} weight="duotone" />}
                    variant="Purple"
                />
                <MetricCard
                    title="Tasa Promedio"
                    value={`${avgTae.toFixed(1)}% TAE`}
                    icon={<Clock size={24} weight="duotone" />}
                    variant="Orange"
                />
            </div>

            {/* Charts & Maturities */}
            <div className={styles.chartsGrid}>
                <div className={styles.card}>
                    <MaturityList />
                </div>
                <div className={styles.card}>
                    <AssetDistributionChart />
                </div>
            </div>

            {/* Active Positions */}
            <div className={styles.positionsSection}>
                <ActivePositionsTable />
            </div>

        </div>
    );
};

export default DashboardView;
