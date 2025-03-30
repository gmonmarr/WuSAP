// pages/admin/AddUser.jsx

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import './AddUser.css';

const AddUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tempPassword: '',
    role: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User data submitted:', formData);
    // Add logic to handle form submission
  };

  return (
    <>
      <Navbar />
      <div className="add-user-container">
        <div className="add-user-card">
          <ui5-button
            design="Transparent"
            class="back-button"
            onClick={() => window.history.back()}
          >
            ← Volver
          </ui5-button>
          <h2>Agregar usuario</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <ui5-input
                name="firstName"
                placeholder="Nombre"
                value={formData.firstName}
                onInput={(e) => handleChange(e.target)}
                required
              ></ui5-input>
              <ui5-input
                name="lastName"
                placeholder="Apellido"
                value={formData.lastName}
                onInput={(e) => handleChange(e.target)}
                required
              ></ui5-input>
            </div>
            <div className="form-row">
              <ui5-input
                type="Email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onInput={(e) => handleChange(e.target)}
                required
              ></ui5-input>
            </div>
            <div className="form-row">
              <ui5-input
                type="Password"
                name="tempPassword"
                placeholder="Contraseña temporal"
                value={formData.tempPassword}
                onInput={(e) => handleChange(e.target)}
                required
              ></ui5-input>
              <ui5-input
                type="Password"
                placeholder="Contraseña temporal"
                disabled
              ></ui5-input>
            </div>
            <div className="form-row">
              <ui5-select
                name="role"
                value={formData.role}
                onChange={(e) => handleChange(e.target)}
                required
              >
                <ui5-option value="">Rol</ui5-option>
                <ui5-option value="admin">Admin</ui5-option>
                <ui5-option value="distribuidor">Distribuidor</ui5-option>
                <ui5-option value="cliente">Cliente</ui5-option>
                <ui5-option value="provedor">Provedor</ui5-option>
              </ui5-select>
              <ui5-input
                type="Tel"
                name="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onInput={(e) => handleChange(e.target)}
                required
              ></ui5-input>
            </div>
            <ui5-button design="Emphasized" type="Submit" class="register-button">
              Registrar
            </ui5-button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddUser;
