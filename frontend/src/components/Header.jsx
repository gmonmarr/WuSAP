import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "@ui5/webcomponents/dist/Bar.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents-icons/dist/navigation-left-arrow.js";

const Header = ({ title }) => {
  const navigate = useNavigate();

return (
    <ui5-bar 
        design="Header" 
        style={{ 
            marginTop: "80px", 
            display: "flex", 
            alignItems: "center",
            boxShadow: "none",
            border: "none",
            background: "transparent"
        }}
    >
    <div style={{ transform: "scale(1.7)", position: "absolute", left: "40px" }}> {/* Position arrow at the very left */}
        <ui5-button
            icon="navigation-left-arrow"
            design="Transparent"
            slot="startContent"
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{ 
                color: "#3f51b5", 
                transition: "background-color 0.3s ease, color 0.3s ease", 
                border: "none" 
            }}
        ></ui5-button>
    </div>


        <span style={{ fontWeight: "bold", fontSize: "2rem", color: "#3f51b5" }}>
            {title}
        </span>
    </ui5-bar>
);
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Header;
