import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

function Navbar() {
    const { usuario, cerrarSesion, esModerador } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        cerrarSesion();
        navigate('/login');
    };

    const linkClase = (path) =>
        `text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
            location.pathname === path
                ? 'bg-marca-500/15 text-marca-600 dark:text-marca-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
        }`;

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-surface-0/70 dark:bg-surface-dark-0/70 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                <Logo size="md" />

                <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-full p-1">
                    <Link to="/" className={linkClase('/')}>Mapa</Link>
                    <Link to="/crear-reporte" className={linkClase('/crear-reporte')}>Reportar</Link>
                    {esModerador() && (
                        <Link to="/moderar" className={linkClase('/moderar')}>Moderar</Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    <div className="w-px h-6 bg-black/[0.08] dark:bg-white/[0.1]" />

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-marca-500 to-marca-700 flex items-center justify-center text-white text-xs font-semibold">
                            {usuario?.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:block leading-tight">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{usuario?.nombre}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{usuario?.rol}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
