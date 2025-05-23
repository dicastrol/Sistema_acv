// src/pages/VerPaciente.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, Edit, Trash } from 'lucide-react';

export default function VerPaciente() {
  const { id } = useParams();
  const API    = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [paciente, setPaciente]             = useState(null);
  const [historias, setHistorias]           = useState([]);
  const [resumenClinico, setResumenClinico] = useState([]);
  const [analisis, setAnalisis]             = useState(null);
  const [loadingPaciente, setLoadingPaciente]   = useState(true);
  const [loadingHistorias, setLoadingHistorias] = useState(true);
  const [loadingResumen, setLoadingResumen]     = useState(true);
  const [activeTab, setActiveTab]             = useState('historias');
  const [error, setError]                     = useState('');

  // 1) Cargar paciente
  useEffect(() => {
    fetch(`${API}/pacientes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Paciente no encontrado');
        return res.json();
      })
      .then(p => setPaciente(p))
      .catch(err => setError(err.message))
      .finally(() => setLoadingPaciente(false));
  }, [API, id]);

  // 2) Cargar historias clínicas
  useEffect(() => {
    fetch(`${API}/historias/paciente/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar historias');
        return res.json();
      })
      .then(lst => {
        const sorted = lst.sort(
          (a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta)
        );
        setHistorias(sorted);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingHistorias(false));
  }, [API, id]);

  // 3) Cargar resumen clínico
  useEffect(() => {
    fetch(`${API}/historias/paciente/${id}/resumen`)
      .then(res => {
        if (!res.ok) throw new Error('No hay resumen clínico');
        return res.json();
      })
      .then(obj => {
        const rev = (obj.resumen_clinico || []).sort(
          (a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta)
        );
        setResumenClinico(rev);
        setAnalisis(obj.analisis_resumen || null);
      })
      .catch(() => {
        setResumenClinico([]);
        setAnalisis(null);
      })
      .finally(() => setLoadingResumen(false));
  }, [API, id]);

  if (loadingPaciente) return <p>Cargando paciente…</p>;
  if (error)           return <div className="alert alert-danger">{error}</div>;
  if (!paciente)       return null;

  return (
    <div className="container mt-4">
      <Link to="/pacientes" className="text-decoration-none">&larr; Volver</Link>
      <h2 className="mt-2 mb-4">Paciente: {paciente.nombre}</h2>

      {/* Nav tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab==='historias' ? 'active' : ''}`}
            onClick={() => setActiveTab('historias')}
          >
            Historias Clínicas ({historias.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab==='datos' ? 'active' : ''}`}
            onClick={() => setActiveTab('datos')}
          >
            Datos Personales
          </button>
        </li>
      </ul>

      <div className="tab-content mt-4">
        {/* ===================== Historias Clínicas ===================== */}
        {activeTab === 'historias' && (
          <div className="tab-pane active">
            {/* Resumen estadístico */}
            {!loadingResumen && analisis && (
              <div className="row mb-4">
                {[
                  { title: 'Total consultas', value: analisis.total_consultas },
                  { title: 'Promedio IMC',      value: analisis.promedio_imc },
                  { title: 'Prom. FC (bpm)',    value: analisis.promedio_frecuencia_cardiaca },
                  { title: 'Prom. FR (rpm)',    value: analisis.promedio_frecuencia_respiratoria },
                ].map((card, i) => (
                  <div key={i} className="col-md-3 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <h6 className="card-title">{card.title}</h6>
                        <p className="display-6">{card.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Historias Clínicas</h4>
              <div>
                <button
                  className="btn btn-success me-2"
                  onClick={() => navigate(`/pacientes/${id}/historias/nueva`)}
                >
                  + Nueva Historia
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => navigate(`/predict/acv/${id}`)}
                  
                >
                  Predecir ACV
                </button>
              </div>
            </div>

            {loadingHistorias ? (
              <p>Cargando historias…</p>
            ) : historias.length === 0 ? (
              <p className="text-muted">No hay historias registradas.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light text-center">
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Motivo</th>
                      <th>IMC</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle text-center">
                    {historias.map(h => (
                      <tr key={h.id}>
                        <td>{h.id}</td>
                        <td>{h.fecha_consulta}</td>
                        <td>{h.motivo_consulta || '—'}</td>
                        <td>{h.imc ?? '—'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => navigate(`/historias/${h.id}`)}
                            title="Ver historia"
                          ><Eye size={14}/></button>
                          <button
                            className="btn btn-sm btn-outline-warning me-1"
                            onClick={() => navigate(`/historias/${h.id}/edit`)}
                            title="Editar historia"
                          ><Edit size={14}/></button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (!window.confirm('¿Eliminar esta historia?')) return;
                              fetch(`${API}/historias/${h.id}`, { method: 'DELETE' })
                                .then(r => {
                                  if (!r.ok) throw new Error();
                                  setHistorias(prev => prev.filter(x => x.id !== h.id));
                                })
                                .catch(() => alert('Error al eliminar'));
                            }}
                            title="Eliminar historia"
                          ><Trash size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Detalle de cada consulta */}
            {resumenClinico.length > 0 && (
              <>
                <h5 className="mt-5">Detalle de Consultas</h5>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-secondary text-center">
                      <tr>
                        <th>Fecha</th>
                        <th>Motivo</th>
                        <th>Temp (°C)</th>
                        <th>PA (mmHg)</th>
                        <th>FC</th>
                        <th>FR</th>
                        <th>Obesidad</th>
                      </tr>
                    </thead>
                    <tbody className="align-middle text-center">
                      {resumenClinico.map((r, i) => (
                        <tr key={i}>
                          <td>{r.fecha}</td>
                          <td>{r.motivo_consulta || '—'}</td>
                          <td>{r.temperatura ?? '—'}</td>
                          <td>{r.presion_arterial || '—'}</td>
                          <td>{r.frecuencia_cardiaca ?? '—'}</td>
                          <td>{r.frecuencia_respiratoria ?? '—'}</td>
                          <td>{r.obesidad || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===================== Datos Personales ===================== */}
        {activeTab === 'datos' && (
          <div className="tab-pane active">
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">Datos Personales</div>
                  <div className="card-body">
                    <p><strong>Documento:</strong> {paciente.tipo_documento} {paciente.documento}</p>
                    <p><strong>Fecha Nac.:</strong> {paciente.fecha_nacimiento}</p>
                    <p><strong>Sexo:</strong> {paciente.sexo}</p>
                    <p><strong>Estado Civil:</strong> {paciente.estado_civil || '—'}</p>
                    <p><strong>Ocupación:</strong> {paciente.ocupacion || '—'}</p>
                    <p><strong>Grupo Sanguíneo:</strong> {paciente.grupo_sanguineo || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">Contacto</div>
                  <div className="card-body">
                    <p><strong>Teléfono:</strong> {paciente.telefono || '—'}</p>
                    <p><strong>Email:</strong> {paciente.email || '—'}</p>
                    <p><strong>Dirección:</strong> {paciente.direccion || '—'}</p>
                    <p><strong>Aseguradora:</strong> {paciente.aseguradora || '—'}</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header bg-primary text-white">Contacto Emerg.</div>
                  <div className="card-body">
                    <p><strong>Nombre:</strong> {paciente.contacto_emergencia || '—'}</p>
                    <p><strong>Teléfono:</strong> {paciente.contacto_emergencia_telefono || '—'}</p>
                    <p><strong>Parentesco:</strong> {paciente.contacto_emergencia_parentesco || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button
                className="btn btn-warning me-2"
                onClick={() => navigate(`/pacientes/${id}/edit`)}
              >Editar Paciente</button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/pacientes')}
              >Volver a lista</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
