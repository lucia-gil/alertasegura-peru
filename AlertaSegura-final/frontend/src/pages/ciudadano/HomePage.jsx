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
    if (estado === 'VERIFICADO') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
    if (estado === 'RECHAZADO') return 'bg-red-500/15 text-red-600 dark:text-red-400';
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
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
        <div className="min-h-screen bg-surface-0 dark:bg-surface-dark-0">
            <Navbar />

            <div className="bg-gradient-to-r from-marca-700 via-marca-600 to-marca-800 dark:from-marca-900 dark:via-marca-800 dark:to-marca-900">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <h1 className="font-display text-2xl md:text-3xl font-semibold text-white">Mapa de reportes</h1>
                    <p className="text-sm text-marca-100 dark:text-marca-200 mt-1">Incidentes reportados por la comunidad en tiempo real</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-5 pb-8">
                <div className="flex items-center justify-end mb-4">
                    <select
                        value={distritoSeleccionado}
                        onChange={(e) => setDistritoSeleccionado(e.target.value)}
                        className="px-4 py-2.5 bg-surface-1 dark:bg-surface-dark-1 border border-black/[0.06] dark:border-white/[0.08] text-gray-900 dark:text-gray-100 rounded-xl text-sm shadow-md shadow-black/5 dark:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-marca-500 cursor-pointer"
                    >
                        <option value="">Todas las zonas</option>
                        {distritos.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {cargando ? (
                    <div className="h-[450px] flex items-center justify-center bg-surface-1 dark:bg-surface-dark-1 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
                        <div className="w-8 h-8 border-3 border-marca-200 dark:border-marca-800 border-t-marca-600 dark:border-t-marca-400 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-lg shadow-black/5 dark:shadow-black/40">
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

                <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                    Reportes {distritoSeleccionado ? `en ${distritoSeleccionado}` : ''} ({reportes.length})
                </h2>

                {reportes.length === 0 && !cargando && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">No hay reportes en esta zona.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportes.map((reporte) => (
                        <div key={reporte.id} className="bg-surface-1 dark:bg-surface-dark-1 border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-marca-300 dark:hover:border-marca-700 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{reporte.categoriaNombre}</span>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeEstado(reporte.estado)}`}>
                  {reporte.estado}
                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{reporte.descripcion}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
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
