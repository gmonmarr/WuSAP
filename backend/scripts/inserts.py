from hdbcli import dbapi
import os
from dotenv import load_dotenv
import random
import datetime
from decimal import Decimal

# Load variables from .env file
load_dotenv()

server_node = os.getenv("HANA_SERVER_NODE", "localhost:30015")
host, port = server_node.split(":")

conn = dbapi.connect(
    address=host,
    port=int(port),
    user=os.getenv("HANA_USER"),
    password=os.getenv("HANA_PASSWORD")
)

cursor = conn.cursor()

# --- Limpiar las tablas antes de insertar ---
print("Cleaning tables: SaleItems, Sale, Inventory...")
cursor.execute("DELETE FROM WUSAP.SaleItems")
cursor.execute("DELETE FROM WUSAP.Sale")
cursor.execute("DELETE FROM WUSAP.Inventory")
conn.commit()
print("Tables cleaned.")

# --- Insertar datos iniciales en Inventory ---
inventory_to_insert = [
    (1, 1, 100),  # productID=1, storeID=1, quantity=100
    (2, 1, 50),
    (1, 2, 80),
    (3, 2, 60),
]

cursor.executemany(
    "INSERT INTO WUSAP.Inventory (productID, storeID, quantity) VALUES (?, ?, ?)",
    inventory_to_insert
)
conn.commit()
print("Sample inventory data inserted.")

employee_ids = [1, 5]
product_inventory_ids = []

# Obtener inventario existente con los nuevos datos
cursor.execute("SELECT inventoryID, productID, storeID FROM WUSAP.Inventory")
for row in cursor.fetchall():
    product_inventory_ids.append(row)

# --- Cargar precios de productos una sola vez ---
cursor.execute("SELECT productID, suggestedPrice FROM WUSAP.Products")
product_prices = {row[0]: row[1] for row in cursor.fetchall()}

sales_to_insert = []
sale_items_to_insert = []

start_date = datetime.date.today() - datetime.timedelta(days=100)

# Crear 500 ventas
for i in range(500):
    sale_date = start_date + datetime.timedelta(days=random.randint(0, 100))
    employee_id = random.choice(employee_ids)
    sales_to_insert.append((sale_date, employee_id, 0))

# Insertar ventas
cursor.executemany(
    "INSERT INTO WUSAP.Sale (saleDate, employeeID, saleTotal) VALUES (?, ?, ?)",
    sales_to_insert
)
conn.commit()

cursor.execute("SELECT saleID FROM WUSAP.Sale ORDER BY saleID DESC LIMIT 500")
sale_ids = [row[0] for row in cursor.fetchall()]
sale_ids.reverse()

for sale_id in sale_ids:
    max_items = min(3, len(product_inventory_ids))
    num_items = random.randint(1, max_items)
    items = random.sample(product_inventory_ids, num_items)
    total_sale = Decimal("0.00")
    for inventoryID, productID, storeID in items:
        qty = random.uniform(1, 10)
        qty_dec = Decimal(str(qty))
        price = product_prices.get(productID)
        if price is None:
            raise Exception(f"ProductID {productID} no encontrado en productos")
        item_total = round(qty_dec * price, 2)
        total_sale += item_total
        sale_items_to_insert.append((sale_id, inventoryID, round(qty, 2), item_total))

    cursor.execute("UPDATE WUSAP.Sale SET saleTotal = ? WHERE saleID = ?", (total_sale, sale_id))

# Insertar items de venta
cursor.executemany(
    "INSERT INTO WUSAP.SaleItems (saleID, inventoryID, quantity, itemTotal) VALUES (?, ?, ?, ?)",
    sale_items_to_insert
)

conn.commit()
cursor.close()
conn.close()
print("Inserted 500 sales with sale items")
