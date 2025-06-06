import { jest } from "@jest/globals";

// Mock pool and connection
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  },
}));

const pool = (await import("../db/hanaPool.js")).default;
const productService = await import("../services/productService.js");

const {
  getAllProducts,
  getActiveProductsService,
  addProduct,
  updateProduct,
  deleteProduct,
} = productService;

describe("productService", () => {
  let fakeConn;
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the fake connection
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

  // --- getAllProducts ---
  it("getAllProducts returns all products", async () => {
    const rows = [
      { PRODUCTID: 1, NAME: "A" },
      { PRODUCTID: 2, NAME: "B" },
    ];
    fakeConn.exec.mockImplementation((sql, cb) => cb(null, rows));

    const result = await getAllProducts();
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("Products"),
      expect.any(Function)
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  // --- getActiveProductsService ---
  it("getActiveProductsService returns only active products", async () => {
    const rows = [{ PRODUCTID: 1, DISCONTINUED: false }];
    fakeConn.exec.mockImplementation((sql, cb) => cb(null, rows));
    const result = await getActiveProductsService();
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("discontinued = FALSE"),
      expect.any(Function)
    );
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  // --- addProduct ---
  it("addProduct inserts product and logs, returns productID", async () => {
    // Set up the prepare().exec() mock for both insert and log
    const prepareExec = jest.fn((params, cb) => cb(null));
    fakeConn.prepare.mockImplementation((sql, cb) =>
      cb(null, { exec: prepareExec })
    );

    // exec() calls:
    // 1. SELECT CURRENT_IDENTITY_VALUE() (returns [{ PRODUCTID: 99 }])
    fakeConn.exec.mockImplementationOnce((sql, cb) =>
      cb(null, [{ PRODUCTID: 99 }])
    );

    const result = await addProduct("P1", 2.99, "pcs", false, 13);
    expect(result).toEqual({
      success: true,
      message: expect.any(String),
      productID: 99,
    });
    expect(fakeConn.setAutoCommit).toHaveBeenCalledWith(false);
    expect(fakeConn.prepare).toHaveBeenCalledTimes(2); // for INSERT and for TableLogs
    expect(prepareExec).toHaveBeenCalledTimes(2); // both .exec calls
    expect(fakeConn.commit).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("addProduct rolls back on error", async () => {
    // Insert fails
    fakeConn.prepare.mockImplementationOnce((sql, cb) => cb(new Error("fail")));
    await expect(addProduct("X", 1, "u", false, 2)).rejects.toThrow("fail");
    expect(fakeConn.rollback).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  // --- updateProduct ---
  it("updateProduct updates fields and logs", async () => {
    // Exists check returns 1 row
    fakeConn.exec
      .mockImplementationOnce((sql, params, cb) => cb(null, [{ PRODUCTID: 7 }]))
      .mockImplementationOnce((sql, cb) => cb(null, undefined)); // (for update)

    // prepare().exec() for UPDATE and for logs
    const prepareExec = jest.fn((params, cb) => cb(null));
    fakeConn.prepare.mockImplementation((sql, cb) =>
      cb(null, { exec: prepareExec })
    );

    const result = await updateProduct(
      7,
      { name: "X", suggestedPrice: 1.11 },
      5
    );
    expect(result).toEqual({ success: true, message: expect.any(String) });
    expect(fakeConn.prepare).toHaveBeenCalled();
    expect(fakeConn.commit).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("updateProduct returns false if no fields", async () => {
    fakeConn.exec.mockImplementationOnce((sql, params, cb) =>
      cb(null, [{ PRODUCTID: 7 }])
    );
    const result = await updateProduct(7, {}, 3);
    expect(result).toEqual({ success: false, message: expect.any(String) });
    expect(fakeConn.commit).not.toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("updateProduct throws if product not found", async () => {
    fakeConn.exec.mockImplementationOnce((sql, params, cb) => cb(null, []));
    await expect(updateProduct(101, { name: "No" }, 3)).rejects.toThrow(
      "Product not found"
    );
    expect(fakeConn.rollback).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  // --- deleteProduct ---
  it("deleteProduct deletes product and logs", async () => {
    // Product exists and not used in inventory
    fakeConn.exec
      .mockImplementationOnce((sql, params, cb) =>
        cb(null, [{ PRODUCTID: 9, NAME: "ToDel" }])
      )
      .mockImplementationOnce((sql, params, cb) =>
        cb(null, [{ USAGE_COUNT: 0 }])
      )
      .mockImplementationOnce((sql, params, cb) => cb(null, undefined)); // DELETE

    const prepareExec = jest.fn((params, cb) => cb(null));
    fakeConn.prepare.mockImplementation((sql, cb) =>
      cb(null, { exec: prepareExec })
    );

    const result = await deleteProduct(9, 11);
    expect(result).toEqual({ success: true, message: expect.any(String) });
    expect(fakeConn.prepare).toHaveBeenCalled();
    expect(fakeConn.commit).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("deleteProduct throws if not found", async () => {
    fakeConn.exec.mockImplementationOnce((sql, params, cb) => cb(null, []));
    await expect(deleteProduct(888, 9)).rejects.toThrow("Product not found");
    expect(fakeConn.rollback).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("deleteProduct errors if product is used", async () => {
    fakeConn.exec
      .mockImplementationOnce((sql, params, cb) =>
        cb(null, [{ PRODUCTID: 2, NAME: "CantDel" }])
      )
      .mockImplementationOnce((sql, params, cb) =>
        cb(null, [{ USAGE_COUNT: 1 }])
      );

    await expect(deleteProduct(2, 10)).rejects.toThrow(/no se puede eliminar/i);
    expect(fakeConn.rollback).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});
