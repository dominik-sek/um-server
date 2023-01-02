import app from '../app';
import request from 'supertest';
import { person } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../enums/userRole';
import { createSecureContext } from 'tls';
// import { user, person, address, contact, role } from '@prisma/client';
const mockSession = require('mock-session');
let agent = request.agent(app);

// let mockAccount = {
//   login: 'adminadmin3',
//   password: '12312312312',
// };

// //@ts-ignore

// let mockAddress: address = {
//   street: null,
//   street_number: null,
//   zip_code: null,
//   state: null,
//   country: null,
//   city: null
// };

// let mockPerson = {
//   name: "Jan",
//   surname: "Kowalski",
//   pesel: 11111111111 as unknown as bigint,
//   date_of_birth: "2022-02-02T00:00:00.000Z" as unknown as Date,
//   scientific_title: null,
//   role_id: 1,
//   contact: {
//     email: "jankowalski@student.school.edu.pl",
//     phone_number: 321123321,
//     address: {
//       id: 1,
//       street: "janapawla2",
//       street_number: 34,
//       zip_code: 31300,
//       state: "małopolskie",
//       country: "polska",
//       city: "tarnow"
//     } as unknown as address,
//   } as unknown as contact,
// };


describe("Users routes without auth", () => {

  it("should return 401 if user is not logged in", done => {
    request(app)
      .get("/users")
      .then(response => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });
  beforeEach(done => {
    agent
      .post("/login")
      .send({
        username: "student10001",
        password: "123123123"
      })
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });


  it("should return 403 if user is logged in but has no permissions", done => {
    agent
      .get("/users")
      .then(response => {
        expect(response.statusCode).toBe(403);
        done();
      }
      );
  });
  it("should return 200 if user is logged and checks another profile", done => {
    agent
      .get("/users/2")
      .then(response => {
        expect(response.statusCode).toBe(403);
        // expect(response.body).toMatchObject<person>;
        done();
      }
      );
  });
  it("should return 200 if user is logged and checks his own profile", done => {
    agent
      .get("/users/1")
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<person>;
        done();
      }
      );
  });
});

// describe("Users routes", () => {

//   beforeEach(done => {
//     agent
//       .post("/login")
//       .send(mockAccount)
//       .then(response => {
//         expect(response.statusCode).toBe(200);
//         done();
//       });
//   });

//   it("should return 200 and body with user profile if user has permissions", done => {
//     agent
//       .get("/users")
//       .then(response => {
//         expect(response.statusCode).toBe(200);
//         expect(response.body).toMatchObject<person>;
//         done();
//       });
//   });

//   it("should return 200 and return body with user info", done => {
//     agent
//       .get("/users/1")
//       .then(response => {
//         expect(response.statusCode).toBe(200);
//         expect(response.body).toMatchObject<person>;
//         done();
//       });
//   });
//   // it("should return 201 and return body with newly added person", done => {
//   //   agent
//   //     .post("/users")
//   //     .send(mockPerson)
//   //     .then(response => {
//   //       expect(response.statusCode).toBe(201);
//   //       expect(response.body).toMatchObject<person>;
//   //       done();
//   //     });
//   // });
//   it("should accept person body and update person", done => {
//     agent
//       .put("/users/2")
//       .send(mockPerson)
//       .then(response => {
//         expect(response.statusCode).toBe(200);
//         expect(response.body).toMatchObject<person>;
//         done();
//       });
//   });
//   it("should return no content after deleting person", done => {
//     agent
//       .delete("/users/2")
//       .then(response => {
//         expect(response.statusCode).toBe(204);
//         done();
//       });
//   });
//   it("should return no content after deleting person", done => {
//     agent
//       .delete("/users/2")
//       .then(response => {
//         expect(response.statusCode).toBe(204);
//         done();
//       });
//   });
//   it("should return no content after deleting person", done => {
//     agent
//       .delete("/users/2")
//       .then(response => {
//         expect(response.statusCode).toBe(204);
//         done();
//       });
//   });
// });


