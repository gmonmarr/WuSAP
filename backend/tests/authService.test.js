import { jest } from "@jest/globals";

// ESM mocking!
jest.unstable_mockModule("../db/hanaPool.js", () => ({
  default: {
    acquire: jest.fn(),
    release: jest.fn(),
  },
}));
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

// Await imports AFTER mockModule, for ESM mocks to take effect
const authService = await import("../services/authService.js");
const pool = (await import("../db/hanaPool.js")).default;
const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;

// Utility: defaultFakeUser for spreading
const defaultFakeUser = {
  EMAIL: "test@site.com",
  ISACTIVE: true,
  ISBLOCKED: false,
  PASSWORD: "hashedpwd",
  EMPLOYEEID: 1,
  ROLE: "admin",
  STOREID: 2,
  NAME: "Test",
  LASTNAME: "User",
  CELLPHONE: "555",
};

describe("authService", () => {
  let fakeConn, fakePrepare, fakeStatement;

  beforeEach(() => {
    jest.clearAllMocks();

    fakeStatement = {
      exec: jest.fn(),
    };
    fakePrepare = jest.fn((sql, cb) => cb(null, fakeStatement));
    fakeConn = {
      prepare: fakePrepare,
      setAutoCommit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
    };

    pool.acquire.mockResolvedValue(fakeConn);
    pool.release.mockResolvedValue();
  });

  it("should log in a valid active user and return a token", async () => {
    const fakeUser = { ...defaultFakeUser };
    fakeStatement.exec.mockImplementation((params, cb) => cb(null, [fakeUser]));

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mock.token");

    const result = await authService.loginUser("test@site.com", "password");

    expect(result.success).toBe(true);
    expect(result.token).toBe("mock.token");
    expect(result.user.email).toBe("test@site.com");
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("should reject if user is not found", async () => {
    fakeStatement.exec.mockImplementation((params, cb) => cb(null, []));
    await expect(
      authService.loginUser("notfound@site.com", "password")
    ).rejects.toThrow("Usuario no encontrado");
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("should reject if password does not match", async () => {
    const fakeUser = { ...defaultFakeUser, ISACTIVE: true, ISBLOCKED: false };
    fakeStatement.exec.mockImplementation((params, cb) => cb(null, [fakeUser]));
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      authService.loginUser("test@site.com", "wrong")
    ).rejects.toThrow("Contraseña incorrecta");
  });

  it("should reject if user is blocked", async () => {
    const fakeUser = {
      ...defaultFakeUser,
      ISBLOCKED: true,
      BLOCKREASON: "Policy",
    };
    fakeStatement.exec.mockImplementation((params, cb) => cb(null, [fakeUser]));
    await expect(
      authService.loginUser("blocked@site.com", "pass")
    ).rejects.toThrow(/acceso está bloqueado/);
  });

  it("should reject if user is not active", async () => {
    const fakeUser = { ...defaultFakeUser, ISACTIVE: false };
    fakeStatement.exec.mockImplementation((params, cb) => cb(null, [fakeUser]));
    await expect(
      authService.loginUser("inactive@site.com", "pass")
    ).rejects.toThrow(/cuenta está desactivada/);
  });

  it("should register a new user successfully", async () => {
    let execStep = 0;
    fakeStatement.exec.mockImplementation((params, cb) => {
      execStep++;
      if (execStep === 1) return cb(null, []); // User doesn't exist
      if (execStep === 2) return cb(null); // Insert succeeds
      if (execStep === 3) return cb(null); // TableLogs succeeds
    });

    fakeConn.exec = jest.fn((sql, cb) => cb(null, [{ employeeID: 99 }]));

    bcrypt.hash.mockResolvedValue("hashedPwd");

    const result = await authService.registerUser(
      1,
      "New",
      "User",
      "new@site.com",
      "123",
      "pwd",
      "employee",
      2
    );
    expect(result.success).toBe(true);
    expect(result.user.email).toBe("new@site.com");
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });

  it("should not register a user that already exists", async () => {
    fakeStatement.exec.mockImplementation((params, cb) =>
      cb(null, [{ EMAIL: "taken@site.com" }])
    );
    await expect(
      authService.registerUser(
        1,
        "Old",
        "User",
        "taken@site.com",
        "123",
        "pwd",
        "employee",
        2
      )
    ).rejects.toThrow(/ya existe/);
  });

  it("should rollback on error during registration", async () => {
    let execStep = 0;
    fakeStatement.exec.mockImplementation((params, cb) => {
      execStep++;
      if (execStep === 1) return cb(null, []);
      if (execStep === 2) return cb(new Error("Insert failed!"));
    });
    fakeConn.setAutoCommit = jest.fn().mockResolvedValue();
    fakeConn.rollback = jest.fn().mockResolvedValue();
    await expect(
      authService.registerUser(
        1,
        "New",
        "User",
        "fail@site.com",
        "123",
        "pwd",
        "employee",
        2
      )
    ).rejects.toThrow(/Insert failed!/);
    expect(fakeConn.rollback).toHaveBeenCalled();
    expect(pool.release).toHaveBeenCalledWith(fakeConn);
  });
});
