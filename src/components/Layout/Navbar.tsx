import { useState } from "react";
import { ChartLineUp, Wallet, FileText, User, Robot, Plus } from "phosphor-react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import NewInvestmentModal from "../Dashboard/NewInvestmentModal";

const Navbar = () => {
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const tabs = [
        { label: "Dashboard", icon: <ChartLineUp size={24} weight="bold" />, path: "/" },
        { label: "Movimientos", icon: <Wallet size={24} weight="bold" />, path: "/movements" },
        { label: "Asistente IA", icon: <Robot size={24} weight="bold" />, path: "/ai-assistant" },
        { label: "Reportes", icon: <FileText size={24} weight="bold" />, path: "/reports" },
        { label: "Perfil", icon: <User size={24} weight="bold" />, path: "/profile" },
    ];

    return (
        <>
            <header className={styles.navbar}>
                <div className={styles.leftSection}>
                    <Link to="/" className={styles.logo}>
                        <img src="/vite.svg" alt="ValorAr" style={{ width: 28, height: 28 }} />
                        <h1>ValorAr</h1>
                    </Link>
                </div>

                <nav className={styles.navLinks}>
                    {tabs.map((tab) => (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={`${styles.navItem} ${location.pathname === tab.path ? styles.active : ''}`}
                            data-tooltip={tab.label}
                        >
                            {tab.icon}
                        </Link>
                    ))}
                </nav>

                <button
                    className={styles.newInvestmentBtn}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={16} weight="bold" />
                    <span>Nueva Inversión</span>
                </button>
            </header>

            <NewInvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default Navbar;
