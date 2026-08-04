import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../../components/Navbar';
import { crearReporte, obtenerCategorias } from '../../services/reporteService';
import { DEPARTAMENTOS_PERU, DISTRITOS_LIMA } from '../../data/peru';

const LIMA_CENTER = [-12.0464, -77.0428];
const inputClase = 'w-full px-4 py-2.5 bg-surface-2/70 dark:bg-surface-dark-2/70 border border-black/[0.06] dark:border-white/[0.08] text-gray-900 dark:text-gray-100 rounded-xl text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-marca-500 transition-all disabled:opacity-50';

function SelectorUbicacion({ posicion, setPosicion }) {
    useMapEvents({
        click(e) {
            setPosicion([e.latlng.lat, e.latlng.lng]);
        },
    });

    return posicion ? <Marker position={posicion} /> : null;
}

function CrearReportePage() {
    const [categorias, setCategorias] = useState([]);
    const [categoriaId, setCategoriaId] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
    const [distrito, setDistrito] = useState('');
    const [posicion, setPosicion] = useState(null);
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);
    const [cargando, setCargando] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        obtenerCategorias()
            .then(setCategorias)
            .catch(() => setError('No se pudieron cargar las categorías'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!posicion) {
            setError('Debes seleccionar una ubicación en el mapa');
            return;
        }

        setCargando(true);

        try {
            await crearReporte({
                categoriaId: Number(categoriaId),
                descripcion,
                latitud: posicion[0],
                longitud: posicion[1],
                distrito,
            });
            setExito(true);
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            if (err.response?.status === 400) {
                const data = err.response.data;
                if (typeof data.message === 'object') {
                    setError(Object.values(data.message)[0]);
                } else {
                    setError(data.message || 'Datos inválidos');
                }
            } else if (err.response?.status === 429) {
                setError('Demasiados reportes creados. Espera un minuto e intenta de nuevo.');
            } else {
                setError('Ocurrió un error al crear el reporte.');
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-0 dark:bg-surface-dark-0">
            <Navbar />

            <div className="max-w-2xl mx-auto px-6 py-8">
                <h1 className="font-display text-2xl font-semibold text-gray-900 dark:text-gray-100">Crear nuevo reporte</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
                    Haz click en el mapa para marcar la ubicación exacta del incidente.
                </p>

                <div className="rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-sm mb-2">
                    <MapContainer center={LIMA_CENTER} zoom={12} style={{ height: '320px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <SelectorUbicacion posicion={posicion} setPosicion={setPosicion} />
                    </MapContainer>
                </div>

                {posicion && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                        Ubicación seleccionada: {posicion[0].toFixed(5)}, {posicion[1].toFixed(5)}
                    </p>
                )}

                <div className="bg-surface-1 dark:bg-surface-dark-1 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-sm p-6 mt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Categoría
                            </label>
                            <select
                                value={categoriaId}
                                onChange={(e) => setCategoriaId(e.target.value)}
                                required
                                className={`${inputClase} cursor-pointer`}
                            >
                                <option value="">Selecciona una categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Departamento
                            </label>
                            <select
                                value={departamentoSeleccionado}
                                onChange={(e) => {
                                    setDepartamentoSeleccionado(e.target.value);
                                    setDistrito('');
                                }}
                                required
                                className={`${inputClase} cursor-pointer`}
                            >
                                <option value="">Selecciona un departamento</option>
                                {DEPARTAMENTOS_PERU.map((d) => (
                                    <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Distrito
                            </label>
                            {departamentoSeleccionado === 'Lima' ? (
                                <select
                                    value={distrito}
                                    onChange={(e) => setDistrito(e.target.value)}
                                    required
                                    className={`${inputClase} cursor-pointer`}
                                >
                                    <option value="">Selecciona un distrito</option>
                                    {DISTRITOS_LIMA.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={distrito}
                                    onChange={(e) => setDistrito(e.target.value)}
                                    required
                                    disabled={!departamentoSeleccionado}
                                    placeholder={
                                        departamentoSeleccionado
                                            ? `Ej: ${DEPARTAMENTOS_PERU.find((d) => d.nombre === departamentoSeleccionado)?.capital}`
                                            : 'Elige un departamento primero'
                                    }
                                    className={inputClase}
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Descripción
                            </label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                                minLength={10}
                                maxLength={500}
                                rows={4}
                                placeholder="Describe lo ocurrido (mínimo 10 caracteres)"
                                className={`${inputClase} resize-none`}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {exito && (
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">¡Reporte creado con éxito! Redirigiendo...</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full py-3 bg-gradient-to-r from-marca-600 to-marca-800 hover:from-marca-700 hover:to-marca-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-lg shadow-marca-900/20 transition-all cursor-pointer"
                        >
                            {cargando ? 'Enviando...' : 'Crear reporte'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CrearReportePage;
