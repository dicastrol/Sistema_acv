// src/pages/HistoriasPaciente.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash } from 'lucide-react';

export default function HistoriasPaciente() {
  const { id: pacienteId } = useParams();
  const [historias, setHistorias] = useState([]);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  // Obtener token JWT
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHistorias = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/historias/paciente/${pacienteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setHistorias(data);
      } catch (err) {
        console.error('Error cargando historias clínicas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorias();
  }, [pacienteId, token]);

  const handleDelete = async (historiaId) => {
    if (!window.confirm('¿Eliminar esta historia clínica?')) return;
    try {
      const res = await fetch(`/historias/${historiaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setHistorias(prev => prev.filter(h => h.id !== historiaId));
    } catch (err) {
      console.error('Error eliminando la historia clínica:', err);
      alert('Error eliminando la historia clínica');
    }
  };

  if (loading) return <p>Cargando historias clínicas…</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">Historias Clínicas del Paciente #{pacienteId}</h3>
        <button
          className="btn btn-success"
          onClick={() => navigate(`/pacientes/${pacienteId}/historias/nueva`)}
        >
          <Plus size={16} className="me-1" /> Nueva Historia
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-secondary text-center">
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Motivo</th>
              <th>IMC</th>
              <th style={{ minWidth: 140 }}>Acciones</th>
            </tr>
          </thead>
          <tbody className="align-middle text-center">
            {historias.map(h => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td>{h.fecha_consulta}</td>
                <td>{h.motivo_consulta}</td>
                <td>{h.imc}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => navigate(`/historias/${h.id}`)}
                    title="Ver"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-warning me-1"
                    onClick={() => navigate(`/historias/${h.id}/edit`)}
                    title="Editar"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(h.id)}
                    title="Eliminar"
                  >
                    <Trash size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {historias.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-muted">
                  No hay historias clínicas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
