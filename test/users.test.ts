import app from '../app';
import request from 'supertest';
import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../enums/userRole';
import { createSecureContext } from 'tls';
const session = require('supertest-session');
import { user } from '@prisma/client';

let mockAccount = {
  login: 'adminadmin3',
  password: '12312312312',
};


let mockSession: any;

describe("Users routes without auth", () => {

  it("should return 401 if user not logged in", done => {
    request(app)
      .get("/users")
      .then(response => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });
});

beforeEach(() => {
  mockSession = session(app);
});

describe("Users routes", () => {

  it("should return 401 if user has no permissions", done => {
    request(app)
      .get("/users")
      // .set('Cookie', cookie)
      .then(response => {
        expect(response.statusCode).toBe(401);
        done();
      }
      );
  });

  it("should return 200 and body with user profile if user has permissions", done => {
    request(app)
      .get("/users")
      // .set('Cookie', cookie)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

});


