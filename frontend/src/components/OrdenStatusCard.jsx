import React from "react";
import PropTypes from "prop-types";
import "@ui5/webcomponents/dist/Card";

const OrdenStatusCard = ({ ordenNumber, numOrden, material, isSelected }) => {
  return (
    <ui5-card
      style={{
        width: "100%",
        marginBottom: "1rem",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: isSelected ? "0 0 0 2px #3f51b5, 0 2px 8px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        cursor: "pointer"
      }}
    >
      <div
        slot="header"
        style={{
          padding: "0.75rem 1rem",
          backgroundColor: isSelected ? "#f0f2ff" : "#fff",
          borderBottom: "1px solid #e5e5e5"
        }}
      >
        <div style={{ 
          fontSize: "1.25rem", 
          fontWeight: "600", 
          color: isSelected ? "#3f51b5" : "#333" 
        }}>
          Orden {ordenNumber}
        </div>
      </div>
      <div 
        style={{ 
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          backgroundColor: isSelected ? "#f9faff" : "#fff"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "500" }}>Num Orden:</span>
          <span>{numOrden}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "500" }}>Material:</span>
          <span>{material}</span>
        </div>
      </div>
    </ui5-card>
  );
};

OrdenStatusCard.propTypes = {
  ordenNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  numOrden: PropTypes.string.isRequired,
  material: PropTypes.string.isRequired,
  isSelected: PropTypes.bool
};

OrdenStatusCard.defaultProps = {
  isSelected: false
};

export default OrdenStatusCard;
