// src/pages/VerHistoria.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';

export default function VerHistoria() {
  const { id } = useParams();
  const API = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [historia, setHistoria] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/historias/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Historia no encontrada');
        return r.json();
      })
      .then(setHistoria)
      .catch(err => setError(err.message));
  }, [API, id, token]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!historia) return <p>Cargando historia…</p>;

  return (
    <div className="container mt-4">
      <Link to={`/pacientes/${historia.paciente_id}`}>&larr; Volver al perfil</Link>
      <h2 className="mt-2 mb-4">Historia # {historia.id}</h2>

      {/* Datos de Consulta */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">Datos de Consulta</div>
        <div className="card-body">
          <p><strong>Fecha:</strong> {historia.fecha_consulta}</p>
          <p><strong>Motivo:</strong> {historia.motivo_consulta}</p>
          {historia.fecha_aparicion && <p><strong>Fecha aparición:</strong> {historia.fecha_aparicion}</p>}
          {historia.condiciones_previas && <p><strong>Condiciones Previas:</strong> {historia.condiciones_previas}</p>}
        </div>
      </div>

      {/* Signos Vitales */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">Signos Vitales</div>
        <div className="card-body row">
          <div className="col-md-2"><strong>Temperatura:</strong> {historia.temperatura ?? '—'}</div>
          <div className="col-md-2"><strong>PA sistólica:</strong> {historia.presion_sistolica}</div>
          <div className="col-md-2"><strong>PA diastólica:</strong> {historia.presion_diastolica}</div>
          <div className="col-md-2"><strong>FC:</strong> {historia.frecuencia_cardiaca ?? '—'}</div>
          <div className="col-md-2"><strong>FR:</strong> {historia.frecuencia_respiratoria ?? '—'}</div>
          <div className="col-md-2"><strong>Arritmia:</strong> {historia.arritmia ? 'Sí' : 'No'}</div>
        </div>
        {historia.notas_signos && <div className="card-footer"><strong>Notas signos:</strong> {historia.notas_signos}</div>}
      </div>

      {/* Datos Biométricos */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">Datos Biométricos</div>
        <div className="card-body">
          <p><strong>Peso:</strong> {historia.peso} kg</p>
          <p><strong>Altura:</strong> {historia.altura} m</p>
          <p><strong>IMC:</strong> {historia.imc}</p>
        </div>
      </div>

      {/* Factores de Riesgo */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">Factores de Riesgo</div>
        <div className="card-body">
          <ul>
            {historia.obesidad && <li>Obesidad</li>}
            {historia.tabaquismo && <li>Tabaquismo</li>}
            {historia.alcohol && <li>Consumo de alcohol</li>}
            {historia.drogas_estimulantes && <li>Drogas estimulantes</li>}
            {historia.sedentarismo && <li>Sedentarismo</li>}
            {historia.enfermedad_cardiaca_previa && <li>Enfermedad cardíaca previa</li>}
            {historia.estres && <li>Estrés</li>}
            {!Object.values({
              obesidad: historia.obesidad,
              tabaquismo: historia.tabaquismo,
              alcohol: historia.alcohol,
              drogas_estimulantes: historia.drogas_estimulantes,
              sedentarismo: historia.sedentarismo,
              enfermedad_cardiaca_previa: historia.enfermedad_cardiaca_previa,
              estres: historia.estres
            }).some(v => v) && <li>Sin factores de riesgo</li>}
          </ul>
        </div>
      </div>

      {/* Historial Familiar y Medicación */}
      <div className="card mb-4">
        <div className="card-header bg-light text-dark">Historial y Medicación</div>
        <div className="card-body">
          {historia.historial_familiar && <p><strong>Historial familiar:</strong> {historia.historial_familiar}</p>}
          {historia.medicamentos && <p><strong>Medicamentos:</strong> {historia.medicamentos}</p>}
        </div>
      </div>

      {/* Diagnóstico */}
      {historia.diagnostico && (
        <div className="card mb-4">
          <div className="card-header bg-success text-white">Diagnóstico</div>
          <div className="card-body">
            <p>{historia.diagnostico}</p>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-3">
        <button className="btn btn-warning me-2" onClick={() => navigate(`/historias/${id}/edit`)}>
          <Edit size={16} /> Editar
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (!window.confirm('Eliminar historia?')) return;
            fetch(`${API}/historias/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
              .then(r => { if (!r.ok) throw new Error(); navigate(`/pacientes/${historia.paciente_id}`); })
              .catch(() => alert('Error eliminando'));
          }}
        >
          <Trash size={16} /> Eliminar
        </button>
      </div>
    </div>
  );
}
