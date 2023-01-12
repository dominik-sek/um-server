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
  role: "student",
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

describe("Department student routes", () => {

  beforeAll(done => {
    agent
      .post("/api/v1/login")
      .send(adminAccount)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  let newMockStudentGradebookId: number = 0;
  let newMockStudentPersonId: number = 0;

  beforeAll(done => {
    agent
      .post('/api/v1/users/')
      .send(mockStudent)
      .then(response => {
        expect(response.statusCode).toBe(201);
        newMockStudentGradebookId = response.body.gradebook[0].gradebook_id;
        newMockStudentPersonId = response.body.id;
        expect(response.body).toMatchObject<person>;
        done();
      });

  });

  it("should display a list of students in all departments and return 200 with a body consiting of multiple `student` objects", done => {
    agent
      .get('/api/v1/department-students/')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<department_students>>;
        done();
      });

  });

  it("should display a list of students in one department given its id and return 200 with a body consiting of multiple `department_students` objects", done => {
    agent
      .get('/api/v1/department-students/dept/12')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<department_students>>;
        done();
      });
  });

  it("should display a list of departments that a given student is part of given gradebook_id and return 200 with a body consiting of multiple `department_students` objects", done => {
    agent
      .get('/api/v1/department-students/student/10001')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<department_students>>;
        done();
      });

  });

  it("should add newly created person(student) to an existing department, returning 201 with said student's gradebook", done => {

    agent
      .post('/api/v1/department-students/')
      .send({ gradebook_id: newMockStudentGradebookId, department_id: 12 })
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject<department_students>;
        done();
      });
  });

  it("should change a student's department and return 200 with a body matching `department_students` object", done => {
    agent
      .put(`/api/v1/department-students/student/${newMockStudentGradebookId}`)
      .send({ department_id: 10 })
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<department_students>;
        done();
      });
  });

  it("should delete a student from a department and return 200 with a body matching `department_students` object", done => {
    agent
      .delete(`/api/v1/department-students/student/${newMockStudentGradebookId}`)
      .then(response => {
        expect(response.statusCode).toBe(204);
        done();
      });

  });

  afterAll(done => {
    agent
      .delete(`/api/v1/users/${newMockStudentPersonId}`)
      .then(response => {
        expect(response.statusCode).toBe(204);
        done();
      }
      );
  });

});
