// tests/updateOrder.test.js
import { jest } from "@jest/globals";

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
  editInventory: jest.fn(),
  assignInventoryToStore: jest.fn(),
}));

// Import after mocks
const { updateOrder, validateStatusTransition } = await import(
  "../services/orderService.js"
);
const pool = (await import("../db/hanaPool.js")).default;
const { logToTableLogs } = await import("../services/tableLogService.js");
const { getInventoryByStoreByProduct, editInventory, assignInventoryToStore } =
  await import("../services/inventoryService.js");

let fakeConn;

beforeEach(() => {
  fakeConn = {
    exec: jest.fn(() => Promise.resolve([{}])),
    setAutoCommit: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
  };
  pool.acquire.mockResolvedValue(fakeConn);
  pool.release.mockResolvedValue();
  logToTableLogs.mockResolvedValue();
  getInventoryByStoreByProduct.mockReset();
  editInventory.mockReset();
  assignInventoryToStore.mockReset();
});

function joinedRow(overrides = {}) {
  return {
    OLDSTATUS: "Pendiente",
    OLDORDERTOTAL: "100.00",
    OLDCOMMENTS: "",
    CREATORID: 3,
    CREATORROLE: "manager",
    STOREID: 2,
    ORDERITEMID: 10,
    PRODUCTID: 1,
    SOURCE: "warehouse",
    QUANTITY: 5,
    ITEMTOTAL: 50.0,
    ...overrides,
  };
}

/** ========== VALIDATE STATUS TRANSITIONS ========== */
describe("validateStatusTransition permutations", () => {
  const perms = [
    ["Pendiente", "Pendiente", "warehouse_manager", true],
    ["Pendiente", "Aprobada", "warehouse_manager", true],
    ["Pendiente", "Cancelada", "warehouse_manager", true],
    ["Pendiente", "Confirmada", "warehouse_manager", false],
    ["Pendiente", "Entregada", "warehouse_manager", false],
    ["Aprobada", "Confirmada", "warehouse_manager", true],
    ["Aprobada", "Cancelada", "warehouse_manager", true],
    ["Aprobada", "Entregada", "warehouse_manager", true],
    ["Aprobada", "Pendiente", "warehouse_manager", false],
    ["Confirmada", "Entregada", "warehouse_manager", true],
    ["Confirmada", "Cancelada", "warehouse_manager", true],
    ["Confirmada", "Aprobada", "warehouse_manager", false],
    ["Confirmada", "Pendiente", "warehouse_manager", false],
    ["Pendiente", "Pendiente", "manager", true],
    ["Pendiente", "Cancelada", "manager", true],
    ["Pendiente", "Aprobada", "manager", false],
    ["Pendiente", "Confirmada", "manager", false],
    ["Pendiente", "Entregada", "manager", false],
    ["Aprobada", "Entregada", "manager", true],
    ["Aprobada", "Cancelada", "manager", true],
    ["Aprobada", "Pendiente", "manager", false],
    ["Aprobada", "Confirmada", "manager", false],
    ["Pendiente", "Aprobada", "admin", false],
    ["Aprobada", "Cancelada", "employee", false],
  ];
  test.each(perms)(
    "from %s to %s as %s: should be %s",
    (from, to, role, expected) => {
      expect(validateStatusTransition(from, to, role)).toBe(expected);
    }
  );
});

/** ========== CORE updateOrder SCENARIOS ========== */
describe("updateOrder", () => {
  it("warehouse_manager cannot update orderitems of manager", async () => {
    fakeConn.exec.mockResolvedValueOnce([
      joinedRow({ CREATORROLE: "manager", ORDERITEMID: 10, orderItemID: 10 }),
    ]);
    await expect(
      updateOrder(
        1,
        { status: "Aprobada" },
        [
          {
            orderItemID: 10,
            productID: 2,
            source: "warehouse",
            quantity: 5,
            itemTotal: 50,
          },
        ],
        1,
        "warehouse_manager"
      )
    ).rejects.toThrow(/warehouse managers cannot modify items/i);
    expect(fakeConn.rollback).toHaveBeenCalled();
  });

  it("warehouse_manager does not need updatedItems for status change", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([joinedRow()])
      .mockResolvedValueOnce([{ HISTORYID: 1 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { QUANTITY: 10, INVENTORYID: 1 },
    ]);
    await expect(
      updateOrder(
        1,
        { status: "Aprobada", orderTotal: "100.00", comments: "" },
        undefined,
        1,
        "warehouse_manager"
      )
    ).resolves.toMatchObject({ success: true });
  });

  it("subtracts warehouse inventory on approval", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({
          CREATORROLE: "manager",
          OLDSTATUS: "Pendiente",
          SOURCE: "warehouse",
          source: "warehouse",
          ORDERITEMID: 10,
          orderItemID: 10,
          PRODUCTID: 1,
          productID: 1,
          QUANTITY: 5,
          quantity: 5,
          STOREID: 1,
          OLDORDERTOTAL: "100.00",
        }),
      ])
      .mockResolvedValueOnce([{ HISTORYID: 2 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { QUANTITY: 5, INVENTORYID: 11 },
    ]);
    await expect(
      updateOrder(
        1,
        { status: "Aprobada", orderTotal: "100.00", comments: "" },
        [],
        1,
        "warehouse_manager"
      )
    ).resolves.toMatchObject({ success: true });

    // The crucial bit: make sure the args are exactly as expected
    expect(editInventory).toHaveBeenCalledWith(11, 0, 1);
  });

  it("manager can update own orderItems", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({ CREATORROLE: "manager", ORDERITEMID: 10, orderItemID: 10 }),
      ])
      .mockResolvedValueOnce([{ HISTORYID: 3 }]);
    await expect(
      updateOrder(
        1,
        { status: "Pendiente", orderTotal: "100.00", comments: "x" },
        [
          {
            orderItemID: 10,
            productID: 1,
            source: "warehouse",
            quantity: 10,
            itemTotal: 100,
          },
        ],
        1,
        "manager"
      )
    ).resolves.toMatchObject({ success: true });
  });

  it("fails approval if not enough stock", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([joinedRow()])
      .mockResolvedValueOnce([{ HISTORYID: 4 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { QUANTITY: 3, INVENTORYID: 11 },
    ]);
    await expect(
      updateOrder(
        1,
        { status: "Aprobada", orderTotal: "100.00", comments: "" },
        [],
        1,
        "warehouse_manager"
      )
    ).rejects.toThrow(/not enough stock/i);
  });

  it("manager cannot self-approve", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({ CREATORROLE: "manager", OLDSTATUS: "Pendiente" }),
      ])
      .mockResolvedValueOnce([{ HISTORYID: 5 }]);
    await expect(
      updateOrder(
        1,
        { status: "Aprobada", orderTotal: "100.00", comments: "" },
        [],
        1,
        "manager"
      )
    ).rejects.toThrow(/invalid status transition/i);
  });

  it("handles undefined comments in logs/history", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([joinedRow({ OLDCOMMENTS: undefined })])
      .mockResolvedValueOnce([{ HISTORYID: 6 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { QUANTITY: 10, INVENTORYID: 1 },
    ]);
    await expect(
      updateOrder(
        1,
        { status: "Aprobada", orderTotal: "100.00" },
        [],
        1,
        "warehouse_manager"
      )
    ).resolves.toMatchObject({ success: true });
  });

  it("manager cannot edit warehouse_manager orders", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([joinedRow({ CREATORROLE: "warehouse_manager" })])
      .mockResolvedValueOnce([{ HISTORYID: 7 }]);
    await expect(
      updateOrder(
        1,
        { status: "Pendiente", orderTotal: "100.00", comments: "" },
        [],
        1,
        "manager"
      )
    ).rejects.toThrow(/cannot edit orders created by warehouse managers/i);
  });

  it('logs "No changes detected" when only comments change', async () => {
    fakeConn.exec
      .mockResolvedValueOnce([joinedRow()])
      .mockResolvedValueOnce([{ HISTORYID: 8 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { QUANTITY: 10, INVENTORYID: 1 },
    ]);
    await updateOrder(
      1,
      { status: "Pendiente", orderTotal: "100.00", comments: "New" },
      [],
      1,
      "manager"
    );
    expect(logToTableLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: expect.stringContaining("comments:"),
      })
    );
  });

  it('logs "No changes detected" when there are no changes', async () => {
    fakeConn.exec
      .mockResolvedValueOnce([joinedRow()])
      .mockResolvedValueOnce([{ HISTORYID: 9 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { QUANTITY: 10, INVENTORYID: 1 },
    ]);
    await updateOrder(
      1,
      { status: "Pendiente", orderTotal: "100.00", comments: "" },
      [],
      1,
      "manager"
    );
    expect(logToTableLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: expect.stringContaining("No changes detected"),
      })
    );
  });

  it("throws if orderItems do not belong to order", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([joinedRow()])
      .mockResolvedValueOnce([{ HISTORYID: 10 }]);
    await expect(
      updateOrder(
        1,
        { status: "Pendiente", orderTotal: "100.00", comments: "" },
        [
          {
            ORDERITEMID: 999,
            PRODUCTID: 1,
            SOURCE: "warehouse",
            QUANTITY: 5,
            ITEMTOTAL: 50,
          },
        ],
        1,
        "manager"
      )
    ).rejects.toThrow(/does not belong to this order/i);
  });

  it("updates only the provided order item and logs correctly", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({
          CREATORID: 9,
          CREATORROLE: "manager",
          STOREID: 1,
          OLDORDERTOTAL: "10.00",
          ORDERITEMID: 100,
          orderItemID: 100,
          PRODUCTID: 1,
          productID: 1,
        }),
        joinedRow({
          CREATORID: 9,
          CREATORROLE: "manager",
          STOREID: 1,
          OLDORDERTOTAL: "10.00",
          ORDERITEMID: 101,
          orderItemID: 101,
          PRODUCTID: 2,
          productID: 2,
        }),
      ])
      .mockResolvedValueOnce([{ HISTORYID: 11 }]);
    await updateOrder(
      1,
      { status: "Pendiente", orderTotal: "10.00", comments: "" },
      [
        {
          orderItemID: 100,
          productID: 1,
          source: "warehouse",
          quantity: 3,
          itemTotal: 15,
        },
      ],
      9,
      "manager"
    );
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE WUSAP.OrderItems SET"),
      [1, "warehouse", 3, 15, 100]
    );
    expect(logToTableLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        tableName: "OrderItems",
        recordID: 100,
        action: "UPDATE",
      })
    );
  });

  it("blocks update to Aprobada when there is not enough warehouse inventory", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({
          OLDORDERTOTAL: "20.00",
          ORDERITEMID: 200,
          PRODUCTID: 2,
          QUANTITY: 5,
        }),
      ])
      .mockResolvedValueOnce([{ HISTORYID: 12 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { INVENTORYID: 50, QUANTITY: 2 },
    ]); // not enough!
    await expect(
      updateOrder(
        1,
        { status: "Aprobada", orderTotal: "20.00", comments: "" },
        [],
        8,
        "warehouse_manager"
      )
    ).rejects.toThrow(/not enough stock/i);
  });

  it("reimburses inventory when cancelling an approved order (Aprobada → Cancelada)", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({
          OLDSTATUS: "Aprobada",
          OLDORDERTOTAL: "30.00",
          CREATORID: 9,
          CREATORROLE: "manager",
          STOREID: 1,
          ORDERITEMID: 101,
          PRODUCTID: 10,
          SOURCE: "warehouse",
          QUANTITY: 7,
          ITEMTOTAL: 30,
        }),
      ])
      .mockResolvedValueOnce({}) // update inventory
      .mockResolvedValueOnce([{ HISTORYID: 13 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { INVENTORYID: 300, QUANTITY: 2 },
    ]);
    await updateOrder(
      1,
      { status: "Cancelada", orderTotal: "30.00", comments: "" },
      [],
      9,
      "manager"
    );
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining(
        "UPDATE WUSAP.Inventory SET quantity = ? WHERE inventoryID = ?"
      ),
      [9, 300]
    );
  });

  it("adds items to store inventory on Entregada transition", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({
          OLDSTATUS: "Confirmada",
          ORDERITEMID: 111,
          orderItemID: 111,
          PRODUCTID: 33,
          productID: 33,
          QUANTITY: 4,
          quantity: 4,
          OLDORDERTOTAL: "15.00",
        }),
      ])
      .mockResolvedValueOnce([{ HISTORYID: 14 }]);
    getInventoryByStoreByProduct.mockResolvedValue([]); // Return [] for not found
    assignInventoryToStore.mockResolvedValue();
    await updateOrder(
      1,
      { status: "Entregada", orderTotal: "15.00", comments: "" },
      [],
      10,
      "warehouse_manager"
    );
    expect(assignInventoryToStore).toHaveBeenCalledWith(33, 2, 4, 10); // storeID matches STOREID in mock (here 2)
  });

  it("creates a new inventory record if not found when marking Entregada", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({
          OLDSTATUS: "Aprobada",
          ORDERITEMID: 201,
          orderItemID: 201,
          PRODUCTID: 60,
          productID: 60,
          QUANTITY: 8,
          quantity: 8,
          STOREID: 4,
          OLDORDERTOTAL: "50.00",
        }),
      ])
      .mockResolvedValueOnce([{ HISTORYID: 15 }]);
    getInventoryByStoreByProduct.mockResolvedValue([]); // Return [] for not found
    assignInventoryToStore.mockResolvedValue();
    await updateOrder(
      1,
      { status: "Entregada", orderTotal: "50.00", comments: "" },
      [],
      12,
      "warehouse_manager"
    );
    expect(assignInventoryToStore).toHaveBeenCalledWith(60, 4, 8, 12);
  });

  it("throws if updatedItems contains orderItem that does not belong to the order", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([joinedRow()])
      .mockResolvedValueOnce([{ HISTORYID: 10 }]);
    await expect(
      updateOrder(
        1,
        { status: "Pendiente", orderTotal: "12.00", comments: "" },
        [
          {
            ORDERITEMID: 444,
            PRODUCTID: 11,
            SOURCE: "warehouse",
            QUANTITY: 3,
            ITEMTOTAL: 12,
          },
        ],
        2,
        "manager"
      )
    ).rejects.toThrow(/does not belong to this order/i);
  });

  // PATCH-ONLY TEST: Only status/comments supplied
  it("allows updating only status/comments, defaults orderTotal for validation", async () => {
    fakeConn.exec
      .mockResolvedValueOnce([
        joinedRow({
          OLDSTATUS: "Aprobada",
          OLDORDERTOTAL: "123.45",
          OLDCOMMENTS: "oldcom",
        }),
      ])
      .mockResolvedValueOnce([{ HISTORYID: 16 }]);
    getInventoryByStoreByProduct.mockResolvedValue([
      { QUANTITY: 99, INVENTORYID: 2 },
    ]);
    await expect(
      updateOrder(
        1,
        { status: "Entregada", comments: "delivered" },
        undefined,
        1,
        "warehouse_manager"
      )
    ).resolves.toMatchObject({ success: true });
  });
});
