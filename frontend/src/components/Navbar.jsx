import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { usuario, cerrarSesion, esModerador } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        cerrarSesion();
        navigate('/login');
    };

    const linkClase = (path) =>
        `text-sm font-medium px-3 py-1.5 rounded-lg transition ${
            location.pathname === path
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
        }`;

    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <span className="font-bold text-gray-900 tracking-tight">AlertaSegura</span>
                </div>

                <div className="flex items-center gap-1">
                    <Link to="/" className={linkClase('/')}>Mapa</Link>
                    <Link to="/crear-reporte" className={linkClase('/crear-reporte')}>Reportar</Link>
                    {esModerador() && (
                        <Link to="/moderar" className={linkClase('/moderar')}>Moderar</Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 pl-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {usuario?.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:block leading-tight">
                            <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
                            <p className="text-xs text-gray-400">{usuario?.rol}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;