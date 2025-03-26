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
    name: `name${index}`,
    age: Math.floor(Math.random() * 100),
    friend: { name: `friend.Name${index}`, age: Math.floor(Math.random() * 100) },
  };
});

const tableColumns = [
  { Header: "Name", accessor: "name" },
  { Header: "Age", accessor: "age" },
  { Header: "Friend Name", accessor: "friend.name" },
  { Header: "Friend Age", accessor: "friend.age" },
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "true",
        paddingLeft:"2rem",
        paddingRight:"2rem",
        paddingBottom: "2rem"
      }}
    >
      <Navbar />
      <Header title="Inventario" />
      <FlexBox
        direction={FlexBoxDirection.Row}
        justifyContent={FlexBoxJustifyContent.SpaceAround}
        wrap={FlexBoxWrap.Wrap}
        style={{
          width: "100%",
          height: "40%", // Each row takes up half the viewport
          padding: "1rem",
        }}
      >
        {/* Row 1 */}
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
            height: "100%",
            width: "45%",
          }}
        >
          
          {toggleCharts === "lineChart" ? (
            <LineChart
              dimensions={[{ accessor: "month" }]}
              measures={[{ accessor: "data", label: "Stock Price" }]}
              dataset={dataset}
              loading={loading}
              style={{
                height: "150px", // Smaller chart height
              }}
            />
          ) : (
            <ColumnChart
              dimensions={[{ accessor: "month" }]}
              measures={[{ accessor: "data", label: "Stock Price" }]}
              dataset={dataset}
              loading={loading}
              chartConfig={{
                legendPosition: "top", // Move labels to the right
              }}
              
              style={{
                height: "150px", // Smaller chart height
              }}
            />
          )}
        </Card>
        <Card
          header={
          <CardHeader titleText="Datos de ventas"  avatar={<Icon name={pieChartIcon} />}/>}
          style={{
            width: "45%", // Set to 100% to utilize the full width of the container
            height: "100%",
          }}
        >
          <PieChart
            dimension={{ accessor: "month" }}
            measure={{ accessor: "data" }}
            dataset={dataset}
            loading={loading}
            style={{
              height: "160px", // Smaller chart height
            }}
          />
        </Card>
      </FlexBox>

      <FlexBox
        direction={FlexBoxDirection.Row}
        justifyContent={FlexBoxJustifyContent.SpaceAround}
        wrap={FlexBoxWrap.Wrap}
        style={{
          width: "100%",
          height: "45%",
          padding: "1rem",
        }}
      >
        {/* Row 2 */}
        <Card
          header={
            <CardHeader
              titleText="Alertas de inventario"
              avatar={<Icon name={tableViewIcon} />}
            />
          }
          style={{
            width: "45%",
            height: "100%",
          }}
        >
          <AnalyticalTable
            data={tableData}
            columns={tableColumns}
            visibleRows={4}
            style={{ padding: "10px", fontSize: "0.8rem", maxHeight: "300px", overflowY: "auto" }}
            className="sticky-table"
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
            width: "45%",
            height: "100%",
          }}
        >
          <AnalyticalTable
            data={tableData}
            columns={tableColumns}
            visibleRows={4}
            style={{ padding: "10px", fontSize: "0.8rem" }} // Smaller font size
            className="custom-table"
          />
        </Card>
      </FlexBox>
    </div>
  );
}

