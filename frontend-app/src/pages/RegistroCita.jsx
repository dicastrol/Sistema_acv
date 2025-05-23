// src/pages/RegistroCita.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistroCita() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    paciente_id: '',
    fecha_hora: '',
    servicio: 'medico general',
    personal_salud: 'Dr. Juan Pérez',
    estado: 'esperado',
    notas: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const servicios = [
    'medico general',
    'neurología',
    'cardiología',
    'psicología',
    'fisioterapia',
    'dermatología',
    'pediatría',
    'odontología',
    'ginecología',
    'urología'
  ];

  const medicos = [
    'Dr. Juan Pérez',
    'Dra. María Gómez',
    'Dr. Carlos Ramírez',
    'Dra. Luisa Martínez',
    'Dr. Andrés Silva',
    'Dra. Carolina López',
    'Dr. Esteban Torres',
    'Dra. Sofía Herrera',
    'Dr. Fernando Muñoz',
    'Dra. Natalia Ruiz'
  ];

  const estados = [
    'esperado',
    'llegada registrada',
    'completado',
    'cancelado'
  ];

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.paciente_id.trim()) return 'El ID de paciente es obligatorio';
    if (!form.fecha_hora) return 'La fecha y hora son obligatorias';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);

    // Incluir segundos si faltan
    let fecha = form.fecha_hora;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fecha)) {
      fecha = `${fecha}:00`;
    }
    const payload = { ...form, fecha_hora: fecha };
    console.log('Enviando nueva cita:', payload);

    try {
      const res = await fetch('/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      console.log('Status respuesta /citas:', res.status);
      const text = await res.text();
      console.log('Respuesta cruda:', text);
      const data = (() => { try { return JSON.parse(text); } catch { return null; } })();
      if (!res.ok) {
        const msg = data?.error || `Error ${res.status}`;
        throw new Error(msg);
      }
      navigate('/citas/all');
    } catch (err) {
      console.error('Error creando cita:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">Nueva Cita</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Paciente ID *</label>
          <input
            type="text"
            name="paciente_id"
            className="form-control"
            value={form.paciente_id}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Fecha y hora *</label>
          <input
            type="datetime-local"
            name="fecha_hora"
            className="form-control"
            value={form.fecha_hora}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Servicio *</label>
          <select
            name="servicio"
            className="form-select"
            value={form.servicio}
            onChange={handleChange}
            disabled={submitting}
          >
            {servicios.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Personal asignado *</label>
          <select
            name="personal_salud"
            className="form-select"
            value={form.personal_salud}
            onChange={handleChange}
            disabled={submitting}
          >
            {medicos.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Estado *</label>
          <select
            name="estado"
            className="form-select"
            value={form.estado}
            onChange={handleChange}
            disabled={submitting}
          >
            {estados.map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Notas</label>
          <textarea
            name="notas"
            rows="3"
            className="form-control"
            value={form.notas}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/citas')} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar Cita'}
          </button>
        </div>
      </form>
    </div>
  );
}
