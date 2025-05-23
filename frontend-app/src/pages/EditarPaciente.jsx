// src/pages/EditarPaciente.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditarPaciente() {
  const { id } = useParams();
  const API    = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    tipo_documento: '',
    documento: '',
    fecha_nacimiento: '',
    sexo: '',
    estado_civil: '',
    ocupacion: '',
    grupo_sanguineo: '',
    telefono: '',
    direccion: '',
    email: '',
    aseguradora: '',
    contacto_emergencia: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_parentesco: '',
    hipertension: false,
    diabetes: false,
    tabaquismo: false,
    sedentarismo: false,
    colesterol_alto: false,
    antecedentes_familiares_acv: false,
  });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1) Al montar, cargar datos del paciente
  useEffect(() => {
    fetch(`${API}/pacientes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(p => {
        setForm({
          nombre: p.nombre || '',
          tipo_documento: p.tipo_documento || '',
          documento: p.documento || '',
          fecha_nacimiento: p.fecha_nacimiento || '',
          sexo: p.sexo || '',
          estado_civil: p.estado_civil || '',
          ocupacion: p.ocupacion || '',
          grupo_sanguineo: p.grupo_sanguineo || '',
          telefono: p.telefono || '',
          direccion: p.direccion || '',
          email: p.email || '',
          aseguradora: p.aseguradora || '',
          contacto_emergencia: p.contacto_emergencia || '',
          contacto_emergencia_telefono: p.contacto_emergencia_telefono || '',
          contacto_emergencia_parentesco: p.contacto_emergencia_parentesco || '',
          hipertension: p.hipertension || false,
          diabetes: p.diabetes || false,
          tabaquismo: p.tabaquismo || false,
          sedentarismo: p.sedentarismo || false,
          colesterol_alto: p.colesterol_alto || false,
          antecedentes_familiares_acv: p.antecedentes_familiares_acv || false,
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [API, id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.tipo_documento) return 'El tipo de documento es obligatorio.';
    if (!form.documento.trim()) return 'El documento es obligatorio.';
    if (!form.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (!form.sexo) return 'El sexo es obligatorio.';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setError('');
    setSubmitting(true);

    console.log('PUT →', `${API}/pacientes/${id}`);
    console.log('Payload:', form);

    try {
      const res = await fetch(`${API}/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      console.log('Status response:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error('Error body:', text);
        throw new Error(text || 'Error al actualizar');
      }
      navigate('/pacientes', { replace: true });
    } catch (err) {
      console.error('Fetch PUT error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando paciente…</p>;
  if (error && !submitting) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">Editar Paciente</h2>
      {submitting && <p>Actualizando...</p>}
      <form onSubmit={handleSubmit}>
        {/* Datos Personales */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">Datos Personales</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre completo *</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Tipo de documento *</label>
                <select
                  name="tipo_documento"
                  className="form-select"
                  value={form.tipo_documento}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar…</option>
                  <option value="CC">C.C.</option>
                  <option value="TI">T.I.</option>
                  <option value="CE">C.E.</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Documento *</label>
                <input
                  type="text"
                  name="documento"
                  className="form-control"
                  value={form.documento}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Fecha de nacimiento *</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  className="form-control"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Sexo *</label>
                <select
                  name="sexo"
                  className="form-select"
                  value={form.sexo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar…</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Estado civil</label>
                <select
                  name="estado_civil"
                  className="form-select"
                  value={form.estado_civil}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar…</option>
                  <option value="Soltero">Soltero(a)</option>
                  <option value="Casado">Casado(a)</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Ocupación</label>
                <input
                  type="text"
                  name="ocupacion"
                  className="form-control"
                  value={form.ocupacion}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Grupo sanguíneo</label>
                <select
                  name="grupo_sanguineo"
                  className="form-select"
                  value={form.grupo_sanguineo}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar…</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Datos de Contacto */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">Datos de Contacto</div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                className="form-control"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="form-control"
                value={form.direccion}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">Contacto de Emergencia</div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="contacto_emergencia"
                className="form-control"
                value={form.contacto_emergencia}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                name="contacto_emergencia_telefono"
                className="form-control"
                value={form.contacto_emergencia_telefono}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Parentesco</label>
              <input
                type="text"
                name="contacto_emergencia_parentesco"
                className="form-control"
                value={form.contacto_emergencia_parentesco}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Antecedentes */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">Antecedentes</div>
          <div className="card-body row g-3">
            {[
              'hipertension',
              'diabetes',
              'tabaquismo',
              'sedentarismo',
              'colesterol_alto',
              'antecedentes_familiares_acv'
            ].map(campo => (
              <div key={campo} className="col-md-4 form-check">
                <input
                  type="checkbox"
                  name={campo}
                  id={campo}
                  className="form-check-input"
                  checked={form[campo]}
                  onChange={handleChange}
                />
                <label htmlFor={campo} className="form-check-label text-capitalize">
                  {campo.replace(/_/g, ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="d-flex justify-content-end gap-2 mb-5">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={submitting}
            onClick={() => navigate('/pacientes')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-warning"
            disabled={submitting}
          >
            {submitting ? 'Guardando…' : 'Actualizar Paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}
