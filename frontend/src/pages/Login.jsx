// src/pages/Login.jsx

import React from "react";
import { TextField, Button, Checkbox, FormControlLabel, Typography, Paper, Grid } from "@mui/material";
import "../App.css";

const Login = () => {
  return (
    <Grid container className="app-background" alignItems="center" justifyContent="space-between" style={{ height: "100vh", backgroundColor: "#2C3E73", padding: "0 5%" }}>
      {/* Left Section */}
      {/* <Grid item xs={5} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
        <Typography variant="h1" fontWeight="bold">¡Bienvenido!</Typography>
        <Typography variant="h1" fontWeight="900" mt={2}>WuSAP</Typography>
      </Grid> */}

      <Grid item xs={5} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", paddingLeft: "10%" }}>
        <Typography variant="h1" fontWeight="bold" >¡Bienvenido!</Typography>
        <Typography variant="h1" fontWeight="900" mt={2} >WuSAP</Typography>
      </Grid>
      
      {/* Right Section */}
      <Paper elevation={6} style={{ borderRadius: 16, overflow: "hidden", width: "40%", maxWidth: "600px", padding: "6rem", backgroundColor: "white", minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h5" gutterBottom>Nombre de usuario</Typography>
        <TextField fullWidth variant="standard" />
        <Typography variant="h5" gutterBottom style={{ marginTop: "2rem" }}>Contraseña</Typography>
        <TextField fullWidth variant="standard" type="password" />
        <Button
          variant="contained"
          fullWidth
          style={{
            backgroundColor: "#2C3E73",
            color: "white",
            marginTop: "2.5rem",
            padding: "1rem",
            borderRadius: "50px",
            fontSize: "1.2rem",
          }}
        >
          Ingresar
        </Button>
        <FormControlLabel
          control={<Checkbox />}
          label={<Typography variant="body1" color="textSecondary">Mantenerme conectado</Typography>}
          style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}
        />
      </Paper>
    </Grid>
  );
};

export default Login;



/* Asi es para el registro
import React from "react";
import { TextField, Button, Checkbox, FormControlLabel, Typography, Paper, Grid } from "@mui/material";
import "../App.css";

const Login = () => {
  return (
    <Grid container className="app-background" alignItems="center" justifyContent="center" style={{ height: "100vh", backgroundColor: "#2C3E73" }}>
      <Grid item xs={10} md={5} lg={4}>
        <Paper elevation={6} style={{ padding: "3rem", borderRadius: 16, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="#2C3E73">¡Bienvenido!</Typography>
          <Typography variant="h3" fontWeight="900" mt={1} color="#2C3E73">
            WuSAP
          </Typography>
          <Typography variant="h6" gutterBottom mt={4} textAlign="left">Nombre de usuario</Typography>
          <TextField fullWidth variant="standard" />
          <Typography variant="h6" gutterBottom mt={2} textAlign="left">Contraseña</Typography>
          <TextField fullWidth variant="standard" type="password" />
          <Button
            variant="contained"
            fullWidth
            style={{
              backgroundColor: "#2C3E73",
              color: "white",
              marginTop: "2rem",
              padding: "0.8rem",
              borderRadius: "50px",
              fontSize: "1rem",
            }}
          >
            Ingresar
          </Button>
          <FormControlLabel
            control={<Checkbox />}
            label={<Typography variant="body2" color="textSecondary">Mantenerme conectado</Typography>}
            style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;
*/