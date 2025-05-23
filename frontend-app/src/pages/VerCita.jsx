import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }        from 'react-router-dom';

export default function VerCita() {
  const { id }   = useParams();
  const API      = import.meta.env.VITE_API_BASE_URL;
  const nav      = useNavigate();

  const [cita, setCita]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${API}/citas/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrada');
        return res.json();
      })
      .then(data => setCita(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [API, id]);

  if (loading) return <p>Cargando cita…</p>;
  if (error)   return <div className="alert alert-danger">{error}</div>;
  if (!cita)   return null;

  return (
    <div className="container mt-4">
      <button className="btn btn-link mb-3" onClick={() => nav(-1)}>
        ← Volver
      </button>
      <h2 className="text-primary mb-4">Cita #{cita.id}</h2>

      <ul className="list-group mb-4">
        <li className="list-group-item"><strong>Paciente:</strong> {cita.paciente_nombre} (ID {cita.paciente_id})</li>
        <li className="list-group-item"><strong>Fecha y hora:</strong> {new Date(cita.fecha_hora).toLocaleString()}</li>
        <li className="list-group-item"><strong>Servicio:</strong> {cita.servicio}</li>
        <li className="list-group-item"><strong>Personal asignado:</strong> {cita.personal_salud}</li>
        <li className="list-group-item"><strong>Estado:</strong> {cita.estado}</li>
        {cita.notas && (
          <li className="list-group-item"><strong>Notas:</strong> {cita.notas}</li>
        )}
      </ul>

      <button
        className="btn btn-warning me-2"
        onClick={() => nav(`/citas/${id}/edit`)}
      >
        Editar Cita
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => nav('/citas')}
      >
        Volver a lista
      </button>
    </div>
  );
}
