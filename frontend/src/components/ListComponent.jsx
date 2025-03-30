// components/ListComponent.jsx

import React from 'react';
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/Icon.js";
import "@ui5/webcomponents/dist/Button.js";
import "./ListComponent.css";

const ListComponent = ({ data, renderItem, headerText }) => {
  return (
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
              onClick={() => console.log('Button clicked for:', item)}
            >
              Ver detalle del usuario
            </ui5-button>
          </div>
        </ui5-li>
      ))}
    </ui5-list>
  );
};

export default ListComponent;
