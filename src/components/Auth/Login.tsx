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
            // Handle error (could add a toast notification here)
            console.error("Failed to login", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <img src="/vite.svg" alt="ValorAr Logo" style={{ width: 48, height: 48, marginBottom: '1rem' }} />
                    <h1>Bienvenido a ValorAr</h1>
                    <p>Tu control de inversiones a un clic de distancia</p>
                </div>

                <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                    <GoogleLogo size={24} weight="bold" />
                    <span>Iniciar sesión con Google</span>
                </button>
            </div>
        </div>
    );
};

export default Login;
