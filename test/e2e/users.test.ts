import app from '../../app';
import request from 'supertest';
import { person } from '@prisma/client';
let agent = request.agent(app);

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
  birth_date: "2022-12-31T00:00:00.000Z",
  pesel: 675743234,
  gender: "M",
  role: "admin",
  address: {
    city: "Warszawa",
    state: "Mazowieckie",
    country: "PL",
    postal_code: 0,
    street: "Świętokrzyska 31"
  },
  contact: {
    email: "dean@studia.edu.pl",
    phone_number: 333222111
  },
  personal: {
    disabled: "0",
    married: "1"
  },
  library_access: {
    has_access: "1"
  }
};

let mockPutPerson = mockPerson;
mockPutPerson.first_name = "Janusz";

describe("Users routes without auth/lower permissions", () => {

  it("should return 401 if user is not logged in", done => {
    request(app)
      .get("/api/v1/users")
      .then(response => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });
  beforeEach(done => {
    agent
      .post("/api/v1/login")
      .send(studentAccount)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });


  it("should return 403 if user is logged in but has no permissions", done => {
    agent
      .get("/api/v1/users")
      .then(response => {
        expect(response.statusCode).toBe(403);
        done();
      }
      );
  });
  it("should return 403 if user is logged and checks another profile", done => {
    agent
      .get("/api/v1/users/2")
      .then(response => {
        expect(response.statusCode).toBe(403);
        done();
      }
      );
  });

  it("should return 200 and object of type `person` if user is logged and checks his own profile", done => {
    agent
      .get("/api/v1/users/1")
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<person>;
        done();
      }
      );
  });
});

describe("Users routes with admin auth", () => {

  beforeEach(done => {
    agent
      .post("/api/v1/login")
      .send(adminAccount)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  let newPersonId: number = 0;
  it("should return 201 and return body with newly added person", done => {
    agent
      .post("/api/v1/users")
      .send(mockPerson)
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject<person>;
        newPersonId = response.body.id;
        done();
      });
  });


  it("should accept person body and update person", done => {
    agent
      .put(`/api/v1/users/${newPersonId}`)
      .send(mockPutPerson)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<person>;
        done();
      });
  });

  it("should delete the previously created person", done => {
    agent
      .delete(`/api/v1/users/${newPersonId}`)
      .then(response => {
        expect(response.statusCode).toBe(204);
        done();
      });
  });

});


