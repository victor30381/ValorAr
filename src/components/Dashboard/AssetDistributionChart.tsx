import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useInvestments } from "../../context/InvestmentContext";

const COLORS = ['#FFBB28', '#00C49F', '#0088FE', '#FF8042', '#8884d8'];

const AssetDistributionChart = () => {
    const { investments } = useInvestments();

    // Group by type
    const data = investments.reduce((acc: any[], curr) => {
        const found = acc.find(item => item.name === curr.type);
        if (found) {
            found.value += Number(curr.amount);
        } else {
            acc.push({ name: curr.type, value: Number(curr.amount) });
        }
        return acc;
    }, []);

    // Calculate percentages for tooltip or label if needed, but Recharts handles value mapping
    // We can also just pass the raw values

    if (data.length === 0) {
        return (
            <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h4>Distribución de Activos</h4>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Sin datos disponibles</p>
            </div>
        );
    }

    return (
        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
            <h4>Distribución de Activos</h4>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => `$ ${(value || 0).toLocaleString('es-AR')}`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AssetDistributionChart;
