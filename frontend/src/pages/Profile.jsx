import React from "react";
import { Avatar, Button, Grid, Typography, Paper } from "@mui/material";
import Navbar from "../components/Navbar";

const Profile = () => {
  return (
    <>
      <Navbar />
      <div> 
        <Grid container direction="column" alignItems="center" justifyContent="center" style={{ minHeight: "calc(100vh - 60px)", padding: "0 5%" }}>
          <Typography variant="h4" style={{ marginBottom: "1rem", textAlign: "center", fontWeight: "bold", color: "#3f51b5", margin: "2rem"}}>Perfil</Typography>
          
          <Grid container direction="row" alignItems="center" justifyContent="center">
              {/* Left Component */}
              <Paper elevation={6} style={{ padding: "2rem", marginRight: "2rem", textAlign: "center", width: "15.625rem", height: "15.625rem", borderRadius: "0.9375rem" }}>
                  <Avatar alt="User Profile Picture" src="/path/to/profile-pic.jpg" style={{ width: "6.25rem", height: "6.25rem", margin: "0 auto" }} />
                  <Typography variant="h5" style={{ marginTop: "1rem" }}>Danny Wu</Typography>
                  <Typography variant="body1" color="textSecondary">Proveedor</Typography>
              </Paper>

              {/* Right Component */}
              <Paper elevation={6} style={{ padding: "2rem", textAlign: "center", width: "31.25rem", height: "15.625rem", borderRadius: "0.9375rem" }}>
                  <Typography variant="h5" style={{ marginBottom: "1rem" }}>Datos de Contacto</Typography>
                  
                  <Grid container direction="row" alignItems="center" justifyContent="space-between" style={{ marginBottom: "1rem" }}>
                  <Typography variant="body1">Correo: dannywu@gmail.com</Typography>
                  <Button variant="outlined" style={{ backgroundColor: "black", border: "none", color: "white"}}>Editar</Button>
                  </Grid>
                  
                  <Grid container direction="row" alignItems="center" justifyContent="space-between" style={{ marginBottom: "1rem" }}>
                  <Typography variant="body1">Teléfono: (123) 456-7890</Typography>
                  <Button variant="outlined" style={{ backgroundColor: "black", border: "none", color: "white"}}>Editar</Button>
                  </Grid>
                  
                  <Grid container direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1">Sucursal: 123 Main St</Typography>
                  <Button variant="outlined" style={{ backgroundColor: "black", border: "none", color: "white"}}>Editar</Button>
                  </Grid>
              </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default Profile;
