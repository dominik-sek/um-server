import request from 'supertest';
import app from '../app';
import { course } from '@prisma/client';
let agent = request.agent(app);

let adminAccount = {
  username: 'baltazaradministrator3',
  password: '123321321',
};

let mockCourse = {
  name: "Test course",
  type: "Test type",
  ects: 5,
  person_id: 1,
  semester: 1,
  department: 1,
};

let mockPutCourse = mockCourse;
mockPutCourse.name = "New name";

describe("Course routes", () => {

  beforeAll(done => {
    agent
      .post("/login")
      .send(adminAccount)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });


  it("should display all courses and return 200 with a body consiting of multiple `course` objects", done => {
    agent
      .get("/courses")
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<course>>;
      });
    done();
  });

  it("should display one selected course and return 200 with a body matching `course` object", done => {
    agent
      .get("/courses/1")
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<course>;
      });
    done();
  });

  let newMockCourseId: number = 0;
  it("should add a new course and return 201 with object matching `course`", done => {
    agent
      .post("/courses")
      .send(mockCourse)
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject<course>;
        newMockCourseId = response.body.id;
      });
    done();
  });

  it("should change data in an existing course and return 200 with object matching `course`", done => {
    agent
      .put(`/courses/${newMockCourseId}`)
      .send(mockPutCourse)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<course>;
      });
    done();
  });

  it("should delete an existing course given his id and return 204", done => {
    agent
      .delete(`/courses/${newMockCourseId}`)
      .then(response => {
        expect(response.statusCode).toBe(204);
      });
    done();
  });

});
