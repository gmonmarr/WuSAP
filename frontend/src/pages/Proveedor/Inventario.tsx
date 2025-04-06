// pages/Proveedor/Inventario.tsx

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
} from "@ui5/webcomponents-react";
import { ThemingParameters } from "@ui5/webcomponents-react-base";
import { BarChart, ColumnChart, LineChart, PieChart } from "@ui5/webcomponents-react-charts";
import lineChartIcon from "@ui5/webcomponents-icons/dist/line-chart.js";
import pieChartIcon from "@ui5/webcomponents-icons/dist/pie-chart.js";
import barChartIcon from "@ui5/webcomponents-icons/dist/horizontal-bar-chart.js";
import addIcon from "@ui5/webcomponents-icons/dist/add.js";
import listIcon from "@ui5/webcomponents-icons/dist/list.js";
import tableViewIcon from "@ui5/webcomponents-icons/dist/table-view.js";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";

const dataset = [
  { month: "January", data: 65 },
  { month: "February", data: 59 },
  { month: "March", data: 80 },
  { month: "April", data: 81 },
  { month: "May", data: 56 },
  { month: "June", data: 55 },
  { month: "July", data: 40 },
];

const tableData = new Array(500).fill(null).map((_, index) => {
  return {
    product: `product${index}`,
    amount: Math.floor(Math.random() * 100),
    description: { product: `descripcion.product${index}`, amount: Math.floor(Math.random() * 100) },
  };
});

const tableColumns = [
  { Header: "Product", accessor: "product" },
  { Header: "Amount", accessor: "amount" },
  { Header: "Desc producto", accessor: "description.product" },
  { Header: "Desc cantidad", accessor: "description.amount" },
];

export function InventoryDashboard() {
  const [toggleCharts, setToggleCharts] = useState("lineChart");
  const [loading, setLoading] = useState(false);
  const handleHeaderClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToggleCharts((prev) => (prev === "lineChart" ? "barChart" : "lineChart"));
    }, 2000);
  };

  const switchToChart = toggleCharts === "lineChart" ? "Bar Chart" : "Line Chart";

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        padding: "0 3rem",
        boxSizing: "border-box",
      }}
    >
      {/* Navbar & Header */}
      <Navbar />
      <Header title={"Inventario"}/>


      {/* Row 1 */}
      <FlexBox
        direction={FlexBoxDirection.Row}
        justifyContent={FlexBoxJustifyContent.SpaceAround}
        wrap={FlexBoxWrap.Wrap}
        style={{
          flex: 1,
          width: "100%",
          padding: "2rem",
          height:"50%",
          gap: "2rem",
        }}
      >
        <Card
          header={
            <CardHeader
              titleText="Datos de ventas"
              subtitleText={`Click here to switch to ${switchToChart}`}
              interactive
              onClick={handleHeaderClick}
              avatar={<Icon name={toggleCharts === "lineChart" ? lineChartIcon : barChartIcon} />}
            />
          }
          style={{
            flex: 1,
            minWidth: "300px",
            maxHeight: "45vh",
          }}
        >
          {toggleCharts === "lineChart" ? (
            <LineChart
              dimensions={[{ accessor: "month" }]}
              measures={[{ accessor: "data", label: "Stock Price" }]}
              dataset={dataset}
              loading={loading}
              style={{ height:"35vh"}}
              chartConfig={{
                legendPosition: "bottom",
                margin: { top: 30, right: 30, bottom: 30, left: 30 },
              }}
            />
          ) : (
            <ColumnChart
              dimensions={[{ accessor: "month" }]}
              measures={[{ accessor: "data", label: "Stock Price" }]}
              dataset={dataset}
              loading={loading}
              style={{ height:"35vh"}}
              chartConfig={{
                legendPosition: "bottom",
                margin: { top: 30, right: 30, bottom: 30, left: 30 },
              }}
            />
          )}
        </Card>

        <Card
          header={<CardHeader titleText="Datos de ventas" avatar={<Icon name={pieChartIcon} />} />}
          style={{
            flex: 1,
            minWidth: "300px",
            maxHeight: "50vh", 
          }}
        >
          <PieChart
            dimension={{ accessor: "month" }}
            measure={{ accessor: "data" }}
            dataset={dataset}
            loading={loading}
            style={{ height:"35vh"}}
            chartConfig={{
              legendPosition: "bottom",
              paddingAngle: 2,
              innerRadius: "60%",
              margin: { top: 30, right: 30, bottom: 60, left: 30 },
            }}
          />
        </Card>
      </FlexBox>


      {/* Row 2 */}
      <FlexBox
        direction={FlexBoxDirection.Row}
        justifyContent={FlexBoxJustifyContent.SpaceAround}
        wrap={FlexBoxWrap.Wrap}
        style={{
          width: "100%",
          flex: 1,
          padding: "2rem",
          gap: "2rem",
          height:"50%"
        }}
      >
        <Card
          header={
            <CardHeader titleText="Alertas de inventario" avatar={<Icon name={tableViewIcon} />} />
          }
          style={{
            flex: 1,
            minWidth: "300px",
            maxHeight: "40vh"
          }}
        >
          <AnalyticalTable
            data={tableData}
            columns={tableColumns}
            style={{ 
              padding: "2rem",
              fontSize: "0.8rem",
              height: "100%",
              overflowY: "auto" }} 
          />
        </Card>

        <Card
          header={
            <CardHeader
      titleText="Productos más vendidos"
      avatar={<Icon name={tableViewIcon} />}
    />
          }
          style={{
            flex: 1,
            minWidth: "300px",
            maxHeight: "40vh"
          }}
        >
          <AnalyticalTable
            data={tableData}
            columns={tableColumns}
            style={{ 
              padding: "2rem",
              fontSize: "0.8rem",
              height: "100%",
              overflowY: "auto" }} 
          />
        </Card>
      </FlexBox>
    </div>
  );
}
