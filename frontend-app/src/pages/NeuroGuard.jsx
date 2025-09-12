import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042','#AA336A','#663399'];

export default function NeuroGuard() {
  const API = import.meta.env.VITE_API_BASE_URL || '';
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [preds, setPreds] = useState(null);
  const [predError, setPredError] = useState('');

  useEffect(() => {
    fetch(`${API}/neuroguard/estadisticas`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(json => setStats(json))
      .catch(err => setError(err.toString()));
  }, [API]);
  useEffect(() => {
    fetch(`${API}/prediccion`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(json => setPreds(json))
      .catch(err => setPredError(err.toString()));
  }, [API]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return <p>Cargando estadísticas…</p>;

  const {
    total_pacientes, total_acv, tasa_acv,
    incidencia_mensual, prevalencia_factores,
    distribucion_sexo, distribucion_edad
  } = stats;

  const dataFactores = Object.entries(prevalencia_factores).map(
    ([factor, pct]) => ({ name: factor, value: pct * 100 })
  );

  const dataSexo = distribucion_sexo.map(({ sexo, count }) => ({
    name: sexo,
    value: count,
  }));

  const dataEdad = distribucion_edad.map(({ rango, count }) => ({
    rango,
    count,
  }));

  return (
    <div className="container mt-4">
      <h2>NeuroGuard: Análisis Global de ACV</h2>

      <div className="row my-4">
        {[{
           title: 'Pacientes Totales', value: total_pacientes
         },{
           title: 'Eventos de ACV',    value: total_acv
         },{
           title: 'Tasa de ACV',       value: (tasa_acv*100).toFixed(1)+'\u2009%'
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
        <Tooltip formatter={(v)=>v.toFixed(1)+'\u2009%'}/>
      </PieChart>

      <h5 className="mt-5">Distribución por Sexo</h5>
      <PieChart width={400} height={300}>
        <Pie
          data={dataSexo}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {dataSexo.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      <h5 className="mt-5">Distribución por Edad</h5>
      <BarChart width={500} height={300} data={dataEdad}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
        <XAxis dataKey="rango" />
        <YAxis allowDecimals={false}/>
        <Tooltip />
        <Bar dataKey="count" fill="#00C49F" />
      </BarChart>
       <h5 className="mt-5">Pacientes por Probabilidad de ACV</h5>
      {predError && <div className="alert alert-danger">{predError}</div>}
      <div className="row">
        <div className="col-md-6">
          <h6>Probabilidad Alta</h6>
          <ul className="list-group">
            {preds ? (
              preds.riesgo_alto.map(p => (
                <li key={p.paciente_id} className="list-group-item d-flex justify-content-between">
                  <span>{p.nombre}</span>
                  <span>{(p.probabilidad_acv*100).toFixed(1)}%</span>
                </li>
              ))
            ) : (
              <li className="list-group-item">Cargando…</li>
            )}
          </ul>
        </div>
        <div className="col-md-6">
          <h6>Probabilidad Baja</h6>
          <ul className="list-group">
            {preds ? (
              preds.riesgo_bajo.map(p => (
                <li key={p.paciente_id} className="list-group-item d-flex justify-content-between">
                  <span>{p.nombre}</span>
                  <span>{(p.probabilidad_acv*100).toFixed(1)}%</span>
                </li>
              ))
            ) : (
              <li className="list-group-item">Cargando…</li>
            )}
          </ul>
        </div>
      </div>

      <Link to="/pacientes" className="btn btn-secondary mt-4">
        ← Volver a Pacientes
      </Link>
    </div>
  );
}
