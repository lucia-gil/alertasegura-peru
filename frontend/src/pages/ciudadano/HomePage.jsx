import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../../components/Navbar';
import { listarReportes } from '../../services/reporteService';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LIMA_CENTER = [-12.0464, -77.0428];

function HomePage() {
    const [reportes, setReportes] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [distritoSeleccionado, setDistritoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Carga inicial: trae TODOS los reportes para armar la lista de distritos disponibles
    useEffect(() => {
        cargarTodosParaDistritos();
    }, []);

    // Cada vez que cambia el filtro, vuelve a pedir al backend (filtrado o completo)
    useEffect(() => {
        cargarReportes(distritoSeleccionado);
    }, [distritoSeleccionado]);

    const cargarTodosParaDistritos = async () => {
        try {
            const data = await listarReportes();
            const unicos = [...new Set(data.map((r) => r.distrito).filter(Boolean))].sort();
            setDistritos(unicos);
        } catch (err) {
            // si falla, simplemente no mostramos el filtro, no es crítico
        }
    };

    const cargarReportes = async (distrito) => {
        setCargando(true);
        setError('');
        try {
            const data = await listarReportes(distrito || undefined);
            setReportes(data);
        } catch (err) {
            setError('No se pudieron cargar los reportes');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0 }}>Mapa de reportes</h2>

                    <div>
                        <label style={{ marginRight: '8px', fontSize: '14px' }}>Filtrar por zona:</label>
                        <select
                            value={distritoSeleccionado}
                            onChange={(e) => setDistritoSeleccionado(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        >
                            <option value="">Todas las zonas</option>
                            {distritos.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                {cargando ? (
                    <p>Cargando reportes...</p>
                ) : (
                    <MapContainer
                        center={LIMA_CENTER}
                        zoom={12}
                        style={{ height: '500px', width: '100%', borderRadius: '12px' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        {reportes.map((reporte) => (
                            <Marker key={reporte.id} position={[reporte.latitud, reporte.longitud]}>
                                <Popup>
                                    <strong>{reporte.categoriaNombre}</strong>
                                    <br />
                                    {reporte.descripcion}
                                    <br />
                                    <em>{reporte.distrito}</em>
                                    <br />
                                    Estado: {reporte.estado}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}

                <h3 style={{ marginTop: '30px' }}>
                    Lista de reportes {distritoSeleccionado ? `en ${distritoSeleccionado}` : ''} ({reportes.length})
                </h3>
                <div>
                    {reportes.length === 0 && !cargando && <p>No hay reportes en esta zona.</p>}
                    {reportes.map((reporte) => (
                        <div key={reporte.id} className="reporte-card">
                            <strong>{reporte.categoriaNombre}</strong> — {reporte.distrito}
                            <p>{reporte.descripcion}</p>
                            <small>Estado: {reporte.estado} · {reporte.usuarioNombre}</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;