//

import { jest } from "@jest/globals";
import { editInventory } from "../services/inventoryService.js";

// Mock dependencies before import
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  },
}));
jest.unstable_mockModule("../services/tableLogService.js", () => ({
  logToTableLogs: jest.fn(),
}));
jest.unstable_mockModule("../services/inventoryService.js", () => ({
  getInventoryByStoreByProduct: jest.fn(),
  assignInventoryToStore: jest.fn(),
  editInventory: jest.fn(),
}));

const { createOrder } = await import("../services/orderService.js");
const pool = (await import("../db/hanaPool.js")).default;
const { logToTableLogs } = await import("../services/tableLogService.js");
const { getInventoryByStoreByProduct } = await import(
  "../services/inventoryService.js"
);

let fakeConn;
beforeEach(() => {
  fakeConn = {
    exec: jest.fn(),
    setAutoCommit: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
  };
  pool.acquire.mockResolvedValue(fakeConn);
  pool.release.mockResolvedValue();
  logToTableLogs.mockResolvedValue();
  getInventoryByStoreByProduct.mockReset();
});

/**
 * Test: Manager CANNOT order a product not in warehouse inventory.
 */
it("manager cannot create order for product not in warehouse inventory", async () => {
  // Products table returns product exists, but inventory is missing
  fakeConn.exec.mockImplementation((sql, params) => {
    if (sql.includes("FROM WUSAP.Products"))
      return Promise.resolve([{ productID: params[0] }]);
    if (sql.includes("CURRENT_IDENTITY_VALUE()"))
      return Promise.resolve([{ ORDERID: 100 }]);
    return Promise.resolve();
  });
  getInventoryByStoreByProduct.mockResolvedValue([]); // No inventory

  const orderData = { orderTotal: 10, comments: "test", storeID: 1 };
  const orderItems = [
    { productID: 42, source: "warehouse", quantity: 1, itemTotal: 10 },
  ];
  await expect(
    createOrder(orderData, orderItems, 77, "manager")
  ).rejects.toThrow(/No inventory found for product 42/i);
});

/**
 * Test: Manager CANNOT create order for more than available inventory.
 */
it("manager cannot create order for product if insufficient inventory", async () => {
  fakeConn.exec.mockImplementation((sql, params) => {
    if (sql.includes("FROM WUSAP.Products"))
      return Promise.resolve([{ productID: params[0] }]);
    if (sql.includes("CURRENT_IDENTITY_VALUE()"))
      return Promise.resolve([{ ORDERID: 100 }]);
    return Promise.resolve();
  });
  getInventoryByStoreByProduct.mockResolvedValue([{ QUANTITY: 5 }]); // not enough

  const orderData = { orderTotal: 20, comments: "test", storeID: 1 };
  const orderItems = [
    { productID: 99, source: "warehouse", quantity: 10, itemTotal: 20 },
  ];
  await expect(
    createOrder(orderData, orderItems, 77, "manager")
  ).rejects.toThrow(/Insufficient inventory for product 99/i);
});

/**
 * Test: Warehouse manager CAN order any product if it exists in Products, even if not in inventory yet.
 */
it("warehouse_manager can create order for product that is in Products table but not yet in inventory", async () => {
  fakeConn.exec.mockImplementation((sql, params) => {
    if (sql.includes("FROM WUSAP.Products"))
      return Promise.resolve([{ productID: params[0] }]);
    if (sql.includes("INSERT INTO WUSAP.Orders")) return Promise.resolve();
    if (sql.includes("CURRENT_IDENTITY_VALUE()"))
      return Promise.resolve([
        { ORDERID: 101 },
        { ORDERITEMID: 55 },
        { HISTORYID: 20 },
      ]);
    if (sql.includes("INSERT INTO WUSAP.OrderItems")) return Promise.resolve();
    if (sql.includes("INSERT INTO WUSAP.OrderHistory"))
      return Promise.resolve();
    return Promise.resolve();
  });

  const orderData = { orderTotal: 50, comments: "test", storeID: 1 };
  const orderItems = [
    { productID: 55, source: "not warehouse", quantity: 5, itemTotal: 50 },
  ];

  await expect(
    createOrder(orderData, orderItems, 55, "warehouse_manager")
  ).resolves.toHaveProperty("success", true);
});

/**
 * Test: Warehouse manager CANNOT create order for product not in Products table.
 */
it("warehouse_manager cannot create order for product not in Products table", async () => {
  fakeConn.exec.mockImplementation((sql, params) => {
    if (sql.includes("FROM WUSAP.Products")) return Promise.resolve([]); // not found
    if (sql.includes("CURRENT_IDENTITY_VALUE()"))
      return Promise.resolve([{ ORDERID: 102 }]);
    return Promise.resolve();
  });

  const orderData = { orderTotal: 80, comments: "test", storeID: 1 };
  const orderItems = [
    { productID: 77, source: "not warehouse", quantity: 1, itemTotal: 80 },
  ];

  await expect(
    createOrder(orderData, orderItems, 88, "warehouse_manager")
  ).rejects.toThrow(/Product does not exist: 77/i);
});

/**
 * Test: Manager must set item.source to 'warehouse'
 */
it('manager cannot create order if item.source is not "warehouse"', async () => {
  const orderData = { orderTotal: 5, comments: "no warehouse", storeID: 2 };
  const orderItems = [
    { productID: 9, source: "not warehouse", quantity: 1, itemTotal: 5 },
  ];
  await expect(
    createOrder(orderData, orderItems, 77, "manager")
  ).rejects.toThrow(/Managers must set item\.source to "warehouse"/i);
});
