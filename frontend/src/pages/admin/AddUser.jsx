// pages/admin/AddUser.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';
import { authService } from '../../services/api';

// Importaciones de UI5
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/MessageStrip.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents-icons/dist/add.js";
import "@ui5/webcomponents-icons/dist/user-edit.js";
import "@ui5/webcomponents-icons/dist/cancel.js";

import './AddUser.css';

const AddUser = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    cellphone: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Asegurar que el scroll funcione correctamente
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es obligatorio";
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    
    if (!formData.role) newErrors.role = "El rol es obligatorio";
    if (!formData.cellphone.trim()) newErrors.cellphone = "El teléfono es obligatorio";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpia errores cuando el usuario escribe
    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ 
        type: 'Error', 
        text: 'Por favor, corrige los errores en el formulario.' 
      });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Asegurarnos que los nombres de los campos coincidan con lo que espera el backend
      const userData = {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        cellphone: formData.cellphone
      };
      
      console.log("Enviando datos:", userData);
      
      const result = await authService.register(userData);
      
      if (result.success) {
        setMessage({ 
          type: 'Success', 
          text: 'Usuario registrado exitosamente.' 
        });
        // Resetear formulario
        setFormData({
          name: '',
          lastName: '',
          email: '',
          password: '',
          role: '',
          cellphone: '',
        });
        
        // Después de 2 segundos, redirigir a la lista de usuarios
        setTimeout(() => {
          navigate('/lista-usuarios');
        }, 2000);
      } else {
        // Si el backend retorna success: false pero no hay error
        setMessage({ 
          type: 'Error', 
          text: result.message || 'Error al registrar usuario. Por favor, intenta de nuevo.' 
        });
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      
      // Intentar extraer el mensaje de error del objeto de respuesta
      let errorMsg = 'Error al registrar usuario. Por favor, intenta de nuevo.';
      
      if (error.response && error.response.data) {
        errorMsg = error.response.data.message || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setMessage({ 
        type: 'Error', 
        text: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <Header title="Registro de Usuario" />
      
      <div className="content-wrapper">
        <div className="add-user-container">
          <ui5-card class="add-user-card">
            <ui5-card-header
              title-text="Crear Nueva Cuenta de Usuario"
              subtitle-text="Completa todos los campos para registrar un nuevo usuario"
              interactive
              slot="header"
            >
            </ui5-card-header>
            
            {message.text && (
              <ui5-message-strip
                class="message-strip"
                design={message.type}
                close-button-accessible-name="Close"
                close-button
              >
                {message.text}
              </ui5-message-strip>
            )}
            
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <ui5-title level="H5">Información Personal</ui5-title>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <ui5-label for="name" required>Nombre</ui5-label>
                      <ui5-input
                        id="name"
                        name="name"
                        placeholder="Nombre"
                        value={formData.name}
                        onInput={(e) => handleChange({
                          target: {
                            name: "name",
                            value: e.target.value
                          }
                        })}
                        required
                        value-state={errors.name ? "Error" : "None"}
                      ></ui5-input>
                      {errors.name && <div className="error-message">{errors.name}</div>}
                    </div>
                    
                    <div className="form-group">
                      <ui5-label for="lastName" required>Apellido</ui5-label>
                      <ui5-input
                        id="lastName"
                        name="lastName"
                        placeholder="Apellido"
                        value={formData.lastName}
                        onInput={(e) => handleChange({
                          target: {
                            name: "lastName",
                            value: e.target.value
                          }
                        })}
                        required
                        value-state={errors.lastName ? "Error" : "None"}
                      ></ui5-input>
                      {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <ui5-title level="H5">Información de Contacto</ui5-title>
                  
                  <div className="form-row">
                    <div className="form-group full-width">
                      <ui5-label for="email" required>Correo Electrónico</ui5-label>
                      <ui5-input
                        id="email"
                        type="Email"
                        name="email"
                        placeholder="correo@ejemplo.com"
                        value={formData.email}
                        onInput={(e) => handleChange({
                          target: {
                            name: "email",
                            value: e.target.value
                          }
                        })}
                        required
                        value-state={errors.email ? "Error" : "None"}
                      ></ui5-input>
                      {errors.email && <div className="error-message">{errors.email}</div>}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <ui5-label for="cellphone" required>Número de Teléfono</ui5-label>
                      <ui5-input
                        id="cellphone"
                        type="Tel"
                        name="cellphone"
                        placeholder="(123) 456-7890"
                        value={formData.cellphone}
                        onInput={(e) => handleChange({
                          target: {
                            name: "cellphone",
                            value: e.target.value
                          }
                        })}
                        required
                        value-state={errors.cellphone ? "Error" : "None"}
                      ></ui5-input>
                      {errors.cellphone && <div className="error-message">{errors.cellphone}</div>}
                    </div>
                    
                    <div className="form-group">
                      <ui5-label for="role" required>Rol del Usuario</ui5-label>
                      <ui5-select
                        id="role"
                        name="role"
                        onChange={(e) => {
                          console.log("Select event:", e);
                          handleChange({
                            target: {
                              name: "role",
                              value: e.target.selectedOption ? e.target.selectedOption.value : ""
                            }
                          });
                        }}
                        value-state={errors.role ? "Error" : "None"}
                      >
                        <ui5-option value="">Seleccionar rol</ui5-option>
                        <ui5-option value="admin">Administrador</ui5-option>
                        <ui5-option value="manager">Gerente</ui5-option>
                        <ui5-option value="venta">Ventas</ui5-option>
                        <ui5-option value="owner">Propietario</ui5-option>
                      </ui5-select>
                      {errors.role && <div className="error-message">{errors.role}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <ui5-title level="H5">Información de Acceso</ui5-title>
                  
                  <div className="form-row">
                    <div className="form-group full-width">
                      <ui5-label for="password" required>Contraseña Temporal</ui5-label>
                      <ui5-input
                        id="password"
                        type="Password"
                        name="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onInput={(e) => handleChange({
                          target: {
                            name: "password",
                            value: e.target.value
                          }
                        })}
                        required
                        value-state={errors.password ? "Error" : "None"}
                      ></ui5-input>
                      {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="button-row">
                  <ui5-button
                    design="Transparent"
                    onClick={() => navigate('/lista-usuarios')}
                    icon="cancel"
                  >
                    Cancelar
                  </ui5-button>
                  
                  <ui5-button
                    design="Emphasized"
                    type="Submit"
                    icon="user-edit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registrando...' : 'Registrar Usuario'}
                  </ui5-button>
                </div>
              </form>
            </div>
          </ui5-card>
        </div>
      </div>
    </>
  );
};

export default AddUser;