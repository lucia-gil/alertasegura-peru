import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { usuario, cerrarSesion, esModerador } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        cerrarSesion();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">AlertaSegura Perú</div>
            <div className="navbar-links">
                <Link to="/">Mapa</Link>
                <Link to="/crear-reporte">Reportar</Link>
                {esModerador() && <Link to="/moderar">Moderar</Link>}
            </div>
            <div className="navbar-user">
                <span>{usuario?.nombre} ({usuario?.rol})</span>
                <button onClick={handleLogout} className="btn-logout">Salir</button>
            </div>
        </nav>
    );
}

export default Navbar;