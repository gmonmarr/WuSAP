import { jest } from '@jest/globals';

// Mock pool
jest.unstable_mockModule('../db/hanaPool.js', () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  }
}));

// Now import real locationService (no unstable_mockModule on it!)
const pool = (await import('../db/hanaPool.js')).default;
const locationModule = await import('../services/locationService.js');

const {
  getAllLocations,
  createLocation,
  checkLocationsTable,
  createLocationsTable,
} = locationModule;

describe('locationService', () => {
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

  it('getAllLocations returns rows', async () => {
    const rows = [{ STOREID: 1, NAME: 'HQ' }];
    fakeConn.exec.mockResolvedValue(rows);

    const result = await getAllLocations();
    expect(result).toEqual(rows);
    expect(fakeConn.exec).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('createLocation works (happy path)', async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ NEXTID: 123 }]) // maxIdResult
      .mockResolvedValueOnce(undefined)         // INSERT location
      .mockResolvedValueOnce(undefined)         // INSERT log
      .mockResolvedValueOnce(undefined);        // commit

    const res = await createLocation({ name: 'A', location: 'B', isActive: false }, 77);
    expect(res).toMatchObject({ success: true, storeID: 123 });
    expect(fakeConn.setAutoCommit).toHaveBeenCalledWith(false);
    expect(fakeConn.exec).toHaveBeenCalled();
    expect(fakeConn.commit).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it('checkLocationsTable exists true', async () => {
    fakeConn.exec
      .mockResolvedValueOnce([{ TABLE_COUNT: 1 }])
      .mockResolvedValueOnce([{ COLUMN_NAME: 'STOREID' }]);

    const result = await checkLocationsTable();
    expect(result.exists).toBe(true);
    expect(Array.isArray(result.structure)).toBe(true);
  });

  it('checkLocationsTable exists false', async () => {
    fakeConn.exec.mockResolvedValueOnce([{ TABLE_COUNT: 0 }]);
    const result = await checkLocationsTable();
    expect(result.exists).toBe(false);
    expect(result.structure).toBeNull();
  });

  it('createLocationsTable works', async () => {
    fakeConn.exec.mockResolvedValue();
    const result = await createLocationsTable();
    expect(result).toMatchObject({ success: true });
  });

  it('createLocationsTable returns ok on already exists', async () => {
    fakeConn.exec.mockRejectedValue({ message: 'already exists' });
    const result = await createLocationsTable();
    expect(result).toMatchObject({ success: true });
  });

  it('createLocationsTable throws on unknown error', async () => {
    fakeConn.exec.mockRejectedValue(new Error('some weird error'));
    await expect(createLocationsTable()).rejects.toThrow();
  });
});
