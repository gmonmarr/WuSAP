import React, { useState } from "react";
import {
  List, ListItem, ListItemText, Divider, Container, Box, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Select, MenuItem, IconButton
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";

const initialMessages = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  priority: ["Alta", "Media", "Baja"][i % 3],
  subject: `Alerta ${i + 1}`,
  time: new Date(Date.now() - i * 60000).toLocaleTimeString(),
}));

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Alta": return "#ffcccc"; // Rojo claro
    case "Media": return "#fff4cc"; // Amarillo claro
    case "Baja": return "#D3D3D3"; // Gris claro
    default: return "#ffffff";
  }
};

const getIconColor = (priority) => {
  switch (priority) {
    case "Alta": return "#950606";  // Rojo oscuro
    case "Media": return "#8B8000"; // Amarrilo oscuro
    default: return "#A9A9A9";  // Gris oscuro
  }
};


const Alertas = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [priorityFilter, setPriorityFilter] = useState("Todos");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handlePriorityChange = (event) => setPriorityFilter(event.target.value);
  const handleSort = (order) => setSortOrder(order);
  const handleViewDetails = (alert) => setSelectedAlert(alert);
  const handleResolve = (id) => setMessages(messages.filter((msg) => msg.id !== id));
  const handleDelete = (id) => setMessages(messages.filter((msg) => msg.id !== id));

  const filteredMessages = messages
    .filter((msg) => priorityFilter === "Todos" || msg.priority === priorityFilter)
    .sort((a, b) => sortOrder === "Newest" ?  a.id - b.id : b.id - a.id);

  return (
    <>
      <Header title="Alertas" />
      <Navbar />
      <Container maxWidth="md">
        <Box display="flex" alignItems="center" gap={2} p={1}>
          {/* Dropdown for priority (left-aligned) */}
          <Select value={priorityFilter} onChange={handlePriorityChange} size="small">
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Media">Media</MenuItem>
            <MenuItem value="Baja">Baja</MenuItem>
          </Select>

          {/* Buttons for sorting (right-aligned) */}
          <Box display="flex" gap={1} flexGrow={1} justifyContent="flex-end">
            <Button variant={sortOrder === "Newest" ? "contained" : "outlined"} size="small" onClick={() => handleSort("Newest")}>
              Más Recientes
            </Button>
            <Button variant={sortOrder === "Oldest" ? "contained" : "outlined"} size="small" onClick={() => handleSort("Oldest")}>
              Más Antiguos
            </Button>
          </Box>
        </Box>

        {/* Scrollable Alert List */}
        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          <List>
            {filteredMessages.map((msg) => (
              <React.Fragment key={msg.id}>
                <ListItem sx={{ backgroundColor: getPriorityColor(msg.priority), borderRadius: 2, mb: 1, display: "flex", justifyContent: "space-between" }}>
                  <ListItemText primary={msg.subject} secondary={msg.time} />
                  <IconButton sx={{ color: getIconColor(msg.priority) }} onClick={() => handleViewDetails(msg)} >
                    <Visibility />
                  </IconButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Container>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onClose={() => setSelectedAlert(null)}>
        {selectedAlert && (
          <>
            <DialogTitle>{selectedAlert.subject}</DialogTitle>
            <DialogContent>
              <p>Prioridad: {selectedAlert.priority}</p>
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
