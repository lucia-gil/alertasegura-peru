import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envuelve páginas que requieren sesión. Si además se pasa soloModerador,
// también exige que el usuario tenga ese rol (si no, lo manda al inicio).
function ProtectedRoute({ children, soloModerador = false }) {
  const { usuario, cargando, esModerador } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0 dark:bg-surface-dark-0">
        <div className="w-8 h-8 border-3 border-marca-200 border-t-marca-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (soloModerador && !esModerador()) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
