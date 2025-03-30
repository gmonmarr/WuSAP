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
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
            }}
        >
            <Navbar />
            <Header title={"Tablero"} />

       {/* COLUMNA GENERAL QUE CUBRE TODA LA PANTALLA - apoyo para subsecciones */}
        <FlexBox
        direction={FlexBoxDirection.Row}
        justifyContent={FlexBoxJustifyContent.SpaceAround}
        style={{
            width: "100%",
            height: "95%",
            gap: "1rem",
            padding: "1rem"
        }}>
            
        {/* COLUMNA GENERAL IZQUIERDA - (2 rows, primera dos columnas, segunda el resto una columna) */}
            <FlexBox
                direction={FlexBoxDirection.Column}
                justifyContent={FlexBoxJustifyContent.SpaceAround}
                style={{
                    width: "30%",
                    height: "100%", 
                    padding: "0.5rem"
                }}>

                {/* ROW 1 - DOS BOTONES */}
                <FlexBox
                    direction={FlexBoxDirection.Row}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                        width: "100%",
                        height: "15%",
                        gap: "1rem",
                    }}
                >
                    <FlexBox direction={FlexBoxDirection.Column}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                        width: "50%",
                        height: "100%",
                    }} 
                    >
                    
                    <Button design="Default">Inventario</Button>
                    <Button design="Default">Seguimiento</Button>
                    </FlexBox>

                    <FlexBox direction={FlexBoxDirection.Column}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                        width: "50%",
                        height: "100%", 
                    }} 
                    >
                    <Button design="Negative" style={{minHeight: "75px"}}>{alertCount} Alertas</Button>
                    </FlexBox>
                    
                    

                </FlexBox>
            
                {/* ROW 2- 1 columna con el resto del espacio */}
                <FlexBox
                    direction={FlexBoxDirection.Column}
                    justifyContent={FlexBoxJustifyContent.SpaceAround}
                    style={{
                    width: "100%",
                    height: "85%", 
                    paddingTop: "1rem",
                    }}
                >
                    
                        <Card 
                            header={<CardHeader titleText="Ciclo de tiempo de pedido" />}
                            
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                            >
                                <BarChart 
                                 dimensions={[{ accessor: "month" }]}
                                 measures={[{ accessor: "data", label: "Stock Price"}]}
                                 dataset={dataset}
                                 chartConfig={{
                                    legendPosition: "bottom",
                                    
                                  }}
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
                    padding: "0.5rem"
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
                    }}
                    >
                        <LineChart
                                  dimensions={[{ accessor: "month" }]}
                                  measures={[{ accessor: "data", label: "Stock Price"}]}
                                  dataset={dataset}
                                  style={{
                                    height: "200px",
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
                            }}
                            >
                            <DonutChart
                                dimension={{ accessor: "month" }}
                                measure={{ accessor: "data" }}
                                dataset={dataset}
                                style={{
                                height: "220px", 
                                fontSize: "8px"
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
                    paddingTop: "1rem",
                    }}
                >
                    <Card
                    header={<CardHeader titleText="Tasa de entrega a tiempo" />}
                    style={{
                        width: "100%",
                        height: "100%",
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
                                    height: "180px", 
                                  }}
                                />
                    </Card>
                    
                </FlexBox>
          </FlexBox>
          </FlexBox>
    
        </div>
      );
    }