import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const Modal = ({ message, onConfirm, onCancel }) => {
  return (
    <Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
          <WarningAmberIcon color="warning" fontSize="large" />
          Confirmación
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{ textAlign: "center", fontSize: "1rem", color: "text.primary" }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button onClick={onCancel} color="inherit" variant="outlined">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Sí, continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
