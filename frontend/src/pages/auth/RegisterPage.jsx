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
                    setError(Object.values(data.message)[0]);
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
        <div
            className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/fondo-login.png')" }}
        >
            <div className="w-full max-w-sm">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 p-8">
                    <h1 className="text-2xl font-bold text-center text-gray-900 tracking-tight">
                        Crea tu cuenta
                    </h1>
                    <p className="text-sm text-center text-gray-500 mt-1 mb-7">
                        Únete a AlertaSegura Perú
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                placeholder="Juan Pérez"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@email.com"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">Mínimo 8 caracteres, 1 mayúscula y 1 número</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-200 transition-all"
                        >
                            {cargando ? 'Creando cuenta...' : 'Registrarme'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;