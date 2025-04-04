// components/ListComponent.jsx

import React, { useState } from 'react';
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/Icon.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Dialog.js";
import "@ui5/webcomponents/dist/MessageStrip.js";
import "./ListComponent.css";

const ListComponent = ({ data, renderItem, headerText, onDeleteUser }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleButtonClick = (item) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteUser = () => {
    if (onDeleteUser && selectedItem) {
      onDeleteUser(selectedItem.id);
      setSuccessMessage(`Usuario ${selectedItem.name} eliminado exitosamente.`);
    }
    handleCloseDialog();
    setTimeout(() => setSuccessMessage(''), 3000); // Clear the message after 3 seconds
  };

  return (
    <>
      {successMessage && (
        <ui5-messagestrip
          design="Positive"
          style={{ marginBottom: "1rem" }}
          hide-close-button
        >
          {successMessage}
        </ui5-messagestrip>
      )}

      <ui5-list class="list-component" header-text={headerText}>
        {data.map((item, index) => (
          <ui5-li key={index} class="list-item">
            <div className="list-item-container">
              <div className="list-item-content">
                {renderItem(item)}
              </div>
              <ui5-button 
                design="Transparent" 
                class="list-item-button"
                onClick={() => handleButtonClick(item)}
              >
                Ver detalle del usuario
              </ui5-button>
            </div>
          </ui5-li>
        ))}
      </ui5-list>

      {selectedItem && (
        <ui5-dialog open={isDialogOpen} header-text={`Detalles de ${selectedItem.name}`}>
          <div style={{ padding: "1.5rem", fontSize: "1rem", lineHeight: "1.6", color: "#333" }}>
            <p><strong>Email:</strong> {selectedItem.email}</p>
            <p><strong>Rol:</strong> {selectedItem.role}</p>
            <p><strong>Dirección:</strong> {selectedItem.address || "No disponible"}</p>
          </div>
          <div slot="footer" style={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            alignItems: "center", 
            gap: "1rem", 
            padding: "1rem", 
            borderTop: "1px solid #ddd" 
          }}>
            <ui5-button design="Negative" onClick={handleDeleteUser}>
              Eliminar Usuario
            </ui5-button>
            <ui5-button design="Emphasized" onClick={handleCloseDialog}>
              Cerrar
            </ui5-button>
          </div>
        </ui5-dialog>
      )}
    </>
  );
};

export default ListComponent;
