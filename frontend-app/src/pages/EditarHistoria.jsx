// src/pages/EditarHistoria.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function EditarHistoria() {
  const { id } = useParams();
  const API = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    paciente_id: '',
    fecha_consulta: '',
    motivo_consulta: '',
    fecha_aparicion: '',
    condiciones_previas: '',
    temperatura: '',
    presion_sistolica: '',
    presion_diastolica: '',
    frecuencia_cardiaca: '',
    frecuencia_respiratoria: '',
    arritmia: false,
    notas_signos: '',
    peso: '',
    altura: '',
    imc: '',
    obesidad: false,
    tabaquismo: false,
    alcohol: false,
    drogas_estimulantes: false,
    sedentarismo: false,
    enfermedad_cardiaca_previa: false,
    estres: false,
    historial_familiar: '',
    medicamentos: '',
    diagnostico: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1) Traer la historia
  useEffect(() => {
    fetch(`${API}/historias/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Historia no encontrada');
        return res.json();
      })
      .then(h => {
        setForm({
          ...h,
          fecha_consulta: h.fecha_consulta || '',
          fecha_aparicion: h.fecha_aparicion || ''
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [API, id, token]);

  // 2) Recalcular IMC automáticamente
  useEffect(() => {
    const p = parseFloat(form.peso);
    const a = parseFloat(form.altura);
    if (p > 0 && a > 0) {
      setForm(f => ({ ...f, imc: (p / (a * a)).toFixed(2) }));
    } else {
      setForm(f => ({ ...f, imc: '' }));
    }
  }, [form.peso, form.altura]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 3) Validaciones básicas
  const validate = () => {
    if (!form.fecha_consulta)               return 'La fecha de consulta es obligatoria.';
    if (!form.motivo_consulta.trim())       return 'El motivo de consulta es obligatorio.';
    if (!form.presion_sistolica)            return 'La presión sistólica es obligatoria.';
    if (!form.presion_diastolica)           return 'La presión diastólica es obligatoria.';
    if (!form.peso)                         return 'El peso es obligatorio.';
    if (!form.altura)                       return 'La altura es obligatoria.';
    return null;
  };

  // 4) Enviar actualización
  const handleSubmit = async e => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setError('');
    setSubmitting(true);

    // Clonar form y eliminar dump_only
    const raw = { ...form };
    delete raw.id;
    delete raw.imc;

    // Quitar propiedades vacías
    const payload = Object.fromEntries(
      Object.entries(raw).filter(([_, v]) =>
        !(typeof v === 'string' && v.trim() === '')
      )
    );

    try {
      const res = await fetch(`${API}/historias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error actualizando historia');
      navigate(-1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando historia…</p>;

  return (
    <div className="container mt-4">
      <Link to={`/pacientes/${form.paciente_id}`} className="d-block mb-3">
        &larr; Volver al perfil
      </Link>
      <h2 className="text-primary mb-4">Editar Historia #{id}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Fecha de consulta */}
        <div className="mb-3">
          <label className="form-label">Fecha de consulta *</label>
          <input
            type="date"
            name="fecha_consulta"
            className="form-control"
            value={form.fecha_consulta}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

        {/* Motivo de consulta */}
        <div className="mb-3">
          <label className="form-label">Motivo *</label>
          <textarea
            name="motivo_consulta"
            className="form-control"
            rows="2"
            value={form.motivo_consulta}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

        {/* Fecha aparición y condiciones previas */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Fecha de aparición</label>
            <input
              type="date"
              name="fecha_aparicion"
              className="form-control"
              value={form.fecha_aparicion}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Condiciones previas</label>
            <textarea
              name="condiciones_previas"
              className="form-control"
              rows="2"
              value={form.condiciones_previas}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Signos Vitales */}
        <h5>Signos Vitales</h5>
        <div className="row g-3 mb-4">
          {[
            { key: 'temperatura', label: 'Temperatura (°C)', req: false },
            { key: 'presion_sistolica', label: 'Presión sistólica (mmHg)', req: true },
            { key: 'presion_diastolica', label: 'Presión diastólica (mmHg)', req: true },
            { key: 'frecuencia_cardiaca', label: 'FC (bpm)', req: false },
            { key: 'frecuencia_respiratoria', label: 'FR (rpm)', req: false }
          ].map(({ key, label, req }) => (
            <div key={key} className="col-md-3">
              <label className="form-label">
                {label}{req && ' *'}
              </label>
              <input
                type="number"
                name={key}
                className="form-control"
                value={form[key]}
                onChange={handleChange}
                required={req}
                disabled={submitting}
              />
            </div>
          ))}
          <div className="col-md-2 d-flex align-items-center">
            <div className="form-check form-switch mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                name="arritmia"
                checked={form.arritmia}
                onChange={handleChange}
                disabled={submitting}
              />
              <label className="form-check-label">Arritmia</label>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Notas de signos</label>
            <textarea
              name="notas_signos"
              className="form-control"
              rows="2"
              value={form.notas_signos}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Datos Biométricos */}
        <h5>Datos Biométricos</h5>
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label">Peso (kg) *</label>
            <input
              type="number"
              step="0.1"
              name="peso"
              className="form-control"
              value={form.peso}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Altura (m) *</label>
            <input
              type="number"
              step="0.01"
              name="altura"
              className="form-control"
              value={form.altura}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">IMC</label>
            <input
              type="text"
              name="imc"
              className="form-control"
              value={form.imc}
              readOnly
            />
          </div>
        </div>

        {/* Factores de Riesgo */}
        <h5>Factores de Riesgo</h5>
        <div className="row g-2 mb-4">
          {[
            'obesidad','tabaquismo','alcohol','drogas_estimulantes',
            'sedentarismo','enfermedad_cardiaca_previa','estres'
          ].map(key => (
            <div key={key} className="col-md-3 form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                name={key}
                checked={form[key]}
                onChange={handleChange}
                disabled={submitting}
              />
              <label className="form-check-label text-capitalize">
                {key.replace(/_/g,' ')}
              </label>
            </div>
          ))}
        </div>

        {/* Historial y Medicación */}
        <h5 className="mt-4">Historial Familiar y Medicamentos</h5>
        <div className="mb-3">
          <label className="form-label">Historial familiar</label>
          <textarea
            name="historial_familiar"
            className="form-control"
            rows="2"
            value={form.historial_familiar}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Medicamentos</label>
          <textarea
            name="medicamentos"
            className="form-control"
            rows="2"
            value={form.medicamentos}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        {/* Diagnóstico */}
        <div className="mb-4">
          <label className="form-label">Diagnóstico</label>
          <textarea
            name="diagnostico"
            className="form-control"
            rows="2"
            value={form.diagnostico}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        {/* Botones */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-warning" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Actualizar Historia'}
          </button>
        </div>
      </form>
    </div>
  );
}
