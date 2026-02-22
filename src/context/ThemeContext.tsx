import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDarkMode: boolean; // helper to check if dark mode is actually active
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem("theme");
        return (storedTheme as Theme) || "system";
    });

    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            root.removeAttribute("data-theme");

            if (theme === "system") {
                const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (systemPrefersDark) {
                    root.setAttribute("data-theme", "dark");
                }
                setIsDarkMode(systemPrefersDark);
            } else {
                root.setAttribute("data-theme", theme);
                setIsDarkMode(theme === "dark");
            }
        };

        applyTheme();

        // Listen for system changes if mode is system
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e: MediaQueryListEvent) => {
                if (theme === "system") {
                    root.removeAttribute("data-theme");
                    if (e.matches) {
                        root.setAttribute("data-theme", "dark");
                    }
                    setIsDarkMode(e.matches);
                }
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
