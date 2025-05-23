// src/components/Topbar.jsx
import { UserCircle, PanelRightOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Opcional: limpiar token, estado, etc.
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-primary px-4 shadow-sm">
      <div className="container-fluid justify-content-end">
        <ul className="navbar-nav d-flex flex-row gap-4 align-items-center">
          <li className="nav-item">
            <UserCircle color="white" size={20} />
          </li>
          
          <li className="nav-item">
            <LogOut 
              color="white" 
              size={20} 
              style={{ cursor: 'pointer' }}
              title="Cerrar sesión"
              onClick={handleLogout}
            />
          </li>
        </ul>
      </div>
    </nav>
  );
}

