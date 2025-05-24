// pages/Profile.jsx

import React, { useState, useEffect } from "react";
import { Avatar, Button, Grid, Typography, Paper } from "@mui/material";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { authService } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  if (!user) {
    return (
      <>
        <Navbar />
        <Header title="Perfil" />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Typography variant="h6">Cargando información del usuario...</Typography>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Header title="Perfil" />
      <div> 
        <Grid container direction="column" alignItems="center" justifyContent="center" style={{ minHeight: "calc(80vh - 3.75rem)", padding: "0 0.3125rem" }}>
          <Grid container direction="row" alignItems="center" justifyContent="center">
            {/* Left Component */}
            <Paper elevation={6} style={{ padding: "2rem", marginRight: "2rem", textAlign: "center", width: "15.625rem", height: "15.625rem", borderRadius: "0.9375rem" }}>
              <Avatar 
                alt={`${user.name} ${user.lastName}`} 
                style={{ 
                  width: "6.25rem", 
                  height: "6.25rem", 
                  margin: "0 auto",
                  backgroundColor: "#2C3E73",
                  fontSize: "2rem"
                }}
              >
                {user.name.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
              <Typography variant="h5" style={{ marginTop: "1rem" }}>
                {user.name} {user.lastName}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user.role}
              </Typography>
            </Paper>
            {/* Right Component */}
            <Paper elevation={6} style={{ padding: "2rem", textAlign: "center", width: "31.25rem", height: "15.625rem", borderRadius: "0.9375rem" }}>
              <Typography variant="h5" style={{ marginBottom: "1rem" }}>Datos de Contacto</Typography>
              <Grid container direction="row" alignItems="center" justifyContent="space-between" style={{ marginBottom: "1rem" }}>
                <Typography variant="body1">Correo: {user.email}</Typography>
                <Button variant="outlined" style={{ backgroundColor: "black", border: "none", color: "white" }}>Editar</Button>
              </Grid>
              <Grid container direction="row" alignItems="center" justifyContent="space-between" style={{ marginBottom: "1rem" }}>
                <Typography variant="body1">Teléfono: {user.cellphone || 'No especificado'}</Typography>
                <Button variant="outlined" style={{ backgroundColor: "black", border: "none", color: "white" }}>Editar</Button>
              </Grid>
              <Grid container direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body1">Rol: {user.role}</Typography>
                <Button variant="outlined" style={{ backgroundColor: "black", border: "none", color: "white" }}>Editar</Button>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default Profile;