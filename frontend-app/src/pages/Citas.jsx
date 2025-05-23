// src/pages/Citas.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit, Trash, Eye, FileText, Check } from 'lucide-react';

export default function Citas() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');

  // Determina si mostramos todas o solo del día
  const showAll  = pathname === '/citas/all';
  const title    = showAll ? 'Todas las Citas' : 'Citas del Día';
  const endpoint = showAll ? '/citas' : '/citas/hoy';

  // Estados para citas y carga
  const [citas, setCitas]     = useState([]);
  const [loading, setLoading] = useState(true);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Ordenamiento (solo para todas las citas)
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setCitas(data);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error cargando citas:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint, token]);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta cita?')) return;
    try {
      const res = await fetch(`/citas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setCitas(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error eliminando la cita:', err);
      alert('Error eliminando la cita');
    }
  };

  const handleRegistrarLlegada = async (id) => {
    if (!window.confirm('¿Confirmar llegada de esta cita?')) return;
    try {
      const res = await fetch(`/citas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'llegada registrada' })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      if (!showAll) {
        setCitas(prev => prev.filter(c => c.id !== id));
      } else {
        setCitas(prev =>
          prev.map(c => c.id === id ? { ...c, estado: 'llegada registrada' } : c)
        );
      }
    } catch (err) {
      console.error('Error registrando llegada:', err);
      alert('No se pudo registrar la llegada');
    }
  };

  if (loading) return <p>Cargando…</p>;

  // 1) Ordenar
  let sortedCitas = [...citas];
  if (showAll) {
    sortedCitas.sort((a, b) => {
      const diff = new Date(a.fecha_hora) - new Date(b.fecha_hora);
      return sortAsc ? diff : -diff;
    });
  } else {
    // siempre ascendente para “Citas del Día”
    sortedCitas.sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  }

  // 2) Paginación sobre la lista ordenada
  const pageCount = Math.ceil(sortedCitas.length / pageSize);
  const startIdx  = (currentPage - 1) * pageSize;
  const displayed = sortedCitas.slice(startIdx, startIdx + pageSize);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">{title}</h3>
        <div className="d-flex align-items-center">
          {!showAll && (
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate('/citas/all')}
            >
              Ver todas
            </button>
          )}
          {showAll && (
            <button
              className="btn btn-outline-info me-2"
              onClick={() => setSortAsc(sa => !sa)}
            >
              Orden: {sortAsc ? 'Ascendente' : 'Descendente'}
            </button>
          )}
          <button
            className="btn btn-success"
            onClick={() => navigate('/citas/nueva')}
          >
            <Plus size={16} className="me-1" /> Nueva Cita
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-secondary text-center">
            <tr>
              <th>Cita ID</th>
              <th>Paciente ID</th>
              <th>Paciente</th>
              <th>Fecha y hora</th>
              <th>Servicio</th>
              <th>Estado</th>
              <th style={{ minWidth: 260 }}>Acciones</th>
            </tr>
          </thead>
          <tbody className="align-middle text-center">
            {displayed.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.paciente_id}</td>
                <td>{c.paciente_nombre}</td>
                <td>{new Date(c.fecha_hora).toLocaleString()}</td>
                <td>{c.servicio}</td>
                <td>{c.estado}</td>
                <td>
                  {c.estado === 'esperado' && (
                    <button
                      className="btn btn-sm btn-outline-info me-1"
                      onClick={() => handleRegistrarLlegada(c.id)}
                      title="Registrar llegada"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-success me-1"
                    onClick={() => navigate(`/pacientes/${c.paciente_id}/historias/nueva`)}
                    title="Realizar consulta"
                  >
                    <FileText size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => navigate(`/citas/${c.id}`)}
                    title="Ver cita"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-warning me-1"
                    onClick={() => navigate(`/citas/${c.id}/edit`)}
                    title="Editar cita"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleEliminar(c.id)}
                    title="Eliminar cita"
                  >
                    <Trash size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td colSpan="7" className="py-4 text-muted">
                  {showAll ? 'No hay citas registradas.' : 'No hay citas para hoy.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>Elementos por página: {pageSize}</div>
        <div>
          <button
            className="btn btn-outline-primary me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(cp => Math.max(cp - 1, 1))}
          >
            Anterior
          </button>
          <span>{currentPage} / {pageCount}</span>
          <button
            className="btn btn-outline-primary ms-2"
            disabled={currentPage === pageCount}
            onClick={() => setCurrentPage(cp => Math.min(cp + 1, pageCount))}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
