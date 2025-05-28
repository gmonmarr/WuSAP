// src/pages/Login.jsx

import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Grid,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "../App.css";
import { authService } from "../services/api.js";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: "24px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
}));

// eslint-disable-next-line no-unused-vars
const StyledTextField = styled(TextField)(({ theme }) => ({
  // `theme` is not used here, but required for future styling if needed
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 1)",
    },
  },
}));

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({ email: false, password: false });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rememberMe" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: false })); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    const newErrors = {
      email: formData.email.trim() === "",
      password: formData.password.trim() === "",
    };
    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      return alert("El correo y/o contraseña no pueden estar vacíos.");
    }

    try {
      const result = await authService.login(formData.email, formData.password);
      console.log("Login response:", result);

      if (result && result.success) {
        // El token ya ha sido guardado por el servicio de autenticación
        console.log("Inicio de sesión exitoso, redirigiendo...");
        navigate("/tablero");
      } else {
        alert(result.message || "Credenciales incorrectas.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || 
                           "Error al iniciar sesión. Intenta de nuevo.";
      alert(errorMessage);
    }
  };

  return (
    <Grid 
      container 
      className="app-background" 
      alignItems="center" 
      justifyContent="center" 
      sx={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #2C3E73 0%, #3498db 100%)",
        padding: { xs: 2, sm: 4 },
      }}
    >
      <Grid item xs={12} md={10} lg={8}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Section - Welcome Text */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              textAlign: { xs: "center", md: "left" }, 
              mb: { xs: 4, md: 0 },
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}>
              <Box sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                position: "relative",
                textAlign: { xs: "center", md: "left" },
                alignItems: { xs: "center", md: "flex-start" },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-1rem",
                  left: { xs: "50%", md: "0" },
                  transform: { xs: "translateX(-50%)", md: "none" },
                  width: "80px",
                  height: "4px",
                  background: "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)",
                  borderRadius: "2px"
                }
              }}>
                <Typography 
                  variant="h2" 
                  color="white"
                  sx={{ 
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    width: "100%",
                    textAlign: "inherit"
                  }}
                >
                  ¡Bienvenido!
                </Typography>
                <Typography 
                  variant="h1"
                  color="white"
                  sx={{ 
                    fontSize: { xs: "3.5rem", md: "5rem" },
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    width: "100%",
                    textAlign: "inherit"
                  }}
                >
                  WuSAP
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                color="white" 
                sx={{ 
                  mt: 4,
                  opacity: 0.9,
                  maxWidth: "400px",
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  fontWeight: 400,
                  lineHeight: 1.6,
                  letterSpacing: "0.01em"
                }}
              >
                Tu solución integral para la gestión de pedidos y producción
              </Typography>
            </Box>
          </Grid>

          {/* Right Section - Login Form */}
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  color: "#2C3E73",
                  mb: 4,
                  textAlign: "center"
                }}
              >
                Iniciar Sesión
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <StyledTextField
                  fullWidth
                  label="Correo electrónico"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  error={errors.email}
                  helperText={errors.email && "Este campo no puede estar vacío"}
                  sx={{ mb: 3 }}
                />
                
                <StyledTextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  error={errors.password}
                  helperText={errors.password && "Este campo no puede estar vacío"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <FormControlLabel
                  control={
                    <Checkbox 
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="textSecondary">
                      Mantenerme conectado
                    </Typography>
                  }
                  sx={{ mb: 4 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: "#2C3E73",
                    color: "white",
                    py: 1.5,
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#1a263d",
                    },
                  }}
                >
                  Ingresar
                </Button>
              </form>
            </StyledPaper>
          </Grid>
        </Grid>
      </Grid>
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

// Removed duplicate export default Login;
*/