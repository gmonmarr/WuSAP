import { jest } from "@jest/globals";

// Mocks
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  },
}));
jest.unstable_mockModule("../services/tableLogService.js", () => ({
  logToTableLogs: jest.fn().mockResolvedValue(),
}));

const pool = (await import("../db/hanaPool.js")).default;
const { logToTableLogs } = await import("../services/tableLogService.js");
const inventoryService = await import("../services/inventoryService.js");

describe("inventoryService", () => {
  let fakeConn;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeConn = {
      exec: jest.fn(),
      prepare: jest.fn(),
      setAutoCommit: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    };
    pool.acquire.mockResolvedValue(fakeConn);
    pool.release.mockResolvedValue();
  });

  it("getAllInventory returns rows", async () => {
    const rows = [{ INVENTORYID: 1 }];
    fakeConn.exec.mockImplementation((sql, cb) => cb(null, rows));
    const result = await inventoryService.getAllInventory();
    expect(result).toBe(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      expect.any(Function)
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("getInventoryByStore returns filtered rows", async () => {
    const rows = [{ INVENTORYID: 2, STOREID: 5 }];
    fakeConn.exec.mockImplementation((sql, params, cb) => cb(null, rows));
    const result = await inventoryService.getInventoryByStore(5);
    expect(result).toBe(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("WHERE storeID = ?"),
      [5],
      expect.any(Function)
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("getWarehouseProducts returns correct products", async () => {
    const rows = [{ PRODUCTID: 1, QUANTITY: 8 }];
    fakeConn.exec.mockImplementation((sql, cb) => cb(null, rows));
    const result = await inventoryService.getWarehouseProducts();
    expect(result).toBe(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("INNER JOIN"),
      expect.any(Function)
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("assignInventoryToStore updates if exists", async () => {
    // SELECT returns an existing record
    fakeConn.prepare.mockImplementation((sql, cb) => {
      if (sql.includes("SELECT")) {
        cb(null, {
          exec: (params, cb2) => cb2(null, [{ INVENTORYID: 42 }]),
        });
      } else {
        cb(null, {
          exec: (params, cb2) => cb2(null),
        });
      }
    });
    fakeConn.exec.mockImplementation((sql, cb) =>
      cb(null, [{ INVENTORYID: 42 }])
    );

    const res = await inventoryService.assignInventoryToStore(10, 3, 5, 7);

    expect(res).toEqual({
      success: true,
      message: expect.stringContaining("actualizado"),
      inventoryID: 42,
    });
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("assignInventoryToStore inserts if not exists", async () => {
    // No existing record
    let prepareCall = 0;
    fakeConn.prepare.mockImplementation((sql, cb) => {
      prepareCall++;
      if (prepareCall === 1) {
        cb(null, {
          exec: (params, cb2) => cb2(null, []),
        });
      } else {
        cb(null, {
          exec: (params, cb2) => cb2(null),
        });
      }
    });

    let execCall = 0;
    fakeConn.exec.mockImplementation((sql, cb) => {
      execCall++;
      if (sql.includes("CURRENT_IDENTITY_VALUE")) {
        cb(null, [{ RECORDID: 99 }]);
      } else {
        cb(null, []);
      }
    });

    const res = await inventoryService.assignInventoryToStore(11, 3, 7, 7);

    expect(res).toEqual({
      success: true,
      message: expect.stringContaining("exitosamente"),
      inventoryID: 99,
    });
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("editInventory works (and calls log)", async () => {
    fakeConn.exec
      .mockImplementationOnce((sql, params, cb) => cb(null, [{ QUANTITY: 7 }]))
      .mockImplementationOnce((sql, params, cb) => cb(null));
    fakeConn.prepare.mockImplementation((sql, cb) =>
      cb(null, { exec: (params, cb2) => cb2(null) })
    );

    const result = await inventoryService.editInventory(123, 42, 5);
    expect(result).toEqual({ success: true, message: expect.any(String) });
    expect(logToTableLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeID: 5,
        tableName: "Inventory",
        recordID: 123,
        action: "UPDATE",
      }),
      fakeConn
    );
  });

  it("getInventoryByStoreByProduct returns correct inventory", async () => {
    const rows = [{ INVENTORYID: 3, STOREID: 7, PRODUCTID: 15 }];
    fakeConn.exec.mockImplementation((sql, params, cb) => cb(null, rows));
    const result = await inventoryService.getInventoryByStoreByProduct(7, 15);
    expect(result).toBe(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("storeID = ? AND productID = ?"),
      [7, 15],
      expect.any(Function)
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("getInventoryByID returns inventory by ID", async () => {
    const rows = [{ INVENTORYID: 7 }];
    fakeConn.exec.mockImplementation((sql, params, cb) => cb(null, rows));
    const result = await inventoryService.getInventoryByID(7);
    expect(result).toBe(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("WHERE inventoryID = ?"),
      [7],
      expect.any(Function)
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});
