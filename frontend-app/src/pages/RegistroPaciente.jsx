// src/pages/RegistroPaciente.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistroPaciente() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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
    // Nuevo campo: ACV previo
    tuvo_acv: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.tipo_documento) return 'El tipo de documento es obligatorio.';
    if (!form.documento.trim()) return 'El documento es obligatorio.';
    if (!form.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (new Date(form.fecha_nacimiento) > new Date()) return 'La fecha de nacimiento no puede ser futura.';
    if (!form.sexo) return 'El sexo es obligatorio.';
    if (!form.grupo_sanguineo) return 'El grupo sanguíneo es obligatorio.';
    if (!form.contacto_emergencia.trim()) return 'El nombre de contacto de emergencia es obligatorio.';
    if (!form.contacto_emergencia_telefono.trim()) return 'El teléfono de contacto de emergencia es obligatorio.';
    if (!form.contacto_emergencia_parentesco.trim()) return 'El parentesco de contacto de emergencia es obligatorio.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Paciente registrado exitosamente.');
        setTimeout(() => navigate('/pacientes'), 1500);
      } else {
        setError(data.error || `Error ${res.status}`);
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">Registro de Paciente</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        {/* Datos Personales */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">Datos Personales</div>
          <div className="card-body">
            <div className="row g-3">
              {/* Nombre */}
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
              {/* Tipo de documento */}
              <div className="col-md-3">
                <label className="form-label">Tipo de documento *</label>
                <select
                  name="tipo_documento"
                  className="form-select"
                  value={form.tipo_documento}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="CC">C.C.</option>
                  <option value="TI">T.I.</option>
                  <option value="CE">C.E.</option>
                </select>
              </div>
              {/* Documento */}
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
              {/* Fecha de nacimiento */}
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
              {/* Sexo */}
              <div className="col-md-4">
                <label className="form-label">Sexo *</label>
                <select
                  name="sexo"
                  className="form-select"
                  value={form.sexo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              {/* Estado civil */}
              <div className="col-md-4">
                <label className="form-label">Estado civil</label>
                <select
                  name="estado_civil"
                  className="form-select"
                  value={form.estado_civil}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Soltero">Soltero(a)</option>
                  <option value="Casado">Casado(a)</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              {/* Ocupación */}
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
              {/* Grupo sanguíneo */}
              <div className="col-md-6">
                <label className="form-label">Grupo sanguíneo *</label>
                <select
                  name="grupo_sanguineo"
                  className="form-select"
                  value={form.grupo_sanguineo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar...</option>
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
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                name="contacto_emergencia"
                className="form-control"
                value={form.contacto_emergencia}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Teléfono *</label>
              <input
                type="tel"
                name="contacto_emergencia_telefono"
                className="form-control"
                value={form.contacto_emergencia_telefono}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Parentesco *</label>
              <input
                type="text"
                name="contacto_emergencia_parentesco"
                className="form-control"
                value={form.contacto_emergencia_parentesco}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Antecedentes */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">Antecedentes</div>
          <div className="card-body row g-3">
            {['hipertension', 'diabetes', 'tabaquismo', 'sedentarismo', 'colesterol_alto', 'antecedentes_familiares_acv'].map(campo => (
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

            {/* Nuevo checkbox */}
            <div className="col-md-4 form-check">
              <input
                type="checkbox"
                name="tuvo_acv"
                id="tuvo_acv"
                className="form-check-input"
                checked={form.tuvo_acv}
                onChange={handleChange}
              />
              <label htmlFor="tuvo_acv" className="form-check-label text-capitalize">
                Sufrió un ACV
              </label>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="d-flex justify-content-end gap-2 mb-5">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/pacientes')}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : 'Guardar Paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}
