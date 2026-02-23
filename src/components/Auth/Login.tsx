import { useAuth } from "../../context/AuthContext";
import { GoogleLogo } from "phosphor-react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
    const { signInWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Failed to login", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <img src={`${import.meta.env.BASE_URL}valorar-logo.png`} alt="ValorAr Logo" className={styles.logo} />
                    </div>
                    <h1>Bienvenido a ValorAr</h1>
                    <p>Tu control de inversiones a un clic de distancia</p>
                </div>

                <div className={styles.content}>
                    <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                        <GoogleLogo size={24} weight="bold" />
                        <span>Iniciar sesión con Google</span>
                    </button>
                </div>

                <div className={styles.footer}>
                    <p>© 2026 ValorAr Inversiones</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
