import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../../components/Navbar';
import { crearReporte, obtenerCategorias } from '../../services/reporteService';

const LIMA_CENTER = [-12.0464, -77.0428];

// Componente auxiliar: escucha clicks en el mapa para elegir ubicación
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
        <div>
            <Navbar />
            <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
                <h2>Crear nuevo reporte</h2>
                <p>Haz click en el mapa para marcar la ubicación exacta del incidente.</p>

                <MapContainer
                    center={LIMA_CENTER}
                    zoom={12}
                    style={{ height: '350px', width: '100%', borderRadius: '12px', marginBottom: '20px' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    <SelectorUbicacion posicion={posicion} setPosicion={setPosicion} />
                </MapContainer>

                {posicion && (
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        Ubicación seleccionada: {posicion[0].toFixed(5)}, {posicion[1].toFixed(5)}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Categoría</label>
                        <select
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Distrito</label>
                        <input
                            type="text"
                            value={distrito}
                            onChange={(e) => setDistrito(e.target.value)}
                            placeholder="Ej: Miraflores"
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                            minLength={10}
                            maxLength={500}
                            rows={4}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                            placeholder="Describe lo ocurrido (mínimo 10 caracteres)"
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {exito && <p style={{ color: 'green' }}>¡Reporte creado con éxito! Redirigiendo...</p>}

                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Enviando...' : 'Crear reporte'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CrearReportePage;