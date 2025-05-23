// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const API      = import.meta.env.VITE_API_BASE_URL;
  const token    = localStorage.getItem('token');
  const navigate = useNavigate();

  // Estadísticas
  const [stats, setStats]       = useState({ activos: 0, hoy: 0, pendientes: 0 });
  // Lista completa de próximas citas
  const [proximas, setProximas] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Traer pacientes, citas de hoy, pendientes y todas las citas
        const [pacRes, hoyRes, penRes, allRes] = await Promise.all([
          fetch(`${API}/pacientes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/citas/hoy`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/citas?estado=esperado`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/citas`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const pacientes   = await pacRes.json();
        const citasHoy    = await hoyRes.json();
        const pendientes = await penRes.json();
        let proximasData  = await allRes.json();

        // Filtrar sólo citas futuras y pendientes, ordenar ascendente
        const ahora = new Date();
        proximasData = proximasData
          .filter(c => new Date(c.fecha_hora) > ahora && c.estado === 'esperado')
          .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));

        setStats({ activos: pacientes.length, hoy: citasHoy.length, pendientes: pendientes.length });
        setProximas(proximasData);
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
      }
    };

    loadDashboard();
  }, [API, token]);

  const handleChangeEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${API}/citas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setProximas(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado de la cita.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary">Bienvenido al Dashboard de PredictMRS</h1>

      {/* ==== KPIs ==== */}
      <div className="row my-4">
        <div className="col-md-4 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-title">Pacientes Activos</h6>
              <p className="display-6">{stats.activos}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-title">Citas Hoy</h6>
              <p className="display-6">{stats.hoy}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-title">Citas Pendientes</h6>
              <p className="display-6">{stats.pendientes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==== Próximas Citas ==== */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>Próximas Citas</h5>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => {
            setCurrentPage(1);
            navigate('/citas/all');
          }}
        >
          Ver todas
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-secondary text-center">
            <tr>
              <th>Paciente</th>
              <th>Fecha y hora</th>
              <th>Servicio</th>
              <th>Estado</th>
              <th style={{ minWidth: 120 }}>Acción</th>
            </tr>
          </thead>
          <tbody className="align-middle text-center">
            {/* Paginar proximas */}
            {proximas.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-muted">
                  No hay próximas citas
                </td>
              </tr>
            ) : (
              proximas
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map(cita => (
                  <tr key={cita.id}>
                    <td>{cita.paciente_nombre}</td>
                    <td>{new Date(cita.fecha_hora).toLocaleString()}</td>
                    <td>{cita.servicio}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={cita.estado}
                        onChange={e => handleChangeEstado(cita.id, e.target.value)}
                      >
                        {['esperado','llegada registrada','completado','cancelado'].map(opt => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/citas/${cita.id}`)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación Proximas Citas */}
      {proximas.length > pageSize && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>Mostrando {Math.min((currentPage - 1) * pageSize + 1, proximas.length)} - {Math.min(currentPage * pageSize, proximas.length)} de {proximas.length} citas</div>
          <div>
            <button
              className="btn btn-outline-primary me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(cp => cp - 1)}
            >
              Anterior
            </button>
            <span>{currentPage} / {Math.ceil(proximas.length / pageSize)}</span>
            <button
              className="btn btn-outline-primary ms-2"
              disabled={currentPage * pageSize >= proximas.length}
              onClick={() => setCurrentPage(cp => cp + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
