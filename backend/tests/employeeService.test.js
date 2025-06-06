import { jest } from "@jest/globals";

// Mock the hanaPool module and connection behavior
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  },
}));

const pool = (await import("../db/hanaPool.js")).default;
const employeeService = await import("../services/employeeService.js");

describe("employeeService", () => {
  let fakeConn;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeConn = {
      exec: jest.fn(),
      setAutoCommit: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    };
    pool.acquire.mockResolvedValue(fakeConn);
    pool.release.mockResolvedValue();
  });

  // getAllEmployees test
  it("should return all employees with location", async () => {
    // Arrange
    const fakeResult = [
      { EMPLOYEEID: 1, NAME: "John", LOCATION_NAME: "HQ" },
      { EMPLOYEEID: 2, NAME: "Jane", LOCATION_NAME: "Branch" },
    ];
    fakeConn.exec.mockResolvedValue(fakeResult);

    // Act
    const result = await employeeService.getAllEmployees();

    // Assert
    expect(result).toBe(fakeResult);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("SELECT")
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("should update employee with provided fields", async () => {
    const employeeID = 1;
    const employeeData = {
      name: "NewName",
      lastname: "NewLast",
      email: "new@email.com",
      role: "manager",
      userPhoto: "img.png",
      cellphone: "555-111",
      isActive: true,
      isBlocked: false,
      blockReason: "none",
      storeID: 42,
    };
    const updatedByID = 99;

    fakeConn.exec.mockResolvedValue();

    const result = await employeeService.updateEmployee(
      employeeID,
      employeeData,
      updatedByID
    );

    // SQL SET clause should contain each updated field
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE WUSAP.Employees"),
      expect.arrayContaining([
        employeeData.name,
        employeeData.lastname,
        employeeData.email,
        employeeData.role,
        employeeData.userPhoto,
        employeeData.cellphone,
        employeeData.isActive,
        employeeData.isBlocked,
        employeeData.blockReason,
        employeeData.storeID,
        employeeID,
      ])
    );
    // Should log the update in TableLogs
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO WUSAP.TableLogs"),
      [updatedByID, employeeID]
    );
    expect(fakeConn.commit).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
    expect(result).toEqual({
      success: true,
      message: "Employee updated successfully",
    });
  });

  it("should fail to update if no fields are provided", async () => {
    const result = await employeeService.updateEmployee(1, {}, 99);
    expect(result).toEqual({ success: false, message: "No fields to update" });
    expect(fakeConn.exec).not.toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("should throw error if invalid role is provided", async () => {
    const badData = { role: "not_valid_role" };
    await expect(employeeService.updateEmployee(1, badData, 2)).rejects.toThrow(
      "El rol debe ser admin, manager, sales, owner o warehouse_manager"
    );
    expect(fakeConn.rollback).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("should rollback on SQL error", async () => {
    // Simulate SQL error on update
    fakeConn.exec.mockImplementationOnce(() => {
      throw new Error("DB error");
    });
    await expect(
      employeeService.updateEmployee(1, { name: "Test" }, 99)
    ).rejects.toThrow("DB error");
    expect(fakeConn.rollback).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});
