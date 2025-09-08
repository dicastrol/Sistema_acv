import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042','#AA336A','#663399'];

export default function NeuroGuard() {
  const API = import.meta.env.VITE_API_BASE_URL || '';
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('stats');
  const [altoRiesgo, setAltoRiesgo] = useState([]);
  const [errorRiesgo, setErrorRiesgo] = useState('');

  useEffect(() => {
    fetch(`${API}/neuroguard/estadisticas`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(json => setStats(json))
      .catch(err => setError(err.toString()));
  }, [API]);

  useEffect(() => {
    if (tab === 'alto' && altoRiesgo.length === 0) {
      fetch(`${API}/prediccion`)
        .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
        .then(json => setAltoRiesgo(json.riesgo_alto))
        .catch(err => setErrorRiesgo(err.toString()));
    }
  }, [tab, API, altoRiesgo.length]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return <p>Cargando estadísticas…</p>;

  const {
    total_pacientes, total_acv, tasa_acv,
    incidencia_mensual, prevalencia_factores
  } = stats;

  const dataFactores = Object.entries(prevalencia_factores).map(
    ([factor, pct]) => ({ name: factor, value: pct * 100 })
  );

  return (
    <div className="container mt-4">
      <h2>NeuroGuard: Análisis Global de ACV</h2>

      <ul className="nav nav-tabs my-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'stats' ? 'active' : ''}`}
            onClick={() => setTab('stats')}
          >
            Estadísticas
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'alto' ? 'active' : ''}`}
            onClick={() => setTab('alto')}
          >
            Pacientes con alto riesgo
          </button>
        </li>
      </ul>

      {tab === 'stats' && (
        <>
      <div className="row my-4">
        {[{
           title: 'Pacientes Totales', value: total_pacientes
         },{
           title: 'Eventos de ACV',    value: total_acv
         },{
           title: 'Tasa de ACV',       value: (tasa_acv*100).toFixed(1)+' %'
        }].map((c,i) => (
          <div key={i} className="col-md-4 mb-3">
            <div className="card text-center p-3">
              <h6>{c.title}</h6>
              <p className="display-6">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h5>Incidencia Mensual (últimos 12 meses)</h5>
      <LineChart width={700} height={300}
        data={incidencia_mensual}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <XAxis dataKey="mes" />
        <YAxis allowDecimals={false}/>
        <Tooltip />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
        <Line type="monotone" dataKey="acv" stroke="#8884d8" />
      </LineChart>

      <h5 className="mt-5">Prevalencia de Factores de Riesgo (%)</h5>
      <PieChart width={400} height={300}>
        <Pie
          data={dataFactores}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {dataFactores.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v)=>v.toFixed(1)+' %'}/>
      </PieChart>
        </>
      )}

      {tab === 'alto' && (
        <div className="mt-4">
          {errorRiesgo && <div className="alert alert-danger">{errorRiesgo}</div>}
          <h5>Pacientes con riesgo alto de ACV</h5>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-primary text-center">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Probabilidad</th>
                </tr>
              </thead>
              <tbody className="text-center align-middle">
                {altoRiesgo.map(p => (
                  <tr key={p.paciente_id}>
                    <td>{p.paciente_id}</td>
                    <td>{p.nombre}</td>
                    <td>{(p.probabilidad_acv*100).toFixed(1)}%</td>
                  </tr>
                ))}
                {altoRiesgo.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-muted">No hay pacientes con riesgo alto</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Link to="/pacientes" className="btn btn-secondary mt-4">
        ← Volver a Pacientes
      </Link>
    </div>
  );
}
