import request from 'supertest';
import app from '../../app';
import { department, grade, person } from '@prisma/client';
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

  it("should get all grades", done => {
    agent
      .get('/api/v1/grades/')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<grade[]>;
        done();
      });
  });


  it("should add grade", done => {
    agent
      .post('/api/v1/grades/')
      .send({
        gradebook_id: newMockStudentGradebookId,
        course_id: 1,
        grade: 5,
      })
      .then(response => {
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject<grade>;
        done();
      });
  });

  it("should get grade by gradebook_id", done => {
    agent
      .get('/api/v1/grades/student/' + newMockStudentGradebookId)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<grade[]>;
        done();
      });
  });


  it("should get grade by course id", done => {
    agent
      .get('/api/v1/grades/course/1')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<grade[]>;
        done();
      });
  });

  it("should update grade", done => {
    agent
      .put('/api/v1/grades/student/' + newMockStudentGradebookId + '/course/1')
      .send({
        gradebook_id: newMockStudentGradebookId,
        course_id: 1,
        grade: 4,
      })
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<grade>;
        done();
      });
  });

  it("should delete grade", done => {
    agent
      .delete('/api/v1/grades/student/' + newMockStudentGradebookId + '/course/1')
      .then(response => {
        expect(response.statusCode).toBe(204);
        done();
      });
  });

  // ======================
  afterAll(done => {
    agent
      .delete('/api/v1/users/' + newMockStudentPersonId)
      .then(response => {
        expect(response.statusCode).toBe(204);
        done();
      });

  });

});
