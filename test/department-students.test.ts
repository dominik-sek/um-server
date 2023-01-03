import request from 'supertest';
import app from '../app';
import { department, department_students, person } from '@prisma/client';
let agent = request.agent(app);

let adminAccount = {
  username: 'baltazaradministrator3',
  password: '123321321',
};

let mockStudent = {
  first_name: "Andrzej",
  last_name: "stoodent",
  title: "",
  birth_date: "2022-12-31T00:00:00.000Z",
  pesel: 675743234,
  gender: "M",
  role: "student"
};


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

  it("should display a list of students in all departments and return 200 with a body consiting of multiple `student` objects", done => {
    agent
      .get('/department-students/')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<department_students>>;
        done();
      });

  });

  it("should display a list of students in one department given its id and return 200 with a body consiting of multiple `department_students` objects", done => {
    agent
      .get('/department-students/dept/12')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<department_students>>;
        done();
      });
  });

  it("should display a list of departments that a given student is part of given gradebook_id and return 200 with a body consiting of multiple `department_students` objects", done => {
    agent
      .get('/department-students/student/10001')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<department_students>>;
        done();
      });

  });

  let newMockStudentGradebookId: number = 0;

  it("should add a student returning 201 and add it to an existing department, returning 201 with said student's gradebook", done => {
    agent
      .post('/users/')
      .send(mockStudent)
      .then(response => {
        expect(response.statusCode).toBe(201);
        newMockStudentGradebookId = response.body.gradebook_id;
        expect(response.body).toMatchObject<person>;
        done();
      });

    agent
      .post('/department-students/')
      .send({ gradebook_id: newMockStudentGradebookId, department_id: 12 })
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject<department_students>;
        done();
      });
  });

  it("should change a student's department and return 200 with a body matching `department_students` object", done => {
    agent
      .put(`/department-students/${newMockStudentGradebookId}`)
      .send({ department_id: 12 })
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<department_students>;
        done();
      });
  });

  it("should delete a student from a department and return 200 with a body matching `department_students` object", done => {
    agent
      .delete(`/department-students/${newMockStudentGradebookId}`)
      .then(response => {
        expect(response.statusCode).toBe(204);
        done();
      });
  });

})


