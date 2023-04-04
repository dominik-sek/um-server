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

<<<<<<< HEAD
describe("POST api/v1/courses", () => {
  let newCourseId = 0;
  it("should add a course and respond with 201 and its body", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .post('/api/v1/courses')
      .send(mockCourse)
      .set('Cookie', login.headers['set-cookie'])
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject<course>;
    newCourseId = response.body.id;
  });
  it("should delete course and return 204 ", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .delete(`/api/v1/courses/${newCourseId}/`)
      .set('Cookie', login.headers['set-cookie'])
    expect(response.statusCode).toBe(204);
    expect(response.body).toMatchObject<course>;
  });
  it("should add a student to course and respond with 201 and its body", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .post('/api/v1/courses/1/students')
      .send({
        gradebook_id: 10001,
      })
      .set('Cookie', login.headers['set-cookie'])
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject<course>;
  });
  
});

describe("PUT api/v1/courses", () => {
  it("should update course adding a new teacher", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .put('/api/v1/courses/1/teacher')
      .send({
        person_id: 2,
      })
      .set('Cookie', login.headers['set-cookie'])
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject<course>;
  });
  it("should update course ", async () => {
    const login = await request(app).post('/api/v1/login').send(adminAccount)
    const response = await request(app)
      .put('/api/v1/courses/1/')
      .send({
          name: "New name",     
      })
      .set('Cookie', login.headers['set-cookie'])
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject<course>;
  });
});

describe('DELETE api/v1/courses', () => {


});

=======
>>>>>>> 7d2ece4aa88679b20f078f4693dbe7d756dc1436

