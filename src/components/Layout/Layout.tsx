import type { ReactNode } from "react";
import Navbar from "./Navbar";
import styles from "./Layout.module.css"; // We'll create this or reuse global styles

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
