import { jest } from '@jest/globals';

// Mocks before importing the tested module!
jest.unstable_mockModule('../db/hanaPool.js', () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn()
  }
}));

jest.unstable_mockModule('../services/tableLogService.js', () => ({
  logToTableLogs: jest.fn()
}));

jest.unstable_mockModule('../services/inventoryService.js', () => ({
  getInventoryByStoreByProduct: jest.fn(),
  editInventory: jest.fn(),
  assignInventoryToStore: jest.fn()
}));

// Now import tested code
const { updateOrder, validateStatusTransition } = await import('../services/orderService.js');
const pool = (await import('../db/hanaPool.js')).default;
const { logToTableLogs } = await import('../services/tableLogService.js');
const { getInventoryByStoreByProduct, editInventory, assignInventoryToStore } = await import('../services/inventoryService.js');

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
  editInventory.mockReset();
  assignInventoryToStore.mockReset();
});

/** ========== VALIDATE STATUS TRANSITIONS ========== */
describe('validateStatusTransition permutations', () => {
  const perms = [
    // warehouse_manager transitions
    ['Pendiente', 'Pendiente', 'warehouse_manager', true],
    ['Pendiente', 'Aprobada', 'warehouse_manager', true],
    ['Pendiente', 'Cancelada', 'warehouse_manager', true],
    ['Pendiente', 'Confirmada', 'warehouse_manager', false],
    ['Pendiente', 'Entregada', 'warehouse_manager', false],

    ['Aprobada', 'Confirmada', 'warehouse_manager', true],
    ['Aprobada', 'Cancelada', 'warehouse_manager', true],
    ['Aprobada', 'Entregada', 'warehouse_manager', true],
    ['Aprobada', 'Pendiente', 'warehouse_manager', false],

    ['Confirmada', 'Entregada', 'warehouse_manager', true],
    ['Confirmada', 'Cancelada', 'warehouse_manager', true],
    ['Confirmada', 'Aprobada', 'warehouse_manager', false],
    ['Confirmada', 'Pendiente', 'warehouse_manager', false],

    // manager transitions
    ['Pendiente', 'Pendiente', 'manager', true],
    ['Pendiente', 'Cancelada', 'manager', true],
    ['Pendiente', 'Aprobada', 'manager', false],
    ['Pendiente', 'Confirmada', 'manager', false],
    ['Pendiente', 'Entregada', 'manager', false],

    ['Aprobada', 'Entregada', 'manager', true],
    ['Aprobada', 'Cancelada', 'manager', true],
    ['Aprobada', 'Pendiente', 'manager', false],
    ['Aprobada', 'Confirmada', 'manager', false],

    // role not present
    ['Pendiente', 'Aprobada', 'admin', false],
    ['Aprobada', 'Cancelada', 'employee', false],
  ];
  test.each(perms)(
    'from %s to %s as %s: should be %s',
    (from, to, role, expected) => {
      expect(validateStatusTransition(from, to, role)).toBe(expected);
    }
  );
});

/** ========== CORE updateOrder SCENARIOS ========== */
describe('updateOrder', () => {
  // Utility for a basic DB result
  function basicOrderData(overrides = {}) {
    return [{
      OLDSTATUS: 'Pendiente',
      OLDORDERTOTAL: '100.00',
      OLDCOMMENTS: '',
      ORDERITEMID: 10,
      PRODUCTID: 1,
      SOURCE: 'warehouse',
      QUANTITY: 5,
      ITEMTOTAL: 50.00,
      CREATORID: 3,
      CREATORROLE: 'manager',
      STOREID: 2,
      ...overrides,
    }];
  }

  it('warehouse_manager cannot update orderitems of manager', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData({ CREATORROLE: 'manager' }));
    await expect(updateOrder(1, { status: 'Aprobada' }, [{ ORDERITEMID: 10, PRODUCTID: 2, SOURCE: 'warehouse', QUANTITY: 5, ITEMTOTAL: 50 }], 1, 'warehouse_manager'))
      .rejects.toThrow(/warehouse managers cannot modify items/i);
    expect(fakeConn.rollback).toHaveBeenCalled();
  });

  it('warehouse_manager does not need updatedItems for status change', async () => {
    fakeConn.exec
      .mockResolvedValueOnce(basicOrderData())
      .mockResolvedValueOnce([{}]) // For inventory
      .mockResolvedValueOnce([{}]) // For log/history insert
      .mockResolvedValueOnce([{}]);
    getInventoryByStoreByProduct.mockResolvedValue([{ QUANTITY: 10, INVENTORYID: 1 }]);
    await expect(updateOrder(1, { status: 'Aprobada', orderTotal: '100.00', comments: '' }, undefined, 1, 'warehouse_manager'))
      .resolves.toMatchObject({ success: true });
  });

  it('subtracts warehouse inventory on approval', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData());
    getInventoryByStoreByProduct.mockResolvedValue([{ QUANTITY: 5, INVENTORYID: 11 }]);
    await expect(updateOrder(1, { status: 'Aprobada', orderTotal: '100.00', comments: '' }, [], 1, 'warehouse_manager'))
      .resolves.toMatchObject({ success: true });
    expect(editInventory).toHaveBeenCalledWith(11, 0, 1);
  });

  it('manager can update own orderItems', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData({ CREATORROLE: 'manager' }));
    await expect(updateOrder(1, { status: 'Pendiente', orderTotal: '100.00', comments: 'x' }, [
      { ORDERITEMID: 10, PRODUCTID: 1, SOURCE: 'warehouse', QUANTITY: 10, ITEMTOTAL: 100 }
    ], 1, 'manager')).resolves.toMatchObject({ success: true });
  });

  it('fails approval if not enough stock', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData());
    getInventoryByStoreByProduct.mockResolvedValue([{ QUANTITY: 3, INVENTORYID: 11 }]);
    await expect(updateOrder(1, { status: 'Aprobada', orderTotal: '100.00', comments: '' }, [], 1, 'warehouse_manager'))
      .rejects.toThrow(/not enough stock/i);
  });

  it('manager cannot self-approve', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData({ CREATORROLE: 'manager', OLDSTATUS: 'Pendiente' }));
    await expect(updateOrder(1, { status: 'Aprobada', orderTotal: '100.00', comments: '' }, [], 1, 'manager'))
      .rejects.toThrow(/invalid status transition/i);
  });

  it('handles undefined comments in logs/history', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData({ OLDCOMMENTS: undefined }));
    getInventoryByStoreByProduct.mockResolvedValue([{ QUANTITY: 10, INVENTORYID: 1 }]);
    await expect(updateOrder(1, { status: 'Aprobada', orderTotal: '100.00' }, [], 1, 'warehouse_manager'))
      .resolves.toMatchObject({ success: true });
  });

  it('manager cannot edit warehouse_manager orders', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData({ CREATORROLE: 'warehouse_manager' }));
    await expect(updateOrder(1, { status: 'Pendiente', orderTotal: '100.00', comments: '' }, [], 1, 'manager'))
      .rejects.toThrow(/cannot edit orders created by warehouse managers/i);
  });

  it('logs "No changes detected" when only comments change', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData());
    getInventoryByStoreByProduct.mockResolvedValue([{ QUANTITY: 10, INVENTORYID: 1 }]);
    await updateOrder(1, { status: 'Pendiente', orderTotal: '100.00', comments: 'New' }, [], 1, 'manager');
    expect(logToTableLogs).toHaveBeenCalledWith(expect.objectContaining({
      comment: expect.stringContaining('comments:')
    }));
  });

  it('logs "No changes detected" when there are no changes', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData());
    getInventoryByStoreByProduct.mockResolvedValue([{ QUANTITY: 10, INVENTORYID: 1 }]);
    await updateOrder(1, { status: 'Pendiente', orderTotal: '100.00', comments: '' }, [], 1, 'manager');
    expect(logToTableLogs).toHaveBeenCalledWith(expect.objectContaining({
      comment: expect.stringContaining('No changes detected')
    }));
  });

  it('throws if orderItems do not belong to order', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData());
    await expect(updateOrder(1, { status: 'Pendiente', orderTotal: '100.00', comments: '' }, [
      { ORDERITEMID: 999, PRODUCTID: 1, SOURCE: 'warehouse', QUANTITY: 5, ITEMTOTAL: 50 }
    ], 1, 'manager')).rejects.toThrow(/does not belong to this order/i);
  });

  // --- Additional: update just one item, log/commit correct ---
  it('updates only the provided order item and logs correctly', async () => {
    fakeConn.exec.mockResolvedValueOnce([
      { OLDSTATUS: 'Pendiente', OLDORDERTOTAL: '10.00', OLDCOMMENTS: '', ORDERITEMID: 100, PRODUCTID: 1, SOURCE: 'warehouse', QUANTITY: 2, ITEMTOTAL: 10, CREATORID: 9, CREATORROLE: 'manager', STOREID: 1 },
      { OLDSTATUS: 'Pendiente', OLDORDERTOTAL: '10.00', OLDCOMMENTS: '', ORDERITEMID: 101, PRODUCTID: 2, SOURCE: 'warehouse', QUANTITY: 1, ITEMTOTAL: 5, CREATORID: 9, CREATORROLE: 'manager', STOREID: 1 }
    ]);
    await updateOrder(
      1,
      { status: 'Pendiente', orderTotal: '10.00', comments: '' },
      [{ ORDERITEMID: 100, PRODUCTID: 1, SOURCE: 'warehouse', QUANTITY: 3, ITEMTOTAL: 15 }],
      9, 'manager'
    );
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE WUSAP.OrderItems SET'),
      [1, 'warehouse', 3, 15, 100]
    );
    expect(logToTableLogs).toHaveBeenCalledWith(expect.objectContaining({
      tableName: 'OrderItems',
      recordID: 100,
      action: 'UPDATE'
    }));
  });

  it('blocks update to Aprobada when there is not enough warehouse inventory', async () => {
    fakeConn.exec.mockResolvedValueOnce([
      { OLDSTATUS: 'Pendiente', OLDORDERTOTAL: '20.00', OLDCOMMENTS: '', ORDERITEMID: 200, PRODUCTID: 2, SOURCE: 'warehouse', QUANTITY: 5, ITEMTOTAL: 20, CREATORID: 9, CREATORROLE: 'manager', STOREID: 1 }
    ]);
    getInventoryByStoreByProduct.mockResolvedValue([{ INVENTORYID: 50, QUANTITY: 2 }]); // not enough!
    await expect(updateOrder(
      1, { status: 'Aprobada', orderTotal: '20.00', comments: '' }, [], 8, 'warehouse_manager'
    )).rejects.toThrow(/not enough stock/i);
  });

  it('reimburses inventory when cancelling an approved order (Aprobada → Cancelada)', async () => {
    fakeConn.exec.mockResolvedValueOnce([
      { OLDSTATUS: 'Aprobada', OLDORDERTOTAL: '30.00', OLDCOMMENTS: '', ORDERITEMID: 101, PRODUCTID: 10, SOURCE: 'warehouse', QUANTITY: 7, ITEMTOTAL: 30, CREATORID: 9, CREATORROLE: 'manager', STOREID: 1 }
    ]);
    getInventoryByStoreByProduct.mockResolvedValue([{ INVENTORYID: 300, QUANTITY: 2 }]);
    fakeConn.exec.mockResolvedValueOnce({}); // update inventory
    await updateOrder(
      1,
      { status: 'Cancelada', orderTotal: '30.00', comments: '' },
      [],
      9, 'manager'
    );
    expect(fakeConn.exec).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE WUSAP.Inventory SET QUANTITY = ? WHERE inventoryID = ?'),
      [9, 300] // 2 + 7 = 9
    );
  });

  it('adds items to store inventory on Entregada transition', async () => {
    fakeConn.exec.mockResolvedValueOnce([
      { OLDSTATUS: 'Confirmada', OLDORDERTOTAL: '15.00', OLDCOMMENTS: '', ORDERITEMID: 111, PRODUCTID: 33, SOURCE: 'warehouse', QUANTITY: 4, ITEMTOTAL: 15, CREATORID: 10, CREATORROLE: 'manager', STOREID: 3 }
    ]);
    getInventoryByStoreByProduct.mockResolvedValueOnce(null); // inventory not found
    assignInventoryToStore.mockResolvedValue();
    await updateOrder(
      1,
      { status: 'Entregada', orderTotal: '15.00', comments: '' },
      [],
      10, 'warehouse_manager'
    );
    expect(assignInventoryToStore).toHaveBeenCalledWith(33, 3, 4, 10);
  });

  it('creates a new inventory record if not found when marking Entregada', async () => {
    fakeConn.exec.mockResolvedValueOnce([
      { OLDSTATUS: 'Aprobada', OLDORDERTOTAL: '50.00', OLDCOMMENTS: '', ORDERITEMID: 201, PRODUCTID: 60, SOURCE: 'warehouse', QUANTITY: 8, ITEMTOTAL: 50, CREATORID: 12, CREATORROLE: 'manager', STOREID: 4 }
    ]);
    getInventoryByStoreByProduct.mockResolvedValueOnce(undefined);
    assignInventoryToStore.mockResolvedValue();
    await updateOrder(
      1,
      { status: 'Entregada', orderTotal: '50.00', comments: '' },
      [],
      12, 'warehouse_manager'
    );
    expect(assignInventoryToStore).toHaveBeenCalledWith(60, 4, 8, 12);
  });

  it('throws if updatedItems contains orderItem that does not belong to the order', async () => {
    fakeConn.exec.mockResolvedValueOnce(basicOrderData());
    await expect(updateOrder(
      1, { status: 'Pendiente', orderTotal: '12.00', comments: '' },
      [{ ORDERITEMID: 444, PRODUCTID: 11, SOURCE: 'warehouse', QUANTITY: 3, ITEMTOTAL: 12 }],
      2, 'manager'
    )).rejects.toThrow(/does not belong to this order/i);
  });
});

/** ========== orderService BASIC GETs ========== */
import * as orderService from '../services/orderService.js';

describe('orderService (basic GET functions)', () => {
  let fakeConn;
  beforeEach(() => {
    fakeConn = {
      exec: jest.fn(),
      setAutoCommit: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    };
    pool.acquire.mockResolvedValue(fakeConn);
    pool.release.mockResolvedValue();
  });

  it('getAllOrders returns all orders', async () => {
    const rows = [{ ORDERID: 1, STATUS: "Pendiente" }, { ORDERID: 2, STATUS: "Aprobada" }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await orderService.getAllOrders();
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith('SELECT * FROM WUSAP.Orders');
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getAllActiveOrders filters out Cancelada and Entregada', async () => {
    const rows = [{ ORDERID: 1, STATUS: "Pendiente" }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await orderService.getAllActiveOrders();
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('WHERE status NOT IN'), undefined);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrderById returns order, items, and history', async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ ORDERID: 42, STATUS: "Pendiente" }]) // order
      .mockResolvedValueOnce([{ ORDERITEMID: 9 }])                   // items
      .mockResolvedValueOnce([{ HISTORYID: 3 }]);                    // history
    const result = await orderService.getOrderById(42);
    expect(result).toEqual({
      order: { ORDERID: 42, STATUS: "Pendiente" },
      items: [{ ORDERITEMID: 9 }],
      history: [{ HISTORYID: 3 }]
    });
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('WHERE orderID = ?'), [42]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrdersByStore fetches orders for store', async () => {
    const rows = [{ ORDERID: 2, STOREID: 7 }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await orderService.getOrdersByStore(7);
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('WHERE storeID = ?'), [7]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrdersWithDetailsForStore fetches aggregated orders', async () => {
    const rows = [{ ORDERID: 3, ITEMCOUNT: 2, LASTUPDATED: "2024-06-01" }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await orderService.getOrdersWithDetailsForStore(12);
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('GROUP BY'), [12]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrderWithFullDetails returns order, items, history', async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ ORDERID: 8, STATUS: "Aprobada" }])     // order
      .mockResolvedValueOnce([{ ORDERITEMID: 2, PRODUCTID: 5 }])       // items
      .mockResolvedValueOnce([{ HISTORYID: 7, EMPLOYEENAME: 'Anna' }]); // history
    const result = await orderService.getOrderWithFullDetails(8);
    expect(result).toEqual({
      order: { ORDERID: 8, STATUS: "Aprobada" },
      items: [{ ORDERITEMID: 2, PRODUCTID: 5 }],
      history: [{ HISTORYID: 7, EMPLOYEENAME: 'Anna' }]
    });
    expect(fakeConn.exec).toHaveBeenCalledTimes(3);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrderWithFullDetails throws if order not found', async () => {
    fakeConn.exec.mockResolvedValueOnce([]); // order not found
    await expect(orderService.getOrderWithFullDetails(999)).rejects.toThrow('Order not found');
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrdersByEmployee returns matching orders', async () => {
    const rows = [{ ORDERID: 10 }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await orderService.getOrdersByEmployee(5);
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('WHERE oh.employeeID = ?'), [5]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});
