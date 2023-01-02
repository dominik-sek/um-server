import app from '../../app';
import request from 'supertest';
import { NextFunction, Request, Response } from 'express';
import { authRole, authRoleOrPerson } from '../../middleware/authPage';
import { UserRole } from '../../enums/userRole';

describe("Authorization middleware", () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {} as Request;
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = jest.fn();
  });

  it("should call next if user is admin", async () => {
    mockRequest.user = {
      person_id: 3,
      username: "",
      password: "",
      last_login: new Date(),
    };
    await authRole(UserRole.ADMIN)(mockRequest, mockResponse, mockNext);
    expect(mockNext).toBeCalled();
  });

  it("should return 403 if user has no permissions", async () => {
    mockRequest.user = {
      person_id: 2,
      username: "",
      password: "",
      last_login: new Date(),
    };
    await authRole(UserRole.ADMIN)(mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toBeCalledWith(403);
  });
});
