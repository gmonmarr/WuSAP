// pages/Dashboard.tsx
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

const dataset = [
    { month: "January", data: 65, data2: 120},
    { month: "February", data: 59, data2: 120 },
    { month: "March", data: 80, data2: 120 },
    { month: "April", data: 81, data2: 120 },
    { month: "May", data: 56, data2: 120 },
    { month: "June", data: 55, data2: 120 },
    { month: "July", data: 40, data2: 120 },
  ];

const alertCount = [1];

const calculatePercentage = (title) => {
  switch (title) {
    case "Ciclo de tiempo de pedido":
      return (Math.random() * 30 + 50).toFixed(2) + "%"; // Example formula
    case "Tasa de entrega a tiempo":
      return (Math.random() * 10 + 85).toFixed(2) + "%";
    case "Rotación de inventario":
      return (Math.random() * 40 + 20).toFixed(2) + "%";
    case "Tiempo de ciclo de aprobación de compras":
      return (Math.random() * 20 + 60).toFixed(2) + "%";
    case "Tasa de cumplimiento de proveedores":
      return (Math.random() * 15 + 80).toFixed(2) + "%";
    default:
      return "N/A";
  }
};

export function DashboardGeneral() {
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
                            style={{
                                width: "100%",
                                height: "48px",
                                border: "1px solid #e5e5e5",
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                                fontWeight: "normal",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                        >
                            Inventario
                        </Button>
                        
                        <Button 
                            design="Transparent" 
                            style={{
                                width: "100%",
                                height: "48px",
                                border: "1px solid #e5e5e5",
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                                fontWeight: "normal",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
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
                    >
                        {alertCount} Alertas
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
                        header={<CardHeader titleText="Ciclo de tiempo de pedido" />}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "16px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            border: "1px solid #e5e5e5",
                        }}
                        >
                            <BarChart 
                                dimensions={[{ accessor: "month" }]}
                                measures={[{ accessor: "data", label: "Stock Price"}]}
                                dataset={dataset}
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
                        "Ciclo de tiempo de pedido",
                        "Tasa de entrega a tiempo",
                        "Rotación de inventario",
                        "Tiempo de ciclo de aprobación de compras",
                        "Tasa de cumplimiento de proveedores",
                        ].map((title) => (
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
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            border: "1px solid #e5e5e5",
                            alignItems: "center", // Center align content
                            justifyContent: "space-between", // Ensure even spacing
                            }}
                        >
                            <div style={{ fontSize: "1rem", padding:"0.5rem"}}>
                                {calculatePercentage(title)}
                            </div>
                            
                        </Card>
                        ))}
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
                    header={<CardHeader titleText="Ciclo de tiempo de pedido" />}
                    style={{
                        width: "65%",
                        height: "100%",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        border: "1px solid #e5e5e5",
                    }}
                    >
                        <LineChart
                            dimensions={[{ accessor: "month" }]}
                            measures={[{ accessor: "data", label: "Stock Price"}]}
                            dataset={dataset}
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
                            header={<CardHeader titleText="Tasa de cumplimiento de proveedores" />}
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "16px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                border: "1px solid #e5e5e5",
                            }}
                            >
                            <DonutChart
                                dimension={{ accessor: "month" }}
                                measure={{ accessor: "data" }}
                                dataset={dataset}
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
                    header={<CardHeader titleText="Tasa de entrega a tiempo" />}
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        border: "1px solid #e5e5e5",
                        
                    }}
                    >
                        <ColumnChart
                            dimensions={[{ accessor: "month" }]}
                            measures={[
                                { accessor: "data", label: "Stock Price - Set 1" },
                                { accessor: "data2", label: "Stock Price - Set 2" }
                            ]}
                            dataset={dataset}
                            style={{
                                height: "25vh", 
                            }}
                            />
                    </Card>
                </FlexBox>
          </FlexBox>
          </FlexBox>
    
        </div>
      );
    }