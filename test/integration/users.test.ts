import app from '../../app';
import request from 'supertest';
import { person } from '@prisma/client';

let studentAccount = {
  username: 'student10001',
  password: '123123123',
};
let adminAccount = {
  username: 'baltazaradministrator3',
  password: '123321321',
};
let mockPerson = {
  first_name: "Andrzej",
  last_name: "Doktor",
  title: "dr hab mgr inż",
  birth_date: '1990-01-19',
  pesel: 675743234,
  gender: "M",
  role: "student",
    city: "Warszawa",
    state: "Mazowieckie",
    country: "PL",
    postal_code: "33-333",
    street: "Świętokrzyska 31",
    email: "dean@studia.edu.pl",
    phone_number: 333222111,
    disabled: "0",
    married: "1",
  department_id: "12"
};

let mockPutPerson = mockPerson;
mockPutPerson.first_name = "New name";
// describe("Users routes with no/limited permission", () => {
//   describe("GET /api/v1/users no account", () => {
//     it('should return 401 if user is not logged in', async () => {
//       const response = await request(app).get('/api/v1/users');
//       expect(response.statusCode).toBe(401);
//     });
//   });

//   describe("GET /api/v1/users no permissions", () => {
//     it('should return 403 if user is logged in but has no permissions', async () => {
//       const login = await request(app).post('/api/v1/login').send(studentAccount);
//       const response = await request(app)
//         .get('/api/v1/users')
//         .set('Cookie', login.headers['set-cookie']);
//       expect(response.statusCode).toBe(403);
//     });
//   });

//   describe("GET /api/v1/users/3 no permissions", () => {
//     it('should return 403 if user is logged in but has no permissions', async () => {
//       const login = await request(app).post('/api/v1/login').send(studentAccount);
//       const response = await request(app)
//         .get('/api/v1/users/3')
//         .set('Cookie', login.headers['set-cookie']);
//       expect(response.statusCode).toBe(403);
//     });
//   });

  describe("GET /api/v1/users/1", () => {
    it('should return 200 if user is logged in and has permissions', async () => {
      const login = await request(app).post('/api/v1/login').send(studentAccount);
      const response = await request(app).get('/api/v1/users/1').set('Cookie', login.headers['set-cookie']);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject<person>;
    });
  });


let newPersonId  = 0;
let gradebook_id = 0;
describe("Users routes with admin auth", () => {
  describe("POST /api/v1/users ", () => {

    it('should return 201 and return body with newly added person', async () => {
      const login = await request(app).post('/api/v1/login').send(adminAccount);
      const response = await request(app).post('/api/v1/users').set('Cookie', login.headers['set-cookie']).send(mockPerson)
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject<person>;
      newPersonId = response.body.id;
      gradebook_id = response.body.gradebook.gradebook_id;
    });
    
  });
  // describe("PUT /api/v1/users", () => {
  //   it("should return 200 and return body with updated person with admin account", async () => {
  //     const login = await request(app).post('/api/v1/login').send(adminAccount);
  //     const response = await request(app).put(`/api/v1/users/${newPersonId}`)
  //       .send(mockPutPerson)
  //       .set('Cookie', login.headers['set-cookie']);
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body).toMatchObject<person>;
  //   });


  //   it('should return 403 if user is logged in but has no permissions', async () => {
  //     const login = await request(app).post('/api/v1/login').send(studentAccount);
  //     const response = await request(app)
  //       .put(`/api/v1/users/${newPersonId}`)
  //       .send(mockPutPerson)
  //       .set('Cookie', login.headers['set-cookie']);
  //     expect(response.statusCode).toBe(403);
  //   });
  // });

  // describe('DELETE /api/v1/users', () => {
  //   it("should return 201 and delete user", async () => {
  //   const login = await request(app).post('/api/v1/login').send(adminAccount);
  //   const response = await request(app)
  //     .delete(`/api/v1/users/${newPersonId}`)
  //     .set('Cookie', login.headers['set-cookie']);
  //   expect(response.statusCode).toBe(204);
  //   })
  // });

});



