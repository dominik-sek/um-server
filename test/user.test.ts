import app from '../app';
import request from 'supertest';
import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../enums/userRole';
import { createSecureContext } from 'tls';

describe("Users route without auth", () => {
  it("should return 401 unauthorized if send without session cookie", done => {
    request(app)
      .get("/users")
      .then(response => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });
});

describe("Users routes", () => {
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

  describe("Users route without auth", () => {
    it("should return 401 if user has no permissions", done => {
      mockRequest.user = {
        role_id: 1,
        person_id: 1,
        login: '',
        password: ''
      };
      request(app)
        .get("/users")
        .then(response => {
          expect(response.statusCode).toBe(401);
          done();
        }
        );

    });
  });

});

