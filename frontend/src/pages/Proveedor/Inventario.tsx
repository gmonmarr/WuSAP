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
  Table
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
import {
  TableRow,
  TableCell,
  TableRowAction,
  TableRowActionNavigation,
  TableHeaderRow,
  TableHeaderCell,
  TableHeaderCellActionAI,
  TableGrowing,
  TableSelection,
  TableVirtualizer,
  TableSelectionMulti,
  TableSelectionSingle,
} from '@ui5/webcomponents-react';


// Definir los atirbutos de producto
type Product = {
  name: string;
  supplier: string;
  dimensions: string;
  weight: string;
  price: string;
};

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
          width: "100%",
          flex: 1,
          padding: "2rem",
          gap: "2rem",
          height:"90%"
        }}
      >
        <Card
          header={
            <CardHeader titleText="Alertas de inventario" avatar={<Icon name={tableViewIcon} />} />
          }
          style={{
            flex: 1,
            maxWidth: "40%",
            maxHeight: "100%"
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
            maxWidth: "55%",
            maxHeight: "100%"
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
