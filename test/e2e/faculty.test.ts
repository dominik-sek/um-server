import app from '../../app';
import request from 'supertest';
import { faculty } from '@prisma/client';
let agent = request.agent(app);

let adminAccount = {
  username: 'baltazaradministrator3',
  password: '123321321',
};
let mockFaculty = {
  name: "Test faculty",
  person_id: 1,
};
let mockFacultyId: number = 0;
let mockFacultyPut = mockFaculty;
mockFacultyPut.name = "New name";

describe("faculty endpoint tests:", () => {
  beforeAll(done => {
    agent
      .post("/api/v1/login")
      .send(adminAccount)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  it("should display all faculties and return 200 with a body consiting of multiple `faculty` objects", done => {
    agent
      .get("/api/v1/faculties")
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<faculty>>;
        done();
      });
  });

  it("should add a new faculty and return 201 with object matching `faculty`", done => {
    agent
      .post("/api/v1/faculties")
      .send(mockFaculty)
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject<faculty>;
        mockFacultyId = response.body.id;
        done();
      });
  });

  it("should display one selected faculty and return 200 with a body matching `faculty` object", done => {
    agent
      .get(`/api/v1/faculties/${mockFacultyId}`)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<faculty>;
        done();
      });
  });

  it("should update a faculty and return 200 with object matching `faculty`", done => {
    agent
      .put(`/api/v1/faculties/${mockFacultyId}`)
      .send(mockFacultyPut)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<faculty>;
        done();
      });
  });

  it("should delete a faculty and return 200 with object matching `faculty`", done => {
    agent
      .delete(`/api/v1/faculties/${mockFacultyId}`)
      .then(response => {
        expect(response.statusCode).toBe(204);
        expect(response.body).toMatchObject<faculty>;
        done();
      });


  });
});
