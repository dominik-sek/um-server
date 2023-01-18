import request from 'supertest';
import app from '../../app';
import { department, grade, person } from '@prisma/client';

let adminAccount = {
  username: 'baltazaradministrator3',
  password: '123321321',
};

let mockStudent = {
  first_name: "Andrzej",
  last_name: "stoodent",
  title: "",
  birth_date: '1990-01-01',
  pesel: 675743234,
  gender: "M",
  role: "student",
  address: {
    city: "Warszawa",
    state: "Mazowieckie",
    country: "PL",
    postal_code: "33-333",
    street: "Świętokrzyska 31"
  },
  contact: {
    email: "dean@studia.edu.pl",
    phone_number: 333222111
  },
  personal: {
    disabled: "0",
    married: "1"
  }
};

describe("GET /api/v1/grades", () => {

  let newMockStudentGradebookId: number = 0;
  let newMockStudentPersonId: number = 0;  
  it("should display all grades and return 200 with a body consisting of multiple `grade` objects", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .get('/api/v1/grades')
      .set('Cookie', login.headers['set-cookie']);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject<Array<grade>>
  });

  it("should display all grades for one student and return 200 with a body consisting of multiple `grade` objects", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .get('/api/v1/grades/student/10001')
      .set('Cookie', login.headers['set-cookie']);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject<Array<grade>>
  });
  it("should display all grades given by one teacher and return 200 with a body consisting of multiple `grade` objects", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .get('/api/v1/grades/teacher')
      .set('Cookie', login.headers['set-cookie']);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject<Array<grade>>
  });
  it("should display all grades for all students in a course and return 200 with a body consisting of multiple `grade` objects", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .get('/api/v1/grades/course/1')
      .set('Cookie', login.headers['set-cookie']);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject<Array<grade>>
  });
  it("should display all grades for student for all courses and return 200 with a body consisting of multiple `grade` objects", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .get('/api/v1/grades/student/10001/course/1')
      .set('Cookie', login.headers['set-cookie']);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject<Array<grade>>
  });

});

describe("POST /api/v1/grades", () => {
  it("should create a new grade and return 201", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .get('/api/v1/grades/')
      .send({
        grade: 5,
        gradebook_id: 10001,
        course_id: 1,
      })
      .set('Cookie', login.headers['set-cookie']);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject<grade>
  });

});

