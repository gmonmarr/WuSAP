// pages/Dashboard.tsx

import React, { useState } from "react";
import {
  Avatar,
  Card,
  CardHeader,
  Text,
  ShellBar,
  ShellBarItem,
  List,
  ListItemCustom,
  ListItemStandard,
  ProgressIndicator,
  FlexBox,
  FlexBoxJustifyContent,
  FlexBoxWrap,
  FlexBoxDirection,
  AnalyticalTable,
  Icon,
  VerticalAlign,
  Button,
} from "@ui5/webcomponents-react";
import { ThemingParameters } from "@ui5/webcomponents-react-base";
import { BarChart, ColumnChart, DonutChart, LineChart, PieChart } from "@ui5/webcomponents-react-charts";
import lineChartIcon from "@ui5/webcomponents-icons/dist/line-chart.js";
import pieChartIcon from "@ui5/webcomponents-icons/dist/pie-chart.js";
import barChartIcon from "@ui5/webcomponents-icons/dist/horizontal-bar-chart.js";
import addIcon from "@ui5/webcomponents-icons/dist/add.js";
import listIcon from "@ui5/webcomponents-icons/dist/list.js";
import tableViewIcon from "@ui5/webcomponents-icons/dist/table-view.js";
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
            padding: "0.5rem"
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
                    height: "85%", 
                    }}
                >
                    
                    <Card 
                        header={<CardHeader titleText="Ciclo de tiempo de pedido" />}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "8px",
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

           {/* COLUMNA GENERAL DERECHA - (2 rows, primera dos columnas, segunda el resto una columna) */}
           <FlexBox
                direction={FlexBoxDirection.Column}
                justifyContent={FlexBoxJustifyContent.SpaceAround}
                style={{
                    width: "70%",
                    height: "100%", 
                    gap: "1rem",
                    paddingLeft: "1rem"
                }}>

                {/* Row 1: 2 columnas */}
                <FlexBox
                    direction={FlexBoxDirection.Row}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                        width: "100%",
                        height: "50%", 
                        gap: "1rem",
                    }}
                >
                    <Card 
                    header={<CardHeader titleText="Ciclo de tiempo de pedido" />}
                    style={{
                        width: "65%",
                        height: "100%",
                        borderRadius: "8px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        border: "1px solid #e5e5e5",
                    }}
                    >
                        <LineChart
                            dimensions={[{ accessor: "month" }]}
                            measures={[{ accessor: "data", label: "Stock Price"}]}
                            dataset={dataset}
                            style={{
                                height: "35vh",
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
                                borderRadius: "8px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                border: "1px solid #e5e5e5",
                            }}
                            >
                            <DonutChart
                                dimension={{ accessor: "month" }}
                                measure={{ accessor: "data" }}
                                dataset={dataset}
                                style={{ height:"35vh", fontSize:"0.5rem"}}
                                chartConfig={{
                                legendPosition: "bottom",
                                innerRadius: "50%",
                                }}
                            />
                        </Card>
                    </FlexBox>
                </FlexBox>
            
                {/* Row 2: Card fills the rest */}
                <FlexBox
                    direction={FlexBoxDirection.Column}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                    width: "100%",
                    height: "45%", 
                    }}
                >
                    <Card
                    header={<CardHeader titleText="Tasa de entrega a tiempo" />}
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
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
                                height: "30vh", 
                            }}
                            />
                    </Card>
                </FlexBox>
          </FlexBox>
          </FlexBox>
    
        </div>
      );
    }