// src/pages/PredecirACV.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function PredecirACV() {
  const { pacienteId } = useParams();
  const API            = import.meta.env.VITE_API_BASE_URL;
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pacienteId) return;
    fetch(`${API}/prediccion/${pacienteId}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo calcular predicción');
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message));
  }, [API, pacienteId]);

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <Link to={`/pacientes/${pacienteId}`}>← Volver</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mt-4">
        <p>Calculando predicción…</p>
      </div>
    );
  }

  // Asegurarte de tener siempre explicacion como array
  const explicacion = Array.isArray(data.explicacion) ? data.explicacion : [];

  const pct = (data.probabilidad_acv * 100).toFixed(1);

  return (
    <div className="container mt-4">
      <Link to={`/pacientes/${pacienteId}`}>← Volver al perfil</Link>
      <h2 className="my-4">Riesgo de ACV para paciente #{pacienteId}</h2>

      <div className="card p-4 mb-4 text-center">
        <h5>Probabilidad estimada</h5>
        <p className="display-4">
          {isNaN(pct) ? '0.0' : pct} %
        </p>
      </div>

      <h5>Factores más influyentes</h5>
      {explicacion.length === 0 ? (
        <p className="text-muted">Sin explicación disponible.</p>
      ) : (
        <ul className="list-group mb-4">
          {explicacion.map((e, i) => (
            <li key={i} className="list-group-item d-flex justify-content-between">
              <span>
                <strong>{e.feature}</strong> = {e.valor}
              </span>
              <span>peso: {e.peso.toFixed(3)}</span>
            </li>
          ))}
        </ul>
      )}

      <Link className="btn btn-secondary" to={`/pacientes/${pacienteId}`}>
        Volver al perfil
      </Link>
    </div>
  );
}
