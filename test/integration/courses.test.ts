import request from 'supertest';
import app from '../../app';
import { course } from '@prisma/client';
let adminAccount = {
  username: 'baltazaradministrator3',
  password: '123321321',
};

let mockCourse = {
  name: "Test course",
  type: "Test type",
  ects: 5,
  person_id: 1,
  semester: '1',
  department_id: 1,
};

let mockPutCourse = mockCourse;
mockPutCourse.name = "New name";

describe("GET api/v1/courses", () => {

  it("should display all courses and return 200 with a body consiting of multiple `course` objects", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .get('/api/v1/courses')
      .set('Cookie', login.headers['set-cookie']);
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject<Array<course>>;
  });

    it("should display a single course and return 200 with a body consisting of a single `course` object", async () => {
      const login = await request(app).post('/api/v1/login').send(adminAccount)
      const response = await request(app)
        .get('/api/v1/courses/1')
        .set('Cookie', login.headers['set-cookie']);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject<course>;
    });

    it("should display all courses that a student is in ", async () => {
      const login = await request(app).post('/api/v1/login').send(adminAccount)
      const response = await request(app)
        .get('/api/v1/courses/student/10001')
        .set('Cookie', login.headers['set-cookie']);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject<course>;
    });
    it("should display students for each course by teacher id", async () => {
      const login = await request(app).post('/api/v1/login').send(adminAccount)
      const response = await request(app)
        .get('/api/v1/courses/students')
        .set('Cookie', login.headers['set-cookie']);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject<course>;
    });
    it("should display students in a course given its id", async () => {
      const login = await request(app).post('/api/v1/login').send(adminAccount)
      const response = await request(app)
        .get('/api/v1/courses/1/students')
        .set('Cookie', login.headers['set-cookie']);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject<course>;
    });
  
});


