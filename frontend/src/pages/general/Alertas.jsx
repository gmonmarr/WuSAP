// Alertas.jsx
import {
  List, ListItem, ListItemText, Divider, Container, Box, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Select, MenuItem, IconButton
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Alta": return "#ffcccc";
    case "Media": return "#fff4cc";
    case "Baja": return "#D3D3D3";
    default: return "#ffffff";
  }
};

const getIconColor = (priority) => {
  switch (priority) {
    case "Alta": return "#950606";
    case "Media": return "#8B8000";
    default: return "#A9A9A9";
  }
};

const Alertas = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("Todos");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Normaliza las alertas para la UI
  const normalizeAlerts = (alerts) =>
    alerts.map((item, idx) => ({
      id: idx + 1,
      priority: item.priority || "Baja",
      subject: `Producto ${item.productName} - Tienda ${item.storeName}`,
      time: new Date().toLocaleTimeString(),
      predicted_quantity: item.predicted_quantity ?? 0,
      quantity: item.quantity ?? 0,
    }));

  useEffect(() => {
    if (location.state?.alerts && Array.isArray(location.state.alerts)) {
      setMessages(normalizeAlerts(location.state.alerts));
    } else {
      // Si no hay alertas en el state, mostrar vacío o mensaje
      setMessages([]);
    }
  }, [location.state]);

  // Filtros y acciones
  const handlePriorityChange = (event) => setPriorityFilter(event.target.value);
  const handleSort = (order) => setSortOrder(order);
  const handleViewDetails = (alert) => setSelectedAlert(alert);
  const handleResolve = (id) => {
    setMessages(messages.filter((msg) => msg.id !== id));
    setSelectedAlert(null);
  };
  const handleDelete = (id) => {
    setMessages(messages.filter((msg) => msg.id !== id));
    setSelectedAlert(null);
  };

  const filteredMessages = messages
    .filter((msg) => priorityFilter === "Todos" || msg.priority === priorityFilter)
    .sort((a, b) => (sortOrder === "Newest" ? b.id - a.id : a.id - b.id));

  return (
    <>
      <Header title="Alertas" />
      <Navbar />
      <Container maxWidth="md">
        <Box display="flex" alignItems="center" gap={2} p={1}>
          <Select value={priorityFilter} onChange={handlePriorityChange} size="small">
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Media">Media</MenuItem>
            <MenuItem value="Baja">Baja</MenuItem>
          </Select>

          <Box display="flex" gap={1} flexGrow={1} justifyContent="flex-end">
            <Button
              variant={sortOrder === "Newest" ? "contained" : "outlined"}
              size="small"
              onClick={() => handleSort("Newest")}
            >
              Más Recientes
            </Button>
            <Button
              variant={sortOrder === "Oldest" ? "contained" : "outlined"}
              size="small"
              onClick={() => handleSort("Oldest")}
            >
              Más Antiguos
            </Button>
          </Box>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          <List>
            {filteredMessages.length === 0 ? (
              <p>No hay alertas para mostrar.</p>
            ) : (
              filteredMessages.map((msg) => (
                <React.Fragment key={msg.id}>
                  <ListItem
                    sx={{
                      backgroundColor: getPriorityColor(msg.priority),
                      borderRadius: 2,
                      mb: 1,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <ListItemText
                      primary={msg.subject}
                      secondary={`Predicción: ${msg.predicted_quantity.toFixed(0)}    Cantidad actual en inventario: ${msg.quantity}`}
                    />
                    <IconButton
                      sx={{ color: getIconColor(msg.priority) }}
                      onClick={() => handleViewDetails(msg)}
                      aria-label="ver detalles"
                    >
                      <Visibility />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Box>
      </Container>

      <Dialog open={!!selectedAlert} onClose={() => setSelectedAlert(null)}>
        {selectedAlert && (
          <>
            <DialogTitle>{selectedAlert.subject}</DialogTitle>
            <DialogContent>
              <p>Prioridad: {selectedAlert.priority}</p>
              <p>Predicción: {selectedAlert.predicted_quantity.toFixed(2)}</p>
              <p>Inventario: {selectedAlert.quantity}</p>
              <p>Hora: {selectedAlert.time}</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleResolve(selectedAlert.id)} color="success">Resolver</Button>
              <Button onClick={() => handleDelete(selectedAlert.id)} color="error">Eliminar</Button>
              <Button onClick={() => setSelectedAlert(null)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default Alertas;
