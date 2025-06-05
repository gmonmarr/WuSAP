import { jest } from '@jest/globals';

// 1. Mock the database pool and connection
jest.unstable_mockModule('../db/hanaPool.js', () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn()
  }
}));

const pool = (await import('../db/hanaPool.js')).default;
const orderService = await import('../services/orderService.js');

const {
  getAllOrders,
  getAllActiveOrders,
  getOrderById,
  getOrdersByStore,
  getOrdersWithDetailsForStore,
  getOrderWithFullDetails,
  getOrdersByEmployee,
  // createOrder, updateOrder (not covered here)
} = orderService;

describe('orderService', () => {
  let fakeConn;

  beforeEach(() => {
    jest.clearAllMocks();
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
    const rows = [{ orderID: 1, status: "Pendiente" }, { orderID: 2, status: "Aprobada" }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await getAllOrders();
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith('SELECT * FROM WUSAP.Orders');
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getAllActiveOrders filters out Cancelada and Entregada', async () => {
    const rows = [{ orderID: 1, status: "Pendiente" }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await getAllActiveOrders();
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('WHERE status NOT IN'));
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrderById returns order, items, and history', async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ orderID: 42, status: "Pendiente" }]) // order
      .mockResolvedValueOnce([{ orderItemID: 9 }])                   // items
      .mockResolvedValueOnce([{ historyID: 3 }]);                    // history
    const result = await getOrderById(42);
    expect(result).toEqual({
      order: { orderID: 42, status: "Pendiente" },
      items: [{ orderItemID: 9 }],
      history: [{ historyID: 3 }]
    });
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('WHERE orderID = ?'), [42]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrdersByStore fetches orders for store', async () => {
    const rows = [{ orderID: 2, storeID: 7 }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await getOrdersByStore(7);
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('WHERE storeID = ?'), [7]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrdersWithDetailsForStore fetches aggregated orders', async () => {
    const rows = [{ orderID: 3, itemcount: 2, LASTUPDATED: "2024-06-01" }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await getOrdersWithDetailsForStore(12);
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('GROUP BY'), [12]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrderWithFullDetails returns order, items, history', async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ ORDERID: 8, STATUS: "Aprobada" }])     // order
      .mockResolvedValueOnce([{ ORDERITEMID: 2, PRODUCTID: 5 }])       // items
      .mockResolvedValueOnce([{ HISTORYID: 7, EMPLOYEENAME: 'Anna' }]); // history
    const result = await getOrderWithFullDetails(8);
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
    await expect(getOrderWithFullDetails(999)).rejects.toThrow('Order not found');
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('getOrdersByEmployee returns matching orders', async () => {
    const rows = [{ orderID: 10 }];
    fakeConn.exec.mockResolvedValue(rows);
    const result = await getOrdersByEmployee(5);
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('WHERE oh.employeeID = ?'), [5]);
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});
