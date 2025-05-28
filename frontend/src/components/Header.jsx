// components/Header.jsx

import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "@ui5/webcomponents/dist/Bar.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents-icons/dist/navigation-left-arrow.js";

const Header = ({ title }) => {
    // eslint-disable-next-line no-unused-vars
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
            <span style={{ fontWeight: "bold", fontSize: "2rem", color: "#2C3E73" }}>
                {title}
            </span>
        </ui5-bar>
    );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Header;
