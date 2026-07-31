import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
// Envuelve toda tu app, así cualquier componente puede acceder al usuario logueado
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // al recargar la página (F5), revisa si ya había una sesión guardada en localStorage, para no perder el login
    useEffect(() => {
        // Al cargar la app, revisa si ya hay una sesión guardada
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const nombre = localStorage.getItem('nombre');
        const rol = localStorage.getItem('rol');

        if (token && email) {
            setUsuario({ token, email, nombre, rol });
        }
        setCargando(false);
    }, []);
    // guarda el token/datos después de un login/registro exitoso
    const iniciarSesion = (authResponse) => {
        const { token, email, nombre, rol } = authResponse;
        localStorage.setItem('token', token);
        localStorage.setItem('email', email);
        localStorage.setItem('nombre', nombre);
        localStorage.setItem('rol', rol);
        setUsuario({ token, email, nombre, rol });
    };
    // limpia el token/datos al cerrar sesión
    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('nombre');
        localStorage.removeItem('rol');
        setUsuario(null);
    };
    // función helper para mostrar/ocultar cosas en la UI según el rol
    const esModerador = () => usuario?.rol === 'MODERADOR';
    // hook personalizado pa usar en cualquier componente así: const { usuario, iniciarSesion } = useAuth();
    return (
        <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, esModerador }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}