
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditarCita() {
  const { id } = useParams();
  const API    = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    paciente_id: '',
    fecha_hora: '',
    servicio: '',
    personal_salud: '',
    estado: 'esperado',
    notas: ''
  });
  const [loading, setLoading]       = useState(!!id);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1) Si traemos un id, cargamos la cita existente
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`${API}/citas/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Cita no encontrada');
        return res.json();
      })
      .then(c => {
        // Ajuste: datetime-local quiere YYYY-MM-DDThh:mm
        const dtLocal = c.fecha_hora.slice(0,16);
        setForm({
          paciente_id: c.paciente_id,
          fecha_hora:  dtLocal,
          servicio:    c.servicio,
          personal_salud: c.personal_salud || '',
          estado:      c.estado,
          notas:       c.notas || ''
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [API, id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // hacemos iso string desde datetime-local
      const payload = {
        ...form,
        fecha_hora: new Date(form.fecha_hora).toISOString().slice(0,19)
      };

      const method = id ? 'PUT' : 'POST';
      const url    = id ? `${API}/citas/${id}` : `${API}/citas`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error guardando cita');
      }
      navigate('/citas');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando cita…</p>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">{ id ? 'Editar Cita' : 'Nueva Cita' }</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* ID Paciente */}
        <div className="mb-3">
          <label className="form-label">Paciente ID *</label>
          <input
            type="number"
            name="paciente_id"
            className="form-control"
            value={form.paciente_id}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fecha y hora */}
        <div className="mb-3">
          <label className="form-label">Fecha y hora *</label>
          <input
            type="datetime-local"
            name="fecha_hora"
            className="form-control"
            value={form.fecha_hora}
            onChange={handleChange}
            required
          />
        </div>

        {/* Servicio */}
        <div className="mb-3">
          <label className="form-label">Servicio *</label>
          <input
            type="text"
            name="servicio"
            className="form-control"
            value={form.servicio}
            onChange={handleChange}
            required
          />
        </div>

        {/* Personal asignado (no required) */}
        <div className="mb-3">
          <label className="form-label">Personal asignado</label>
          <input
            type="text"
            name="personal_salud"
            className="form-control"
            value={form.personal_salud}
            onChange={handleChange}
          />
        </div>

        {/* Estado */}
        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select
            name="estado"
            className="form-select"
            value={form.estado}
            onChange={handleChange}
          >
            <option value="esperado">Esperado</option>
            <option value="completado">Completado</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {/* Notas */}
        <div className="mb-3">
          <label className="form-label">Notas</label>
          <textarea
            name="notas"
            className="form-control"
            rows="3"
            value={form.notas}
            onChange={handleChange}
          />
        </div>

        {/* Botones */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/citas')}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Guardando…' : 'Guardar Cita'}
          </button>
        </div>
      </form>
    </div>
  );
}
