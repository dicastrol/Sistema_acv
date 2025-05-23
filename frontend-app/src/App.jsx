// src/App.jsx
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Sidebar          from './components/Sidebar';
import Topbar           from './components/Topbar';
import Dashboard        from './pages/Dashboard';
import Login            from './pages/Login';
import Pacientes        from './pages/Pacientes';
import RegistroPaciente from './pages/RegistroPaciente';
import VerPaciente      from './pages/VerPaciente';
import EditarPaciente   from './pages/EditarPaciente';

// Citas
import Citas            from './pages/Citas';
import RegistroCita     from './pages/RegistroCita';
import VerCita          from './pages/VerCita';
import EditarCita       from './pages/EditarCita';

// Historias clínicas
import HistoriasPaciente  from './pages/HistoriasPaciente';
import RegistroHistoria   from './pages/RegistroHistoria';
import VerHistoria        from './pages/VerHistoria';
import EditarHistoria from './pages/EditarHistoria';

//* Historias Clínicas */
import PredictACV from './pages/PredictACV'; 
import NeuroGuard from './pages/NeuroGuard';

function Layout() {
  const { pathname } = useLocation();
  const hideLayout = pathname === '/'; // ocultar sidebar/topbar en login

  return (
    <div className="flex">
      {!hideLayout && <Sidebar />}
      <div style={{ marginLeft: hideLayout ? 0 : '16rem' }} className="flex-1">
        {!hideLayout && <Topbar />}
        <div className="p-6">
          <Routes>
            {/* Login */}
            <Route path="/" element={<Login />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Pacientes */}
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/pacientes/registro" element={<RegistroPaciente />} />
            <Route path="/pacientes/:id" element={<VerPaciente />} />
            <Route path="/pacientes/:id/edit" element={<EditarPaciente />} />

            {/* Citas */}
            <Route path="/citas" element={<Citas />} />
            <Route path="/citas/all" element={<Citas />} />
            <Route path="/citas/nueva" element={<RegistroCita />} />
            <Route path="/citas/:id" element={<VerCita />} />
            <Route path="/citas/:id/edit" element={<EditarCita />} />

            {/* Historias Clínicas */}
            <Route path="/pacientes/:id/historias" element={<HistoriasPaciente />} />
            <Route path="/pacientes/:paciente_id/historias/nueva" element={<RegistroHistoria />} />
            <Route path="/historias/:id" element={<VerHistoria />} />
            <Route path="/historias/:id/edit" element={<EditarHistoria />} />
            {/* predictAcv */}
            <Route path="/predict/acv" element={<PredictACV />} />  
            <Route path="/predict/acv/:pacienteId" element={<PredictACV />} />
            <Route path="/neuroguard" element={<NeuroGuard />} />
            

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
