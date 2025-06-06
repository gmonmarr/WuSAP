// tests/tableLogService.test.js

import { jest } from "@jest/globals";

// Mock the hanaPool and its acquire/release pattern
const exec = jest.fn();
const fakeConn = { exec };
const pool = {
  acquire: jest.fn(),
  release: jest.fn(),
};
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: pool,
}));

// Now import after mocks
const tableLogService = await import("../services/tableLogService.js");
const { logToTableLogs, getTableLogs } = tableLogService;

describe("tableLogService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    exec.mockReset();
    pool.acquire.mockResolvedValue(fakeConn);
    pool.release.mockResolvedValue();
  });

  describe("logToTableLogs", () => {
    it("inserts log with acquired connection (no conn provided)", async () => {
      exec.mockResolvedValue(undefined);
      const params = {
        employeeID: 11,
        tableName: "Orders",
        recordID: 99,
        action: "INSERT",
        comment: "Created order",
      };

      await logToTableLogs(params);

      expect(pool.acquire).toHaveBeenCalled();
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO WUSAP.TableLogs"),
        [11, "Orders", 99, "INSERT", "Created order"]
      );
      expect(pool.release).toHaveBeenCalledWith(fakeConn);
    });

    it("inserts log using provided connection, does not release", async () => {
      exec.mockResolvedValue(undefined);
      const params = {
        employeeID: 7,
        tableName: "Inventory",
        recordID: 22,
        action: "UPDATE",
        comment: "",
      };
      // Provide your own connection
      await logToTableLogs(params, fakeConn);
      expect(pool.acquire).not.toHaveBeenCalled();
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO WUSAP.TableLogs"),
        [7, "Inventory", 22, "UPDATE", ""]
      );
      expect(pool.release).not.toHaveBeenCalled();
    });

    it("throws error if employeeID is missing", async () => {
      await expect(
        logToTableLogs({
          employeeID: null,
          tableName: "Orders",
          recordID: 55,
          action: "INSERT",
        })
      ).rejects.toThrow(/employeeID/);
      expect(exec).not.toHaveBeenCalled();
    });

    it("throws error if required fields are missing", async () => {
      await expect(
        logToTableLogs({
          employeeID: 3,
          tableName: "",
          recordID: 22,
          action: "INSERT",
        })
      ).rejects.toThrow(/tableName/);
      await expect(
        logToTableLogs({
          employeeID: 3,
          tableName: "Orders",
          recordID: null,
          action: "INSERT",
        })
      ).rejects.toThrow(/recordID/);
      await expect(
        logToTableLogs({
          employeeID: 3,
          tableName: "Orders",
          recordID: 10,
          action: "",
        })
      ).rejects.toThrow(/action/);
    });
  });

  describe("getTableLogs", () => {
    it("queries all logs with no filters", async () => {
      exec.mockResolvedValue([{ logID: 1 }]);
      const logs = await getTableLogs({});
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT * FROM WUSAP.TableLogs WHERE 1=1 ORDER BY timestamp DESC"
        ),
        []
      );
      expect(logs).toEqual([{ logID: 1 }]);
      expect(pool.release).toHaveBeenCalledWith(fakeConn);
    });

    it("filters by tableName, employeeID, and recordID", async () => {
      exec.mockResolvedValue([{ logID: 99 }]);
      await getTableLogs({
        tableName: "Inventory",
        employeeID: 7,
        recordID: 22,
      });
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("AND tableName = ?"),
        expect.arrayContaining(["Inventory", 7, 22])
      );
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY timestamp DESC"),
        expect.any(Array)
      );
    });
  });
});
