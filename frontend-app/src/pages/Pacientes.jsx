// src/pages/Pacientes.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, Eye, Edit, Trash } from 'lucide-react';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [filtro, setFiltro]       = useState('');
  const [pagina, setPagina]       = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const navigate = useNavigate();

  // Recuperar token JWT
  const token = localStorage.getItem('token');

  // 1) Cargar pacientes al montar
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await fetch('/pacientes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setPacientes(data);
      } catch (err) {
        console.error('Error cargando pacientes:', err);
      }
    };
    fetchPacientes();
  }, [token]);

  // 2) Eliminar un paciente
  const handleEliminar = async id => {
    if (!window.confirm('¿Eliminar paciente?')) return;
    try {
      const res = await fetch(`/pacientes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setPacientes(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error eliminando paciente:', err);
      alert('Error eliminando el paciente');
    }
  };

  // 3) Filtrado y paginación
  const filtrados = filtro.trim() === ''
    ? pacientes
    : pacientes.filter(p => p.id === Number(filtro));

  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const inicio       = (pagina - 1) * porPagina;
  const actuales     = filtrados.slice(inicio, inicio + porPagina);

  // 4) Calcular edad
  const calcularEdad = fechaNacimiento => {
    const hoy = new Date(), nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    if (
      hoy.getMonth() < nac.getMonth() ||
      (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())
    ) edad--;
    return edad;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">Pacientes</h3>
        <span className="text-muted">Total: {pacientes.length}</span>
      </div>
      <div className="card shadow-sm rounded">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 w-50">
            <div className="input-group">
              <span className="input-group-text bg-white"><Search size={16} /></span>
              <input
                type="number"
                className="form-control"
                placeholder="Buscar por ID"
                value={filtro}
                onChange={e => { setFiltro(e.target.value); setPagina(1); }}
              />
            </div>
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={() => navigate('/pacientes/registro')}
            >
              <Plus size={16} className="me-1" /> Registro de Paciente
            </button>
          </div>
          <button className="btn btn-outline-primary d-flex align-items-center">
            <Download size={16} className="me-1" /> Exportar CSV
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-primary text-center">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Edad</th>
                <th>Teléfono</th>
                <th style={{ minWidth: '140px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="text-center align-middle">
              {actuales.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.documento}</td>
                  <td>{calcularEdad(p.fecha_nacimiento)}</td>
                  <td>{p.telefono}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => navigate(`/pacientes/${p.id}`)}
                      title="Ver"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning me-1"
                      onClick={() => navigate(`/pacientes/${p.id}/edit`)}
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleEliminar(p.id)}
                      title="Eliminar"
                    >
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No se encontraron pacientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span>Elementos por página:</span>
            <select
              className="form-select form-select-sm ms-2"
              style={{ width: 'auto' }}
              value={porPagina}
              onChange={e => { setPorPagina(+e.target.value); setPagina(1); }}
            >
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="ms-3 text-muted">
              {filtrados.length > 0
                ? `${inicio + 1}–${Math.min(inicio + porPagina, filtrados.length)} de ${filtrados.length}`
                : '0 de 0'}
            </span>
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPagina(pagina - 1)}>Anterior</button>
              </li>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <li key={i+1} className={`page-item ${pagina === i+1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPagina(i+1)}>{i+1}</button>
                </li>
              ))}
              <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPagina(pagina + 1)}>Siguiente</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
