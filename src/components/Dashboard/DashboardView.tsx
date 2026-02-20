import { Clock, TrendUp, Wallet } from "phosphor-react";
import MetricCard from "./MetricCard";
import ActivePositionsTable from "./ActivePositionsTable";
import MaturityList from "./MaturityList";
import AssetDistributionChart from "./AssetDistributionChart";
import styles from "./Dashboard.module.css";
import { useInvestments } from "../../context/InvestmentContext";

const DashboardView = () => {
    const { investments, totalCapital } = useInvestments();

    // Calculate total estimated gain
    const totalGain = investments.reduce((sum, inv) => {
        if (inv.maturityValue) {
            return sum + (inv.maturityValue - inv.amount);
        }
        return sum;
    }, 0);

    // Calculate weighted average TAE
    const weightedTae = investments.reduce((sum, inv) => {
        if (inv.tae && inv.amount) {
            const taeNum = parseFloat(inv.tae.replace('%', '').replace(',', '.'));
            if (!isNaN(taeNum)) {
                return sum + (taeNum * inv.amount);
            }
        }
        return sum;
    }, 0);
    const avgTae = totalCapital > 0 ? (weightedTae / totalCapital) : 0;

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Bienvenido a tu portafolio</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <MetricCard
                    title="Capital Total"
                    value={`$ ${totalCapital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                    subtitle="Incluye intereses devengados a hoy"
                    icon={<Wallet size={32} />}
                />
                <MetricCard
                    title="Ganancia Estimada (A Venc.)"
                    value={`$ ${totalGain.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                    color="success"
                    icon={<TrendUp size={32} />}
                />
                <MetricCard
                    title="Tasa Promedio Ponderada"
                    value={`${avgTae.toFixed(1)}% TAE`}
                    icon={<Clock size={32} />}
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
