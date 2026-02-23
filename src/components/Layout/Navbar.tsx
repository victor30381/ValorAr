import { useState } from "react";
import { ChartLineUp, Wallet, User, Lightbulb, Plus } from "phosphor-react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import NewInvestmentModal from "../Dashboard/NewInvestmentModal";

const Navbar = () => {
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const tabs = [
        { label: "Dashboard", icon: <ChartLineUp size={22} weight="bold" />, path: "/" },
        { label: "Sugerencias", icon: <Lightbulb size={22} weight="bold" />, path: "/ai-assistant" },
        { label: "Movimientos", icon: <Wallet size={22} weight="bold" />, path: "/movements" },
        { label: "Perfil", icon: <User size={22} weight="bold" />, path: "/profile" },
    ];

    return (
        <>
            {/* === TOP NAVBAR (always visible) === */}
            <header className={styles.navbar}>
                <div className={styles.leftSection}>
                    <Link to="/" className={styles.logo}>
                        <img src={`${import.meta.env.BASE_URL}valorar-logo.png`} alt="ValorAr" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        <h1>ValorAr</h1>
                    </Link>
                </div>

                {/* Desktop navigation links */}
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
                    <Plus size={18} weight="bold" />
                    <span>Nuevo Movimiento</span>
                </button>
            </header>

            {/* === BOTTOM NAVIGATION BAR (mobile only, rendered via CSS) === */}
            <nav className={styles.bottomNav}>
                {tabs.map((tab) => (
                    <Link
                        key={tab.path}
                        to={tab.path}
                        className={`${styles.bottomNavItem} ${location.pathname === tab.path ? styles.active : ''}`}
                    >
                        {tab.icon}
                        <span className={styles.bottomNavLabel}>{tab.label}</span>
                    </Link>
                ))}
            </nav>

            <NewInvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default Navbar;
