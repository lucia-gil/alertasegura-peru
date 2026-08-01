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

const badgeEstado = (estado) => {
    if (estado === 'VERIFICADO') return 'bg-emerald-100 text-emerald-700';
    if (estado === 'RECHAZADO') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
};

function HomePage() {
    const [reportes, setReportes] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [distritoSeleccionado, setDistritoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarTodosParaDistritos();
    }, []);

    useEffect(() => {
        cargarReportes(distritoSeleccionado);
    }, [distritoSeleccionado]);

    const cargarTodosParaDistritos = async () => {
        try {
            const data = await listarReportes();
            const unicos = [...new Set(data.map((r) => r.distrito).filter(Boolean))].sort();
            setDistritos(unicos);
        } catch (err) {
            // no crítico
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
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mapa de reportes</h1>
                        <p className="text-sm text-gray-500 mt-1">Incidentes reportados por la comunidad</p>
                    </div>

                    <select
                        value={distritoSeleccionado}
                        onChange={(e) => setDistritoSeleccionado(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Todas las zonas</option>
                        {distritos.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {cargando ? (
                    <div className="h-[450px] flex items-center justify-center bg-white rounded-2xl border border-gray-200">
                        <p className="text-gray-400">Cargando reportes...</p>
                    </div>
                ) : (
                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                        <MapContainer center={LIMA_CENTER} zoom={12} style={{ height: '450px', width: '100%' }}>
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
                    </div>
                )}

                <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
                    Reportes {distritoSeleccionado ? `en ${distritoSeleccionado}` : ''} ({reportes.length})
                </h2>

                {reportes.length === 0 && !cargando && (
                    <p className="text-gray-400 text-sm">No hay reportes en esta zona.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportes.map((reporte) => (
                        <div key={reporte.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">{reporte.categoriaNombre}</span>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeEstado(reporte.estado)}`}>
                  {reporte.estado}
                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{reporte.descripcion}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>{reporte.distrito}</span>
                                <span>{reporte.usuarioNombre}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;