import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

function RegisterPage() {
    const [nombre, setNombre] = useState('');
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
            const response = await register(nombre, email, password);
            iniciarSesion(response);
            navigate('/');
        } catch (err) {
            if (err.response?.status === 400) {
                const data = err.response.data;
                if (typeof data.message === 'object') {
                    const primerError = Object.values(data.message)[0];
                    setError(primerError);
                } else {
                    setError(data.message || 'Datos inválidos');
                }
            } else if (err.code === 'ERR_NETWORK') {
                setError('No se pudo conectar con el servidor.');
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
                <h2 className="auth-subtitle">Crear cuenta</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre completo</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

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
                        <small style={{ color: '#888' }}>Mínimo 8 caracteres, 1 mayúscula y 1 número</small>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Creando cuenta...' : 'Registrarme'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;