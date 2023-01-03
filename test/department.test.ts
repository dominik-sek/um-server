import request from 'supertest';
import app from '../app';
import { department } from '@prisma/client';
let agent = request.agent(app);

let adminAccount = {
  username: 'baltazaradministrator3',
  password: '123321321',
};

let mockDepartment = {
  name: "Test department",
  length: 10,
  study_type: 'full-time',
  faculty_id: 1,
  degree: 'magister',
};

let mockPutDepartment = mockDepartment;
mockPutDepartment.name = "New name";

describe("Department routes", () => {

  beforeAll(done => {
    agent
      .post("/login")
      .send(adminAccount)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });


  it("should display all departments and return 200 with a body consiting of multiple `department` objects", done => {
    agent
      .get("/departments")
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<department>>;
      });
    done();
  });

  it("should display one selected department and return 200 with a body matching `department` object", done => {
    agent
      .get("/departments/1")
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<department>;
      });
    done();
  });

  let newMockDepartmentId: number = 0;
  it("should add a new department and return 201 with object matching `department`", done => {
    agent
      .post("/departments")
      .send(mockDepartment)
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject<department>;
        newMockDepartmentId = response.body.id;
      });
    done();
  });

  it("should change data in an existing department and return 200 with object matching `department`", done => {
    agent
      .put(`/departments/${newMockDepartmentId}`)
      .send(mockPutDepartment)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<department>;
      });
    done();
  });

  it("should delete an existing department given his id and return 204", done => {
    agent
      .delete(`/departments/${newMockDepartmentId}`)
      .then(response => {
        expect(response.statusCode).toBe(204);
      });
    done();
  });

});
