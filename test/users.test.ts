import app from '../app';
import request from 'supertest';
import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../enums/userRole';
import { createSecureContext } from 'tls';
import { user } from '@prisma/client';
const mockSession = require('mock-session');


let mockAccount = {
  login: 'adminadmin3',
  password: '12312312312',
};

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

describe("Users routes", () => {
  let agent = request.agent(app);
  // login the agent with the mock account

  beforeEach(done => {
    agent
      .post("/login")
      .send(mockAccount)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  it("should return 200 and body with user profile if user has permissions", done => {
    agent
      .get("/users")
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

});


