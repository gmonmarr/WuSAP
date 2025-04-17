import React, { useState, useEffect } from "react";
import { useBlocker } from "../hooks/useBlocker";
import Modal from "./Modal"; // Import the modal component

const buttonStyles = `
  .modal-button {
    margin: 10px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .modal-button:hover {
    background-color: #0056b3;
  }
`;

const AvisoPerdidaInfo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [retryAction, setRetryAction] = useState(null); // Store retry function or history action

  useBlocker(({ retry }) => {
    setIsModalVisible(true);
    setRetryAction(() => retry); // Save retry function
  });

  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      setIsModalVisible(true);
      setRetryAction(() => () => window.history.forward()); // Retry: undo the back
      window.history.pushState(null, "", window.location.href); // Push dummy state to trap back
    };

    window.history.pushState(null, "", window.location.href); // Initial dummy state
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleConfirmNavigation = () => {
    setIsModalVisible(false);
    if (retryAction) {
      retryAction(); // Execute saved retry action (e.g., history.back)
    }
  };

  const handleCancelNavigation = () => {
    setIsModalVisible(false);
    setRetryAction(null); // Clear retry action
  };

  // Handle refresh and browser back navigation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        "La información seleccionada/ingresada se perderá si cambia de página. ¿Desea continuar de todos modos?";
    };

    // Add event listener for refresh
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Handle back navigation using popstate
    const handlePopState = () => {
      setIsModalVisible(true);
      setRetryAction(() => () => window.history.back()); // Retry by navigating back
    };

    window.addEventListener("popstate", handlePopState);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <>
      <style>{buttonStyles}</style>
      {isModalVisible && (
        <Modal
          message="La información seleccionada/ingresada se perderá si cambia de página. ¿Desea continuar de todos modos?"
          onConfirm={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
        />
      )}
    </>
  );
};

export default AvisoPerdidaInfo;