import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useInvestments } from "../../context/InvestmentContext";
import styles from "./AssetDistributionChart.module.css";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AssetDistributionChart = () => {
    const { investments } = useInvestments();

    // Group by type
    const data = investments.reduce((acc: any[], curr) => {
        const amount = Number(curr.amount) || 0;
        const commission = Number(curr.commission) || 0;
        const realAmount = amount - commission;

        const found = acc.find(item => item.name === curr.type);
        if (found) {
            found.value += realAmount;
        } else {
            acc.push({ name: curr.type, value: realAmount });
        }
        return acc;
    }, []);

    if (data.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h4 className={styles.title}>Distribución de Activos</h4>
                <p>Sin datos disponibles</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>Distribución de Activos</h4>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => `$ ${(value || 0).toLocaleString('es-AR')}`}
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'var(--bg-card)',
                                boxShadow: 'var(--shadow-lg)',
                                color: 'var(--text-primary)'
                            }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className={styles.legend}>
                {data.map((item, index) => (
                    <div key={item.name} className={styles.legendItem}>
                        <div
                            className={styles.legendDot}
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {item.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssetDistributionChart;
