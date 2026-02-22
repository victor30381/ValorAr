import styles from "./Dashboard.module.css";
import type { ReactNode } from "react";

interface MetricCardProps {
    title: string;
    value: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode;
    color?: string; // e.g., 'primary', 'secondary', 'danger', 'success'
    variant?: 'Primary' | 'Blue' | 'Purple' | 'Orange';
}

const MetricCard = ({ title, value, subtitle, icon, color = 'text-primary', variant }: MetricCardProps) => {
    const variantClass = variant ? styles[`card${variant}`] : '';

    return (
        <div className={`${styles.card} ${variantClass}`}>
            <div className={styles.cardHeader}>
                {icon && <div className={styles.icon}>{icon}</div>}
                <h3>{title}</h3>
            </div>
            <div className={`${styles.value} ${color === 'success' ? styles.success : ''}`}>{value}</div>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
    );
};

export default MetricCard;
