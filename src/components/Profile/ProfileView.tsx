import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { SignOut, User, Bell, ShieldCheck, Question, Palette, Moon, Sun, Monitor } from "phosphor-react";
import styles from "./ProfileView.module.css";
import { motion, AnimatePresence } from "framer-motion";

const ProfileView = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const menuItems = [
        { id: "notifications", icon: <Bell size={22} />, label: "Notificaciones", sub: "Alertas de vencimiento" },
        { id: "appearance", icon: <Palette size={22} />, label: "Apariencia", sub: "Modo oscuro y temas" },
        { id: "security", icon: <ShieldCheck size={22} />, label: "Seguridad", sub: "Protección de cuenta" },
        { id: "help", icon: <Question size={22} />, label: "Ayuda", sub: "Centro de soporte" },
    ];

    const toggleMenu = (id: string) => {
        setExpandedMenu(prev => prev === id ? null : id);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Mi Perfil</h2>
            </div>

            {/* User Info Card */}
            <div className={styles.profileCard}>
                <div className={styles.avatar}>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || "User"} />
                    ) : (
                        <User size={32} />
                    )}
                </div>
                <div className={styles.userInfo}>
                    <h3>{user?.displayName || "Usuario de ValorAr"}</h3>
                    <p>{user?.email}</p>
                </div>
            </div>

            {/* Settings Menu */}
            <div className={styles.menuContainer}>
                {menuItems.map((item) => (
                    <div key={item.id} className={styles.menuItemWrapper}>
                        <button
                            className={`${styles.menuItem} ${expandedMenu === item.id ? styles.menuItemExpanded : ""}`}
                            onClick={() => toggleMenu(item.id)}
                        >
                            <div className={styles.menuIcon}>{item.icon}</div>
                            <div className={styles.menuText}>
                                <span className={styles.menuLabel}>{item.label}</span>
                                <span className={styles.menuSub}>{item.sub}</span>
                            </div>
                        </button>

                        {/* Expandable Content for Appearance */}
                        <AnimatePresence>
                            {expandedMenu === "appearance" && item.id === "appearance" && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={styles.expandedContent}
                                >
                                    <div className={styles.themeOptions}>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'light' ? styles.themeOptionActive : ''}`}
                                            onClick={() => setTheme('light')}
                                        >
                                            <Sun size={20} />
                                            <span>Claro</span>
                                        </button>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'dark' ? styles.themeOptionActive : ''}`}
                                            onClick={() => setTheme('dark')}
                                        >
                                            <Moon size={20} />
                                            <span>Oscuro</span>
                                        </button>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'system' ? styles.themeOptionActive : ''}`}
                                            onClick={() => setTheme('system')}
                                        >
                                            <Monitor size={20} />
                                            <span>Sistema</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Logout Button */}
            <button onClick={logout} className={styles.logoutBtn}>
                <SignOut size={22} weight="bold" />
                <span>Cerrar Sesión</span>
            </button>

            <div className={styles.footer}>
                <p>ValorAr v1.0.0</p>
                <p>Hecho con ❤️ para inversores argentinos</p>
            </div>
        </div>
    );
};

export default ProfileView;
