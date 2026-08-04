import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';

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
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-surface-0 dark:bg-surface-dark-0">
            <div className="absolute top-5 right-5 z-10">
                <ThemeToggle />
            </div>

            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-32 -left-24 w-96 h-96 bg-marca-400/25 dark:bg-marca-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-acento-500/15 dark:bg-acento-600/15 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-marca-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <Logo size="lg" showText={false} />
                </div>

                <div className="bg-surface-1/80 dark:bg-surface-dark-1/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/40 p-8">
                    <h1 className="font-display text-2xl font-semibold text-center text-gray-900 dark:text-gray-50 tracking-tight">
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-1 mb-7">
                        Inicia sesión en AlertaSegura Perú
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@email.com"
                                className="w-full px-4 py-2.5 bg-surface-2/70 dark:bg-surface-dark-2/70 border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-marca-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-surface-2/70 dark:bg-surface-dark-2/70 border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-marca-500 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full py-3 bg-gradient-to-r from-marca-600 to-marca-800 hover:from-marca-700 hover:to-marca-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-lg shadow-marca-900/20 transition-all cursor-pointer"
                        >
                            {cargando ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-marca-600 dark:text-marca-400 font-semibold hover:text-marca-700 dark:hover:text-marca-300">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
