import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "@ui5/webcomponents/dist/Bar.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents-icons/dist/navigation-left-arrow.js";

const Header = ({ title }) => {
  const navigate = useNavigate();

  return (
    <ui5-bar design="Header" style={{ marginTop: "60px", display: "flex", alignItems: "center" }}>
      <ui5-button
        icon="navigation-left-arrow"
        design="Transparent"
        slot="startContent"
        onClick={() => navigate(-1)}
        aria-label="Back"
      ></ui5-button>
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
