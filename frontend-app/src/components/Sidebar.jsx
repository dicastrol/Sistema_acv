import { Calendar, Users, BrainCircuit, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="bg-white border-end vh-100 position-fixed" style={{ width: '220px' }}>
      <div className="p-4">
        <h5 className="text-primary fw-bold mb-4">PredictMRS</h5>
        <ul className="nav flex-column gap-3">
          <li className="nav-item d-flex align-items-center">
            <Home className="me-2" size={18} />
            <Link to="/dashboard" className="nav-link p-0 text-dark">Inicio</Link>
          </li>
          <li className="nav-item d-flex align-items-center">
            <Calendar className="me-2" size={18} />
            <Link to="/citas" className="nav-link p-0 text-dark">Citas</Link>
          </li>
          <li className="nav-item d-flex align-items-center">
            <Users className="me-2" size={18} />
            <Link to="/pacientes" className="nav-link p-0 text-dark">Pacientes</Link>
          </li>
          <li className="nav-item d-flex align-items-center">
            <BrainCircuit className="me-2" size={18} />
            <Link to="/neuroguard" className="nav-link p-0 text-dark">NeuroGuard</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
