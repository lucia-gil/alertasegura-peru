import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/ciudadano/HomePage';
import CrearReportePage from './pages/ciudadano/CrearReportePage';
import ModerarPage from './pages/moderador/ModerarPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/crear-reporte"
        element={
          <ProtectedRoute>
            <CrearReportePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moderar"
        element={
          <ProtectedRoute soloModerador>
            <ModerarPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
