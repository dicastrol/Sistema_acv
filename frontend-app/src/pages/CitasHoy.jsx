// src/pages/CitasHoy.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash, Plus, Check } from 'lucide-react';

export default function CitasHoy() {
  const API      = import.meta.env.VITE_API_BASE_URL;
  const token    = localStorage.getItem('token');
  const [citas, setCitas]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/citas/hoy`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Orden cronológico
        data.sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
        setCitas(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API, token]);

  const handleRegistrarLlegada = async (id) => {
    if (!window.confirm('¿Confirmar llegada de esta cita?')) return;
    try {
      const res = await fetch(`${API}/citas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'llegada registrada' })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      // Filtrar para que desaparezca de Citas del Día
      setCitas(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error registrando llegada:', err);
      alert('No se pudo registrar la llegada');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta cita?')) return;
    try {
      const res = await fetch(`${API}/citas/${id}`, {
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

  if (loading) return <p>Cargando citas…</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">Citas del Día</h3>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/citas/all')}
          >
            Ver todas
          </button>
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
              <th>ID</th>
              <th>Paciente</th>
              <th>Fecha y hora</th>
              <th>Servicio</th>
              <th>Estado</th>
              <th style={{ minWidth: 180 }}>Acciones</th>
            </tr>
          </thead>
          <tbody className="text-center align-middle">
            {citas.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.paciente_nombre}</td>
                <td>{new Date(c.fecha_hora).toLocaleString()}</td>
                <td>{c.servicio}</td>
                <td>{c.estado}</td>
                <td>
                  {/* Registrar llegada sólo si está “esperado” */}
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
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => navigate(`/citas/${c.id}`)}
                    title="Ver"
                  >
                    <Eye size={14}/>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-warning me-1"
                    onClick={() => navigate(`/citas/${c.id}/edit`)}
                    title="Editar"
                  >
                    <Edit size={14}/>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleEliminar(c.id)}
                    title="Eliminar"
                  >
                    <Trash size={14}/>
                  </button>
                </td>
              </tr>
            ))}
            {citas.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-muted">
                  No hay citas para hoy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
