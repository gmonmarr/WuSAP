// pages\ListaProductos.tsx
// Permite ver los todos productos actuales como si fuera catálogo

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  Text,
  Button,
  Icon,
  Dialog,
  Input,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/navigation-left-arrow.js";
import "@ui5/webcomponents-icons/dist/navigation-right-arrow.js";
import Navbar from "../components/Navbar";
import Header from "../components/Header";

// CONSTANTES - DATOS
const PRODUCTS_PER_PAGE = 12;
const exampleImage =
  "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRYUOqYNSZQAZOiJeq_VGTHquzkJ3l3Agm0ALkqu89rKA08bo-tUeF_N97KTguaw4IZ2r1kLKBDY-ikXw_7YPc-Sj8d2pu1E4IQXvvz_Ozz9v33puxfCq2GqQdKvP-nVOpwBv4rGgA&usqp=CAc";

type Product = {
  id: number;
  name: string;
  image: string;
  quantity: number;
  barCode: string;
};

// Info de productos
const products: Product[] = Array.from({ length: 27 }, (_, index) => ({
  id: index + 1,
  name: `Producto ${index + 1}`,
  image: exampleImage,
  quantity: Math.floor(Math.random() * 100) + 1,
  barCode: `BarCode ${index + 1}`,
}));

export function ProductCatalog() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // para búsquedas
  const [filterQuantity, setFilterQuantity] = useState(""); // filtro cantidades
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Producto para el popup
  const [orderQuantity, setOrderQuantity] = useState(""); // Cantidad a ordenar
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado del popup (TRUE - OPEN, FALSE- CLOSE)

  // Productos filtrados
  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterQuantity ? product.quantity >= Number(filterQuantity) : true)
    );
  });

  // Lógica de paginación según cantidad de productos
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  // FUNCION PARA AGREGAR A PEDIDO
  const handleAddToOrderClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true); // OPEN POPUP
  };

  // FUNCION CONFIRMAR ADDITION
  const handleConfirmAddition = () => {
    console.log("Producto agregado:", selectedProduct?.name, "Cantidad:", orderQuantity);
    setOrderQuantity("")
    setIsDialogOpen(false); // CERRAR POPUP
  };

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
      <Header title={"Catálogo de productos"}/>

      {/* Main Content */}
      <div
        style={{
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* BUSQUEDA Y FILTROS */}
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {/* BUSQUEDA */}
          <div style={{ position: "relative", width: "300px" }}>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "0.5rem 2.5rem 0.5rem 0.5rem",
                fontSize: "1rem",
                width: "100%",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "50%",
                right: "0.75rem",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#ccc",
                fontSize: "1.2rem",
              }}
            >
              <Icon name="search" />
            </span>
          </div>

          {/* FILTRO CANTIDAD */}
          <input
            type="number"
            placeholder="Filtrar por cantidad mínima..."
            value={filterQuantity}
            onChange={(e) => setFilterQuantity(e.target.value)}
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
        </div>

        {/* Product Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(4, minmax(250px, 1fr))`,
            gap: "1.5rem",
            width: "100%",
            justifyContent: filteredProducts.length < 4 ? "center" : "start",
          }}
        >
          {paginatedProducts.map((product) => (
            <Card
              key={product.id}
              header={<CardHeader titleText={product.name} />}
              style={{
                padding: "0.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                maxWidth: "250px",
              }}
            >
              <div style={{ padding: "1rem" }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <Text style={{ color: "gray" }}>ID: {product.id}</Text>
                <Text>Cantidad disponible: {product.quantity}</Text>
                <Text style={{ paddingBottom: "0.5rem" }}>Código de barras: {product.barCode}</Text>
                <div style={{ textAlign: "center" }}>
                  <Button
                    design="Emphasized"
                    style={{
                      height: "1.5rem",
                      fontSize: "0.8rem",
                    }}
                    onClick={() => handleAddToOrderClick(product)}
                  >
                    Agregar a pedido
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {filteredProducts.length > PRODUCTS_PER_PAGE && (
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Button
              icon="navigation-left-arrow"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            />
            <Text>
              Página {currentPage} de {totalPages}
            </Text>
            <Button
              icon="navigation-right-arrow"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            />
          </div>
        )}
      </div>

      {/* POP UP - AGREGAR A ORDEN*/}
      {selectedProduct && (
        <Dialog
        headerText={`Producto: ${selectedProduct?.name}`} 
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", 
              alignItems: "center",
              width: "100%",
            }}
          >
            {/*SALIR DE POPUP */}
            <Button
              design="Transparent" 
              style={{ height: "1.5rem", fontSize: "0.8rem" }}
              onClick={() => setIsDialogOpen(false)} 
            >
              Salir
            </Button>

            {/*CONFIRMAR AGREGAR */}
            <Button
              design="Emphasized"
              style={{ height: "1.5rem", fontSize: "0.8rem" }}
              onClick={handleConfirmAddition}
              disabled={!orderQuantity || isNaN(Number(orderQuantity)) || Number(orderQuantity) <= 0} // Disable unless valid number
      
            >
              Agregar
            </Button>
          </div>
        }
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)} 
      >
        <div style={{ padding: "1rem", textAlign: "center" }}>
          <Text style={{ color: "gray", fontSize: "0.7rem" }}>
            ID: {selectedProduct?.id} 
          </Text>
          <Text style={{ margin: "0.5rem 0" }}>Cantidad a ordenar:</Text>
          <Input
            type="Number" 
            placeholder="Ingrese el número de piezas"
            value={orderQuantity} 
            onChange={(e) => setOrderQuantity(e.target.value)} 
          />
        </div>
      </Dialog>
      
      )}
    </div>
  );
}
