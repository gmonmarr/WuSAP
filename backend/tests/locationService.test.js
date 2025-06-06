import { jest } from "@jest/globals";

// Mock pool
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  },
}));

// Import service AFTER mocks
const pool = (await import("../db/hanaPool.js")).default;
const locationModule = await import("../services/locationService.js");
const {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  checkLocationsTable,
  createLocationsTable,
  checkLocationHasEmployees,
  getEmployeesByLocation,
} = locationModule;

describe("locationService", () => {
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

  it("getAllLocations returns rows", async () => {
    const rows = [{ STOREID: 1, NAME: "HQ" }];
    fakeConn.exec.mockResolvedValue(rows);

    const result = await getAllLocations();
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("SELECT")
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("createLocation works (happy path)", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ NEXTID: 123 }]) // maxIdResult
      .mockResolvedValueOnce(undefined) // INSERT location
      .mockResolvedValueOnce(undefined) // INSERT log
      .mockResolvedValueOnce(undefined); // commit

    const res = await createLocation(
      { name: "A", location: "B", isActive: false },
      77
    );
    expect(res).toMatchObject({ success: true, storeID: 123 });
    expect(fakeConn.setAutoCommit).toHaveBeenCalledWith(false);
    expect(fakeConn.exec).toHaveBeenCalled();
    expect(fakeConn.commit).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("checkLocationsTable exists true", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ TABLE_COUNT: 1 }])
      .mockResolvedValueOnce([{ COLUMN_NAME: "STOREID" }]);

    const result = await checkLocationsTable();
    expect(result.exists).toBe(true);
    expect(Array.isArray(result.structure)).toBe(true);
  });

  it("checkLocationsTable exists false", async () => {
    fakeConn.exec.mockResolvedValueOnce([{ TABLE_COUNT: 0 }]);
    const result = await checkLocationsTable();
    expect(result.exists).toBe(false);
    expect(result.structure).toBeNull();
  });

  it("createLocationsTable works", async () => {
    fakeConn.exec.mockResolvedValue();
    const result = await createLocationsTable();
    expect(result).toMatchObject({ success: true });
  });

  it("createLocationsTable returns ok on already exists", async () => {
    fakeConn.exec.mockRejectedValue({ message: "already exists" });
    const result = await createLocationsTable();
    expect(result).toMatchObject({ success: true });
  });

  it("createLocationsTable throws on unknown error", async () => {
    fakeConn.exec.mockRejectedValue(new Error("some weird error"));
    await expect(createLocationsTable()).rejects.toThrow();
  });

  it("getLocationById returns the correct row", async () => {
    fakeConn.exec.mockResolvedValueOnce([
      { STOREID: 5, NAME: "Sucursal", LOCATION: "A", ISACTIVE: true },
    ]);
    const res = await getLocationById(5);
    expect(res).toEqual({
      STOREID: 5,
      NAME: "Sucursal",
      LOCATION: "A",
      ISACTIVE: true,
    });
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("WHERE STOREID = ?"),
      [5]
    );
  });

  it("getLocationById returns null if not found", async () => {
    fakeConn.exec.mockResolvedValueOnce([]);
    const res = await getLocationById(9999);
    expect(res).toBeNull();
  });

  it("updateLocation updates the correct fields (all provided)", async () => {
    // getLocationById needs to return something
    fakeConn.exec
      .mockResolvedValueOnce([
        { STOREID: 2, NAME: "Old", LOCATION: "Loc", ISACTIVE: false },
      ]) // getLocationById
      .mockResolvedValueOnce(undefined) // UPDATE
      .mockResolvedValueOnce(undefined) // INSERT log
      .mockResolvedValueOnce(undefined); // commit

    const result = await updateLocation(
      2,
      { name: "New", location: "Here", isActive: true },
      9
    );
    expect(result.success).toBe(true);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE WUSAP.LOCATIONS"),
      ["New", "Here", true, 2]
    );
    expect(fakeConn.commit).toHaveBeenCalled();
  });

  it("updateLocation updates only provided fields", async () => {
    // Only 'location' is updated here
    fakeConn.exec
      .mockResolvedValueOnce([{ STOREID: 4 }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    const result = await updateLocation(4, { location: "Nueva" }, 1);
    expect(result.success).toBe(true);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE WUSAP.LOCATIONS"),
      ["Nueva", 4]
    );
  });

  it("updateLocation returns early if no fields", async () => {
    fakeConn.exec.mockResolvedValueOnce([{ STOREID: 5 }]);
    const result = await updateLocation(5, {}, 2);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/No fields to update/i);
  });

  it("updateLocation throws if not found", async () => {
    fakeConn.exec.mockResolvedValueOnce([]); // getLocationById returns nothing
    await expect(updateLocation(9, { name: "x" }, 2)).rejects.toThrow(
      /not found/i
    );
    expect(fakeConn.rollback).toHaveBeenCalled();
  });

  it("deleteLocation deletes when no employees assigned", async () => {
    // Chain of calls:
    // 1. getLocationById returns a location
    // 2. checkLocationHasEmployees returns false
    // 3. DELETE location
    // 4. INSERT log
    // 5. commit
    fakeConn.exec
      .mockResolvedValueOnce([
        { STOREID: 10, NAME: "Del", LOCATION: "Site", ISACTIVE: true },
      ]) // getLocationById
      .mockResolvedValueOnce([{ EMPLOYEE_COUNT: 0 }]) // checkLocationHasEmployees
      .mockResolvedValueOnce(undefined) // DELETE
      .mockResolvedValueOnce(undefined) // log
      .mockResolvedValueOnce(undefined); // commit

    const res = await deleteLocation(10, 22);
    expect(res.success).toBe(true);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM WUSAP.LOCATIONS"),
      [10]
    );
    expect(fakeConn.commit).toHaveBeenCalled();
  });

  it("deleteLocation throws if not found", async () => {
    fakeConn.exec.mockResolvedValueOnce([]); // getLocationById
    await expect(deleteLocation(44, 2)).rejects.toThrow(/not found/i);
    expect(fakeConn.rollback).toHaveBeenCalled();
  });

  it("deleteLocation throws if employees assigned", async () => {
    // getLocationById returns loc
    fakeConn.exec
      .mockResolvedValueOnce([
        { STOREID: 88, NAME: "Z", LOCATION: "L", ISACTIVE: true },
      ]) // getLocationById
      .mockResolvedValueOnce([{ EMPLOYEE_COUNT: 1 }]) // checkLocationHasEmployees
      .mockResolvedValueOnce([
        { NAME: "John", LASTNAME: "Smith" },
        { NAME: "Ana", LASTNAME: "Doe" },
      ]); // getEmployeesByLocation

    await expect(deleteLocation(88, 99)).rejects.toThrow(
      /empleados asignados/i
    );
    expect(fakeConn.rollback).toHaveBeenCalled();
  });

  it("checkLocationHasEmployees returns true/false", async () => {
    fakeConn.exec.mockResolvedValueOnce([{ EMPLOYEE_COUNT: 1 }]);
    expect(await checkLocationHasEmployees(1)).toBe(true);

    fakeConn.exec.mockResolvedValueOnce([{ EMPLOYEE_COUNT: 0 }]);
    expect(await checkLocationHasEmployees(2)).toBe(false);
  });

  it("getEmployeesByLocation returns employee list", async () => {
    fakeConn.exec.mockResolvedValueOnce([
      { NAME: "A", LASTNAME: "B", EMAIL: "c@c.com" },
    ]);
    const res = await getEmployeesByLocation(5);
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]).toMatchObject({
      NAME: "A",
      LASTNAME: "B",
      EMAIL: "c@c.com",
    });
  });
});
