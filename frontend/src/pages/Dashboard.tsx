// pages/Dashboard.tsx
import React from "react";
import {
  Card,
  CardHeader,
  FlexBox,
  FlexBoxJustifyContent,
  FlexBoxDirection,
  Button,
} from "@ui5/webcomponents-react";
import { BarChart, ColumnChart, DonutChart, LineChart, PieChart } from "@ui5/webcomponents-react-charts";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import "@ui5/webcomponents/dist/Button.js";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { dashboardService, authService, predictionsService } from "../services/api";


// Formatear datos para gráficos
const formatChartData = (salesTimeline) => {
  if (!salesTimeline || salesTimeline.length === 0) {
    return [
      { day: "Sin datos", sales: 0, transactions: 0 }
    ];
  }
  
  return salesTimeline.slice(0, 7).reverse().map(item => ({
    day: new Date(item.SALEDAY).toLocaleDateString('es-ES', { weekday: 'short' }),
    sales: parseFloat(item.DAILYSALES || 0),
    transactions: parseInt(item.DAILYTRANSACTIONS || 0)
  }));
};

// Formatear datos de productos para gráfica de donut
const formatProductsData = (topProducts) => {
  if (!topProducts || topProducts.length === 0) {
    return [{ product: "Sin datos", quantity: 1 }];
  }
  
  return topProducts.slice(0, 5).map(item => ({
    product: item.PRODUCTNAME,
    quantity: parseFloat(item.TOTALQUANTITYSOLD || 0)
  }));
};

interface DashboardData {
  kpis: {
    totalSales: number;
    pendingOrders: number;
    lowStockProducts: number;
    activeEmployees: number;
    avgTicket: number;
  };
  employees: Array<{
    employeeID: number;
    name: string;
    lastname: string;
    role: string;
    totalSales: number;
    salesCount: number;
    avgSale: number;
  }>;
  topProducts: Array<{
    PRODUCTNAME: string;
    TOTALQUANTITYSOLD: number;
  }>;
  salesTimeline: Array<{
    SALEDAY: string;
    DAILYSALES: number;
    DAILYTRANSACTIONS: number;
  }>;
  ordersStatus: Array<{
    STATUS: string;
    ORDERCOUNT: number;
  }>;
}

export function DashboardGeneral() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        console.log('Loading dashboard data...');
        
        // Verificar si hay un token válido antes de hacer las peticiones
        const token = authService.getToken();
        if (!token) {
          setError("No hay token de autenticación. Por favor, inicia sesión nuevamente.");
          return;
        }

        // Cargar datos del dashboard y predicciones en paralelo
        const [dashboardResponse, predictionsResponse] = await Promise.all([
          dashboardService.getDashboardData(),
          predictionsService.getPredictions()
        ]);

        console.log('Dashboard response:', dashboardResponse);
        console.log('Predictions response:', predictionsResponse);

        if (dashboardResponse.data.success) {
          console.log('Dashboard data received:', dashboardResponse.data.data);
          setDashboardData(dashboardResponse.data.data);
        }

        if (predictionsResponse.data.success && Array.isArray(predictionsResponse.data.alerts)) {
          setAlerts(predictionsResponse.data.alerts);
        } else if (predictionsResponse.data.message) {
          console.error('Predictions API error:', predictionsResponse.data.message);
          setError(`Error en predicciones: ${predictionsResponse.data.message}`);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        
        // Si es un error de autenticación, redirigir al login
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.log('Token expirado o inválido, redirigiendo al login...');
          authService.logout(); // Limpiar datos locales
          navigate('/');
          return;
        }
        
        setError(err.message || 'Error al cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleClick = () => {
    navigate("/alertas", { state: { alerts } });
  };

  const handleInventoryClick = () => {
    navigate("/productos-sucursal");
  };

  const handleTrackingClick = () => {
    navigate("/orden-status");
  };

  // Si está cargando o hay error, mostrar mensaje
  if (loading) {
    return (
      <div style={{ height: "100vh", padding: "0 3rem" }}>
        <Navbar />
        <Header title={"Tablero"} />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Datos formateados para gráficas
  const formatEmployeesData = (employeesData) => {
    console.log('Formatting employees data:', employeesData);
    
    if (!employeesData || employeesData.length === 0) {
      console.log('No employee data available');
      return [{ employee: "Sin datos", sales: 0 }];
    }
    
    const formatted = employeesData.slice(0, 7).map(emp => {
      console.log('Processing employee:', emp);
      
      // Crear nombre completo
      const fullName = `${emp.name || emp.NAME || ''} ${emp.lastname || emp.LASTNAME || ''}`.trim();
      const employeeName = fullName || `Empleado #${emp.employeeID || emp.EMPLOYEEID}`;
      
      // Agregar rol si está disponible
      const role = emp.role || emp.ROLE;
      const displayName = role ? `${employeeName} (${role})` : employeeName;
      
      const formattedEmp = {
        employee: displayName,
        sales: parseFloat(emp.totalSales || emp.TOTALSALES || 0)
      };
      
      console.log('Formatted employee:', formattedEmp);
      return formattedEmp;
    });
    
    console.log('Final formatted employees:', formatted);
    return formatted;
  };

  const formatOrdersData = (ordersData) => {
    if (!ordersData || ordersData.length === 0) {
      return [
        { status: "Pendientes", value: 0 },
        { status: "Aprobadas", value: 0 },
        { status: "Entregadas", value: 0 },
        { status: "Canceladas", value: 0 }
      ];
    }
    
    // Agrupar por estado usando los estados en español
    const pendientes = ordersData.find(o => o.STATUS === 'Pendiente');
    const aprobadas = ordersData.find(o => o.STATUS === 'Aprobada');
    const confirmadas = ordersData.find(o => o.STATUS === 'Confirmada');
    const entregadas = ordersData.find(o => o.STATUS === 'Entregada');
    const canceladas = ordersData.find(o => o.STATUS === 'Cancelada');
    
    return [
      { status: "Pendientes", value: parseInt(pendientes?.ORDERCOUNT || 0) },
      { status: "Aprobadas", value: parseInt(aprobadas?.ORDERCOUNT || 0) },
      { status: "Entregadas", value: parseInt((entregadas?.ORDERCOUNT || 0) + (confirmadas?.ORDERCOUNT || 0)) },
      { status: "Canceladas", value: parseInt(canceladas?.ORDERCOUNT || 0) }
    ];
  };

  const getKPIValue = (title, kpis) => {
    if (!kpis) return "Cargando...";
    
    switch (title) {
      case "Ventas Totales": return "$" + (kpis.totalSales || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
      case "Órdenes Pendientes": return kpis.pendingOrders || 0;
      case "Productos Bajo Stock": return kpis.lowStockProducts || 0;
      case "Empleados Activos": return kpis.activeEmployees || 0;
      case "Ticket Promedio": return "$" + (kpis.avgTicket || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
      default: return "N/A";
    }
  };

  {error && (
  <p style={{ color: "red", marginBottom: "1rem" }}>
    Error al cargar alertas: {error}
  </p>
)}
    return (
 
        <div 
        style={{
            height: "100vh",
            overflowY: "auto",
            padding: "0 3rem",
            boxSizing: "border-box",
          }}
        >
            <Navbar />
            <Header title={"Tablero"} />
            

       {/* COLUMNA GENERAL QUE CUBRE TODA LA PANTALLA - apoyo para subsecciones */}
        <FlexBox
        direction={FlexBoxDirection.Row}
        justifyContent={FlexBoxJustifyContent.SpaceBetween}
        style={{
            width: "100%",
            height: "90vh",
            padding: "0.5rem",
            marginBottom:"3rem"
        }}>
            
        {/* COLUMNA GENERAL IZQUIERDA - (2 rows, primera dos columnas, segunda el resto una columna) */}
            <FlexBox
                direction={FlexBoxDirection.Column}
                justifyContent={FlexBoxJustifyContent.Start}
                style={{
                    width: "30%",
                    height: "100%", 
                    paddingRight: "0.5rem"
                }}>

                {/* ROW 1 - DOS BOTONES */}
                <FlexBox
                    direction={FlexBoxDirection.Row}
                    justifyContent={FlexBoxJustifyContent.Start}
                    style={{
                        width: "100%",
                        height: "auto",
                        marginBottom: "1rem"
                    }}
                >
                    <FlexBox direction={FlexBoxDirection.Row}
                    style={{
                        width: "100%",
                        height:"80%",
                        gap: "1rem",
                    }} 
                    >
                        <Button 
                            design="Transparent" 
                            onClick={handleInventoryClick}
                            style={{
                                width: "100%",
                                height: "48px",
                                border: "1px solid #e5e5e5",
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                                fontWeight: "normal",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                cursor: "pointer"
                            }}
                        >
                            Inventario
                        </Button>
                        
                        <Button 
                            design="Transparent" 
                            onClick={handleTrackingClick}
                            style={{
                                width: "100%",
                                height: "48px",
                                border: "1px solid #e5e5e5",
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                                fontWeight: "normal",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                cursor: "pointer"
                            }}
                        >
                            Seguimiento
                        </Button>
                    </FlexBox>
                </FlexBox>

                {/* ROW 1.5 - ALERTS */}
                <FlexBox
                    direction={FlexBoxDirection.Row}
                    justifyContent={FlexBoxJustifyContent.Start}
                    style={{
                        width: "100%",
                        height: "auto",
                        marginBottom: "1rem"
                    }}
                >
                    <Button 
                    design="Negative" 
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "4px",
                      fontWeight: "normal",
                      backgroundColor: "#fff0f0",
                      color: "#d32f2f",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}
                    onClick={handleClick}
                    disabled={loading}
                  >
                    {loading ? "Cargando alertas..." : `${alerts.length} Alertas`}
                  </Button>

                </FlexBox>
            
                {/* ROW 2- 1 columna con el resto del espacio */}
                <FlexBox
                    direction={FlexBoxDirection.Column}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                    width: "100%",
                    height: "80%", 
                    }}
                >
                    
                    <Card 
                        header={<CardHeader titleText="Ventas por Empleado" />}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "16px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            border: "1px solid #e5e5e5",
                        }}
                        >
                            <BarChart 
                                dimensions={[{ accessor: "employee" }]}
                                measures={[{ accessor: "sales", label: "Ventas ($)", color: "#1976d2"}]}
                                dataset={formatEmployeesData(dashboardData?.employees)}
                                chartConfig={{
                                legendPosition: "bottom",
                                }}
                                style={{height:"60vh"}}
                                />
                                
                    </Card>
                </FlexBox>
          </FlexBox>

           {/* COLUMNA GENERAL DERECHA - (3 rows, primera kpis, segunda dos columnas, tercera el resto una columna) */}
           <FlexBox
                direction={FlexBoxDirection.Column}
                justifyContent={FlexBoxJustifyContent.SpaceAround}
                style={{
                    width: "70%",
                    height: "100%", 
                    //gap: "1rem",
                    paddingLeft: "1rem"
                }}>

                {/* Row 1:  5 columnas kpis*/}
                {/* ROW 1 - 5 kpis */}
                <FlexBox
                    direction={FlexBoxDirection.Row}
                    justifyContent={FlexBoxJustifyContent.Start}
                    style={{
                        width: "100%",
                        marginBottom: "1rem",
                        height:"auto"
                    }}
                    >
                    <FlexBox
                        direction={FlexBoxDirection.Row}
                        style={{
                        width: "100%",
                        gap: "1rem",
                        height: "auto", 
                        textAlign: "center",
                        }}
                    >
                        {[
                          "Ventas Totales",
                          "Órdenes Pendientes", 
                          "Productos Bajo Stock",
                          "Empleados Activos",
                          "Ticket Promedio",
                        ].map((title, index) => {
                          const cardColors = [
                            "#e3f2fd", // Azul muy claro para ventas
                            "#bbdefb", // Azul claro para órdenes pendientes
                            "#90caf9", // Azul medio claro para productos bajo stock
                            "#64b5f6", // Azul medio para empleados
                            "#42a5f5"  // Azul para ticket promedio
                          ];
                          const textColors = [
                            "#0d47a1", // Azul muy oscuro
                            "#1565c0", // Azul oscuro
                            "#1976d2", // Azul medio oscuro
                            "#1e88e5", // Azul medio
                            "#2196f3"  // Azul estándar
                          ];
                          
                          return (
                        <Card
                            key={title}
                            header={<CardHeader titleText={title} />}
                            style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column", 
                            height: "100%",
                            borderRadius: "16px",
                            textAlign:"center",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            border: "1px solid #e5e5e5",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: cardColors[index],
                            }}
                        >
                            <div style={{ fontSize: "1.2rem", padding:"0.5rem", fontWeight: "bold", color: textColors[index] }}>
                                {getKPIValue(title, dashboardData?.kpis)}
                            </div>
                            
                        </Card>
                        );
                        })}
                    </FlexBox>
                    </FlexBox>



                {/* Row 2: 2 columnas */}
                <FlexBox
                    direction={FlexBoxDirection.Row}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                        width: "100%",
                        height: "40%", 
                        gap: "1rem",
                        marginBottom: "1rem"
                    }}
                >
                    <Card 
                    header={<CardHeader titleText="Ventas Diarias (Últimos 7 Días)" />}
                    style={{
                        width: "65%",
                        height: "100%",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        border: "1px solid #e5e5e5",
                    }}
                    >
                        <LineChart
                            dimensions={[{ accessor: "day" }]}
                            measures={[{ accessor: "sales", label: "Ventas Diarias ($)", color: "#2196f3"}]}
                            dataset={formatChartData(dashboardData?.salesTimeline)}
                            style={{
                                height: "30vh",
                            }}
                            chartConfig={{
                                legendPosition: "top",
                            }}
                            />
                    </Card>
                    
                    { /* ROW 2 primera columna */}
                    <FlexBox 
                        direction={FlexBoxDirection.Column}
                        justifyContent={FlexBoxJustifyContent.SpaceAround}
                        style={{
                            width: "35%",
                            height: "100%",
                        }} >
                            <Card
                            header={<CardHeader titleText="Productos Más Vendidos" />}
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "16px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                border: "1px solid #e5e5e5",
                            }}
                            >
                            <DonutChart
                                dimension={{ accessor: "product" }}
                                measure={{ accessor: "quantity", colors: ["#0d47a1", "#1565c0", "#1976d2", "#1e88e5", "#2196f3"] }}
                                dataset={formatProductsData(dashboardData?.topProducts)}
                                style={{ height:"30vh", fontSize:"0.5rem"}}
                                chartConfig={{
                                legendPosition: "bottom",
                                innerRadius: "50%",
                                }}
                            />
                        </Card>
                    </FlexBox>
                </FlexBox>
            
                {/* Row 3: Card fills the rest */}
                <FlexBox
                    direction={FlexBoxDirection.Column}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                    width: "100%",
                    height: "35%", 
                    }}
                >
                    <Card
                    header={<CardHeader titleText="Estado de Órdenes" />}
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        border: "1px solid #e5e5e5",
                        
                    }}
                    >
                        <ColumnChart
                            dimensions={[{ accessor: "status" }]}
                            measures={[{ accessor: "value", label: "Cantidad de Órdenes", color: "#42a5f5" }]}
                            dataset={formatOrdersData(dashboardData?.ordersStatus)}
                            style={{
                                height: "25vh", 
                            }}
                            chartConfig={{
                                legendPosition: "top",
                            }}
                            />
                    </Card>
                </FlexBox>
          </FlexBox>
          </FlexBox>
    
        </div>
      );
    }