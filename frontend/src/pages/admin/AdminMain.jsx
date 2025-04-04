import React from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import './AdminMain.css';

const AdminMain = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="admin-main-container">
        <h2>Administración</h2>
        <div className="admin-main-buttons">
          <button
            className="admin-button"
            onClick={() => navigate('/lista-usuarios')}
          >
            Ver Usuarios
          </button>
          <button
            className="admin-button"
            onClick={() => navigate('/registrar-usuario')}
          >
            Registrar Usuario
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminMain;
