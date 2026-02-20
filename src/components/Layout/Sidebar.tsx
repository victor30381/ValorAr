import { ChartLineUp, Wallet, FileText, User, Robot, List, X } from "phosphor-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const menuItems = [
        { label: "Dashboard", icon: <ChartLineUp size={24} />, path: "/" },
        { label: "Movimientos", icon: <Wallet size={24} />, path: "/movements" },
        { label: "Asistente IA", icon: <Robot size={24} />, path: "/ai-assistant" },
        { label: "Reportes", icon: <FileText size={24} />, path: "/reports" },
        { label: "Perfil", icon: <User size={24} />, path: "/profile" },
    ];

    return (
        <>
            {/* Mobile Header with Hamburger Menu */}
            <div className={styles.mobileHeader}>
                <button onClick={toggleSidebar} className={styles.menuBtn}>
                    <List size={32} />
                </button>
                <div className={styles.logo} style={{ marginBottom: 0 }}>
                    <img src="/vite.svg" alt="ValorAr Logo" style={{ width: 28, height: 28 }} />
                    <h1 style={{ fontSize: '1.25rem' }}>ValorAr</h1>
                </div>
            </div>

            {/* Overlay */}
            <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={toggleSidebar}></div>

            {/* Sidebar Drawer */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <button onClick={toggleSidebar} className={styles.closeBtn}>
                    <X size={24} />
                </button>

                <div className={styles.logo}>
                    <img src="/vite.svg" alt="ValorAr Logo" style={{ width: 32, height: 32 }} />
                    <h1>ValorAr</h1>
                </div>
                <nav className={styles.nav}>
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`${styles.link} ${location.pathname === item.path ? styles.active : ""}`}
                                    onClick={() => setIsOpen(false)} // Close on navigate
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
