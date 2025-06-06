// tests/salesService.test.js
import { jest } from "@jest/globals";

// Mocks
const logToTableLogs = jest.fn();
const getInventoryByStoreByProduct = jest.fn();
const editInventory = jest.fn();
const getInventoryByID = jest.fn();

// Mock pool (connection)
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  },
}));

// Mock inventory/log dependencies
jest.unstable_mockModule("../services/tableLogService.js", () => ({
  logToTableLogs,
}));
jest.unstable_mockModule("../services/inventoryService.js", () => ({
  getInventoryByStoreByProduct,
  editInventory,
  getInventoryByID,
}));

// Import service after mocking dependencies
const pool = (await import("../db/hanaPool.js")).default;
const { getAllSales, getSaleById, postSale, deleteSale } = await import(
  "../services/salesService.js"
);

describe("salesService", () => {
  let fakeConn;
  beforeEach(() => {
    jest.clearAllMocks();
    fakeConn = {
      exec: jest.fn(),
      setAutoCommit: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      prepare: jest.fn(),
    };
    pool.acquire.mockResolvedValue(fakeConn);
    pool.release.mockResolvedValue();
  });

  it("getAllSales returns sales with employee names", async () => {
    const rows = [
      {
        saleID: 1,
        saleDate: "2024-01-01",
        employeeID: 5,
        employeeName: "Alice",
        saleTotal: 99,
      },
    ];
    fakeConn.exec.mockImplementation((sql, cb) => cb(null, rows));
    const res = await getAllSales();
    expect(res).toEqual(rows);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("getSaleById returns sale and its items", async () => {
    const saleRow = [{ saleID: 2, employeeID: 8, employeeName: "Bob" }];
    const saleItems = [
      { saleItemID: 21, inventoryID: 10, productID: 3, storeID: 2 },
    ];
    // First exec: sale info, Second exec: items
    fakeConn.exec
      .mockImplementationOnce((sql, params, cb) => cb(null, saleRow))
      .mockImplementationOnce((sql, params, cb) => cb(null, saleItems));
    const result = await getSaleById(2);
    expect(result).toEqual({ ...saleRow[0], saleItems });
  });

  it("getSaleById returns null if not found", async () => {
    fakeConn.exec.mockImplementationOnce((sql, params, cb) => cb(null, []));
    const result = await getSaleById(123);
    expect(result).toBeNull();
  });

  it("postSale inserts sale and items, edits inventory, logs, and commits", async () => {
    // Arrange
    const sale = { saleTotal: 100, saleDate: "2024-01-01" };
    const saleItems = [{ inventoryID: 7, quantity: 2, itemTotal: 50 }];
    const employeeID = 9;

    // Mock all the DB and side effect functions
    fakeConn.exec
      // Insert sale
      .mockImplementationOnce((sql, params) => Promise.resolve())
      // Fetch saleID
      .mockImplementationOnce(() => Promise.resolve([{ SALEID: 42 }]))
      // Insert sale item
      .mockImplementationOnce(() => Promise.resolve())
      // Fetch saleItemID
      .mockImplementationOnce(() => Promise.resolve([{ SALEITEMID: 66 }]));

    // 🟢 Mock getInventoryByID to always return an array
    getInventoryByID.mockResolvedValue([{ INVENTORYID: 7, QUANTITY: 10 }]);
    editInventory.mockResolvedValue();
    logToTableLogs.mockResolvedValue();

    // Act
    const res = await postSale(sale, saleItems, employeeID);

    // Assert
    expect(res).toEqual({ success: true, saleID: 42 });
    expect(editInventory).toHaveBeenCalledWith(7, 8, employeeID);
    expect(logToTableLogs).toHaveBeenCalled();
    expect(fakeConn.commit).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("deleteSale refunds inventory, logs, and deletes sale/items", async () => {
    // Setup: mock DB return for sale, sale items, inventory
    fakeConn.exec
      // Get old sale
      .mockImplementationOnce((sql, params, cb) =>
        cb(null, [{ SALETOTAL: 42, SALEDATE: "2024-01-01" }])
      )
      // Get old sale items
      .mockImplementationOnce((sql, params, cb) =>
        cb(null, [{ SALEITEMID: 10, INVENTORYID: 4, QUANTITY: 2 }])
      )
      // Delete SaleItems
      .mockImplementationOnce((sql, params, cb) => cb(null))
      // Delete Sale
      .mockImplementationOnce((sql, params, cb) => cb(null));

    // getInventoryByID returns inventory record
    getInventoryByID.mockResolvedValue([{ INVENTORYID: 4, QUANTITY: 3 }]);
    editInventory.mockResolvedValue();
    logToTableLogs.mockResolvedValue();

    const res = await deleteSale(99, 13);
    expect(res).toEqual({ success: true, saleID: 99 });
    expect(editInventory).toHaveBeenCalledWith(4, 5, 13, fakeConn); // 3+2
    expect(logToTableLogs).toHaveBeenCalled();
    expect(fakeConn.commit).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("deleteSale throws if no sale found", async () => {
    fakeConn.exec.mockImplementationOnce((sql, params, cb) => cb(null, []));
    await expect(deleteSale(222, 13)).rejects.toThrow(/not found/i);
    expect(fakeConn.rollback).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});
