import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const { iniciarSesion } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const response = await login(email, password);
            iniciarSesion(response);
            navigate('/');
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Email o contraseña incorrectos');
            } else if (err.response?.status === 429) {
                setError('Demasiados intentos. Espera un minuto e intenta de nuevo.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
            } else {
                setError('Ocurrió un error. Intenta de nuevo.');
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">AlertaSegura Perú</h1>
                <h2 className="auth-subtitle">Iniciar sesión</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;