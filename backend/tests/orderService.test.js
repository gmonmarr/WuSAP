// tests/orderService.test.js
import { jest } from "@jest/globals";
import {
  editInventory,
  getInventoryByStoreByProduct,
} from "../services/inventoryService.js";

// Mock dependencies and db connection before importing tested module
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  },
}));
jest.unstable_mockModule("../services/inventoryService.js", () => ({
  assignInventoryToStore: jest.fn(),
  editInventory: jest.fn(),
  getInventoryByStoreByProduct: jest.fn(),
}));
jest.unstable_mockModule("../services/tableLogService.js", () => ({
  logToTableLogs: jest.fn(),
}));

// Now import after mocks
const pool = (await import("../db/hanaPool.js")).default;
const {
  getAllOrders,
  getAllActiveOrders,
  getOrderById,
  getOrdersByStore,
  getOrdersWithDetailsForStore,
  getOrderWithFullDetails,
  getOrdersByEmployee,
} = await import("../services/orderService.js");

let fakeConn;

beforeEach(() => {
  fakeConn = {
    exec: jest.fn(),
  };
  pool.acquire.mockResolvedValue(fakeConn);
  pool.release.mockResolvedValue();
});

/** ========== getAllOrders ========== */
describe("getAllOrders", () => {
  it("fetches all orders", async () => {
    fakeConn.exec.mockResolvedValue([{ ORDERID: 1 }, { ORDERID: 2 }]);
    const result = await getAllOrders();
    expect(fakeConn.exec).toHaveBeenCalledWith("SELECT * FROM WUSAP.Orders");
    expect(result).toEqual([{ ORDERID: 1 }, { ORDERID: 2 }]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});

/** ========== getAllActiveOrders ========== */
describe("getAllActiveOrders", () => {
  it("fetches all active orders", async () => {
    fakeConn.exec.mockResolvedValue([{ ORDERID: 5 }]);
    const result = await getAllActiveOrders();
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("WHERE status NOT IN ('Cancelada', 'Entregada')")
    );
    expect(result).toEqual([{ ORDERID: 5 }]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});

/** ========== getOrderById ========== */
describe("getOrderById", () => {
  it("fetches order, items, and history by orderID", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ ORDERID: 7 }]) // Order
      .mockResolvedValueOnce([{ ORDERITEMID: 10 }]) // Items
      .mockResolvedValueOnce([{ HISTORYID: 12 }]); // History

    const result = await getOrderById(7);

    expect(fakeConn.exec).toHaveBeenNthCalledWith(
      1,
      "SELECT * FROM WUSAP.Orders WHERE orderID = ?",
      [7]
    );
    expect(fakeConn.exec).toHaveBeenNthCalledWith(
      2,
      "SELECT * FROM WUSAP.OrderItems WHERE orderID = ?",
      [7]
    );
    expect(fakeConn.exec).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("OrderHistory"),
      [7]
    );
    expect(result).toEqual({
      order: { ORDERID: 7 },
      items: [{ ORDERITEMID: 10 }],
      history: [{ HISTORYID: 12 }],
    });
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});

/** ========== getOrdersByStore ========== */
describe("getOrdersByStore", () => {
  it("fetches orders by storeID", async () => {
    fakeConn.exec.mockResolvedValue([{ ORDERID: 8, STOREID: 2 }]);
    const result = await getOrdersByStore(2);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      "SELECT * FROM WUSAP.Orders WHERE storeID = ?",
      [2]
    );
    expect(result).toEqual([{ ORDERID: 8, STOREID: 2 }]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});

/** ========== getOrdersWithDetailsForStore ========== */
describe("getOrdersWithDetailsForStore", () => {
  it("fetches detailed orders for a store", async () => {
    fakeConn.exec.mockResolvedValue([{ ORDERID: 1, ITEMCOUNT: 2 }]);
    const result = await getOrdersWithDetailsForStore(99);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("FROM WUSAP.Orders"),
      [99]
    );
    expect(result).toEqual([{ ORDERID: 1, ITEMCOUNT: 2 }]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});

/** ========== getOrderWithFullDetails ========== */
describe("getOrderWithFullDetails", () => {
  it("fetches full order details (order, items w/ product, history w/ employee)", async () => {
    // Order, Items, History
    fakeConn.exec
      .mockResolvedValueOnce([{ ORDERID: 42, STOREID: 1 }]) // order
      .mockResolvedValueOnce([
        { ORDERITEMID: 99, PRODUCTID: 1, PRODUCTNAME: "Water" },
      ]) // items
      .mockResolvedValueOnce([{ HISTORYID: 12, EMPLOYEENAME: "John" }]); // history

    const result = await getOrderWithFullDetails(42);

    expect(fakeConn.exec).toHaveBeenNthCalledWith(
      1,
      "SELECT * FROM WUSAP.Orders WHERE ORDERID = ?",
      [42]
    );
    expect(fakeConn.exec).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("LEFT JOIN WUSAP.Products"),
      [42]
    );
    expect(fakeConn.exec).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("LEFT JOIN WUSAP.Employees"),
      [42]
    );
    expect(result).toEqual({
      order: { ORDERID: 42, STOREID: 1 },
      items: [{ ORDERITEMID: 99, PRODUCTID: 1, PRODUCTNAME: "Water" }],
      history: [{ HISTORYID: 12, EMPLOYEENAME: "John" }],
    });
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("throws error if order not found", async () => {
    fakeConn.exec.mockResolvedValueOnce([]); // order not found
    await expect(getOrderWithFullDetails(123)).rejects.toThrow(
      /Order not found/
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});

/** ========== getOrdersByEmployee ========== */
describe("getOrdersByEmployee", () => {
  it("fetches all orders for an employee", async () => {
    fakeConn.exec.mockResolvedValue([{ ORDERID: 99, EMPLOYEEID: 12 }]);
    const result = await getOrdersByEmployee(12);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("WHERE oh.employeeID = ?"),
      [12]
    );
    expect(result).toEqual([{ ORDERID: 99, EMPLOYEEID: 12 }]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});
