// src/pages/RegistroHistoria.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function RegistroHistoria() {
  const { paciente_id } = useParams();
  const API             = import.meta.env.VITE_API_BASE_URL;
  const navigate        = useNavigate();
  const token           = localStorage.getItem('token');

  const [form, setForm] = useState({
    paciente_id,
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
    diagnostico: '',
    evento_acv: false, // ← Nuevo campo para indicar ACV
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Recalcular IMC cuando cambien peso o altura
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

  // Validaciones básicas
  const validate = () => {
    if (!form.fecha_consulta)         return 'La fecha de consulta es obligatoria.';
    if (!form.motivo_consulta.trim()) return 'El motivo de consulta es obligatorio.';
    if (!form.presion_sistolica)      return 'La presión sistólica es obligatoria.';
    if (!form.presion_diastolica)     return 'La presión diastólica es obligatoria.';
    if (!form.peso)                   return 'El peso es obligatorio.';
    if (!form.altura)                 return 'La altura es obligatoria.';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError('');
    setSubmitting(true);

    // Normaliza fecha dd/mm/yyyy → yyyy-mm-dd
    const isoDate = dateStr => {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [d, m, y] = dateStr.split('/');
        return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      }
      return dateStr;
    };

    const raw = {
      ...form,
      fecha_consulta: isoDate(form.fecha_consulta),
      fecha_aparicion: form.fecha_aparicion ? isoDate(form.fecha_aparicion) : ''
    };

    // Casting a números
    if (raw.temperatura)             raw.temperatura             = parseFloat(raw.temperatura);
    if (raw.presion_sistolica)       raw.presion_sistolica       = parseFloat(raw.presion_sistolica);
    if (raw.presion_diastolica)      raw.presion_diastolica      = parseFloat(raw.presion_diastolica);
    if (raw.frecuencia_cardiaca)     raw.frecuencia_cardiaca     = parseInt(raw.frecuencia_cardiaca, 10);
    if (raw.frecuencia_respiratoria) raw.frecuencia_respiratoria = parseInt(raw.frecuencia_respiratoria, 10);
    raw.peso   = parseFloat(raw.peso);
    raw.altura = parseFloat(raw.altura);

    // Quitar imc y cadenas vacías
    delete raw.imc;
    const payload = Object.fromEntries(
      Object.entries(raw).filter(([_, v]) => !(typeof v === 'string' && v.trim() === ''))
    );

    try {
      const res = await fetch(`${API}/historias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Error creando historia:', data);
        throw new Error(data.error || JSON.stringify(data));
      }
      navigate(`/pacientes/${paciente_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <Link to={`/pacientes/${paciente_id}`}>&larr; Volver al perfil</Link>
      <h2 className="text-primary my-4">Nueva Historia Clínica</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Fecha de consulta */}
        <div className="mb-4">
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
        <div className="mb-4">
          <label className="form-label">Motivo de consulta *</label>
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

        {/* Fecha aparición y condiciones */}
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
            { name: 'temperatura', label: 'Temperatura (°C)', required: false },
            { name: 'presion_sistolica', label: 'Presión sistólica (mmHg)', required: true },
            { name: 'presion_diastolica', label: 'Presión diastólica (mmHg)', required: true },
            { name: 'frecuencia_cardiaca', label: 'FC (bpm)', required: false },
            { name: 'frecuencia_respiratoria', label: 'FR (rpm)', required: false },
          ].map(({ name, label, required }) => (
            <div className="col-md-3" key={name}>
              <label className="form-label">
                {label}{required ? ' *' : ''}
              </label>
              <input
                type="number"
                name={name}
                className="form-control"
                value={form[name]}
                onChange={handleChange}
                required={required}
                disabled={submitting}
              />
            </div>
          ))}
          <div className="col-md-3 d-flex align-items-center">
            <div className="form-check form-switch mt-4">
              <input
                type="checkbox"
                className="form-check-input"
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
              className="form-control"
              name="notas_signos"
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
        {[
          'obesidad',
          'tabaquismo',
          'alcohol',
          'drogas_estimulantes',
          'sedentarismo',
          'enfermedad_cardiaca_previa',
          'estres'
        ].map(key => (
          <div className="form-check form-switch mb-2" key={key}>
            <input
              type="checkbox"
              className="form-check-input"
              id={key}
              name={key}
              checked={form[key]}
              onChange={handleChange}
              disabled={submitting}
            />
            <label className="form-check-label text-capitalize">
              {key.replace(/_/g, ' ')}
            </label>
          </div>
        ))}

        {/* Nuevo toggle ACV */}
        <div className="form-check form-switch mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            id="evento_acv"
            name="evento_acv"
            checked={form.evento_acv}
            onChange={handleChange}
            disabled={submitting}
          />
          <label htmlFor="evento_acv" className="form-check-label">
            Sufrió ACV 
          </label>
        </div>

        {/* Historial Médico y Medicamentos */}
        <h5 className="mt-5">Historial Médico y Medicamentos</h5>
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
          <label className="form-label">Diagnóstico del doctor</label>
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
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={() => navigate(`/pacientes/${paciente_id}`)}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar Historia'}
          </button>
        </div>
      </form>
    </div>
  );
}
